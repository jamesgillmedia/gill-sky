(function(){
  var boxes=document.querySelectorAll('.sketch');
  if(!boxes.length)return;
  document.documentElement.classList.add('js');
  var live=[];
  function mmss(s){
    s=Math.max(0,Math.round(s||0));
    return (s/60|0)+':'+(s%60<10?'0':'')+(s%60);
  }
  function arm(box){
    var src=box.getAttribute('data-src')||'';
    var play=box.querySelector('.play');
    var time=box.querySelector('.time');
    var canvas=box.querySelector('canvas');
    var rail=box.querySelector('.rail');
    if(!src)return;
    var audio=document.createElement('audio');
    audio.preload='auto';
    audio.src=src;
    audio.hidden=true;
    box.appendChild(audio);
    var peaks=[],dur=0,head=0;
    function label(){
      if(!time)return;
      var d=isFinite(audio.duration)&&audio.duration>0?audio.duration:dur;
      var cur=audio.currentTime||0;
      time.textContent=d>0?mmss(cur)+' / '+mmss(d):mmss(cur);
    }
    function draw(){
      if(!canvas)return;
      var dpr=Math.min(2,window.devicePixelRatio||1);
      var w=canvas.clientWidth||320,h=canvas.clientHeight||48;
      if(canvas.width!==(w*dpr|0)||canvas.height!==(h*dpr|0)){canvas.width=w*dpr|0;canvas.height=h*dpr|0}
      var g=canvas.getContext('2d');
      g.setTransform(dpr,0,0,dpr,0,0);
      g.clearRect(0,0,w,h);
      if(!peaks.length)return;
      var n=peaks.length,i,pk,x,bw,y,on;
      bw=Math.max(1,(w-8)/n*0.62);
      for(i=0;i<n;i++){
        pk=peaks[i];
        x=4+(i+0.5)*(w-8)/n;
        y=Math.max(1.2,pk*(h*0.42));
        on=head>0&&i/n<head;
        g.fillStyle=on?'rgba(85,218,161,'+(0.45+0.5*pk).toFixed(2)+')':'rgba(220,232,240,'+(0.16+0.28*pk).toFixed(2)+')';
        g.fillRect(x-bw/2,h/2-y,bw,y*2);
      }
      g.fillStyle='rgba(85,218,161,.8)';
      g.fillRect(4,(h/2)-0.5,Math.max(0,(w-8)*head),1.5);
    }
    function setHead(){
      var d=isFinite(audio.duration)&&audio.duration>0?audio.duration:dur;
      head=d>0?(audio.currentTime||0)/d:0;
      label();draw();
    }
    audio.addEventListener('loadedmetadata',function(){dur=audio.duration;setHead()});
    audio.addEventListener('durationchange',function(){if(isFinite(audio.duration))dur=audio.duration;setHead()});
    audio.addEventListener('timeupdate',setHead);
    audio.addEventListener('ended',function(){if(play)play.textContent='play';setHead()});
    if(play)play.addEventListener('click',function(){
      if(audio.paused){
        live.forEach(function(o){if(o!==audio){o.pause();var b=o._play;if(b)b.textContent='play'}});
        var p=audio.play();if(p&&p.catch)p.catch(function(){});
        play.textContent='pause';
      }else{audio.pause();play.textContent='play'}
    });
    audio._play=play;
    live.push(audio);
    function seek(ev){
      var d=isFinite(audio.duration)&&audio.duration>0?audio.duration:dur;
      if(!rail||!(d>0))return;
      var r=rail.getBoundingClientRect();
      var point=ev.clientX;
      if(point==null&&ev.touches&&ev.touches[0])point=ev.touches[0].clientX;
      if(point==null)return;
      var u=Math.max(0,Math.min(1,(point-r.left)/r.width));
      var want=u*d;
      audio._want=want;
      var end=audio.seekable&&audio.seekable.length?audio.seekable.end(audio.seekable.length-1):0;
      if(end+0.05>=want){
        try{audio.currentTime=want}catch(e){}
        audio._want=null;
      }
      setHead();
    }
    if(!audio._seekOn){
      audio._seekOn=1;
      audio.addEventListener('progress',function(){
        if(audio._want==null)return;
        var end=audio.seekable&&audio.seekable.length?audio.seekable.end(audio.seekable.length-1):0;
        if(end+0.05<audio._want)return;
        try{audio.currentTime=audio._want}catch(e){}
        audio._want=null;
        setHead();
      });
    }
    if(rail){
      rail.addEventListener('pointerdown',function(ev){
        try{if(rail.setPointerCapture&&ev.pointerId!=null)rail.setPointerCapture(ev.pointerId)}catch(e){}
        seek(ev);
      });
      rail.addEventListener('pointermove',function(ev){if(ev.buttons)seek(ev)});
    }
    var key=box.getAttribute('data-wave');
    var waves=box.getAttribute('data-waves')||'../../media/pro2/audio/waves.json';
    if(key){
      fetch(waves).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(j){
        peaks=(j.peaks&&j.peaks[key])||[];
        draw();
      }).catch(function(){peaks=[];draw()});
    }
    audio.load();
    label();
    draw();
  }
  [].forEach.call(boxes,arm);
})();
