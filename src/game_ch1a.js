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
/* ---------------- the five companions ---------------- */
let party=[],rd={};
function makeParty(){return [
  {id:'scout',k:'scout',off:-120,x:0,ph:0,mv:false,ph2:0},{id:'archer',k:'archer',off:110,x:0,ph:0,mv:false},
  {id:'young',k:'soldierA',off:190,x:0,ph:0.3,mv:false},{id:'shield',k:'shield',off:270,x:0,ph:0.6,mv:false},{id:'vet',k:'soldierB',off:350,x:0,ph:0.1,mv:false}]}
function updateParty(dt,follow){
  party.forEach(s=>{if(!follow)return;const t=p.x-s.off,prev=s.x;s.x+=(t-s.x)*Math.min(1,2.6*dt);const d=Math.abs(s.x-prev);s.mv=d>0.05;
    if(s.mv){const st=s.k==='scout'?ANIMS.msgRun.stride:ANIMS[s.k].stride;s.ph+=d/st;
      const q=Math.floor(s.ph*2);if(q!==s.pf){s.pf=q;if(rnd()<0.35)puff(s.x-10,GROUND,1)}}})}
function drawParty(){
  for(const s of party){const dx=s.x-camX;if(dx<-200||dx>W+200)continue;shadow(dx,GROUND,40);
    if(s.k==='scout'){if(s.mv)blit('msgRun',Math.floor((s.ph%1)*M.msgRun.n)%M.msgRun.n,dx,GROUND,s.face||1,ANIMS.msgRun.scale);else blit('msgStop',M.msgStop.n-1,dx,GROUND,s.face||1,ANIMS.msgStop.scale)}
    else{const n=M[s.k].n;blit(s.k,s.mv?Math.floor((s.ph%1)*n)%n:Math.floor((s.ph%1)*n)%n,dx,GROUND,s.face||1,ANIMS[s.k].scale)}}
}
/* ---------------- Part 1: the gate closes, the party gathers ---------------- */
function beginRoad(){
  scn='road';ph='gate';T=0;mode='scene';p.x=150;p.y=GROUND;p.face=1;p.lock=true;p.weary=false;p.talk=false;p.hurt=-1;p.dead=-1;p.atk=false;p.jp=null;set('idle');
  camX=0;zoom=zoomT=1;zf={x:W/2,y:GROUND-110};fade=1;fadeT=0;setBars(1);fx=[];dl.active=false;seed=9;
  party=makeParty();const px=[360,430,500,575,650];party.forEach((s,i)=>{s.x=px[[4,3,2,1,0][i]]});
  party[0].x=700;party[1].x=585;party[2].x=515;party[3].x=445;party[4].x=380;      // scout leads, veteran guards the rear
  rd={close:0,step:0,mood:0,pause:0,zoomK:null,blade:false,smile:0,bellT:0};sync();
}
function sceneEnd(){go('end','end');sync()}
/* ---------------- Part 2: the forest road ---------------- */
const RX={clue1:1450,clue2:2600,clue3:3750,bell:4300,end:4950};
function roadSay(lines,after){p.lock=true;say(lines,()=>{p.lock=false;if(after)after()})}
function updateRoad(dt){
  fadeT=0;rd.mood=clamp((p.x-1200)/3200,0,1)*0.8+(rd.step>=4?0.2:0);
  if(ph==='gate'){
    if(T<0.4)fadeT=1;
    const walkIn=p.x<780;
    if(walkIn&&T>0.5){p.x+=105*dt;p.face=1;set('walk');p.ph+=105*dt/ANIMS.walk.stride;p.moving=true;if(Math.floor(p.ph*2)!==p._pf){p._pf=Math.floor(p.ph*2);puff(p.x-14,GROUND,1)}}
    else if(!walkIn&&!p.lock0){p.lock0=true;set('idle')}
    if(p.x>250&&rd.close<1){if(rd.close===0)sfx.door();rd.close=Math.min(1,rd.close+dt/3.4)}
    if(!walkIn&&!dl.active&&!rd.said&&rd.close>=1){rd.said=true;p.talk=true;say(PART1,()=>{go('road','smile')})}
    camX=0;
  }else if(ph==='smile'){
    rd.smile=T;zf.x+=((party[4].x-camX)-zf.x)*Math.min(1,3*dt);zoomT=1.5;
    if(T>2.4){zoomT=1;go('road','walk');p.lock=false;p.talk=false;setBars(0);sync()}
  }else if(ph==='walk'){
    if(rd.step===0&&p.x>=RX.clue1){rd.step=1;roadSay(CLUE1,null);rd.zoomK=[RX.clue1+160,1.3]}
    else if(rd.step===1&&p.x>=RX.clue2){rd.step=2;roadSay(CLUE2,null);rd.zoomK=[RX.clue2+200,1.25]}
    else if(rd.step===2&&p.x>=RX.clue3){rd.step=3;roadSay(CLUE3,()=>{go('road','bell')});rd.zoomK=[RX.clue3+180,1.3]}
    else if(rd.step===4&&p.x>=RX.end){go('road','toYard');p.lock=true}
    if(!dl.active)rd.zoomK=null;
    // ambient: birds early, silence later
    rd.bt=(rd.bt||0)-dt;if(rd.bt<0){rd.bt=1.2+rnd()*3;const pr=1-rd.mood*1.4;if(rnd()<pr)sfx.bird();else if(rd.mood<0.8&&rnd()<.5)sfx.cricket()}
    if(rnd()<dt*(1.6-rd.mood))fx.push({k:'leaf',x:camX+W+20+rnd()*200,y:30+rnd()*260,vx:-(40+rnd()*50),vy:20+rnd()*30,r:2+rnd()*2.2,life:0,max:7,rot:rnd()*6})
  }else if(ph==='bell'){
    // metallic sound, the party turns, the bell rings again
    p.lock=true;rd.bellT+=dt;
    if(!rd.b1&&rd.bellT>0.6){rd.b1=true;sfx.bell(.35);say(BELL1,()=>{rd.bellT=1.3})}
    if(rd.b1&&!dl.active&&!rd.b2&&rd.bellT>=1.3){rd.b2=true;sfx.bell(.9);rd.shake=.6;party.forEach(s=>s.face=1);say(BELL2,()=>{rd.step=4;p.lock=false;rd.blade=true;p.weary=false;go('road','walk');rd.bellDone=true})}
    if(rd.bellT<1.3)rd.bellT+=0;
  }else if(ph==='toYard'){fadeT=1;if(T>1.2)beginYard()}
  updateParty(dt,ph!=='gate'&&ph!=='smile');
  // camera
  let cx=ph==='gate'||ph==='smile'?0:p.x-W*0.4;
  if(rd.zoomK&&dl.active)cx=rd.zoomK[0]-W/2;
  camX+=(clamp(cx,0,RX.end+200)-camX)*Math.min(1,3*dt);
  if(rd.zoomK&&dl.active){zoomT=rd.zoomK[1];zf.x=W/2;zf.y=GROUND-100}
  else if(ph!=='smile')zoomT=1;
  barsT=(['gate','smile'].includes(ph)||dl.active)?1:0;
  rd.shake=Math.max(0,(rd.shake||0)-dt);
}
/* ---------- scenery: gate, clues ---------- */
function drawGate(){
  const x=-camX;if(x<-380||x>W)return;ctx.save();ctx.translate(x,0);
  const gx=20,gw=300,top=GROUND-330;
  let g=ctx.createLinearGradient(0,top,0,GROUND);g.addColorStop(0,'#5a4636');g.addColorStop(1,'#33271f');ctx.fillStyle=g;ctx.fillRect(gx,top+60,gw,GROUND-top-60);
  // tower tiers
  for(let i=0;i<4;i++){const w=gw-30-i*46,h=34;ctx.fillStyle=i%2?'#4a3a2e':'#6b5442';ctx.fillRect(gx+(gw-w)/2,top+60-(i+1)*h,w,h-3);ctx.fillStyle='#d4a443';ctx.fillRect(gx+(gw-w)/2,top+60-(i+1)*h,w,3)}
  ctx.fillStyle='#e0b24a';ctx.beginPath();ctx.arc(gx+gw/2,top-82,10,0,7);ctx.fill();
  // doorway
  const dx0=gx+60,dw=180,dh=GROUND-top-130;ctx.fillStyle='#0d0705';ctx.beginPath();ctx.moveTo(dx0,GROUND);ctx.lineTo(dx0,top+160);ctx.quadraticCurveTo(dx0,top+120,dx0+dw/2,top+110);ctx.quadraticCurveTo(dx0+dw,top+120,dx0+dw,top+160);ctx.lineTo(dx0+dw,GROUND);ctx.fill();
  // doors (closing)
  const w=lerp(18,dw/2,ease(rd.close||0));
  for(const side of[-1,1]){const x0=side<0?dx0:dx0+dw-w;const dg=ctx.createLinearGradient(x0,0,x0+w,0);dg.addColorStop(0,'#4c2f1c');dg.addColorStop(1,'#33200f');ctx.fillStyle=dg;ctx.fillRect(x0,top+150,w,GROUND-top-150);
    ctx.fillStyle='#d4a443';for(let r=0;r<8;r++)for(let c=0;c<Math.max(1,Math.floor(w/22));c++)ctx.fillRect(x0+8+c*22,top+170+r*24,5,5)}
  // gold bands + base
  ctx.fillStyle='#d4a443';ctx.fillRect(gx,top+60,gw,6);ctx.fillRect(gx,GROUND-14,gw,6);ctx.fillStyle='#2a1d15';ctx.fillRect(gx-10,GROUND-8,gw+20,8);
  ctx.restore();
}
function drawClues(){
  const sx=(x)=>x-camX;
  // --- clue 1 : abandoned supplies and weapons ---
  let x0=sx(RX.clue1);if(x0>-400&&x0<W+200){
    const dark='#1c120d',wood='#6a4a2c',rim='rgba(255,190,110,.5)';
    ctx.save();ctx.translate(x0,GROUND);
    ctx.fillStyle=dark;ctx.beginPath();ctx.ellipse(120,2,170,10,0,0,7);ctx.fill();
    const crate=(x,w,h,rot)=>{ctx.save();ctx.translate(x,0);ctx.rotate(rot);ctx.fillStyle=wood;ctx.fillRect(0,-h,w,h);ctx.strokeStyle='#2c1c10';ctx.lineWidth=3;ctx.strokeRect(0,-h,w,h);ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(w,0);ctx.moveTo(w,-h);ctx.lineTo(0,0);ctx.stroke();ctx.strokeStyle=rim;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(1,-h+1);ctx.lineTo(w-1,-h+1);ctx.stroke();ctx.restore()};
    crate(10,44,38,-0.12);crate(70,38,30,0.35);crate(200,46,40,0.05);
    ctx.fillStyle='#8a7a52';ctx.beginPath();ctx.ellipse(150,-8,22,13,0.2,0,7);ctx.fill();ctx.fillStyle='#3a2a18';ctx.beginPath();ctx.ellipse(150,-8,15,7,0.2,0,7);ctx.fill();   // spilled pot
    ctx.fillStyle='#c9a24a';for(let i=0;i<7;i++){ctx.beginPath();ctx.arc(172+i*9+Math.sin(i)*6,-3+Math.cos(i*2)*3,3,0,7);ctx.fill()}   // grain
    const spear=(x,len,ang)=>{ctx.save();ctx.translate(x,-6);ctx.rotate(ang);ctx.strokeStyle='#4a3220';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);ctx.stroke();ctx.fillStyle='#b9c2cc';ctx.beginPath();ctx.moveTo(len,0);ctx.lineTo(len-18,-6);ctx.lineTo(len+16,0);ctx.lineTo(len-18,6);ctx.fill();ctx.restore()};
    spear(-30,130,-0.06);spear(120,120,0.1);spear(250,110,-0.18);
    ctx.fillStyle='#9aa4ae';ctx.beginPath();ctx.ellipse(250,-8,28,9,0.1,0,7);ctx.fill();ctx.strokeStyle='#d4a443';ctx.lineWidth=2;ctx.stroke();    // dropped shield
    ctx.fillStyle='#6a1f27';ctx.fillRect(300,-12,70,10);ctx.fillStyle='#8a2a34';ctx.fillRect(300,-12,70,3);   // bedroll
    ctx.restore()}
  // --- clue 2 : the broken watchtower ---
  x0=sx(RX.clue2);if(x0>-400&&x0<W+300){ctx.save();ctx.translate(x0,GROUND);
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(110,2,130,10,0,0,7);ctx.fill();
    const lg=ctx.createLinearGradient(0,-330,0,0);lg.addColorStop(0,'#2a1d14');lg.addColorStop(1,'#4a3524');ctx.fillStyle=lg;
    ctx.fillRect(40,-90,150,90);ctx.fillStyle='#5a4636';ctx.fillRect(40,-92,150,6);
    for(const lx of[56,164]){ctx.save();ctx.translate(lx,-90);ctx.fillStyle='#3a2918';ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(9,0);ctx.lineTo(6,-230);ctx.lineTo(-6,-230);ctx.fill();ctx.restore()}
    ctx.strokeStyle='#3a2918';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(56,-100);ctx.lineTo(164,-210);ctx.moveTo(164,-100);ctx.lineTo(56,-210);ctx.stroke();
    ctx.fillStyle='#2f2217';ctx.fillRect(34,-326,152,16);ctx.fillRect(40,-312,10,70);ctx.fillRect(170,-312,10,70);
    ctx.fillStyle='#2a1d14';ctx.beginPath();ctx.moveTo(30,-326);ctx.lineTo(70,-372);ctx.lineTo(96,-340);ctx.lineTo(130,-366);ctx.lineTo(160,-334);ctx.lineTo(190,-326);ctx.fill();   // broken roof
    ctx.strokeStyle='#8a7a62';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(110,-310);ctx.lineTo(110,-290);ctx.stroke();ctx.beginPath();ctx.arc(110,-286,4,0,7);ctx.stroke();   // empty bell hook
    ctx.save();ctx.translate(210,-6);ctx.rotate(0.06);ctx.strokeStyle='#5a3d22';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(120,-4);ctx.moveTo(0,-20);ctx.lineTo(120,-24);ctx.stroke();for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(i*18,0);ctx.lineTo(i*18,-20);ctx.stroke()}ctx.restore();   // ladder on the ground
    ctx.restore()}
  // --- clue 3 : the dead messenger horse ---
  x0=sx(RX.clue3);if(x0>-500&&x0<W+300){ctx.save();ctx.translate(x0,GROUND);
    ctx.strokeStyle='rgba(30,16,10,.55)';ctx.lineWidth=0;ctx.fillStyle='rgba(28,16,10,.5)';
    for(let r=0;r<2;r++)for(let i=0;i<24;i++){const fx_=-260+i*17+(r?8:0);ctx.beginPath();ctx.ellipse(fx_,10+r*12,5,2.5,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(fx_-6,10+r*12,2.5,2,0,0,7);ctx.fill()}   // tracks heading left
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(170,3,110,9,0,0,7);ctx.fill();
    const hg=ctx.createLinearGradient(0,-60,0,0);hg.addColorStop(0,'#4a3322');hg.addColorStop(1,'#2a1c12');ctx.fillStyle=hg;
    ctx.beginPath();ctx.ellipse(170,-26,86,30,0,0,7);ctx.fill();                               // body
    ctx.beginPath();ctx.moveTo(240,-40);ctx.quadraticCurveTo(290,-52,318,-30);ctx.lineTo(312,-14);ctx.quadraticCurveTo(284,-30,236,-18);ctx.fill();   // neck + head
    ctx.beginPath();ctx.ellipse(318,-24,16,9,-0.2,0,7);ctx.fill();
    ctx.strokeStyle='#2a1c12';ctx.lineWidth=7;ctx.lineCap='round';for(const l of[[110,-8,70,6],[134,-6,96,10],[220,-8,262,4],[244,-6,288,12]]){ctx.beginPath();ctx.moveTo(l[0],l[1]);ctx.lineTo(l[2],l[3]);ctx.stroke()}
    ctx.fillStyle='#6a1f27';ctx.fillRect(140,-58,56,14);ctx.fillStyle='#d4a443';ctx.fillRect(140,-58,56,3);   // saddle cloth
    ctx.fillStyle='#caa862';ctx.save();ctx.translate(186,-44);ctx.rotate(-0.5);ctx.fillRect(-4,-30,8,30);ctx.restore();     // empty message tube
    ctx.fillStyle='rgba(255,190,110,.35)';ctx.beginPath();ctx.ellipse(160,-52,60,5,0,0,7);ctx.fill();
    ctx.restore()}
}
function forestOverlay(){
  const m=rd.mood||0;ctx.fillStyle='rgba(14,32,24,'+(0.16+0.3*m)+')';ctx.fillRect(0,0,W,H+200);
  for(let i=0;i<3;i++){const y=GROUND-100-i*46,off=(T*(10+i*6)+camX*(.2+i*.1))%W;const g=ctx.createLinearGradient(0,y-40,0,y+40);g.addColorStop(0,'rgba(170,200,190,0)');g.addColorStop(.5,'rgba(170,200,190,'+(0.05+m*0.1)+')');g.addColorStop(1,'rgba(170,200,190,0)');ctx.fillStyle=g;
    ctx.fillRect(-off,y-40,W,80);ctx.fillRect(W-off,y-40,W,80)}
}
