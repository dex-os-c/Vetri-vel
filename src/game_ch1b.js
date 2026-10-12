/* =====================================================================================
   PART 5 — THE GATEKEEPER : garrison courtyard + combat tutorial (attack · dodge · block/parry · counter)
   ===================================================================================== */
const OUTRO=[
 {who:'Commander',text:'This man belonged to the missing garrison.'},
 {who:'Young Soldier',text:'Then who were we fighting?'}
];
const OUTRO2=[
 {who:'Veteran',text:'Commander\u2026 whatever happened here, it has not finished.'},
 {who:'Commander',text:'Secure the courtyard. Nobody enters that temple until I know what lies beneath it.'}
];
const CHAPTER={n:'CHAPTER 1',title:'THE SILENT FRONTIER',sub:'The garrison has fallen. The dead have not stayed dead.'};
const YDOOR={x:808};let cb={},ydg=0;
const TINT={};
function tinted(name){if(TINT[name])return TINT[name];const im=IMG[name],c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');
  x.drawImage(im,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(42,58,92,0.55)';x.fillRect(0,0,c.width,c.height);x.fillStyle='rgba(20,10,10,0.18)';x.fillRect(0,0,c.width,c.height);TINT[name]=c;return c}
function eBlit(name,f,x,y,face,scale,alpha){
  const a=ANIMS[name],m=M[a.sheet];f=clamp(f|0,0,m.n-1);
  ctx.save();ctx.globalAlpha=alpha==null?1:alpha;ctx.translate(x,y);ctx.scale(face*scale,scale);
  ctx.drawImage(tinted(a.sheet),(f%m.cols)*m.CW,Math.floor(f/m.cols)*m.CH,m.CW,m.CH,-m.AX,-m.AY,m.CW,m.CH);ctx.restore();
}
function beginYard(){
  scn='yard';ph='fight';T=0;mode='scene';p.x=400;p.y=GROUND;p.vy=0;p.face=1;p.lock=false;p.weary=false;p.talk=false;p.hurt=-1;p.dead=-1;p.atk=false;p.jp=null;set('idle');
  camX=0;zoom=zoomT=1;zf={x:W/2,y:GROUND-110};fade=1;fadeT=0;barsT=0;bars=0;fx=[];dl.active=false;ydg=0.18;seed=21;
  party=makeParty();[95,150,205,255,305].forEach((x,i)=>{party[i].x=x-30;party[i].mv=false;party[i].face=1;party[i].ph=[.2,.5,.8,.35,.1][i]});
  party[0].x=40;party[1].x=88;party[2].x=136;party[3].x=184;party[4].x=232;
  cb={hp:5,max:5,ps:'free',pt:0,guard:false,gt:0,cd:0,hitDone:false,vx:0,hs:0,slow:0,shake:0,
    e:{x:640,hp:12,max:12,st:'enter',t:0,kind:null,qi:0,vuln:0,face:-1,ph:0,flash:0,dead:false,fallT:0,did:false,twitch:0,
       queue:['light','light','heavy','light','heavy','light','light','heavy','light','heavy'],behind:true},
    hint:{text:'',t:0},seen:{atk:false,light:false,heavy:false,counter:false,dodged:false,parried:false},floats:[],out:null,hits:0};
  setHint('ATTACK  \u2014  tap  J  /  \u2694',99);sync();
}
function setHint(t,d){cb.hint.text=t;cb.hint.t=d||4}
function float(x,y,t,c){cb.floats.push({x,y,t,c:c||'#ffe2a0',life:0})}
function enemyDamage(n,counter){const e=cb.e;if(e.dead)return;e.hp-=n;e.flash=.18;e.x+=-e.face*5;cb.hits++;sfx.hit();
  float(e.x,GROUND-190,counter?'COUNTER!':'-'+n,counter?'#ff9a4a':'#ffe2a0');
  if(counter&&!cb.seen.counter){cb.seen.counter=true}
  if(!cb.seen.atk){cb.seen.atk=true}
  if(e.hp<=0){e.hp=0;e.dead=true;e.st='dead';e.fallT=0;cb.out={ph:'fall',t:0};p.lock=true;cb.guard=false;cb.ps='free';p.moving=false;sfx.thud();cb.slow=.6}}
function playerHurt(n,knock){if(cb.ps==='dodge')return;cb.hp=Math.max(1,cb.hp-n);cb.ps='hurt';cb.pt=0;cb.vx=knock;cb.shake=.25;sfx.hit();float(p.x,GROUND-170,'-'+n,'#ff6a5a')}
const ESPEC={light:{rate:44,sf:9,reach:150,lunge:70,wind:6,vuln:0.95},heavy:{rate:22,sf:11,reach:205,lunge:130,wind:9,vuln:1.35}};
function yardInput(){const k=keys;return{l:k.KeyA||k.ArrowLeft,r:k.KeyD||k.ArrowRight,atk:k.KeyJ||k.KeyX,blk:k.KeyK,dge:k.KeyL||k.ShiftLeft}}
let prevIn={atk:false,dge:false};
function updateYard(dt){
  const real=dt;if(cb.hs>0){cb.hs-=real;T+=0;return}
  if(cb.slow>0){cb.slow-=real;dt*=0.3}
  const e=cb.e,I=yardInput();ydg=Math.min(1,ydg);
  cb.shake=Math.max(0,cb.shake-real);cb.cd=Math.max(0,cb.cd-dt);
  cb.floats.forEach(f=>f.life+=real);cb.floats=cb.floats.filter(f=>f.life<1.1);
  if(cb.hint.t>0)cb.hint.t-=real;e.flash=Math.max(0,e.flash-dt);
  // ------------- player -------------
  if(!p.lock&&!e.dead){
    const dir=(I.r?1:0)-(I.l?1:0);
    if(cb.ps==='free'){
      cb.guard=!!I.blk;cb.gt=cb.guard?cb.gt+dt:0;
      if(I.atk&&!prevIn.atk&&!cb.guard){cb.ps='atk';cb.pt=0;cb.hitDone=false;sfx.swing(false);if(cb.seen.atk&&cb.hint.t>90)setHint('',0)}
      else if(I.dge&&!prevIn.dge&&cb.cd<=0){cb.ps='dodge';cb.pt=0;cb.vx=(p.x<e.x?-1:1)*560;cb.cd=.7;cb.guard=false;sfx.dodge()}
      else{const sp=cb.guard?55:150;p.x+=dir*sp*dt;p.moving=!!dir;if(dir&&!cb.guard)p.ph+=Math.abs(dir)*sp*dt/ANIMS.walk.stride;
        if(p.moving&&Math.floor(p.ph*2)!==p._pf&&!cb.guard){p._pf=Math.floor(p.ph*2);puff(p.x-p.face*14,GROUND,p.face)}}
    }else if(cb.ps==='atk'){cb.pt+=dt;const f=Math.floor(cb.pt*46);
      if(f>=3&&f<10)p.x+=p.face*55*dt;
      if(!cb.hitDone&&f>=8){cb.hitDone=true;const d=Math.abs(e.x-p.x);
        if(d<205&&((e.x-p.x)*p.face>0)){const ctr=e.vuln>0;enemyDamage(ctr?3:1,ctr);if(ctr){cb.hs=.07}}}
      if(cb.pt>=M.attack.n/46)cb.ps='free'}
    else if(cb.ps==='dodge'){cb.pt+=dt;p.x+=cb.vx*dt;cb.vx*=Math.pow(.02,dt*2.6);if(cb.pt>=.42)cb.ps='free'}
    else if(cb.ps==='hurt'){cb.pt+=dt;p.x+=cb.vx*dt;cb.vx*=Math.pow(.01,dt*2);if(cb.pt>=.42)cb.ps='free'}
  }
  prevIn={atk:!!I.atk,dge:!!I.dge};
  p.x=clamp(p.x,70,800);p.t+=dt;
  if(cb.ps!=='dodge'&&!p.lock)p.face=e.x>p.x?1:-1;
  // ------------- enemy -------------
  e.t+=dt;const dist=Math.abs(e.x-p.x);if(!e.dead&&e.st!=='stun'&&e.st!=='swing')e.face=p.x<e.x?-1:1;
  if(e.vuln>0)e.vuln-=dt;
  if(e.st==='enter'){e.x-=62*dt;e.ph+=62*dt/ANIMS.walk.stride;if(e.x<560){e.behind=false}if(e.t>1.6){e.st='walk';e.t=0}}
  else if(e.st==='walk'){const d=Math.sign(p.x-e.x);e.x+=d*72*dt;e.ph+=72*dt/ANIMS.walk.stride;if(dist<175){e.st='idle';e.t=0}}
  else if(e.st==='idle'){if(dist>230){e.st='walk';e.t=0}else if(e.t>(e.qi===0?0.9:0.55)){e.kind=e.queue[e.qi%e.queue.length];e.qi++;e.st='swing';e.t=0;e.did=false;e.hit=false}}
  else if(e.st==='swing'){const sp=ESPEC[e.kind],f=e.t*sp.rate;
    if(f<sp.wind&&e.t<0.02){if(e.kind==='heavy'){if(!cb.seen.heavy){cb.seen.heavy=true;setHint('HEAVY SWING!  DODGE  \u2014  L  /  \u00BB',3.2)}}else if(!cb.seen.light){cb.seen.light=true;setHint('HE SWINGS!  BLOCK  \u2014  hold  K  (tap it just before the hit to PARRY)',3.8)}
      if(e.kind==='heavy')sfx.swing(true)}
    if(f>3&&f<sp.sf)e.x+=e.face*sp.lunge*dt*(sp.rate/32);
    if(!e.did&&f>=sp.sf){e.did=true;sfx.swing(e.kind==='heavy');
      const d=Math.abs(e.x-p.x),front=((p.x-e.x)*e.face>0);
      if(d<sp.reach&&front){
        if(cb.ps==='dodge'){cb.seen.dodged=true;e.vuln=sp.vuln;if(e.kind==='heavy'||true){setHint('PERFECT!  COUNTERATTACK  \u2014  J',2.6)}float(p.x,GROUND-200,'DODGE','#9fe0ff')}
        else if(cb.guard&&e.kind==='light'){
          if(cb.gt<=0.24){sfx.parry();e.st='stun';e.t=0;e.vuln=1.7;cb.hs=.09;cb.slow=.35;cb.seen.parried=true;float(p.x+p.face*40,GROUND-190,'PARRY!','#fff3b0');setHint('PARRIED!  He is open  \u2014  COUNTERATTACK  J',2.8);sparks(p.x+p.face*60,GROUND-110)}
          else{sfx.clash();p.x-=p.face*38;e.vuln=.45;sparks(p.x+p.face*60,GROUND-110);float(p.x,GROUND-190,'BLOCK','#cfe6ff')}}
        else{const heavy=e.kind==='heavy';playerHurt(heavy?2:1,-p.face*(heavy?380:240));e.hit=true;e.vuln=.3}
      }else{e.vuln=sp.vuln}}
    if(f>=M.attack.n-1&&e.st==='swing'){e.st='recover';e.t=0}}
  else if(e.st==='recover'){if(e.t>0.5){e.st='idle';e.t=0}}
  else if(e.st==='stun'){e.vuln=Math.max(e.vuln,.2);if(e.t>1.6){e.st='idle';e.t=0}}
  else if(e.st==='dead'){e.fallT+=real}
  e.x=clamp(e.x,90,860);
  // companions idle, the temple door breathes
  party.forEach(s=>{s.mv=false});
  if(e.dead)updateOutro(real);
  if(!e.dead&&e.st==='idle'&&e.qi===0&&e.t>0.3&&!cb.seen.atk&&cb.hint.t<=0)setHint('ATTACK  \u2014  tap  J  /  \u2694',99);
  zoomT=1;
}
function sparks(x,y){for(let i=0;i<14;i++)fx.push({k:'spark',x:x+camX,y,vx:(rnd()-.5)*320,vy:-120-rnd()*220,r:1.6+rnd()*1.6,life:0,max:.35+rnd()*.25})}
function updateOutro(dt){
  const o=cb.out,e=cb.e;if(!o)return;o.t+=dt;ydg=Math.min(1,ydg);
  if(o.ph==='fall'){if(o.t>2.4){o.ph='approach';o.t=0;p.lock=true}}
  else if(o.ph==='approach'){const tx=e.x-135;p.face=1;if(p.x<tx-4){p.x+=105*dt;set('walk');p.ph+=105*dt/ANIMS.walk.stride;p.moving=true;if(Math.floor(p.ph*2)!==p._pf){p._pf=Math.floor(p.ph*2);puff(p.x-14,GROUND,1)}}
    else{p.moving=false;set('idle');o.ph='say1';o.t=0;barsT=1;say(OUTRO,()=>{o.ph='twitch';o.t=0;sfx.thud()})}}
  else if(o.ph==='say1'){zoomT=1.45;zf.x+=((e.x-camX)-zf.x)*Math.min(1,3*dt);zf.y+=((GROUND-60)-zf.y)*Math.min(1,3*dt)}
  else if(o.ph==='twitch'){zoomT=1.45;e.twitch=1;if(o.t>1.3){o.ph='still';o.t=0;e.twitch=0}
    if(o.t>0.5)p.x=Math.max(p.x-70*dt,e.x-210)}
  else if(o.ph==='still'){zoomT=1.3;if(o.t>1.4){o.ph='breath';o.t=0;sfx.rumble(true,.4);cb.shake=.5}}
  else if(o.ph==='breath'){zoomT=1.1;ydg=Math.min(1,.2+o.t*.26);cb.shake=Math.max(cb.shake,.12);sfx.rumble(true,.4+ydg*.6);
    if(o.t>3.2&&!o.said){o.said=true;say(OUTRO2,()=>{o.ph='fade';o.t=0})}}
  else if(o.ph==='fade'){fadeT=1;if(o.t>2.2){sfx.rumble(false);go('chap','card');fade=1;fadeT=1;barsT=0;dl.active=false;sync()}}
  if(['say1','twitch','still','breath'].includes(o.ph)&&o.ph!=='say1'){zf.x+=((e.x-camX-30)-zf.x)*Math.min(1,3*dt);zf.y+=((GROUND-100)-zf.y)*Math.min(1,3*dt)}
}
/* ---------------- drawing the courtyard ---------------- */
function drawPillarAt(x,w,top){const g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,'#2b2018');g.addColorStop(.4,'#6b5442');g.addColorStop(1,'#241812');ctx.fillStyle=g;ctx.fillRect(x-w/2,top,w,GROUND-top);
  ctx.fillStyle='#d4a443';ctx.fillRect(x-w/2-3,top+40,w+6,6);ctx.fillRect(x-w/2-3,GROUND-60,w+6,6);ctx.fillStyle='#3a2a20';ctx.fillRect(x-w/2-8,GROUND-22,w+16,22);ctx.fillRect(x-w/2-6,top,w+12,16)}
function drawYardBG(){
  const Tm=BGI.temple,tw=Tm.width,th=Tm.height;ctx.fillStyle='#4a2430';ctx.fillRect(0,0,W,H);ctx.drawImage(Tm,0,GROUND+8-th,tw,th);ctx.drawImage(Tm,tw-1,GROUND+8-th,tw,th);
  ctx.fillStyle='rgba(30,12,8,.5)';ctx.fillRect(0,0,W,GROUND);
  // courtyard wall + pillars
  const wg=ctx.createLinearGradient(0,GROUND-250,0,GROUND);wg.addColorStop(0,'#2c211b');wg.addColorStop(1,'#42342a');ctx.fillStyle=wg;ctx.fillRect(0,GROUND-250,W,250);
  ctx.fillStyle='#241a14';for(let i=0;i<W;i+=48)ctx.fillRect(i,GROUND-266,30,18);
  ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=2;for(let r=0;r<5;r++){ctx.beginPath();ctx.moveTo(0,GROUND-240+r*48);ctx.lineTo(W,GROUND-240+r*48);ctx.stroke()}
  for(const px of[40,330,600])drawPillarAt(px,60,GROUND-250);
  // torn Chola banners
  for(const bx of[190,465]){const sw=Math.sin(T*1.3+bx)*5;ctx.fillStyle='#6a1520';ctx.beginPath();ctx.moveTo(bx-30,GROUND-244);ctx.lineTo(bx+30,GROUND-244);ctx.lineTo(bx+34+sw,GROUND-110);ctx.lineTo(bx+16+sw,GROUND-132);ctx.lineTo(bx+4+sw,GROUND-96);ctx.lineTo(bx-14+sw,GROUND-126);ctx.lineTo(bx-32+sw,GROUND-84);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#d4a443';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#d4a443';ctx.beginPath();ctx.arc(bx,GROUND-196,12,0,7);ctx.fill()}
  // sealed temple door with glowing cracks
  const dx=YDOOR.x,dw=210,dh=260,top=GROUND-dh;
  const st=ctx.createLinearGradient(0,top-30,0,GROUND);st.addColorStop(0,'#3a2c24');st.addColorStop(1,'#241a14');ctx.fillStyle=st;ctx.fillRect(dx-dw/2-34,top-34,dw+68,dh+34);
  ctx.fillStyle='#d4a443';ctx.fillRect(dx-dw/2-34,top-34,dw+68,6);
  ctx.fillStyle='#0b0605';ctx.beginPath();ctx.moveTo(dx-dw/2,GROUND);ctx.lineTo(dx-dw/2,top+60);ctx.quadraticCurveTo(dx-dw/2,top,dx,top-4);ctx.quadraticCurveTo(dx+dw/2,top,dx+dw/2,top+60);ctx.lineTo(dx+dw/2,GROUND);ctx.fill();
  const shake=(scn==='yard'&&cb.out&&cb.out.ph==='breath')?Math.sin(T*55)*1.6*ydg:0;
  for(const side of[-1,1]){const x0=side<0?dx-dw/2+shake:dx+shake;const dg=ctx.createLinearGradient(x0,0,x0+dw/2,0);dg.addColorStop(0,'#3a2414');dg.addColorStop(1,'#26170c');ctx.fillStyle=dg;ctx.fillRect(x0,top+16,dw/2-2,dh-16);
    ctx.fillStyle='#1a1410';for(let r=0;r<4;r++)ctx.fillRect(x0,top+54+r*52,dw/2-2,9)}
  ctx.fillStyle='#2a2018';ctx.fillRect(dx-dw/2-6,top+110,dw+12,16);ctx.fillStyle='#d4a443';ctx.fillRect(dx-dw/2-6,top+110,dw+12,3);          // the great bar
  const pulse=.75+.25*Math.sin(T*2.2);ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,100,26,'+(.5+.3*ydg)*pulse+')';ctx.lineWidth=2+2*ydg;ctx.lineCap='round';
  const cracks=[[[dx,top+20],[dx-4,top+70],[dx+6,top+120],[dx-3,top+170],[dx,GROUND-6]],[[dx-40,top+60],[dx-52,top+110],[dx-44,top+150]],[[dx+30,top+90],[dx+46,top+140],[dx+38,top+190]],[[dx-80,top+130],[dx-60,top+176]],[[dx+70,top+40],[dx+82,top+84]]];
  for(const c of cracks){ctx.beginPath();c.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}
  const gl=ctx.createRadialGradient(dx,GROUND-120,10,dx,GROUND-120,330+120*ydg);gl.addColorStop(0,'rgba(255,120,40,'+(.26+.5*ydg)+')');gl.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=gl;ctx.fillRect(dx-460,GROUND-460,920,520);ctx.restore();
  // paved ground
  const fg=ctx.createLinearGradient(0,GROUND-8,0,H+120);fg.addColorStop(0,'#4a3c32');fg.addColorStop(1,'#1c1512');ctx.fillStyle=fg;ctx.fillRect(0,GROUND-8,W,H+140);
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=2;for(let r=0;r<7;r++){const yy=GROUND+6+r*r*3.4;ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy);ctx.stroke()}
  for(let i=-6;i<26;i++){ctx.beginPath();ctx.moveTo(480+(i*58-480)*.55,GROUND);ctx.lineTo(480+(i*58-480)*1.6,H+120);ctx.stroke()}
  // door light spilling over the stones
  ctx.save();ctx.globalCompositeOperation='lighter';const sp=ctx.createRadialGradient(dx-40,GROUND+14,10,dx-40,GROUND+14,380);sp.addColorStop(0,'rgba(255,110,40,'+(.24+.4*ydg)+')');sp.addColorStop(1,'rgba(255,90,20,0)');ctx.save();ctx.translate(0,GROUND+14);ctx.scale(1,.28);ctx.translate(0,-(GROUND+14));ctx.fillStyle=sp;ctx.fillRect(dx-420,GROUND-300,840,700);ctx.restore();ctx.restore();
  // scattered weapons
  const sp2=(x,y,len,a)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle='#4a3220';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);ctx.stroke();ctx.fillStyle='#aab4be';ctx.beginPath();ctx.moveTo(len,0);ctx.lineTo(len-16,-5);ctx.lineTo(len+14,0);ctx.lineTo(len-16,5);ctx.fill();ctx.restore()};
  sp2(150,GROUND+26,110,.08);sp2(420,GROUND+40,100,-.2);sp2(520,GROUND+20,90,.3);sp2(700,GROUND+44,110,-.05);
  ctx.fillStyle='#8f9aa5';for(const s of[[330,GROUND+34],[610,GROUND+52],[110,GROUND+50]]){ctx.beginPath();ctx.ellipse(s[0],s[1],26,8,.1,0,7);ctx.fill();ctx.strokeStyle='#d4a443';ctx.lineWidth=2;ctx.stroke()}
  ctx.strokeStyle='#b9c2cc';ctx.lineWidth=3;for(const s of[[250,GROUND+58,40],[560,GROUND+62,46],[760,GROUND+36,38]]){ctx.beginPath();ctx.moveTo(s[0],s[1]);ctx.lineTo(s[0]+s[2],s[1]-6);ctx.stroke()}
}
function drawEnemy(){
  const e=cb.e,dx=e.x,y=GROUND;let name='walk',f=0;const sc=0.72;
  if(e.st==='enter'||e.st==='walk'){name='walk';f=Math.floor((e.ph%1)*M.walk.n)%M.walk.n}
  else if(e.st==='idle'||e.st==='recover'||e.st==='stun'){name='idle';f=pingpong(Math.floor(T*10),M.idle.n)}
  else if(e.st==='swing'){name='attack';f=Math.min(M.attack.n-1,Math.floor(e.t*ESPEC[e.kind].rate))}
  else if(e.st==='dead'){name='fall';f=Math.min(M.fall.n-1,Math.floor(e.fallT*24))}
  const jit=e.twitch?(Math.sin(T*70)*1.6):0;
  shadow(dx,y,52);
  eBlit(name,f,dx+jit,y+(e.twitch?Math.sin(T*50)*1.2:0),e.face*(name==='fall'?-1:1)*(name==='fall'?1:1),sc,1);
  if(e.flash>0){ctx.save();ctx.globalAlpha=e.flash*3.2;ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ffd6a0';ctx.beginPath();ctx.ellipse(dx,y-100,38,90,0,0,7);ctx.fill();ctx.restore()}
  if(!e.dead){const tele=e.st==='swing'&&e.t*ESPEC[e.kind].rate<ESPEC[e.kind].wind;
    ctx.save();ctx.globalCompositeOperation='lighter';const gx=dx+e.face*12,gy=y-124;const r=tele?(e.kind==='heavy'?34:20):10;
    const g=ctx.createRadialGradient(gx,gy,1,gx,gy,r);g.addColorStop(0,tele&&e.kind==='heavy'?'rgba(255,70,40,.95)':'rgba(255,150,40,.9)');g.addColorStop(1,'rgba(255,100,20,0)');ctx.fillStyle=g;ctx.fillRect(gx-r,gy-r,2*r,2*r);ctx.restore();
    if(tele&&e.kind==='heavy'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,70,40,.6)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(dx,y-100,80+Math.sin(T*40)*4,0,7);ctx.stroke();ctx.restore()}}
}
function drawYardPlayer(){
  const dx=p.x-camX;let name='idle',f=0,alpha=1;
  const m=cb;
  if(m.ps==='atk'){name='attack';f=Math.min(M.attack.n-1,Math.floor(m.pt*46))}
  else if(m.ps==='dodge'){name='jump';f=6+Math.min(12,Math.floor(m.pt/0.42*13));alpha=.92;
    for(let i=1;i<=3;i++){ctx.save();ctx.globalAlpha=.16/i;blit('jump',f,dx-(cb.vx>0?1:-1)*i*26*-1,p.y,p.face,ANIMS.jump.scale);ctx.restore()}}
  else if(m.ps==='hurt'){name='hurt';f=Math.min(M.hurt.n-1,Math.floor(m.pt*24))}
  else if(m.guard){name='idle';f=2}
  else if(p.moving){name='walk';f=Math.floor((p.ph%1)*M.walk.n)%M.walk.n}
  else{name='idle';f=pingpong(Math.floor(T*10),M.idle.n)}
  shadow(dx,GROUND,50);blit(name,f,dx,p.y,p.face,ANIMS[name].scale,alpha);
  if(m.guard){ctx.save();ctx.globalCompositeOperation='lighter';const a=m.gt<=.24?.8:.3;ctx.strokeStyle='rgba(255,230,160,'+a+')';ctx.lineWidth=m.gt<=.24?5:2.5;ctx.beginPath();ctx.arc(dx+p.face*34,GROUND-100,58,-1.1,1.1);ctx.stroke();ctx.restore()}
}
function drawYardScene(){
  drawYardBG();
  const e=cb.e;
  drawParty();                            // companions wait at the gate of the courtyard
  if(e.behind){drawEnemy();drawPillarAt(600,60,GROUND-250)}else{drawEnemy()}
  drawYardPlayer();
  // sparks
  fxDraw();
  // companion reaction marks
}
/* ---------------- HUD + chapter card ---------------- */
function yardHUD(){
  if(scn!=='yard'||!cb.e)return;const e=cb.e;
  // player health pips
  for(let i=0;i<cb.max;i++){ctx.fillStyle=i<cb.hp?'#e8c27a':'rgba(232,194,122,.22)';ctx.beginPath();ctx.moveTo(28+i*26,H-70);ctx.lineTo(40+i*26,H-84);ctx.lineTo(52+i*26,H-70);ctx.lineTo(40+i*26,H-56);ctx.closePath();ctx.fill();ctx.strokeStyle='#2a1508';ctx.lineWidth=2;ctx.stroke()}
  // enemy bar
  if(!e.dead||cb.out&&cb.out.t<2){ctx.fillStyle='rgba(12,6,6,.7)';ctx.fillRect(W/2-170,22,340,16);ctx.fillStyle='#8a2a24';ctx.fillRect(W/2-168,24,336*Math.max(0,e.hp/e.max),12);ctx.strokeStyle='#c8963c';ctx.lineWidth=2;ctx.strokeRect(W/2-170,22,340,16);
    ctx.fillStyle='#e8d6b4';ctx.font='15px Georgia,serif';ctx.textAlign='center';ctx.fillText('THE GATEKEEPER',W/2,18);ctx.textAlign='left'}
  if(cb.hint.t>0&&cb.hint.text){const a=Math.min(1,cb.hint.t/.4);ctx.save();ctx.globalAlpha=a;ctx.font='bold 21px Georgia,serif';const w=ctx.measureText(cb.hint.text).width+44;
    ctx.fillStyle='rgba(14,7,6,.82)';ctx.strokeStyle='#c8963c';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(W/2-w/2,64,w,42,10);ctx.fill();ctx.stroke();ctx.fillStyle='#ffe9b8';ctx.textAlign='center';ctx.fillText(cb.hint.text,W/2,92);ctx.textAlign='left';ctx.restore()}
  for(const f of cb.floats){const a=1-f.life/1.1;ctx.save();ctx.globalAlpha=a;ctx.fillStyle=f.c;ctx.font='bold 26px Georgia,serif';ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.fillText(f.t,f.x-camX,f.y-f.life*40);ctx.restore()}
}
function updateChapter(dt){fadeT=1;fade=1;if(ph==='card'&&T>9)go('chap','end')}
function drawChapter(){
  ctx.fillStyle='#060202';ctx.fillRect(0,0,W,H);
  const g=ctx.createRadialGradient(W/2,H*0.62,10,W/2,H*0.62,380);g.addColorStop(0,'rgba(255,100,30,'+(.16+.05*Math.sin(T*2))+')');g.addColorStop(1,'rgba(255,100,30,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  motesDraw('rgba(255,140,70,A)');const tt=ph==='end'?T+9:T;ctx.save();ctx.textAlign='center';
  ctx.globalAlpha=Math.min(1,Math.max(0,(tt-0.5)/1));ctx.fillStyle='#d8c19a';ctx.font='20px Georgia,serif';spaced(CHAPTER.n,W/2,H/2-64,12);ctx.textAlign='center';
  ctx.globalAlpha=Math.min(1,Math.max(0,(tt-1.4)/1.2));ctx.shadowColor='rgba(255,130,50,.6)';ctx.shadowBlur=30;ctx.fillStyle='#e8c27a';ctx.font='bold 54px Georgia,serif';spaced(CHAPTER.title,W/2,H/2,7);ctx.shadowBlur=0;ctx.textAlign='center';
  ctx.globalAlpha=Math.min(1,Math.max(0,(tt-3)/1.2));ctx.fillStyle='rgba(232,194,122,.9)';ctx.fillRect(W/2-170,H/2+22,340,2);
  ctx.globalAlpha=Math.min(1,Math.max(0,(tt-4)/1.4));ctx.fillStyle='#e8d6b4';ctx.font='italic 26px Georgia,serif';ctx.fillText(CHAPTER.sub,W/2,H/2+66);
  if(tt>7.5){ctx.globalAlpha=.55+.35*Math.sin(tt*3);ctx.fillStyle='#d8c19a';ctx.font='17px Georgia,serif';ctx.fillText('To be continued\u2026   \u00B7   tap or press R to replay',W/2,H-46)}
  ctx.restore();ctx.textAlign='left';
}
