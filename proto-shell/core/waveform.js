/* proto-shell · the Sound waveform player: the dotted star-chart waveform + the player bar. CORE: mounted once, never removed.
   Shape: media/sound-shape.json = SH.sound from tonight/fable-m4/js/sky.js (the same stars the sky draws as the Sound constellation).
   Rail: the proto-lab sound-starchart paintRail (dotted mini waveform of the spine stars, white playhead), played dots in ink, the rest dim
   (mint is for new only, STANDARDS §4). Song stars: the m4 player's mapping (No Problem 2, Gone 5, To Go 7,
   Lost in Time 10, = 13, ii 4). Titles/artists/files: data/tracks.json (= tonight/fable-m4/data.json tracks).
   Volume is gj.vol (the same key the m4 player and tune.js use). A watchdog re-mounts the dock if anything removes it. */
(function(w){
'use strict';
var STAR={noproblem:2,gone:5,togo:7,lostintime:10,equals:13,ii:4};
function mmss(s){s=Math.max(0,s|0);return (s/60|0)+':'+(s%60<10?'0':'')+(s%60|0)}
function lsr(k,d){try{var v=parseFloat(localStorage.getItem(k));return isFinite(v)?Math.max(0,Math.min(1,v)):d}catch(x){return d}}
function Wave(shape,tracks){
  var V={shape:shape,tracks:tracks,sel:3,au:new Audio(),el:null};
  var au=V.au;au.preload='metadata';au.volume=lsr('gj.vol',1);
  addEventListener('storage',function(e){if(e.key==='gj.vol')au.volume=lsr('gj.vol',1)});
  V.starOf=function(i){return STAR[tracks[i].k]};
  V.trackAtStar=function(si){for(var i=0;i<tracks.length;i++)if(STAR[tracks[i].k]===si)return i;return -1};
  function mount(){
    var d=document.createElement('section');d.id='snd';d.setAttribute('aria-label','sound player');
    d.innerHTML='<button type="button" class="pp" aria-label="play"><i></i></button><div class="who"><b></b><span></span></div><span class="tc">0:00</span>'+
      '<div class="rail" aria-label="seek"><canvas></canvas></div>';
    document.body.appendChild(d);V.el=d;
    d.querySelector('.pp').onclick=function(e){e.stopPropagation();if(au.paused){au.play().catch(function(){})}else au.pause()};
    var rail=d.querySelector('.rail');
    function seek(e){var r=rail.getBoundingClientRect(),u=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));if(au.duration)au.currentTime=u*au.duration;paint()}
    rail.addEventListener('pointerdown',function(e){e.stopPropagation();seek(e);try{rail.setPointerCapture(e.pointerId)}catch(x){}});
    rail.addEventListener('pointermove',function(e){if(e.buttons)seek(e)});
    d.addEventListener('pointerdown',function(e){e.stopPropagation()});
    show();paint();
  }
  function show(){var t=tracks[V.sel];V.el.querySelector('.who b').textContent=t.title;V.el.querySelector('.who span').textContent=t.artist;
    V.el.querySelector('.tc').textContent=mmss(au.currentTime)+' / '+(au.duration?mmss(au.duration):'–:––')}
  function paint(){
    var c=V.el&&V.el.querySelector('.rail canvas');if(!c)return;var dpr=Math.min(2,devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;
    if(c.width!==Math.round(w*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}
    var q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,0,0);q.clearRect(0,0,w,h);
    var xs=shape.s.filter(function(p){return p[3]===0}),head=au.duration?au.currentTime/au.duration:0;
    q.strokeStyle='rgba(230,214,200,.38)';q.lineWidth=1;q.beginPath();
    xs.forEach(function(p,i){var x=p[0]*w,y=h*.15+p[1]*h*.7;if(i)q.lineTo(x,y);else q.moveTo(x,y)});q.stroke();
    /* the dotted waveform itself: a fine dot run between the stars, ink up to the head */
    for(var i=0;i<xs.length-1;i++){var a=xs[i],b=xs[i+1],n=Math.max(2,Math.round(Math.hypot((b[0]-a[0])*w,(b[1]-a[1])*h*.7)/5));
      for(var j=0;j<n;j++){var u=j/n,x=(a[0]+(b[0]-a[0])*u)*w,y=h*.15+(a[1]+(b[1]-a[1])*u)*h*.7;q.fillStyle=x/w<head?'rgba(238,243,245,.95)':'rgba(201,211,214,.4)';q.fillRect(x-.6,y-.6,1.2,1.2)}}
    xs.forEach(function(p){var x=p[0]*w,y=h*.15+p[1]*h*.7;q.fillStyle=x/w<head?'#eef3f5':'rgba(201,211,214,.7)';q.beginPath();q.arc(x,y,1.7,0,6.283);q.fill()});
    q.fillStyle='#fff';q.fillRect(head*w-.5,2,1,h-4);q.beginPath();q.arc(head*w,h/2,2.6,0,6.283);q.fill();
  }
  V.pick=function(i,play){if(i<0||i>=tracks.length)return;var was=!au.paused;V.sel=i;au.src=tracks[i].file;au.load();if(play||was)au.play().catch(function(){});show();paint()};
  V.head=function(){return au.duration?au.currentTime/au.duration:0};
  au.addEventListener('timeupdate',function(){show();paint()});au.addEventListener('loadedmetadata',function(){show();paint()});
  au.addEventListener('play',function(){V.el.classList.add('on')});au.addEventListener('pause',function(){V.el.classList.remove('on')});
  au.addEventListener('ended',function(){V.el.classList.remove('on')});
  addEventListener('resize',paint);
  mount();V.pick(V.sel,false);
  /* watchdog: the player is never lost */
  setInterval(function(){if(!V.el||!document.body.contains(V.el)){mount()}},1000);
  V.check=function(){var e=V.el,c=e&&e.querySelector('.rail canvas');return {dock:!!e&&document.body.contains(e),visible:!!e&&e.getBoundingClientRect().height>0&&getComputedStyle(e).display!=='none',
    playButton:!!(e&&e.querySelector('.pp')),rail:!!c&&c.width>0,shapeStars:shape.s.length,track:tracks[V.sel].title,playing:!au.paused,t:+au.currentTime.toFixed(2)}};
  return V;
}
w.ShellWave=Wave;
})(window);
