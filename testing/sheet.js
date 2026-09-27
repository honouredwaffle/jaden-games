const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:300,height:460}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:25000});
  await p.waitForTimeout(700);
  await p.evaluate(()=>{ const G=window.GRIND,P=G.player; G.setPause(true);
    P.pos.set(-40,0,-36); P.group.position.set(-40,0,-36); P.yaw=0;
    for(const c of G.cars) c.group.visible=false;
    if(G.traffic) for(const t of G.traffic) if(t.car) t.car.group.visible=false;
    for(const q of G.peds) if(q.group) q.group.visible=false;
    G.camera.fov=34; G.camera.updateProjectionMatrix();
  });
  const frames=[];
  for(let i=0;i<6;i++){
    const ph=i/6*Math.PI*2;
    await p.evaluate((ph)=>{ const G=window.GRIND,P=G.player;
      P.group.position.y=0; G.animateSkinned(P,ph,1,1); P.root.updateMatrixWorld(true); G.groundClampOne(P,false,0.008);
      const yaw=P.yaw+Math.PI/2;
      G.camera.position.set(P.pos.x+Math.sin(yaw)*3.0, 1.30, P.pos.z+Math.cos(yaw)*3.0);
      G.camera.lookAt(P.pos.x,1.00,P.pos.z);
    }, ph);
    await p.waitForTimeout(120);
    const f=OUT+'sheet_run_'+i+'.png'; frames.push(f); await p.screenshot({path:f});
  }
  for(let i=0;i<4;i++){
    const ph=i/4*Math.PI*2;
    await p.evaluate((ph)=>{ const G=window.GRIND,P=G.player; P.group.position.y=0; G.animateSkinned(P,ph,1,0); P.root.updateMatrixWorld(true); G.groundClampOne(P,false,0.045);
      const yaw=P.yaw+Math.PI/2; G.camera.position.set(P.pos.x+Math.sin(yaw)*3.0,1.30,P.pos.z+Math.cos(yaw)*3.0); G.camera.lookAt(P.pos.x,1.00,P.pos.z); }, ph);
    await p.waitForTimeout(120);
    const f=OUT+'sheet_walk_'+i+'.png'; frames.push(f); await p.screenshot({path:f});
  }
  console.log('frames:',frames.length,'errors:',errs.length?errs.join('|'):'none');
  await b.close();
})().catch(e=>{console.error('FAIL',e.stack||e.message);process.exit(1)});
