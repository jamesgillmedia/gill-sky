/* proto-shell module · about-calc-3d — the About / bio calculator as a real 3D model (three.js), rebuilt from the photo.
   ?m=about-calc-3d&at=about/board   (sibling of ?m=about-calc; that module and the bio are not touched)

   What it is
   - The same page as about-calc A (the m4 / tonight bio): full-screen calculator, grain, Gill's seven layers, rail, moon grid, the same
     taps, Back, Esc, pinch and wheel. Only the flat glitch canvas is replaced: its pixels are now the skin of a 3D calculator.
   - The model (model.js) is geometry measured from the clip: the face plate, the six keys as raised tapered caps, the display set back
     into a window with walls, the name plate as a shallow step, the light case rim raised, the case side and the dark behind it set well
     back, the OFF / ON slide on the side, and the body's thickness behind it.
   - Its colour is the photo itself, projected from the rest camera (projective texturing): every point of the model takes the pixel
     of the glitch canvas that it covers when the camera is at rest. So at rest the render IS the flat picture, pixel for pixel
     (QA: window.__calc3d.restDiff()), and when you turn it the keys, the window walls and the case edge show their depth.
   - The glitch is the bio's own (tonight/about/bio/js/sky.js drawGlitch, verbatim, with gj.noflash and gj.glitch): it runs on the
     canvas the model wears, so the bands, the RGB split, the scanlines, the mosh and the display's green flicker move over the
     3D surfaces. Stop flashing freezes the clip and the glitch exactly as on the bio; the glitch slider is the same 0-100.
   - Drag (one finger or the mouse) orbits the model; let go and it springs back to rest on the site's critically damped tilt spring
     (constellation blend / site-3d sstep, w from tokens motion.springs.tiltBlend = 9). A tap, a double tap, a second finger and the
     wheel are handed to the shell exactly as about-calc B does, so tap = one layer deeper, double tap = out, pinch-out leaves.
   - Red mode: the photo and the model are never tinted (photos stay true colour); the words, rail and controls follow Red through the
     core's module-stylesheet mapping, as about-calc does.
   - If WebGL is not there, the flat 2D glitch canvas shows instead (nothing else changes). */
(function(){
'use strict';
var BASE='modules/about-calc-3d/',SRC='modules/about-calc/';
var THREE_URL='../tonight/fable-m4/objects-3d/vendor/three.module.min.js'; /* three r160, the copy the site's 3D rooms already ship */
var THREE=null;
function $(id){return document.getElementById(id)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rdk(k,d){try{var v=localStorage.getItem(k);if(v==null||v==='')return d;v=+v;return isFinite(v)?v:d}catch(e){return d}}
function loadCss(h){return new Promise(function(ok){var l=document.createElement('link');l.rel='stylesheet';l.href=h;l.onload=ok;l.onerror=ok;document.head.appendChild(l)})}
function loadJs(s){return new Promise(function(ok,no){var e=document.createElement('script');e.src=s;e.onload=ok;e.onerror=function(){no(new Error(s))};document.head.appendChild(e)})}

/* ---------- bio controls: the bio's own keys (gj.noflash '1'/'0', gj.glitch 0..1), same names, same behaviour ---------- */
function lsr(k,d){try{var v=parseFloat(localStorage.getItem(k));return isFinite(v)?Math.max(0,Math.min(1,v)):d}catch(x){return d}}
function lsOn(k){try{var v=localStorage.getItem(k);return v==='1'||v==='true'||v==='yes'}catch(x){return false}}
var GNOFLASH=lsOn('gj.noflash'),GGL=lsr('gj.glitch',1);
addEventListener('storage',function(e){
  if(e.key==='gj.noflash'){GNOFLASH=lsOn('gj.noflash');applyNoflash()}
  if(e.key==='gj.glitch'){GGL=lsr('gj.glitch',1);applyGlitch()}
});

var TUNE=[
  {type:'toggle',k:'gj.noflash',label:'stop flashing',options:[['0','flashing'],['1','stopped']],get:function(){return GNOFLASH?'1':'0'},set:function(v){setNoflash(v==='1')}},
  {k:'gj.glitch',label:'glitch',min:0,max:100,def:100,scale:100,after:function(){GGL=lsr('gj.glitch',1);applyGlitch()}},
  {k:'gj.acalc3d.orbit',label:'turn amount',min:0,max:45,def:24},
  {k:'gj.acalc3d.depth',label:'depth',min:0,max:300,def:100,after:function(){if(R.mat)R.mat.uniforms.uD.value=depthK()}}];
var M={id:'about-calc-3d',title:'about · calculator 3D',chapter:'about',
  variants:{A:'3D model of the calculator: at rest it is the photo, pixel for pixel; drag to turn it, it springs back. The glitch runs on its skin'},
  tune:TUNE};
M.ready=Promise.all([loadCss(SRC+'calc.css'),loadCss(BASE+'calc3d.css'),loadJs(SRC+'layers.js'),loadJs(BASE+'model.js'),
  import(new URL(THREE_URL,location.href).href).then(function(m){THREE=m}).catch(function(e){console.warn('calc3d: three.js did not load, flat fallback',e)})]);
function orbitDeg(){return clamp(rdk('gj.acalc3d.orbit',24),0,45)}
function depthK(){return clamp(rdk('gj.acalc3d.depth',100),0,300)/100}

/* ---------- m4 / bio state ---------- */
var bioOn=0,bioLv=1,bioExit=0,bioMoon=0,grainOn=0,SH=null,root=null;
function isBio(){var c=SH&&SH.ladder.cur;return !!c&&c.lv===2&&c.k==='about'}
function paintGrain(){
  var c=$('grain');if(!c||grainOn)return;
  var w=180,h=320;c.width=w;c.height=h;
  var g=c.getContext('2d'),im=g.createImageData(w,h),d=im.data,i;
  for(i=0;i<d.length;i+=4){var n=(Math.random()*255)|0;d[i]=d[i+1]=d[i+2]=n;d[i+3]=70}
  g.putImageData(im,0,0);grainOn=1;
}
var GL={bands:[],burst:0,w:0,h:0,frame:null,prev:null};
function calcCrop(v,W,H){
  var vw=v.videoWidth,vh=v.videoHeight;
  var bx=0,by=vh*0.045,bw=vw,bh=vh*0.88;
  var dar=W/Math.max(1,H),sw,sh;
  if(bw/bh>dar){sh=bh;sw=sh*dar}else{sw=bw;sh=sw/dar}
  var sx=Math.max(0,Math.min(vw-sw,bx+(bw-sw)/2));
  var sy=Math.max(0,Math.min(vh-sh,by+(bh-sh)*0.22));
  var fx=vw*0.58,fy=vh*0.40;
  return {sx:sx,sy:sy,sw:sw,sh:sh,lx:(fx-sx)/sw,ly:(fy-sy)/sh};
}
function layoutCalc(){
  var stage=$('calcstage'),zoom=$('calczoom'),v=$('calc');
  if(!stage||!zoom)return;
  var z=1+(Math.max(1,Math.min(7,bioLv))-1)*0.30;
  var ox=52,oy=66,crop=null;
  if(v&&v.videoWidth&&stage.clientWidth){
    crop=calcCrop(v,stage.clientWidth,stage.clientHeight);
    ox=crop.lx*100;oy=crop.ly*100;
  }
  zoom._crop=crop;
  zoom.style.transformOrigin=ox.toFixed(2)+'% '+oy.toFixed(2)+'%';
  zoom.style.transform='scale('+z.toFixed(3)+')';
}
/* the bio's drawGlitch (tonight/about/bio/js/sky.js @ 324a4c53, lines 1990-2081), verbatim */
function drawGlitch(t){
  if(!bioOn||bioMoon)return;
  var v=$('calc'),c=$('glitch'),zoom=$('calczoom');
  if(!v||!c||!zoom||v.readyState<2||!v.videoWidth)return;
  var amt=clamp(GGL,0,1);
  var freeze=!!GNOFLASH;
  var tt=freeze&&GL.holdT!=null?GL.holdT:t;
  if(freeze&&GL.holdT==null)GL.holdT=t;
  if(!freeze)GL.holdT=null;
  if(freeze&&GL.still&&!GL.needStill&&GL.stillW===c.width&&GL.stillH===c.height&&GL.stillAmt===amt)return;
  var W=zoom.clientWidth||innerWidth,H=zoom.clientHeight||innerHeight;
  if(W<2||H<2)return;
  var bw=Math.max(2,Math.min(W,520)),bh=Math.max(2,Math.round(bw*H/W));
  if(c.width!==bw||c.height!==bh){c.width=bw;c.height=bh;GL.frame=null;GL.prev=null;GL.still=0}
  if(!zoom._crop)layoutCalc();
  var crop=zoom._crop;if(!crop)return;
  var g=c.getContext('2d',{willReadFrequently:true});
  g.drawImage(v,crop.sx,crop.sy,crop.sw,crop.sh,0,0,bw,bh);
  if(amt<=0){
    GL.needStill=0;GL.still=freeze?1:0;GL.stillW=c.width;GL.stillH=c.height;GL.stillAmt=amt;
    return;
  }
  var img=g.getImageData(0,0,bw,bh),d=img.data;
  if(!GL.frame||GL.frame.length!==d.length){GL.frame=new Uint8ClampedArray(d.length);GL.prev=new Uint8ClampedArray(d.length)}
  var src=GL.frame,prev=GL.prev,i;
  src.set(d);
  var depth=(Math.max(1,Math.min(7,bioLv))-1)/6;
  var shift=Math.round((1+depth*16+(GL.burst>0?2+depth*8:0))*amt);
  var mix=(0.16+depth*0.84)*amt;
  var dim=(0.28+depth*0.42)*amt;
  var scan=depth>0.55?2:3;
  var flick=(0.78-depth*0.5)+(0.28+depth*0.85)*(0.5+0.5*Math.sin(tt*(0.05*amt)));
  if(depth>0.35&&Math.sin(tt*(0.021*amt))>0.8)flick*=0.35;
  if(amt<1)flick=1+(flick-1)*amt;
  var yBand=(Math.sin(tt*(0.0023*amt))*0.5+0.5);
  var standY=(yBand*(bh-8))|0;
  var standDx=Math.round(Math.sin(tt*(0.0031*amt))*(depth*26)*amt);
  var standH=Math.round(2+depth*20);
  var standY2=((standY+((bh*0.37)|0))%bh);
  var standDx2=Math.round(Math.cos(tt*(0.0027*amt))*(depth*20)*amt);
  if(!freeze&&Math.random()<((0.12+depth*0.28+(GL.burst>0?0.55:0))*amt)){
    GL.bands.push({y:(Math.random()*bh)|0,hh:Math.round(3+Math.random()*(6+depth*22)),dx:Math.round((Math.random()*2-1)*(2+depth*26)*amt),life:3+((Math.random()*(4+depth*10))|0),mosh:Math.random()<0.45+depth*0.4});
  }
  var live,bi;
  if(!freeze){
    if(GL.burst>0)GL.burst--;
    live=[];
    for(bi=0;bi<GL.bands.length;bi++){GL.bands[bi].life--;if(GL.bands[bi].life>0)live.push(GL.bands[bi])}
    GL.bands=live.slice(-8);
  }else{
    live=GL.bands;
  }
  for(var y=0;y<bh;y++){
    var dx=0,mosh=0;
    if(y>=standY&&y<standY+standH)dx=standDx;
    if(y>=standY2&&y<standY2+Math.max(2,standH-2))dx=standDx2;
    for(bi=0;bi<live.length;bi++){
      var b=live[bi];
      if(y>=b.y&&y<b.y+b.hh){dx=b.dx;if(b.mosh&&GL.seen)mosh=1}
    }
    var row=mosh&&GL.prev?prev:src;
    var scanOn=(y%scan)===0;
    var o=y*bw*4;
    for(var x=0;x<bw;x++){
      var xr=x-shift+dx;if(xr<0)xr=0;else if(xr>=bw)xr=bw-1;
      var xb=x+shift+dx;if(xb<0)xb=0;else if(xb>=bw)xb=bw-1;
      var xg=x+dx;if(xg<0)xg=0;else if(xg>=bw)xg=bw-1;
      var ir=o+xr*4,ig=o+xg*4,ib=o+xb*4,ip=o+x*4;
      var r0=src[ip],g0=src[ip+1],b0=src[ip+2];
      var r=(r0*(1-mix)+row[ir]*mix)*0.76;
      var gc=(g0*(1-mix)+row[ig+1]*mix)*0.76;
      var bch=(b0*(1-mix)+row[ib+2]*mix)*0.76;
      if(scanOn){var s=1-dim;r*=s;gc*=s;bch*=s}
      if(g0>70&&g0>r0*1.25&&g0>b0*1.1)gc=Math.max(0,Math.min(255,g0*flick));
      d[ip]=r;d[ip+1]=gc;d[ip+2]=bch;d[ip+3]=255;
    }
  }
  g.putImageData(img,0,0);
  if(!freeze)prev.set(src);
  GL.seen=1;
  GL.needStill=0;GL.still=freeze?1:0;GL.stillW=c.width;GL.stillH=c.height;GL.stillAmt=amt;
}
/* the bio's control logic (sky.js 2725-2770), with the bio's buttons replaced by this page's light switch */
function applyNoflash(){
  document.documentElement.classList.toggle('gj-noflash',!!GNOFLASH);
  var v=$('calc'),moon=$('moons');
  if(GNOFLASH){
    if(v)try{v.pause()}catch(e){}
    if(moon)try{moon.pause()}catch(e){}
    GL.needStill=1;GL.still=0;
  }else{
    GL.still=0;GL.holdT=null;GL.needStill=0;
    if(bioOn&&isBio()&&!bioMoon&&v){v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){})}
    if(bioMoon&&moon){moon.muted=true;var q=moon.play();if(q&&q.catch)q.catch(function(){})}
  }
  syncBioCtl();
}
function applyGlitch(){
  GGL=clamp(GGL,0,1);
  document.documentElement.style.setProperty('--glitch',String(GGL));
  if(GNOFLASH){GL.still=0;GL.needStill=1}
  syncBioCtl();
}
function setNoflash(on){
  GNOFLASH=!!on;
  try{localStorage.setItem('gj.noflash',GNOFLASH?'1':'0')}catch(e){}
  applyNoflash();
}
function setGlitch(v){
  var n=+v;GGL=isFinite(n)?clamp(n,0,1):1;
  try{localStorage.setItem('gj.glitch',String(GGL))}catch(e){}
  applyGlitch();
}
function glitchLabel(v){v=Math.round(clamp(v,0,1)*100);return v>=100?'full':v<=0?'off':v+'%'}
var CTL=null;
function buildCtl(){
  var c=document.createElement('div');c.className='c3-ctl';c.hidden=true;
  c.innerHTML='<button type="button" class="c3-tg" aria-expanded="false" aria-controls="c3-p" aria-label="bio controls: stop flashing, glitch"><i aria-hidden="true"></i>light</button>'+
    '<div class="c3-p" id="c3-p" role="group" aria-label="bio controls" hidden>'+
    '<button type="button" class="c3-sw" aria-pressed="false"><i class="led" aria-hidden="true"></i><span>stop flashing</span></button>'+
    '<label class="c3-row"><span>glitch</span><input type="range" min="0" max="100" step="1" aria-label="glitch intensity"><b></b></label></div>';
  document.body.appendChild(c);
  ['pointerdown','pointerup','touchstart','touchend','click','wheel','dblclick'].forEach(function(ev){c.addEventListener(ev,function(e){e.stopPropagation()})});
  var tg=c.querySelector('.c3-tg'),p=c.querySelector('.c3-p'),sw=c.querySelector('.c3-sw'),sl=c.querySelector('input');
  tg.addEventListener('click',function(){var o=p.hidden;p.hidden=!o;tg.setAttribute('aria-expanded',o?'true':'false')});
  sw.addEventListener('click',function(e){e.preventDefault();setNoflash(!GNOFLASH)});
  sl.addEventListener('input',function(){setGlitch(sl.value/100)});
  CTL={el:c,tg:tg,p:p,sw:sw,sl:sl,lab:c.querySelector('.c3-row b')};
}
function syncBioCtl(){
  if(!CTL)return;
  var show=!!(bioOn&&isBio()&&!bioMoon&&!bioExit);
  CTL.el.hidden=!show;if(!show){CTL.p.hidden=true;CTL.tg.setAttribute('aria-expanded','false')}
  CTL.sw.setAttribute('aria-pressed',GNOFLASH?'true':'false');
  if(document.activeElement!==CTL.sl)CTL.sl.value=String(Math.round(clamp(GGL,0,1)*100));
  CTL.lab.textContent=glitchLabel(GGL);
}
window.GJ_BIOCTL={noflash:function(){return !!GNOFLASH},setNoflash:setNoflash,glitch:function(){return GGL},setGlitch:setGlitch,sync:syncBioCtl};

/* ---------- the seven layers (m4 / bio paintBio, syncBio, deeper, back, moon) ---------- */
function paintBio(flick){
  var texts=(window.GJ_BIO&&GJ_BIO.layers)||[];
  var text=texts[bioLv-1]||'';
  var box=$('laytext');
  if(box){
    box.className='copy lv'+bioLv+(bioLv===7?' sel':'');
    box.innerHTML=text.split('\n').map(function(line){return line?'<span>'+esc(line)+'</span>':'<br>'}).join('');
    if(flick&&!GNOFLASH){
      box.classList.add('flick');
      GL.burst=8;
      setTimeout(function(){box.classList.remove('flick')},40);
    }
  }
  var rail=$('lrail');
  if(rail){
    var dots='',i;for(i=1;i<=7;i++)dots+='<i'+(i===bioLv?' class="on"':'')+'></i>';
    rail.innerHTML=dots+'<b>'+bioLv+'</b>';
  }
  var v=$('calc');
  if(v){
    v.muted=true;
    if(GNOFLASH){try{v.pause()}catch(e){}}
    else{var p=v.play();if(p&&p.catch)p.catch(function(){})}
  }
  layoutCalc();
  syncBioCtl();
  var w=document.querySelector('#crumb .where');if(w)w.textContent='about › bio · '+bioLv;
}
function syncBio(){
  var el=root;if(!el)return;
  if(bioExit)return;
  var active=isBio();
  if(!active){el.hidden=true;el.classList.remove('on','exit','moonfade');bioOn=0;bioMoon=0;syncBioCtl();return}
  if(!bioOn)bioLv=1;
  bioOn=1;if(bioLv<1)bioLv=1;if(bioLv>7)bioLv=7;
  el.hidden=false;el.classList.add('on');
  if(bioMoon){el.classList.add('exit');el.classList.remove('moonfade');syncBioCtl();return}
  el.classList.remove('exit','moonfade');
  paintGrain();paintBio(false);
  applyNoflash();
  R.resize();
}
function enterMoon(){
  bioMoon=1;
  var el=root;if(!el)return;
  var moon=$('moons');
  if(moon){
    moon.muted=true;
    if(!moon._slot){
      moon._slot=1;
      moon.addEventListener('error',function(){
        if(document.getElementById('moonempty'))return;
        var slot=document.createElement('div');
        slot.id='moonempty';slot.className='empty-slot';
        slot.textContent='no picture of the moon grid';
        el.appendChild(slot);
      });
    }
    var p=moon.play();if(p&&p.catch)p.catch(function(){});
  }
  el.classList.add('exit');
  el.classList.remove('moonfade');
  syncBioCtl();
  var w=document.querySelector('#crumb .where');if(w)w.textContent='about › moon';
}
function bioDeeper(){
  if(bioExit)return true;
  if(!isBio())return false;
  if(bioMoon)return true;
  if(bioLv>=7){enterMoon();return true}
  bioLv++;paintBio(true);return true;
}
var OUT0=null;
function startMoonExit(){
  if(bioExit)return;
  bioExit=1;bioMoon=0;
  var el=root;if(!el){bioExit=0;return}
  var moon=$('moons');
  if(moon){moon.muted=true;var p=moon.play();if(p&&p.catch)p.catch(function(){})}
  el.classList.add('exit');syncBioCtl();
  setTimeout(function(){el.classList.add('moonfade')},760);
  setTimeout(function(){
    bioExit=0;bioOn=0;bioLv=1;bioMoon=0;
    el.hidden=true;el.classList.remove('on','exit','moonfade');
    OUT0();
  },760+1200);
}
function bioBack(){
  if(bioExit)return true;
  if(!(bioOn&&isBio()))return false;
  if(bioMoon){
    bioMoon=0;
    if(root)root.classList.remove('exit','moonfade');
    paintBio(true);
    return true;
  }
  if(bioLv>1){bioLv--;paintBio(true);return true}
  startMoonExit();return true;
}

/* ---------- the 3D model ---------- */
/* local model space: x = video x - 180, y = 320 - video y (up), z = video px towards the viewer */
var R={ok:false,resize:function(){}};
var VS=[
'attribute float kind;',
'uniform mat4 uPV;uniform float uD;',
'varying vec4 vP;varying vec3 vN;varying vec2 vL;varying float vK;',
'void main(){',
' vec3 p=vec3(position.xy,position.z*uD);',
' vP=uPV*vec4(p,1.0);vL=p.xy;vK=kind;',
' vN=normalize(normalMatrix*normal);',
' gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);',
'}'].join('\n');
/* the colour of every surface = the pixel of the glitch canvas it covers at rest. Faces that lie flat (the plate, key tops, the display
   floor, the name plate, the case side) are never shaded: they are the photo. Walls and the body's edge take a soft light only while
   the model is turned (uAmt 0 at rest, so the rest pose stays the photo exactly). */
var FS=[
'uniform sampler2D map;uniform float uAmt;uniform vec4 uClip;uniform vec3 uL;',
'varying vec4 vP;varying vec3 vN;varying vec2 vL;varying float vK;',
'void main(){',
' if(vL.x<uClip.x-0.02||vL.x>uClip.z+0.02||vL.y<uClip.y-0.02||vL.y>uClip.w+0.02)discard;',
' vec2 uv=clamp(vP.xy/vP.w*0.5+0.5,0.0,1.0);',
' vec3 c=texture2D(map,uv).rgb;',
' if(vK>0.5){vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;float l=0.42+0.58*max(dot(n,uL),0.0);if(vK>1.5)l=0.16;c*=mix(1.0,l,uAmt);}',
' gl_FragColor=vec4(c,1.0);',
'}'].join('\n');
function L2(x,y){return [x-180,320-y]}
function area(p){var a=0;for(var i=0;i<p.length;i++){var q=p[(i+1)%p.length];a+=p[i][0]*q[1]-q[0]*p[i][1]}return a/2}
function roundPoly(q,r,seg){var out=[],n=q.length;for(var i=0;i<n;i++){var c=q[i],a=q[(i+n-1)%n],b=q[(i+1)%n];
  var da=Math.hypot(a[0]-c[0],a[1]-c[1]),db=Math.hypot(b[0]-c[0],b[1]-c[1]),rr=Math.min(r,da*0.45,db*0.45);
  var p1=[c[0]+(a[0]-c[0])/da*rr,c[1]+(a[1]-c[1])/da*rr],p2=[c[0]+(b[0]-c[0])/db*rr,c[1]+(b[1]-c[1])/db*rr];
  for(var s=0;s<=seg;s++){var t=s/seg,u=1-t;out.push([u*u*p1[0]+2*u*t*c[0]+t*t*p2[0],u*u*p1[1]+2*u*t*c[1]+t*t*p2[1]])}}
  return out}
/* convex offset inwards by d (each edge moved in, neighbours intersected) */
function inset(p,d){if(!d)return p.map(function(v){return v.slice()});var n=p.length,sg=area(p)>0?1:-1,L=[],i;
  for(i=0;i<n;i++){var a=p[i],b=p[(i+1)%n],ex=b[0]-a[0],ey=b[1]-a[1],l=Math.hypot(ex,ey)||1,nx=-ey/l*sg,ny=ex/l*sg;L.push([a[0]+nx*d,a[1]+ny*d,ex,ey])}
  var out=[];for(i=0;i<n;i++){var A=L[(i+n-1)%n],B=L[i],den=A[2]*B[3]-A[3]*B[2];
    if(Math.abs(den)<1e-6){out.push([B[0],B[1]]);continue}var t=((B[0]-A[0])*B[3]-(B[1]-A[1])*B[2])/den;out.push([A[0]+A[2]*t,A[1]+A[3]*t])}
  return out}
function Builder(){this.p=[];this.k=[]}
Builder.prototype.tri=function(a,b,c,kind){this.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);this.k.push(kind,kind,kind)};
Builder.prototype.fill=function(poly,z,kind,holes){var V2=THREE.Vector2,ct=poly.map(function(v){return new V2(v[0],v[1])}),hs=(holes||[]).map(function(h){return h.map(function(v){return new V2(v[0],v[1])})});
  var all=poly.concat.apply(poly,holes||[]),tris=THREE.ShapeUtils.triangulateShape(ct,hs),self=this;
  tris.forEach(function(t){var a=all[t[0]],b=all[t[1]],c=all[t[2]];self.tri([a[0],a[1],z],[b[0],b[1],z],[c[0],c[1],z],kind)})};
Builder.prototype.walls=function(A,za,B,zb,kind){for(var i=0;i<A.length;i++){var j=(i+1)%A.length,a0=[A[i][0],A[i][1],za],a1=[A[j][0],A[j][1],za],b0=[B[i][0],B[i][1],zb],b1=[B[j][0],B[j][1],zb];
  this.tri(a0,a1,b1,kind);this.tri(a0,b1,b0,kind)}};
Builder.prototype.geo=function(){var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('kind',new THREE.Float32BufferAttribute(this.k,1));g.computeVertexNormals();return g};
function ccw(p){return area(p)<0?p.slice().reverse():p}
function cw(p){return area(p)>0?p.slice().reverse():p}
function loc(q){return q.map(function(v){return L2(v[0],v[1])})}
/* the fixed relief (built once): face plate with holes, recesses with walls and floors, raised caps */
function buildRelief(){
  var D=window.GJ_CALC3D_MODEL,b=new Builder();
  var rimQ=D.rim.q,ro=[rimQ[0],rimQ[3]]; /* the rim's outer line (top, bottom), extended past the frame */
  function rimX(y){return ro[0][0]+(ro[1][0]-ro[0][0])*(y-ro[0][1])/(ro[1][1]-ro[0][1])}
  var sideV=[[-500,-400],[rimX(-400),-400],[rimX(1040),1040],[-500,1040]];
  var rimV=[[rimX(-400),-400],[rimQ[1][0]+(rimQ[2][0]-rimQ[1][0])*(-400-rimQ[1][1])/(rimQ[2][1]-rimQ[1][1]),-400],
    [rimQ[1][0]+(rimQ[2][0]-rimQ[1][0])*(1040-rimQ[1][1])/(rimQ[2][1]-rimQ[1][1]),1040],[rimX(1040),1040]];
  var dispV=roundPoly(D.disp.q,4,3),plateV=roundPoly(D.plate.q,3,3);
  var side=ccw(loc(sideV)),disp=ccw(loc(dispV)),plate=ccw(loc(plateV));
  var outer=ccw(loc([[rimX(-400)+0.001,-400],[900,-400],[900,1040],[rimX(1040)+0.001,1040]]));
  /* face plate (z 0), with the display and the name plate cut out; the case side is outside it */
  b.fill(outer,0,0,[cw(disp),cw(plate)]);
  /* recesses: walls from the plate down to the floor, floor inset by the taper */
  [[disp,D.disp],[plate,D.plate]].forEach(function(r){var fl=inset(r[0],r[1].taper||0);b.walls(r[0],0,fl,r[1].z,1);b.fill(fl,r[1].z,0)});
  /* the case side, set back; the step down from the rim is a wall */
  b.fill(side,D.side.z,0);
  var rim=ccw(loc(rimV)),rimTop=inset(rim,D.rim.taper||0);
  b.walls(rim,D.side.z,rim,0,1);  /* the rim's outer edge goes down to the case side */
  b.walls(rim,0,rimTop,D.rim.z,1);b.fill(rimTop,D.rim.z,0);
  /* keys: rounded, tapered caps standing on the plate */
  D.keys.forEach(function(k){var base=ccw(loc(roundPoly(k.q,D.keyRound,4))),top=inset(base,D.keyTaper);b.walls(base,0,top,k.z,1);b.fill(top,k.z,0)});
  /* the OFF / ON slide on the case side */
  var sw=ccw(loc(roundPoly(D.sw.q,3,2))),swt=inset(sw,D.sw.taper||0);b.walls(sw,D.side.z,swt,D.sw.z,1);b.fill(swt,D.sw.z,0);
  return b.geo();
}
/* the body's edge at the frame (rebuilt when the crop changes): four walls down to the back, and the back */
function buildSlab(cl){
  var D=window.GJ_CALC3D_MODEL,b=new Builder(),z0=D.side.z,zb=-D.slab;
  var r=ccw([[cl.x0,cl.y0],[cl.x1,cl.y0],[cl.x1,cl.y1],[cl.x0,cl.y1]]);
  b.walls(r,D.rim.z,r,zb,1);b.fill(r,zb,2);return b.geo();
}
function initGL(){
  if(!THREE)return false;
  var zoom=$('calczoom'),cv=document.createElement('canvas');cv.id='calc3d';cv.setAttribute('aria-hidden','true');zoom.appendChild(cv);
  var ren;try{ren=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:false,powerPreference:'high-performance'})}catch(e){cv.remove();console.warn('calc3d: no WebGL, flat fallback',e);return false}
  ren.setClearColor(0x04070b,1);ren.toneMapping=THREE.NoToneMapping;
  var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(22,1,1,4000);
  var pivot=new THREE.Group(),model=new THREE.Group();pivot.add(model);scene.add(pivot);
  var mat=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,side:THREE.DoubleSide,
    uniforms:{map:{value:null},uPV:{value:new THREE.Matrix4()},uD:{value:depthK()},uAmt:{value:0},uClip:{value:new THREE.Vector4(-1e4,-1e4,1e4,1e4)},uL:{value:new THREE.Vector3(-0.45,0.55,0.70).normalize()}}});
  var relief=new THREE.Mesh(buildRelief(),mat);model.add(relief);
  var slab=null;
  R={ok:true,ren:ren,cv:cv,scene:scene,cam:cam,pivot:pivot,model:model,mat:mat,tex:null,texW:0,texH:0,key:'',
     T:{x:0,y:0,vx:0,vy:0,tx:0,ty:0},
     resize:function(){
       var W=zoom.clientWidth||innerWidth,H=zoom.clientHeight||innerHeight,dpr=Math.min(devicePixelRatio||1,2),crop=zoom._crop;
       if(!crop){layoutCalc();crop=zoom._crop}if(!crop)return;
       var key=[W,H,dpr,crop.sx,crop.sy,crop.sw,crop.sh].map(function(v){return (+v).toFixed(3)}).join(',');if(key===R.key)return;R.key=key;
       ren.setPixelRatio(dpr);ren.setSize(W,H,false);
       /* the rest camera frames the crop exactly: the crop's height fills the vertical field of view at z = 0 */
       var cx=crop.sx+crop.sw/2-180,cy=320-(crop.sy+crop.sh/2),dist=crop.sh/2/Math.tan(cam.fov*Math.PI/360);
       cam.aspect=W/H;cam.near=dist*0.25;cam.far=dist*4;cam.position.set(cx,cy,dist);cam.lookAt(cx,cy,0);cam.updateProjectionMatrix();cam.updateMatrixWorld(true);
       mat.uniforms.uPV.value.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);
       pivot.position.set(cx,cy,0);model.position.set(-cx,-cy,0);
       var cl={x0:crop.sx-180,x1:crop.sx+crop.sw-180,y0:320-(crop.sy+crop.sh),y1:320-crop.sy};
       mat.uniforms.uClip.value.set(cl.x0,cl.y0,cl.x1,cl.y1);
       if(slab){model.remove(slab);slab.geometry.dispose()}slab=new THREE.Mesh(buildSlab(cl),mat);model.add(slab);
     }};
  root.classList.add('gl3');
  return true;
}
function syncTex(){
  var c=$('glitch');if(!c||c.width<4)return false;
  if(!R.tex||R.texW!==c.width||R.texH!==c.height){
    if(R.tex)R.tex.dispose();
    var t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;
    t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.colorSpace=THREE.NoColorSpace;
    R.tex=t;R.texW=c.width;R.texH=c.height;R.mat.uniforms.map.value=t;
  }else R.tex.needsUpdate=true;
  return true;
}
/* the spring: the site's critically damped step (site-3d sstep / constellation blend tilt), w from tokens (tiltBlend 9) */
function spr(T,a,dt){var sp=(((window.TK||{}).motion||{}).springs||{}),w=sp.tiltBlend&&sp.tiltBlend.w?sp.tiltBlend.w:9,vk='v'+a,e=T[a]-T['t'+a],k=Math.exp(-w*dt),c=T[vk]+w*e;T[a]=T['t'+a]+(e+c*dt)*k;T[vk]=(T[vk]-w*c*dt)*k}
var HELD=false;
function step3(dt){
  var T=R.T;spr(T,'x',dt);spr(T,'y',dt);
  if(!HELD&&Math.abs(T.x)<1e-3&&Math.abs(T.y)<1e-3&&Math.abs(T.vx)<1e-2&&Math.abs(T.vy)<1e-2){T.x=T.y=T.vx=T.vy=0}
  R.pivot.rotation.set(-T.x*Math.PI/180,T.y*Math.PI/180,0,'YXZ');
  R.mat.uniforms.uAmt.value=clamp(Math.max(Math.abs(T.x),Math.abs(T.y))/3,0,1);
}
function render3(){R.resize();if(!syncTex())return;R.ren.render(R.scene,R.cam)}

/* ---------- touch: one finger turns the model; tap / double tap / second finger / wheel go to the shell (as about-calc B) ---------- */
var DRAGGED=false;
function drag3(hit){
  var P=new Map(),fwd=false,D=null,cv=$('cv');
  function synth(type,id,x,y,pt){try{cv.dispatchEvent(new PointerEvent(type,{pointerId:id,clientX:x,clientY:y,pointerType:pt||'touch',isPrimary:id===P.keys().next().value,bubbles:true,cancelable:true}))}catch(e){}}
  hit.addEventListener('pointerdown',function(e){
    e.preventDefault();e.stopPropagation();try{hit.setPointerCapture(e.pointerId)}catch(x){}
    P.set(e.pointerId,{x:e.clientX,y:e.clientY,pt:e.pointerType});
    if(P.size>=2&&!fwd){fwd=true;D=null;HELD=false;hit.classList.remove('drag');R.T.tx=R.T.ty=0;P.forEach(function(p,id){synth('pointerdown',id,p.x,p.y,p.pt)});return}
    if(fwd){synth('pointerdown',e.pointerId,e.clientX,e.clientY,e.pointerType);return}
    try{if(window.ShellRipple)ShellRipple(e.clientX,e.clientY)}catch(x){}
    D={id:e.pointerId,x0:e.clientX,y0:e.clientY,t0:performance.now(),moved:0,bx:R.T.x,by:R.T.y};DRAGGED=false;HELD=true;hit.classList.add('drag');
  });
  hit.addEventListener('pointermove',function(e){var p=P.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;
    if(fwd){synth('pointermove',e.pointerId,e.clientX,e.clientY,e.pointerType);return}
    if(!D||D.id!==e.pointerId)return;var dx=e.clientX-D.x0,dy=e.clientY-D.y0;D.moved=Math.max(D.moved,Math.abs(dx)+Math.abs(dy));if(D.moved>=10)DRAGGED=true;
    if(!DRAGGED)return;
    var a=orbitDeg(),W=innerWidth,H=innerHeight;R.T.ty=clamp(D.by+dx/(Math.min(W,700)*0.5)*a,-a*1.25,a*1.25);R.T.tx=clamp(D.bx-dy/(Math.min(H,700)*0.5)*a,-a*1.25,a*1.25)});
  function up(e){var p=P.get(e.pointerId);if(!p)return;P.delete(e.pointerId);
    if(fwd){synth(e.type==='pointercancel'?'pointercancel':'pointerup',e.pointerId,e.clientX,e.clientY,e.pointerType);if(!P.size)fwd=false;return}
    if(D&&D.id===e.pointerId){var tap=D.moved<10&&performance.now()-D.t0<350;D=null;HELD=false;hit.classList.remove('drag');R.T.tx=0;R.T.ty=0;
      if(tap&&e.type==='pointerup'){var id=900000+(e.pointerId|0);synth('pointerdown',id,e.clientX,e.clientY,e.pointerType);synth('pointerup',id,e.clientX,e.clientY,e.pointerType)}}}
  hit.addEventListener('pointerup',up);hit.addEventListener('pointercancel',up);
  hit.addEventListener('wheel',function(e){e.preventDefault();try{cv.dispatchEvent(new WheelEvent('wheel',{deltaX:e.deltaX,deltaY:e.deltaY,deltaMode:e.deltaMode,clientX:e.clientX,clientY:e.clientY,ctrlKey:e.ctrlKey,bubbles:true,cancelable:true}))}catch(x){}},{passive:false});
}

/* ---------- shell hooks ---------- */
M.stop=function(st,W,H,sh){if(st.k!=='about'||st.lv<2)return undefined;if(st.lv>2)return null;
  var T=GJ_TUNE.values(),f=sh.sky.chFit('about',W,H);return {x:f.x,y:f.y,s:f.s*1.45*1.3*(T.board||1)}};
M.levelName=function(lv){return lv===2?'bio':'work'};
M.tuneTitle=function(st){return st.lv===2?'bio':null};
M.back=function(){return bioBack()};
M.inAt=function(){if(!isBio())return false;bioDeeper();return true};
M.arrow=function(d){if(!isBio())return false;if(d>0)bioDeeper();else bioBack();return true};
M.variant=function(){if(root)root.setAttribute('data-v','A')};
M.layout=function(){if(root&&!root.hidden){layoutCalc();R.resize()}};
M.level=function(){syncBio()};
M.tap=function(){if(!isBio())return false;if(bioMoon)return true;bioDeeper();return true};
M.init=function(sh){
  SH=sh;root=document.createElement('div');root.id='acalc';root.className='c3';root.hidden=true;root.setAttribute('data-v','A');
  root.innerHTML='<video id="calc" muted loop playsinline autoplay preload="auto" src="'+SRC+'media/calculator.mp4"></video>'+
    '<div id="calcstage"><div id="calczoom"><canvas id="glitch" aria-hidden="true"></canvas></div><canvas id="grain" aria-hidden="true"></canvas></div>'+
    '<div class="c3-hit" role="img" aria-label="the calculator, in 3D: drag to turn it, tap to go one layer deeper"></div>'+
    '<video id="moons" muted loop playsinline preload="auto" src="'+SRC+'media/moon-grid.mp4"></video>'+
    '<div id="laytext" class="copy"></div><div id="lrail" aria-hidden="true"></div>';
  document.body.insertBefore(root,$('crumb'));
  buildCtl();
  initGL();
  if(R.ok)drag3(root.querySelector('.c3-hit'));
  $('calc').addEventListener('loadedmetadata',function(){if(bioOn){layoutCalc();R.resize()}});
  root.addEventListener('click',function(e){
    if(!bioOn||bioExit||bioMoon)return;
    if(e.target.closest('a,button,input,.c3-hit'))return;
    var s=window.getSelection&&window.getSelection();if(s&&String(s).length)return;
    bioDeeper();
  });
  OUT0=function(){sh.ladder.out()};
  addEventListener('resize',function(){if(bioOn){layoutCalc();R.resize()}});
  applyGlitch();applyNoflash();
  syncBio();
};
var last=0;
M.draw=function(g,cam,t){var dt=last?Math.min(.05,(t-last)/1000):0;last=t;if(!bioOn||bioMoon&&!bioExit)return;
  drawGlitch(t);
  if(R.ok){step3(dt);render3()}};
M.state=function(){return {bio:{on:bioOn,lv:bioLv,moon:bioMoon,exit:bioExit},gl:!!R.ok,noflash:GNOFLASH,glitch:GGL,
  turn:R.T?{x:+R.T.x.toFixed(3),y:+R.T.y.toFixed(3)}:null}};
M.mid=function(){if(isBio()){bioLv=3;paintBio(false)}};

/* QA: the rest pose against the flat picture, from the same glitch frame. The flat side is the glitch canvas drawn at the 3D canvas's
   size (what the 2D page shows: the same canvas, stretched by CSS); the 3D side is the WebGL render at rest. Returns the mean absolute
   difference per channel (0-255), the share of pixels off by more than 8, and data URLs for the side-by-side. */
window.__calc3d={
  pose:function(x,y){R.T.x=R.T.tx=x||0;R.T.y=R.T.ty=y||0;R.T.vx=R.T.vy=0;HELD=!!(x||y);step3(0);render3()},
  release:function(){HELD=false;R.T.tx=R.T.ty=0},
  restDiff:function(out){
    if(!R.ok)return {err:'no webgl'};
    var hold=HELD;HELD=false;R.T.x=R.T.y=R.T.tx=R.T.ty=R.T.vx=R.T.vy=0;step3(0);R.resize();syncTex();R.ren.render(R.scene,R.cam);
    var gl=R.ren.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,px=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);
    var a=document.createElement('canvas');a.width=w;a.height=h;var ag=a.getContext('2d');ag.imageSmoothingEnabled=true;ag.drawImage($('glitch'),0,0,w,h);var A=ag.getImageData(0,0,w,h).data;
    var b=document.createElement('canvas');b.width=w;b.height=h;var bg=b.getContext('2d'),BI=bg.createImageData(w,h),B=BI.data;
    var d=document.createElement('canvas');d.width=w;d.height=h;var dg=d.getContext('2d'),DI=dg.createImageData(w,h),DD=DI.data;
    var sum=0,big=0,mx=0,n=w*h;
    for(var y=0;y<h;y++)for(var x=0;x<w;x++){var i=(y*w+x)*4,j=((h-1-y)*w+x)*4;B[i]=px[j];B[i+1]=px[j+1];B[i+2]=px[j+2];B[i+3]=255;
      var e0=Math.abs(A[i]-px[j]),e1=Math.abs(A[i+1]-px[j+1]),e2=Math.abs(A[i+2]-px[j+2]),e=(e0+e1+e2)/3;sum+=e;var em=Math.max(e0,e1,e2);if(em>8)big++;if(em>mx)mx=em;
      var v=Math.min(255,em*8);DD[i]=v;DD[i+1]=v;DD[i+2]=v;DD[i+3]=255}
    bg.putImageData(BI,0,0);dg.putImageData(DI,0,0);HELD=hold;
    var r={w:w,h:h,mean:+(sum/n).toFixed(3),over8:+(big/n*100).toFixed(3),max:mx};
    if(out)r.img={flat:a.toDataURL('image/png'),model:b.toDataURL('image/png'),diff:d.toDataURL('image/png')};
    return r}};
window.Shell.register(M);
})();
