/* Darkroom · tap the paper box (an enlarger flash, a sheet slides into the tray) → rock the tray until the print comes up →
   drag it up or tap hang → it pegs onto the line. Tap a print on the line → stand in front of it (the wall). Pinch in → camera back.
   The light switch turns the room from safelight red to white light (prints show their colour). Hung prints stay on this device.
   Same motion with Reduce Motion on. */
(function(){
'use strict';
var P=LAB.photos,$=function(id){return document.getElementById(id)};
var room=$('room'),pegs=$('pegs'),line=$('line'),tray=$('tray'),sheet=$('sheet'),simg=$('simg'),shine=$('shine'),box=$('box'),hang=$('hang'),
    wall=$('wall'),wimg=$('wimg'),wcap=$('wcap'),where=$('where'),lightB=$('light');
var LK='gj-photo-lab-line',hung=[];
try{hung=(JSON.parse(localStorage.getItem(LK))||[]).filter(function(id){return P.some(function(p){return p.id===id})})}catch(e){}
function save(){try{localStorage.setItem(LK,JSON.stringify(hung))}catch(e){}}
function byId(id){for(var i=0;i<P.length;i++)if(P[i].id===id)return P[i]}
function nextP(){for(var i=0;i<P.length;i++)if(hung.indexOf(P[i].id)<0&&(!cur||cur.id!==P[i].id))return P[i];return null}
var cur=null,dev=0,done=false,light=false;
/* ---------- the line ---------- */
var off=0;
function peg(p,isNew){var b=LAB.el('button','pr'+(isNew?' new':''));b.type='button';b.dataset.id=p.id;b.setAttribute('aria-label','print '+LAB.num(p));
  b.innerHTML='<span class="pp"><img alt="" src="'+LAB.th(p)+'"></span><span class="no">'+LAB.num(p)+'</span>'+(LAB.hearts.has(p.id)?'<span class="hn">♥</span>':'');
  b.style.animationDelay=(-Math.random()*7).toFixed(2)+'s';return b}
function drawLine(){pegs.innerHTML='';hung.forEach(function(id){pegs.appendChild(peg(byId(id)))});$('empty').hidden=hung.length>0;$('left').textContent=P.length-hung.length-(cur?1:0);clampOff()}
function maxOff(){return Math.max(0,pegs.scrollWidth-line.clientWidth)}
function clampOff(){off=Math.max(0,Math.min(maxOff(),off));pegs.style.transform='translateX('+(-off)+'px)'}
var ld=null;
line.addEventListener('pointerdown',function(e){ld={x:e.clientX,o:off,m:false,t:e.target};line.setPointerCapture(e.pointerId);pegs.classList.add('drag')});
line.addEventListener('pointermove',function(e){if(!ld)return;var dx=e.clientX-ld.x;if(Math.abs(dx)>6)ld.m=true;off=ld.o-dx;clampOff()});
line.addEventListener('pointerup',function(e){pegs.classList.remove('drag');if(ld&&!ld.m){var el=document.elementFromPoint(e.clientX,e.clientY),b=el&&el.closest('.pr');if(b)openWall(b.dataset.id)}ld=null});
line.addEventListener('pointercancel',function(){pegs.classList.remove('drag');ld=null});
line.addEventListener('wheel',function(e){if(e.ctrlKey)return;e.preventDefault();off+=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY);pegs.classList.add('drag');clampOff();clearTimeout(line._t);line._t=setTimeout(function(){pegs.classList.remove('drag')},120)},{passive:false});
/* ---------- the tray ---------- */
function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
function paint(){var e=ease(Math.min(1,dev)),b=1+2.6*Math.pow(1-e,1.6),c=.3+.76*e;simg.style.filter='grayscale(1) brightness('+b.toFixed(3)+') contrast('+c.toFixed(3)+')'}
function fitSheet(){if(!cur)return;var w=tray.clientWidth-18-12-24,h=tray.clientHeight-18-12-24,a=cur.w/cur.h,iw=w,ih=w/a;if(ih>h){ih=h;iw=h*a}simg.style.width=Math.round(iw)+'px';simg.style.height=Math.round(ih)+'px'}
function feed(){if(light){LAB.hint('lights on: the paper box stays shut. switch the light off first.');return}
  if(cur){LAB.hint(done?'this print is ready: drag it up to the line, or tap hang':'rock the tray: drag back and forth across it');return}
  var p=nextP();if(!p){LAB.hint('every sheet is on the line');return}
  cur=p;dev=0;done=false;var bm=$('beam');bm.classList.remove('on');void bm.offsetWidth;bm.classList.add('on');
  setTimeout(function(){simg.src=LAB.img(p);simg.alt='print '+LAB.num(p)+', developing';fitSheet();paint();sheet.hidden=false;sheet.style.transform='';sheet.classList.remove('in');void sheet.offsetWidth;sheet.classList.add('in');
    box.classList.remove('ready');$('left').textContent=P.length-hung.length-1;LAB.hint('rock the tray: drag back and forth across it until the print comes up',5200)},420)}
box.addEventListener('click',feed);
var td=null,raf=0,last=0;
function tick(t){raf=0;var dt=Math.min(.05,(t-(last||t))/1000);last=t;if(td&&td.down&&cur&&!done){grow(dt*.05)}if(td&&td.down)raf=requestAnimationFrame(tick)}
function grow(x){if(!cur||done)return;dev=Math.min(1,dev+x);paint();if(dev>=1){done=true;hang.hidden=false;LAB.hint('it\'s up. drag it to the line, or tap hang',5200)}}
tray.addEventListener('pointerdown',function(e){if(!cur){feed();return}td={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,down:true,up:0};tray.setPointerCapture(e.pointerId);last=0;if(!raf)raf=requestAnimationFrame(tick)});
tray.addEventListener('pointermove',function(e){var r=tray.getBoundingClientRect();tray.style.setProperty('--sx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');tray.style.setProperty('--sy',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
  if(!td||!td.down)return;var dx=e.clientX-td.lx,dy=e.clientY-td.ly;td.lx=e.clientX;td.ly=e.clientY;
  if(done){td.up=e.clientY-td.y;sheet.style.transform='translate(-50%,calc(-50% + '+Math.min(0,td.up)+'px)) rotate(-1deg)';return}
  var k=Math.hypot(dx,dy);grow(k/1500);
  tray.style.setProperty('--tilt',Math.max(-3,Math.min(3,(e.clientX-td.x)/40)).toFixed(2)+'deg');tray.style.setProperty('--wave',(50+(e.clientX-td.x)/4)+'%')});
function trayUp(){if(!td)return;td.down=false;tray.style.setProperty('--tilt','0deg');if(done){if(td.up<-60)hangIt();else sheet.style.transform=''}td=null}
tray.addEventListener('pointerup',trayUp);tray.addEventListener('pointercancel',trayUp);
document.addEventListener('keydown',function(e){if(LAB.layer.depth())return;if(e.key===' '){e.preventDefault();if(!cur)feed();else if(!done){grow(.12);var s=(Math.random()<.5?-1:1)*2.4;tray.style.setProperty('--tilt',s+'deg');setTimeout(function(){tray.style.setProperty('--tilt','0deg')},300)}else hangIt()}
  else if(e.key==='Escape'){LAB.layer.back()}});
hang.addEventListener('click',hangIt);
function hangIt(){if(!cur||!done)return;var p=cur,from=sheet.getBoundingClientRect();
  hung.push(p.id);save();cur=null;done=false;hang.hidden=true;sheet.hidden=true;drawLine();off=maxOff();clampOff();
  var b=pegs.lastElementChild;b.style.visibility='hidden';
  var fly=LAB.el('div','pr-fly');fly.innerHTML='<img alt="" src="'+LAB.th(p)+'">';
  Object.assign(fly.style,{position:'fixed',zIndex:44,left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',background:'#e4ddd2',padding:'5px',boxShadow:'0 20px 40px rgba(0,0,0,.6)',transition:'all 1.2s cubic-bezier(.22,.61,.36,1)'});
  fly.firstChild.style.cssText='width:100%;height:100%;object-fit:contain;display:block;filter:'+(light?'none':'grayscale(1)');
  document.body.appendChild(fly);
  requestAnimationFrame(function(){requestAnimationFrame(function(){var to=b.querySelector('.pp').getBoundingClientRect();Object.assign(fly.style,{left:to.left+'px',top:to.top+'px',width:to.width+'px',height:to.height+'px'})})});
  setTimeout(function(){b.style.visibility='';fly.remove();box.classList.toggle('ready',!!nextP())},1250);
  LAB.hint(hung.length===1?'pegged. tap it on the line to stand in front of it':'pegged · '+hung.length+' on the line',3600)}
/* ---------- the wall (one print) ---------- */
var wi=-1;
function showW(){var p=byId(hung[wi]);wimg.src=LAB.img(p);wimg.alt='print '+LAB.num(p);wcap.textContent=LAB.num(p)+' · '+(wi+1)+' of '+hung.length+' on the line';
  $('wheart').textContent=LAB.hearts.has(p.id)?'♥':'♡';$('wheart').classList.toggle('on',LAB.hearts.has(p.id))}
function openWall(id){wi=hung.indexOf(id);if(wi<0)return;showW();wall.hidden=false;void wall.offsetWidth;wall.classList.add('open');where.textContent='darkroom · the wall';
  LAB.layer.push('wall',function(){wall.classList.remove('open');where.textContent='darkroom';setTimeout(function(){if(!wall.classList.contains('open'))wall.hidden=true},1000);var b=pegs.children[wi];if(b){off=Math.max(0,b.offsetLeft-line.clientWidth/2+b.offsetWidth/2);clampOff()}});
  LAB.hint('swipe for the next print · pinch in for the camera back · pinch out to step back',4200)}
function stepW(d){if(!hung.length)return;wi=(wi+d+hung.length)%hung.length;showW()}
$('wprev').addEventListener('click',function(){stepW(-1)});$('wnext').addEventListener('click',function(){stepW(1)});
$('wheart').addEventListener('click',function(){LAB.hearts.toggle(hung[wi]);showW();drawLine()});
var ws=null;
wall.addEventListener('pointerdown',function(e){if(e.target.closest('button'))return;ws={x:e.clientX,y:e.clientY}});
wall.addEventListener('pointerup',function(e){if(!ws)return;var dx=e.clientX-ws.x;if(Math.abs(dx)>50)stepW(dx<0?1:-1);ws=null});
document.addEventListener('keydown',function(e){if(LAB.layer.top()!=='wall')return;if(e.key==='ArrowRight')stepW(1);else if(e.key==='ArrowLeft')stepW(-1);else if(e.key==='Escape')LAB.layer.back();else if(e.key==='+'||e.key==='=')camera()});
/* pinch: room out → landing; wall in → camera back, out → room */
LAB.pinch(room,{out:function(){LAB.leave('../')}});
LAB.pinch(wall,{in:function(){camera()},out:function(){LAB.layer.back()}});
/* ---------- camera back: the line's prints when you stand at one; otherwise every photograph ---------- */
function camera(){var top=LAB.layer.top();if(top==='camera back')return;
  if(top==='wall'){var list=hung.map(byId);LAB.cameraBack(list,wi,{onMove:function(i){wi=i;showW()}})}
  else LAB.cameraBack(P,cur?P.indexOf(cur):0)}
$('cam').addEventListener('click',camera);
/* ---------- the light switch ---------- */
function setLight(on){light=on;document.body.classList.toggle('light-on',on);lightB.classList.toggle('on',on);lightB.setAttribute('aria-pressed',on);lightB.textContent=on?'light on':'light';
  box.disabled=on;document.querySelector('meta[name=theme-color]').content=on?'#262321':'#120202'}
lightB.addEventListener('click',function(){setLight(!light);LAB.hint(light?'white light: the prints in their own colour':'safelight: back to red',2600)});
$('back').addEventListener('click',function(){LAB.layer.back()});
document.addEventListener('lab:hearts',function(){drawLine()});
addEventListener('resize',function(){fitSheet();clampOff()});
drawLine();box.classList.toggle('ready',!!nextP());
LAB.hint(hung.length?'welcome back: your prints are still on the line. tap the paper box for the next sheet':'tap the paper box, then rock the tray',5200);
})();
