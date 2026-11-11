/* Standalone swipeable card preview.
   Full-screen To Go-style cards (full-bleed clip, large Julius title, role line, current Momo tile)
   riding the pro2 / m4 reel's drift: a strip you swipe or flick, a shot counter, the sky behind.
   Motion is the same when Reduce Motion is on. */
(function(){
'use strict';

var CARDS=[
  {
    id:'weird-kid',
    title:"Chris Malinchak and Kiesza · 'Weird Kid'",
    role:'Director · Director of Photography',
    meta:'music video · 03:44',
    credits:['dir. Gill James & Kiesza','Gill James (director of photography)','Chris Malinchak and Kiesza'],
    still:'media/stills/weird-kid.jpg',
    clip:'media/clips/weird-kid.mp4',
    kind:'film'
  },
  {
    id:'to-go',
    title:'Lost Coffee · To Go',
    role:'',
    meta:'',
    credits:[],
    still:'media/stills/to-go.jpg',
    clip:'',
    momo:'media/clips/momo.mp4',
    momoPoster:'media/stills/momo.jpg',
    audio:'media/audio/to-go.mp3',
    kind:'sound'
  },
  {
    id:'one-with-the-devil',
    title:'One With the Devil',
    role:'Cinematographer',
    meta:'short · 2015',
    credits:['dir. Drew Pollins','Leo Award, Best Cinematography in a Short Drama (2015)','Canadian Society of Cinematographers Award'],
    still:'media/stills/owtd.jpg',
    clip:'media/clips/owtd.mp4',
    kind:'film'
  },
  {
    id:'hand-carved-piece',
    title:'hand-carved piece',
    role:'',
    meta:'carving + design',
    credits:[],
    still:'media/stills/carve.jpg',
    clip:'',
    kind:'object',
    portrait:true,
    hold:4000
  },
  {
    id:'sleepwalker',
    title:'Hey Ocean! · Sleepwalker',
    role:'Director of Photography',
    meta:'music video · 04:06',
    credits:['dir. Nano Clow','Gill James (director of photography)','Hey Ocean!'],
    still:'media/stills/sleepwalker.jpg',
    clip:'media/clips/sleepwalker.mp4',
    kind:'film'
  },
  {
    id:'repeat',
    title:'Allan Rayman · Repeat',
    role:'',
    meta:'music video · 03:36',
    credits:['Allan Rayman'],
    still:'media/stills/repeat.jpg',
    clip:'media/clips/repeat.mp4',
    kind:'film'
  }
];

var N=CARDS.length,EASE='cubic-bezier(.2,.8,.2,1)';
var HOLD=4000;
var p=0,cur=-1,playing=true,raf=0,lastT=0,tween=null,drag=null,wheelT=0,wheeling=false,dead=false;
var holdT=0,song=null,stride=0,cardW=0,inset=12;

function pad(n){n=String(n);while(n.length<2)n='0'+n;return n}
function mod(i){return((i%N)+N)%N}
function $(id){return document.getElementById(id)}
function infoText(c){
  var bits=[];
  if(c.meta)bits.push(c.meta);
  if(c.credits&&c.credits.length)bits.push(c.credits.join(' · '));
  return bits.join(' · ');
}

function guardZoom(){
  function stop(e){e.preventDefault()}
  document.addEventListener('gesturestart',stop,{passive:false,capture:true});
  document.addEventListener('gesturechange',stop,{passive:false,capture:true});
  document.addEventListener('gestureend',stop,{passive:false,capture:true});
  document.addEventListener('touchmove',function(e){
    if(e.touches&&e.touches.length>=2)e.preventDefault();
  },{passive:false,capture:true});
}

/* ---------- sky behind the cards ---------- */
function mountSky(cv){
  var dpr=1,w=0,h=0,stars=[],t0=0;
  function rnd(i){var x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
  var i;
  for(i=0;i<240;i++)stars.push({x:rnd(i),y:rnd(i+19),r:.35+rnd(i+3)*1.5,a:.22+rnd(i+7)*.7,tw:rnd(i+11)*Math.PI*2,sp:.4+rnd(i+23)*.8});
  function resize(){
    dpr=Math.min(2,window.devicePixelRatio||1);
    w=cv.clientWidth;h=cv.clientHeight;
    cv.width=Math.max(1,Math.round(w*dpr));
    cv.height=Math.max(1,Math.round(h*dpr));
  }
  function draw(t){
    if(dead)return;
    if(!t0)t0=t;
    var g=cv.getContext('2d');
    g.setTransform(dpr,0,0,dpr,0,0);
    var grd=g.createRadialGradient(w*.5,h*.42,0,w*.5,h*.42,Math.max(w,h)*.85);
    grd.addColorStop(0,'#121c2e');grd.addColorStop(.52,'#070d18');grd.addColorStop(1,'#04070b');
    g.fillStyle=grd;g.fillRect(0,0,w,h);
    var k,s,tw,x,y;
    for(k=0;k<stars.length;k++){
      s=stars[k];
      tw=.72+.28*Math.sin((t-t0)/900+s.tw);
      x=((s.x+((t-t0)/1000)*s.sp*.003)%1+1)%1*w;
      y=s.y*h;
      g.fillStyle='rgba(232,238,245,'+(s.a*tw)+')';
      g.beginPath();g.arc(x,y,s.r,0,7);g.fill();
    }
    requestAnimationFrame(draw);
  }
  resize();
  addEventListener('resize',resize);
  requestAnimationFrame(draw);
}

/* ---------- cards ---------- */
function buildCard(c,copy){
  var art=document.createElement('article');
  art.className='card'+(c.kind==='sound'?' sound':'')+(c.portrait?' portrait':'');
  art.setAttribute('data-id',c.id);
  art.setAttribute('data-i',String(c._i));
  art.setAttribute('data-copy',copy||'main');
  var bleed=document.createElement('div');bleed.className='bleed';
  var img=document.createElement('img');
  img.src=c.still;img.alt='';img.decoding='async';img.draggable=false;
  bleed.appendChild(img);
  if(c.clip){
    var v=document.createElement('video');
    v.muted=true;v.defaultMuted=true;v.playsInline=true;v.loop=false;v.preload='auto';
    ['muted','playsinline','webkit-playsinline','disablepictureinpicture'].forEach(function(a){v.setAttribute(a,'')});
    v.setAttribute('aria-hidden','true');
    v.poster=c.still;
    v.src=c.clip;
    v.addEventListener('ended',function(){onClipEnd(art)});
    v.addEventListener('playing',function(){if(isActive(art)&&!busy())v.classList.add('on')});
    bleed.appendChild(v);
  }
  art.appendChild(bleed);
  var typ=document.createElement('div');typ.className='type';
  if(c.momo){
    var fig=document.createElement('figure');fig.className='momo';
    var mv=document.createElement('video');
    mv.muted=true;mv.defaultMuted=true;mv.playsInline=true;mv.loop=false;mv.preload='auto';
    ['muted','playsinline','webkit-playsinline','disablepictureinpicture'].forEach(function(a){mv.setAttribute(a,'')});
    mv.setAttribute('aria-label','momo, from the To Go animation');
    mv.poster=c.momoPoster||'';
    mv.src=c.momo;
    mv.addEventListener('ended',function(){onClipEnd(art)});
    fig.appendChild(mv);
    var cap=document.createElement('figcaption');cap.textContent='momo';fig.appendChild(cap);
    typ.appendChild(fig);
  }
  var h2=document.createElement('h2');h2.textContent=c.title;typ.appendChild(h2);
  var role=document.createElement('p');role.className='role';role.textContent=c.role||'';typ.appendChild(role);
  var info=document.createElement('p');info.className='info';
  info.textContent=infoText(c);
  typ.appendChild(info);
  if(c.audio){
    var btn=document.createElement('button');
    btn.type='button';btn.className='play';btn.textContent='play';
    btn.setAttribute('aria-pressed','false');
    btn.setAttribute('aria-label','Play To Go');
    btn.addEventListener('click',function(e){e.stopPropagation();toggleSong(btn)});
    typ.appendChild(btn);
  }
  art.appendChild(typ);
  return art;
}

function isActive(art){
  return art&&Number(art.getAttribute('data-i'))===mod(cur)&&art.getAttribute('data-copy')==='main'||
         (art&&Number(art.getAttribute('data-i'))===mod(Math.round(p)));
}

var track,root,ctr,dotsEl,nodes=[];

function mountStrip(){
  track=$('track');root=$('rl');ctr=$('ctr');dotsEl=$('dots');
  CARDS.forEach(function(c,i){c._i=i});
  /* clones at each end so the last card can drift to the first without a jump */
  var last=buildCard(CARDS[N-1],'head');
  last.setAttribute('data-i',String(N-1));
  last.setAttribute('data-slot','-1');
  track.appendChild(last);
  nodes.push(last);
  CARDS.forEach(function(c){
    var el=buildCard(c,'main');
    el.setAttribute('data-slot',String(c._i));
    track.appendChild(el);
    nodes.push(el);
  });
  var first=buildCard(CARDS[0],'tail');
  first.setAttribute('data-i','0');
  first.setAttribute('data-slot',String(N));
  track.appendChild(first);
  nodes.push(first);
  var d='';
  for(var i=0;i<N;i++)d+='<i></i>';
  dotsEl.innerHTML=d;
}

function measure(){
  var el=track.querySelector('.card[data-copy="main"]');
  if(!el)return;
  var r=el.getBoundingClientRect();
  cardW=r.width;
  var gap=parseFloat(getComputedStyle(track).gap)||28;
  stride=cardW+gap;
  inset=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inset'))||12;
}

function busy(){return !!(drag&&drag.moved)||wheeling||!!tween}

function quiet(){
  track.querySelectorAll('video').forEach(function(v){
    v.classList.remove('on');
    try{if(!v.paused)v.pause()}catch(e){}
  });
}

function videosOf(art){return art?art.querySelectorAll('video'):[]}

function playCard(art){
  if(!art||dead)return;
  videosOf(art).forEach(function(v){
    try{v.currentTime=0}catch(e){}
    var pr=v.play();
    if(pr&&pr.catch)pr.catch(function(){});
    /* momo and clips fade on once they actually play; still-only cards have none */
    if(v.readyState>=2)v.classList.add('on');
  });
}

function show(n,restart){
  n=mod(n);
  var changed=n!==mod(cur);
  cur=n;
  ctr.textContent=pad(n+1)+' / '+pad(N);
  var marks=dotsEl.children;
  for(var i=0;i<marks.length;i++)marks[i].classList.toggle('on',i===n);
  track.querySelectorAll('.card').forEach(function(el){
    var on=Number(el.getAttribute('data-i'))===n&&el.getAttribute('data-copy')==='main';
    if(!on){el.classList.remove('sel');var inf=el.querySelector('.info');if(inf)inf.classList.remove('open')}
  });
  if(changed||restart){
    if(song&&!song.paused&&CARDS[n].id!=='to-go')pauseSong();
    quiet();
    clearTimeout(holdT);
    var art=track.querySelector('.card[data-copy="main"][data-i="'+n+'"]');
    if(!busy()){
      if(art)playCard(art);
      /* still-only: hold, then drift on */
      if(art&&!CARDS[n].clip&&!CARDS[n].momo){
        holdT=setTimeout(function(){if(!busy()&&playing&&mod(cur)===n)goNext()},CARDS[n].hold||HOLD);
      }
    }
  }
}

function place(){
  if(!stride)measure();
  /* slot -1 is the head clone; real card 0 is at slot 0. Center of the viewport should sit on card `p`. */
  var x=(window.innerWidth/2-cardW/2)-((p+1)*stride);
  track.style.transform='translate3d('+x+'px,0,0)';
  var n=Math.round(p);
  if(n<=-1||n>=N){/* mid-wrap; show the clone's index */}
  show(mod(n));
}

function snapWrap(){
  if(p>=N){p-=N;place()}
  else if(p<0){p+=N;place()}
}

function frame(t){
  raf=0;if(dead)return;
  var dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
  if(tween){
    var kk=Math.min(1,(t-tween.t0)/tween.ms),e=1-Math.pow(1-kk,3);
    p=tween.a+(tween.b-tween.a)*e;
    if(kk>=1){
      p=tween.b;tween=null;
      snapWrap();
      if(playing)playAfterSettle();
    }
  }
  place();
  if(tween)raf=requestAnimationFrame(frame);
}

function startLoop(){lastT=0;if(!raf)raf=requestAnimationFrame(frame)}
function glide(to,ms){
  /* keep going in the same direction through the clones, then snapWrap */
  tween={a:p,b:to,t0:performance.now(),ms:ms||500};
  startLoop();
}
function goTo(n,ms){
  /* choose the short or wrap-forward path */
  var dest=n;
  if(n===0&&p>N-1.2)dest=N;
  else if(n===N-1&&p<0.2)dest=-1;
  else dest=n;
  clearTimeout(holdT);
  quiet();
  glide(dest,ms||480);
}
function goNext(){goTo((Math.round(p)+1),520)}
function goPrev(){goTo((Math.round(p)-1),520)}

function playAfterSettle(){
  snapWrap();
  show(mod(Math.round(p)),true);
}

function onClipEnd(art){
  if(dead||busy()||!playing)return;
  var i=Number(art.getAttribute('data-i'));
  if(mod(Math.round(p))!==i)return;
  /* To Go: if the song is playing, let momo loop again and stay */
  if(CARDS[i].id==='to-go'&&song&&!song.paused){
    videosOf(art).forEach(function(v){try{v.currentTime=0;v.play()}catch(e){}});
    return;
  }
  goNext();
}

/* ---------- song (To Go only; never autoplay) ---------- */
function ensureSong(){
  if(song)return song;
  song=new Audio('media/audio/to-go.mp3');
  song.preload='metadata';
  song.addEventListener('ended',function(){
    syncPlayBtns(false);
    if(playing&&!busy()&&CARDS[mod(Math.round(p))].id==='to-go')goNext();
  });
  song.addEventListener('play',function(){syncPlayBtns(true)});
  song.addEventListener('pause',function(){syncPlayBtns(false)});
  return song;
}
function syncPlayBtns(on){
  track.querySelectorAll('.play').forEach(function(b){
    b.textContent=on?'pause':'play';
    b.setAttribute('aria-pressed',on?'true':'false');
  });
}
function toggleSong(fromBtn){
  var a=ensureSong();
  if(a.paused){
    var pr=a.play();
    if(pr&&pr.catch)pr.catch(function(){});
  }else{
    a.pause();
  }
  if(fromBtn)fromBtn.focus({preventScroll:true});
}
function pauseSong(){
  if(song&&!song.paused)song.pause();
}

/* ---------- two-tap: first highlight + info, second sound or toggle info ---------- */
function onTap(art){
  var i=Number(art.getAttribute('data-i'));
  if(mod(Math.round(p))!==i)return;
  var main=track.querySelector('.card[data-copy="main"][data-i="'+i+'"]');
  if(!main)return;
  if(!main.classList.contains('sel')){
    main.classList.add('sel');
    var info=main.querySelector('.info');
    if(info&&info.textContent)info.classList.add('open');
    return;
  }
  if(CARDS[i].audio){toggleSong(main.querySelector('.play'));return}
  var inf=main.querySelector('.info');
  if(inf&&inf.textContent)inf.classList.toggle('open');
}

/* ---------- pointer / wheel / keys ---------- */
function onDown(e){
  if(e.button)return;
  if(e.target&&e.target.closest&&e.target.closest('button'))return;
  if(e.isPrimary===false)return;
  drag={x:e.clientX,y:e.clientY,p0:p,moved:false,touch:e.pointerType!=='mouse',t:performance.now(),v:0,pid:e.pointerId};
  tween=null;
  try{e.currentTarget.setPointerCapture&&e.currentTarget.setPointerCapture(e.pointerId)}catch(err){}
}
function onMove(e){
  if(!drag)return;
  var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){
    drag.moved=true;root.classList.add('scrub');quiet();clearTimeout(holdT);
  }
  if(drag.moved){
    if(!stride)measure();
    var now=performance.now(),dt=Math.max(8,now-drag.t);
    var np=drag.p0-dx/stride;
    drag.v=(np-p)/(dt/1000);
    drag.t=now;
    p=np;
    place();
  }
}
function onUp(e){
  if(!drag)return;
  var d=drag;drag=null;root.classList.remove('scrub');
  if(d.moved){
    var v=d.v||0,delta=p-d.p0,origin=Math.round(d.p0),target=origin;
    /* A normal swipe or flick moves one full-screen card. Only a long, hard
       flick (more than a card of travel) can skip further. */
    var commit=Math.abs(delta)>0.18||Math.abs(v)>0.85;
    if(commit){
      var dir=(Math.abs(v)>Math.abs(delta)*2)?(v>0?1:-1):(delta>0?1:-1);
      target=origin+dir;
      if(Math.abs(delta)>1.2||Math.abs(v)>5){
        target=origin+dir*Math.min(2,Math.max(1,Math.round(Math.abs(delta)+0.15)));
      }
    }
    var dist=Math.abs(target-p);
    glide(target,Math.max(280,Math.min(560,300+dist*140)));
    return;
  }
  if(e.type==='pointercancel')return;
  var art=e.target&&e.target.closest?e.target.closest('.card'):null;
  if(art)onTap(art);
}
function onWheel(e){
  e.preventDefault();
  var d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
  if(e.deltaMode===1)d*=32;
  if(!wheeling){wheeling=true;root.classList.add('scrub');quiet();clearTimeout(holdT)}
  tween=null;
  if(!stride)measure();
  p+=d/stride * (Math.abs(d)>4?0.35:0.2);
  place();
  clearTimeout(wheelT);
  wheelT=setTimeout(function(){
    wheeling=false;root.classList.remove('scrub');
    glide(Math.round(p),260);
  },160);
}
function onKey(e){
  var key=e.key;
  if(key==='ArrowRight'||key==='ArrowDown'){e.preventDefault();goNext()}
  else if(key==='ArrowLeft'||key==='ArrowUp'){e.preventDefault();goPrev()}
  else if(key===' '||key==='Enter'){
    if(e.target&&e.target.closest&&e.target.closest('button'))return;
    e.preventDefault();
    var art=track.querySelector('.card[data-copy="main"][data-i="'+mod(Math.round(p))+'"]');
    if(art)onTap(art);
  }
}
function onVis(){if(dead)return;if(document.hidden){quiet();if(song&&!song.paused)song.pause()}else playAfterSettle()}
function onResize(){measure();place()}

function init(){
  guardZoom();
  mountSky($('sky'));
  mountStrip();
  measure();
  p=0;place();show(0,true);
  root.addEventListener('pointerdown',onDown);
  addEventListener('pointermove',onMove,{passive:true});
  addEventListener('pointerup',onUp);
  addEventListener('pointercancel',onUp);
  root.addEventListener('wheel',onWheel,{passive:false});
  addEventListener('keydown',onKey);
  document.addEventListener('visibilitychange',onVis);
  addEventListener('resize',onResize);
}

window.GJ_PREVIEW={
  state:function(){return {i:mod(Math.round(p)),p:p,n:N,playing:playing,title:CARDS[mod(Math.round(p))].title}},
  setPlaying:function(on){playing=!!on;if(!on)clearTimeout(holdT)},
  go:function(i){playing=false;clearTimeout(holdT);tween=null;p=mod(i);place();show(mod(i),true)}
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
