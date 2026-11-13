/* Film room pass (Nov 13): the featured player.
 A work with real stills in data.json (works[].stills) opens on a player: its stills dissolve one into the next
 (3.4 s each, the same frames in the same order with Reduce Motion, only without the fade), a thin progress line,
 a filmstrip you can tap, then the title, role · year, verified awards and credits, then the other featured films.
 The surround is near-black so the player is the brightest thing on screen. No embeds; every picture is local. */
(function(){
'use strict';
var FEAT=['film/one-with-the-devil','film/weird-kid','film/back-to-the-start','film/backward-fall','film/legends'];
var HOLDS={A:3400,B:5000,C:2400},FP={t:0,i:0,n:0,root:null};
function hold(){var v=window.GJ_VAR?GJ_VAR.get('film'):'A';return HOLDS[v]||3400}
var RM=false;try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function parts(t){t=String(t||'');var i=t.lastIndexOf(' · ');if(i<0)return {pre:'',name:t};return {pre:t.slice(0,i),name:t.slice(i+3).replace(/^['‘’"“”]+|['‘’"“”]+$/g,'')}}
function byId(id){return window.__u1&&__u1.byId?__u1.byId(id):null}
function roleLine(w){var b=[];if(w.role)b.push(w.role);if(w.year)b.push(String(w.year));return b.join(' · ')}
function stop(){if(FP.t){clearInterval(FP.t);FP.t=0}}
function show(i){
  var r=FP.root;if(!r||!r.isConnected){stop();return}
  var ims=r.querySelectorAll('.fp-frame img'),th=r.querySelectorAll('.fp-strip button'),n=ims.length;if(!n)return;
  i=((i%n)+n)%n;FP.i=i;
  for(var k=0;k<n;k++){ims[k].classList.toggle('on',k===i);if(th[k])th[k].classList.toggle('on',k===i)}
  var bar=r.querySelector('.fp-bar i');if(bar)bar.style.width=(((i+1)/n)*100).toFixed(2)+'%';
  var st=r.querySelector('.fp-strip'),cur=th[i];
  if(st&&cur&&st.scrollWidth>st.clientWidth+2){var x=cur.offsetLeft-st.clientWidth/2+cur.clientWidth/2;st.scrollLeft=Math.max(0,x)}
}
function run(){stop();FP.t=setInterval(function(){if(document.hidden)return;show(FP.i+1)},hold())}
function card(w){
  var p=parts(w.title),still=(w.media&&w.media.thumb)||(w.stills&&w.stills[0])||'';
  if(w.id==='film/weird-kid')p={pre:'Chris Malinchak and Kiesza',name:'Weird Kid'};
  return '<a class="fp-card" href="#film/'+esc(w.slug)+'" data-open="'+esc(w.id)+'">'+
    '<span class="fp-cim"><img src="'+esc(still)+'" alt="" loading="lazy"></span>'+
    '<b>'+esc(p.name)+'</b>'+(p.pre?'<small>'+esc(p.pre)+'</small>':'')+
    (w.role?'<em>'+esc(w.role)+'</em>':'')+'</a>';
}
function paint(el,work,under){
  stop();
  var st=work.stills.slice(),p=parts(work.title);
  if(work.id==='film/weird-kid')p={pre:'Chris Malinchak and Kiesza',name:'Weird Kid'};
  var frames=st.map(function(s,i){return '<img src="'+esc(s)+'" alt=""'+(i===0?' class="on"':' loading="eager"')+'>'}).join('');
  var strip=st.map(function(s,i){return '<button type="button" aria-label="still '+(i+1)+'"'+(i===0?' class="on"':'')+'><img src="'+esc(s)+'" alt=""></button>'}).join('');
  var aw=(work.awards||[]).map(function(a){return '<li>'+esc(a)+'</li>'}).join('');
  var cr=(work.credits||[]).filter(function(c){return c&&c!==work.role}).map(function(c){return '<li>'+esc(c)+'</li>'}).join('');
  var next=FEAT.filter(function(id){return id!==work.id}).map(byId).filter(function(w){return w&&w.title}).map(card).join('');
  el.innerHTML='<div class="sheet film lv1 full fp'+(RM?' rm':'')+'">'+
    '<div class="fp-main"><div class="fp-stage"><div class="fp-spill" aria-hidden="true"></div>'+
      '<div class="heroframe fp-frame">'+frames+'</div>'+
      '<div class="fp-bar" aria-hidden="true"><i></i></div>'+
      '<div class="fp-strip" role="group" aria-label="stills">'+strip+'</div></div>'+
    '<div class="fp-meta">'+(p.pre?'<small class="fp-pre">'+esc(p.pre)+'</small>':'')+'<h3 class="fp-t">'+esc(p.name)+'</h3>'+
      (roleLine(work)?'<p class="fp-r">'+esc(roleLine(work))+'</p>':'')+
      (aw?'<ul class="fp-aw">'+aw+'</ul>':'')+(cr?'<ul class="fp-cr">'+cr+'</ul>':'')+'</div></div>'+
    (next?'<div class="fp-next"><p class="fp-lab">featured</p><div class="fp-cards">'+next+'</div></div>':'')+
    (under||'')+'</div>';
  FP.root=el.querySelector('.sheet.fp');FP.i=0;
  [].forEach.call(el.querySelectorAll('.fp-strip button'),function(b,i){
    b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();show(i);run()});
  });
  [].forEach.call(el.querySelectorAll('.fp-card[data-open]'),function(a){
    a.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();stop();if(window.__u1&&__u1.open)__u1.open(a.getAttribute('data-open'))});
  });
  show(0);run();
}
if(window.GJ_VAR)GJ_VAR.on(function(room){if(room==='film'&&FP.t&&FP.root&&FP.root.isConnected)run()});
window.GJ_FP={paint:paint,stop:stop,get state(){return {i:FP.i,on:!!FP.t,n:FP.root?FP.root.querySelectorAll('.fp-frame img').length:0}}};
})();
