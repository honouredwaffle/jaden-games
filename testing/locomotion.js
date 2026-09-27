const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
const R=[]; const ok=(n,c,x='')=>R.push(`${c?'PASS':'FAIL'}  ${n}${x?'  '+x:''}`);
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:420,height:760}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/favicon|404/.test(m.text()))errs.push(m.text());});
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:25000});
  await p.waitForTimeout(700);

  const cyc=await p.evaluate(()=>{
    const G=window.GRIND,P=G.player,T=G.THREE,B=P.bones;
    const wy=n=>{ const v=new T.Vector3(); B[n].getWorldPosition(v); return v.y; };
    const run=(R,steps)=>{ const o=[]; for(let i=0;i<steps;i++){ const ph=i/steps*Math.PI*2;
      G.animateSkinned(P,ph,1,R); P.root.updateMatrixWorld(true); G.groundClampOne(P,false,0.045); P.root.updateMatrixWorld(true);
      o.push({ph:+ph.toFixed(2), L:wy('LeftToe_End'), R:wy('RightToe_End'), H:wy('Hips')}); } return o; };
    return { walk:run(0,24), sprint:run(1,24) };
  });
  const minMax=(a,k)=>({min:Math.min(...a.map(x=>x[k])),max:Math.max(...a.map(x=>x[k]))});
  const wL=minMax(cyc.walk,'L'), wR=minMax(cyc.walk,'R');
  const walkAlwaysGrounded=cyc.walk.every(f=>Math.min(f.L,f.R)<0.14);
  const sH=minMax(cyc.sprint,'H');
  ok('walk keeps a foot on the ground at all times', walkAlwaysGrounded, 'min toe L='+wL.min.toFixed(2)+' R='+wR.min.toFixed(2));
  ok('sprint bounce present', (sH.max-sH.min)>=0.012, 'run bob='+(sH.max-sH.min).toFixed(3)+'m');
  const sL=minMax(cyc.sprint,'L'); const wL2=minMax(cyc.walk,'L');
  ok('run swings the foot higher than the walk', (sL.max-sL.min)>(wL2.max-wL2.min)+0.15, 'run swing='+(sL.max-sL.min).toFixed(2)+' walk swing='+(wL2.max-wL2.min).toFixed(2));
  const wBob=minMax(cyc.walk,'H'); ok('walk bob is modest', (wBob.max-wBob.min)<=0.11, 'walk bob='+(wBob.max-wBob.min).toFixed(3)+'m');

  // animated skeleton really deforms the mesh? sample a skinned bone matrix over time
  const sk=await p.evaluate(()=>{ const G=window.GRIND,P=G.player,B=P.bones; const a=[];
    for(let i=0;i<8;i++){ G.animateSkinned(P,i,1,1); P.root.updateMatrixWorld(true); a.push(B['LeftLeg'].quaternion.toArray().map(v=>+v.toFixed(3)).join(',')); }
    return new Set(a).size; });
  ok('knee joint matrix changes across the cycle', sk>=5, 'distinct='+sk);
  console.log('WALK feet:', JSON.stringify(cyc.walk.map(f=>[+f.ph.toFixed(1), +f.L.toFixed(2), +f.R.toFixed(2)])));

  const shot=async(name,{mode,phase=0,dist=3.2,front=false})=>{
    await p.evaluate(({mode,phase,dist,front})=>{
      const G=window.GRIND,P=G.player; G.setPause(true);
      P.group.position.y=0; if(mode==='run') G.animateSkinned(P,phase,1,1);
      else if(mode==='walk') G.animateSkinned(P,phase,1,0);
      else if(mode==='jump'){ G.poseJumpSkinned(P,0.55,true); P.group.position.y=0.55; }
      else G.idleSkinned(P,0);
      const yaw=front?P.yaw:P.yaw+Math.PI/2;     // side-on for locomotion
      G.camera.position.set(P.pos.x+Math.sin(yaw)*dist, 1.35, P.pos.z+Math.cos(yaw)*dist);
      G.camera.lookAt(P.pos.x,1.05,P.pos.z);
    },{mode,phase,dist,front});
    await p.waitForTimeout(140);
    await p.screenshot({path:OUT+'grind_'+name+'.png'});
  };
  // clear stage
  await p.evaluate(()=>{ const G=window.GRIND,P=G.player;
    let best={x:-40,z:-36};
    P.pos.set(best.x,0,best.z); P.group.position.set(best.x,0,best.z); P.yaw=0;
    for(const c of G.cars) c.group.visible=false;
    if(G.traffic) for(const t of G.traffic) if(t.car) t.car.group.visible=false;
    for(const q of G.peds) if(q.group) q.group.visible=false;
  });
  await shot('cyc_walk',{mode:'walk',phase:Math.PI/2});
  await shot('cyc_run',{mode:'run',phase:Math.PI/2});
  await shot('cyc_run2',{mode:'run',phase:0});
  await shot('cyc_jump',{mode:'jump'});
  console.log(R.join('\n'));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none');
  console.log('SUMMARY:',R.filter(x=>x.startsWith('PASS')).length+'/'+R.length);
  await b.close();
})().catch(e=>{console.error('FAIL',e.stack||e.message);process.exit(1)});
