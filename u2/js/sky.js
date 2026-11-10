/* u1 · one sky.
   Far: five constellations around ᑕᐣᓯ, lit by the work, no counts.
   Then a chapter board (stars bloom into titled thumbnails).
   Then the piece: Scope, the filmstrip, the waveform, the feed.
   Drag looks a little. Tap chooses. Tap again opens. Back is one level. */
(function(){
'use strict';
var RM = false;
var Q = new URLSearchParams(location.search);
var PROOF = true;
var PRO2 = 'media/pro2/';
var REELB = PRO2 + 'reel/';
var JOIOB = PRO2 + 'joio/';
var ORDER = ['film','photo','objects','sound','about'];
var ANG = {about:-90,photo:-18,objects:54,sound:126,film:198};
var ANGP = {about:-90,photo:-36,objects:36,sound:144,film:216};
var MINT = '85,218,161';
var SH = {"film":{"t":"150,220,255","s":[[0.105,0.21,0.92,0],[0.89,0.13,0.74,0],[0.93,0.81,0.96,0],[0.065,0.86,0.68,0],[0.209,0.266,0.34,0],[0.33,0.252,0.44,0],[0.465,0.272,0.3,0],[0.685,0.23,0.4,0],[0.809,0.261,0.3,0],[0.201,0.781,0.4,0],[0.297,0.725,0.28,0],[0.431,0.764,0.44,0],[0.533,0.752,0.3,0],[0.679,0.775,0.38,0],[0.816,0.721,0.3,0],[0.075,0.53,0.36,0],[0.485,0.5,0.5,0],[0.98,0.44,0.22,1],[0.025,0.3,0.2,1],[0.58,0.04,0.2,1],[0.35,0.95,0.24,1]],"e":[[0,1],[1,2],[2,3],[3,15]]},"photo":{"t":"170,245,212","s":[[0.505,0.51,1,0],[0.521,0.164,0.82,0],[0.686,0.425,0.62,0],[0.654,0.71,0.9,0],[0.49,0.851,0.58,0],[0.33,0.64,0.78,0],[0.336,0.268,0.66,0],[0.586,0.449,0.3,0],[0.564,0.618,0.36,0],[0.486,0.667,0.28,0],[0.433,0.551,0.38,0],[0.447,0.42,0.3,0],[0.522,0.344,0.34,0],[0.15,0.2,0.24,1],[0.84,0.86,0.2,1],[0.88,0.22,0.3,1]],"e":[[1,2],[2,3],[3,4],[5,6],[6,1],[1,7],[2,8],[3,9],[4,10],[5,11],[6,12]]},"objects":{"t":"255,236,205","s":[[0.32,0.37,0.78,0],[0.585,0.33,0.98,0],[0.605,0.89,0.74,0],[0.305,0.92,0.6,0],[0.465,0.12,0.5,0],[0.735,0.09,0.7,0],[0.755,0.63,0.55,0],[0.45,0.64,0.2,0],[0.18,0.22,0.26,1],[0.89,0.4,0.22,1],[0.8,0.92,0.3,1],[0.31,0.65,0.3,0]],"e":[[0,1],[1,2],[2,3],[3,11],[11,0],[4,5],[5,6],[0,4],[1,5],[2,6]]},"sound":{"t":"255,182,176","s":[[0.058,0.493,0.35,0],[0.143,0.434,0.45,0],[0.195,0.295,0.63,0],[0.186,0.645,0.45,0],[0.282,0.392,0.53,0],[0.338,0.216,0.8,0],[0.347,0.763,0.55,0],[0.441,0.135,0.92,0],[0.442,0.812,0.62,0],[0.498,0.253,0.71,0],[0.567,0.183,0.86,0],[0.57,0.827,0.58,0],[0.659,0.355,0.57,0],[0.718,0.259,0.66,0],[0.719,0.711,0.47,0],[0.807,0.434,0.44,0],[0.886,0.419,0.5,0],[0.941,0.497,0.35,0],[0.26,0.93,0.2,1],[0.61,0.06,0.24,1],[0.9,0.88,0.26,1],[0.15,0.7,0.3,1]],"e":[[2,3],[5,6],[7,8],[10,11],[13,14],[0,1],[1,2],[2,4],[4,5],[5,7],[7,9],[9,10],[10,12],[12,13],[13,15],[15,16],[16,17]]},"about":{"t":"214,222,236","s":[[0.309,0.271,0.7,0],[0.209,0.272,0.45,0],[0.113,0.366,0.6,0],[0.067,0.587,0.85,0],[0.103,0.808,0.5,0],[0.202,0.903,0.6,0],[0.31,0.882,0.55,0],[0.361,0.254,0.5,0],[0.46,0.301,0.4,0],[0.475,0.408,0.7,0],[0.422,0.569,0.42,0],[0.362,0.556,0.5,0],[0.583,0.94,0.65,0],[0.589,0.61,0.55,0],[0.681,0.587,0.5,0],[0.738,0.451,0.45,0],[0.748,0.224,0.9,0],[0.932,0.127,0.5,0],[0.963,0.206,0.8,0],[0.956,0.305,0.55,0],[0.917,0.366,0.36,0],[0.88,0.28,0.2,0],[0.45,0.92,0.22,1],[0.5,0.1,0.2,1]],"e":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[7,8],[8,9],[9,10],[10,11],[12,13],[13,14],[14,15],[15,16],[17,18],[18,19],[19,20]]}};
var STROKES = [[[-58.5,-96],[-156.5,-95],[-203.5,-61],[-213.5,1],[-203.5,63],[-156.5,97],[-58.5,97]],[[-26.5,-97],[25.5,-94],[44.5,-51],[25.5,-8],[-26.5,-5]],[[99.5,105],[99.5,20],[149.5,15],[191.5,-11],[211.5,-55],[214.5,-105]]];
var $=function(id){return document.getElementById(id)};
var cv=$('cv'),g=cv.getContext('2d'),stage=$('stage');
var W=0,H=0,DPR=1,PORT=false;
var data=null,CH={},byId={},progress=[],cluster=[];
/* site-3d's critically damped spring (sstep). Level changes use its glide
   weight, so a board arrives and settles instead of easing like a button.
   Drag never yaws the camera. */
function S(x,w){return{x:x,v:0,t:x,w:w}}
function sstep(s,dt){var w=s.w,e=s.x-s.t,k=Math.exp(-w*dt),c=s.v+w*e;s.x=s.t+(e+c*dt)*k;s.v=(s.v-w*c*dt)*k}
var W_GLIDE=RM?16:4.8,W_LOOK=RM?16:9.5;
var cxS=S(0,W_GLIDE),cyS=S(0,W_GLIDE),csS=S(.3,W_GLIDE);
var bxS=S(0,W_GLIDE),pxS=S(0,W_GLIDE),lxS=S(0,W_LOOK),lyS=S(0,W_LOOK),scr=S(0,10);
var rest={x:0,y:0,s:.3},look={x:0,y:0},FAR={x:0,y:0,s:.3};
var bloom=0,bloomK=null,pbloom=0,scrK=null;
var cur={lv:0,k:null,id:null},sel=null,phase='boot';
var flyU=1,flyT=0,markPts=[],markTo=[];
var landI=0,landT=0,lands=[];
var drag=null,pinch=null,moved=false,PT={};
var song=null,playing=false,au=null,AC=null,AN=null,FD=null,TD=null,L={rms:0,beat:0};
var CHIMES=[],reelCtl=null,lastT=0,ready=false;
var GLOW={};

function rnd(i){var x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,u){return a+(b-a)*u}
function ease(u){u=clamp(u,0,1);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2}
function now(){return performance.now()}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

function boot(d){
  data=d;
  d.chapters.forEach(function(ch){
    var c=CH[ch.k]={k:ch.k,tint:ch.tint,items:[],skyItems:[],node:[],dec:[],sky:[],arm:[],x:0,y:0};
    ch.cards.forEach(function(card){
      var it=Object.assign({ox:0,oy:0,sx:0,sy:0,gx:0,gy:0,cx:0,cy:0,px:0,py:0,b:.6,sh:0,tw:52,th:29},card);
      c.items.push(it);byId[it.id]=it;
      if(it.in_progress)progress.push(it);else c.skyItems.push(it);
    });
  });
  /* In progress sits by the mark: the carve, the three boards, and the Lost Coffee songs. */
  if(byId['sound/to-go']&&progress.indexOf(byId['sound/to-go'])<0)progress.push(byId['sound/to-go']);
  d.tracks.forEach(function(t){
    t._i=0;
    if(t.artist!=='Lost Coffee'||t.k==='togo')return;
    var it={id:'sound/track/'+t.k,chapter:'sound',k:t.k,slug:t.k,title:t.title,role:'Lost Coffee',year:null,meta:'Lost Coffee',kind:'track',track:t,media:{},credits:[],related:[],also:[],in_progress:true,body:'',isNew:false,ox:0,oy:0,sx:0,sy:0,gx:0,gy:0,cx:0,cy:0,px:0,py:0,b:.6,sh:0,tw:52,th:29};
    byId[it.id]=it;progress.push(it);
  });
  cluster=['objects/hand-carved-piece','objects/design-board','objects/wireframe-board','objects/materials-board','sound/to-go','sound/track/noproblem','sound/track/lostintime','sound/track/equals','sound/track/ii'].map(function(id){return byId[id]}).filter(Boolean);
  cluster.forEach(function(it){var c=CH[it.chapter];if(c)c.skyItems=c.skyItems.filter(function(x){return x!==it})});
  if(window.GJ_INNER)GJ_INNER.build({PRO2:PRO2,JOIOB:JOIOB,CH:CH,byId:byId});
  mergeCredits();
  song=d.tracks[0];
  buildGlow();buildField();layout();
  fillPoem();dust();
  lands=landFrames();
  bind();
  decide();
  ready=true;
  requestAnimationFrame(frame);
}

function mergeCredits(){
  var C=window.GJ_COPY&&GJ_COPY.credits;if(!C)return;
  Object.keys(byId).forEach(function(id){
    var it=byId[id];if(!it||it.chapter!=='film')return;
    var row=C[it.k];if(!row)return;
    var bits=(it.credits||[]).slice();
    function add(s){if(s&&bits.indexOf(s)<0)bits.push(s)}
    if(row.dir)add('dir. '+row.dir);
    if(row.cam)add(row.cam);
    if(row.prod)add(row.prod);
    if(row.agency)add(row.agency);
    if(row.b)add(row.b);
    it.credits=bits;
  });
}
function buildGlow(){
  function glow(rgb){var c=document.createElement('canvas');c.width=c.height=128;var q=c.getContext('2d'),gr=q.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,'rgba('+rgb+',.95)');gr.addColorStop(.18,'rgba('+rgb+',.4)');gr.addColorStop(.55,'rgba('+rgb+',.08)');gr.addColorStop(1,'rgba('+rgb+',0)');
    q.fillStyle=gr;q.fillRect(0,0,128,128);return c}
  GLOW.w=glow('205,225,255');GLOW.m=glow(MINT);GLOW.c=glow('160,190,240');
  ORDER.forEach(function(k){CH[k].glow=glow(CH[k].tint)});
}
var FIELD=[];
function buildField(){
  [[0,220,.15,.45,.5],[1,110,.4,.6,.9],[2,48,.72,.85,1.3]].forEach(function(L){
    var pts=[];for(var i=0;i<L[1];i++)pts.push({x:rnd(L[0]*1000+i)*2400-1200,y:rnd(L[0]*3000+i)*2400-1200,b:.15+.85*Math.pow(rnd(L[0]*700+i),2),r:.4+L[4]*rnd(L[0]*90+i)});
    FIELD.push({f:L[2],a:L[3],pts:pts});
  });
}

function placeChapter(c){
  var S=SH[c.k],items=c.skyItems,cw=c.k==='photo'||c.k==='objects'?60:74,chh=c.k==='photo'||c.k==='objects'?78:56;
  if(c.k==='about'){cw=120;chh=40}
  var n=Math.max(items.length,1),A=Math.max(n*cw*chh*1.35,380*190),q=PORT?.92:.5;
  var bw=Math.sqrt(A/q),bh=bw*q;if(c.k==='about')bw=Math.max(bw,PORT?300:420);
  c.bw=bw;c.bh=bh;c.cell=[cw,chh];
  var P=S.s.map(function(p,i){return{i:i,ox:(p[0]-.5)*bw,oy:(p[1]-.5)*bh,b:p[2],st:p[3]}});
  var order=P.filter(function(p){return !p.st}).sort(function(a,b){return b.b-a.b||a.i-b.i});
  var list=items.slice().sort(function(a,b){return (b.isNew-a.isNew)||(a.i-b.i)});
  var placed=[],ii=0;c.node=[];
  function ok(x,y){for(var i=0;i<placed.length;i++){var p=placed[i];if(Math.abs(p.ox-x)<cw*.92&&Math.abs(p.oy-y)<chh*.92)return false}return true}
  order.forEach(function(p){if(ii>=list.length)return;if(ok(p.ox,p.oy)){var it=list[ii++];it.ox=p.ox;it.oy=p.oy;it.b=p.b;it.sh=1;placed.push(it);c.node[p.i]=it}});
  var cand=[];
  for(var r=-8;r<=8;r++)for(var qq=-8;qq<=8;qq++){var x=(qq+((r&1)?.5:0))*cw,y=r*chh;cand.push({x:x,y:y,d:Math.pow(x/(bw/2),2)+Math.pow(y/(bh/2),2)})}
  cand.sort(function(a,b){return a.d-b.d});
  for(var ci=0;ii<list.length&&ci<cand.length;ci++){var p=cand[ci];if(ok(p.x,p.y)){var it2=list[ii++];it2.ox=p.x;it2.oy=p.y;it2.b=.35;it2.sh=0;placed.push(it2)}}
  P.forEach(function(p){if(c.node[p.i])return;c.node[p.i]={ox:p.ox,oy:p.oy,b:p.b,st:p.st,dec:1,x:0,y:0}});
  c.dec=c.node.filter(function(n){return n&&n.dec});
  c.sky=[];S.e.forEach(function(e){var a=c.node[e[0]],b=c.node[e[1]];if(a&&b)c.sky.push([a,b])});
  var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  function inc(x,y){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  items.forEach(function(it){inc(it.ox,it.oy)});c.dec.forEach(function(d){inc(d.ox,d.oy)});
  c.ex={x0:x0-16,y0:y0-16,x1:x1+16,y1:y1+16};
}
function chapterAt(k,rx,ry){var a=(PORT?ANGP:ANG)[k]*Math.PI/180;return{x:Math.cos(a)*rx,y:Math.sin(a)*ry}}
function layout(){
  DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;PORT=H>W*1.05;
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px';
  ORDER.forEach(function(k){placeChapter(CH[k])});
  var rx=PORT?300:500,ry=PORT?460:380,scale=1,box;
  for(var n=0;n<28;n++){
    ORDER.forEach(function(k){var c=CH[k],p=chapterAt(k,rx,ry);c.x=p.x;c.y=p.y});
    box=bbox();
    var centre={x0:-70,y0:-80,x1:70,y1:160};
    var hitC=false;
    ORDER.forEach(function(k){var c=CH[k],x0=c.x+c.ex.x0,x1=c.x+c.ex.x1,y0=c.y+c.ex.y0,y1=c.y+c.ex.y1;
      if(x0<centre.x1&&centre.x0<x1&&y0<centre.y1&&centre.y0<y1)hitC=true});
    if(hitC){rx*=1.06;ry*=1.06;continue}
    scale=Math.min((W-28)/(box.x1-box.x0),(H-78-36)/(box.y1-box.y0));
    var label=40/scale;
    var overlap=false;
    var rects=ORDER.map(function(k){var c=CH[k];return{x0:c.x+c.ex.x0,x1:c.x+c.ex.x1,y0:c.y+c.ex.y0,y1:c.y+c.ex.y1+label}});
    for(var i=0;i<rects.length;i++)for(var j=i+1;j<rects.length;j++){var a=rects[i],b=rects[j];
      if(a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1)overlap=true}
    if(overlap){rx*=1.05;ry*=1.05;continue}
    break;
  }
  ORDER.forEach(function(k){var c=CH[k];
    c.skyItems.forEach(function(it){it.sx=c.x+it.ox;it.sy=c.y+it.oy});
    c.dec.forEach(function(d){d.x=c.x+d.ox;d.y=c.y+d.oy});
    c.node.forEach(function(nd){if(nd&&nd.dec){nd.x=c.x+nd.ox;nd.y=c.y+nd.oy}else if(nd&&nd.sx!=null){nd.x=nd.sx;nd.y=nd.sy}});
  });
  /* A small ring around ᑕᐣᓯ. The five chapters stay on the outer ring. */
  var nC=Math.max(cluster.length,1);
  cluster.forEach(function(it,i){
    var a=-Math.PI/2+i/nC*Math.PI*2;
    it.cx=Math.cos(a)*128;
    it.cy=Math.sin(a)*92+8;
    it._cluster=1;
  });
  progress.forEach(function(it){if(!it._cluster){it.cx=0;it.cy=120}});
  boards();
  FAR={x:0,y:0,s:scale};
  if(!ready){cxS.x=cxS.t=0;cyS.x=cyS.t=0;csS.x=csS.t=scale;rest.s=scale}
  markPair();
}
function bbox(){
  var b={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};
  ORDER.forEach(function(k){var c=CH[k];b.x0=Math.min(b.x0,c.x+c.ex.x0);b.x1=Math.max(b.x1,c.x+c.ex.x1);b.y0=Math.min(b.y0,c.y+c.ex.y0-20);b.y1=Math.max(b.y1,c.y+c.ex.y1+36)});
  b.x0=Math.min(b.x0,-80);b.x1=Math.max(b.x1,80);b.y0=Math.min(b.y0,-90);b.y1=Math.max(b.y1,200);
  return b;
}
function boards(){
  var s=boardScale();
  ORDER.forEach(function(k){
    var c=CH[k],cols=W<520?2:W<900?3:4,gap=8,side=12,cap=34;
    var tw=(W-side*2-(cols-1)*gap)/cols,th=k==='about'?42:(k==='photo'||k==='objects'?tw:tw*9/16);
    var pitch=th+cap+10,n=c.items.length,rows=Math.ceil(n/cols);
    var bw=cols*tw+(cols-1)*gap,bh=rows*pitch;
    c.items.forEach(function(it,i){
      var r=Math.floor(i/cols),q=i%cols;
      it.tw=tw/s;it.th=th/s;
      it.gx=c.x+((q+.5)*tw+q*gap-bw/2)/s;
      it.gy=c.y+((r)*pitch+th/2-bh/2)/s;
    });
    c.bex={x0:c.x-bw/2/s-8,x1:c.x+bw/2/s+8,y0:c.y-bh/2/s-8,y1:c.y+bh/2/s+8};
  });
  var s2=boardScale(),cols2=2,gap2=10,tw2=(Math.min(W,520)-36)/2,th2=tw2*9/16,cap2=32,pitch2=th2+cap2+12;
  var bw2=cols2*tw2+gap2,bh2=2*pitch2;
  progress.forEach(function(it,i){
    var r=Math.floor(i/2),q=i%2;
    it.tw=tw2/s2;it.th=th2/s2;
    it.px=((q+.5)*tw2+q*gap2-bw2/2)/s2;
    it.py=(168)+((r)*pitch2+th2/2-bh2/2)/s2;
  });
}
function boardScale(){return clamp(W/280,1.15,2.4)}
function fitBox(b,top,bot){
  var s=Math.min((W-24)/(b.x1-b.x0),(H-top-bot)/(b.y1-b.y0));
  var cy=(top+(H-bot))/2;
  return {x:(b.x0+b.x1)/2,y:(b.y0+b.y1)/2-(cy-H/2)/s,s:s};
}
function camFor(st){
  if(!st||st.lv===0)return FAR;
  if(st.lv===2&&st.id&&byId[st.id]&&byId[st.id].kind==='player'){
    var c=CH.sound,e=c.ex;return fitBox({x0:c.x+e.x0,y0:c.y+e.y0,x1:c.x+e.x1,y1:c.y+e.y1},70,160);
  }
  /* a short dolly toward the chapter. The board itself is a window in the sky, not a zoom that fills the phone. */
  if(st.k==='progress')return {x:0,y:36,s:FAR.s*1.28};
  if(CH[st.k])return {x:CH[st.k].x*0.18,y:CH[st.k].y*0.14,s:FAR.s*1.32};
  return FAR;
}
function aim(s,t,instant){s.t=t;s.w=(instant||RM)?40:W_GLIDE;if(instant||RM){s.x=t;s.v=0}}

function cam(){return {x:rest.x+look.x,y:rest.y+look.y,s:rest.s}}
function sp(x,y){var c=cam();return [(x-c.x)*c.s+W/2,(y-c.y)*c.s+H/2]}
function wp(x,y){var c=cam();return [(x-W/2)/c.s+c.x,(y-H/2)/c.s+c.y]}

function stepSprings(dt){
  if(!drag){sstep(lxS,dt);sstep(lyS,dt)}
  sstep(cxS,dt);sstep(cyS,dt);sstep(csS,dt);sstep(bxS,dt);sstep(pxS,dt);
  if(!drag||cur.lv<1)sstep(scr,dt);
  rest.x=cxS.x;rest.y=cyS.x;rest.s=Math.max(.02,csS.x);
  look.x=lxS.x;look.y=lyS.x;
  bloom=bxS.x;pbloom=pxS.x;
  if(bxS.t===0&&bloom<.02&&pxS.t===0&&pbloom<.02)bloomK=null;
}
function arriveAt(st,instant){
  var to=camFor(st);
  var player=st.lv===2&&st.id&&byId[st.id]&&byId[st.id].kind==='player';
  var b1=(st.lv>=1&&st.k&&st.k!=='progress'&&!player)?1:0;
  var p1=(st.k==='progress')?1:0;
  if(b1>0||p1>0)bloomK=st.k;
  aim(cxS,to.x,instant);aim(cyS,to.y,instant);aim(csS,to.s,instant);
  aim(bxS,b1,instant);aim(pxS,p1,instant);
  aim(lxS,0,instant);aim(lyS,0,instant);
  if(st.k!==scrK||st.lv===0){aim(scr,0,instant);scrK=st.lv===0?null:st.k}
  if(instant||RM){rest.x=to.x;rest.y=to.y;rest.s=to.s;bloom=b1;pbloom=p1;look.x=look.y=0;if(!b1&&!p1)bloomK=st.k}
  renderLayer();syncBio();ui();
  if(st.k&&CH[st.k])want(st.k);
  if(st.k==='progress')progress.forEach(loadImg);
}

function posOf(it){
  if(it.in_progress)return [it.cx,it.cy];
  return [it.sx,it.sy];
}
function screenOf(it){
  if(cur.lv>=1&&(cur.k==='progress'?pbloom:bloom)>.65){
    var items=boardItems(),i=items.indexOf(it);
    if(i>=0){var rc=tileRect(gridSpec(boardKey()),i,scr.x);return [rc.x+rc.w/2,rc.y+rc.h/2]}
  }
  var p=posOf(it);return sp(p[0],p[1]);
}

function want(k){var c=CH[k];if(!c||c._w)return;c._w=1;c.items.forEach(loadImg)}
function loadImg(it){
  if(!it||it._im)return;var src=(it.media&&(it.media.thumb||it.media.big))||'';if(!src)return;
  var im=new Image();im.decoding='async';
  im.onload=function(){it.ld=1};
  im.onerror=function(){if(!it._x){it._x=1;im.crossOrigin=null;im.src=src}};
  try{im.crossOrigin='anonymous'}catch(e){}
  im.src=src;it._im=im;
}
function washImgs(k){
  var c=CH[k];if(k==='about')return [];
  var prefer={film:['one-with-the-devil','weird-kid','legends'],objects:['hand-carved-piece','joio'],sound:['waveform','to-go','lost-coffee'],photo:[]};
  var ids=prefer[k]||[];
  var list=[];
  ids.forEach(function(sl){var it=c.items.filter(function(i){return i.slug===sl})[0];if(it){loadImg(it);if(it._im)list.push(it._im)}});
  if(list.length<2)c.skyItems.slice(0,3).forEach(function(it){loadImg(it);if(it._im&&list.indexOf(it._im)<0)list.push(it._im)});
  return list.filter(function(im){return im.complete&&im.naturalWidth});
}

function frame(t){
  var dt=Math.min(.05,(t-(lastT||t))/1000);lastT=t;
  if(phase==='fly'){flyU=clamp((t-flyT)/(RM?1:1100),0,1);if(flyU>=1){phase='land';landI=0;landT=t;showLand();setChrome()}}
  if(phase==='land'&&!RM&&Q.get('land')!=='1'&&t-landT>3600)nextLand();
  stepSprings(dt);if(playing)listen();
  if(CHIMES.length)chStep(dt);
  if(window.GJ_DEPTH){GJ_DEPTH.tick(t);if(phase==='fly')GJ_DEPTH.fly(flyU)
    var psc=GJ_DEPTH.viewScale(),pel=$('layer'),psnd=$('snd');
    if(pel)pel.style.transform=psc!==1?'scale('+psc.toFixed(3)+')':'';
    if(psnd)psnd.style.transform=psc!==1?'scale('+psc.toFixed(3)+')':'';
  }
  draw(t);
  syncExtras();
  if(window.GJ_DEPTH&&GJ_DEPTH.state().film>=3)GJ_DEPTH.paintField();
  if(window.GJ_INNER&&GJ_INNER.active())GJ_INNER.tick(t);
  requestAnimationFrame(frame);
}

function farA(){var z=rest.s/Math.max(1e-4,FAR.s);return clamp(1-(z-1.15)/1.5,0,1)}
function draw(t){
  var sc=window.GJ_DEPTH?GJ_DEPTH.viewScale():1;
  g.setTransform(DPR,0,0,DPR,0,0);
  if(sc!==1){g.translate(W/2,H*0.46);g.scale(sc,sc);g.translate(-W/2,-H*0.46)}
  g.clearRect(-W,-H,W*3,H*3);
  if(phase==='arrive'||phase==='fly'){drawMark(phase==='fly'?ease(flyU):0);return}
  if(phase==='land')return;
  var fa=farA(),lk=look;
  FIELD.forEach(function(L){
    g.globalAlpha=L.a*(.35+.65*Math.min(1,fa+.4));
    L.pts.forEach(function(p){
      var x=(p.x-lk.x*L.f*140)*1+W/2-(rest.x*rest.s)*L.f*0.15;
      var y=(p.y-lk.y*L.f*140)*1+H/2-(rest.y*rest.s)*L.f*0.15;
      x=((x%W)+W)%W;y=((y%H)+H)%H;
      g.fillStyle='rgba(220,230,245,'+(0.25+p.b*.6)+')';
      g.beginPath();g.arc(x,y,p.r,0,7);g.fill();
    });
  });
  g.globalAlpha=1;
  /* spokes */
  if(fa>.05&&cur.lv===0){g.strokeStyle='rgba(170,200,235,'+(0.13*fa)+')';g.beginPath();
    ORDER.forEach(function(k){var a=sp(0,0),b=sp(CH[k].x,CH[k].y);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])});g.stroke()}
  ORDER.forEach(function(k){drawChapter(k,t,fa)});
  drawCluster(fa);
  drawThreads(fa);
  drawCentre(fa*(cur.lv===0?1:0));
  if(fa>.25&&cur.lv===0)drawNames(fa);
  drawWindow();
  drawRelated();
  if(cur.lv===2&&cur.id&&byId[cur.id]&&byId[cur.id].kind==='player'&&!(window.GJ_DEPTH&&GJ_DEPTH.soundOn()))drawSound(t);
  if(sc!==1)g.setTransform(DPR,0,0,DPR,0,0);
  var fx=document.getElementById('fx');
  if(fx&&window.GJ_DEPTH){
    if(fx.width!==cv.width||fx.height!==cv.height){fx.width=cv.width;fx.height=cv.height}
    var fg=fx.getContext('2d');fg.setTransform(DPR,0,0,DPR,0,0);fg.clearRect(0,0,W,H);
    GJ_DEPTH.drawFx(fg,W,H);
  }
  if(pinch&&PT){
    var ids=Object.keys(PT);
    g.fillStyle='rgba(255,255,255,.85)';
    ids.forEach(function(id){var p=PT[id];g.beginPath();g.arc(p.x,p.y,7,0,7);g.fill()});
  }
}

function drawChapter(k,t,fa){
  var c=CH[k],focus=(cur.lv===0||cur.k===k||cur.k==='progress')?1:.28;
  var bl=(bloomK===k)?bloom:0;
  var cp=sp(c.x,c.y),R=Math.max(c.bw,c.bh)*.6*rest.s;
  if(cp[0]<-R-240||cp[0]>W+R+240||cp[1]<-R-240||cp[1]>H+R+240)return;
  var imgs=washImgs(k),showWash=fa>.2&&bl<.35&&imgs.length;
  if(showWash){
    var i=Math.floor(t/4200)%imgs.length,u=(t%4200)/4200,im=imgs[i],im2=imgs[(i+1)%imgs.length];
    var rad=Math.max(90,Math.max(c.bw,c.bh)*.48*rest.s);
    g.save();g.beginPath();g.ellipse(cp[0],cp[1],rad,rad*.78,0,0,7);g.clip();
    g.globalAlpha=.2*(1-u)*focus;cover(im,cp[0]-rad,cp[1]-rad*.78,rad*2,rad*1.56);
    g.globalAlpha=.2*u*focus;cover(im2,cp[0]-rad,cp[1]-rad*.78,rad*2,rad*1.56);
    g.restore();
    var vg=g.createRadialGradient(cp[0],cp[1],rad*.2,cp[0],cp[1],rad);
    vg.addColorStop(0,'rgba(4,7,11,0)');vg.addColorStop(1,'rgba(4,7,11,.55)');
    g.fillStyle=vg;g.beginPath();g.ellipse(cp[0],cp[1],rad,rad*.78,0,0,7);g.fill();
  }
  var nr=Math.max(c.bw,c.bh)*.55*rest.s;
  if(nr>8){var gr=g.createRadialGradient(cp[0],cp[1],0,cp[0],cp[1],nr);
    gr.addColorStop(0,'rgba('+c.tint+','+(0.06*focus)+')');gr.addColorStop(1,'rgba('+c.tint+',0)');
    g.fillStyle=gr;g.fillRect(cp[0]-nr,cp[1]-nr,nr*2,nr*2)}
  var la=focus*(1-bl)*.55*Math.max(fa,.35);
  if(la>.02){g.strokeStyle='rgba('+c.tint+','+la+')';g.lineWidth=1;g.beginPath();
    c.sky.forEach(function(L){var pa=nodePos(L[0]),pb=nodePos(L[1]),a=sp(pa[0],pa[1]),b=sp(pb[0],pb[1]);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])});g.stroke()}
  if(bl<.85)c.dec.forEach(function(d){var q=sp(d.x,d.y);star(q,(d.b||.4),c,false,focus*(1-bl),t)});
  var list=(k==='objects')?c.items:c.skyItems;
  if(cur.k==='progress'&&k==='objects')list=c.skyItems;
  list.forEach(function(it){if(it.in_progress&&!(k==='objects'&&bl>.02))return;drawItem(it,bl,focus)});
}
function nodePos(n){if(n.id)return posOf(n);return [n.x,n.y]}
function star(q,b,c,mint,a,t){
  if(a<.02||q[0]<-20||q[0]>W+20||q[1]<-20||q[1]>H+20)return;
  var pulse=(t&&!RM)?(1+.07*Math.sin(t/900+(q[0]+q[1])*.01)):1;
  var gs=(5+16*b)*pulse*(mint?1.3:1);g.globalAlpha=a*(.45+.5*b);
  g.drawImage(mint?GLOW.m:c.glow,q[0]-gs,q[1]-gs,gs*2,gs*2);
  g.globalAlpha=a;g.fillStyle=mint?'rgb('+MINT+')':'#fff';
  g.beginPath();g.arc(q[0],q[1],Math.max(1.1,1+b*1.6),0,7);g.fill();g.globalAlpha=1;
}
function drawItem(it,bl,focus){
  var p=posOf(it),q=sp(p[0],p[1]);if(q[0]<-160||q[0]>W+160||q[1]<-160||q[1]>H+160)return;
  var c=CH[it.chapter],mint=it.isNew,selOn=sel&&sel.id===it.id;
  var e=ease(clamp(it.in_progress&&cur.k==='progress'?pbloom:bl,0,1));
  var inWin=cur.lv>=1&&((it.in_progress&&cur.k==='progress')||(bloomK===it.chapter&&cur.k!=='progress'));
  if(e<.98)star(q,it.b||.5,c,mint,focus*(1-e)*(selOn?1:0.9)*(inWin?.35:1));
  if(selOn&&e<.5&&!inWin){g.strokeStyle='rgba('+MINT+',.9)';g.lineWidth=1.2;g.beginPath();g.arc(q[0],q[1],11,0,7);g.stroke()}
  if(inWin)return;
  if(e>.02){
    var w=lerp(6,it.tw*rest.s,e),h=lerp(6,it.th*rest.s,e),x=q[0]-w/2,y=q[1]-h/2;
    g.globalAlpha=focus*Math.min(1,e*1.3);
    if(it._im&&it.ld)cover(it._im,x,y,w,h);
    else{g.fillStyle='rgba('+c.tint+',.16)';g.fillRect(x,y,w,h)}
    g.strokeStyle=selOn?'rgba('+MINT+',.95)':'rgba(220,230,240,.28)';g.lineWidth=selOn?1.6:1;
    g.strokeRect(x+.5,y+.5,w-1,h-1);g.globalAlpha=1;
    if(e>.62){
      var cap=it.title||'',role=it.role||it.meta||'';
      g.font='300 11px Poppins,sans-serif';g.textAlign='left';g.textBaseline='top';
      g.fillStyle='#eef3f5';g.fillText(cut(cap,w-2),x,y+h+3);
      if(role){g.font='300 10px Poppins,sans-serif';g.fillStyle=it.role?'rgb('+MINT+')':'rgba(201,211,214,.8)';g.fillText(cut(role,w-2),x,y+h+16)}
    }
  }
}
function cut(s,max){if(g.measureText(s).width<=max)return s;while(s.length>1&&g.measureText(s+'…').width>max)s=s.slice(0,-1);return s+'…'}
function cover(im,x,y,w,h,crop){
  var iw=im.naturalWidth,ih=im.naturalHeight;if(!iw||!ih)return;
  g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  if(crop){g.drawImage(im,crop[0]*iw,crop[1]*ih,crop[2]*iw,crop[3]*ih,x,y,w,h)}
  else{var s=Math.max(w/iw,h/ih),dw=iw*s,dh=ih*s;g.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
  g.restore();
}
function drawCluster(fa){
  if(cur.k==='progress'&&pbloom>.85)return;
  if(cur.k==='objects'&&bloom>.5)return;
  if(!cluster.length)return;
  var on=!!(sel&&sel.prog),fade=(cur.k==='progress'?1-pbloom:1);
  var pts=cluster.map(function(it){return sp(it.cx,it.cy)});
  if(cur.lv===0&&fade>.2&&pts.length>1){
    g.strokeStyle='rgba(214,222,236,'+(0.16*fade)+')';g.lineWidth=1;g.beginPath();
    pts.forEach(function(p,i){if(i)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1])});
    g.closePath();g.stroke();
  }
  cluster.forEach(function(it,i){
    if(cur.k==='objects'&&bloom>.15&&it.chapter==='objects')return;
    var q=pts[i];if(!q)return;
    star(q,.7,CH[it.chapter]||CH.objects,false,(on?1:.85)*fade);
    if(sel&&sel.id===it.id){g.strokeStyle='rgba('+MINT+',.9)';g.beginPath();g.arc(q[0],q[1],11,0,7);g.stroke()}
  });
}
function drawCentre(a){
  if(a<.04||(cur.lv===2&&cur.id&&byId[cur.id]&&byId[cur.id].kind==='player'))return;
  var o=sp(0,0),gf=clamp(26*Math.sqrt(rest.s/Math.max(.2,FAR.s)),22,48);
  g.globalAlpha=a*.9;g.drawImage(GLOW.c,o[0]-gf*2.2,o[1]-gf*2.2,gf*4.4,gf*4.4);
  g.font='700 '+gf+'px Syl,sans-serif';g.textAlign='center';g.textBaseline='middle';g.globalAlpha=a;
  g.fillStyle='rgba(10,189,240,.55)';g.fillText('ᑕᐣᓯ',o[0]-1.1,o[1]);
  g.fillStyle='rgba(254,1,1,.45)';g.fillText('ᑕᐣᓯ',o[0]+1.1,o[1]);
  g.fillStyle='#fff';g.fillText('ᑕᐣᓯ',o[0],o[1]);
  if(cur.lv===0){
    g.font='400 13px "Julius Sans One",sans-serif';g.textBaseline='top';
    g.fillStyle='rgba(10,189,240,.8)';g.fillText('gill james',o[0]-1.6,o[1]+gf*.62);
    g.fillStyle='rgba(254,1,1,.7)';g.fillText('gill james',o[0]+1.6,o[1]+gf*.62);
    g.fillStyle='rgba(244,247,251,.92)';g.fillText('gill james',o[0],o[1]+gf*.62);
    var lines=['I am an artist','All my relations,'];
    g.font='200 12.5px Poppins,sans-serif';g.fillStyle='rgba(238,243,245,.86)';
    lines.forEach(function(ln,i){g.fillText(ln,o[0],o[1]+gf*.62+18+i*16)});
    g.textBaseline='alphabetic';
  }
  g.globalAlpha=1;
}
function drawNames(fa){
  g.textAlign='center';g.textBaseline='alphabetic';
  ORDER.forEach(function(k){
    var c=CH[k],p=sp(c.x,c.y+c.ex.y1),y=p[1]+20;
    if(y<48||y>H-8)return;
    var on=sel&&sel.type==='ch'&&sel.k===k;
    g.globalAlpha=fa*(on?.9:.5);
    g.font='400 11px "Julius Sans One",Poppins,sans-serif';
    g.fillStyle=on?'rgb('+MINT+')':'rgba(228,235,245,.8)';
    g.letterSpacing='3px';
    g.fillText(k.toUpperCase(),p[0],y);
    g.letterSpacing='0px';
    g.globalAlpha=1;
  });
}
function boardKey(){return cur.k==='progress'?'progress':cur.k}
function boardItems(){
  var b=window.GJ_DEPTH&&GJ_DEPTH.board();
  if(b&&b.items)return b.items;
  if(cur.k==='progress')return progress;
  var c=CH[cur.k];return c?c.items:[];
}
function gridSpec(key){
  var b=window.GJ_DEPTH&&GJ_DEPTH.board();
  var items=(b&&b.items&&(key===b.k||key===boardKey()))?b.items:(key==='progress'?progress:(CH[key]?CH[key].items:[]));
  var n=items.length||1;
  var fine=!!(b&&b.fine);
  var cols=n<=4?2:n<=9?3:(W<520?4:W<860?5:6);
  if(key==='about'&&n<=4)cols=1;
  if(key==='film'&&!fine)cols=1;
  if(key==='sound'&&!fine)cols=1;
  if((key==='photo'||key==='objects')&&!fine)cols=2;
  var gap=(key==='photo'||key==='objects')&&!fine?16:4,pad=10,head=key==='about'?16:50;
  var maxW=Math.min(W-20,680);
  var tw=(maxW-pad*2-gap*(cols-1))/cols;
  var sq=key==='photo'||key==='objects'||key==='progress';
  var th=key==='about'?40:sq?tw:(key==='film'&&!fine?tw/2.39:(key==='sound'&&!fine?56:tw*9/16));
  var cap=key==='about'?0:12;
  var pitch=th+cap+6,rows=Math.ceil(n/cols);
  var contentH=head+rows*pitch+6;
  var maxH=(b&&b.fine)?Math.min(H-92,H*.84):Math.min(H-118,H*.74);
  var winH=Math.min(maxH,contentH);
  var y0=Math.max(62,(H-winH)/2);
  return {key:key,cols:cols,gap:gap,pad:pad,head:head,tw:tw,th:th,cap:cap,pitch:pitch,contentH:contentH,winH:winH,x0:(W-maxW)/2,y0:y0,w:maxW,maxSc:Math.max(0,contentH-winH),n:n};
}
function tileRect(spec,i,scroll){
  var r=Math.floor(i/spec.cols),q=i%spec.cols;
  return {x:spec.x0+spec.pad+q*(spec.tw+spec.gap),y:spec.y0+spec.head+r*spec.pitch-scroll,w:spec.tw,h:spec.th};
}
function drawWindow(){
  if(window.GJ_DEPTH&&GJ_DEPTH.soundOn())return;
  if(cur.k==='about')return;
  var b=cur.k==='progress'?pbloom:bloom;
  if(cur.lv!==1||b<.02||!boardKey()||(cur.k!=='progress'&&!CH[cur.k]))return;
  var spec=gridSpec(boardKey()),items=boardItems();
  var db=window.GJ_DEPTH&&GJ_DEPTH.board();
  var title=db&&db.title?db.title:(cur.k==='progress'?'IN PROGRESS':String(cur.k).toUpperCase());
  var air=spec.key==='film'||spec.key==='photo'||spec.key==='objects'||spec.key==='sound';
  g.globalAlpha=Math.min(1,b*1.2)*(air?.55:.9);
  g.fillStyle=air?'rgba(4,7,11,.28)':'#080c16';g.fillRect(spec.x0,spec.y0,spec.w,spec.winH);
  if(!air){g.strokeStyle='rgba(207,216,230,.32)';g.lineWidth=1;g.strokeRect(spec.x0+.5,spec.y0+.5,spec.w-1,spec.winH-1)}
  g.globalAlpha=b;g.textAlign='center';g.textBaseline='middle';
  g.font='400 15px "Julius Sans One",sans-serif';g.fillStyle='#e4ebf5';g.letterSpacing='6px';
  if(title.length>16)g.letterSpacing='1px';
  g.fillText(cut(title,spec.w-24),spec.x0+spec.w/2,spec.y0+22);
  g.letterSpacing='0px';
  if(sel&&sel.id&&byId[sel.id]&&b>.55){
    var sl=byId[sel.id],line=sl.title+(sl.role?' — '+sl.role:'');
    g.font='300 11px Poppins,sans-serif';g.fillStyle=sl.role?'rgb('+MINT+')':'rgba(233,239,248,.8)';
    g.fillText(cut(line,spec.w-28),spec.x0+spec.w/2,spec.y0+40);
  }
  g.save();
  g.beginPath();g.rect(spec.x0+1,spec.y0+(spec.head-6),spec.w-2,spec.winH-(spec.head-6));g.clip();
  items.forEach(function(it,i){
    var rc=tileRect(spec,i,scr.x);
    var home=(it._cluster||it.in_progress)?[it.cx,it.cy]:[it.sx,it.sy];
    var hx=home[0]==null?0:home[0],hy=home[1]==null?0:home[1];
    var sp0=sp(hx,hy);
    var w=lerp(4,rc.w,b),h=lerp(4,rc.h,b);
    var x=lerp(sp0[0],rc.x+rc.w/2,b)-w/2,y=lerp(sp0[1],rc.y+rc.h/2,b)-h/2;
    if(spec.key==='film'&&!(db&&db.fine)){var z=1-(i%3)*0.07;w*=z;h*=z;x+=(i%2?16:-12)}
    if(spec.key==='objects'&&!(db&&db.fine)){x+=(i%2?10:-8);y+=(i%3)*4}
    if(y>spec.y0+spec.winH||y+h<spec.y0)return;
    g.globalAlpha=Math.min(1,b*1.4);
    if(spec.key==='photo'&&!(db&&db.fine)&&it._im&&it.ld){
      g.save();g.translate(x+w/2,y+h/2);g.rotate(((i%5)-2)*0.07);
      cover(it._im,-w/2,-h/2,w,h,it._crop);g.restore();
    }else if(spec.key==='objects'&&!(db&&db.fine)&&it._im&&it.ld){
      g.save();g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(x+w/2,y+h-4,w*0.38,8,0,0,7);g.fill();
      cover(it._im,x,y,w,h*.92,it._crop);g.restore();
    }else if(spec.key==='sound'&&!(db&&db.fine)){
      g.fillStyle='rgba(8,14,22,.72)';g.fillRect(x,y,w,h);
      g.fillStyle='rgba(85,218,161,.8)';
      var bars=18,bi;
      for(bi=0;bi<bars;bi++){var bh=(0.25+Math.abs(Math.sin(i*1.7+bi*0.55)))*(h*0.7);g.fillRect(x+8+bi*(w-16)/bars,y+h/2-bh/2,Math.max(2,(w-16)/bars-3),bh)}
    }else if(it._im&&it.ld)cover(it._im,x,y,w,h,it._crop);
    else if(it._text||it.kind==='bio'||it.kind==='poem'||it.kind==='contact'||it.kind==='link'||it.kind==='track'){
      g.fillStyle='rgba(12,18,28,.9)';g.fillRect(x,y,w,h);
      g.font='300 12px Poppins,sans-serif';g.fillStyle='#e8eef5';g.textAlign='center';g.textBaseline='middle';
      g.fillText(cut(it._text||it.title,w-8),x+w/2,y+h/2);
    }else{var tint=CH[it.chapter]?CH[it.chapter].tint:'160,176,196';g.fillStyle='rgba('+tint+',.18)';g.fillRect(x,y,w,h);
      if(!it._im){g.font='300 11px Poppins,sans-serif';g.fillStyle='rgba(233,239,248,.82)';g.textAlign='center';g.textBaseline='middle';g.fillText(cut(it.title,w-12),x+w/2,y+h/2)}}
    if(sel&&sel.id===it.id){g.strokeStyle='rgba('+MINT+',.95)';g.lineWidth=1.5;g.strokeRect(x-1,y-1,w+2,h+2);g.lineWidth=1}
    var capText=it._cap||it.title;
    if(b>.72&&spec.cap&&capText&&it.kind!=='track'){
      g.globalAlpha=b;g.font='300 9px Poppins,sans-serif';g.textAlign='left';g.textBaseline='top';
      g.fillStyle='rgba(233,239,248,.78)';g.fillText(cut(capText,w),x,y+h+1);
    }
  });
  g.restore();g.globalAlpha=1;g.textAlign='left';
}
function anchor(it){
  if(it._cluster)return sp(it.cx,it.cy);
  return sp(it.sx,it.sy);
}
function drawThreads(fa){
  if(cur.lv!==0||fa<.08)return;
  var pairs=[['film/legends','photo/photograph-23'],['objects/latte-in-a-joio-co-cup','sound/to-go']];
  g.setLineDash([1,7]);g.lineWidth=1;
  pairs.forEach(function(p){
    var a=byId[p[0]],b=byId[p[1]];if(!a||!b)return;
    var A=anchor(a),B=anchor(b);
    g.strokeStyle='rgba(214,226,236,'+(0.45*fa)+')';
    g.beginPath();g.moveTo(A[0],A[1]);g.lineTo(B[0],B[1]);g.stroke();
  });
  g.setLineDash([]);
}
function drawRelated(){
  if(cur.lv!==2||!cur.id||!byId[cur.id])return;
  var it=byId[cur.id],rels=it.related||[];if(!rels.length)return;
  var a=screenOf(it);
  g.setLineDash([2,7]);g.lineWidth=1;
  rels.forEach(function(id){
    var o=byId[id];if(!o)return;
    var b=screenOf(o);
    g.strokeStyle='rgba('+MINT+',.55)';g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();
  });
  g.setLineDash([]);
}

/* ---------- mark ---------- */
function markPair(){
  var nodes=[];
  ORDER.forEach(function(k){CH[k].node.forEach(function(n){if(n)nodes.push(n)})});
  var N=nodes.length,pts=[],segs=[],tot=0;
  STROKES.forEach(function(s){s.forEach(function(q,j){pts.push(q);if(j){var a=s[j-1],l=Math.hypot(q[0]-a[0],q[1]-a[1]);segs.push({a:a,b:q,l:l});tot+=l}})});
  var extra=Math.max(0,N-pts.length),left=extra,P=pts.slice();
  segs.forEach(function(sg,i){var n=i===segs.length-1?left:Math.round(extra*sg.l/tot);n=Math.min(n,left);left-=n;
    for(var j=1;j<=n;j++){var f=j/(n+1);P.push([sg.a[0]+(sg.b[0]-sg.a[0])*f,sg.a[1]+(sg.b[1]-sg.a[1])*f])}});
  markPts=P.slice(0,N);
  markTo=nodes.slice(0,N);
}
function markScreen(p){var sc=Math.min(W,H)*(PORT?.52:.46)/250;return [W*.5+p[0]*sc,H*.30+p[1]*sc]}
function drawMark(u){
  var sc=Math.min(W,H)*(PORT?.52:.46)/250,ox=W*.5,oy=H*.30;
  g.lineWidth=1;g.strokeStyle='rgba(200,220,240,'+(0.28*(1-u))+')';g.beginPath();
  STROKES.forEach(function(s){s.forEach(function(q,j){var x=ox+q[0]*sc,y=oy+q[1]*sc;if(j)g.lineTo(x,y);else g.moveTo(x,y)});g.stroke();g.beginPath()});
  markPts.forEach(function(p,i){
    var a=markScreen(p),b;
    if(u>0&&markTo[i]){var np=nodePos(markTo[i]);b=sp(np[0],np[1])}else b=a;
    var q=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
    var gs=u>.85?0:10;if(gs){g.globalAlpha=.8;g.drawImage(GLOW.w,q[0]-gs,q[1]-gs,gs*2,gs*2)}
    g.globalAlpha=1;g.fillStyle='#fff';g.beginPath();g.arc(q[0],q[1],u>.9?1.4:1.8,0,7);g.fill();
  });
}

/* ---------- sound layer (waveform, chimes, stars that listen) ---------- */
var PENT=[523.25,587.33,659.25,783.99,880],songAt={};
function drawSound(t){
  var c=CH.sound;if(!songAt._b){data.tracks.forEach(function(tr){songAt[tr.star]=tr});songAt._b=1}
  ensureChimes();chimesDraw();
  c.node.forEach(function(n,i){if(!n)return;var tr=songAt[i];if(!tr)return;
    var p=nodePos(n),q=sp(p[0],p[1]);
    var on=song&&song.k===tr.k;star(q,on?.9:.55,c,on,1);
    if(playing&&on){var pulse=1+L.rms*1.8;g.globalAlpha=.35+L.rms*.5;g.strokeStyle='rgba('+MINT+','+(0.4+L.rms)+')';g.beginPath();g.arc(q[0],q[1],8+10*L.rms*pulse,0,7);g.stroke();g.globalAlpha=1}
    if(on){g.font='300 10px Poppins,sans-serif';g.textAlign='center';g.fillStyle='rgb('+MINT+')';g.fillText(tr.title,q[0],q[1]-14)}
  });
  if(playing){
    var o=sp(c.x,c.y),peaks=song.peaks||[],head=(au&&song.dur)?au.currentTime/song.dur:0;
    for(var i=0;i<18;i++){
      var pi=Math.floor(((head*peaks.length+i*3)%peaks.length+peaks.length)%peaks.length);
      var rad=18+(peaks[pi]||.2)*70+L.rms*26;
      g.strokeStyle='rgba(255,182,176,'+(0.08+0.25*(1-i/18))+')';g.beginPath();g.arc(o[0],o[1],rad+i*7,0,7);g.stroke();
    }
  }
  drawWF();
}
function ensureChimes(){
  if(CHIMES.length)return;
  [[2,3],[5,6],[7,8],[10,11],[13,14]].forEach(function(e,i){CHIMES.push({a:e[0],b:e[1],th:0,w:0,fl:0,f:PENT[i],v:i,lc:-1})});
}
function chGeo(){
  var c=CH.sound;
  CHIMES.forEach(function(ch){
    var A=c.node[ch.a],B=c.node[ch.b];if(!A||!B)return;
    var pa=nodePos(A),pb=nodePos(B),as=sp(pa[0],pa[1]),bs=sp(pb[0],pb[1]);
    ch.px=as[0];ch.py=as[1];ch.rx=bs[0];ch.ry=bs[1];ch.L=Math.max(28,Math.hypot(bs[0]-as[0],bs[1]-as[1]));
    ch.a0=Math.atan2(bs[0]-as[0],bs[1]-as[1]);
  });
}
function bob(c){return [c.px+c.L*Math.sin(c.a0+c.th),c.py+c.L*Math.cos(c.a0+c.th)]}
function chStep(dt){
  if(!(cur.lv===2&&cur.id&&byId[cur.id]&&byId[cur.id].kind==='player'))return;
  chGeo();var h=1/90,n=Math.min(6,Math.ceil(dt/h));h=dt/Math.max(1,n);
  for(var s=0;s<n;s++){
    for(var i=0;i<CHIMES.length;i++){var c=CHIMES[i];c.w+=(-(820/c.L)*Math.sin(c.th)-.65*c.w)*h;c.th+=c.w*h}
    for(var i=0;i<CHIMES.length-1;i++){var A=CHIMES[i],B=CHIMES[i+1],xa=bob(A)[0],xb=bob(B)[0],ct=(B.rx-A.rx)-8;
      if(xb-xa<ct){var rel=A.w*A.L-B.w*B.L;if(rel>8){chime(A.f,.4,A.v);A.fl=.8;B.fl=.5}A.th-=2/A.L;B.th+=2/B.L}}
  }
  CHIMES.forEach(function(c){c.fl*=Math.exp(-dt*3)});
}
function chimesDraw(){
  g.lineWidth=1.2;CHIMES.forEach(function(c){
    if(c.px==null)return;var b=bob(c);
    g.strokeStyle='rgba(255,220,210,'+(0.35+c.fl*.6)+')';g.beginPath();g.moveTo(c.px,c.py);g.lineTo(b[0],b[1]);g.stroke();
    g.fillStyle=c.fl>.2?'rgb('+MINT+')':'#f2e6e2';g.beginPath();g.arc(b[0],b[1],3.2,0,7);g.fill();
  });
}
function chime(f){
  try{
    if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(!C)return;AC=new C()}
    if(AC.state==='suspended')AC.resume();
    var t=AC.currentTime,g1=AC.createGain();g1.gain.setValueAtTime(.0001,t);g1.gain.exponentialRampToValueAtTime(.08,t+.01);g1.gain.exponentialRampToValueAtTime(.0001,t+1.6);g1.connect(AC.destination);
    [1,2.76,5.4].forEach(function(part,i){var o=AC.createOscillator();o.type='sine';o.frequency.value=f*part;o.connect(g1);o.start(t);o.stop(t+1.5)});
  }catch(e){}
}
function listen(){
  if(!AN||!au||au.paused){L.rms*=.9;return}
  AN.getByteFrequencyData(FD);AN.getByteTimeDomainData(TD);
  var s=0;for(var i=0;i<TD.length;i++){var v=(TD[i]-128)/128;s+=v*v}
  L.rms=L.rms*.6+.4*Math.min(1,Math.sqrt(s/TD.length)*3.2);
}
function audioGraph(){
  if(AC&&AN)return;
  try{var C=window.AudioContext||window.webkitAudioContext;AC=AC||new C();if(!au)return;
    var src=AC.createMediaElementSource(au);AN=AC.createAnalyser();AN.fftSize=512;src.connect(AN);AN.connect(AC.destination);
    FD=new Uint8Array(AN.frequencyBinCount);TD=new Uint8Array(AN.fftSize);
  }catch(e){}
}
function drawWF(){
  var wf=$('wf');if(!wf||!song)return;var c=wf.getContext('2d'),dpr=DPR,w=wf.width,h=wf.height;
  if(wf._w!==wf.clientWidth){wf.width=Math.max(1,wf.clientWidth*dpr);wf.height=Math.max(1,42*dpr);wf._w=wf.clientWidth;w=wf.width;h=wf.height}
  c.clearRect(0,0,w,h);var peaks=song.peaks||[],n=peaks.length,head=(au&&song.dur)?au.currentTime/song.dur:0;
  for(var i=0;i<n;i++){var x=(i+.5)/n*w,y=Math.max(1,peaks[i]*h*.42),on=i/n<head;
    c.fillStyle=on?'rgba(85,218,161,.85)':'rgba(220,230,240,.35)';c.fillRect(x-dpr*.4,h/2-y,dpr,y*2)}
  c.fillStyle='#fff';c.fillRect(head*w,6,1,h-12);
  var tc=$('tc');if(tc&&au)tc.textContent=mmss(au.currentTime)+' / '+mmss(song.dur||0);
}
function mmss(s){s=Math.max(0,s|0);return (s/60|0)+':'+(s%60<10?'0':'')+(s%60|0)}

/* ---------- layers ---------- */
function renderLayer(){
  var el=$('layer');
  if(reelCtl){reelCtl.stop();reelCtl=null}
  if(window.GJ_DEPTH&&GJ_DEPTH.owns()){GJ_DEPTH.paintLayer(el);return}
  if(window.GJ_DEPTH&&GJ_DEPTH.soundOn()){el.classList.remove('on');el.innerHTML='';return}
  if(cur.lv!==2||!cur.id||!byId[cur.id]){el.classList.remove('on');el.innerHTML='';pauseAu();return}
  var it=byId[cur.id];el.classList.add('on');
  if(it.kind==='reel')renderReel(el,it);
  else if(it.kind==='player')renderPlayer(el,it);
  else if(it.kind==='joio')renderJoio(el,it);
  else renderSheet(el,it);
}
function renderSheet(el,it){
  var m=it.media||{},frame='',play='';
  if(it.kind==='film'&&m.clip){
    frame='<div class="frame239"><video id="fv" playsinline preload="metadata" poster="'+esc(m.big)+'" src="'+esc(m.clip)+'"></video></div>';
    play='<button type="button" class="play" id="play">play</button>';
  }else if(m.big||m.thumb){
    frame='<div class="'+(it.kind==='film'?'frame239':'')+'"><img class="'+(it.kind==='film'?'':'stillbig')+'" src="'+esc(m.big||m.thumb)+'" alt="'+esc(it.title)+'"></div>';
  }
  var rail=it.kind==='film'?'<div class="rail" id="rail"><canvas id="rc"></canvas><i class="head" id="rhead"></i></div>':'';
  var strip='';
  if(m.frames&&m.frames.length){
    strip='<div class="strip">'+m.frames.map(function(src,i){return '<button type="button" data-f="'+i+'"><img src="'+esc(src)+'" alt=""></button>'}).join('')+'</div>';
  }
  var body='';
  if(it.kind==='bio')body='<div class="prose">'+esc(it.body).split('\n\n').map(function(p){return '<p>'+p+'</p>'}).join('')+'</div>';
  if(it.kind==='poem')body='<p class="poemcard">'+esc(it.body).split('\n').map(function(l){return '<span>'+l+'</span>'}).join('')+'<span class="sig" lang="cr">ᑕᐣᓯ</span></p>';
  if(it.kind==='contact')body='<p><a href="mailto:'+esc(data.email)+'">'+esc(data.email)+'</a></p>';
  if(it.kind==='link')body='<p><a href="https://www.joioco.com">joio.co ↗</a></p>';
  var cred=(it.credits||[]).map(function(c){return '<li>'+esc(c)+'</li>'}).join('');
  var rel=(it.related||[]).map(function(id){var o=byId[id];return o?'<a href="'+o.chapter+'/'+o.slug+'/">'+esc(o.title)+'</a>':''}).filter(Boolean).join(' · ');
  rel='<p class="rel">Related'+(rel?' · '+rel:'')+'</p>';
  var watch=(m.url&&!/youtube\.com|youtu\.be/i.test(m.url))?'<p class="rel"><a href="'+esc(m.url)+'">watch ↗</a></p>':'';
  if(it.body&&!body)body='<div class="prose"><p>'+esc(it.body).split('\n\n').map(function(p){return p}).join('</p><p>')+'</p></div>';
  var href=it.pageHref||(it.chapter+'/'+it.slug+'/');
  var page=it.noPage?'':'<p class="rel"><a href="'+href+'">open the page</a></p>';
  el.innerHTML='<div class="sheet'+(it.kind==='film'?'':' full')+'">'+frame+play+rail+
    '<p class="meta" id="tc"></p>'+strip+'<h2>'+esc(it.title)+'</h2>'+
    (it.role?'<p class="role">'+esc(it.role)+'</p>':'')+(it.meta?'<p class="meta">'+esc(it.meta)+'</p>':'')+
    body+(cred?'<ul class="credits">'+cred+'</ul>':'')+watch+rel+page+'</div>';
  var v=$('fv'),railEl=$('rail');
  var btn=$('play');
  if(btn)btn.onclick=function(){
    if(v){if(v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()}
  };
  if(railEl&&v){
    paintRail(0);
    function seek(ev){var r=railEl.getBoundingClientRect(),t=clamp((ev.clientX-r.left)/r.width,0,1);
      if(v.duration)v.currentTime=t*v.duration;paintRail(t)}
    railEl.addEventListener('pointerdown',function(ev){seek(ev);railEl.setPointerCapture(ev.pointerId)});
    railEl.addEventListener('pointermove',function(ev){if(ev.buttons)seek(ev)});
    v.addEventListener('timeupdate',function(){var t=v.duration?v.currentTime/v.duration:0;paintRail(t);
      var tc=$('tc');if(tc)tc.textContent=mmss(v.currentTime)+' / '+mmss(v.duration||0)});
  }
  el.onclick=function(ev){
    var b=ev.target.closest('[data-f]');if(!b)return;
    [].forEach.call(el.querySelectorAll('[data-f]'),function(x){x.classList.toggle('on',x===b)});
    if(v&&v.duration){var n=m.frames.length,i=+b.dataset.f;v.currentTime=v.duration*(i/(n||1))}
  };
}
function paintRail(t){
  var c=$('rc');if(!c)return;var dpr=DPR;c.width=c.clientWidth*dpr;c.height=c.clientHeight*dpr;
  var q=c.getContext('2d'),w=c.width,h=c.height;q.clearRect(0,0,w,h);
  q.fillStyle='rgba(255,255,255,.18)';q.fillRect(0,h/2,w,1);
  q.fillStyle='rgba(85,218,161,.8)';q.fillRect(0,h/2,w*t,1);
  var n=12;q.fillStyle='rgba(230,236,240,.8)';
  for(var i=0;i<n;i++){var x=i/(n-1)*w;q.fillRect(x,h*.3,dpr,h*.4)}
  var head=$('rhead');if(head)head.style.left=(t*100)+'%';
}
function renderPlayer(el){
  pauseAu();
  if(!au){au=document.createElement('audio');au.preload='none';au.crossOrigin='anonymous';document.body.appendChild(au);
    au.addEventListener('ended',function(){playing=false});
    au.addEventListener('timeupdate',drawWF)}
  el.innerHTML='<div class="snd"><div class="row"><button type="button" class="play" id="splay">play</button><div class="who"><b id="sttl"></b><small id="sart"></small></div><span id="tc"></span></div><canvas class="wf" id="wf"></canvas><p class="lic"><a href="mailto:'+esc(data.email)+'?subject=music%20licensing">licensing · '+esc(data.email)+'</a></p></div>';
  $('splay').onclick=function(){if(!song)return;if(playing){au.pause();playing=false;this.textContent='play'}else startSong(song)};
  showSong();
}
function showSong(){
  var a=$('sttl'),b=$('sart');if(a&&song){a.textContent=song.title;b.textContent=song.artist}
  var btn=$('splay');if(btn)btn.textContent=playing?'pause':'play';
}
function startSong(tr){
  if(!au)return;if(au.src!==tr.file){au.src=tr.file;au.load()}
  audioGraph();try{if(AC&&AC.state==='suspended')AC.resume()}catch(e){}
  var p=au.play();if(p&&p.catch)p.catch(function(){});
  playing=true;song=tr;showSong();
}
function pauseAu(){if(au&&!au.paused)au.pause();playing=false}
function renderJoio(el){
  var clips=(window.GJ_JOIO||[]).filter(function(c){return c.k==='v'});
  var hero=clips[0];
  if(!hero){renderSheet(el,byId['objects/joio']);return}
  el.innerHTML='<div class="sheet full"><div class="joio-stage"><video id="jv" muted loop playsinline autoplay poster="'+esc(JOIOB+hero.f)+'" src="'+esc(JOIOB+hero.v)+'"></video></div><h2>joio</h2><p class="meta">cups and paddles · '+clips.length+' clips</p><p class="rel"><a href="objects/joio/">open the page</a> · <a href="https://www.joioco.com">joio.co ↗</a></p></div>';
}
function renderReel(el){
  var S=window.GJ_REEL||[];if(!S.length){el.innerHTML='<div class="sheet full"><p>The reel is missing.</p></div>';return}
  el.innerHTML='<div class="reel" id="reel"><div class="stage" id="rst"><img id="rim" alt=""><video id="rv" muted playsinline loop></video></div><div class="ui"><span id="rn"></span><b id="rb"></b><span style="flex:1"></span><button type="button" id="rfit">fill</button><button type="button" id="rview">view film</button></div><div class="fs" id="rfs"><div class="row" id="rrow"></div></div></div>';
  var N=S.length,p=.5,curI=-1,on=true,fit=false,last=0,raf=0,dragR=null;
  var row=$('rrow');
  for(var i=0;i<N;i++){var b=document.createElement('i');b.style.backgroundImage='url('+REELB+S[i].f+'.webp)';row.appendChild(b)}
  function mod(i){return ((i%N)+N)%N}
  function show(i){
    i=mod(i);if(i===curI)return;curI=i;var s=S[i];
    $('rim').src=REELB+s.f+'.webp';
    $('rn').textContent=(i+1)+' / '+N;
    $('rb').textContent=s.b||'';
    var v=$('rv');if(!RM){v.src=REELB+s.f+'.mp4';var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}
    var film=s.l!=null?CH.film.items.filter(function(it){return it.k==='w'+s.l})[0]:null;
    $('rview').style.visibility=film?'visible':'hidden';
    $('rview').onclick=function(){if(film)go({lv:2,k:'film',id:film.id})};
  }
  function place(){var w=el.clientWidth||W,q=((p%N)+N)%N;row.style.transform='translate3d('+(w/2-(q)*40)+'px,0,0)';show(Math.floor(q))}
  function loop(t){raf=requestAnimationFrame(loop);var dt=Math.min(.05,(t-(last||t))/1000);last=t;if(on&&!dragR&&!RM)p+=dt*1.1;place()}
  raf=requestAnimationFrame(loop);place();
  $('rfit').onclick=function(){fit=!fit;$('reel').classList.toggle('fit',fit);this.textContent=fit?'fit':'fill'};
  var fs=$('rfs');
  fs.addEventListener('pointerdown',function(e){dragR={x:e.clientX,p:p}});
  fs.addEventListener('pointermove',function(e){if(!dragR)return;p=dragR.p-(e.clientX-dragR.x)/40});
  fs.addEventListener('pointerup',function(){dragR=null});
  $('rst').addEventListener('click',function(){on=!on});
  reelCtl={stop:function(){cancelAnimationFrame(raf);var v=$('rv');if(v){v.pause();v.removeAttribute('src')}}};
}

/* ---------- input ---------- */
function bind(){
  stage.addEventListener('pointerdown',onDown);
  stage.addEventListener('pointermove',onMove);
  stage.addEventListener('pointerup',onUp);
  stage.addEventListener('pointercancel',onUp);
  stage.addEventListener('touchstart',onTouch,{passive:false});
  stage.addEventListener('touchmove',onTouchMove,{passive:false});
  stage.addEventListener('touchend',function(){pinch=null},{passive:true});
  window.addEventListener('pointerdown',onPtrDown,true);
  window.addEventListener('pointermove',onPtrMove,true);
  window.addEventListener('pointerup',onPtrUp,true);
  window.addEventListener('pointercancel',onPtrUp,true);
  window.addEventListener('message',function(e){if(e.data==='u2-sound-out')back()});
  $('dive').addEventListener('click',function(e){e.stopPropagation();dive()});
  $('back').addEventListener('click',function(e){e.stopPropagation();back()});
  $('crumb').querySelector('.sig').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();back()});
  addEventListener('keydown',function(e){
    var c=$('hirecard');
    if(e.key==='Escape'&&c&&!c.hidden){e.preventDefault();e.stopPropagation();hireOpen(false);return}
    if(e.key==='Escape'){e.preventDefault();back()}
  });
  var hireBtn=$('hire'),hireX=$('hirex');
  if(hireBtn)hireBtn.addEventListener('click',function(e){e.stopPropagation();hireOpen($('hirecard').hidden)});
  if(hireX)hireX.addEventListener('click',function(e){e.stopPropagation();hireOpen(false)});
  var reelBtn=$('reel');
  if(reelBtn)reelBtn.addEventListener('click',function(e){e.stopPropagation();openReel()});
  document.querySelectorAll('.chips button').forEach(function(b){
    b.addEventListener('click',function(e){e.stopPropagation();var k=b.getAttribute('data-ch');if(k)go({lv:1,k:k,id:null})});
  });
  var mapBtn=$('mmap');
  if(mapBtn)mapBtn.addEventListener('click',function(e){e.stopPropagation();jumpMap(e)});
  var ax=$('aprox');
  if(ax)ax.addEventListener('click',function(e){e.stopPropagation();back()});
  addEventListener('resize',function(){layout();arriveAt(cur,true)});
  addEventListener('popstate',function(e){var c=e.state&&e.state.cur;if(!c)c={lv:0,k:null,id:null};cur=c;if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());if(phase!=='sky')enterSky(true);arriveAt(cur,false)});
}
function onDown(e){
  if(e.target.closest('#hirecard'))return;
  var card=$('hirecard');
  if(card&&!card.hidden&&!e.target.closest('#hire')){hireOpen(false);return}
  if(e.target.closest('#bar,#layer,#layers,#dive,.snd,.reel,.sheet,#mmap,#reel,#apro'))return;
  if(phase==='arrive'||phase==='land'){drag={x:e.clientX,y:e.clientY,id:e.pointerId,t:now()};moved=false;return}
  if(phase!=='sky')return;
  var over=false;
  if(cur.lv===1&&boardKey()){
    var spec=gridSpec(boardKey());
    over=spec.maxSc>4&&e.clientX>=spec.x0&&e.clientX<=spec.x0+spec.w&&e.clientY>=spec.y0&&e.clientY<=spec.y0+spec.winH;
  }
  drag={x:e.clientX,y:e.clientY,lx:lxS.x,ly:lyS.x,s0:scr.x,over:over,id:e.pointerId,t:now(),chime:chimeAt(e.clientX,e.clientY)};
  moved=false;
}
function onMove(e){
  if(!drag||e.pointerId!==drag.id)return;
  var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(Math.hypot(dx,dy)>8)moved=true;
  if(phase!=='sky')return;
  if(drag.chime&&cur.id&&byId[cur.id]&&byId[cur.id].kind==='player'){
    CHIMES.forEach(function(c){c.w+=(dx>0?1:-1)*.02});return}
  if(!moved)return;
  if(drag.over){
    var spec=gridSpec(boardKey());
    var t=clamp(drag.s0-(e.clientY-drag.y),0,spec.maxSc);
    scr.x=scr.t=t;scr.v=0;return;
  }
  var lim=34/Math.max(.2,rest.s);
  lxS.x=lxS.t=clamp(drag.lx-dx/rest.s,-lim,lim);
  lyS.x=lyS.t=clamp(drag.ly-dy/rest.s,-lim,lim);
  lxS.v=lyS.v=0;
}
function onUp(e){
  if(!drag||e.pointerId!==drag.id)return;
  var was=drag;drag=null;
  if(phase==='arrive'){dive();return}
  if(phase==='land'){if(!moved)nextLand();return}
  if(phase!=='sky')return;
  if(moved){
    if(was.chime){var c=was.chime;chime(c.f);c.fl=1}
    if(!was.over){lxS.t=0;lyS.t=0;lxS.w=W_LOOK;lyS.w=W_LOOK}
    return;
  }
  tap(e.clientX,e.clientY);
}
function onPtrDown(e){
  if(e.pointerType==='mouse'&&!e.buttons)return;
  PT[e.pointerId]={x:e.clientX,y:e.clientY};
  var ids=Object.keys(PT);
  if(ids.length===2){
    var a=PT[ids[0]],b=PT[ids[1]];
    pinch={d:Math.hypot(a.x-b.x,a.y-b.y),done:0,x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    drag=null;
  }
}
function onPtrMove(e){
  if(!PT[e.pointerId])return;
  PT[e.pointerId]={x:e.clientX,y:e.clientY};
  var ids=Object.keys(PT);
  if(ids.length<2||!pinch||pinch.done)return;
  var a=PT[ids[0]],b=PT[ids[1]];
  var d=Math.hypot(a.x-b.x,a.y-b.y),r=d/(pinch.d||1);
  pinch.x=(a.x+b.x)/2;pinch.y=(a.y+b.y)/2;
  if(r>1.18){pinch.done=1;deeper(pinch.x,pinch.y)}
  else if(r<.84){pinch.done=1;back()}
}
function onPtrUp(e){
  delete PT[e.pointerId];
  if(Object.keys(PT).length<2)pinch=null;
}
function onTouch(e){
  if(e.touches.length===2){drag=null;if(e.cancelable)e.preventDefault()}
}
function onTouchMove(e){
  if(e.touches.length>=2&&e.cancelable)e.preventDefault();
}
function tap(x,y){
  if(window.GJ_DEPTH&&GJ_DEPTH.soundOn())return;
  if(cur.lv===2&&cur.id&&byId[cur.id]&&byId[cur.id].kind==='player'){
    var hitS=songHit(x,y);
    if(hitS){
      if(sel&&sel.type==='song'&&sel.k===hitS.k)startSong(hitS);
      else {sel={type:'song',k:hitS.k};song=hitS;if(au){au.src=hitS.file}showSong()}
      return;
    }
    var chh=chimeAt(x,y);if(chh){chime(chh.f);chh.fl=1;chh.w+=.4;return}
    return;
  }
  var h=hit(x,y);
  if(!h||h.type==='panel'){if(!h)sel=null;return}
  sel=h;
}
function tileAt(x,y){
  if(cur.lv<1)return null;
  var b=cur.k==='progress'?pbloom:bloom;
  if(b<.55)return null;
  var spec=gridSpec(boardKey()),items=boardItems();
  if(x<spec.x0||x>spec.x0+spec.w||y<spec.y0||y>spec.y0+spec.winH)return null;
  for(var i=0;i<items.length;i++){
    var rc=tileRect(spec,i,scr.x);
    if(x>=rc.x-2&&x<=rc.x+rc.w+2&&y>=rc.y-2&&y<=rc.y+rc.h+spec.cap+2)return items[i];
  }
  return null;
}
function depthApi(){
  return {
    cur:function(){return cur},
    byId:function(id){return byId[id]},
    ch:function(k){return CH[k]},
    progress:function(){return progress},
    hit:hit,
    tileAt:tileAt,
    setCur:function(c){cur=c},
    push:function(){history.pushState({u1:1,cur:{lv:cur.lv,k:cur.k,id:cur.id}},'',hashOf(cur))},
    arrive:function(){arriveAt(cur,false)},
    paint:function(){renderLayer();ui()},
    load:loadImg,
    openId:function(id){var it=byId[id];if(!it)return;go({lv:2,k:it.chapter,id:it.id})},
    backHist:function(){
      if(history.state&&history.state.u1&&cur.lv>0)history.back();
      else {cur={lv:0,k:null,id:null};if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());arriveAt(cur,false);ui()}
    }
  };
}
function hit(x,y){
  if(cur.lv===1){
    var b=cur.k==='progress'?pbloom:bloom;
    if(b>.55){
      var spec=gridSpec(boardKey()),items=boardItems();
      if(x>=spec.x0&&x<=spec.x0+spec.w&&y>=spec.y0&&y<=spec.y0+spec.winH){
        for(var i=0;i<items.length;i++){
          var rc=tileRect(spec,i,scr.x);
          if(x>=rc.x-2&&x<=rc.x+rc.w+2&&y>=rc.y-2&&y<=rc.y+rc.h+spec.cap+2)
            return {type:'work',k:cur.k,id:items[i].id,prog:cur.k==='progress'?1:0};
        }
        return {type:'panel'};
      }
    }
  }
  if(cur.lv===0){
    var c=wp(x,y);
    if(Math.hypot(c[0],c[1])<46)return {type:'poem',k:'about',id:'about/poem'};
    var best=null,bd=26;
    cluster.forEach(function(it){var q=sp(it.cx,it.cy),d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;best={type:'work',k:'progress',id:it.id,prog:1}}});
    if(best)return best;
    ORDER.forEach(function(k){
      var ch=CH[k];ch.skyItems.forEach(function(it){var q=sp(it.sx,it.sy),d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;best={type:'ch',k:k}}});
      var q=sp(ch.x,ch.y),d=Math.hypot(q[0]-x,q[1]-y);if(d<Math.max(ch.bw,ch.bh)*.35*rest.s&&d<bd+40)best={type:'ch',k:k};
    });
    return best;
  }
  return null;
}
function songHit(x,y){
  var c=CH.sound,best=null,bd=30;
  c.node.forEach(function(n,i){var tr=songAt[i];if(!tr||!n)return;var p=nodePos(n),q=sp(p[0],p[1]),d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;best=tr}});
  return best;
}
function chimeAt(x,y){
  if(!(cur.lv===2&&cur.id&&byId[cur.id]&&byId[cur.id].kind==='player'))return null;
  var best=null,bd=28;CHIMES.forEach(function(c){if(c.px==null)return;var b=bob(c),d=Math.hypot(b[0]-x,b[1]-y);if(d<bd){bd=d;best=c}});return best;
}
function openSel(){
  if(!sel)return;
  if(sel.type==='ch')go({lv:1,k:sel.k,id:null});
  else if(sel.type==='poem')go({lv:2,k:'about',id:'about/poem'});
  else if(sel.type==='work'&&sel.prog&&cur.lv===0)go({lv:1,k:'progress',id:null});
  else if(sel.type==='work'&&cur.lv>=1){
    var it=byId[sel.id];
    if(it&&it.kind==='track'){song=it.track;if(au)au.src=song.file;go({lv:2,k:'sound',id:'sound/waveform'})}
    else go({lv:2,k:sel.prog?'progress':sel.k,id:sel.id});
  }
  sel=null;
}
var bioOn=0,bioLv=1,bioExit=0,grainOn=0;
function bioActive(){return phase==='sky'&&cur.k==='about'&&cur.lv>=1&&!cur.id&&!bioExit}
function paintGrain(){
  var c=$('grain');if(!c||grainOn)return;
  var w=180,h=320;c.width=w;c.height=h;
  var g=c.getContext('2d'),im=g.createImageData(w,h),d=im.data,i;
  for(i=0;i<d.length;i+=4){var n=(Math.random()*255)|0;d[i]=d[i+1]=d[i+2]=n;d[i+3]=70}
  g.putImageData(im,0,0);grainOn=1;
}
function paintBio(){
  var texts=(window.GJ_BIO&&GJ_BIO.layers)||[];
  var text=texts[bioLv-1]||'';
  var box=$('laytext');
  if(box){
    box.className='copy lv'+bioLv+(bioLv===7?' sel':'');
    box.innerHTML=text.split('\n').map(function(line){return line?'<span>'+esc(line)+'</span>':'<br>'}).join('');
  }
  var rail=$('lrail');
  if(rail){
    var dots='',i;for(i=1;i<=7;i++)dots+='<i'+(i===bioLv?' class="on"':'')+'></i>';
    rail.innerHTML=dots+'<b>'+bioLv+'</b>';
  }
  var v=$('calc');
  if(v){
    var s=1+(bioLv-1)*0.2,blur=0.7+(bioLv-1)*0.15;
    v.style.transform='scale('+s.toFixed(3)+')';
    v.style.filter='brightness(0.58) contrast(1.05) blur('+blur.toFixed(2)+'px)';
    v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){});
  }
}
function syncBio(){
  var el=$('layers');if(!el)return;
  if(bioExit)return;
  var active=phase==='sky'&&cur.k==='about'&&cur.lv>=1&&!cur.id;
  if(!active){el.hidden=true;el.classList.remove('on','exit','moonfade');bioOn=0;return}
  if(!bioOn)bioLv=1;
  bioOn=1;if(bioLv<1)bioLv=1;if(bioLv>7)bioLv=7;
  el.hidden=false;el.classList.add('on');
  paintGrain();paintBio();
}
function bioDeeper(){
  if(bioExit)return true;
  if(!(phase==='sky'&&cur.k==='about'&&cur.lv>=1&&!cur.id))return false;
  if(bioLv>=7)return true;
  bioLv++;paintBio();ui();return true;
}
function startMoonExit(){
  if(bioExit)return;
  bioExit=1;
  var el=$('layers');if(!el){bioExit=0;return}
  var moon=$('moons');
  if(moon){moon.muted=true;var p=moon.play();if(p&&p.catch)p.catch(function(){})}
  el.classList.add('exit');
  setTimeout(function(){el.classList.add('moonfade')},760);
  setTimeout(function(){
    bioExit=0;bioOn=0;bioLv=1;
    el.hidden=true;el.classList.remove('on','exit','moonfade');
    cur={lv:0,k:null,id:null};
    if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());
    history.pushState({u1:1,cur:{lv:0,k:null,id:null}},'','#/');
    arriveAt(cur,false);
  },760+1200);
}
function bioBack(){
  if(bioExit)return true;
  if(!(bioOn||(phase==='sky'&&cur.k==='about'&&cur.lv>=1&&!cur.id)))return false;
  if(bioLv>1){bioLv--;paintBio();ui();return true}
  startMoonExit();return true;
}
function deeper(x,y){
  if(phase!=='sky')return;
  if(bioDeeper())return;
  if(window.GJ_DEPTH&&GJ_DEPTH.pinchIn(x,y,depthApi()))return;
}
function back(){
  if(phase==='land'){enterSky(false);return}
  if(phase==='arrive'||phase==='fly'){dive();return}
  if(bioBack())return;
  if(window.GJ_DEPTH&&GJ_DEPTH.pinchOut(depthApi()))return;
  if(history.state&&history.state.u1&&cur.lv>0)history.back();
  else if(cur.lv>0){cur={lv:0,k:null,id:null};if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());arriveAt(cur,false);ui()}
}

function go(next){
  if(window.GJ_INNER)GJ_INNER.reset();
  cur=next;sel=null;
  if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());
  if(phase!=='sky')enterSky(true);
  history.pushState({u1:1,cur:{lv:cur.lv,k:cur.k,id:cur.id}},'',hashOf(cur));
  arriveAt(cur,false);
}
function hashOf(c){
  if(!c||c.lv===0)return '#/';
  if(c.k==='progress'&&c.lv===1)return '#progress';
  if(c.k==='progress'&&c.id&&byId[c.id])return '#progress/'+byId[c.id].slug;
  if(c.lv===1)return '#'+c.k;
  if(c.id&&byId[c.id])return '#'+byId[c.id].chapter+'/'+byId[c.id].slug;
  return '#/';
}
function ui(){
  var back=$('back'),where=$('where');
  back.hidden=cur.lv===0;
  var foot=$('foot');if(foot)foot.hidden=phase!=='sky'||cur.lv>0;
  var label='the sky';
  if(window.GJ_DEPTH&&GJ_DEPTH.soundOn())label='sound';
  else if(cur.k==='progress')label='in progress';
  else if(cur.k)label=cur.k;
  if(window.GJ_DEPTH){
    var db=GJ_DEPTH.board();
    if(db&&db.work&&!GJ_DEPTH.soundOn())label=db.work.title;
    var dst=GJ_DEPTH.state();
    if(dst&&dst.label)label=dst.label;
  }
  if(bioOn&&cur.k==='about'&&!cur.id)label='about · '+bioLv;
  if(cur.lv===2&&cur.id&&byId[cur.id]&&!(window.GJ_DEPTH&&GJ_DEPTH.soundOn()))label=byId[cur.id].title;
  if(window.GJ_DEPTH){var named=GJ_DEPTH.state();if(named&&named.label)label=named.label}
  where.textContent=label;
  var bar=$('bar');if(bar)bar.classList.toggle('bio',!!(bioOn&&cur.k==='about'&&!cur.id));
  stage.setAttribute('aria-label',label);
  syncHire();
}
function openReel(){
  var it=byId['film/demo-reel']||byId['film/reel-2026'];
  if(!it)return;
  go({lv:2,k:'film',id:it.id});
}
function fillAbout(){
  var box=$('aprobio'),list=$('astars');if(!box||!list||box._filled)return;
  var mail=data.email||'imjamesgill@gmail.com';
  var paras=(data.bio||[]).map(function(p){return '<p>'+esc(p)+'</p>'}).join('');
  box.innerHTML='<p class="label">Cinematographer + Artist + Spatial Designer</p>'+paras+
    '<p class="pills"><a class="lk" href="mailto:'+esc(mail)+'">'+esc(mail)+'</a><a class="lk" href="https://www.joioco.com" rel="noopener">joio.co ↗</a></p>';
  var bio=byId['about/bio'],poem=byId['about/poem'];
  var rows=[
    {jx:'1px',id:'about/bio',title:'bio',small:(bio&&bio.meta)||'',go:'bio'},
    {jx:'27px',title:mail,small:'contact',href:'mailto:'+mail},
    {jx:'36px',title:'joio.co',small:'ceramics shop ↗',href:'https://www.joioco.com'},
    {jx:'26px',id:'about/poem',title:'the poem',small:poem&&poem.meta?poem.meta:'15 lines · ᑕᐣᓯ',go:'poem'}
  ];
  list.innerHTML=rows.map(function(r){
    var inn='<i class="dot" aria-hidden="true"></i><b>'+esc(r.title)+'</b><small>'+esc(r.small)+'</small>';
    if(r.href)return '<li><a style="--jx:'+r.jx+'" href="'+esc(r.href)+'"'+(r.href.indexOf('http')===0?' rel="noopener"':'')+'>'+inn+'</a></li>';
    return '<li><button type="button" style="--jx:'+r.jx+'" data-go="'+r.go+'">'+inn+'</button></li>';
  }).join('');
  list.querySelectorAll('button').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      if(b.getAttribute('data-go')==='poem')go({lv:2,k:'about',id:'about/poem'});
      else {var card=$('aprobio');if(card)card.scrollIntoView({block:'start'})}
    });
  });
  box._filled=1;
}
function paintAbout(){
  var el=$('apro');if(el)el.hidden=true;
}
function syncExtras(){
  var proof=$('proof');
  if(proof){
    var on=PROOF&&phase==='sky'&&cur.lv===0;
    proof.hidden=!on;
    if(on)proof.style.opacity=String(Math.max(0,Math.min(1,farA())));
  }
  drawMap();
  paintAbout();
}
function drawMap(){
  var btn=$('mmap'),cv=$('mmapc');if(!btn||!cv)return;
  var show=phase==='sky'&&cur.lv>0&&!(bioOn&&cur.k==='about'&&!cur.id);
  btn.hidden=!show;if(!show)return;
  var b={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};
  function inc(x,y){b.x0=Math.min(b.x0,x);b.x1=Math.max(b.x1,x);b.y0=Math.min(b.y0,y);b.y1=Math.max(b.y1,y)}
  ORDER.forEach(function(k){var c=CH[k];inc(c.x+c.ex.x0,c.y+c.ex.y0);inc(c.x+c.ex.x1,c.y+c.ex.y1)});
  cluster.forEach(function(it){inc(it.cx,it.cy)});
  inc(-20,-20);inc(20,20);
  var cw=76,ch=100,pad=8,sc=Math.min((cw-pad*2)/(b.x1-b.x0||1),(ch-pad*2)/(b.y1-b.y0||1));
  function M(x,y){return [pad+(x-b.x0)*sc,pad+(y-b.y0)*sc]}
  var g2=cv.getContext('2d');cv.width=cw*2;cv.height=ch*2;g2.setTransform(2,0,0,2,0,0);
  g2.clearRect(0,0,cw,ch);
  g2.strokeStyle='rgba(214,226,236,.2)';g2.lineWidth=1;
  ORDER.forEach(function(k){var c=CH[k],o=M(0,0),p=M(c.x,c.y);g2.beginPath();g2.moveTo(o[0],o[1]);g2.lineTo(p[0],p[1]);g2.stroke()});
  cluster.forEach(function(it){var p=M(it.cx,it.cy);g2.fillStyle='rgba(255,236,205,.7)';g2.fillRect(p[0]-1.2,p[1]-1.2,2.4,2.4)});
  ORDER.forEach(function(k){var p=M(CH[k].x,CH[k].y);g2.fillStyle='rgba(232,238,245,.9)';g2.beginPath();g2.arc(p[0],p[1],2.4,0,7);g2.fill()});
  var corners=[wp(0,64),wp(W,64),wp(W,H),wp(0,H)].map(function(p){return M(p[0],p[1])});
  g2.strokeStyle='rgba(232,238,245,.85)';
  g2.beginPath();corners.forEach(function(p,i){if(i)g2.lineTo(p[0],p[1]);else g2.moveTo(p[0],p[1])});g2.closePath();g2.stroke();
  btn._map={b:b,pad:pad,sc:sc};
}
function jumpMap(e){
  var btn=$('mmap');if(!btn||!btn._map)return;
  var m=btn._map,r=btn.getBoundingClientRect();
  var wx=m.b.x0+(e.clientX-r.left-m.pad)/m.sc;
  var wy=m.b.y0+(e.clientY-r.top-m.pad)/m.sc;
  var best=null,bd=1e9;
  ORDER.forEach(function(k){var c=CH[k],d=Math.hypot(c.x-wx,c.y-wy);if(d<bd){bd=d;best=k}});
  if(best&&bd<180)go({lv:1,k:best,id:null});
  else {cxS.t=wx;cyS.t=wy}
}
function syncHire(){
  var b=$('hire'),c=$('hirecard');if(!b)return;
  var show=phase==='sky'&&cur.lv===0;
  b.hidden=!show;
  if(!show&&c){c.hidden=true;b.setAttribute('aria-expanded','false')}
}
function hireOpen(open){
  var b=$('hire'),c=$('hirecard');if(!b||!c)return;
  c.hidden=!open;b.setAttribute('aria-expanded',open?'true':'false');
}

/* ---------- arrival, landing ---------- */
function fillPoem(){
  var el=$('poem');
  var letters='gill james'.split('').map(function(ch,i){
    return '<i style="animation-delay:'+(i*0.16).toFixed(2)+'s">'+(ch===' '?'&nbsp;':ch)+'</i>';
  }).join('');
  el.innerHTML='<span class="wm"><span class="gj fade">'+letters+'</span><span class="gj">gill james</span></span><span id="typed"></span><span class="sig" lang="cr">ᑕᐣᓯ</span>';
  typePoem();
}
function typePoem(){
  var host=$('typed');if(!host||host._go)return;host._go=1;
  var lines=(data.poem||[]).slice(),n=0,pos=0;
  var spans=lines.map(function(){var s=document.createElement('span');host.appendChild(s);return s});
  (function tick(){
    if(!host.isConnected||n>=lines.length)return;
    pos++;spans[n].textContent=lines[n].slice(0,pos);
    if(pos>=lines[n].length){n++;pos=0}
    setTimeout(tick,pos===0?260:38);
  })();
}
function dust(){
  var d=$('dust'),h='';
  for(var i=0;i<16;i++)h+='<i style="left:'+(rnd(i)*100).toFixed(1)+'%;top:'+(rnd(i+9)*100).toFixed(1)+'%;opacity:'+(0.2+rnd(i+3)*.6).toFixed(2)+'"></i>';
  d.innerHTML=h;
}
function landFrames(){
  function src(id){var it=byId[id];return it&&it.media&&(it.media.big||it.media.thumb)||''}
  return [
    {src:src('film/one-with-the-devil'),cap:'One With the Devil'},
    {src:src('film/weird-kid'),cap:'Weird Kid'},
    {src:src('objects/hand-carved-piece'),cap:'hand-carved piece'},
    {src:src('sound/to-go'),cap:'To Go'}
  ];
}
function setChrome(){
  var on=phase==='arrive'||phase==='fly';
  $('water').classList.toggle('on',on);
  $('moon').classList.toggle('on',phase==='arrive');
  $('path').classList.toggle('on',phase==='arrive');
  $('horizon').classList.toggle('on',phase==='arrive');
  $('dust').classList.toggle('on',phase==='arrive'||phase==='sky');
  $('poem').classList.toggle('on',phase==='arrive');
  $('dive').classList.toggle('on',phase==='arrive');
  $('bar').classList.toggle('on',phase==='sky');
  $('land').classList.toggle('on',phase==='land');
  syncHire();
}
function showLand(){
  var L=lands[landI]||lands[0];
  $('landimg').src=L.src;$('landimg').alt=L.cap;$('landcap').textContent=L.cap;
  setChrome();
}
function nextLand(){
  if(landI>=lands.length-1){enterSky(false);return}
  landI++;landT=now();showLand();
}
function dive(){
  if(phase!=='arrive'&&phase!=='fly')return;
  try{sessionStorage.setItem('u2-seen','1')}catch(e){}
  if(RM){enterSky(true);return}
  if(phase==='fly'){enterSky(true);return}
  phase='fly';flyT=now();flyU=0;setChrome();
  ripples();
  if(window.GJ_DEPTH)GJ_DEPTH.burst();
}
function ripples(){
  var w=$('water');if(!w)return;
  for(var i=0;i<3;i++){
    var s=document.createElement('i');s.className='rip';
    s.style.left=(46+i*6)+'%';s.style.top=(62+i*2)+'%';s.style.animationDelay=(i*0.16)+'s';
    w.appendChild(s);
    (function(n){setTimeout(function(){if(n.parentNode)n.parentNode.removeChild(n)},1700)})(s);
  }
}
function enterSky(instant){
  phase='sky';
  try{sessionStorage.setItem('u2-seen','1')}catch(e){}
  setChrome();
  if(!history.state||!history.state.u1)history.replaceState({u1:1,cur:{lv:cur.lv,k:cur.k,id:cur.id}},'',hashOf(cur));
  arriveAt(cur,instant||RM);
}
function decide(){
  var hash=location.hash||'';
  var deep=hash&&hash!=='#'&&hash!=='#/';
  var seen=false;try{seen=sessionStorage.getItem('u2-seen')==='1'}catch(e){}
  var forceArrive=Q.get('arrive')==='1';
  var forceSky=Q.get('sky')==='1'||Q.get('arrive')==='0';
  var forceLand=Q.get('land')==='1';
  if(deep){
    var st=parseHash(hash);seed(st);enterSky(true);return;
  }
  if(forceSky){cur={lv:0,k:null,id:null};enterSky(true);return}
  if(forceLand){phase='land';landI=0;landT=now()+1e9;showLand();return}
  if(forceArrive||(!seen&&!RM)){phase='arrive';setChrome();return}
  if(!seen&&RM){phase='arrive';setChrome();return}
  cur={lv:0,k:null,id:null};enterSky(true);
}
function parseHash(h){
  h=(h||'').replace(/^#\/?/,'').split('?')[0];
  if(!h)return {lv:0,k:null,id:null};
  var b=h.split('/').filter(Boolean);
  if(b[0]==='progress'){
    if(!b[1])return {lv:1,k:'progress',id:null};
    var it=progress.filter(function(p){return p.slug===b[1]})[0];
    return {lv:it?2:1,k:'progress',id:it?it.id:null};
  }
  if(!CH[b[0]])return {lv:0,k:null,id:null};
  if(!b[1])return {lv:1,k:b[0],id:null};
  var card=CH[b[0]].items.filter(function(it){return it.slug===b[1]})[0];
  return {lv:card?2:1,k:b[0],id:card?card.id:null};
}
function seed(st){
  var chain=[{lv:0,k:null,id:null}];
  if(st.lv>=1)chain.push({lv:1,k:st.k,id:null});
  if(st.lv>=2)chain.push({lv:2,k:st.k,id:st.id});
  history.replaceState({u1:1,cur:chain[0]},'',hashOf(chain[0]));
  for(var i=1;i<chain.length;i++)history.pushState({u1:1,cur:chain[i]},'',hashOf(chain[i]));
  cur=chain[chain.length-1];
  if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());
}

window.__u1={
  get phase(){return phase},get cur(){return {lv:cur.lv,k:cur.k,id:cur.id}},
  get sel(){return sel},get ready(){return ready},
  get bloom(){return bloom},
  get zoom(){return window.GJ_DEPTH?GJ_DEPTH.state():(window.GJ_INNER?GJ_INNER.state():{step:0})},
  pinchIn:function(x,y){deeper(x,y)},
  pinchOut:function(){back()},
  open:function(id){var it=byId[id];if(!it)return;go({lv:2,k:it.chapter,id:it.id})},
  get bio(){return {on:bioOn?1:0,lv:bioLv,exit:bioExit?1:0}},
  byId:function(id){return byId[id]},
  get map(){return {s:+rest.s.toFixed(3),prog:progress.map(function(it){var q=sp(it.cx,it.cy);return {t:it.title,x:Math.round(q[0]),y:Math.round(q[1])}}),ch:ORDER.map(function(k){var q=sp(CH[k].x,CH[k].y);return {k:k,x:Math.round(q[0]),y:Math.round(q[1])}})}},
  get tiles(){if(cur.lv<1)return [];var spec=gridSpec(boardKey()),items=boardItems();return items.slice(0,8).map(function(it,i){var rc=tileRect(spec,i,scr.x);return {id:it.id,t:it.title,x:Math.round(rc.x+rc.w/2),y:Math.round(rc.y+rc.h/2)}})}
};

fetch('data.json').then(function(r){return r.json()}).then(boot).catch(function(err){
  var w=$('where');if(w)w.textContent='could not read the works';
  console.error(err);
});
})();
