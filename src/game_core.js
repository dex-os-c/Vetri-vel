/* ---------------- helpers ---------------- */
function set(a){if(p.anim!==a){p.anim=a;p.t=0}}
function blit(name,f,x,y,face,scale,alpha){
  const a=ANIMS[name],m=M[a.sheet];f=clamp(f|0,0,m.n-1);
  ctx.save();ctx.globalAlpha=alpha==null?1:alpha;ctx.translate(x,y);ctx.scale(face*(a.native||1)*scale,scale);
  ctx.drawImage(IMG[a.sheet],(f%m.cols)*m.CW,Math.floor(f/m.cols)*m.CH,m.CW,m.CH,-m.AX,-m.AY,m.CW,m.CH);ctx.restore();
}
function shadow(x,y,r,a){a=a==null?1:a;ctx.save();ctx.translate(x,y+3);ctx.scale(1,0.2);const g=ctx.createRadialGradient(0,0,r*0.1,0,0,r);g.addColorStop(0,'rgba(0,0,0,'+(.55*a)+')');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.restore()}
function pingpong(f,n){const c=2*(n-1),k=f%c;return k>=n?c-k:k}
/* ---------------- particles: dust puffs + drifting motes ---------------- */
function puff(x,y,dir){fx.push({k:'puff',x,y,vx:-dir*(8+rnd()*14),vy:-(4+rnd()*8),r:3+rnd()*3,life:0,max:.55+rnd()*.3})}
const MOTES=[];for(let i=0;i<46;i++)MOTES.push({x:rnd()*W,y:rnd()*H*0.85,s:.4+rnd()*1.2,r:.8+rnd()*1.8,ph:rnd()*6.28,v:6+rnd()*14});
function fxUpdate(dt){for(const f of fx){f.life+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.k==='puff')f.r+=dt*10;else if(f.k==='leaf'){f.rot+=dt*2.2;f.y+=Math.sin(f.life*3+f.rot)*18*dt}else if(f.k==='spark')f.vy+=500*dt}fx=fx.filter(f=>f.life<f.max);
  for(const m of MOTES){m.x+=m.v*dt*m.s;m.y+=Math.sin(T*.6+m.ph)*8*dt;if(m.x>W+10){m.x=-10;m.y=rnd()*H*0.85}}}
function fxDraw(){
  for(const f of fx){const k=1-f.life/f.max;
    if(f.k==='leaf'){ctx.save();ctx.translate(f.x-camX,f.y);ctx.rotate(f.rot);ctx.fillStyle='rgba(120,88,46,'+(.7*Math.min(1,k*2))+')';ctx.beginPath();ctx.ellipse(0,0,f.r*1.7,f.r*.8,0,0,7);ctx.fill();ctx.restore()}
    else if(f.k==='spark'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,220,150,'+k+')';ctx.beginPath();ctx.arc(f.x-camX,f.y,f.r,0,7);ctx.fill();ctx.restore()}
    else{ctx.fillStyle='rgba(176,138,102,'+k*0.32+')';ctx.beginPath();ctx.arc(f.x-camX,f.y,f.r,0,7);ctx.fill()}}
}
function motesDraw(col){ctx.save();ctx.globalCompositeOperation='lighter';
  for(const m of MOTES){const a=.14+.12*Math.sin(T*1.3+m.ph);ctx.fillStyle=col.replace('A',a.toFixed(3));ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,7);ctx.fill()}ctx.restore()}
/* ---------------- player ---------------- */
function updatePlayer(dt){
  const left=keys.KeyA||keys.ArrowLeft,right=keys.KeyD||keys.ArrowRight,run=keys.ShiftLeft||keys.ShiftRight;
  let dir=(right?1:0)-(left?1:0);const free=mode==='free',walkOK=free||(scn==='s1'&&ph==='walk')||(scn==='road'&&ph==='walk');
  if(p.lock||!walkOK)dir=0;
  if(mode==='scene'&&dir<0)dir=0;
  p.vy+=1900*dt;p.y+=p.vy*dt;let landed=false;if(p.y>=GROUND){if(p.air)landed=true;p.y=GROUND;p.vy=0;p.air=false}
  if(p.dead>=0){p.dead+=dt;if(p.dead>M.fall.n/24+3.6){p.dead=-1;p.talk=false;set('idle')}return}
  if(p.hurt>=0){p.hurt+=dt;const A=ANIMS.hurt;if(p.hurt<0.4)p.x-=p.face*A.knock*dt;if(p.hurt*A.fps>=M.hurt.n){p.hurt=-1;set('idle')}p.t+=dt;return}
  const J=ANIMS.jump;
  if(free){
    if((keys.KeyW||keys.ArrowUp||keys.Space)&&!p.air&&!p.atk&&!p.jp){p.jp='pre';p.jt=0}
    if(p.jp==='pre'){p.jt+=dt;dir=0;if(p.jt>=J.preT){p.vy=-780;p.air=true;p.jp='air';p.jt=0}}
    else if(p.jp==='air'&&landed){p.jp='post';p.jt=0}
    else if(p.jp==='post'){p.jt+=dt;if(p.jt>=J.postT)p.jp=null}
    if((keys.KeyJ||keys.KeyX)&&!p.atk&&!p.air&&!p.jp){p.atk=true;p.talk=false;set('attack')}
  }
  const wk=p.weary?'weary':'walk',rn=(free||scn==='road')&&run&&!p.weary;let mv=0;
  if(p.atk){const A=ANIMS.attack,f=p.t*A.fps,n=M.attack.n;if(dir)p.face=dir;if(f>n*0.1&&f<n*0.55)p.x+=p.face*80*dt}
  else if(dir){p.face=dir;p.talk=false;mv=ANIMS[rn?'run':wk].speed*dt;p.x+=dir*mv}
  p.x=clamp(p.x,60,WORLD-60);p.t+=dt;
  if(p.atk){if(p.t*ANIMS.attack.fps>=M.attack.n){p.atk=false;set('idle')}}
  else if(p.jp)set('jump');
  else if(dir){const k=rn?'run':wk;if(p.anim!==k)set(k);if(!p.air)p.ph+=mv/ANIMS[k].stride}
  else set(p.talk?'talk':'idle');
  p.moving=!!dir&&mv>0;
  if(p.moving&&!p.air&&Math.floor(p.ph*2)!==p._pf){p._pf=Math.floor(p.ph*2);puff(p.x-p.face*14,GROUND,p.face)}
}
function frameFor(a,m,n){
  if(['walk','run','weary'].includes(p.anim))return Math.floor(p.ph*n)%n;
  if(p.anim==='jump'){if(p.jp==='pre')return Math.min(a.pre[1],a.pre[0]+Math.floor(p.jt/a.preT*(a.pre[1]-a.pre[0])));
    if(p.jp==='post')return Math.min(a.post[1],a.post[0]+Math.floor(p.jt/a.postT*(a.post[1]-a.post[0])));
    const pr=clamp((p.vy+780)/1560,0,1);return a.air[0]+Math.round(pr*(a.air[1]-a.air[0]))}
  const f=Math.floor(p.t*a.fps);
  if(a.loop==='pingpong')return pingpong(f,n);
  return a.loop?f%n:Math.min(f,n-1);
}
function drawPlayer(){
  const dx=p.x-camX;let name=p.anim,f,alpha=1;
  if(p.dead>=0){name='fall';const n=M.fall.n,d=p.dead;f=Math.min(Math.floor(d*24),n-1);
    const hold=n/24;alpha=d<hold+1.6?1:Math.max(0,1-(d-hold-1.6)/0.9);if(d>hold+2.7){name='idle';f=0;alpha=Math.min(1,(d-hold-2.7)*1.2)}}
  else if(p.hurt>=0){name='hurt';f=Math.min(Math.floor(p.hurt*24),M.hurt.n-1)}
  const a=ANIMS[name],m=M[a.sheet];if(f===undefined)f=frameFor(a,m,m.n);
  shadow(dx,GROUND,50*(1-(GROUND-p.y)/500)*(p.dead>=0?0.6:1),alpha);
  blit(name,f,dx,p.y,p.face,a.scale,alpha);
}
/* ---------------- crowd ---------------- */
function makeCrowd(){const a=[];const kinds=['soldierA','archer','shield','soldierB','archer','shield','soldierA','shield','archer'];
  for(let i=0;i<40;i++){const bearer=(i===7||i===19||i===31),row=bearer?0:i%3,k=bearer?'bearer':kinds[Math.floor(rnd()*kinds.length)];
    a.push({k,off:120+i*24+rnd()*30,row,rate:2.0+rnd()*2.0,sc:(0.92+rnd()*0.14)*(1-0.07*row),ph:rnd(),sm:0.9+rnd()*0.2,x:0,mv:false,pf:0})}return a}
function updateCrowd(dt){sol.forEach(s=>{const t=p.x-s.off;const prev=s.x;s.x+=(t-s.x)*Math.min(1,s.rate*dt);
  const d=s.x-prev;s.mv=Math.abs(d)>0.04;if(s.mv){s.ph+=Math.abs(d)/(ANIMS[s.k].stride*s.sm);
    const q=Math.floor(s.ph*2);if(q!==s.pf){s.pf=q;if(s.row===0&&Math.abs(s.x-camX-W/2)<W/2+60&&rnd()<0.5)puff(s.x-12,GROUND-s.row*9,1)}}})}
function drawSoldiers(){
  for(let row=2;row>=0;row--){
    for(const s of sol){if(s.row!==row)continue;const a=ANIMS[s.k],n=M[s.k].n,dx=s.x-camX;if(dx<-220||dx>W+220)continue;
      const y=GROUND-row*9;shadow(dx,y,36*s.sc,0.8);
      blit(s.k,Math.floor((s.ph%1)*n)%n,dx,y,1,a.scale*s.sc,row===2?0.88:row===1?0.94:1)}
  }
}
