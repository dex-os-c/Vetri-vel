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
const YG=440,YS=1.1;
function beginYard(){
  scn='yard';ph='fight';T=0;mode='scene';p.x=330;p.y=GROUND;p.vy=0;p.face=1;p.lock=false;p.weary=false;p.talk=false;p.hurt=-1;p.dead=-1;p.atk=false;p.jp=null;set('idle');
  camX=0;zoom=zoomT=1;zf={x:W/2,y:YG-110};fade=1;fadeT=0;barsT=0;bars=0;fx=[];dl.active=false;ydg=0.18;seed=21;
  party=makeParty().filter(s=>s.id!=='horse');const px=[60,112,164,216,268];party.forEach((s,i)=>{s.x=px[i];s.mv=false;s.face=1;s.ph=[.2,.5,.8,.35,.1][i]});
  cb={hp:5,max:5,ps:'free',pt:0,guard:false,gt:0,cd:0,hitDone:false,vx:0,hs:0,slow:0,shake:0,
    e:{x:540,hp:12,max:12,st:'enter',t:0,kind:null,qi:0,vuln:0,face:-1,ph:0,flash:0,dead:false,fallT:0,did:false,twitch:0,
       queue:['light','light','heavy','light','heavy','light','light','heavy','light','heavy'],behind:true},
    hint:{text:'',t:0},seen:{atk:false,light:false,heavy:false,counter:false,dodged:false,parried:false},floats:[],out:null,hits:0};
  setHint('ATTACK  \u2014  tap  J  /  \u2694',99);sync();
}
function setHint(t,d){cb.hint.text=t;cb.hint.t=d||4}
function float(x,y,t,c){cb.floats.push({x,y,t,c:c||'#ffe2a0',life:0})}
function enemyDamage(n,counter){const e=cb.e;if(e.dead)return;e.hp-=n;e.flash=.18;e.x+=-e.face*5;cb.hits++;sfx.hit();
  float(e.x,YG-190,counter?'COUNTER!':'-'+n,counter?'#ff9a4a':'#ffe2a0');
  if(counter&&!cb.seen.counter){cb.seen.counter=true}
  if(!cb.seen.atk){cb.seen.atk=true}
  if(e.hp<=0){e.hp=0;e.dead=true;e.st='dead';e.fallT=0;cb.out={ph:'fall',t:0};p.lock=true;cb.guard=false;cb.ps='free';p.moving=false;sfx.thud();cb.slow=.6}}
function playerHurt(n,knock){if(cb.ps==='dodge')return;cb.hp=Math.max(1,cb.hp-n);cb.ps='hurt';cb.pt=0;cb.vx=knock;cb.shake=.25;sfx.hit();float(p.x,YG-170,'-'+n,'#ff6a5a')}
const ESPEC={light:{sheet:'gkLight',rate:30,sf:8,reach:160,lunge:62,wind:5,vuln:0.95},heavy:{sheet:'gkHeavy',rate:30,sf:24,reach:220,lunge:115,wind:19,vuln:1.35}};
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
        if(p.moving&&Math.floor(p.ph*2)!==p._pf&&!cb.guard){p._pf=Math.floor(p.ph*2);puff(p.x-p.face*14,YG,p.face)}}
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
  if(e.st==='enter'){e.x-=62*dt;e.ph+=62*dt/ANIMS.gkWalk.stride;if(e.t>1.6){e.st='walk';e.t=0}}
  else if(e.st==='walk'){const d=Math.sign(p.x-e.x);e.x+=d*72*dt;e.ph+=72*dt/ANIMS.gkWalk.stride;if(dist<175){e.st='idle';e.t=0}}
  else if(e.st==='idle'){if(dist>230){e.st='walk';e.t=0}else if(e.t>(e.qi===0?0.9:0.55)){e.kind=e.queue[e.qi%e.queue.length];e.qi++;e.st='swing';e.t=0;e.did=false;e.hit=false}}
  else if(e.st==='swing'){const sp=ESPEC[e.kind],f=e.t*sp.rate;
    if(f<sp.wind&&e.t<0.02){if(e.kind==='heavy'){if(!cb.seen.heavy){cb.seen.heavy=true;setHint('HEAVY SWING!  DODGE  \u2014  L  /  \u00BB',3.2)}}else if(!cb.seen.light){cb.seen.light=true;setHint('HE SWINGS!  BLOCK  \u2014  hold  K  (tap it just before the hit to PARRY)',3.8)}
      if(e.kind==='heavy')sfx.swing(true)}
    if(f>3&&f<sp.sf)e.x+=e.face*sp.lunge*dt*(sp.rate/32);
    if(!e.did&&f>=sp.sf){e.did=true;sfx.swing(e.kind==='heavy');
      const d=Math.abs(e.x-p.x),front=((p.x-e.x)*e.face>0);
      if(d<sp.reach&&front){
        if(cb.ps==='dodge'){cb.seen.dodged=true;e.vuln=sp.vuln;if(e.kind==='heavy'||true){setHint('PERFECT!  COUNTERATTACK  \u2014  J',2.6)}float(p.x,YG-200,'DODGE','#9fe0ff')}
        else if(cb.guard&&e.kind==='light'){
          if(cb.gt<=0.24){sfx.parry();e.st='stun';e.t=0;e.vuln=1.7;cb.hs=.09;cb.slow=.35;cb.seen.parried=true;float(p.x+p.face*40,YG-190,'PARRY!','#fff3b0');setHint('PARRIED!  He is open  \u2014  COUNTERATTACK  J',2.8);sparks(p.x+p.face*60,YG-110)}
          else{sfx.clash();p.x-=p.face*38;e.vuln=.45;sparks(p.x+p.face*60,YG-110);float(p.x,YG-190,'BLOCK','#cfe6ff')}}
        else{const heavy=e.kind==='heavy';playerHurt(heavy?2:1,-p.face*(heavy?380:240));e.hit=true;e.vuln=.3}
      }else{e.vuln=sp.vuln}}
    if(f>=M[sp.sheet].n-1&&e.st==='swing'){e.st='recover';e.t=0}}
  else if(e.st==='recover'){if(e.t>0.5){e.st='idle';e.t=0}}
  else if(e.st==='stun'){e.vuln=Math.max(e.vuln,.2);if(e.t>1.6){e.st='idle';e.t=0}}
  else if(e.st==='dead'){e.fallT+=real}
  e.x=clamp(e.x,90,840);
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
  else if(o.ph==='approach'){const tx=e.x-135;p.face=1;if(p.x<tx-4){p.x+=105*dt;set('walk');p.ph+=105*dt/ANIMS.walk.stride;p.moving=true;if(Math.floor(p.ph*2)!==p._pf){p._pf=Math.floor(p.ph*2);puff(p.x-14,YG,1)}}
    else{p.moving=false;set('idle');o.ph='say1';o.t=0;barsT=1;say(OUTRO,()=>{o.ph='twitch';o.t=0;sfx.thud()})}}
  else if(o.ph==='say1'){zoomT=1.45;zf.x+=((e.x-camX)-zf.x)*Math.min(1,3*dt);zf.y+=((YG-60)-zf.y)*Math.min(1,3*dt)}
  else if(o.ph==='twitch'){zoomT=1.45;e.twitch=1;if(o.t>1.3){o.ph='still';o.t=0;e.twitch=0}
    if(o.t>0.5)p.x=Math.max(p.x-70*dt,e.x-210)}
  else if(o.ph==='still'){zoomT=1.3;if(o.t>1.4){o.ph='breath';o.t=0;sfx.rumble(true,.4);cb.shake=.5}}
  else if(o.ph==='breath'){zoomT=1.1;ydg=Math.min(1,.2+o.t*.26);cb.shake=Math.max(cb.shake,.12);sfx.rumble(true,.4+ydg*.6);
    if(o.t>3.2&&!o.said){o.said=true;say(OUTRO2,()=>{o.ph='fade';o.t=0})}}
  else if(o.ph==='fade'){fadeT=1;if(o.t>2.2){sfx.rumble(false);go('chap','card');fade=1;fadeT=1;barsT=0;dl.active=false;sync()}}
  if(['say1','twitch','still','breath'].includes(o.ph)&&o.ph!=='say1'){zf.x+=((e.x-camX-30)-zf.x)*Math.min(1,3*dt);zf.y+=((YG-100)-zf.y)*Math.min(1,3*dt)}
}
/* ---------------- drawing the courtyard ---------------- */
function drawYardBG(){
  const Y=BGI.yard;ctx.fillStyle='#1a120e';ctx.fillRect(-100,0,W+200,H+260);
  ctx.drawImage(Y,0,0,W,536);ctx.drawImage(Y,0,500,W,36,0,536,W,260);
  const fg=ctx.createLinearGradient(0,536,0,H+260);fg.addColorStop(0,'rgba(10,6,6,0)');fg.addColorStop(1,'rgba(10,6,6,.75)');ctx.fillStyle=fg;ctx.fillRect(0,536,W,260);
  // the sealed door glows through its cracks; it grows brighter as the dead stay down
  const pulse=.78+.22*Math.sin(T*2.2),k=(.4+.6*ydg)*pulse;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,k);ctx.drawImage(BGI.yardglow,0,0,W,536);ctx.globalAlpha=Math.min(1,k*.6);ctx.drawImage(BGI.yardglow,0,0,W,536);
  const dx=845,dy=300,gl=ctx.createRadialGradient(dx,dy,10,dx,dy,330+140*ydg);gl.addColorStop(0,'rgba(255,120,40,'+(.22+.5*ydg)+')');gl.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=gl;ctx.fillRect(dx-480,dy-480,960,760);
  const sp=ctx.createRadialGradient(dx-30,YG+10,10,dx-30,YG+10,380);sp.addColorStop(0,'rgba(255,110,40,'+(.2+.4*ydg)+')');sp.addColorStop(1,'rgba(255,90,20,0)');ctx.save();ctx.translate(0,YG+10);ctx.scale(1,.3);ctx.translate(0,-(YG+10));ctx.fillStyle=sp;ctx.fillRect(dx-420,YG-300,840,700);ctx.restore();
  ctx.restore();
  if(ydg>0.5){ctx.fillStyle='rgba(30,6,0,'+((ydg-.5)*.35)+')';ctx.fillRect(0,0,W,H+200)}
}
function drawEnemy(){
  const e=cb.e,dx=e.x,y=YG;let name='gkIdle',f=0,alpha=1;
  if(e.st==='enter'||e.st==='walk'){name='gkWalk';f=Math.floor((e.ph%1)*M.gkWalk.n)%M.gkWalk.n;if(e.st==='enter')alpha=Math.min(1,e.t/0.8)}
  else if(e.st==='idle'||e.st==='recover'||e.st==='stun'){name='gkIdle';f=pingpong(Math.floor(T*8),M.gkIdle.n)}
  else if(e.st==='swing'){const sp=ESPEC[e.kind];name=sp.sheet;f=Math.min(M[name].n-1,Math.floor(e.t*sp.rate))}
  else if(e.st==='dead'){name='gkFall';f=Math.min(M.gkFall.n-1,Math.floor(e.fallT*24))}
  const jit=e.twitch?(Math.sin(T*70)*1.6):0,sc=ANIMS[name].scale*YS;
  shadow(dx,y,56,alpha);
  blit(name,f,dx+jit,y+(e.twitch?Math.sin(T*50)*1.2:0),e.face,sc,alpha);
  if(e.flash>0){ctx.save();ctx.globalAlpha=e.flash*3.2;ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ffd6a0';ctx.beginPath();ctx.ellipse(dx,y-100,38,90,0,0,7);ctx.fill();ctx.restore()}
  if(!e.dead&&e.st==='swing'){const sp=ESPEC[e.kind],tele=e.t*sp.rate<sp.wind;
    if(tele){ctx.save();ctx.globalCompositeOperation='lighter';const heavy=e.kind==='heavy';ctx.strokeStyle=heavy?'rgba(255,70,40,.7)':'rgba(255,170,60,.5)';ctx.lineWidth=heavy?4:2.5;ctx.beginPath();ctx.arc(dx,y-105,(heavy?92:72)+Math.sin(T*40)*4,0,7);ctx.stroke();
      const g=ctx.createRadialGradient(dx,y-105,10,dx,y-105,heavy?120:80);g.addColorStop(0,heavy?'rgba(255,60,30,.28)':'rgba(255,150,40,.2)');g.addColorStop(1,'rgba(255,60,30,0)');ctx.fillStyle=g;ctx.fillRect(dx-130,y-235,260,260);ctx.restore()}}
}
function drawYardPlayer(){
  const dx=p.x-camX;let name='idle',f=0,alpha=1;
  const m=cb;const py=YG,ps=YS;
  if(m.ps==='atk'){name='attack';f=Math.min(M.attack.n-1,Math.floor(m.pt*46))}
  else if(m.ps==='dodge'){name='jump';f=6+Math.min(12,Math.floor(m.pt/0.42*13));alpha=.92;
    for(let i=1;i<=3;i++){ctx.save();ctx.globalAlpha=.16/i;blit('jump',f,dx-(cb.vx>0?1:-1)*i*26*-1,py,p.face,ANIMS.jump.scale*ps);ctx.restore()}}
  else if(m.ps==='hurt'){name='hurt';f=Math.min(M.hurt.n-1,Math.floor(m.pt*24))}
  else if(m.guard){name='idle';f=2}
  else if(p.moving){name='walk';f=Math.floor((p.ph%1)*M.walk.n)%M.walk.n}
  else{name='idle';f=pingpong(Math.floor(T*10),M.idle.n)}
  shadow(dx,YG,54);blit(name,f,dx,py,p.face,ANIMS[name].scale*ps,alpha);
  if(m.guard){ctx.save();ctx.globalCompositeOperation='lighter';const a=m.gt<=.24?.8:.3;ctx.strokeStyle='rgba(255,230,160,'+a+')';ctx.lineWidth=m.gt<=.24?5:2.5;ctx.beginPath();ctx.arc(dx+p.face*34,YG-110,62,-1.1,1.1);ctx.stroke();ctx.restore()}
}
function drawYardScene(){
  drawYardBG();partyDraw(YG,YS);drawEnemy();drawYardPlayer();fxDraw();
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
