/* Film room pass (Nov 13): the featured player.
 A work with real stills opens on those stills. The first still is up at once. The next one waits
 until it has decoded, then cuts in at full opacity. The outgoing still stays fully bright until
 that cut. No dissolve, including with Reduce Motion. Under it: a thin progress line, a filmstrip
 (every thumb at full brightness; the selected one is a warm-white line), the title, role · year,
 verified awards and credits, then the other featured films at full brightness.
 The player is a full-size state, not a scrolling page. A slim To Go bar stays at full brightness.
 Tapping the bar grows the player from the touch point. A downward swipe shrinks it back into the bar.
 A sideways swipe on the picture steps the still, the same full-brightness cut. Tapping another
 featured card grows that film from the card. */
(function(){
'use strict';
var FEAT=['film/one-with-the-devil','film/weird-kid','film/back-to-the-start','film/backward-fall','film/legends'];
var HOLDS={A:3400,B:5000,C:2400},FP={t:0,i:0,root:null,work:null,sub:0},FROM=null,BAR=null;
function hold(){var v=window.GJ_VAR?GJ_VAR.get('film'):'A';return HOLDS[v]||3400}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function parts(t){t=String(t||'');var i=t.lastIndexOf(' · ');if(i<0)return {pre:'',name:t};return {pre:t.slice(0,i),name:t.slice(i+3).replace(/^['‘’"“”]+|['‘’"“”]+$/g,'')}}
function byId(id){return window.__u1&&__u1.byId?__u1.byId(id):null}
function roleLine(w){var b=[];if(w.role)b.push(w.role);if(w.year)b.push(String(w.year));return b.join(' · ')}
function filmOn(){var u=window.__u1;return !!(u&&u.cur&&u.cur.k==='film')}
function halt(){if(FP.t){clearInterval(FP.t);FP.t=0}}
function stop(){halt();if(FP.root){var v=FP.root.querySelector('video.fp-loop');if(v){try{v.pause()}catch(e){}}}}
/* Weird Kid's player hero is the 720p loop: poster, then the webm, then the mp4.
   It stays out of the board markup until this player opens. The stills cut under it at full brightness.
   Reduce Motion does not freeze the loop. The board ladder in playback.js still prefers AV1. */
function loopHtml(work){
  if(!work||work.id!=='film/weird-kid')return '';
  return '<video class="fp-loop" muted playsinline webkit-playsinline loop preload="none" poster="media/films/weird-kid/loop-poster.jpg" aria-label="Weird Kid">'+
    '<source src="media/films/weird-kid/loop-720.webm" type="video/webm">'+
    '<source src="media/films/weird-kid/loop-720.mp4" type="video/mp4">'+
    '</video>';
}
function armLoop(root){
  var v=root&&root.querySelector('video.fp-loop');if(!v)return;
  v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');
  v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
  v.loop=true;
  /* The loop cuts in once a frame is decoded. It does not fade over the still. */
  function show(){v.classList.add('live')}
  v.addEventListener('loadeddata',show);
  v.addEventListener('playing',show);
  if(v.readyState>=2)show();
  var p=v.play();if(p&&p.catch)p.catch(function(){});
}
var showGen=0;
function decodeIm(im){
  if(!im)return Promise.resolve();
  if(typeof im.decode==='function')return im.decode().catch(function(){});
  if(im.complete&&im.naturalWidth)return Promise.resolve();
  return new Promise(function(res){
    im.addEventListener('load',function(){res()},{once:true});
    im.addEventListener('error',function(){res()},{once:true});
  });
}
/* The plate behind the stack keeps the outgoing still, so a gap between bitmaps cannot flash black. */
function plate(frame,im){
  if(!frame||!im)return;
  var src=im.currentSrc||im.getAttribute('src')||'';
  if(!src)return;
  frame.style.backgroundImage='url("'+String(src).replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'")';
  frame.style.backgroundSize='cover';
  frame.style.backgroundPosition='center';
  frame.style.backgroundColor='#04070b';
}
function show(i,first){
  var r=FP.root;if(!r||!r.isConnected){stop();return}
  var ims=r.querySelectorAll('.fp-frame img'),th=r.querySelectorAll('.fp-strip button'),n=ims.length;if(!n)return;
  i=((i%n)+n)%n;
  var prev=FP.i,gen=++showGen;
  function mark(){
    for(var k=0;k<n;k++)if(th[k])th[k].classList.toggle('on',k===i);
    var bar=r.querySelector('.fp-bar i');if(bar)bar.style.width=(((i+1)/n)*100).toFixed(2)+'%';
    var st=r.querySelector('.fp-strip'),cur=th[i];
    if(st&&cur&&st.scrollWidth>st.clientWidth+2){var x=cur.offsetLeft-st.clientWidth/2+cur.clientWidth/2;st.scrollLeft=Math.max(0,x)}
  }
  function cut(){
    if(gen!==showGen||!r.isConnected)return;
    var frame=r.querySelector('.fp-frame'),incoming=ims[i],outgoing=ims[prev];
    plate(frame,outgoing&&outgoing.classList.contains('on')?outgoing:incoming);
    if(incoming){incoming.style.zIndex='3';incoming.classList.add('on')}
    FP.i=i;mark();
    requestAnimationFrame(function(){
      if(gen!==showGen||!r.isConnected)return;
      for(var k=0;k<n;k++)if(k!==i){ims[k].classList.remove('on');ims[k].style.zIndex=''}
      plate(frame,incoming);
    });
  }
  if(first||i===prev){
    FP.i=i;
    for(var k=0;k<n;k++){
      var on=k===i;
      ims[k].classList.toggle('on',on);
      ims[k].style.zIndex=on?'3':'';
    }
    mark();
    plate(r.querySelector('.fp-frame'),ims[i]);
    return;
  }
  /* Leave the current still fully opaque until the next bitmap is ready, then cut. Never a partial fade. */
  decodeIm(ims[i]).then(cut);
}
/* Beyond changed the selection while this page is open: the strip and the picture take their new stills by gliding in from depth
 (js/beyond.js glideDom). Opaque the whole way; no dissolve, no dim. */
function beyondSwap(){
  var B=window.GJ_BEYOND,r=FP.root,w=FP.work;
  if(!B||!r||!r.isConnected||!w)return;
  var list=B.stills(w,w.stills.slice()),frame=r.querySelector('.fp-frame');
  var btns=r.querySelectorAll('.fp-strip button'),ims;
  B.flush(frame);[].forEach.call(btns,function(x){B.flush(x)});
  ims=r.querySelectorAll('.fp-frame img');
  list.forEach(function(src,k){
    var b=btns[k],bi=b&&b.querySelector('img'),fi=ims[k];
    if(bi&&bi.getAttribute('src')!==src)B.glideDom(b,bi,src,k,{flow:true});
    if(fi&&fi.getAttribute('src')!==src){
      if(k===FP.i&&fi.classList.contains('on')&&frame)B.glideDom(frame,fi,src,0);
      else fi.setAttribute('src',src);
    }
  });
}
function run(){halt();FP.t=setInterval(function(){if(document.hidden)return;show(FP.i+1)},hold())}
function card(w){
  var p=parts(w.title),still=(w.media&&w.media.thumb)||(w.stills&&w.stills[0])||'';
  if(w.id==='film/weird-kid')p={pre:'Chris Malinchak and Kiesza',name:'Weird Kid'};
  return '<a class="fp-card" href="#film/'+esc(w.slug)+'" data-open="'+esc(w.id)+'">'+
    '<span class="fp-cim"><img src="'+esc(still)+'" alt=""></span>'+
    '<b>'+esc(p.name)+'</b>'+(p.pre?'<small>'+esc(p.pre)+'</small>':'')+
    (w.role?'<em>'+esc(w.role)+'</em>':'')+'</a>';
}
function playScale(el, from, to, ms, ease){
  if(!el)return;
  if(el.getAnimations)el.getAnimations().forEach(function(a){a.cancel()});
  if(!el.animate){el.style.transform=to;return}
  el.animate([{transform:from},{transform:to}],{duration:ms,easing:ease,fill:'both'});
}
function applyFrom(sheet){
  var f=FROM;FROM=null;if(!f||!sheet)return;
  var sx=Math.max(0.08,Math.min(0.85,(f.w||80)/Math.max(1,innerWidth)));
  var sy=Math.max(0.08,Math.min(0.85,(f.h||48)/Math.max(1,innerHeight)));
  sheet.style.transformOrigin=(f.x||innerWidth/2)+'px '+(f.y||innerHeight-40)+'px';
  sheet.classList.add('fp-from');
  playScale(sheet,'scale('+sx.toFixed(3)+','+sy.toFixed(3)+')','scale(1,1)',600,'cubic-bezier(.22,.7,.2,1)');
}
function paint(el,work,under){
  stop();
  if(window.GJ_DEPTH&&GJ_DEPTH.hush)GJ_DEPTH.hush();
  FP.work=work;
  var st=window.GJ_BEYOND?GJ_BEYOND.stills(work,work.stills.slice()):work.stills.slice(),p=parts(work.title),first=st[0]||'';
  if(work.id==='film/weird-kid')p={pre:'Chris Malinchak and Kiesza',name:'Weird Kid'};
  var frames=st.map(function(s,i){
    return '<img src="'+esc(s)+'" alt=""'+(i===0?' class="on fp-now" fetchpriority="high"':'')+'>';
  }).join('');
  var strip=st.map(function(s,i){return '<button type="button" aria-label="still '+(i+1)+'"'+(i===0?' class="on"':'')+'><img src="'+esc(s)+'" alt=""></button>'}).join('');
  var aw=(work.awards||[]).map(function(a){return '<li>'+esc(a)+'</li>'}).join('');
  var cr=(work.credits||[]).filter(function(c){return c&&c!==work.role}).map(function(c){return '<li>'+esc(c)+'</li>'}).join('');
  var next=FEAT.filter(function(id){return id!==work.id}).map(byId).filter(function(w){return w&&w.title}).map(card).join('');
  el.innerHTML='<div class="sheet film lv1 full fp fp-full">'+
    '<div class="fp-main"><div class="fp-stage"><div class="fp-spill" aria-hidden="true"></div>'+
      '<div class="heroframe fp-frame" style="background-color:#04070b;background-image:url(\''+esc(first)+'\');background-size:cover;background-position:center">'+frames+loopHtml(work)+'</div>'+
      '<div class="fp-bar" aria-hidden="true"><i></i></div>'+
      '<div class="fp-strip" role="group" aria-label="stills">'+strip+'</div></div>'+
    '<div class="fp-meta">'+(p.pre?'<small class="fp-pre">'+esc(p.pre)+'</small>':'')+'<h3 class="fp-t">'+esc(p.name)+'</h3>'+
      (roleLine(work)?'<p class="fp-r">'+esc(roleLine(work))+'</p>':'')+
      (aw?'<ul class="fp-aw">'+aw+'</ul>':'')+(cr?'<ul class="fp-cr">'+cr+'</ul>':'')+'</div></div>'+
    (next?'<div class="fp-next"><p class="fp-lab">featured</p><div class="fp-cards">'+next+'</div></div>':'')+
    (under||'')+'</div>';
  FP.root=el.querySelector('.sheet.fp');FP.i=0;
  if(window.GJ_BEYOND&&!FP.sub){FP.sub=1;GJ_BEYOND.on(function(s,why){if(why==='sel'||why==='index')beyondSwap()})}
  [].forEach.call(FP.root.querySelectorAll('.fp-frame img'),decodeIm);
  applyFrom(FP.root);
  var y0=0,y1=0,x0=0,x1=0,pid=0,drag=false;
  function onMove(e){if(drag&&e.pointerId===pid){y1=e.clientY;x1=e.clientX}}
  function endDrag(e){
    if(!drag||e.pointerId!==pid)return;drag=false;
    window.removeEventListener('pointermove',onMove,true);
    window.removeEventListener('pointerup',endDrag,true);
    window.removeEventListener('pointercancel',endDrag,true);
    window.removeEventListener('mouseup',endMouse,true);
    if(e.stopPropagation)e.stopPropagation();
    var y=e.type==='pointercancel'?y1:e.clientY;
    var x=e.type==='pointercancel'?x1:e.clientX;
    var dx=x-x0,dy=y-y0;
    /* Sideways steps the still. The picture does not move or fade while the finger is down. */
    if(Math.abs(dx)>56&&Math.abs(dx)>Math.abs(dy)*1.25){show(FP.i+(dx<0?1:-1));run();return}
    if(dy>64)shrink();
  }
  function endMouse(e){
    if(!drag)return;
    endDrag({pointerId:pid,clientX:e.clientX!=null?e.clientX:x1,clientY:e.clientY,type:'pointerup'});
  }
  FP.root.addEventListener('pointerdown',function(e){
    if(e.target.closest('a,button,input'))return;
    if(e.cancelable)e.preventDefault();
    e.stopPropagation();
    y0=y1=e.clientY;x0=x1=e.clientX;pid=e.pointerId;drag=true;
    window.addEventListener('pointermove',onMove,true);
    window.addEventListener('pointerup',endDrag,true);
    window.addEventListener('pointercancel',endDrag,true);
    window.addEventListener('mouseup',endMouse,true);
  },true);
  [].forEach.call(el.querySelectorAll('.fp-strip button'),function(b,i){
    b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();show(i);run()});
  });
  [].forEach.call(el.querySelectorAll('.fp-card[data-open]'),function(a){
    a.addEventListener('click',function(ev){
      ev.preventDefault();ev.stopPropagation();
      var id=a.getAttribute('data-open'),w=byId(id),box=a.getBoundingClientRect();
      whenStill(w&&w.stills&&w.stills[0],function(){
        FROM={x:box.left+box.width/2,y:box.top+box.height/2,w:box.width,h:box.height};
        stop();
        if(window.__u1&&__u1.open)__u1.open(id);
      });
    });
  });
  show(0,true);run();armLoop(FP.root);
  syncBar();
}
function whenStill(src, fn){
  if(!src){fn();return}
  var im=new Image(),done=false;
  function go(){if(done)return;done=true;fn()}
  im.onload=go;im.onerror=go;im.src=src;
  if(im.complete)go();
}
function shrink(){
  var sheet=FP.root;if(!sheet)return;
  sheet.classList.remove('fp-from');
  sheet.classList.add('fp-shrink');
  /* Swipe-down always returns to the bar, whichever point the film grew from. */
  sheet.style.transformOrigin='72px '+(innerHeight-18)+'px';
  playScale(sheet,'scale(1,1)','scale(.08,.06)',420,'cubic-bezier(.4,0,.2,1)');
  setTimeout(function(){if(window.__u1&&__u1.pinchOut)__u1.pinchOut()},420);
}
function openLead(x,y){
  if(document.querySelector('#layer .sheet.film.fp.fp-full'))return;
  var id='film/one-with-the-devil';
  var u=window.__u1;
  if(u&&u.cur&&u.cur.id&&String(u.cur.id).indexOf('film/')===0&&u.cur.id!=='film/cards')id=u.cur.id;
  var w=byId(id),src=w&&w.stills&&w.stills[0];
  whenStill(src,function(){
    if(document.querySelector('#layer .sheet.film.fp.fp-full'))return;
    FROM={x:x,y:y,w:72,h:28};
    if(u&&u.open)u.open(id);
  });
}
function syncBar(){
  if(!BAR)return;
  BAR.hidden=false;
  BAR.style.opacity='1';
}
function mountBar(){
  if(document.getElementById('togo')){BAR=document.getElementById('togo');syncBar();return}
  BAR=document.createElement('aside');
  BAR.id='togo';
  BAR.setAttribute('aria-label','To Go, Lost Coffee');
  var c=document.createElement('canvas');c.width=168;c.height=22;c.setAttribute('aria-hidden','true');
  var g=c.getContext('2d'),peaks=[0.413,0.602,0.426,0.446,0.753,0.682,0.753,0.928,0.841,1,0.92,0.898,0.997,0.89,0.929,0.994,0.908,0.843];
  g.fillStyle='#e8e4dc';
  peaks.forEach(function(p,i){var x=4+i*9,h=Math.max(2,p*16);g.beginPath();g.arc(x,18-h,1.15,0,6.283);g.fill();if(p>.45){g.beginPath();g.arc(x,18-h*.55,1,0,6.283);g.fill()}});
  var s=document.createElement('span');s.textContent='To Go · Lost Coffee';
  BAR.appendChild(c);BAR.appendChild(s);
  BAR.addEventListener('pointerdown',function(e){
    if(!filmOn())return;
    if(document.querySelector('#layer .sheet.film.fp.fp-full'))return;
    e.preventDefault();e.stopPropagation();
    openLead(e.clientX,e.clientY);
  });
  document.body.appendChild(BAR);
  syncBar();
}
if(window.GJ_VAR)GJ_VAR.on(function(room){if(room==='film'&&FP.t&&FP.root&&FP.root.isConnected)run()});
mountBar();
setInterval(syncBar,300);
window.GJ_FP={paint:paint,stop:stop,shrink:shrink,from:function(b){if(!FROM&&b&&b.w)FROM=b},get state(){return {i:FP.i,on:!!FP.t,n:FP.root?FP.root.querySelectorAll('.fp-frame img').length:0}}};
})();
