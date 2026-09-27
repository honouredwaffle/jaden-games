const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1100,height:700}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=6',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(1000);
  const log=await p.evaluate(()=>{
    const G=window.GRIND, P=G.player; G.setPause(true);
    // clear the street of cars so nothing occludes
    for(const c of G.cars) c.group.visible=false;
    if(G.traffic) for(const t of G.traffic) if(t.car) t.car.group.visible=false;
    for(const q of G.peds) q.group.visible=false;
    const src=G.peds.slice(0,5);
    const xs=[-2.7,-1.35,0,1.35,2.7];
    src.forEach((q,i)=>{ q.group.visible=true; q.pos.set(xs[i],0,0); q.group.position.set(xs[i],0,0);
      q.yaw=0; q.group.rotation.y=0; G.idleSkinned(q,1); q.group.updateMatrixWorld(true); });
    P.group.visible=true; P.pos.set(0,0,0); P.group.position.set(0,0,0); P.yaw=0; P.group.rotation.y=0;
    G.animateSkinned(P,0.6,0.25,0); P.group.updateMatrixWorld(true);
    const wp=new (G.THREE.Vector3)(); P.group.getWorldPosition(wp);
    const pedw=src.map(q=>{ const v=new (G.THREE.Vector3)(); q.group.getWorldPosition(v); return [+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)]; });
    G.camera.fov=36; G.camera.updateProjectionMatrix();
    G.camera.position.set(0,1.25,6.2); G.camera.lookAt(0,0.98,0);
    return { playerWorld:[+wp.x.toFixed(2),+wp.y.toFixed(2),+wp.z.toFixed(2)], peds:pedw, nVisible:src.length };
  });
  console.log('LOG', JSON.stringify(log));
  await p.waitForTimeout(300); await p.screenshot({path:OUT+'ingame_lineup.png'});
  // close-up portrait of center player
  await p.evaluate(()=>{ const G=window.GRIND; G.camera.fov=26; G.camera.updateProjectionMatrix();
    G.camera.position.set(0.05,1.42,1.9); G.camera.lookAt(0,1.28,0); });
  await p.waitForTimeout(200); await p.screenshot({path:OUT+'ingame_portrait.png'});
  console.log('ok');
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
