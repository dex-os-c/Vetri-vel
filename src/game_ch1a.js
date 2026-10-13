/* =====================================================================================
   CHAPTER 1 — THE SILENT FRONTIER : audio, companions, Part 1 (leaving the capital), Part 2 (the forest road)
   ===================================================================================== */
const PART1=[
 {who:'Young Soldier',text:'A missing garrison. Three months without a message. And the king sends only five men?'},
 {who:'Commander',text:'Five men who can think are worth more than fifty who cannot.'},
 {who:'Veteran',text:'And five dead men are worth nothing.'},
 {who:'Commander',text:'Then let us try not to become five dead men.'}
];
const CLUE1=[{who:'Scout',text:'They abandoned food and weapons. Soldiers don\u2019t do that unless they\u2019re running from something.'}];
const CLUE2=[{who:null,text:'The watchtower is damaged, but there are no clear signs of a siege. Its ladder has been pulled down, and the warning bell is missing.'},
 {who:'Commander',text:'An enemy would destroy the tower from outside.'},{who:'Veteran',text:'Unless the enemy was already inside.'}];
const CLUE3=[{who:null,text:'A dead horse lies beside the road. Its message tube is empty, and the ground is marked by dozens of footprints. Most tracks point toward the capital.'},
 {who:'Commander',text:'They weren\u2019t marching toward the fort.'},{who:'Scout',text:'They were running away from it.'},{who:'Veteran',text:'Then where are they?'}];
const BELL1=[{who:null,text:'A faint metallic sound comes from somewhere inside the settlement.\n\u2014 Clang.'}];
const BELL2=[{who:null,text:'Everyone turns. The bell rings again.\n\u2014 Clang.\nThe sound comes from the garrison courtyard.'},
 {who:'Scout',text:'Commander\u2026 the watchtower bell was missing.'},{who:'Commander',text:'Then someone has found another.'}];
NAMECOL.Commander='#e8c27a';NAMECOL['Young Soldier']='#9fd0a0';NAMECOL.Veteran='#c9b48a';NAMECOL.Scout='#cfd8e6';
/* ---------------- audio (all synthesized, no files) ---------------- */
const sfx=(()=>{
  let ac=null,m=null,rum=null;const AC=(typeof window!=='undefined')&&(window.AudioContext||window.webkitAudioContext);
  function init(){if(ac||!AC)return;try{ac=new AC();m=ac.createGain();m.gain.value=.55;m.connect(ac.destination)}catch(e){ac=null}}
  function resume(){init();if(ac&&ac.state==='suspended')ac.resume()}
  function osc(f,t,d,type,v,f2){if(!ac)return;const o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime+t;o.type=type||'sine';o.frequency.setValueAtTime(f,n);
    if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v,n+.006);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(m);o.start(n);o.stop(n+d+.05)}
  function noise(t,d,v,type,f1,f2){if(!ac)return;const len=Math.floor(ac.sampleRate*d),b=ac.createBuffer(1,len,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<len;i++)a[i]=Math.random()*2-1;
    const s=ac.createBufferSource();s.buffer=b;const fl=ac.createBiquadFilter(),n=ac.currentTime+t;fl.type=type||'lowpass';fl.frequency.setValueAtTime(f1,n);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,n+d);
    const g=ac.createGain();g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);s.connect(fl);fl.connect(g);g.connect(m);s.start(n)}
  return{resume,
    bell(v){v=v||1;[1,2.01,2.76,4.07,5.4].forEach((k,i)=>osc(430*k,0,2.8/(1+i*.6),'sine',v*.24/(1+i*.8)))},
    clash(){noise(0,.18,.5,'highpass',2500);osc(1900,0,.35,'triangle',.14);osc(2850,0,.28,'triangle',.1)},
    parry(){noise(0,.22,.6,'highpass',3200);osc(2400,0,.5,'triangle',.2);osc(3600,0,.4,'triangle',.12);osc(900,0,.25,'sine',.2)},
    hit(){noise(0,.16,.6,'lowpass',900,200);osc(120,0,.2,'sine',.5,50)},
    swing(h){noise(0,h?.45:.22,.26,'bandpass',h?500:900,h?1800:3200)},
    dodge(){noise(0,.2,.18,'bandpass',1200,400)},
    door(){osc(70,0,1.4,'sawtooth',.16,42);noise(0,1.0,.1,'lowpass',200,80)},
    thud(){osc(70,0,.5,'sine',.7,35);noise(0,.25,.3,'lowpass',300,80)},
    bird(){const f=2200+Math.random()*1400;osc(f,0,.09,'sine',.06,f*1.25);osc(f*1.1,.12,.08,'sine',.05,f*1.4)},
    cricket(){for(let i=0;i<3;i++)osc(4300,i*.07,.04,'square',.012)},
    rumble(on,lvl){if(!ac)return;lvl=lvl==null?.5:lvl;
      if(on&&!rum){const len=ac.sampleRate*2,b=ac.createBuffer(1,len,ac.sampleRate),a=b.getChannelData(0);let l=0;for(let i=0;i<len;i++){l=(l+0.02*(Math.random()*2-1))/1.02;a[i]=l*3.5}
        const s=ac.createBufferSource();s.buffer=b;s.loop=true;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=140;const g=ac.createGain();g.gain.value=0;
        const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=.28;lg.gain.value=.25;lfo.connect(lg);lg.connect(g.gain);s.connect(f);f.connect(g);g.connect(m);s.start();lfo.start();rum={s,g,lfo}}
      if(rum){rum.g.gain.setTargetAtTime(on?lvl*.7:0,ac.currentTime,.6);if(!on){const r=rum;rum=null;setTimeout(()=>{try{r.s.stop();r.lfo.stop()}catch(e){}},2500)}}}
  }})();
if(typeof addEventListener!=='undefined'){['pointerdown','keydown','touchstart'].forEach(e=>addEventListener(e,()=>sfx.resume(),{passive:true}))}
/* ---------------- the party: scout, archer, young soldier, shield-bearer, veteran + two pack horses ---------------- */
let party=[],rd={};
const PSPEC={scout:{walk:'scoutWalk',idle:'scoutIdle',run:'scoutRun'},young:{walk:'youngWalk',idle:'youngIdle',run:'youngRun'},
  archer:{walk:'archer'},shield:{walk:'shield'},vet:{walk:'soldierB'},horse:{walk:'horse'}};
function makeParty(){return [
  {id:'scout',off:-110,x:0,ph:0,mv:false},{id:'archer',off:125,x:0,ph:0,mv:false},{id:'young',off:200,x:0,ph:0.3,mv:false},
  {id:'horse',off:295,x:0,ph:0.1,mv:false},{id:'shield',off:395,x:0,ph:0.6,mv:false},{id:'vet',off:470,x:0,ph:0.1,mv:false},{id:'horse',off:565,x:0,ph:0.5,mv:false}]}
function updateParty(dt,follow){
  const running=!!(keys.ShiftLeft||keys.ShiftRight);
  party.forEach(s=>{if(!follow)return;const t=p.x-s.off,prev=s.x;s.x+=(t-s.x)*Math.min(1,2.6*dt);const d=Math.abs(s.x-prev);s.mv=d>0.05;s.run=running&&p.moving;
    if(s.mv){const sp=PSPEC[s.id],nm=(s.run&&sp.run)?sp.run:sp.walk;s.ph+=d/ANIMS[nm].stride;
      const q=Math.floor(s.ph*2);if(q!==s.pf){s.pf=q;if(rnd()<0.3&&s.id!=='horse')puff(s.x-10,GROUND,1)}}})}
function partyDraw(gy,mul,xshift,dim){
  for(const s of party){const dx=s.x-camX+(xshift||0);if(dx<-260||dx>W+260)continue;shadow(dx,gy,s.id==='horse'?70:40);
    const sp=PSPEC[s.id],face=s.face||1;let nm=sp.walk,f;
    if(s.mv){nm=(s.run&&sp.run)?sp.run:sp.walk;const n=M[nm].n;f=Math.floor((s.ph%1)*n)%n}
    else if(sp.idle){nm=sp.idle;f=pingpong(Math.floor(T*8+s.ph*20),M[nm].n)}
    else{const n=M[nm].n;f=s.id==='horse'?0:Math.floor((s.ph%1)*n)%n}
    blit(nm,f,dx,gy,face,ANIMS[nm].scale*(mul||1),dim)}
}
function drawParty(){partyDraw(GROUND,1)}
/* ---------------- Part 1: the palace gate ---------------- */
const GATE_GY=452,GS=1.12;
function beginGate(){
  scn='gate';ph='in';T=0;mode='scene';p.x=470;p.y=GROUND;p.face=1;p.lock=true;p.weary=false;p.talk=false;p.hurt=-1;p.dead=-1;p.atk=false;p.jp=null;set('idle');
  camX=0;zoom=zoomT=1;zf={x:W/2,y:GATE_GY-110};fade=1;fadeT=0;setBars(1);fx=[];dl.active=false;seed=9;cy=0;
  party=makeParty();const xs={scout:905,young:850,shield:795,archer:740,vet:685};
  party.forEach(s=>{if(xs[s.id]!=null)s.x=xs[s.id];s.face=-1;s.mv=false});party=party.filter(s=>s.id!=='horse');
  rd={close:0,vx:470,said:false,smileK:0};sync();
}
function updateGate(dt){
  fadeT=T<0.5?1:0;const V=ANIMS.walk;
  if(ph==='in'){if(T>0.7&&rd.vx<585){rd.vx+=100*dt;p.ph+=100*dt/(V.stride*GS);set('walk');p.moving=true;if(rd.close===0&&rd.vx>520){sfx.door();rd.close=0.001}}
    else if(rd.vx>=585){set('talk');p.moving=false}
    if(rd.close>0&&rd.close<1)rd.close=Math.min(1,rd.close+dt/3.2);
    if(rd.vx>=585&&rd.close>=1&&!rd.said){rd.said=true;say(PART1,()=>{go('gate','smile')})}}
  else if(ph==='smile'){zoomT=1.55;zf.x+=((party[4].x)-zf.x)*Math.min(1,3*dt);zf.y+=((GATE_GY-100)-zf.y)*Math.min(1,3*dt);if(T>2.6){go('gate','leave')}}
  else if(ph==='leave'){zoomT=1;zf.x=W/2;zf.y=GATE_GY-110;fadeT=1;if(T>1.2)beginRoad()}
  party.forEach(s=>{s.face=ph==='leave'?1:-1});
  barsT=1;if(ph==='in'&&T<0.7)barsT=1;
}
function drawGateScene(){
  const G=BGI.gate;ctx.fillStyle='#1b1410';ctx.fillRect(-100,0,W+200,H+220);
  ctx.drawImage(G,0,0,W,536);ctx.drawImage(G,0,490,W,46,0,536,W,200);
  const fg=ctx.createLinearGradient(0,536,0,H+200);fg.addColorStop(0,'rgba(10,6,6,0)');fg.addColorStop(1,'rgba(10,6,6,.7)');ctx.fillStyle=fg;ctx.fillRect(0,536,W,200);
  // the two doors swing shut behind the commander
  const c=ease(rd.close||0),left=373,right=631,cx=486;
  if(c>0){for(const side of[-1,1]){const x0=side<0?left+(cx-left)*c*0+ (436-left)*0:0;
      const x1=side<0?436:541,x2=side<0?lerp(436,cx,c):lerp(541,cx,c);const xa=Math.min(x1,x2),xb=Math.max(x1,x2);
      const g=ctx.createLinearGradient(xa,0,xb,0);g.addColorStop(0,'#2f1d14');g.addColorStop(1,'#3d261a');ctx.fillStyle=g;ctx.fillRect(xa,150,xb-xa,238);
      ctx.fillStyle='#d4a443';for(let r=0;r<7;r++)for(let k=0;k<Math.max(1,Math.floor((xb-xa)/20));k++)ctx.fillRect(xa+8+k*20,166+r*30,4,4)}}
  ctx.save();ctx.globalCompositeOperation='lighter';[[316,305],[701,305]].forEach((l,i)=>{const fl=.8+.2*Math.sin(T*9+i*2.1),r=64*fl;const g=ctx.createRadialGradient(l[0],l[1],2,l[0],l[1],r);g.addColorStop(0,'rgba(255,170,70,.45)');g.addColorStop(1,'rgba(255,120,30,0)');ctx.fillStyle=g;ctx.fillRect(l[0]-r,l[1]-r,2*r,2*r)});ctx.restore();
  partyDraw(GATE_GY,GS);
  const vx=rd.vx;shadow(vx,GATE_GY,58);
  if(p.anim==='walk')blit('walk',Math.floor((p.ph%1)*M.walk.n)%M.walk.n,vx,GATE_GY,1,ANIMS.walk.scale*GS);else blit('talk',Math.floor(T*8)%M.talk.n,vx,GATE_GY,1,ANIMS.talk.scale*GS);
}
function beginRoad(){
  scn='road';ph='walk';T=0;mode='scene';p.x=300;p.y=GROUND;p.face=1;p.lock=false;p.weary=false;p.talk=false;p.hurt=-1;p.dead=-1;p.atk=false;p.jp=null;set('idle');
  camX=0;zoom=zoomT=1;zf={x:W/2,y:GROUND-110};fade=1;fadeT=0;barsT=0;bars=0;fx=[];dl.active=false;seed=9;cy=0;
  party=makeParty();party.forEach(s=>{s.x=p.x-s.off;s.face=1;s.mv=false});
  rd={step:0,mood:0,zoomK:null,blade:false,bellT:0,intro:true};sync();
}
function sceneEnd(){go('end','end');sync()}
/* ---------------- Part 2: the forest road ---------------- */
const RX={clue1:1250,clue2:2350,clue3:3450,bell:4050,end:4750};
function roadSay(lines,after){p.lock=true;say(lines,()=>{p.lock=false;if(after)after()})}
function updateRoad(dt){
  fadeT=0;rd.mood=rd.step>=4?1:clamp((p.x-700)/3300,0,1);
  if(ph==='walk'){
    if(rd.step===0&&p.x>=RX.clue1){rd.step=1;roadSay(CLUE1,null);rd.zoomK=[RX.clue1+150,1.3]}
    else if(rd.step===1&&p.x>=RX.clue2){rd.step=2;roadSay(CLUE2,null);rd.zoomK=[RX.clue2+130,1.2]}
    else if(rd.step===2&&p.x>=RX.clue3){rd.step=3;roadSay(CLUE3,()=>{go('road','bell')});rd.zoomK=[RX.clue3+150,1.3]}
    else if(rd.step===4&&p.x>=RX.end){go('road','toYard');p.lock=true}
    if(!dl.active)rd.zoomK=null;
    rd.bt=(rd.bt||0)-dt;if(rd.bt<0){rd.bt=1.2+rnd()*3;const pr=1-rd.mood*1.4;if(rnd()<pr)sfx.bird();else if(rd.mood<0.8&&rnd()<.5)sfx.cricket()}
    if(rnd()<dt*(1.6-rd.mood))fx.push({k:'leaf',x:camX+W+20+rnd()*200,y:30+rnd()*260,vx:-(40+rnd()*50),vy:20+rnd()*30,r:2+rnd()*2.2,life:0,max:7,rot:rnd()*6})
  }else if(ph==='bell'){
    p.lock=true;rd.bellT+=dt;
    if(!rd.b1&&rd.bellT>0.6){rd.b1=true;sfx.bell(.35);say(BELL1,()=>{rd.bellT=1.3})}
    if(rd.b1&&!dl.active&&!rd.b2&&rd.bellT>=1.3){rd.b2=true;sfx.bell(.9);rd.shake=.6;party.forEach(s=>s.face=1);say(BELL2,()=>{rd.step=4;p.lock=false;rd.blade=true;go('road','walk')})}
  }else if(ph==='toYard'){fadeT=1;if(T>1.2)beginYard()}
  if(!rd.blade&&p.anim==='idle')set('talk');
  updateParty(dt,true);
  let cx=p.x-W*0.4;if(rd.zoomK&&dl.active)cx=rd.zoomK[0]-W/2;
  camX+=(clamp(cx,0,RX.end+200)-camX)*Math.min(1,3*dt);
  if(rd.zoomK&&dl.active){zoomT=rd.zoomK[1];zf.x=W/2;zf.y=GROUND-100}else zoomT=1;
  barsT=dl.active?1:0;rd.shake=Math.max(0,(rd.shake||0)-dt);
}
/* ---------- scenery: painted forest (warm -> cold) + clue props ---------- */
function drawForestBG(){
  const A=BGI.forest_warm,Cc=BGI.forest_cold,pw=A.width,phh=A.height,y0=GROUND+10-Math.round(phh*0.81),i0=Math.floor(camX/pw);
  const tile=(img,x)=>{ctx.drawImage(img,x,y0,pw+1,phh);
    ctx.save();ctx.translate(0,y0);ctx.scale(1,-1);ctx.drawImage(img,x,0,pw+1,phh);ctx.restore();                  // canopy reflected upwards
    ctx.save();ctx.translate(0,y0+phh);ctx.scale(1,-1);ctx.drawImage(img,x,-phh,pw+1,phh);ctx.restore()};          // grass reflected downwards
  const plate=(img,alpha)=>{ctx.save();ctx.globalAlpha=alpha;
    for(let i=i0;i*pw-camX<W+2;i++){const x=i*pw-camX;
      if(i%2){ctx.save();ctx.translate(x+pw,0);ctx.scale(-1,1);tile(img,0);ctx.restore()}else tile(img,x)}
    ctx.restore()};
  plate(A,1);if(rd.mood>0.01)plate(Cc,clamp(rd.mood,0,1));
}
function drawClues(){
  const sx=x=>x-camX,spr=(img,x,base,sc)=>{const w=img.width*sc,h=img.height*sc;if(x+w<-40||x>W+40)return false;ctx.drawImage(img,x,base-h,w,h);return true};
  const B=GROUND+14;
  // clue 1: abandoned supplies and weapons
  let x=sx(RX.clue1);if(x>-400&&x<W+300){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x+140,B,150,9,0,0,7);ctx.fill();spr(BGI.prop_supplies,x,B+6,1.0)}
  // clue 2: broken watchtower
  x=sx(RX.clue2);if(x>-400&&x<W+300){ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x+130,B,140,10,0,0,7);ctx.fill();spr(BGI.prop_tower,x,B+8,1.0)}
  // clue 3: dead horse + footprints leading back toward the capital
  x=sx(RX.clue3);if(x>-600&&x<W+300){
    ctx.fillStyle='rgba(30,18,10,.5)';for(let r=0;r<2;r++)for(let i=0;i<26;i++){const fx_=x-300+i*17+(r?8:0);ctx.beginPath();ctx.ellipse(fx_,B+2+r*12,5,2.4,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(fx_-6,B+2+r*12,2.4,2,0,0,7);ctx.fill()}
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+135,B,130,8,0,0,7);ctx.fill();spr(BGI.prop_deadhorse,x,B+4,1.0)}
}
function forestOverlay(){
  const m=rd.mood||0;ctx.fillStyle='rgba(10,24,22,'+(0.04+0.14*m)+')';ctx.fillRect(0,0,W,H+200);
  for(let i=0;i<3;i++){const y=GROUND-70-i*46,off=(T*(10+i*6)+camX*(.2+i*.1))%W;const g=ctx.createLinearGradient(0,y-40,0,y+40);g.addColorStop(0,'rgba(190,215,210,0)');g.addColorStop(.5,'rgba(190,215,210,'+(0.03+m*0.1)+')');g.addColorStop(1,'rgba(190,215,210,0)');ctx.fillStyle=g;
    ctx.fillRect(-off,y-40,W,80);ctx.fillRect(W-off,y-40,W,80)}
}
