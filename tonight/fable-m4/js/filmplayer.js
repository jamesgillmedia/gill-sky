/* Film room pass (Nov 13): the featured player.
 A work with real stills opens on those stills. The first still is up at once. The rest dissolve
 into it (1.2 s, the same dissolve with Reduce Motion). Under it: a thin progress line, a filmstrip,
 the title, role · year, verified awards and credits, then the other featured films.
 The player is a full-size state, not a scrolling page. A slim To Go bar stays at full brightness.
 Tapping the bar grows the player from the touch point. A downward swipe shrinks it back into the bar.
 Tapping another featured card grows that film from the card. */
(function(){
'use strict';
var FEAT=['film/one-with-the-devil','film/weird-kid','film/back-to-the-start','film/backward-fall','film/legends'];
var HOLDS={A:3400,B:5000,C:2400},FP={t:0,i:0,root:null},FROM=null,BAR=null;
function hold(){var v=window.GJ_VAR?GJ_VAR.get('film'):'A';return HOLDS[v]||3400}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function parts(t){t=String(t||'');var i=t.lastIndexOf(' · ');if(i<0)return {pre:'',name:t};return {pre:t.slice(0,i),name:t.slice(i+3).replace(/^['‘’"“”]+|['‘’"“”]+$/g,'')}}
function byId(id){return window.__u1&&__u1.byId?__u1.byId(id):null}
function roleLine(w){var b=[];if(w.role)b.push(w.role);if(w.year)b.push(String(w.year));return b.join(' · ')}
function filmOn(){var u=window.__u1;return !!(u&&u.cur&&u.cur.k==='film')}
function halt(){if(FP.t){clearInterval(FP.t);FP.t=0}}
function stop(){halt();if(FP.root){var v=FP.root.querySelector('video.fp-loop');if(v){try{v.pause()}catch(e){}}}}
/* Weird Kid's player hero is the 720p loop: poster, then the webm, then the mp4.
   It stays out of the board markup until this player opens. The stills keep dissolving under it.
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
  var p=v.play();if(p&&p.catch)p.catch(function(){});
}
function show(i,first){
  var r=FP.root;if(!r||!r.isConnected){stop();return}
  var ims=r.querySelectorAll('.fp-frame img'),th=r.querySelectorAll('.fp-strip button'),n=ims.length;if(!n)return;
  i=((i%n)+n)%n;var prev=FP.i;FP.i=i;
  if(!first){
    for(var j=0;j<n;j++)ims[j].classList.remove('fp-now');
    if(ims[prev])void ims[prev].offsetWidth;
  }
  for(var k=0;k<n;k++){
    ims[k].classList.toggle('on',k===i);
    if(th[k])th[k].classList.toggle('on',k===i);
  }
  var bar=r.querySelector('.fp-bar i');if(bar)bar.style.width=(((i+1)/n)*100).toFixed(2)+'%';
  var st=r.querySelector('.fp-strip'),cur=th[i];
  if(st&&cur&&st.scrollWidth>st.clientWidth+2){var x=cur.offsetLeft-st.clientWidth/2+cur.clientWidth/2;st.scrollLeft=Math.max(0,x)}
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
function applyFrom(sheet){
  var f=FROM;FROM=null;if(!f||!sheet)return;
  var sx=Math.max(0.08,Math.min(0.85,(f.w||80)/Math.max(1,innerWidth)));
  var sy=Math.max(0.08,Math.min(0.85,(f.h||48)/Math.max(1,innerHeight)));
  sheet.style.setProperty('--fp-sx',sx.toFixed(3));
  sheet.style.setProperty('--fp-sy',sy.toFixed(3));
  sheet.style.transformOrigin=(f.x||innerWidth/2)+'px '+(f.y||innerHeight-40)+'px';
  sheet.classList.add('fp-from');
}
function paint(el,work,under){
  stop();
  if(window.GJ_DEPTH&&GJ_DEPTH.hush)GJ_DEPTH.hush();
  var st=work.stills.slice(),p=parts(work.title),first=st[0]||'';
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
  applyFrom(FP.root);
  var y0=0,y1=0,pid=0,drag=false;
  function endDrag(e){
    if(!drag||e.pointerId!==pid)return;drag=false;
    var y=e.type==='pointercancel'?y1:e.clientY;
    if(y-y0>64)shrink();
  }
  FP.root.addEventListener('pointerdown',function(e){
    if(e.target.closest('a,button'))return;
    y0=y1=e.clientY;pid=e.pointerId;drag=true;
    try{FP.root.setPointerCapture(e.pointerId)}catch(err){}
  });
  FP.root.addEventListener('pointermove',function(e){
    if(drag&&e.pointerId===pid)y1=e.clientY;
  });
  FP.root.addEventListener('pointerup',endDrag);
  FP.root.addEventListener('pointercancel',endDrag);
  [].forEach.call(el.querySelectorAll('.fp-strip button'),function(b,i){
    b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();show(i);run()});
  });
  [].forEach.call(el.querySelectorAll('.fp-card[data-open]'),function(a){
    a.addEventListener('click',function(ev){
      ev.preventDefault();ev.stopPropagation();
      var box=a.getBoundingClientRect();
      FROM={x:box.left+box.width/2,y:box.top+box.height/2,w:box.width,h:box.height};
      stop();
      if(window.__u1&&__u1.open)__u1.open(a.getAttribute('data-open'));
    });
  });
  show(0,true);run();armLoop(FP.root);
  syncBar();
}
function shrink(){
  var sheet=FP.root;if(!sheet)return;
  sheet.classList.remove('fp-from');
  sheet.classList.add('fp-shrink');
  setTimeout(function(){if(window.__u1&&__u1.pinchOut)__u1.pinchOut()},420);
}
function openLead(x,y){
  FROM={x:x,y:y,w:72,h:28};
  var id='film/one-with-the-devil';
  var u=window.__u1;
  if(u&&u.cur&&u.cur.id&&String(u.cur.id).indexOf('film/')===0&&u.cur.id!=='film/cards')id=u.cur.id;
  if(u&&u.open)u.open(id);
}
function syncBar(){
  if(!BAR)return;
  var on=filmOn();
  BAR.hidden=!on;
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
    e.preventDefault();e.stopPropagation();
    openLead(e.clientX,e.clientY);
  });
  document.body.appendChild(BAR);
  syncBar();
}
if(window.GJ_VAR)GJ_VAR.on(function(room){if(room==='film'&&FP.t&&FP.root&&FP.root.isConnected)run()});
mountBar();
setInterval(syncBar,300);
window.GJ_FP={paint:paint,stop:stop,shrink:shrink,get state(){return {i:FP.i,on:!!FP.t,n:FP.root?FP.root.querySelectorAll('.fp-frame img').length:0}}};
})();
