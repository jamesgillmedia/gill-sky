/* C · Trail Line — the site is one walked trail, drawn in Gill's graphite. Five signed stops, each led by its strongest piece.
   Scroll / swipe = walk (nothing moves on its own). Tap a sign or its work = the stop opens from that sign.
   ‹ trail · Esc · Back · swipe right = back to that exact sign. Next stop › walks on. */
(function(){'use strict';if(G.V!=='C')return;
var d=document,app=d.getElementById('app'),R=G.R,el=G.el,img=G.img,esc=G.esc,D=G.D;
var STOPS=[{k:'spaces',lead:D.spaces[0].src,leadAr:D.spaces[0].w/D.spaces[0].h,sec:[D.spaces[1],D.spaces[3]]},
  {k:'film',lead:D.film[0].stills[0].src,leadAr:D.film[0].stills[0].w/D.film[0].stills[0].h,sec:[{src:D.film[1].stills[1].src,w:D.film[1].stills[1].w,h:D.film[1].stills[1].h}]},
  {k:'objects',lead:G.item('objects','crescent-rim-of-a-cup').src,leadAr:1,sec:[G.item('objects','stone-paper-cup'),G.item('objects','carved-spoon')]},
  {k:'photo',lead:G.item('photo','efb2a65e').src,leadAr:1.5,sec:[G.item('photo','5f537dc1'),G.item('photo','6a1d5ad8')]},
  {k:'about'}];
var walk=el('div','c-walk',null,app),land=el('div','c-land',null,walk);
var svgNS='http://www.w3.org/2000/svg',trail=d.createElementNS(svgNS,'svg');trail.setAttribute('class','c-trail');land.appendChild(trail);
var top=el('header','c-top','<a class="c-wm" href="#/">Gill James</a><span class="c-sub">a trail · five stops · Vancouver</span><button class="c-map" type="button">map</button>',app);
var prof=el('div','c-prof',null,app);prof.setAttribute('aria-label','trail profile: drag to walk');
var page=el('section','c-page',null,app);page.setAttribute('aria-label','stop');
var idx=G.index(function(r){var p=r.split('/'),k=p[0],id=p.slice(1).join('/');if(id){var vs=views(k);for(var j=0;j<vs.length;j++)if(vs[j].it.id===id){sel[k]=j;break}}R.go(k,{replace:true})});G.player();G.devToggle();
var PORT,LEN,SIGNS=[],openK=null,sel={};
function layout(){PORT=innerHeight>innerWidth*1.05;var W=innerWidth,H=innerHeight;land.innerHTML='';land.appendChild(trail);SIGNS=[];walk.classList.toggle('port',PORT);
  var gap=PORT?H*1.18:W*.92,start=PORT?H*.42:W*.42;LEN=start+gap*STOPS.length+(PORT?H*.3:W*.25);
  if(PORT){land.style.width=W+'px';land.style.height=LEN+'px'}else{land.style.width=LEN+'px';land.style.height=H+'px'}
  var pts=[];
  STOPS.forEach(function(s,i){var a=start+gap*i,side=i%2?1:-1,sx,sy;
    if(PORT){sx=W*(.5+side*.24);sy=a}else{sx=a;sy=H*(.5+side*.13)}SIGNS.push({x:sx,y:sy,pos:a,k:s.k});pts.push([sx,sy]);
    var g=el('div','c-stop',null,land);g.dataset.k=s.k;
    var sign=el('button','c-sign','<span class="no">0'+(i+1)+'</span><span class="nm">'+G.room(s.k).n+'</span>',g);sign.type='button';sign.dataset.k=s.k;sign.style.left=sx+'px';sign.style.top=sy+'px';
    var post=el('i','c-post',null,g);post.style.left=sx+'px';post.style.top=sy+'px';
    if(s.k==='about'){var t=el('button','c-aboutlead',null,g);t.type='button';t.dataset.k='about';t.innerHTML='<span class="q">'+D.poem.slice(0,3).map(esc).join('<br>')+'</span><span class="b">'+esc(D.bio[0].split('. ')[0])+'.</span>';
      if(PORT){t.style.cssText='left:'+(W*.1)+'px;top:'+(sy+90)+'px;width:'+(W*.8)+'px'}else{t.style.cssText='left:'+(sx-W*.05)+'px;top:'+(H*.2)+'px;width:'+(W*.34)+'px'}return}
    /* the stop's strongest piece: large, quiet, with room around it */
    var lw,lh,lx,ly;if(PORT){lw=W*.86;lh=lw/s.leadAr;if(lh>H*.5){lh=H*.5;lw=lh*s.leadAr}lx=(W-lw)/2;ly=sy+(70)}else{lh=H*(s.leadAr>1.3?.42:.5);lw=lh*s.leadAr;if(lw>W*.5){lw=W*.5;lh=lw/s.leadAr}lx=sx-lw*.35;ly=side<0?sy+70:sy-lh-70}
    var lead=el('button','c-lead',null,g);lead.type='button';lead.dataset.k=s.k;lead.style.cssText='left:'+lx+'px;top:'+ly+'px;width:'+lw+'px;height:'+lh+'px';img(s.lead,'',G.room(s.k).n,lead);
    var cap=el('div','c-cap',stopLine(s.k),g);cap.style.cssText=PORT?'left:'+lx+'px;top:'+(ly+lh+12)+'px;width:'+lw+'px':'left:'+(lx+lw+30)+'px;top:'+(side<0?ly+lh-60:ly)+'px;width:260px';
    (s.sec||[]).forEach(function(q,j){if(!q)return;var w2=(PORT?W*.36:H*.2)*(q.w>q.h?1.25:.8),h2=w2*q.h/q.w,x2,y2;
      if(PORT){x2=j%2?W*.08:W*.56;y2=ly+lh+70+j*30}else{x2=lx+lw+50+j*(w2*.5);y2=side<0?(sy-h2-60-j*40):(sy+60+j*40)}
      var e=el('button','c-sec',null,g);e.type='button';e.dataset.k=s.k;e.style.cssText='left:'+x2+'px;top:'+y2+'px;width:'+w2+'px;height:'+h2+'px';img(q.th||q.src,'',q.t||'',e)})});
  /* the path, hand-drawn: a graphite stroke textured with Gill's own drawing */
  var dd='M'+(PORT?W*.5:0)+','+(PORT?0:H*.5);var prev=PORT?[W*.5,0]:[0,H*.5];pts.concat([PORT?[W*.5,LEN]:[LEN,H*.5]]).forEach(function(p){var mx=(prev[0]+p[0])/2,my=(prev[1]+p[1])/2;
    dd+=PORT?' C'+prev[0]+','+my+' '+p[0]+','+my+' '+p[0]+','+p[1]:' C'+mx+','+prev[1]+' '+mx+','+p[1]+' '+p[0]+','+p[1];prev=p});
  var Wd=PORT?W:LEN,Hd=PORT?LEN:H;trail.setAttribute('width',Wd);trail.setAttribute('height',Hd);trail.setAttribute('viewBox','0 0 '+Wd+' '+Hd);
  trail.innerHTML='<defs><pattern id="gp" patternUnits="userSpaceOnUse" width="520" height="650"><image href="media/tex/graphite-b.webp" width="520" height="650" preserveAspectRatio="xMidYMid slice"/></pattern>'+
    '<filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter></defs>'+
    '<path d="'+dd+'" class="halo"/><path d="'+dd+'" class="tex" stroke="url(#gp)"/><path d="'+dd+'" class="core" filter="url(#rough)"/>';
  buildProfile();onWalk()}
function stopLine(k){if(k==='spaces')return '<i class="ct">'+esc(D.spaces[0].t)+'</i><span class="cm">'+esc(D.spiritEye.made)+'</span>';
  if(k==='film')return '<i class="ct">'+esc(D.film[0].t)+'</i><span class="cm">'+esc(D.film[0].role)+' · '+D.film[0].year+'</span>';
  if(k==='objects')return '<i class="ct">crescent rim of a cup</i><span class="cm">joio.co</span>';
  if(k==='photo')return '<span class="cm">'+D.photo.length+' photographs</span>';return''}
function buildProfile(){var w=PORT?innerWidth-150:Math.min(560,innerWidth*.4),pts=[];for(var i=0;i<=60;i++)pts.push((i/60*w).toFixed(1)+','+(11+6*Math.sin(i*.5)+3*Math.sin(i*1.7)).toFixed(1));
  prof.style.width=w+'px';prof.innerHTML='<svg width="'+w+'" height="24"><polyline points="'+pts.join(' ')+'"/></svg>'+SIGNS.map(function(s,i){return '<button class="nt" type="button" data-i="'+i+'" style="left:'+(posFrac(s.pos)*w)+'px" aria-label="stop '+(i+1)+' '+G.room(s.k).n+'">0'+(i+1)+'</button>'}).join('')+'<b class="here"></b>'}
function posFrac(p){var view=PORT?innerHeight:innerWidth;return Math.max(0,Math.min(1,(p-view/2)/(LEN-view)))}
function scrollPos(){return PORT?walk.scrollTop:walk.scrollLeft}
function setScroll(v,smooth){var o=PORT?{top:v}:{left:v};o.behavior=smooth?'smooth':'auto';walk.scrollTo(o)}
function onWalk(){var view=PORT?innerHeight:innerWidth,f=scrollPos()/Math.max(1,LEN-view),h=prof.querySelector('.here');if(h)h.style.left=(f*prof.clientWidth)+'px';
  var c=scrollPos()+view/2;land.querySelectorAll('.c-stop').forEach(function(g,i){g.classList.toggle('near',Math.abs(SIGNS[i].pos-c)<view*.75)})}
walk.addEventListener('scroll',onWalk,{passive:true});
/* desktop: vertical wheel walks sideways, settling softly */
var target=null,wr=0;walk.addEventListener('wheel',function(e){if(PORT||openK)return;e.preventDefault();var dlt=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
  target=Math.max(0,Math.min(LEN-innerWidth,(target==null?walk.scrollLeft:target)+dlt*1.1));if(!wr)(function step(){var cur=walk.scrollLeft,dx=target-cur;if(Math.abs(dx)<.5){walk.scrollLeft=target;wr=0;target=null;return}walk.scrollLeft=cur+dx*.18;wr=requestAnimationFrame(step)})()},{passive:false});
prof.addEventListener('pointerdown',function(e){var nt=e.target.closest('.nt');if(nt){goSign(+nt.dataset.i,true);return}scrub(e);prof.setPointerCapture(e.pointerId);prof.onpointermove=scrub;prof.onpointerup=function(){prof.onpointermove=null}});
function scrub(e){var r=prof.getBoundingClientRect(),f=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),view=PORT?innerHeight:innerWidth;setScroll(f*(LEN-view))}
function goSign(i,smooth){var view=PORT?innerHeight:innerWidth;setScroll(SIGNS[i].pos-view/2,smooth)}
/* ---------- stop page: opens out of its sign like a print unfolding into light ---------- */
function views(k){if(k==='spaces'){var v=[];D.spaces.forEach(function(s){v.push({src:s.src,th:s.th,w:s.w,h:s.h,it:s});s.views.forEach(function(x){v.push({src:x.src,th:x.src,w:x.w,h:x.h,it:s})})});return v}
  if(k==='film'){var f=[];D.film.forEach(function(m){m.stills.forEach(function(s){f.push({src:s.src,th:s.th,w:s.w,h:s.h,it:m})})});return f}
  return G.room(k).items.map(function(it){return{src:it.src,th:it.th,w:it.w,h:it.h,it:it}})}
function fillPage(k){var i=STOPS.findIndex(function(s){return s.k===k}),nx=STOPS[(i+1)%STOPS.length];page.dataset.k=k;
  var h='<button class="c-back" type="button">‹ trail</button><span class="c-where">stop 0'+(i+1)+' · '+G.room(k).n.toLowerCase()+'</span>';
  if(k==='about'){h+='<div class="c-about"><div class="bio"><p class="lede">'+esc(D.bio[0])+'</p>'+D.bio.slice(1).map(function(p){return '<p>'+esc(p)+'</p>'}).join('')+'<p class="mail"><a href="mailto:'+esc(D.email)+'">'+esc(D.email)+'</a></p></div><div class="poem">'+D.poem.map(esc).join('<br>')+'</div></div>'}
  else{h+='<figure class="c-hero"></figure><div class="c-info"></div><div class="c-side"><svg class="c-sidepath"></svg><div class="c-views"></div></div>'}
  h+='<button class="c-next" type="button" data-k="'+(i<STOPS.length-1?nx.k:'')+'">'+(i<STOPS.length-1?'next stop · 0'+(i+2)+' '+G.room(nx.k).n.toLowerCase()+' ›':'back to the trailhead ›')+'</button>';
  page.innerHTML=h;page.scrollTop=0;if(k==='about')return;
  var vs=views(k),vEl=page.querySelector('.c-views');vs.forEach(function(v,j){var b=el('button','c-v',null,vEl);b.type='button';b.dataset.j=j;b.style.aspectRatio=v.w+'/'+v.h;img(v.th,'',v.it.t||'',b)});
  show(k,sel[k]||0,true)}
function show(k,j,instant){var vs=views(k);j=(j+vs.length)%vs.length;sel[k]=j;var v=vs[j],hero=page.querySelector('.c-hero'),info=page.querySelector('.c-info');if(!hero)return;
  var old=hero.querySelector('img'),im=img(v.src,'',v.it.t||'photograph',hero);if(v.w<600){im.classList.add('small');im.style.setProperty('--mw',(v.w*1.6)+'px')}if(old){old.classList.add('out');setTimeout(function(){old.remove()},1200)}
  info.innerHTML=G.caption(v.it,true);page.querySelectorAll('.c-v').forEach(function(b){b.classList.toggle('on',+b.dataset.j===j)})}
function openStop(k,fromEl,instant){openK=k;d.body.classList.add('c-open');fillPage(k);page.classList.add('on');var r=fromEl?fromEl.getBoundingClientRect():null;
  if(instant||!r){page.style.clipPath='none';page.style.opacity=1;return}
  var cx=r.left+r.width/2,cy=r.top+r.height/2,R0=Math.hypot(Math.max(cx,innerWidth-cx),Math.max(cy,innerHeight-cy));
  G.tween(950,function(e){page.style.clipPath='circle('+(8+R0*e).toFixed(1)+'px at '+cx.toFixed(0)+'px '+cy.toFixed(0)+'px)';page.style.opacity=Math.min(1,e*2.2).toFixed(3)},function(){page.style.clipPath='none'})}
var toHead=false;
function closeStop(instant){if(!openK)return;var k=openK;openK=null;d.body.classList.remove('c-open');var i=STOPS.findIndex(function(s){return s.k===k});if(toHead){toHead=false;setScroll(0,false);i=0}else goSign(i,false);
  var sg=land.querySelectorAll('.c-sign')[i],r=sg.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R0=Math.hypot(Math.max(cx,innerWidth-cx),Math.max(cy,innerHeight-cy));
  if(instant){page.classList.remove('on');return}
  G.tween(900,function(e){page.style.clipPath='circle('+(8+R0*(1-e)).toFixed(1)+'px at '+cx.toFixed(0)+'px '+cy.toFixed(0)+'px)'},function(){page.classList.remove('on');page.style.clipPath='none'});
  sg.classList.add('back');setTimeout(function(){sg.classList.remove('back')},2400)}
R.on(function(route,prev,how){if(route==='index'){idx.classList.add('open');return}idx.classList.remove('open');
  var k=route.split('/')[0];if(k&&!G.room(k)){R.go('',{replace:true});return}
  if(!k){closeStop(how==='load');return}
  if(openK&&openK!==k){fillPage(k);openK=k;page.scrollTop=0;var i=STOPS.findIndex(function(s){return s.k===k});goSign(i,false);return}
  if(!openK){var i2=STOPS.findIndex(function(s){return s.k===k});if(how!=='load'&&!lastFrom)goSign(i2,false);openStop(k,lastFrom||land.querySelector('.c-sign[data-k="'+k+'"]'),how==='load');lastFrom=null}});
var lastFrom=null;
land.addEventListener('click',function(e){var t=e.target.closest('.c-sign,.c-lead,.c-sec,.c-aboutlead');if(!t)return;lastFrom=t;R.go(t.dataset.k)});
page.addEventListener('click',function(e){if(e.target.closest('.c-back')){R.up();return}var n=e.target.closest('.c-next');if(n){if(n.dataset.k)R.go(n.dataset.k,{replace:true});else{toHead=true;R.home()}return}
  var v=e.target.closest('.c-v');if(v){show(openK,+v.dataset.j);if(PORT)page.scrollTo({top:0,behavior:'smooth'});return}if(e.target.closest('.c-hero'))show(openK,(sel[openK]||0)+1)});
top.addEventListener('click',function(e){if(e.target.closest('.c-map')){R.go('index');return}if(e.target.closest('.c-wm')){e.preventDefault();if(R.cur){toHead=true;R.home()}else setScroll(0,true)}});
d.addEventListener('keydown',function(e){if(openK){if(e.key==='ArrowRight')show(openK,(sel[openK]||0)+1);if(e.key==='ArrowLeft')show(openK,(sel[openK]||0)-1);return}
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'||e.key==='ArrowDown'||e.key==='ArrowUp'){var view=PORT?innerHeight:innerWidth,c=scrollPos()+view/2,dir=(e.key==='ArrowRight'||e.key==='ArrowDown')?1:-1,i=0,bd=1e9;
    SIGNS.forEach(function(s,j){var dd=Math.abs(s.pos-c);if(dd<bd){bd=dd;i=j}});var cur=SIGNS[i].pos-c;i=dir>0?(cur>20?i:i+1):(cur<-20?i:i-1);i=Math.max(0,Math.min(SIGNS.length-1,i));e.preventDefault();goSign(i,true)}});
/* pinch: spread over a work on the trail opens its stop from the touched point; spread over a view shows it; pinch closed on a stop returns to its sign */
function pinch(tg,onOut,onIn){var p0=null;tg.addEventListener('touchstart',function(e){if(e.touches.length===2){var a=e.touches[0],b=e.touches[1];p0={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2,done:false}}},{passive:true});
  tg.addEventListener('touchmove',function(e){if(!p0||p0.done||e.touches.length<2)return;var a=e.touches[0],b=e.touches[1],dd=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    if(dd>p0.d*1.35){p0.done=true;onOut&&onOut(p0)}else if(dd<p0.d*.72){p0.done=true;onIn&&onIn(p0)}},{passive:true});
  tg.addEventListener('touchend',function(e){if(!e.touches.length)p0=null},{passive:true})}
pinch(walk,function(m){var t=d.elementFromPoint(m.x,m.y),w=t&&t.closest('.c-sign,.c-lead,.c-sec,.c-aboutlead,.c-stop');if(!w){var best=null,bd=1e9;land.querySelectorAll('.c-sign').forEach(function(sg){var r=sg.getBoundingClientRect(),dd=Math.hypot(r.left+r.width/2-m.x,r.top+r.height/2-m.y);if(dd<bd){bd=dd;best=sg}});w=best}
  if(!w)return;var k=w.dataset.k||(w.closest('.c-stop')&&w.closest('.c-stop').dataset.k);if(!k)return;lastFrom={getBoundingClientRect:function(){return{left:m.x-4,top:m.y-4,width:8,height:8}}};R.go(k)},null);
pinch(page,function(m){var t=d.elementFromPoint(m.x,m.y),v=t&&t.closest('.c-v');if(v)show(openK,+v.dataset.j)},function(){if(openK)R.up()});
G.swipe(page,function(dir,st){if(dir==='right')R.up();else if(dir==='left'){var h=page.querySelector('.c-hero');if(h){var r=h.getBoundingClientRect();if(st.y>r.top&&st.y<r.bottom){show(openK,(sel[openK]||0)+1);return}}}});
G.swipe(idx,function(dir){if(dir==='down'||dir==='right')R.up()});
var rz=0;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){var f=scrollPos()/Math.max(1,LEN-(PORT?innerHeight:innerWidth));layout();setScroll(f*(LEN-(PORT?innerHeight:innerWidth)))},150)});
layout();R.start();
})();
