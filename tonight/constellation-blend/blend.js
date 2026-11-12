/* constellation · the one sky (tonight restore, Nov 12, after Sketch's review). From the 4:45 piece-1 final: its canvas and
   its zoom ladder only. On the home page the opener's last stage settles into this field on the same page, with the water
   kept under it. FAR (the whole field) · a chapter · the star growing in place (three steps) · its room, and out the same
   way one level at a time (pinch-out, ‹, Esc, Back). The mark: the whole field in one move; at the field, its menu.
   Film uses the same ladder as photo and objects: no sheet. Motion never reads prefers-reduced-motion: it is the same with
   Reduce Motion on. Nothing auto-advances. */
(function(){
'use strict';
var D=window.CB;
/* counts from one source: the works themselves (the opener reads the same list) */
D.chapters.forEach(function(c){var n=c.works.length;c.count=c.k==='film'?(n-c.works.filter(function(w){return w.kind==='reel'}).length)+' films + demo reel':c.k==='photo'?n+' photos':c.k==='sound'?n+' songs':c.k==='about'?c.count:n+(n===1?' piece':' pieces')});
var cv=document.getElementById('c'), g=cv.getContext('2d');
var WHERE=document.getElementById('where'), HINT=document.getElementById('hint');
var W=0,H=0,DPR=1,PORT=true;
function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,u){return a+(b-a)*u}
function sstep(a,b,v){var u=clamp((v-a)/(b-a),0,1);return u*u*(3-2*u)}
function seeded(seed){var s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function now(){return performance.now()}
/* glow sprites (m4 opener style) */
function glowSprite(rgb){var c=document.createElement('canvas');c.width=c.height=128;var q=c.getContext('2d'),gr=q.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba('+rgb+',.95)');gr.addColorStop(.16,'rgba('+rgb+',.42)');gr.addColorStop(.42,'rgba('+rgb+',.10)');gr.addColorStop(1,'rgba('+rgb+',0)');q.fillStyle=gr;q.fillRect(0,0,128,128);return c}
var GW=glowSprite('205,225,255'), GLOW={};
D.chapters.forEach(function(c){GLOW[c.k]=glowSprite(c.tint)});
/* ---------- world ---------- */
var FIG_W=220,FIG_H=110;
var MARK=[],FIELD=[],DUST=[],CH=D.chapters,WORKS=[],BOX=null;
function layoutChapters(){
  /* flat hub, no ring: a calm staggered column on a phone, a staggered band in landscape */
  /* six chapters (Spaces added Nov 12, Gill 3:08 AM), order as the tonight hub: film, photo, objects, spaces, about, sound */
  var P=PORT?{mark:[0,-300],film:[-80,-156],photo:[80,-28],objects:[-80,100],spaces:[80,228],about:[-80,356],sound:[80,484],box:[-200,-400,200,572]}
           :{mark:[-420,-30],film:[-150,-120],photo:[120,-140],objects:[-140,118],spaces:[130,100],about:[400,-110],sound:[410,128],box:[-590,-230,590,230]};
  BOX=P.box;return P}
function build(){
  var P=layoutChapters(),r=seeded(7);
  /* the ᑕᐣᓯ mark: points along the opener's STROKES (same strokes as m4 sky.js) */
  MARK=[];var ms=.55,segs=[],tot=0;
  D.strokes.forEach(function(s){for(var j=1;j<s.length;j++){var a=s[j-1],b=s[j],l=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push({a:a,b:b,l:l});tot+=l}});
  var NM=64;for(var i=0;i<NM;i++){var t=(i+.5)/NM*tot,acc=0;for(var k=0;k<segs.length;k++){var sg=segs[k];if(acc+sg.l>=t){var u=(t-acc)/sg.l;MARK.push({x:P.mark[0]+lerp(sg.a[0],sg.b[0],u)*ms,y:P.mark[1]+lerp(sg.a[1],sg.b[1],u)*ms,z:1.12,b:.45+r()*.55,ph:r()*6.28});break}acc+=sg.l}}
  MARK.cx=P.mark[0];MARK.cy=P.mark[1];MARK.sc=ms;
  /* chapters: designed figure + one star per work */
  WORKS=[];
  var DEP={film:1.10,photo:.92,objects:1.04,spaces:1.07,about:.95,sound:.88};
  CH.forEach(function(c,ci){var cen=P[c.k];c.cx=cen[0];c.cy=cen[1];c.stars=[];c.edges=c.sh.e;c.z=DEP[c.k]||1;
    c.sh.s.forEach(function(s){c.stars.push({x:c.cx+(s[0]-.5)*FIG_W,y:c.cy+(s[1]-.5)*FIG_H,b:s[2],stray:!!s[3],ph:r()*6.28,z:c.z+(r()-.5)*.08})});
    var n=c.works.length,anchors=c.stars.map(function(s,i){return i}).filter(function(i){return !c.stars[i].stray}).sort(function(a,b){return c.stars[b].b-c.stars[a].b});
    var dmin=Math.sqrt(FIG_W*FIG_H/(Math.max(n,anchors.length)*2.1)),pts=[];
    c.stars.forEach(function(s){pts.push([s.x,s.y])});
    c.card=Math.min(9,dmin*.36);c.dmin=dmin;
    var rr=seeded(31+ci*17);
    c.works.forEach(function(w,i){var x,y;
      if(i<anchors.length&&i<n){var s=c.stars[anchors[i]];x=s.x;y=s.y;s.work=i;w.anchor=1}
      else{var tries=0,best=null,bd=-1;while(tries++<400){var px=c.cx+(rr()-.5)*FIG_W*1.06,py=c.cy+(rr()-.5)*FIG_H*1.2,dm=1e9;
          for(var q=0;q<pts.length;q++){var dd=Math.hypot(pts[q][0]-px,pts[q][1]-py);if(dd<dm)dm=dd}
          if(dm>bd){bd=dm;best=[px,py]}if(dm>dmin)break}x=best[0];y=best[1];pts.push(best)}
      w.x=x;w.y=y;w.c=c;w.i=i;w.ph=rr()*6.28;w.z=w.anchor?c.stars[anchors[i]].z:c.z+(rr()-.5)*.1;
      var ar=w.ar||(w.kind==='track'?2.4:w.kind==='poem'?.8:1.5);w.ar=ar;
      w.cw=ar>=1?c.card:c.card*ar;w.chh=ar>=1?c.card/ar:c.card;
      WORKS.push(w)})});
  /* depth layers: far field (z<1) and near dust (z>1): only seen as parallax when you move or zoom */
  FIELD=[];var bw=BOX[2]-BOX[0],bh=BOX[3]-BOX[1];
  for(i=0;i<1100;i++)FIELD.push({x:BOX[0]-bw*.8+r()*bw*2.6,y:BOX[1]-bh*.8+r()*bh*2.6,z:.18+Math.pow(r(),1.6)*.7,b:r()<.06?.9+r()*.5:.25+r()*.5,ph:r()*6.28,tw:r()<.4});
  DUST=[];for(i=0;i<46;i++)DUST.push({x:BOX[0]-bw*.3+r()*bw*1.6,y:BOX[1]-bh*.3+r()*bh*1.6,z:1.7+r()*1.6,rad:8+r()*26,a:.04+r()*.07});
}
/* ---------- camera ---------- */
var cam={x:0,y:0,s:1},S0=1,SMAX=60,T={x:0,y:0,vx:0,vy:0,tx:0,ty:0},glide=null,lastIn=0,motion=0;
function fitCam(){var bw=BOX[2]-BOX[0],bh=BOX[3]-BOX[1],top=56,bot=64;S0=Math.min(W/bw,(H-top-bot)/bh)*.96;
  var minCard=1e9;CH.forEach(function(c){minCard=Math.min(minCard,c.card)});SMAX=Math.min(W,H)*.86/minCard;
  return {x:(BOX[0]+BOX[2])/2,y:(BOX[1]+BOX[3])/2-(top-bot)/2/S0,s:S0}}
function zf(){return cam.s/S0}
/* depth projection: z=1 is the flat plane. Far layers scale less while zoomed (fly-through), and tilt offsets each layer by
   its depth. At rest (zoom 1, tilt 0) every layer lines up: flat. */
function zE(z){return 1+(z-1)*(1-sstep(1.6,5,zf()))}
function proj(x,y,z,o){var k=Math.pow(zf(),(z-1)*.38),s=cam.s*k;o=o||[0,0,0];
  o[0]=W/2+(x-cam.x)*s+T.x*(z-1)*2.2;o[1]=H/2+(y-cam.y)*s+T.y*(z-1)*2.2;o[2]=s;return o}
function toWorld(px,py){return [cam.x+(px-W/2)/cam.s,cam.y+(py-H/2)/cam.s]}
function zoomAt(px,py,ns){ns=clamp(ns,S0*.7,SMAX*1.15);var a=toWorld(px,py);cam.s=ns;var b=toWorld(px,py);cam.x+=a[0]-b[0];cam.y+=a[1]-b[1];clampPan()}
function clampPan(){var m=60/cam.s+40;cam.x=clamp(cam.x,BOX[0]-m,BOX[2]+m);cam.y=clamp(cam.y,BOX[1]-m,BOX[3]+m)}
function glideTo(tx,ty,ts,ms){firstTouch();ts=clamp(ts,S0,SMAX);glide={x0:cam.x,y0:cam.y,s0:cam.s,x1:tx,y1:ty,s1:ts,t0:now(),ms:ms||950}}
function stepGlide(t){var G=glide,p=clamp((t-G.t0)/G.ms,0,1),e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
  var s=G.s0*Math.pow(G.s1/G.s0,e),k=Math.abs(G.s1-G.s0)<1e-9?e:(s-G.s0)/(G.s1-G.s0);cam.s=s;cam.x=lerp(G.x0,G.x1,k);cam.y=lerp(G.y0,G.y1,k);
  motion=Math.max(motion,.8);if(p>=1){glide=null;settled()}}
/* ---------- input ---------- */
var HOVER=matchMedia('(hover: hover) and (pointer: fine)').matches,PT=new Map(),drag=null,pinch=null,WB=null;
/* one sky: on the home page the field wakes when the opener's last stage has settled into it (ON); until then the
   opener's water and stars take the fingers. */
var ONE=document.documentElement.hasAttribute('data-onesky'),ON=!ONE;
function firstTouch(){HINT.classList.add('gone')}
/* gesture lock (Gill 4:29): one finger = look around / pan; two fingers = pinch, and the pinch always wins. */
var gLock=false;
function snap(){return {x:cam.x,y:cam.y,s:cam.s,L:level(),F:FOCUS}}
cv.addEventListener('pointerdown',function(e){if(!ON)return;cv.setPointerCapture(e.pointerId);PT.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t0:now()});lastIn=now();firstTouch();
  if(PT.size>=2)chipOff();glide=null;FL=null;
  if(PT.size===1&&!gLock&&!pinch){drag={id:e.pointerId,moved:0,vx:0,vy:0,lt:now()};}
  else if(!pinch&&PT.size>=2){drag=null;gLock=true;T.tx=0;T.ty=0;var ids=[...PT.keys()].slice(0,2),a=ids.map(function(i){return PT.get(i)});
    pinch={ids:ids,d0:Math.max(10,Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)),s0:cam.s,m:[(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2],st:snap()}}});
cv.addEventListener('pointermove',function(e){var p=PT.get(e.pointerId);
  if(!p){if(e.pointerType==='mouse'&&HOVER&&ON){T.tx=(e.clientX-W/2)*.035;T.ty=(e.clientY-H/2)*.035}return}
  var dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;lastIn=now();
  if(pinch){if(pinch.ids.indexOf(e.pointerId)<0)return;var a=pinch.ids.map(function(i){return PT.get(i)}),d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),m=[(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2];
    zoomAt(m[0],m[1],pinch.s0*d/pinch.d0);cam.x-=(m[0]-pinch.m[0])/cam.s;cam.y-=(m[1]-pinch.m[1])/cam.s;pinch.m=m;clampPan();motion=1;return}
  if(gLock)return;
  if(drag&&drag.id===e.pointerId){drag.moved+=Math.abs(dx)+Math.abs(dy);if(drag.moved<6)return;
    var t=now(),dt=Math.max(8,t-drag.lt);drag.lt=t;drag.vx=lerp(drag.vx,dx/dt,.4);drag.vy=lerp(drag.vy,dy/dt,.4);
    var pan=sstep(1.12,1.8,zf());cam.x-=dx*pan/cam.s;cam.y-=dy*pan/cam.s;clampPan();
    T.tx=clamp(T.tx+dx*.5,-70,70);T.ty=clamp(T.ty+dy*.5,-70,70);motion=1}});
function up(e){var p=PT.get(e.pointerId);if(!p)return;PT.delete(e.pointerId);
  if(!PT.size)gLock=false;
  if(pinch){if(pinch.ids.indexOf(e.pointerId)>=0){var P0=pinch;pinch=null;settleGesture(P0.st,P0.m)}drag=null;return}
  if(gLock){drag=null;return}
  if(drag&&drag.id===e.pointerId){var dur=now()-p.t0;
    if(drag.moved<10&&dur<350&&e.type!=='pointercancel')tap(e.clientX,e.clientY);
    else if(zf()>1.12){fling(drag.vx*sstep(1.12,1.8,zf()),drag.vy*sstep(1.12,1.8,zf()))}
    drag=null;T.tx=0;T.ty=0}}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!PT.size){T.tx=0;T.ty=0}});
var FL=null;function fling(vx,vy){if(Math.hypot(vx,vy)<.15)return;FL={vx:vx,vy:vy,t:now()}}
/* desktop: the wheel is the same zoom from the pointer; a burst of wheel steps is one gesture */
cv.addEventListener('wheel',function(e){e.preventDefault();if(!ON)return;lastIn=now();firstTouch();glide=null;chipOff();if(!WB)WB={st:snap(),m:[e.clientX,e.clientY]};
  var k=Math.exp(-e.deltaY*(e.deltaMode===1?18:1)*(e.ctrlKey?.012:.0016));zoomAt(e.clientX,e.clientY,cam.s*k);WB.m=[e.clientX,e.clientY];motion=1;
  clearTimeout(cv._wt);cv._wt=setTimeout(function(){var b=WB;WB=null;settleGesture(b.st,b.m)},240)},{passive:false});
['gesturestart','gesturechange'].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});
addEventListener('keydown',function(e){if(!ON)return;var k=e.key;lastIn=now();firstTouch();
  var t=e.target;if(t&&t.closest&&t.closest('a[href],button,input')&&(k==='Enter'||k===' '))return;   /* a focused link or button does its own job */
  if(k==='Escape'||k==='Backspace'||k==='-'||k==='_'){e.preventDefault();outOne();return}
  if(k==='Enter'||k==='+'||k==='='){e.preventDefault();enterKey();return}
  if(k.indexOf('Arrow')===0){e.preventDefault();
    if(level()===0){var i=CH.indexOf(CH.find(function(c){return c.k===CHIP.k}));i=(i+(k==='ArrowLeft'||k==='ArrowUp'?CH.length-1:1))%CH.length;if(!CHIP.k&&(k==='ArrowLeft'||k==='ArrowUp'))i=CH.length-1;var c=CH[Math.max(0,i)];var q=nameXY(c);chipOn(c,q[0],q[1]);if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();return}
    chipOff();var d=80/cam.s;glideTo(cam.x+(k==='ArrowRight'?d:k==='ArrowLeft'?-d:0),cam.y+(k==='ArrowDown'?d:k==='ArrowUp'?-d:0),cam.s,300)}});
function cardPx(w){return Math.max(w.cw,w.chh)*cam.s}
/* ---------- the ladder: FAR (0) · chapter (1) · the star growing in place (2, 3, 4) · its room ---------- */
function chapterS(){return Math.min(W*.92/FIG_W,(H-120)*.9/FIG_H)}
function ladder(w){var s=[deepS(w,.22),deepS(w,.5),deepS(w,.82)];s[0]=Math.max(s[0],chapterS()*1.5);s[1]=Math.max(s[1],s[0]*1.4);s[2]=Math.max(s[2],s[1]*1.25);
  s[2]=Math.min(s[2],SMAX);s[1]=Math.min(s[1],s[2]/1.25);s[0]=Math.min(s[0],s[1]/1.4);return s}
var FOCUS=null;
function scr(w){return proj(w.x,w.y,zE(w.z),[0,0,0])}
function centreWork(){var best=null,bd=1e9;WORKS.forEach(function(w){var p=scr(w);var d=Math.hypot(p[0]-W/2,p[1]-H/2);if(d<bd){bd=d;best=w}});return best}
function focusOk(w){if(!w)return false;var p=scr(w),r=Math.min(W,H)*.5+cardPx(w)/2;return Math.abs(p[0]-W/2)<r&&Math.abs(p[1]-H/2)<r}
function level(){var z=zf();if(z<1.35)return 0;var F=focusOk(FOCUS)?FOCUS:null;
  if(!F){var c=centreWork();if(c&&cardPx(c)>30)F=c}if(!F)return 1;var st=ladder(F);
  if(cam.s<st[0]*.8)return 1;if(cam.s<st[1]*.85)return 2;if(cam.s<st[2]*.85)return 3;return 4}
function viewFor(w,L){var st=ladder(w);if(L<=0){var c=fitCam();return [c.x,c.y,c.s]}if(L===1){return [w.c.cx,w.c.cy,chapterS()]}var ts=st[L-2],off=deepOff(w,ts);return [w.x+off[0],w.y+off[1],ts]}
function goLevel(L,w,ms){w=w||FOCUS;chipOff();menuOff();
  if(L<=0){home();return}
  if(!w){var c=nearestChapter();glideTo(c.cx,c.cy,chapterS(),ms||900);return}
  FOCUS=w;var v=viewFor(w,L);glideTo(v[0],v[1],v[2],ms||900);syncTo(L)}
/* tap: a name (or a figure) at FAR is selected first (OPEN ›) and opens on the second tap; a star grows one step per tap;
   at its last step one more tap opens its room */
function hitWork(x,y){var best=null,bd=1e9,deep=zf()>6;
  WORKS.forEach(function(w){var o=scr(w),hw=w.cw*cam.s/2+(deep?2:6),hh=w.chh*cam.s/2+(deep?2:6);if(!deep){hw=Math.max(22,hw);hh=Math.max(22,hh)}
    if(Math.abs(o[0]-x)<=hw&&Math.abs(o[1]-y)<=hh){var d=Math.hypot(o[0]-x,o[1]-y)*(w===FOCUS?.5:1);if(d<bd){bd=d;best=w}}});return best}
function figureAt(x,y){var wp=toWorld(x,y);for(var c=0;c<CH.length;c++){var C=CH[c];if(Math.abs(wp[0]-C.cx)<FIG_W*.62&&Math.abs(wp[1]-C.cy)<FIG_H*.75)return C}return null}
function tap(x,y){
  if(MENU){menuOff();return}
  var L=level();
  if(L===0){var nc=nameAt(x,y)||figureAt(x,y);
    if(nc){if(CHIP.k===nc.k){intoChapter(nc)}else chipOn(nc,x,y);return}
    if(CHIP.k){chipOff();return}
    if(Math.abs(toWorld(x,y)[0]-MARK.cx)<130&&Math.abs(toWorld(x,y)[1]-MARK.cy)<70)return;
    return}
  chipOff();
  var w=hitWork(x,y);
  if(w){stepIn(w);return}
  if(L===1){var c=figureAt(x,y);if(c&&c!==nearestChapter())intoChapter(c)}}
function intoChapter(c){chipOff();FOCUS=null;glideTo(c.cx,c.cy,chapterS(),1000);syncTo(1)}
function stepIn(w){var st=ladder(w);
  if(w===FOCUS&&cam.s>=st[2]*.85){enterRoomFor(w);return}
  var nl=4;for(var i=0;i<3;i++)if(cam.s<st[i]*.85){nl=i+2;break}
  FOCUS=w;var v=viewFor(w,nl);glideTo(v[0],v[1],v[2],1000);syncTo(nl)}
/* Enter / + : the same as a tap deeper on what is selected or in the middle */
function enterKey(){if(MENU)return;if(CHIP.k){var c=CH.find(function(q){return q.k===CHIP.k});intoChapter(c);return}
  var L=level();if(L===0){var c0=nearestChapter();var q=nameXY(c0);chipOn(c0,q[0],q[1]);return}
  var w=focusOk(FOCUS)?FOCUS:centreWork();if(w)stepIn(w)}
/* every way out (pinch-out, ‹, Esc, Back) goes up exactly one level, to the same star */
function outOne(){if(CHIP.k){chipOff();return}if(MENU){menuOff();return}var L=level();if(L===0)return;
  if(L>=2){var F=focusOk(FOCUS)?FOCUS:centreWork();goLevel(L-1,F,800);return}
  home()}
/* a pinch (or a burst of wheel steps) is one gesture: out goes one level from where it started; in lets the camera grow
   from your fingers and then rests on the nearest rung: a chapter over the pinch, or past a star's last step, its room */
function settleGesture(st,m){var r=cam.s/st.s;
  if(r<.85){if(st.L===0){home();return}FOCUS=st.F&&focusOk(st.F)?st.F:FOCUS;var F=FOCUS||centreWork();if(st.L===1||!F){home();return}goLevel(st.L-1,F,700);return}
  if(cam.s<S0){home();return}
  if(r>1.2){
    if(st.L===0){var c=figureAt(m[0],m[1]);var wp=toWorld(m[0],m[1]),best=null,bd=1e9;
      if(!c){CH.forEach(function(q){var d=Math.hypot((q.cx-wp[0])/FIG_W,(q.cy-wp[1])/FIG_H);if(d<bd){bd=d;best=q}});if(bd<1.05)c=best}
      if(c&&zf()<4){intoChapter(c);return}
      if(!c&&zf()<4){home();return}}
    var w=centreWork();if(w&&focusOk(w)){var s2=ladder(w);if(st.L>=4&&r>1.2&&(FOCUS===w||st.F===w)){FOCUS=w;enterRoomFor(w);return}
      if(cardPx(w)>30){FOCUS=w}}}
  settled()}
function home(){chipOff();menuOff();FOCUS=null;var c=fitCam();glideTo(c.x,c.y,c.s,1000);syncTo(0)}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
/* a work's zoom stops: picture at f of the short side, never so big that its facts fall off the screen */
function sideMode(){return W>H*1.25}
function deepS(w,f){var m=Math.min(W,H),ts=m*f/Math.max(w.cw,w.chh);
  if(f>.4){if(sideMode()){ts=Math.min(ts*1.25,(H-190)/w.chh,(W-400)/w.cw);if(f>.7&&w.strip&&w.strip.length)ts=Math.min(ts,(H-150)/(1.25*w.chh))}else ts=Math.min(ts,(H-(f>.7?250:170))/w.chh,W*.9/w.cw)}return ts}
function deepOff(w,ts){var px=Math.max(w.cw,w.chh)*ts;
  if(sideMode()&&px>140){var sw=w.cw*ts,colW=Math.max(120,Math.min(340,W-(W/2+sw/2+16)-16)),fh=px>300&&w.strip?(sw-18)/4/(w.ar||1.78)+8:0;return [(colW+16)/2/ts,fh/2/ts]}
  return [0,px>240?w.chh*.5+40/ts:px>110?w.chh*.25:0]}
/* ---------- media ---------- */
var IMG={};function img(src){var m=IMG[src];if(!m){m=IMG[src]=new Image();m.decoding='async';m.src=src}return m.complete&&m.naturalWidth?m:null}
/* Sound (K7, N14): the dotted star-chart waveform. Each sample is a star on a hairline; the brightest peak carries the
 song's name, the length sits at the end in m:ss. No bars, no cards, no play-button rows. */
var WAVE={};function wave(w){var c=WAVE[w.t];if(c)return c;c=document.createElement('canvas');c.width=480;c.height=200;var q=c.getContext('2d'),pk=w.peaks,n=pk.length,x0=26,x1=454,base=150,top=48;
  q.fillStyle='rgba(8,12,20,1)';q.fillRect(0,0,480,200);
  function X(i){return x0+(x1-x0)*i/(n-1)}function Y(i){return base-(base-top)*pk[i]}
  q.strokeStyle='rgba('+w.c.tint+',.28)';q.lineWidth=1;q.beginPath();for(var i=0;i<n;i++){if(i)q.lineTo(X(i),Y(i));else q.moveTo(X(i),Y(i))}q.stroke();
  q.strokeStyle='rgba('+w.c.tint+',.12)';q.beginPath();q.moveTo(x0,base+.5);q.lineTo(x1,base+.5);q.stroke();
  var hi=0;for(i=0;i<n;i++)if(pk[i]>pk[hi])hi=i;
  for(i=0;i<n;i++){var r=1.1+pk[i]*2.4;q.globalAlpha=.45+.55*pk[i];q.fillStyle=i===hi?'#f4f8ff':'rgba('+w.c.tint+',1)';q.beginPath();q.arc(X(i),Y(i),r,0,6.283);q.fill()}
  q.globalAlpha=1;q.font='300 17px Poppins, sans-serif';q.textBaseline='bottom';q.fillStyle='#e6edf0';
  var lab=w.t,lw=q.measureText(lab).width,lx=Math.min(Math.max(X(hi)-lw/2,8),472-lw);q.textAlign='left';q.fillText(lab,lx,Y(hi)-8);
  if(w.len){q.font='300 14px Poppins, sans-serif';q.fillStyle='rgba('+w.c.tint+',.95)';q.textBaseline='top';q.textAlign='right';q.fillText(w.len,x1,base+10)}
  return WAVE[w.t]=c}
/* ---------- draw ---------- */
var o=[0,0,0],o2=[0,0,0],labRects=[];
function free(r){for(var i=0;i<labRects.length;i++){var t=labRects[i];if(r.x<t.x+t.w&&r.x+r.w>t.x&&r.y<t.y+t.h&&r.y+r.h>t.y)return false}labRects.push(r);return true}
function dot(x,y,rad,a,glow,gs){if(a<.01)return;g.globalAlpha=a*.85;g.drawImage(glow||GW,x-gs/2,y-gs/2,gs,gs);g.globalAlpha=a;g.fillStyle='#f4f8ff';g.beginPath();g.arc(x,y,rad,0,6.283);g.fill()}
function wrapLines(text,maxW,maxLines){var words=String(text).split(' '),lines=[],cur='';words.forEach(function(wd){var t=cur?cur+' '+wd:wd;if(g.measureText(t).width>maxW&&cur){lines.push(cur);cur=wd}else cur=t});if(cur)lines.push(cur);
  return lines}  /* K11: break only at words; never cut a name */
function draw(t){
  var z=zf(),tw=t/1000;
  g.clearRect(0,0,W,H);if(!ONE){var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#03050b');bg.addColorStop(1,'#061018');g.fillStyle=bg;g.fillRect(0,0,W,H)}
  /* far field */
  for(var i=0;i<FIELD.length;i++){var f=FIELD[i];proj(f.x,f.y,f.z,o);if(o[0]<-4||o[0]>W+4||o[1]<-4||o[1]>H+4)continue;
    var tws=f.tw?.75+.25*Math.sin(tw*(1.2+f.ph)+f.ph*9):1,rad=Math.max(.45,f.b*f.z*1.25*Math.min(2.2,Math.pow(z,.18)));
    g.globalAlpha=clamp(f.b*f.z*1.1*tws,0,1);g.fillStyle='#dfe8ff';g.fillRect(o[0]-rad/2,o[1]-rad/2,rad,rad)}
  g.globalAlpha=1;
  /* the mark (z 1.12) */
  labRects=[];var markA=1-sstep(4,10,z);if(markA>.01){g.strokeStyle='rgba(205,225,255,'+(.16*markA)+')';g.lineWidth=1;
    D.strokes.forEach(function(s){g.beginPath();s.forEach(function(q,j){proj(MARK.cx+q[0]*MARK.sc,MARK.cy+q[1]*MARK.sc,1.12,o);if(j)g.lineTo(o[0],o[1]);else g.moveTo(o[0],o[1])});g.stroke()});
    MARK.forEach(function(m){proj(m.x,m.y,m.z,o);var tws=.8+.2*Math.sin(tw*1.4+m.ph);dot(o[0],o[1],(.7+m.b*1.1)*Math.min(2,Math.pow(z,.3)),markA*m.b*tws,GW,10+m.b*14)});
    proj(MARK.cx,MARK.cy+78,1.12,o);var fs=clamp(13*Math.pow(z,.5),11,22);g.font='300 '+fs.toFixed(1)+'px Poppins, sans-serif';g.textAlign='center';g.textBaseline='middle';
    var pw=g.measureText(D.poemLine).width,pA=markA*.7*(1-sstep(1.25,1.7,z));
    /* the tagline is drawn whole or not at all: never clipped at an edge, never under a name */
    if(pA>.01&&o[0]-pw/2>=6&&o[0]+pw/2<=W-6){g.globalAlpha=pA;g.fillStyle='#c9d3d6';g.fillText(D.poemLine,o[0],o[1]);labRects.push({x:o[0]-pw/2-4,y:o[1]-fs,w:pw+8,h:fs*2})}g.globalAlpha=1}
  /* chapters: hairline figure + its stars */
  CH.forEach(function(c){
    var figA=1-.65*sstep(5,16,z);g.lineWidth=1;g.strokeStyle='rgba('+c.tint+','+(.30*figA)+')';
    c.edges.forEach(function(e){var a=c.stars[e[0]],b=c.stars[e[1]];proj(a.x,a.y,zE(a.z),o);proj(b.x,b.y,zE(b.z),o2);g.beginPath();g.moveTo(o[0],o[1]);g.lineTo(o2[0],o2[1]);g.stroke()});
    c.stars.forEach(function(s){if(s.work!=null)return;proj(s.x,s.y,zE(s.z),o);var tws=.8+.2*Math.sin(tw*1.3+s.ph);dot(o[0],o[1],(.6+s.b*1.3)*Math.min(1.8,Math.pow(z,.25)),(s.stray?.5:.85)*s.b*tws*figA,GLOW[c.k],8+s.b*18)});
  });
  /* works: star → picture → facts (drawn small to large) */
  var vis=[];WORKS.forEach(function(w){proj(w.x,w.y,zE(w.z),o);var px=cardPx(w),hx=w.cw*cam.s/2+260,hy=w.chh*cam.s/2+260;
    if(o[0]<-hx||o[0]>W+hx||o[1]<-hy||o[1]>H+hy)return;vis.push([w,o[0],o[1],px])});
  vis.sort(function(a,b){return a[3]-b[3]});
  var sp=Math.min.apply(null,CH.map(function(c){return c.dmin}))*cam.s;
  vis.forEach(function(v){var w=v[0],x=v[1],y=v[2],px=v[3],c=w.c,sw=w.cw*cam.s,sh=w.chh*cam.s;
    var imA=sstep(8,30,px),dotA=1-sstep(14,34,px),tws=.82+.18*Math.sin(tw*1.25+w.ph);
    if(dotA>0){var more=w.anchor?1:.22+.78*sstep(1.15,2.6,z),b=w.anchor?.95:.7*(.6+.4*more),gs=(10+b*20)*(1+imA*1.5);dot(x,y,(.9+b*1.2)*(w.anchor?1:.55+.45*more)*Math.min(2.2,Math.pow(z,.28)),dotA*b*tws*more,GLOW[c.k],gs)}
    if(imA>0){var im=w.img?img(w.img):null;g.globalAlpha=imA;
      var bx=x-sw/2,by=y-sh/2;
      if(w.kind==='track'){g.drawImage(wave(w),bx,by,sw,sh)}
      else if(im){g.drawImage(im,bx,by,sw,sh)}
      else{g.fillStyle='rgba(14,20,32,.92)';g.fillRect(bx,by,sw,sh);
        if(px>30){var tf=clamp(sw*.09,9,26);g.font='400 '+tf.toFixed(1)+'px "Julius Sans One", sans-serif';g.fillStyle='rgba('+c.tint+',.95)';g.textAlign='center';g.textBaseline='middle';
          var lines=wrapLines(w.t||c.nm,sw*.84,3);lines.forEach(function(l,j){g.fillText(l,x,y+(j-(lines.length-1)/2)*tf*1.25)})}}
      g.strokeStyle='rgba('+c.tint+','+(.35*imA)+')';g.lineWidth=1;g.strokeRect(bx+.5,by+.5,sw-1,sh-1);g.globalAlpha=1;
      /* the poem appears inside its card once there is room (verbatim lines) */
      if(w.lines&&px>170){var pa=sstep(170,260,px),lf=clamp(sw*.045,8,17);g.globalAlpha=pa;g.font='300 '+lf.toFixed(1)+'px Poppins, sans-serif';g.fillStyle='#e6edf0';g.textAlign='center';g.textBaseline='top';
        var y0=by+sh*.2;w.lines.forEach(function(l,j){g.fillText(l,x,y0+j*lf*1.32)});g.globalAlpha=1}
      labRects.push({x:bx,y:by,w:sw,h:sh})}
    /* facts below the picture, more the closer you are */
    /* landscape: facts sit beside the picture (so nothing falls under the hint or off the bottom); portrait: under it */
    var side=sideMode()&&px>140,tx=side?x+sw/2+16:x,colW=side?Math.max(120,Math.min(340,W-tx-16)):Math.max(sw,200),al=side?'left':'center';
    var fy=side?y-sh/2:y+sh/2+8,tA=sstep(60,110,px),title=w.t;
    if(tA>0&&title&&!(w.masked||(!w.img&&w.kind!=='track'))){var tf2=clamp(px*.075,11,24);g.font='400 '+tf2.toFixed(1)+'px "Julius Sans One", sans-serif';g.textAlign=al;g.textBaseline='top';g.globalAlpha=tA;g.fillStyle='#e6edf0';
      wrapLines(title,side?colW:Math.max(sw,160),side?3:2).forEach(function(l){g.fillText(l,tx,fy);fy+=tf2*1.25});g.globalAlpha=1}
    var mA=sstep(140,200,px);if(mA>0){var parts=[];if(w.role)parts.push(w.role);if(w.sub)parts.push(w.sub);if(w.meta&&!/^(portrait|landscape|square)$/.test(w.meta))parts.push(w.meta);if(w.year&&String(w.meta||'').indexOf(String(w.year))<0)parts.push(w.year);
      if(parts.length){var mf=clamp(px*.04,10,15);g.font='300 '+mf.toFixed(1)+'px Poppins, sans-serif';g.fillStyle='#55DAA1';g.textAlign=al;g.textBaseline='top';g.globalAlpha=mA;
        wrapLines(parts.join(' · '),colW,side?3:2).forEach(function(l){g.fillText(l,tx,fy);fy+=mf*1.35});g.globalAlpha=1}}
    var cA=sstep(230,300,px);if(cA>0&&w.credits&&w.credits.length){var cf=clamp(px*.032,10,13);g.font='300 '+cf.toFixed(1)+'px Poppins, sans-serif';g.fillStyle='#c9d3d6';g.globalAlpha=cA;g.textAlign=al;g.textBaseline='top';
      w.credits.slice(0,3).forEach(function(l){wrapLines(l,side?colW:Math.max(sw,220),2).forEach(function(q){g.fillText(q,tx,fy);fy+=cf*1.35})});g.globalAlpha=1}
    if(side)fy=y+sh/2+2;
    /* strip EXPANDS as you zoom closer: its frames reveal one after another with the zoom (no timers, no auto-advance) */
    /* reveal band runs from just past the middle tap-stop to the deepest tap-stop, so every screen size gets all frames */
    var pxMax=Math.max(w.cw,w.chh)*Math.min(SMAX,deepS(w,.82)),lo=Math.max(240,pxMax*.7),st=Math.max(12,(pxMax*.99-lo)/Math.max(1,(w.strip||[]).length));
    var sA=sstep(lo,lo+st,px);if(sA>0&&w.strip){var n=Math.max(4,w.strip.length),gap=6,fw=(sw-gap*(n-1))/n,fh=fw/(w.ar||1.78);fy+=6;
      w.strip.forEach(function(s,j){var a=sstep(lo+j*st,lo+(j+1)*st,px);if(a<=0)return;var k=.72+.28*a,ww=fw*k,hh=fh*k,fx=x-sw/2+j*(fw+gap)+(fw-ww)/2,fyy=fy+(fh-hh)/2;g.globalAlpha=a;
        var im=img(s);if(im)g.drawImage(im,fx,fyy,ww,hh);else{g.fillStyle='rgba(14,20,32,.9)';g.fillRect(fx,fyy,ww,hh)}g.strokeStyle='rgba('+c.tint+',.3)';g.strokeRect(fx+.5,fyy+.5,ww-1,hh-1)});g.globalAlpha=1}
    w._scr=[x,y,px]});
  /* work names at mid zoom (before the pictures take over), decluttered: only the chapter in view */
  var lk=nearestChapter();
  if(z>1.8){vis.forEach(function(v){var w=v[0],px=v[3];if(w.c!==lk||!w.t)return;var na=sstep(1.8,3,z)*(1-sstep(40,75,px));if(na<.02)return;
    g.font='300 12px Poppins, sans-serif';var lab=w.t,tw2=g.measureText(lab).width,sh=w.chh*cam.s,r={x:v[1]+8+Math.max(0,w.cw*cam.s/2),y:v[2]-9,w:tw2+6,h:18};
    if(r.x+r.w>W-4)r.x=v[1]-8-r.w-Math.max(0,w.cw*cam.s/2);if(r.x<4||r.x+r.w>W-4)return;if(r.y<60||r.y>H-30)return;if(!free(r))return;
    g.globalAlpha=na;g.fillStyle='rgba(3,5,10,.6)';g.fillRect(r.x-2,r.y,r.w+2,r.h);g.fillStyle='#e6edf0';g.textAlign='left';g.textBaseline='middle';g.fillText(lab,r.x+2,v[2]);g.globalAlpha=1})}
  /* chapter names + counts (the flat hub's labels), fading as their works take over */
  var cnA=1-sstep(2.2,3.6,z);if(cnA>.01)CH.forEach(function(c){proj(c.cx,c.cy+FIG_H*.5+14,zE(c.z),o);var fs=clamp(12*Math.pow(z,.35),11,18);
    g.font='400 '+fs.toFixed(1)+'px "Julius Sans One", sans-serif';g.textAlign='center';g.textBaseline='top';g.globalAlpha=cnA;g.fillStyle='rgba('+c.tint+',1)';g.fillText(c.nm.toUpperCase(),o[0],o[1]);
    g.font='300 '+(fs*.82).toFixed(1)+'px Poppins, sans-serif';g.fillStyle='#c9d3d6';g.fillText(c.count,o[0],o[1]+fs*1.35);g.globalAlpha=1});
  /* near dust: soft out-of-focus motes, only visible when you move or zoom (depth cue) */
  var ma=motion;if(ma>.01)DUST.forEach(function(d){proj(d.x,d.y,d.z,o);var rad=d.rad*Math.pow(z,.5);if(o[0]<-rad||o[0]>W+rad||o[1]<-rad||o[1]>H+rad)return;g.globalAlpha=d.a*ma;g.drawImage(GW,o[0]-rad,o[1]-rad,rad*2,rad*2)});
  g.globalAlpha=1;
  updateWhere(lk,z);
}
function nearestChapter(){var w=[cam.x,cam.y],best=CH[0],bd=1e18;CH.forEach(function(c){var d=Math.hypot(c.cx-w[0],c.cy-w[1]);if(d<bd){bd=d;best=c}});return best}
var lastWhere='';function updateWhere(c,z){var s='field';
  if(z>1.5){s=c.nm;var bw=null,bd=1e9;WORKS.forEach(function(w){if(w.c!==c||!w._scr)return;var d=Math.hypot(w._scr[0]-W/2,w._scr[1]-H/2);if(w._scr[2]>60&&d<bd){bd=d;bw=w}});
    if(bw&&bw.t)s=c.nm+' · '+bw.t}
  if(s!==lastWhere){WHERE.textContent=s;lastWhere=s}}
/* ---------- loop ---------- */
var last=now(),OUTB=document.getElementById('out');
function frame(t){requestAnimationFrame(frame);var dt=Math.min(.05,(t-last)/1000);last=t;
  if(glide)stepGlide(t);
  if(FL){var k=Math.exp(-dt*4.5);cam.x-=FL.vx*1000*dt/cam.s;cam.y-=FL.vy*1000*dt/cam.s;FL.vx*=k;FL.vy*=k;clampPan();if(Math.hypot(FL.vx,FL.vy)<.02)FL=null;motion=Math.max(motion,.6)}
  /* tilt spring: critically damped, settles flat in ~0.6 s after you let go */
  var wv=9;['x','y'].forEach(function(a){var tg=a==='x'?T.tx:T.ty,v=a==='x'?'vx':'vy',e=T[a]-tg,kk=Math.exp(-wv*dt),c=T[v]+wv*e;T[a]=tg+(e+c*dt)*kk;T[v]=(T[v]-wv*c*dt)*kk});
  if(!drag&&!pinch&&!glide&&!FL)motion*=Math.exp(-dt*2.2);
  draw(t);OUTB.hidden=ON?level()===0:!(window.GJ_OPENER&&GJ_OPENER.P>.03)}
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;var p=W<H*1.05;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);g.setTransform(DPR,0,0,DPR,0,0);
  var rebuild=p!==PORT||!WORKS.length;PORT=p;if(rebuild)build();var c=fitCam();cam.x=c.x;cam.y=c.y;cam.s=c.s}
addEventListener('resize',function(){var L=ON?level():0,F=FOCUS;resize();if(L>0&&F){var v=viewFor(F,L);cam.x=v[0];cam.y=v[1];cam.s=v[2]}});
/* ---------- the name chip, the mark's menu, Hire ---------- */
var CHIP={k:null},CE=document.getElementById('chip');
function nameXY(c){proj(c.cx,c.cy+FIG_H*.5+14,zE(c.z),o);return [o[0],o[1]+8]}
function chipOff(){if(!CHIP.k)return;CHIP.k=null;CE.classList.remove('on');CE.hidden=true}
function chipOn(c,x,y){CHIP.k=c.k;
  CE.innerHTML='<span class="nm" style="color:rgb('+c.tint+')">'+esc(c.nm)+'</span><a href="#" data-open="'+c.k+'">open ›</a>';CE.hidden=false;
  var bw=CE.offsetWidth,bh=CE.offsetHeight,q=nameXY(c),px=clamp(q[0]-bw/2,10,W-bw-10),py=q[1]+26;if(py+bh>H-12)py=q[1]-bh-30;
  CE.style.transform='translate('+px.toFixed(0)+'px,'+Math.max(56,py).toFixed(0)+'px)';requestAnimationFrame(function(){CE.classList.add('on')})}
CE.addEventListener('click',function(e){var a=e.target.closest('a[data-open]');if(!a)return;e.preventDefault();var c=CH.find(function(q){return q.k===a.getAttribute('data-open')});if(c)intoChapter(c)});
/* a chapter's name, where it is drawn (under its figure, while names show) */
function nameAt(x,y){if(1-sstep(2.2,3.6,zf())<.3)return null;var hit=null;
  CH.forEach(function(c){proj(c.cx,c.cy+FIG_H*.5+14,zE(c.z),o);var fs=clamp(12*Math.pow(zf(),.35),11,18);g.font='400 '+fs.toFixed(1)+'px "Julius Sans One", sans-serif';
    var hw=Math.max(44,g.measureText(c.nm.toUpperCase()).width/2+18);if(Math.abs(x-o[0])<=hw&&y>=o[1]-14&&y<=o[1]+fs*2.6+8)hit=c});return hit}
var MENU=false,ME=document.getElementById('menu'),HC=document.getElementById('hirecard');
function menuOff(){if(!MENU&&HC.hidden)return;MENU=false;ME.hidden=true;HC.hidden=true;document.getElementById('home').setAttribute('aria-expanded','false');document.getElementById('hire').setAttribute('aria-expanded','false')}
function menuOn(){chipOff();HC.hidden=true;MENU=true;ME.hidden=false;document.getElementById('home').setAttribute('aria-expanded','true')}
/* the mark: from anywhere, the whole sky in one move; at the whole sky, its small menu (List · Contact · mood) */
document.getElementById('home').addEventListener('click',function(e){e.stopPropagation();
  if(!ON){if(window.GJ_OPENER)GJ_OPENER.go(1);return}
  if(level()===0&&!glide){if(MENU)menuOff();else menuOn();return}home()});
document.getElementById('hire').addEventListener('click',function(e){e.stopPropagation();var on=HC.hidden;menuOff();HC.hidden=!on;this.setAttribute('aria-expanded',String(on))});
document.getElementById('mood').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();menuOff();if(window.GJ_OPENER&&GJ_OPENER.mood)GJ_OPENER.mood(true)});
document.getElementById('out').addEventListener('click',function(e){e.stopPropagation();if(!ON){if(window.GJ_OPENER)GJ_OPENER.back();return}if(CHIP.k||MENU||!HC.hidden){chipOff();menuOff();return}if(history.state&&history.state.lv>0)history.back();else outOne()});
/* ---------- rooms: the last step of a star ---------- */
function roomFor(w){var k=w.c.k;
  if(k==='film')return(!w.masked&&w.play)?w.play:null;
  if(k==='photo')return '../red-light/';
  if(k==='objects')return '../objects/';
  if(k==='sound')return '../sound/';
  if(k==='spaces')return /garden/i.test(w.t||'')?'../spaces/forest-garden/':'../fable-m4/versions/se-a/';
  if(k==='about')return w.kind==='bio'?'../about/bio/?sky=1#about/bio':w.kind==='contact'?'../film/m4/contact/':null;
  return null}
function save(v){try{sessionStorage.setItem('tn-ret',JSON.stringify({href:location.pathname,cam:v||{x:cam.x,y:cam.y,s:cam.s},S0:S0,W:W,H:H,f:FOCUS?[FOCUS.c.k,FOCUS.i]:null,t:Date.now()}))}catch(e){}}
var GOING=false;
function enterRoom(href,w){if(GOING)return;GOING=true;save();try{sessionStorage.setItem('tn-room',new URL(href,document.baseURI).pathname)}catch(e){}
  /* the room grows out of that star: the camera keeps going into the picture for a moment, then the room is there */
  var p=w?scr(w):[W/2,H/2],ts=Math.min(cam.s*2.6,SMAX*1.15);glide=null;var t0=now(),s0=cam.s;document.documentElement.classList.add('tn-going');
  (function grow(){var u=clamp((now()-t0)/380,0,1),e=u*u;zoomAt(p[0],p[1],s0*Math.pow(ts/s0,e));if(u<1)requestAnimationFrame(grow);else location.href=href})()}
function enterRoomFor(w){var h=roomFor(w);if(!h)return;FOCUS=w;enterRoom(h,w)}
/* the top bar's Reel: the reel's own room */
document.getElementById('reel').addEventListener('click',function(e){e.preventDefault();var w=WORKS.find(function(q){return q.slug==='reel-2026'});if(w&&roomFor(w)){save();try{sessionStorage.setItem('tn-room',new URL(roomFor(w),document.baseURI).pathname)}catch(_){}location.href=roomFor(w)}});
/* ---------- one history entry per level, so the browser's Back is one level out too ---------- */
var PEND=false;
function curLv(){return history.state&&history.state.lv||0}
/* the history follows the level as soon as a move starts (so Back right after a move is still one level) */
function syncTo(L){if(!ON||GOING||PEND)return;var c=curLv();
  if(L>c){for(var i=c+1;i<=L;i++)history.pushState({lv:i},'')}
  else if(L<c){PEND=true;history.go(L-c);setTimeout(function(){PEND=false},1200)}}
function settled(){if(!ON||GOING||PEND)return;var L=level();syncTo(L);
  if(L===0&&!glide&&zf()<1.35&&zf()>1.02&&!pinch&&!WB){var f=fitCam();glideTo(f.x,f.y,f.s,500)}}
/* Back (or a history step of our own): when the entry is shallower than the camera, go up to it, one level per entry */
addEventListener('popstate',function(){var was=PEND;PEND=false;if(!ON)return;var t=curLv(),L=level();
  if(t<L){var F=focusOk(FOCUS)?FOCUS:centreWork();if(t===0)home();else goLevel(t,F,800)}else if(was&&t>L)settled()});
/* ---------- the way back from a room, the mark from a room, and the opener ---------- */
function restore(){var r=null;try{r=JSON.parse(sessionStorage.getItem('tn-ret')||'null')}catch(e){}if(!r||!r.cam)return false;
  var k=(r.W===W&&r.H===H)?1:S0/(r.S0||S0);cam.x=r.cam.x;cam.y=r.cam.y;cam.s=clamp(r.cam.s*k,S0,SMAX);glide=null;firstTouch();
  if(r.f){var c=CH.find(function(q){return q.k===r.f[0]});if(c&&c.works[r.f[1]]){FOCUS=c.works[r.f[1]];var v=viewFor(FOCUS,level());cam.x=v[0];cam.y=v[1];cam.s=v[2]}}
  return true}
function enable(){if(ON)return;ON=true;document.documentElement.classList.add('tn-sky');settled()}
var BOOT=null;function hasRet(){try{var r=JSON.parse(sessionStorage.getItem('tn-ret')||'null');return !!(r&&r.cam)}catch(e){return false}}
function boot(){var h=location.hash,nav=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0])||{};
  var m=/^#film\/(.+)$/.exec(h);
  if(h==='#back'||(nav.type==='back_forward'&&hasRet())){history.replaceState(history.state,'',location.pathname+location.search);if(restore())BOOT='sky';return}
  if(h==='#far'||h==='#sky'){history.replaceState(null,'',location.pathname+location.search);BOOT='sky';return}
  if(m){var w=WORKS.find(function(q){return q.c.k==='film'&&q.slug===decodeURIComponent(m[1])});history.replaceState(null,'',location.pathname+location.search);
    if(w){FOCUS=w;var v=viewFor(w,4);cam.x=v[0];cam.y=v[1];cam.s=v[2]}BOOT='sky';return}
  if(!ONE)BOOT='sky'}
addEventListener('pageshow',function(e){if(e.persisted){GOING=false;document.documentElement.classList.remove('tn-going');chipOff();menuOff();
  try{var r=JSON.parse(sessionStorage.getItem('tn-ret')||'null');if(r&&r.cam&&ON){restore()}}catch(_){}}});
/* the field's stars as the opener draws them at its last stage: the same positions, so the opener settles into this */
function fieldPts(){var sv=[cam.x,cam.y,cam.s,T.x,T.y],c=fitCam();cam.x=c.x;cam.y=c.y;cam.s=c.s;T.x=T.y=0;
  var r=WORKS.map(function(w){var p=proj(w.x,w.y,zE(w.z),[0,0,0]);return [p[0],p[1],CH.indexOf(w.c)]});cam.x=sv[0];cam.y=sv[1];cam.s=sv[2];T.x=sv[3];T.y=sv[4];return r}
resize();boot();if(BOOT==='sky')enable();requestAnimationFrame(frame);
/* QA hooks */
window.__cb={st:function(){return{z:+zf().toFixed(3),L:level(),hist:curLv(),on:ON,focus:FOCUS?FOCUS.c.k+':'+FOCUS.i+':'+(FOCUS.t||''):null,cam:{x:+cam.x.toFixed(1),y:+cam.y.toFixed(1),s:+cam.s.toFixed(3)},where:lastWhere,glide:!!glide,gest:{pinch:!!pinch,drag:!!drag,lock:gLock,pts:PT.size},works:WORKS.length,S0:S0,SMAX:SMAX,menu:MENU,chip:CHIP.k}},
  fieldPts:fieldPts,enable:enable,boot:function(){return BOOT},zf:zf,
  counts:function(){var o={};CH.forEach(function(c){o[c.k]=[c.works.length,c.count]});return o},
  work:function(ch,i){var c=CH.find(function(q){return q.k===ch});var w=c.works[i];var p=scr(w);return{x:w.x,y:w.y,scr:[p[0],p[1]],t:w.t,px:cardPx(w),room:roomFor(w)}},
  chip:function(){return CHIP.k},nameAt:function(k){var C=CH.find(function(q){return q.k===k});return nameXY(C)},
  film:function(sl){var w=WORKS.find(function(q){return q.slug===sl});var p=scr(w);return{i:w.i,scr:[p[0],p[1]],px:cardPx(w),room:roomFor(w)}},
  glideTo:glideTo,home:home,level:level,ladder:function(ch,i){var c=CH.find(function(q){return q.k===ch});return ladder(c.works[i])},proj:function(x,y){return proj(x,y,1,[0,0,0]).slice(0,2)}};
})();
