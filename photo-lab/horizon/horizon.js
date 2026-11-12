/* Horizon · every photograph on one line of light, darkest to brightest (or round the colour wheel), measured from the pictures.
   Drag sideways (or wheel, or ← →) to scrub; the one standing on the horizon colours the sky and lies on the water.
   Tap it to walk into its day: a big hero, then the photographs in the same light as large stills down the page (the m4 film page shape).
   Pinch in for the day, then for the camera back; pinch out rises. Same motion with Reduce Motion on. */
(function(){
'use strict';
var P=LAB.photos,$=function(id){return document.getElementById(id)};
var sky=$('sky'),framesE=$('frames'),rt=$('rt'),nowE=$('now'),day=$('day'),dsc=$('dsc'),himg=$('himg'),cred=$('cred'),stack=$('stack'),where=$('where'),sortB=$('sort');
var mode='light',L=[],pos=0,target=0,raf=0,els=[],rels=[],reflE=$('refl'),W,H,HY,FH,SP=1;
function hex(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function mix(a,b,t){a=hex(a);b=hex(b);return'rgb('+[0,1,2].map(function(k){return Math.round(a[k]+(b[k]-a[k])*t)}).join(',')+')'}
function dark(h,k){var c=hex(h);return'#'+c.map(function(v){v=Math.round(v*k);return(v<16?'0':'')+v.toString(16)}).join('')}
function order(){L=P.slice();if(mode==='light')L.sort(function(a,b){return a.lum-b.lum});
  else L.sort(function(a,b){var ga=a.sat<.06,gb=b.sat<.06;if(ga!==gb)return ga?1:-1;if(ga)return a.lum-b.lum;return ((a.hue+.92)%1)-((b.hue+.92)%1)});
  $('e0').textContent=mode==='light'?'darker':'warm';$('e1').textContent=mode==='light'?'lighter':'greys';sortB.textContent=mode==='light'?'by light':'by colour'}
function build(){framesE.innerHTML='';reflE.innerHTML='';els=[];rels=[];L.forEach(function(p,i){var f=LAB.el('div','fm');f.dataset.i=i;
    f.innerHTML='<img alt="photograph '+LAB.num(p)+'" src="'+LAB.th(p)+'" decoding="async">'+(LAB.hearts.has(p.id)?'<span class="h">♥</span>':'');
    framesE.appendChild(f);els.push(f);var r=LAB.el('div','fm');r.innerHTML='<img alt="" src="'+LAB.th(p)+'">';reflE.appendChild(r);rels.push(r)});
  rt.innerHTML=L.map(function(p){return'<i style="background:'+p.avg+'"></i>'}).join('');size()}
function size(){W=innerWidth;H=innerHeight;var land=W>H;HY=Math.round(H*(land&&H<500?.70:.64));
  FH=land?Math.min(H*.52,HY-64):Math.min(H*.40,HY-96);
  els.forEach(function(f,i){var p=L[i],h=FH,w=h*p.w/p.h;if(w>W*(land?.6:.86)){w=W*(land?.6:.86);h=w*p.h/p.w}[f,rels[i]].forEach(function(e){e.style.width=w+'px';e.style.height=h+'px';e.style.marginLeft=(-w/2)+'px'});f.style.marginTop=(-h)+'px';f._w=w});
  sky.style.setProperty('--hy',HY+'px');lastCur=-1;paint()}
var lastCur=-1;
function paint(){var cur=Math.round(pos),g=Math.max(10,W*.018),cw=els[cur]._w,nw=FH*.8*.46;
  for(var i=0;i<els.length;i++){var d=i-pos,a=Math.abs(d),f=els[i],r=rels[i];
    if(a>7.5){if(f._v!==0){f.style.display=r.style.display='none';f._v=0;f.classList.remove('cur')}continue}
    if(!f._v){f.style.display=r.style.display='';f._v=1}
    var s=a<1?1-.54*a:Math.max(.2,.46-.05*(a-1)),reach=cw/2+g+nw/2,x=a<1?d*reach:Math.sign(d)*(reach+(a-1)*(nw+g)),
        sink=a<1.6?0:(a-1.6)*FH*.11;
    f.style.transform='translate('+x.toFixed(1)+'px,'+sink.toFixed(1)+'px) scale('+s.toFixed(3)+')';
    r.style.transform='translate('+x.toFixed(1)+'px,'+(-sink).toFixed(1)+'px) scale('+s.toFixed(3)+','+(-s).toFixed(3)+')';
    f.style.zIndex=r.style.zIndex=100-Math.round(a*10);
    f.style.filter=a>.5?'brightness('+(1-Math.min(.45,(a-.5)*.12)).toFixed(2)+')':'';f.classList.toggle('cur',i===cur)}
  var i0=Math.max(0,Math.floor(pos)),i1=Math.min(L.length-1,i0+1),t=pos-i0,a0=L[i0],a1=L[i1];
  var top=mix(dark(a0.top,.5),dark(a1.top,.5),t),hor=mix(a0.bot,a1.bot,t),wat=mix(dark(a0.bot,.3),dark(a1.bot,.3),t);
  sky.style.setProperty('--skyg','linear-gradient(180deg,'+top+' 0%,'+hor+' '+HY+'px,'+wat+' '+(HY+1)+'px,#04070b 100%)');sky.style.setProperty('--wc',wat);
  rt.style.transform='translateX('+(-(pos*6+2.5)).toFixed(1)+'px)';
  if(cur!==lastCur){lastCur=cur;var ch=rt.children;for(var k=0;k<ch.length;k++)ch[k].classList.toggle('on',k===cur);
    var p=L[cur];nowE.textContent=LAB.num(p)+' · light '+Math.round(p.lum*100);
    document.querySelector('meta[name=theme-color]').content=dark(a0.top,.5)}}
function loop(){raf=0;var d=target-pos;if(Math.abs(d)<.002){pos=target;paint();return}pos+=d*.11;paint();raf=requestAnimationFrame(loop)}
function go(t,now){target=Math.max(0,Math.min(L.length-1,t));if(now){pos=target;paint()}else if(!raf)raf=requestAnimationFrame(loop)}
/* scrub: drag sideways anywhere; release glides to the nearest photograph */
var dr=null;
sky.addEventListener('pointerdown',function(e){var onLine=Math.abs(e.clientY-HY)<34;dr={x:e.clientX,y:e.clientY,p:target,m:false,t:Date.now(),vx:0,lx:e.clientX,lt:Date.now(),rate:onLine?-6:FH*.2};sky.setPointerCapture(e.pointerId)});
sky.addEventListener('pointermove',function(e){if(!dr)return;var dx=e.clientX-dr.x;if(Math.abs(dx)>6)dr.m=true;var now=Date.now();dr.vx=(e.clientX-dr.lx)/Math.max(1,now-dr.lt);dr.lx=e.clientX;dr.lt=now;
  if(dr.m){go(dr.rate<0?dr.p-dx/6:dr.p-dx/dr.rate);if(dr.rate<0){pos=target;paint()}}});
sky.addEventListener('pointerup',function(e){if(!dr)return;if(dr.m){go(Math.round(target-(dr.rate<0?0:dr.vx*900/dr.rate)))}else{var el=document.elementFromPoint(e.clientX,e.clientY),f=el&&el.closest('.fm');
  if(f){var i=+f.dataset.i;if(i===Math.round(pos))openDay(L[i]);else go(i)}}dr=null});
sky.addEventListener('pointercancel',function(){dr=null;go(Math.round(target))});
var wt=0;sky.addEventListener('wheel',function(e){if(e.ctrlKey)return;e.preventDefault();var d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;go(target+d/120);clearTimeout(wt);wt=setTimeout(function(){go(Math.round(target))},160)},{passive:false});
LAB.pinch(sky,{in:function(){openDay(L[Math.round(pos)])},out:function(){LAB.leave('../')}});
sortB.addEventListener('click',function(){var id=L[Math.round(pos)].id;mode=mode==='light'?'colour':'light';order();build();var i=L.findIndex(function(p){return p.id===id});go(i,true);
  LAB.hint(mode==='light'?'lined up by their own light, darkest to brightest':'lined up round the colour wheel, warm first, the greys last',3200)});
/* ---------- the day ---------- */
var cp=null;
function near(p){var i=L.indexOf(p),out=[];for(var d=1;out.length<8&&d<L.length;d++){if(L[i+d])out.push(L[i+d]);if(out.length<8&&L[i-d])out.push(L[i-d])}return out}
function fillDay(p){cp=p;himg.src=LAB.img(p);himg.alt='photograph '+LAB.num(p);$('hero').style.setProperty('--hg','linear-gradient(180deg,'+p.top+','+dark(p.bot,.4)+')');
  cred.innerHTML='<span>frame <b>'+LAB.num(p)+'</b> of '+P.length+'</span><span><i class="sw" style="background:'+p.avg+'"></i>measured light <b>'+Math.round(p.lum*100)+'</b></span>'+
    '<button type="button" class="lab-btn" id="dh">'+(LAB.hearts.has(p.id)?'♥ kept':'♡ keep')+'</button>';
  $('dh').classList.toggle('on',LAB.hearts.has(p.id));
  $('dh').addEventListener('click',function(){LAB.hearts.toggle(p.id);fillDay(p)},{once:true});
  stack.innerHTML='<p class="lbl">in the same light</p>'+near(p).map(function(q){return'<figure data-id="'+q.id+'"><img loading="lazy" alt="photograph '+LAB.num(q)+'" src="'+LAB.img(q)+'" width="'+q.w+'" height="'+q.h+'"><figcaption>'+LAB.num(q)+'</figcaption></figure>'}).join('')}
function openDay(p){if(LAB.layer.top()==='day'){fillDay(p);dsc.scrollTo({top:0,behavior:'smooth'});return}
  fillDay(p);dsc.scrollTop=0;day.hidden=false;void day.offsetWidth;day.classList.add('open');where.textContent='horizon · its day';
  LAB.layer.push('day',function(){day.classList.remove('open');where.textContent='horizon';var i=L.indexOf(cp);if(i>=0)go(i);setTimeout(function(){if(!day.classList.contains('open'))day.hidden=true},1000)});
  LAB.hint('scroll down: the photographs in the same light · pinch in for the camera back · pinch out to the horizon',4600)}
stack.addEventListener('click',function(e){var f=e.target.closest('figure');if(!f)return;var p=P.filter(function(q){return q.id===f.dataset.id})[0];
  dsc.scrollTo({top:0,behavior:'smooth'});setTimeout(function(){fillDay(p);go(L.indexOf(p),true)},500)});
day.querySelector('.end').addEventListener('click',function(){LAB.layer.back()});
LAB.pinch(day,{in:function(){camera()},out:function(){LAB.layer.back()}});
/* ---------- camera back (in the horizon's order) ---------- */
function camera(){if(LAB.layer.top()==='camera back')return;var i=LAB.layer.top()==='day'?L.indexOf(cp):Math.round(pos);
  LAB.cameraBack(L,i,{onMove:function(k){go(k,true)}})}
$('cam').addEventListener('click',camera);
document.addEventListener('keydown',function(e){var top=LAB.layer.top();if(top==='camera back')return;
  if(top==='day'){if(e.key==='Escape')LAB.layer.back();else if(e.key==='+'||e.key==='=')camera();return}
  if(e.key==='ArrowRight'){go(Math.round(target)+1);e.preventDefault()}else if(e.key==='ArrowLeft'){go(Math.round(target)-1);e.preventDefault()}
  else if(e.key==='Enter'||e.key==='+'||e.key==='='){openDay(L[Math.round(pos)])}else if(e.key==='Escape')LAB.layer.back()});
document.addEventListener('lab:hearts',function(){els.forEach(function(f,i){var h=f.querySelector('.h'),on=LAB.hearts.has(L[i].id);if(on&&!h)f.appendChild(LAB.el('span','h','♥'));else if(!on&&h)h.remove()})});
$('back').addEventListener('click',function(){LAB.layer.back()});
addEventListener('resize',size);
order();build();go(Math.round(L.length*.5),true);
LAB.hint('drag sideways: every photograph, darkest to brightest · run a finger along the horizon line to fly · tap the one standing there',5600);
})();
