(function(){
  var boxes=document.querySelectorAll('.sketch');
  if(!boxes.length)return;
  document.documentElement.classList.add('js');
  function mmss(s){
    s=Math.max(0,Math.round(s||0));
    return (s/60|0)+':'+(s%60<10?'0':'')+(s%60);
  }
  function arm(box){
    var audio=box.nextElementSibling;
    if(!audio||audio.tagName!=='AUDIO')audio=box.parentNode.querySelector('audio.fallback');
    if(!audio)return;
    var play=box.querySelector('.play');
    var time=box.querySelector('.time');
    var canvas=box.querySelector('canvas');
    var src=box.getAttribute('data-src')||audio.getAttribute('src')||'';
    if(src)audio.src=src;
    audio.preload='metadata';
    function label(){
      var d=audio.duration,cur=audio.currentTime||0;
      if(time)time.textContent=isFinite(d)&&d>0?mmss(cur)+' / '+mmss(d):mmss(cur);
    }
    audio.addEventListener('loadedmetadata',label);
    audio.addEventListener('timeupdate',function(){label();draw(audio.currentTime/(audio.duration||1))});
    audio.addEventListener('ended',function(){if(play)play.textContent='play'});
    if(play)play.addEventListener('click',function(){
      if(audio.paused){
        document.querySelectorAll('audio.fallback').forEach(function(a){if(a!==audio)a.pause()});
        document.querySelectorAll('.sketch .play').forEach(function(b){if(b!==play)b.textContent='play'});
        var p=audio.play();if(p&&p.catch)p.catch(function(){});
        play.textContent='pause';
      }else{audio.pause();play.textContent='play'}
    });
    var peaks=[];
    function draw(head){
      if(!canvas)return;
      var dpr=Math.min(2,window.devicePixelRatio||1);
      var w=canvas.clientWidth||320,h=canvas.clientHeight||64;
      if(canvas.width!==(w*dpr|0)){canvas.width=w*dpr|0;canvas.height=h*dpr|0}
      var g=canvas.getContext('2d');
      g.setTransform(dpr,0,0,dpr,0,0);
      g.clearRect(0,0,w,h);
      var n=peaks.length||18,i,pk,x,bh;
      for(i=0;i<n;i++){
        pk=peaks.length?peaks[i]:0.35;
        x=8+i*(w-16)/n;
        bh=(0.2+pk*0.8)*(h*0.72);
        g.fillStyle=i/n<head?'#e7f6c8':'rgba(85,218,161,.85)';
        g.beginPath();g.arc(x+4,h/2+bh/2-6,3.2,0,7);g.fill();
      }
    }
    var key=box.getAttribute('data-wave');
    var waves=box.getAttribute('data-waves');
    if(key&&waves){
      fetch(waves).then(function(r){return r.json()}).then(function(j){
        peaks=(j.peaks&&j.peaks[key])||[];
        draw(0);
      }).catch(function(){draw(0)});
    }else draw(0);
    label();
  }
  [].forEach.call(boxes,arm);
})();
