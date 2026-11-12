/* Light table · strips of frames on a glowing table. Drag the table to move across it; drag the loupe (or just move the mouse)
   to look closer; ✎ marks the frame under the loupe in grease pencil (a heart, kept on this device). Tap a frame, or tap the loupe,
   to lift it off the table; pinch in on a lifted frame for the camera back. Pinch out rises one place. Same motion with Reduce Motion on. */
(function(){
'use strict';
var P=LAB.photos,$=function(id){return document.getElementById(id)};
var table=$('table'),sheet=$('sheet'),loupe=$('loupe'),lin=$('lin'),mkB=$('mk'),lift=$('lift'),lf=$('lf'),limg=$('limg'),lcap=$('lcap'),where=$('where');
var PER=6,M=2.6,fh,gap,tx=0,ty=50,clone=null;
function rnd(i){var x=Math.sin(i*99.13+7.7)*43758.5453;return x-Math.floor(x)}
function circlePath(i){var a=[],n=26,ph=rnd(i)*6.28,j=.06+rnd(i+3)*.05;for(var k=0;k<=n+3;k++){var t=k/n*6.28+ph,r=1+Math.sin(t*2+i)*j+(k>n?.05:0);a.push((50+46*r*Math.cos(t)).toFixed(1)+','+(50+44*r*Math.sin(t)).toFixed(1))}return 'M'+a.join(' L')}
function build(){
  var W=innerWidth,H=innerHeight;PER=W<520?5:6;fh=W<520?80:H<520?84:Math.round(Math.min(124,H*.12));gap=Math.round(fh*.07);
  sheet.style.setProperty('--fh',fh+'px');sheet.style.setProperty('--g',gap+'px');var pad=W<520?10:36;sheet.style.padding=pad+'px';
  var stripW=PER*(fh*.8+gap)+gap*3,usable=W-40,cols=Math.max(1,Math.min(3,Math.floor((usable-72+34)/(stripW+34))));
  var strips=Math.ceil(P.length/PER),perCol=Math.ceil(strips/cols),html='';
  for(var c=0;c<cols;c++){html+='<div class="col">';for(var s=c*perCol;s<Math.min(strips,(c+1)*perCol);s++){
    html+='<div class="strip" style="transform:rotate('+((rnd(s)-.5)*1.4).toFixed(2)+'deg) translateX('+Math.round((rnd(s+9)-.5)*fh*(W<520?.12:.5))+'px)">';
    for(var i=s*PER;i<Math.min(P.length,(s+1)*PER);i++){var p=P[i];
      html+='<div class="fr'+(LAB.hearts.has(p.id)?' mk':'')+'" data-i="'+i+'"><img alt="frame '+LAB.num(p)+'" src="'+LAB.th(p)+'"><span class="en">'+p.n+' ▸ '+p.n+'A</span>'+
        '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path pathLength="400" d="'+circlePath(i)+'"/></svg><span class="ck">✓</span></div>'}
    html+='</div>'}html+='</div>'}
  sheet.innerHTML=html;
  lin.innerHTML='';clone=sheet.cloneNode(true);clone.removeAttribute('id');clone.style.cssText='';clone.style.setProperty('--fh',fh+'px');clone.style.setProperty('--g',gap+'px');clone.style.padding=pad+'px';clone.className='sheet'+(sheet.classList.contains('only')?' only':'');lin.appendChild(clone);
  lin.style.transform='scale('+M+')';
  pn();sheet.classList.add('drag');clamp();void sheet.offsetWidth;sheet.classList.remove('drag');
}
function clamp(){var r={w:sheet.offsetWidth,h:sheet.offsetHeight},W=innerWidth,H=innerHeight,top=50;
  var minx=Math.min(0,W-r.w),miny=Math.min(top,H-r.h);
  if(r.w<=W)tx=(W-r.w)/2;else tx=Math.max(minx,Math.min(0,tx));
  if(r.h<=H-top)ty=top+(H-top-r.h)/2;else ty=Math.max(miny,Math.min(top,ty));
  sheet.style.transform='translate('+tx+'px,'+ty+'px)';paintLoupe()}
/* ---------- the loupe ---------- */
var L={x:0,y:0,tx:0,ty:0},lr=0;
function placeLoupe(x,y,now){x=Math.max(24,Math.min(innerWidth-24,x));y=Math.max(70,Math.min(innerHeight-24,y));L.tx=x;L.ty=y;if(now){L.x=x;L.y=y}if(!lr)lr=requestAnimationFrame(stepL)}
function stepL(){lr=0;L.x+=(L.tx-L.x)*.22;L.y+=(L.ty-L.y)*.22;if(Math.abs(L.tx-L.x)+Math.abs(L.ty-L.y)>.3)lr=requestAnimationFrame(stepL);else{L.x=L.tx;L.y=L.ty}paintLoupe()}
var underI=-1;
function paintLoupe(){loupe.style.transform='translate('+L.x+'px,'+L.y+'px)';var R=loupe.offsetWidth/2;
  var px=L.x-tx,py=L.y-ty;lin.style.transform='translate('+(R-px*M)+'px,'+(R-py*M)+'px) scale('+M+')';
  var f=frameAt(L.x,L.y);underI=f?+f.dataset.i:-1;mkB.classList.toggle('on',underI>=0&&LAB.hearts.has(P[underI].id));
  mkB.setAttribute('aria-label',underI>=0?'mark frame '+LAB.num(P[underI]):'mark the frame under the loupe')}
function frameAt(x,y){var els=document.elementsFromPoint(x,y);for(var k=0;k<els.length;k++){if(els[k].closest&&els[k].closest('.loupe'))continue;var f=els[k].closest&&els[k].closest('#sheet .fr');if(f)return f}return null}
function setMark(i){var p=P[i],on=LAB.hearts.toggle(p.id);document.querySelectorAll('.fr[data-i="'+i+'"]').forEach(function(f){f.classList.toggle('mk',on)});pn();paintLoupe();
  LAB.hint(on?'marked '+LAB.num(p)+' in grease pencil':'mark wiped off '+LAB.num(p),2200);if(LAB.layer.top()==='lifted')showLift()}
function pn(){$('pn').textContent=LAB.hearts.list().length}
mkB.addEventListener('click',function(e){e.stopPropagation();if(underI<0){LAB.hint('slide the loupe over a frame first',2200);return}setMark(underI)});
var ldr=null;
loupe.addEventListener('pointerdown',function(e){if(e.target===mkB)return;ldr={x:e.clientX,y:e.clientY,lx:L.tx,ly:L.ty,m:false};loupe.setPointerCapture(e.pointerId);e.stopPropagation()});
loupe.addEventListener('pointermove',function(e){if(!ldr)return;var dx=e.clientX-ldr.x,dy=e.clientY-ldr.y;if(Math.hypot(dx,dy)>6)ldr.m=true;placeLoupe(ldr.lx+dx,ldr.ly+dy,true);edgePan()});
loupe.addEventListener('pointerup',function(){if(ldr&&!ldr.m&&underI>=0)openLift(underI);ldr=null});
loupe.addEventListener('pointercancel',function(){ldr=null});
/* loupe at an edge nudges the table, slowly */
function edgePan(){var m=60,W=innerWidth,H=innerHeight,dx=0,dy=0;if(L.x<m)dx=8;if(L.x>W-m)dx=-8;if(L.y<m+50)dy=8;if(L.y>H-m)dy=-8;if(dx||dy){tx+=dx;ty+=dy;sheet.classList.add('drag');clamp();sheet.classList.remove('drag')}}
/* ---------- the table: drag to move, tap a frame to lift it; mouse moves the loupe ---------- */
var td=null;
table.addEventListener('pointerdown',function(e){td={x:e.clientX,y:e.clientY,tx:tx,ty:ty,m:false};table.setPointerCapture(e.pointerId)});
table.addEventListener('pointermove',function(e){
  if(e.pointerType==='mouse'&&!td)placeLoupe(e.clientX,e.clientY);
  if(!td)return;var dx=e.clientX-td.x,dy=e.clientY-td.y;if(Math.hypot(dx,dy)>6){td.m=true;table.classList.add('drag');sheet.classList.add('drag')}
  if(td.m){tx=td.tx+dx;ty=td.ty+dy;clamp();if(e.pointerType==='mouse')placeLoupe(e.clientX,e.clientY,true)}});
table.addEventListener('pointerup',function(e){table.classList.remove('drag');sheet.classList.remove('drag');
  if(td&&!td.m){var f=frameAt(e.clientX,e.clientY);if(f){if(e.pointerType!=='mouse')placeLoupe(e.clientX,e.clientY);openLift(+f.dataset.i)}else if(e.pointerType!=='mouse'){placeLoupe(e.clientX,e.clientY)}}td=null});
table.addEventListener('pointercancel',function(){td=null;table.classList.remove('drag');sheet.classList.remove('drag')});
table.addEventListener('wheel',function(e){if(e.ctrlKey)return;e.preventDefault();tx-=e.deltaX;ty-=e.deltaY;sheet.classList.add('drag');clamp();clearTimeout(table._t);table._t=setTimeout(function(){sheet.classList.remove('drag')},120)},{passive:false});
var tablePinch={in:function(x,y){var f=frameAt(x,y);if(f)openLift(+f.dataset.i);else if(underI>=0)openLift(underI)},out:function(){LAB.leave('../')}};
LAB.pinch(table,tablePinch);LAB.pinch(loupe,tablePinch);
/* ---------- lifted: one frame off the table ---------- */
var li=-1;
function frEl(i){return sheet.querySelector('.fr[data-i="'+i+'"]')}
function showLift(){var p=P[li];limg.src=LAB.img(p);limg.alt='frame '+LAB.num(p);lcap.textContent=p.n+' ▸ '+p.n+'A';
  var on=LAB.hearts.has(p.id),pen=lf.querySelector('.pen');if(on&&!pen){pen=LAB.el('span','pen','✓');lf.appendChild(pen)}else if(!on&&pen)pen.remove();
  $('lmark').classList.toggle('on',on);$('lmark').textContent=on?'✎ marked':'✎ mark';
  document.querySelectorAll('#sheet .fr.here').forEach(function(f){f.classList.remove('here')});var f=frEl(li);if(f)f.classList.add('here')}
function flipFrom(el,dur){var a=el.getBoundingClientRect(),b=lf.getBoundingClientRect();if(!b.width)return;
  lf.style.transition='none';lf.style.transform='translate('+(a.left-b.left)+'px,'+(a.top-b.top)+'px) scale('+(a.width/b.width)+','+(a.height/b.height)+')';void lf.offsetWidth;
  lf.style.transition='transform '+(dur||1000)+'ms cubic-bezier(.22,.61,.36,1)';lf.style.transform='none'}
function openLift(i){if(LAB.layer.top()==='lifted'){li=i;showLift();return}li=i;showLift();lift.hidden=false;document.body.classList.add('lifted');where.textContent='light table · one frame';
  var go=function(){flipFrom(frEl(i),1000);requestAnimationFrame(function(){lift.classList.add('open')})};
  if(limg.complete&&limg.naturalWidth)go();else{limg.onload=function(){limg.onload=null;go()}}
  LAB.layer.push('lifted',closeLift);LAB.hint('swipe for the next frame · ✎ to mark it · pinch in for the camera back · pinch out to lay it back down',4600)}
function closeLift(){var el=frEl(li),a=el&&el.getBoundingClientRect(),b=lf.getBoundingClientRect();lift.classList.remove('open');where.textContent='light table';
  if(a&&b.width){lf.style.transition='transform 900ms cubic-bezier(.22,.61,.36,1)';lf.style.transform='translate('+(a.left-b.left)+'px,'+(a.top-b.top)+'px) scale('+(a.width/b.width)+','+(a.height/b.height)+')'}
  document.body.classList.remove('lifted');setTimeout(function(){if(LAB.layer.top()!=='lifted'){lift.hidden=true;lf.style.transform='';lf.style.transition=''}},900);
  if(el){placeLoupe(a.left+a.width/2,a.top+a.height/2)}}
function stepLift(d){li=Math.max(0,Math.min(P.length-1,li+d));showLift();var f=frEl(li);if(f){var r=f.getBoundingClientRect();if(r.left<0||r.right>innerWidth||r.top<50||r.bottom>innerHeight){tx-=r.left+r.width/2-innerWidth/2;ty-=r.top+r.height/2-innerHeight/2;clamp()}}}
$('lprev').addEventListener('click',function(){stepLift(-1)});$('lnext').addEventListener('click',function(){stepLift(1)});
$('lmark').addEventListener('click',function(){setMark(li)});
var ls=null;
lift.addEventListener('pointerdown',function(e){if(e.target.closest('button'))return;ls={x:e.clientX,y:e.clientY}});
lift.addEventListener('pointerup',function(e){if(!ls)return;var dx=e.clientX-ls.x,dy=e.clientY-ls.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))stepLift(dx<0?1:-1);else if(Math.hypot(dx,dy)<8&&!e.target.closest('.lf'))LAB.layer.back();ls=null});
LAB.pinch(lift,{in:function(){camera()},out:function(){LAB.layer.back()}});
/* ---------- camera back ---------- */
function camera(){if(LAB.layer.top()==='camera back')return;var start=LAB.layer.top()==='lifted'?li:(underI>=0?underI:0);
  LAB.cameraBack(P,start,{onMove:function(i){if(LAB.layer.depth()>1){li=i;showLift()}}})}
$('cam').addEventListener('click',camera);
/* ---------- picks: only the marked frames stay lit ---------- */
$('picks').addEventListener('click',function(){var on=!sheet.classList.contains('only');if(on&&!LAB.hearts.list().length){LAB.hint('no picks yet: slide the loupe over a frame and tap ✎',2600);return}
  sheet.classList.toggle('only',on);clone.classList.toggle('only',on);this.classList.toggle('on',on);this.setAttribute('aria-pressed',on)});
document.addEventListener('lab:hearts',function(){pn();clone.querySelectorAll('.fr').forEach(function(f){f.classList.toggle('mk',LAB.hearts.has(P[+f.dataset.i].id))});sheet.querySelectorAll('.fr').forEach(function(f){f.classList.toggle('mk',LAB.hearts.has(P[+f.dataset.i].id))})});
/* ---------- keys ---------- */
document.addEventListener('keydown',function(e){var top=LAB.layer.top();if(top==='camera back')return;
  if(top==='lifted'){if(e.key==='ArrowRight')stepLift(1);else if(e.key==='ArrowLeft')stepLift(-1);else if(e.key==='m'||e.key==='M')setMark(li);else if(e.key==='+'||e.key==='=')camera();else if(e.key==='Escape')LAB.layer.back();return}
  var s=fh*.8+gap;if(e.key==='ArrowRight')placeLoupe(L.tx+s,L.ty);else if(e.key==='ArrowLeft')placeLoupe(L.tx-s,L.ty);else if(e.key==='ArrowDown')placeLoupe(L.tx,L.ty+fh*1.7);else if(e.key==='ArrowUp')placeLoupe(L.tx,L.ty-fh*1.7);
  else if(e.key==='Enter'&&underI>=0)openLift(underI);else if((e.key==='m'||e.key==='M')&&underI>=0)setMark(underI);else if(e.key==='Escape')LAB.layer.back();else return;e.preventDefault()});
$('back').addEventListener('click',function(){LAB.layer.back()});
var rt=0;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){build()},150)});
build();
loupe.style.setProperty('--ls',(innerWidth<520?132:170)+'px');
var f0=frEl(PER+2)||frEl(0),r0=f0.getBoundingClientRect();placeLoupe(r0.left+r0.width/2,r0.top+r0.height/2,true);
LAB.hint(matchMedia('(hover:hover)').matches?'move across the frames with the loupe · ✎ marks a pick · click a frame to lift it':'drag the loupe across the frames · ✎ marks a pick · tap a frame to lift it',5200);
})();
