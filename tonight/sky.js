/* One sky. The opener's last stage is the constellation field (4:45 canvas and positions).
   A room is the last zoom of its star. Pinch-out, back and Esc each go out one level.
   Reduce Motion lands on the same states with no in-between. Nothing auto-advances. */
(function(){
'use strict';
var D=window.CB;
if(!D)return;
var cv=document.getElementById('c'), g=cv.getContext('2d');
var WHERE=document.getElementById('where'), HINT=document.getElementById('hint');
var WATER=document.getElementById('water'), MOON=document.getElementById('jmoon');
var MENU=document.getElementById('menu'), SHEET=document.getElementById('sheet');
var ROOM=document.getElementById('room'), ROOMIN=document.getElementById('roomIn');
var BACK=document.getElementById('back');
var W=0,H=0,DPR=1,PORT=true;
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',function(e){RM=e.matches})}catch(err){}

function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,u){return a+(b-a)*u}
function sstep(a,b,v){var u=clamp((v-a)/(b-a),0,1);return u*u*(3-2*u)}
function seeded(seed){var s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function now(){return performance.now()}
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

function glowSprite(rgb){var c=document.createElement('canvas');c.width=c.height=64;var q=c.getContext('2d'),gr=q.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba('+rgb+',.9)');gr.addColorStop(.2,'rgba('+rgb+',.35)');gr.addColorStop(1,'rgba('+rgb+',0)');q.fillStyle=gr;q.fillRect(0,0,64,64);return c}
var GW=glowSprite('205,225,255'), GLOW={};
D.chapters.forEach(function(c){GLOW[c.k]=glowSprite(c.tint)});

var FIG_W=220,FIG_H=110;
var MARK=[],CH=D.chapters,WORKS=[],BOX=null;
var POEM=['Artistry a starfield','I chase'];

function layoutChapters(){
  var P=PORT?{mark:[0,-300],film:[-80,-156],photo:[80,-28],objects:[-80,100],spaces:[80,228],about:[-80,356],sound:[80,484],box:[-200,-400,200,572]}
           :{mark:[-420,-30],film:[-150,-120],photo:[120,-140],objects:[-140,118],spaces:[130,100],about:[400,-110],sound:[410,128],box:[-590,-230,590,230]};
  BOX=P.box;return P}
function build(){
  var P=layoutChapters(),r=seeded(7);
  MARK=[];var ms=.55,segs=[],tot=0;
  D.strokes.forEach(function(s){for(var j=1;j<s.length;j++){var a=s[j-1],b=s[j],l=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push({a:a,b:b,l:l});tot+=l}});
  var NM=64;for(var i=0;i<NM;i++){var t=(i+.5)/NM*tot,acc=0;for(var k=0;k<segs.length;k++){var sg=segs[k];if(acc+sg.l>=t){var u=(t-acc)/sg.l;MARK.push({x:P.mark[0]+lerp(sg.a[0],sg.b[0],u)*ms,y:P.mark[1]+lerp(sg.a[1],sg.b[1],u)*ms,b:.45+r()*.55,ph:r()*6.28});break}acc+=sg.l}}
  MARK.cx=P.mark[0];MARK.cy=P.mark[1];MARK.sc=ms;
  WORKS=[];
  var DEP={film:1.10,photo:.92,objects:1.04,spaces:1.07,about:.95,sound:.88};
  CH.forEach(function(c,ci){var cen=P[c.k];c.cx=cen[0];c.cy=cen[1];c.stars=[];c.edges=c.sh.e;c.z=DEP[c.k]||1;
    c.sh.s.forEach(function(s){c.stars.push({x:c.cx+(s[0]-.5)*FIG_W,y:c.cy+(s[1]-.5)*FIG_H,b:s[2],stray:!!s[3],ph:r()*6.28,z:c.z+(r()-.5)*.08})});
    var n=c.works.length,anchors=c.stars.map(function(s,ii){return ii}).filter(function(ii){return !c.stars[ii].stray}).sort(function(a,b){return c.stars[b].b-c.stars[a].b});
    var dmin=Math.sqrt(FIG_W*FIG_H/(Math.max(n,anchors.length)*2.1)),pts=[];
    c.stars.forEach(function(s){pts.push([s.x,s.y])});
    c.card=Math.min(9,dmin*.36);
    var rr=seeded(31+ci*17);
    c.works.forEach(function(w,wi){var x,y;
      if(wi<anchors.length&&wi<n){var s=c.stars[anchors[wi]];x=s.x;y=s.y;s.work=wi;w.anchor=1}
      else{var tries=0,best=null,bd=-1;while(tries++<400){var px=c.cx+(rr()-.5)*FIG_W*1.06,py=c.cy+(rr()-.5)*FIG_H*1.2,dm=1e9;
          for(var q=0;q<pts.length;q++){var dd=Math.hypot(pts[q][0]-px,pts[q][1]-py);if(dd<dm)dm=dd}
          if(dm>bd){bd=dm;best=[px,py]}if(dm>dmin)break}x=best[0];y=best[1];pts.push(best)}
      w.x=x;w.y=y;w.c=c;w.i=wi;w.ph=rr()*6.28;w.z=w.anchor?c.stars[anchors[wi]].z:c.z+(rr()-.5)*.1;
      var ar=w.ar||(w.kind==='track'?2.4:w.kind==='poem'?0.8:1.5);w.ar=ar;
      w.cw=ar>=1?c.card:c.card*ar;w.chh=ar>=1?c.card/ar:c.card;
      WORKS.push(w)})});
  var bw=BOX[2]-BOX[0],bh=BOX[3]-BOX[1],rf=seeded(11);
  FIELD=[];for(i=0;i<700;i++)FIELD.push({x:BOX[0]-bw*.6+rf()*bw*2.2,y:BOX[1]-bh*.6+rf()*bh*2.2,z:.22+Math.pow(rf(),1.6)*.65,b:rf()<.08?0.8:.3+rf()*.4,ph:rf()*6.28});
}
var FIELD=[];

var cam={x:0,y:0,s:1},S0=1,glide=null;
function fitCam(){var bw=BOX[2]-BOX[0],bh=BOX[3]-BOX[1],top=56,bot=48;S0=Math.min(W/bw,(H-top-bot)/bh)*.96;
  return {x:(BOX[0]+BOX[2])/2,y:(BOX[1]+BOX[3])/2-(top-bot)/2/S0,s:S0}}
function zf(){return cam.s/S0}
function proj(x,y,z,o){o=o||[0,0,0];var s=cam.s;o[0]=W/2+(x-cam.x)*s;o[1]=H/2+(y-cam.y)*s;o[2]=s;return o}
function glideTo(tx,ty,ts,ms){ts=Math.max(ts,S0*.98);
  if(RM){glide=null;cam.x=tx;cam.y=ty;cam.s=ts;return}
  glide={x0:cam.x,y0:cam.y,s0:cam.s,x1:tx,y1:ty,s1:ts,t0:now(),ms:ms==null?880:ms}}
function stepGlide(t){var G=glide;if(!G)return;
  if(RM||G.ms<=0){cam.x=G.x1;cam.y=G.y1;cam.s=G.s1;glide=null;return}
  var p=clamp((t-G.t0)/G.ms,0,1),e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
  var s=G.s0*Math.pow(G.s1/Math.max(1e-6,G.s0),e),k=Math.abs(G.s1-G.s0)<1e-6?e:(s-G.s0)/(G.s1-G.s0);
  cam.s=s;cam.x=lerp(G.x0,G.x1,k);cam.y=lerp(G.y0,G.y1,k);if(p>=1)glide=null}

function chapter(k){for(var i=0;i<CH.length;i++)if(CH[i].k===k)return CH[i];return CH[0]}
function work(lv){var c=chapter(lv.ch);return c.works[lv.i]}
function clusterS(){return Math.min(W*.9/FIG_W,(H-110)*.88/FIG_H)}
function starS(w){var m=Math.min(W,H);return m*.62/Math.max(w.cw,w.chh)}

/* opener progress, then the field is the top of the sky */
var T=0,P=0,sky=false,stack=[{k:'far'}],sel=null;
var STAGES=[0,.33,.63,1];
function nextStage(t){for(var i=0;i<STAGES.length;i++)if(STAGES[i]>t+.02)return STAGES[i];return 1}
function prevStage(t){for(var i=STAGES.length-1;i>=0;i--)if(STAGES[i]<t-.02)return STAGES[i];return 0}
function top(){return stack[stack.length-1]}
function atFar(){return sky&&stack.length===1&&top().k==='far'}

function lockField(){if(sky)return;sky=true;stack=[{k:'far'}];sel=null;var c=fitCam();
  if(RM){cam.x=c.x;cam.y=c.y;cam.s=c.s;glide=null}else glideTo(c.x,c.y,c.s,700);
  chrome()}
function advanceOpener(){if(sky)return;T=nextStage(T);if(T>=1&&RM){P=1;lockField()}firstTouch()}
function openerBack(){if(sky)return;T=prevStage(T)}

function enterCluster(c){sel={kind:'ch',ch:c.k};stack.push({k:'cluster',ch:c.k});var fs=clusterS();glideTo(c.cx,c.cy,fs,860);chrome()}
function enterStar(w){sel={kind:'w',ch:w.c.k,i:w.i};stack.push({k:'star',ch:w.c.k,i:w.i});glideTo(w.x,w.y,starS(w),900);chrome()}
function enterRoom(w){sel={kind:'w',ch:w.c.k,i:w.i};
  if(top().k!=='room')stack.push({k:'room',ch:w.c.k,i:w.i});
  fillRoom(w);showRoom(w);chrome()}
function applyLevel(lv,instant){hideRoom();
  if(lv.k==='far'){var c=fitCam();if(instant||RM){glide=null;cam.x=c.x;cam.y=c.y;cam.s=c.s}else glideTo(c.x,c.y,c.s,800)}
  else if(lv.k==='cluster'){var C=chapter(lv.ch);sel={kind:'ch',ch:lv.ch};var fs=clusterS();if(instant||RM){glide=null;cam.x=C.cx;cam.y=C.cy;cam.s=fs}else glideTo(C.cx,C.cy,fs,800)}
  else if(lv.k==='star'||lv.k==='room'){var w=work(lv);sel={kind:'w',ch:lv.ch,i:lv.i};var ts=starS(w);
    if(instant||RM){glide=null;cam.x=w.x;cam.y=w.y;cam.s=ts}else glideTo(w.x,w.y,ts,800);
    if(lv.k==='room'){fillRoom(w);showRoom(w)}}
  chrome()}
function stepOut(){
  if(!MENU.hidden){MENU.hidden=true;chrome();return}
  if(!SHEET.hidden){SHEET.hidden=true;SHEET.innerHTML='';chrome();return}
  if(!sky){openerBack();chrome();return}
  if(stack.length<=1)return;
  stack.pop();applyLevel(top(),false)}
function goFar(){hideRoom();SHEET.hidden=true;SHEET.innerHTML='';MENU.hidden=true;sky=true;T=1;P=1;stack=[{k:'far'}];sel=null;applyLevel(top(),false)}
function zoomInAt(x,y){
  firstTouch();
  if(!sky){advanceOpener();return}
  var lv=top();
  if(lv.k==='room')return;
  if(lv.k==='far'){var c=hitChapter(x,y);if(!c)return;enterCluster(c);return}
  if(lv.k==='cluster'){var w=hitWork(x,y);if(!w||w.c.k!==lv.ch)return;enterStar(w);return}
  if(lv.k==='star'){enterRoom(work(lv));return}
}
function tap(x,y){
  firstTouch();
  if(!sky){advanceOpener();return}
  var lv=top();
  if(lv.k==='room')return;
  if(lv.k==='far'){var c=hitChapter(x,y);if(!c){sel=null;chrome();return}
    if(sel&&sel.kind==='ch'&&sel.ch===c.k){enterCluster(c);return}
    sel={kind:'ch',ch:c.k};chrome();return}
  if(lv.k==='cluster'){var w=hitWork(x,y);if(!w||w.c.k!==lv.ch){sel=null;chrome();return}
    if(sel&&sel.kind==='w'&&sel.ch===w.c.k&&sel.i===w.i){enterStar(w);return}
    sel={kind:'w',ch:w.c.k,i:w.i};chrome();return}
  if(lv.k==='star'){enterRoom(work(lv));return}
}
function zoomInSelected(){
  firstTouch();
  if(!sky){advanceOpener();return}
  var lv=top();
  if(lv.k==='far'){if(sel&&sel.kind==='ch')enterCluster(chapter(sel.ch));return}
  if(lv.k==='cluster'){if(sel&&sel.kind==='w'&&sel.ch===lv.ch)enterStar(work(sel));return}
  if(lv.k==='star')enterRoom(work(lv));
}
function arrow(k){
  if(!sky){if(k==='ArrowRight'||k==='ArrowUp')advanceOpener();else openerBack();chrome();return}
  var lv=top();if(lv.k==='room'||lv.k==='far')return;
  var d=70/cam.s;glide=null;
  cam.x+=(k==='ArrowRight'?d:k==='ArrowLeft'?-d:0);
  cam.y+=(k==='ArrowDown'?d:k==='ArrowUp'?-d:0);
  clampSoft()}
function clampSoft(){var lv=top();var cx,cy,lim;
  if(lv.k==='cluster'){var c=chapter(lv.ch);cx=c.cx;cy=c.cy;lim=150}
  else if(lv.k==='star'){var w=work(lv);cx=w.x;cy=w.y;lim=90}
  else return;
  cam.x=clamp(cam.x,cx-lim,cx+lim);cam.y=clamp(cam.y,cy-lim,cy+lim)}

var labelHits=[];
function hitChapter(x,y){
  var i,best=null,bd=1e9;
  for(i=0;i<labelHits.length;i++){var r=labelHits[i];if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)return r.ch}
  if(!atFar()&&top().k!=='far')return null;
  for(i=0;i<CH.length;i++){var c=CH[i],o=proj(c.cx,c.cy,1),rx=FIG_W*cam.s*.28,ry=FIG_H*cam.s*.32;
    if(rx<8)continue;var nx=(x-o[0])/rx,ny=(y-o[1])/ry,d=nx*nx+ny*ny;if(d<=1&&d<bd){bd=d;best=c}}
  return best}
function showMeta(w){
  var m=w.meta;
  if(m==='portrait'||m==='landscape'||m==='square')m='';
  return [w.role,w.sub,m].filter(Boolean).join(' · ')}
function hitWork(x,y){
  var i,r;
  for(i=0;i<labelHits.length;i++){r=labelHits[i];
    if(r.work&&x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)return r.work}
  var lv=top(),list=[];
  for(i=0;i<WORKS.length;i++){var w=WORKS[i];if(!w._scr)continue;
    if(lv.k==='cluster'&&w.c.k!==lv.ch)continue;
    if(lv.k==='star'&&(w.c.k!==lv.ch||w.i!==lv.i))continue;
    if(lv.k==='far'||lv.k==='room')continue;
    list.push({w:w,d:Math.hypot(w._scr[0]-x,w._scr[1]-y)})}
  list.sort(function(a,b){return a.d-b.d});
  if(!list.length)return null;
  var reach=Math.max(26,(list[0].w._scr[2]||0)*.7);
  if(list[0].d>reach)return null;
  if(list[1]&&list[0].d>list[1].d*.45&&list[1].d<reach*1.4)return null;
  return list[0].w}

/* ---------- room ---------- */
function fillRoom(w){
  var h='';
  if(w.t)h+='<h2>'+esc(w.t)+'</h2>';
  var meta=showMeta(w);if(meta)h+='<p>'+esc(meta)+'</p>';
  if(w.year&&String(w.meta||'').indexOf(String(w.year))<0&&meta.indexOf(String(w.year))<0)h+='<p>'+esc(w.year)+'</p>';
  var src=w.lead||w.img;if(src)h+='<img src="'+esc(src)+'" alt="'+(w.t?esc(w.t):'')+'">';
  if(w.kind==='track'&&w.peaks&&w.peaks.length){h+='<div class="wave">';w.peaks.forEach(function(p){h+='<i style="height:'+Math.round(6+p*36)+'px"></i>'});h+='</div>'}
  if(w.lines&&w.lines.length){h+='<div class="poem">';w.lines.forEach(function(l){h+='<p>'+esc(l)+'</p>'});h+='</div>'}
  if(w.credits&&w.credits.length){h+='<div class="cred">';w.credits.forEach(function(l){h+='<p>'+esc(l)+'</p>'});h+='</div>'}
  if(w.strip&&w.strip.length){h+='<div class="line">';w.strip.forEach(function(s){h+='<img src="'+esc(s)+'" alt="">'});h+='</div>'}
  ROOMIN.innerHTML=h}
function showRoom(w){
  var o=proj(w.x,w.y,1);
  ROOM.style.transformOrigin=o[0]+'px '+o[1]+'px';
  ROOM.hidden=false;ROOM.scrollTop=0;
  if(RM){ROOM.classList.add('on');return}
  ROOM.classList.remove('on');
  requestAnimationFrame(function(){requestAnimationFrame(function(){ROOM.classList.add('on')})})}
function hideRoom(){ROOM.classList.remove('on');ROOM.hidden=true;ROOMIN.innerHTML=''}

function crumb(){
  if(!sky)return '';
  var lv=top();
  if(lv.k==='far')return 'field';
  var c=chapter(lv.ch),w=lv.i!=null?work(lv):null;
  if(lv.k==='cluster')return c.nm;
  var name=w&&w.t?w.t:'';
  return name?c.nm+' · '+name:c.nm}
function canOut(){if(!MENU.hidden||!SHEET.hidden)return true;if(!sky)return T>.02;return stack.length>1}
function chrome(){WHERE.textContent=crumb();BACK.hidden=!canOut();
  document.getElementById('hire').setAttribute('aria-expanded',SHEET.classList.contains('hire')&&!SHEET.hidden?'true':'false')}
function firstTouch(){HINT.classList.add('gone')}
function openSheet(kind,html){MENU.hidden=true;SHEET.className=kind;SHEET.innerHTML=html;SHEET.hidden=false;SHEET.scrollTop=0;chrome()}
function contactText(){var c=chapter('about');for(var i=0;i<c.works.length;i++)if(c.works[i].kind==='contact')return c.works[i].t;return ''}
function openList(){var h='';CH.forEach(function(c){h+='<p class="ch">'+esc(c.nm)+'</p><p class="ct">'+esc(c.count)+'</p>';
  c.works.forEach(function(w){if(!w.t)return;h+='<button type="button" data-ch="'+c.k+'" data-i="'+w.i+'">'+esc(w.t)+'</button>'})});
  openSheet('list',h)}
function openContact(){openSheet('contact','<p class="h">contact</p><p><a href="mailto:'+esc(contactText())+'">'+esc(contactText())+'</a></p>')}
function openHire(){if(!SHEET.hidden&&SHEET.classList.contains('hire')){SHEET.hidden=true;chrome();return}
  openSheet('hire','<p class="h">Hire</p><p>Film, objects, space and sound.</p><p><a href="mailto:'+esc(contactText())+'">'+esc(contactText())+'</a></p>')}
function goReel(){var c=chapter('film'),i=0;for(var k=0;k<c.works.length;k++)if(c.works[k].slug==='demo-reel'){i=k;break}
  sky=true;T=1;P=1;hideRoom();SHEET.hidden=true;MENU.hidden=true;
  stack=[{k:'far'},{k:'cluster',ch:'film'},{k:'star',ch:'film',i:i}];applyLevel(top(),false)}

document.getElementById('home').addEventListener('click',function(e){e.stopPropagation();
  if(!sky||!atFar()){goFar();return}
  MENU.hidden=!MENU.hidden;if(!MENU.hidden){SHEET.hidden=true}chrome()});
document.getElementById('mlist').addEventListener('click',function(e){e.stopPropagation();openList()});
document.getElementById('mcontact').addEventListener('click',function(e){e.stopPropagation();openContact()});
document.getElementById('reel').addEventListener('click',function(e){e.stopPropagation();goReel()});
document.getElementById('hire').addEventListener('click',function(e){e.stopPropagation();openHire()});
BACK.addEventListener('click',function(e){e.stopPropagation();stepOut()});
SHEET.addEventListener('click',function(e){var b=e.target.closest('button[data-ch]');if(!b)return;
  var w=chapter(b.getAttribute('data-ch')).works[+b.getAttribute('data-i')];
  sky=true;T=1;P=1;SHEET.hidden=true;MENU.hidden=true;
  stack=[{k:'far'},{k:'cluster',ch:w.c.k},{k:'star',ch:w.c.k,i:w.i}];applyLevel(top(),false)});

/* ---------- input: touch pinch is its own path; mouse click acts as a tap ---------- */
var pinch=null,tapS=null,moved=0,drag=null,wheelT=0,gLock=false;
function chromeTarget(el){return el&&el.closest&&el.closest('#bar,#menu,#sheet')}
document.addEventListener('touchstart',function(e){
  if(chromeTarget(e.target)&&e.touches.length<2)return;
  if(e.touches.length===1){var t=e.touches[0];tapS={x:t.clientX,y:t.clientY,t:now()};moved=0;pinch=null;
    drag={x:t.clientX,y:t.clientY,moved:0};glide=null}
  else if(e.touches.length>=2){var a=e.touches[0],b=e.touches[1];
    pinch={d0:Math.max(12,Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)),ratio:1,x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2};
    tapS=null;drag=null;gLock=true;e.preventDefault()}},{passive:false});
document.addEventListener('touchmove',function(e){
  if(e.touches.length>=2&&pinch){var a=e.touches[0],b=e.touches[1];
    pinch.ratio=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/pinch.d0;
    pinch.x=(a.clientX+b.clientX)/2;pinch.y=(a.clientY+b.clientY)/2;e.preventDefault();return}
  if(gLock)return;
  if(e.touches.length===1&&drag&&top().k!=='room'){var t=e.touches[0],dx=t.clientX-drag.x,dy=t.clientY-drag.y;
    drag.x=t.clientX;drag.y=t.clientY;drag.moved+=Math.abs(dx)+Math.abs(dy);moved=drag.moved;
    if(drag.moved<8)return;
    if(sky&&(top().k==='cluster'||top().k==='star')){cam.x-=dx/cam.s;cam.y-=dy/cam.s;clampSoft()}}},{passive:false});
document.addEventListener('touchend',function(e){
  if(e.touches.length===0){gLock=false;
    if(pinch){var r=pinch.ratio,x=pinch.x,y=pinch.y;pinch=null;if(r>1.12)zoomInAt(x,y);else if(r<.88)stepOut()}
    else if(tapS&&moved<14&&now()-tapS.t<450&&!chromeTarget(e.target))tap(tapS.x,tapS.y);
    tapS=null;drag=null}
  else if(pinch&&e.touches.length<2){var r2=pinch.ratio,x2=pinch.x,y2=pinch.y;pinch=null;gLock=false;if(r2>1.12)zoomInAt(x2,y2);else if(r2<.88)stepOut()}},{passive:true});
document.addEventListener('touchcancel',function(){pinch=null;tapS=null;drag=null;gLock=false});

cv.addEventListener('pointerdown',function(e){if(e.pointerType==='touch')return;if(chromeTarget(e.target))return;
  cv.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:0,t:now()};glide=null;firstTouch()});
cv.addEventListener('pointermove',function(e){if(e.pointerType==='touch'||!drag||drag.id!==e.pointerId)return;
  var dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;drag.moved+=Math.abs(dx)+Math.abs(dy);
  if(drag.moved<6)return;if(sky&&(top().k==='cluster'||top().k==='star')){cam.x-=dx/cam.s;cam.y-=dy/cam.s;clampSoft()}});
cv.addEventListener('pointerup',function(e){if(e.pointerType==='touch'||!drag||drag.id!==e.pointerId)return;
  var was=drag;drag=null;if(was.moved<8&&now()-was.t<500)tap(e.clientX,e.clientY)});
addEventListener('wheel',function(e){if(chromeTarget(e.target)&&SHEET.contains(e.target)&&!e.ctrlKey)return;
  e.preventDefault();if(now()-wheelT<320)return;wheelT=now();firstTouch();
  if(e.deltaY<0)zoomInAt(e.clientX,e.clientY);else stepOut()},{passive:false});
['gesturestart','gesturechange'].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});
addEventListener('keydown',function(e){if(e.metaKey||e.ctrlKey||e.altKey)return;var k=e.key;
  if(e.target.closest&&e.target.closest('button,a,input')&&k!=='Escape')return;
  if(k==='Escape'){e.preventDefault();stepOut()}
  else if(k==='+'||k==='='){e.preventDefault();zoomInSelected()}
  else if(k==='-'||k==='_'){e.preventDefault();stepOut()}
  else if(k==='Enter'){e.preventDefault();zoomInSelected()}
  else if(k.indexOf('Arrow')===0){e.preventDefault();arrow(k)}});
addEventListener('popstate',function(){stepOut();try{history.pushState({s:1},'')}catch(err){}});

/* ---------- draw ---------- */
var IMG={};function img(src){if(!src)return null;var m=IMG[src];if(!m){m=IMG[src]=new Image();m.decoding='async';m.src=src}return m.complete&&m.naturalWidth?m:null}
function dot(x,y,rad,a,glow){if(a<.02)return;var gs=rad*8;g.globalAlpha=a*.7;g.drawImage(glow||GW,x-gs/2,y-gs/2,gs,gs);g.globalAlpha=a;g.fillStyle='#e7eef6';g.beginPath();g.arc(x,y,rad,0,6.29);g.fill()}
function wrap(text,maxW,maxLines){var words=String(text).split(' '),lines=[],cur='';
  words.forEach(function(wd){var t=cur?cur+' '+wd:wd;if(g.measureText(t).width>maxW&&cur){lines.push(cur);cur=wd}else cur=t});
  if(cur)lines.push(cur);if(lines.length>maxLines){lines=lines.slice(0,maxLines);lines[maxLines-1]=lines[maxLines-1].replace(/\s+\S*$/,'…')}return lines}
var flakes=[];
function makeFlakes(){flakes=[];var r=seeded(19);for(var i=0;i<56;i++)flakes.push({x:r()*W,y:r()*H,z:.4+r()*.6,ph:r()*6.28,s:.6+r()*.8})}
function drawOpener(t){
  var sc=Math.min(W,H)*(PORT?0.52:0.46)/250,ox=W*.5,oy=H*.30;
  var scatter=sstep(.02,.34,P),lineA=sstep(.40,.55,P)*(1-sstep(.72,.9,P)),con=sstep(.66,1,P),fade=1-sstep(.9,1,P);
  if(fade>.02){g.globalAlpha=.22*(1-sstep(0,.2,P))*fade;g.lineWidth=1;g.strokeStyle='rgba(200,220,240,.9)';
    D.strokes.forEach(function(s){g.beginPath();s.forEach(function(q,j){var x=ox+q[0]*sc,y=oy+q[1]*sc;if(j)g.lineTo(x,y);else g.moveTo(x,y)});g.stroke()});
    var targets=[];WORKS.forEach(function(w){var o=proj(w.x,w.y,1);targets.push(o)});
    for(var i=0;i<MARK.length;i++){var m=MARK[i],ang=m.ph,dist=scatter*(.18+.55*(i%5)/5)*Math.max(W,H);
      var x=ox+((m.x-MARK.cx)/MARK.sc)*sc+Math.cos(ang)*dist*(1-con);
      var y=oy+((m.y-MARK.cy)/MARK.sc)*sc+Math.sin(ang)*dist*(1-con);
      if(targets.length){var tg=targets[i%targets.length];x=lerp(x,tg[0],con);y=lerp(y,tg[1],con)}
      var tw=RM?1:.82+.18*Math.sin(t*.001+m.ph);
      dot(x,y,1.1+m.b*1.3,fade*m.b*tw,GW)}
  }
  if(lineA>.02){g.globalAlpha=lineA;g.fillStyle='#d5dde0';g.textAlign='center';g.textBaseline='middle';
    var lines=PORT?POEM:[D.poemLine],fs=PORT?Math.min(28,W*.072):Math.min(34,W*.04);
    g.font='300 '+fs+'px Poppins,sans-serif';var lh=fs*1.35,y0=H*.48-(lines.length-1)*lh/2;
    lines.forEach(function(l,i){g.fillText(l,W/2,y0+i*lh)});g.globalAlpha=1}
  if(P<.88){if(!flakes.length)makeFlakes();g.fillStyle='#e7eef8';
    for(var f=0;f<flakes.length;f++){var fl=flakes[f];
      if(!RM){fl.y+=(.35+fl.z)*.9;fl.x+=Math.sin(t*.0004+fl.ph)*.4;if(fl.y>H+8){fl.y=-8;fl.x=Math.random()*W}}
      g.globalAlpha=(.25+.35*fl.z)*(1-sstep(.6,.88,P));g.beginPath();g.arc(fl.x,fl.y,fl.s,0,6.29);g.fill()}}
}
function drawField(t){
  var z=zf(),time=t*.001,o=[0,0,0],o2=[0,0,0];
  labelHits=[];
  for(var i=0;i<FIELD.length;i++){var f=FIELD[i],o=proj(f.x,f.y,f.z);if(o[0]<-4||o[0]>W+4||o[1]<-4||o[1]>H+4)continue;
    var a=f.b*(RM?1:.85+.15*Math.sin(time+f.ph));g.globalAlpha=a;g.fillStyle='#d5deee';var rad=Math.max(.4,f.b);g.fillRect(o[0],o[1],rad,rad)}
  g.globalAlpha=1;
  var markA=(1-sstep(3,8,z))*(sky?1:sstep(.8,1,P));
  if(markA>.03){g.strokeStyle='rgba(205,220,240,'+(.18*markA)+')';g.lineWidth=1;
    D.strokes.forEach(function(s){g.beginPath();s.forEach(function(q,j){proj(MARK.cx+q[0]*MARK.sc,MARK.cy+q[1]*MARK.sc,1,o);if(j)g.lineTo(o[0],o[1]);else g.moveTo(o[0],o[1])});g.stroke()});
    MARK.forEach(function(m){var o2=proj(m.x,m.y,1);var tws=RM?1:.85+.15*Math.sin(time*1.2+m.ph);dot(o2[0],o2[1],.8+m.b,markA*m.b*tws,GW)})}
  CH.forEach(function(c){var figA=(1-.55*sstep(4,12,z))*(sky?1:sstep(.75,1,P));
    g.lineWidth=1;g.strokeStyle='rgba('+c.tint+','+(.28*figA)+')';g.globalAlpha=1;
    c.edges.forEach(function(e){var a=c.stars[e[0]],b=c.stars[e[1]];proj(a.x,a.y,1,o);proj(b.x,b.y,1,o2);g.beginPath();g.moveTo(o[0],o[1]);g.lineTo(o2[0],o2[1]);g.stroke()});
    c.stars.forEach(function(s){if(s.work!=null)return;proj(s.x,s.y,1,o);var tws=RM?1:.85+.15*Math.sin(time+s.ph);dot(o[0],o[1],.7+s.b,figA*(s.stray?0.45:0.8)*s.b*tws,GLOW[c.k])})});
  var vis=[];WORKS.forEach(function(w){var o3=proj(w.x,w.y,1);var px=Math.max(w.cw,w.chh)*cam.s;w._scr=[o3[0],o3[1],px];
    if(o3[0]<-300||o3[0]>W+300||o3[1]<-300||o3[1]>H+300)return;vis.push(w)});
  vis.sort(function(a,b){return a._scr[2]-b._scr[2]});
  vis.forEach(function(w){var x=w._scr[0],y=w._scr[1],px=w._scr[2],sw=w.cw*cam.s,sh=w.chh*cam.s;
    var imA=sstep(10,28,px)*(sky?1:sstep(.82,1,P)),dotA=(1-sstep(16,36,px))*(sky?1:sstep(.7,1,P));
    var tws=RM?1:.86+.14*Math.sin(time*1.1+w.ph);
    if(dotA>.02)dot(x,y,(w.anchor?1.3:.7)*Math.min(2.2,Math.pow(Math.max(zf(),1),.2)),dotA*(w.anchor?0.9:0.45)*tws,GLOW[w.c.k]);
    if(imA>.02){var bx=x-sw/2,by=y-sh/2;g.globalAlpha=imA;
      if(w.kind==='track'){drawWave(w,bx,by,sw,sh)}
      else{var im=w.img?img(w.img):null;if(im)g.drawImage(im,bx,by,sw,sh);
        else{g.fillStyle='rgba(10,14,22,.9)';g.fillRect(bx,by,sw,sh);
          if(px>26&&w.t){g.font='400 '+clamp(sw*.1,9,20)+'px "Julius Sans One",sans-serif';g.fillStyle='rgba('+w.c.tint+',.95)';g.textAlign='center';g.textBaseline='middle';g.fillText(w.t,x,y)}}}
      g.strokeStyle='rgba('+w.c.tint+','+(.28*imA)+')';g.lineWidth=1;g.strokeRect(bx+.5,by+.5,Math.max(0,sw-1),Math.max(0,sh-1));g.globalAlpha=1}
    var fy=y+sh/2+8;
    if(sky&&px>70&&w.t){var tf=clamp(px*.06,11,20);g.font='400 '+tf+'px "Julius Sans One",sans-serif';g.textAlign='center';g.textBaseline='top';g.globalAlpha=sstep(70,110,px);g.fillStyle='#d5dde0';
      wrap(w.t,Math.max(sw,140),2).forEach(function(l){g.fillText(l,x,fy);fy+=tf*1.25});
      var meta=showMeta(w);
      if(meta){g.font='300 11px Poppins,sans-serif';g.fillStyle='#9aa8ad';g.globalAlpha=sstep(120,170,px);wrap(meta,Math.max(sw,160),2).forEach(function(l){g.fillText(l,x,fy);fy+=14})}
      g.globalAlpha=1}
    var showOpen=false;
    if(sky&&sel&&sel.kind==='w'&&sel.ch===w.c.k&&sel.i===w.i&&top().k!=='room')showOpen=true;
    if(showOpen&&top().k!=='far'){var oy=Math.min(H-24,fy+8);g.globalAlpha=.9;g.font='300 12px Poppins,sans-serif';g.fillStyle='#c9d3d6';g.textAlign='center';g.textBaseline='top';
      g.fillText('OPEN ›',x,oy);
      labelHits.push({x:x-40,y:oy-4,w:80,h:24,ch:w.c,work:w})}});
  if(sky&&zf()<3.4){CH.forEach(function(c){var o4=proj(c.cx,c.cy+FIG_H*.5+16,1);var a=1-sstep(2.1,3.3,zf());if(a<.04)return;
    g.globalAlpha=a;g.textAlign='center';g.textBaseline='top';g.font='400 13px "Julius Sans One",sans-serif';g.fillStyle='rgba('+c.tint+',.95)';
    var lab=c.nm;g.fillText(lab,o4[0],o4[1]);
    g.font='300 11px Poppins,sans-serif';g.fillStyle='#9aa8ad';g.fillText(c.count,o4[0],o4[1]+16);
    var twm=g.measureText(lab).width;
    labelHits.push({x:o4[0]-twm/2-8,y:o4[1]-6,w:twm+16,h:sel&&sel.kind==='ch'&&sel.ch===c.k?52:36,ch:c});
    if(sel&&sel.kind==='ch'&&sel.ch===c.k&&atFar()){g.font='300 12px Poppins,sans-serif';g.fillStyle='#c9d3d6';g.fillText('OPEN ›',o4[0],o4[1]+34)}
    g.globalAlpha=1});}
}
function drawWave(w,x,y,sw,sh){var pk=w.peaks||[],n=pk.length||1;g.fillStyle='rgba(8,12,18,.92)';g.fillRect(x,y,sw,sh);g.fillStyle='rgba('+w.c.tint+',.85)';
  for(var i=0;i<n;i++){var bh=(pk[i]||.2)*sh*.7+2,bw=sw/n;g.fillRect(x+i*bw+bw*.2,y+sh/2-bh/2,Math.max(1,bw*.55),bh)}}
function draw(t){
  g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);
  var z=sky?zf():P,veil=sky?(0.38+.5*sstep(1.15,4.5,zf())):(.08+.4*P);
  g.fillStyle='rgba(4,6,12,'+veil.toFixed(3)+')';g.fillRect(0,0,W,H);
  var fieldA=sky?1:sstep(.72,1,P);
  if(fieldA>.01){g.save();g.globalAlpha=fieldA;drawField(t);g.restore()}
  if(!sky)drawOpener(t);
  var moon=sky?(.2*(1-sstep(1.6,4,zf()))):lerp(.85,.28,P);
  if(MOON)MOON.style.opacity=String(clamp(moon,0,1));
  if(WATER){WATER.style.opacity=String(sky?lerp(.42,.16,sstep(1.2,4,zf())):lerp(.72,.4,P));
    if(!RM){var fy=Math.sin(t/14000*6.283)*6;WATER.style.transform='translateY('+fy.toFixed(2)+'px)'}
    else WATER.style.transform='none'}
}
function frame(t){requestAnimationFrame(frame);
  if(!sky){if(RM)P=T;else P+=(T-P)*(1-Math.exp(-.016* (T-P>0?3.2:4)));if(Math.abs(T-P)<.001)P=T;if(T>=1&&P>.985)lockField()}
  if(glide)stepGlide(t);
  draw(t)}
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;PORT=H>=W;
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);g.setTransform(DPR,0,0,DPR,0,0);
  var first=!WORKS.length;build();flakes=[];
  if(!sky){var c=fitCam();cam.x=c.x;cam.y=c.y;cam.s=c.s}
  else applyLevel(top(),true)}
addEventListener('resize',resize);resize();
try{history.replaceState({s:1},'');history.pushState({s:1},'')}catch(err){}
chrome();requestAnimationFrame(frame);

window.__sky={
  state:function(){var lv=top();return{sky:sky,p:+P.toFixed(3),t:+T.toFixed(3),level:lv.k,ch:lv.ch||'',i:lv.i==null?null:lv.i,where:WHERE.textContent,href:location.href,z:+zf().toFixed(3),sel:sel,room:!ROOM.hidden,menu:!MENU.hidden,sheet:!SHEET.hidden,glide:!!glide,rm:RM,
    counts:CH.map(function(c){return{k:c.k,count:c.count,n:c.works.length}}),
    cam:{x:+cam.x.toFixed(1),y:+cam.y.toFixed(1),s:+cam.s.toFixed(3)},
    spots:(function(){if(!sky)return[];var lv=top();
      if(lv.k==='far')return CH.map(function(c){var o=proj(c.cx,c.cy,1);return{k:c.k,x:+o[0].toFixed(1),y:+o[1].toFixed(1)}});
      if(lv.k==='cluster'||lv.k==='star')return chapter(lv.ch).works.map(function(w){return{i:w.i,t:w.t||'',x:w._scr?+w._scr[0].toFixed(1):null,y:w._scr?+w._scr[1].toFixed(1):null}});
      return[]})()}},
  tap:tap,zoomInAt:zoomInAt,stepOut:stepOut,goFar:goFar
};
})();
