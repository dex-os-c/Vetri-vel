const cv=document.getElementById('c'),ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
const W=cv.width,H=cv.height,GROUND=470,WORLD=3600;
const M={"walk": {"CW": 186, "CH": 254, "AX": 74.8, "AY": 250.4, "cols": 8, "n": 33}, "run": {"CW": 236, "CH": 197, "AX": 127.60000000000001, "AY": 192.4, "cols": 10, "n": 20}, "idle": {"CW": 198, "CH": 208, "AX": 119.60000000000001, "AY": 204.8, "cols": 7, "n": 28}, "attack": {"CW": 272, "CH": 197, "AX": 158.4, "AY": 193.20000000000002, "cols": 7, "n": 34}};
/* ============ EASY TWEAK TABLE (every frame comes from your videos) ============
 scale : size on screen        ox/oy : nudge sprite (px, x forward / y up)
 speed : px/s he moves         stride: screen px he travels per full walk/run cycle
                                 (bigger = slower legs, smaller = faster legs)
 fps   : playback speed of idle / attack          loop: 'pingpong' | true | false
 step  : forward lunge during attack (px/s)       hold: frame used while jumping     */
const ANIMS={
  idle:  {sheet:'idle',  fps:12,loop:'pingpong',scale:0.70,ox:0,oy:0},
  walk:  {sheet:'walk',  speed:125,stride:172,scale:0.64,ox:0,oy:0},
  run:   {sheet:'run',   speed:290,stride:240,scale:0.70,ox:0,oy:0},
  jump:  {sheet:'run',   hold:4,scale:0.70,ox:0,oy:0},
  attack:{sheet:'attack',fps:36,loop:false,step:80,scale:0.70,ox:0,oy:0}
};
const IMG={};let loaded=0;const names=['idle','walk','run','attack'];
names.forEach(n=>{const i=new Image();i.onload=()=>{if(++loaded==names.length)requestAnimationFrame(loop)};
  i.src=(window.SHEETS&&window.SHEETS[n])||('assets/'+n+'.png');IMG[n]=i});
const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault()});
addEventListener('keyup',e=>keys[e.code]=false);
const p={x:240,y:GROUND,vy:0,face:1,anim:'idle',t:0,ph:0,air:false,atk:false};
let camX=0;
function set(a){if(p.anim!==a){p.anim=a;p.t=0}}
function update(dt){
  const left=keys.KeyA||keys.ArrowLeft,right=keys.KeyD||keys.ArrowRight,run=keys.ShiftLeft||keys.ShiftRight;
  const dir=(right?1:0)-(left?1:0);
  if((keys.KeyJ||keys.KeyX)&&!p.atk&&!p.air){p.atk=true;set('attack')}
  if((keys.KeyW||keys.ArrowUp||keys.Space)&&!p.air&&!p.atk){p.vy=-780;p.air=true}
  let mv=0;
  if(p.atk){const A=ANIMS.attack,f=p.t*A.fps,n=M.attack.n;if(dir)p.face=dir;if(f>n*0.1&&f<n*0.55)p.x+=p.face*A.step*dt}
  else if(dir){p.face=dir;mv=ANIMS[run?'run':'walk'].speed*dt;p.x+=dir*mv}
  p.x=Math.max(60,Math.min(WORLD-60,p.x));
  p.vy+=1900*dt;p.y+=p.vy*dt;if(p.y>=GROUND){p.y=GROUND;p.vy=0;p.air=false}
  p.t+=dt;
  if(p.atk){if(p.t*ANIMS.attack.fps>=M.attack.n){p.atk=false;set('idle')}}
  else if(p.air)set('jump');
  else if(dir){const k=run?'run':'walk';if(p.anim!==k)set(k);p.ph+=mv/ANIMS[k].stride}
  else set('idle');
}
function drawPlayer(){
  const a=ANIMS[p.anim],m=M[a.sheet],n=m.n;let f;
  if(p.anim==='walk'||p.anim==='run')f=Math.floor(p.ph*n)%n;
  else if(p.anim==='jump')f=a.hold;
  else{f=Math.floor(p.t*a.fps);
    if(a.loop==='pingpong'){const c=2*(n-1);f=f%c;if(f>=n)f=c-f}
    else f=a.loop?f%n:Math.min(f,n-1)}
  const dx=p.x-camX;
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(dx,GROUND+4,50*(1-(GROUND-p.y)/500),9,0,0,7);ctx.fill();
  ctx.save();ctx.translate(dx,p.y);ctx.scale(p.face*a.scale,a.scale);
  const cx=f%m.cols,cr=Math.floor(f/m.cols);
  ctx.drawImage(IMG[a.sheet],cx*m.CW,cr*m.CH,m.CW,m.CH,-m.AX+a.ox,-m.AY-a.oy,m.CW,m.CH);ctx.restore();
}
function bg(){
  const g=ctx.createLinearGradient(0,0,0,GROUND);g.addColorStop(0,'#2b1745');g.addColorStop(.55,'#b5473a');g.addColorStop(1,'#f2a65a');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ffd98a';ctx.beginPath();ctx.arc(720-camX*.03,300,70,0,7);ctx.fill();
  ctx.fillStyle='#5a2a3a';for(let i=-1;i<8;i++){const x=i*300-(camX*.2%300);ctx.beginPath();ctx.moveTo(x,GROUND);ctx.quadraticCurveTo(x+150,GROUND-120,x+300,GROUND);ctx.fill()}
  for(let i=0;i<6;i++){const bx=i*620+300-camX*.5;if(bx<-200||bx>W+200)continue;ctx.fillStyle='#2e1520';
    for(let t=0;t<8;t++){const w=170-t*18;ctx.fillRect(bx-w/2,GROUND-30-(t+1)*22,w,19)}
    ctx.fillRect(bx-9,GROUND-232,18,26);ctx.fillRect(bx-95,GROUND-30,190,30)}
  ctx.fillStyle='#3b2416';ctx.fillRect(0,GROUND,W,H-GROUND);ctx.fillStyle='#6b4326';ctx.fillRect(0,GROUND,W,6);
  ctx.fillStyle='#4a2d1b';for(let x=-(camX%80);x<W;x+=80)ctx.fillRect(x,GROUND+30,50,4);
}
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);
  camX+=((p.x-W/2)-camX)*Math.min(1,6*dt);camX=Math.max(0,Math.min(WORLD-W,camX));bg();drawPlayer();requestAnimationFrame(loop)}
