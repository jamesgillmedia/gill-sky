/* m4 · the Film chapter player (Gill, Nov 11: "proper navigation between films", keep the player AND the stills).
   pro2's work view (site-v3-pro2 js/dive.js L3 + js/scope.js) in m4 type and colour: a film opens full screen in the sky in a
   2.39 frame with its short preview as the idle picture; '▶ play film' plays the real film (Reel 2026 = reel-v7 native, the rest
   Vimeo through its postMessage API; never YouTube) and then pauses / resumes it; under the frame, that film's stills (the reel:
   its shots, a tap seeks). ‹ › step to the neighbouring film, ⤢ full screen, 'full page ›' opens the r9-style page, ✕ = the grid.
   History: every state is a hash on top of the sky's film board: #film/<slug> · #film/<slug>/play · #film/<slug>/still/<n>.
   One Back = one step; ✕ goes back the whole way in one tap. The sky (js/sky.js) never sees these entries: this file loads before
   it and owns their popstate / keys / pointers. Data: js/filmdata.js (tools/film_player.py). Same motion with Reduce Motion on. */
(function(){
'use strict';
var F=window.GJ_FILMS||[],BY={};
F.forEach(function(f,i){f.i=i;f.fallback=0;if(!f.stills.length&&f.poster){f.stills=[f.poster];f.fallback=1}BY[f.s]=f});
function $(s,r){return(r||document).querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function pad(n){return(n<10?'0':'')+n}
var EASE='cubic-bezier(.2,.7,.2,1)';

/* ---------- state + hashes ---------- */
var S={on:false,f:null,p:0,st:-1,d:0},PEND=null,root=null,frame=null,strip=null,lb=null;
function hashFor(st){return '#film/'+st.s+(st.st>=0?'/still/'+(st.st+1):st.p?'/play':'')}
function parse(h){var m=(h||'').match(/^#\/?film\/([\w-]+)(?:\/(play|still\/(\d+)))?\/?$/);if(!m||!BY[m[1]])return null;
  var f=BY[m[1]],st=m[3]?Math.max(0,Math.min(f.stills.length-1,(+m[3])-1)):-1;if(st>=0&&f.play&&f.play.shots)st=-1;
  return{fp:1,s:m[1],p:m[2]==='play'&&f.play?1:0,st:st}}
function push(st,replace){st.fp=1;try{history[replace?'replaceState':'pushState'](st,'',location.pathname+location.search+hashFor(st))}catch(e){}}

/* a deep link (#film/<slug>[/play|/still/n]): the sky seeds its film board first, then the player goes on top of it */
var DEEP=parse(location.hash);
if(DEEP){try{history.replaceState(null,'',location.pathname+location.search+'#film/board')}catch(e){}}
function whenSky(cb){var n=0;(function t(){var h=history.state;if(h&&h.u1&&location.hash==='#film/board'&&document.documentElement.classList.contains('deep')){cb();return}if(++n<300)setTimeout(t,100)})()}

/* ---------- DOM ---------- */
function build(){
  root=document.createElement('div');root.id='fp';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','film');
  root.innerHTML='<div class="fp-veil" aria-hidden="true"></div>'+
    '<header class="fp-top"><div class="fp-ttl"><h2></h2><p class="fp-meta"></p></div><span class="fp-n" aria-hidden="true"></span>'+
    '<button type="button" class="fp-x" data-a="x" aria-label="close: back to the film grid">✕</button></header>'+
    '<div class="fp-stage"><div class="fp-frame"></div></div>'+
    '<p class="fp-cap" aria-live="polite"></p>'+
    '<nav class="fp-ctl" aria-label="film">'+
      '<button type="button" class="fp-nb fp-prev" data-a="prev"><span aria-hidden="true">‹</span><i></i></button>'+
      '<span class="fp-mid"><button type="button" class="fp-play" data-a="play">▶ play film</button><span class="fp-so" hidden>stills only</span>'+
      '<button type="button" class="fp-full" data-a="full" aria-label="full screen">⤢</button>'+
      '<a class="fp-page" href="#">full page <span aria-hidden="true">›</span></a></span>'+
      '<button type="button" class="fp-nb fp-next" data-a="next"><i></i><span aria-hidden="true">›</span></button></nav>'+
    '<div class="fp-strip"></div>'+
    '<div class="fp-lb" hidden role="dialog" aria-label="still"><img alt=""><button type="button" class="fp-lbp" data-a="lbprev" aria-label="previous still">‹</button>'+
      '<button type="button" class="fp-lbn" data-a="lbnext" aria-label="next still">›</button><span class="fp-lbc"></span>'+
      '<button type="button" class="fp-lbx" data-a="lbx" aria-label="close the still">✕</button></div>';
  document.body.appendChild(root);
  frame=$('.fp-frame',root);strip=$('.fp-strip',root);lb=$('.fp-lb',root);
  root.addEventListener('click',onClick);
  ['wheel','dblclick','contextmenu'].forEach(function(n){root.addEventListener(n,function(e){e.stopPropagation()},{passive:true})});
  /* lightbox swipe */
  var tx=null;lb.addEventListener('touchstart',function(e){if(e.touches.length===1)tx={x:e.touches[0].clientX,y:e.touches[0].clientY};else tx=null},{passive:true});
  lb.addEventListener('touchend',function(e){if(!tx)return;var t=e.changedTouches[0],dx=t.clientX-tx.x,dy=t.clientY-tx.y;tx=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)lbStep(dx<0?1:-1)},{passive:true});
  addEventListener('resize',size);
  if(window.ResizeObserver)new ResizeObserver(size).observe($('.fp-stage',root));
  ['fullscreenchange','webkitfullscreenchange'].forEach(function(n){document.addEventListener(n,function(){root.classList.toggle('fs',!!fsEl());setTimeout(size,0)})});
}
/* the sky's own listeners must not see the player: window-capture guards registered before js/sky.js and js/depth.js */
function mine(e){return S.on&&root&&e.target&&root.contains(e.target)}
['pointerdown','pointermove','pointerup','pointercancel'].forEach(function(n){addEventListener(n,function(e){if(mine(e))e.stopImmediatePropagation()},true)});
addEventListener('ended',function(e){if(mine(e))e.stopImmediatePropagation()},true); /* GJ_NOLOOP (depth.js) stays off the player's videos */
addEventListener('keydown',function(e){if(!S.on)return;e.stopImmediatePropagation();var k=e.key;
  if(k==='Escape'){e.preventDefault();if(fsEl())return;if(S.st>=0)history.back();else closeAll()}
  else if(k==='ArrowLeft'||k==='ArrowRight'){if(e.target&&e.target.tagName==='VIDEO')return;e.preventDefault();if(S.st>=0)lbStep(k==='ArrowRight'?1:-1);else neighbour(k==='ArrowRight'?1:-1)}
  else if(k===' '&&S.st<0&&!(e.target&&/^(BUTTON|A|VIDEO)$/.test(e.target.tagName))){e.preventDefault();playBtn()}},true);
addEventListener('popstate',function(e){var st=e.state;
  if(st&&st.fp&&BY[st.s]){e.stopImmediatePropagation();
    if(PEND){var to=PEND;PEND=null;var n={s:to,p:0,st:-1,d:st.d||1};push(n,true);show(n,PDIR);return}
    show(st);return}
  PEND=null;if(S.on)hide()});

/* ---------- show a state ---------- */
function show(st,dir){if(!root)build();var f=BY[st.s];if(!f)return;
  var first=!S.on,changed=S.f!==f;
  S.on=true;S.d=st.d||1;
  if(first){root.hidden=false;document.documentElement.classList.add('fpon');root.animate([{opacity:0},{opacity:1}],{duration:260,easing:EASE});
    $('.fp-stage',root).animate([{transform:'scale(.94)',opacity:.4},{transform:'none',opacity:1}],{duration:420,easing:EASE})}
  if(changed){if(S.p)stopPlay(true);S.f=f;S.p=0;paint(f);if(!first&&dir)frame.animate([{opacity:0,transform:'translateX('+(dir*28)+'px)'},{opacity:1,transform:'none'}],{duration:320,easing:EASE})}
  if(st.p&&!S.p)startPlay(st.t);else if(!st.p&&S.p)stopPlay();
  lbShow(st.st==null?-1:st.st);
  if(first)setTimeout(function(){var x=$('.fp-x',root);try{x.focus({preventScroll:true})}catch(e){}},30)}
function hide(){if(!S.on)return;stopPlay(true);idleStop();S.on=false;S.f=null;S.st=-1;lb.hidden=true;
  if(fsEl())exitFs();
  var r=root;r.animate([{opacity:1},{opacity:0}],{duration:200,easing:EASE}).onfinish=function(){if(!S.on){r.hidden=true;frame.innerHTML='';strip.innerHTML=''}};
  document.documentElement.classList.remove('fpon')}
function closeAll(){if(fsEl())exitFs();var d=S.d||1;if(history.state&&history.state.fp)history.go(-d);else hide()}

/* ---------- paint one film (idle) ---------- */
var IDLE=null;
function paint(f){
  $('h2',root).textContent=f.t;
  $('.fp-meta',root).textContent=[f.role,f.meta].filter(Boolean).join(' · ');
  $('.fp-n',root).textContent=pad(f.i+1)+' / '+pad(F.length);
  var pv=F[(f.i-1+F.length)%F.length],nx=F[(f.i+1)%F.length];
  $('.fp-prev i',root).textContent=pv.short||pv.t;$('.fp-prev',root).setAttribute('aria-label','previous film: '+pv.t);
  $('.fp-next i',root).textContent=nx.short||nx.t;$('.fp-next',root).setAttribute('aria-label','next film: '+nx.t);
  var pg=$('.fp-page',root);pg.hidden=!f.page;if(f.page)pg.setAttribute('href',f.page);
  label(f.play?'▶ play film':'');playUI(f);
  $('.fp-full',root).hidden=false;
  root.classList.remove('playing');
  idle(f);
  var shots=f.play&&f.play.shots;
  strip.classList.toggle('shots',!!shots);
  strip.setAttribute('aria-label',shots?'shots: tap to jump there in the reel':'stills from '+f.t);
  strip.innerHTML=shots?shots.map(function(s,i){return '<button type="button" class="th" data-i="'+i+'" aria-label="'+esc(s.title||('shot '+(i+1)))+'"><img src="'+esc(s.th)+'" alt="" loading="'+(i<8?'eager':'lazy')+'" decoding="async"></button>'}).join('')
    :f.stills.map(function(s,i){return '<button type="button" class="th" data-i="'+i+'" aria-label="still '+(i+1)+' of '+f.stills.length+'"><img src="'+esc(s)+'" alt="" loading="'+(i<6?'eager':'lazy')+'" decoding="async"></button>'}).join('');
  strip.scrollLeft=0;cap('');size()}
/* no playable source (or its Vimeo embed would not load): an honest 'stills only' in place of the play button */
function playUI(f){var ok=!!(f&&f.play&&!f.vfail);$('.fp-play',root).hidden=!ok;$('.fp-so',root).hidden=ok;root.classList.toggle('noplay',!ok)}
/* the idle picture: the film's own short preview (pv, 640 px) to its natural end, then again, as the Film chapter already does
   (GJ_NOLOOP: a clip with no other clip in its set starts again). The 240 px sky clips (sc) are never blown up here; no pv = the still. */
function idle(f){idleStop();frame.innerHTML='';frame.className='fp-frame';
  var clips=[f.pv].filter(Boolean),img=new Image();img.src=f.poster;img.alt='';img.className='fp-still';frame.appendChild(img);
  if(!clips.length)return;
  var v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');v.playsInline=true;v.setAttribute('playsinline','');
  v.preload='auto';v.poster=f.poster;v.className='fp-idle';var k=0;v.src=clips[0];
  v.addEventListener('playing',function(){v.classList.add('live')});
  v.addEventListener('ended',function(){if(clips.length>1){k=(k+1)%clips.length;v.src=clips[k]}else{try{v.currentTime=0}catch(e){}}var q=v.play();if(q&&q.catch)q.catch(function(){})});
  frame.appendChild(v);IDLE=v;var q=v.play();if(q&&q.catch)q.catch(function(){})}
function idleStop(){if(IDLE){try{IDLE.pause()}catch(e){}IDLE.removeAttribute('src');try{IDLE.load()}catch(e){}IDLE=null}}

/* ---------- the real film ---------- */
var P=null; /* {type, el, playing} */
function label(t){var b=$('.fp-play',root);if(b)b.textContent=t}
function startPlay(t){var f=S.f;if(!f||!f.play)return;S.p=1;root.classList.add('playing');label('… loading');
  if(f.play.type==='native'){
    var v=document.createElement('video');v.className='fp-film';v.controls=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';
    v.poster=f.play.poster||f.poster;v.src=f.play.src;
    v.addEventListener('playing',function(){if(P&&P.el===v){P.playing=1;label('❚❚ pause');clearIdleUnder(v)}});
    v.addEventListener('pause',function(){if(P&&P.el===v){P.playing=0;label(v.ended?'▶ play again':'▶ play film')}});
    v.addEventListener('ended',function(){if(P&&P.el===v){P.playing=0;P.ended=1;label('▶ play again')}});
    v.addEventListener('timeupdate',function(){if(P&&P.el===v)follow(v.currentTime)});
    v.addEventListener('loadeddata',function(){clearIdleUnder(v)});
    v.addEventListener('error',function(){if(P&&P.el===v)label('▶ play film')});
    frame.appendChild(v);P={type:'native',el:v,playing:0};
    if(t){var go=function(){try{v.currentTime=t}catch(e){}};if(v.readyState>=1)go();else v.addEventListener('loadedmetadata',go,{once:true})}
    var q=v.play();if(q&&q.then)q.then(null,function(){if(P&&P.el===v&&v.paused)label('▶ play film')});
  }else if(f.play.type==='vimeo'){
    var ifr=document.createElement('iframe');ifr.className='fp-film';ifr.title=f.t;ifr.allow='autoplay; fullscreen; picture-in-picture';ifr.setAttribute('allowfullscreen','');
    ifr.src='https://player.vimeo.com/video/'+f.play.id+'?autoplay=1&playsinline=1&title=0&byline=0&portrait=0&dnt=1&color=55DAA1';
    frame.appendChild(ifr);P={type:'vimeo',el:ifr,playing:0,ready:0};
    var me=P;setTimeout(function(){if(P===me&&!me.playing&&!me.seen)label('▶ tap the film')},4500);
    /* the embed never answered (blocked or offline): fall back to the stills, one step back out of play */
    setTimeout(function(){if(P!==me||me.seen)return;f.vfail=1;if(history.state&&history.state.fp&&history.state.p)history.back();else{stopPlay();playUI(f)}},9000);
  }
  frame.classList.add('fp-on');size()}
function clearIdleUnder(v){if(IDLE){idleStop()}[].slice.call(frame.children).forEach(function(c){if(c!==v&&c.tagName!=='IFRAME'&&c.className!=='fp-film')c.style.visibility='hidden'})}
function stopPlay(quiet){if(P){var el=P.el;try{if(P.type==='native'){el.pause();el.removeAttribute('src');el.load()}}catch(e){}el.remove();P=null}
  S.p=0;if(fsEl())exitFs();if(root)root.classList.remove('playing');if(!quiet&&S.f){idle(S.f);label('▶ play film');playUI(S.f);cap('');size();shotOn(-1)}}
function playBtn(){var f=S.f;if(!f||!f.play||f.vfail)return;
  if(!S.p){step({s:f.s,p:1,st:-1,d:(S.d||1)+1});return}
  if(!P){startPlay();return}
  if(P.type==='native'){var v=P.el;if(v.paused){if(v.ended)try{v.currentTime=0}catch(e){}label('… loading');var q=v.play();if(q&&q.catch)q.catch(function(){label('▶ play film')})}else v.pause()}
  else vm(P.el,P.playing?'pause':'play')}
function vm(ifr,method,value){try{ifr.contentWindow.postMessage(JSON.stringify(value===undefined?{method:method}:{method:method,value:value}),'https://player.vimeo.com')}catch(e){}}
addEventListener('message',function(e){if(!P||P.type!=='vimeo'||e.source!==P.el.contentWindow)return;if(!/^https:\/\/player\.vimeo\.com$/.test(e.origin))return;
  var d=e.data;try{if(typeof d==='string')d=JSON.parse(d)}catch(x){return}if(!d)return;P.seen=1;
  if(d.event==='ready'){P.ready=1;['play','playing','pause','ended','error'].forEach(function(ev){vm(P.el,'addEventListener',ev)});vm(P.el,'play')}
  else if(d.event==='play'||d.event==='playing'){P.playing=1;label('❚❚ pause');clearIdleUnder(P.el)}
  else if(d.event==='pause'){P.playing=0;label('▶ play film')}
  else if(d.event==='ended'){P.playing=0;label('▶ play again')}
  else if(d.event==='error'){P.playing=0;label('▶ tap the film')}});

/* the reel's shots under it: the strip follows playback, a tap jumps there */
var SHOT=-1;
function follow(t){var f=S.f,sh=f&&f.play&&f.play.shots;if(!sh)return;var i=0;for(var k=sh.length-1;k>=0;k--)if(t>=sh[k].t-.02){i=k;break}
  if(i!==SHOT){shotOn(i);cap(sh[i].title?('shot '+(i+1)+' of '+sh.length+' · '+sh[i].title):'')}}
function shotOn(i){SHOT=i;[].forEach.call(strip.children,function(b,k){b.classList.toggle('on',k===i)});var b=strip.children[i];
  if(!b||Date.now()-userT<2200)return;
  if(strip.scrollWidth>strip.clientWidth+1)strip.scrollTo({left:b.offsetLeft-strip.clientWidth/2+b.clientWidth/2,behavior:'smooth'});
  else if(strip.scrollHeight>strip.clientHeight+1)strip.scrollTo({top:b.offsetTop-strip.offsetTop-strip.clientHeight/2+b.clientHeight/2,behavior:'smooth'})}
var userT=0;function cap(t){var c=$('.fp-cap',root);if(c)c.textContent=t}

/* ---------- stills: fullscreen with its own history step ---------- */
function lbShow(i){S.st=i;if(i<0){if(!lb.hidden){lb.hidden=true}return}
  var f=S.f;i=Math.max(0,Math.min(f.stills.length-1,i));S.st=i;var im=$('img',lb),was=lb.hidden;im.src=f.stills[i];
  $('.fp-lbc',lb).textContent=(i+1)+' / '+f.stills.length;$('.fp-lbp',lb).hidden=$('.fp-lbn',lb).hidden=f.stills.length<2;
  lb.hidden=false;if(was)lb.animate([{opacity:0},{opacity:1}],{duration:220,easing:EASE});
  if(S.p&&P&&P.type==='native'&&!P.el.paused)P.el.pause()}
function lbStep(d){var f=S.f;if(!f||S.st<0)return;var n=(S.st+d+f.stills.length)%f.stills.length;push({s:f.s,p:0,st:n,d:S.d},true);lbShow(n);
  $('img',lb).animate([{opacity:.3,transform:'translateX('+(d*24)+'px)'},{opacity:1,transform:'none'}],{duration:240,easing:EASE})}

/* ---------- neighbours ---------- */
function neighbour(d){var f=S.f;if(!f)return;var to=F[(f.i+d+F.length)%F.length];
  if(S.p&&history.state&&history.state.fp&&history.state.p){PEND=to.s;PDIR=d;history.back();return} /* playing: step out of play first, then swap in place (prev/next never add history; Back = where the film was opened from) */
  push({s:to.s,p:0,st:-1,d:S.d||1},true);show({s:to.s,p:0,st:-1,d:S.d||1},d)}
var PDIR=1;

/* ---------- format ---------- */
var PORT=matchMedia('(orientation:portrait) and (max-width:899px)');
function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement}
function exitFs(){try{var x=(document.exitFullscreen||document.webkitExitFullscreen).call(document);if(x&&x.catch)x.catch(function(){})}catch(e){}}
function full(){if(fsEl()){exitFs();return}
  var el=frame;
  if(P&&P.type==='native'&&!(el.requestFullscreen||el.webkitRequestFullscreen)&&P.el.webkitEnterFullscreen){try{P.el.webkitEnterFullscreen()}catch(e){}return}
  if(P&&P.type==='vimeo'&&!(el.requestFullscreen||el.webkitRequestFullscreen)){vm(P.el,'requestFullscreen');return}
  try{var q=el.requestFullscreen?el.requestFullscreen():el.webkitRequestFullscreen&&el.webkitRequestFullscreen();if(q&&q.catch)q.catch(function(){})}catch(e){}}
function size(){if(!root||root.hidden||!S.f)return;var st=$('.fp-stage',root),SW=st.clientWidth,SH=st.clientHeight;if(!SW||!SH)return;
  if(fsEl()){frame.style.width=frame.style.height='';return}
  if(PORT.matches)SH=Math.max(SH,Math.round(innerHeight*.55)); /* portrait: the stage takes the frame's height; a tall film may use half the screen */
  var a=S.p&&S.f.play?S.f.play.ar:2.39,w=Math.min(SW,SH*a),h=w/a;frame.style.width=Math.round(w)+'px';frame.style.height=Math.round(h)+'px'}

/* ---------- taps ---------- */
function onClick(e){var b=e.target.closest('[data-a],.th');if(!b)return;
  if(b.classList.contains('th')){e.preventDefault();var i=+b.dataset.i,f=S.f;
    if(f.play&&f.play.shots){userT=0;var t=f.play.shots[i].t+.05;if(!S.p){step({s:f.s,p:1,st:-1,d:(S.d||1)+1},t)}else if(P&&P.type==='native'){try{P.el.currentTime=t}catch(x){}if(P.el.paused){var q=P.el.play();if(q&&q.catch)q.catch(function(){})}}shotOn(i);return}
    step({s:f.s,p:S.p,st:i,d:(S.d||1)+1});return} /* a still over a playing film pauses it; Back returns to the film */
  var a=b.dataset.a;e.preventDefault();
  if(a==='x')closeAll();
  else if(a==='play')playBtn();
  else if(a==='prev')neighbour(-1);
  else if(a==='next')neighbour(1);
  else if(a==='full')full();
  else if(a==='lbx')history.back();
  else if(a==='lbprev')lbStep(-1);
  else if(a==='lbnext')lbStep(1)}
/* the full page link is a normal link (Back returns here through the deep link) */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('#fp .fp-page');if(a&&S.f&&S.f.page){stopPlay(true)}},true);
strip_watch();function strip_watch(){document.addEventListener('touchstart',function(e){if(strip&&strip.contains(e.target))userT=Date.now()},{passive:true,capture:true});document.addEventListener('wheel',function(e){if(strip&&strip.contains(e.target))userT=Date.now()},{passive:true,capture:true})}

/* one forward step: a new history entry, then that state */
function step(st,t){push(st);var o={s:st.s,p:st.p,st:st.st,d:st.d,t:t};show(o)}

/* ---------- API ---------- */
function open(slug){var f=BY[slug];if(!f)return false;if(!root)build();var st={s:slug,p:0,st:-1,d:1};push(st);show(st);return true}
/* open and play at once (3d-sky's 'watch'): two history steps, so Back = the film's idle view, then where it was opened from */
function openPlay(slug){if(!open(slug))return false;var f=BY[slug];if(f.play&&!f.vfail)step({s:slug,p:1,st:-1,d:2});return true}
if(DEEP){whenSky(function(){var b={s:DEEP.s,p:0,st:-1,d:1};push(b);if(DEEP.p||DEEP.st>=0){var t={s:DEEP.s,p:DEEP.p,st:DEEP.st,d:2};push(t);show(b);show(t)}else show(b)})}
window.GJ_FP={has:function(slug){return !!BY[slug]},open:open,play:openPlay,close:closeAll,
  state:function(){var v=P&&P.type==='native'?P.el:null;return{on:S.on,s:S.f&&S.f.s,p:S.p,st:S.st,d:S.d,hash:location.hash,type:P&&P.type,playing:P?!!P.playing:false,t:v?v.currentTime:null,dur:v?v.duration:null,ended:v?v.ended:null,src:v?v.currentSrc:(P&&P.el.src)||null,idle:IDLE?IDLE.currentSrc:null,label:root?$('.fp-play',root).textContent:''}},
  vimeo:function(m,v){if(P&&P.type==='vimeo')vm(P.el,m,v)},
  films:function(){return F.map(function(f){return{s:f.s,play:f.play&&f.play.type,stills:f.stills.length,fallback:f.fallback,page:f.page}})}};
})();
