const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1000,height:640}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=6&cb='+Date.now(),{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(1000);
  await p.evaluate(()=>{
    const G=window.GRIND,T=G.THREE,P=G.player; G.setPause(true);
    for(const c of G.cars) c.group.visible=false;
    if(G.traffic) for(const t of G.traffic) if(t.car) t.car.group.visible=false;
    for(const q of G.peds) q.group.visible=false;
    // one walking ped facing camera + player beside him
    const A=G.peds[0], Bp=G.peds[1];
    A.group.visible=true; A.pos.set(-0.9,0,0); A.group.position.set(-0.9,0,0); A.yaw=0; A.group.rotation.y=0;
    Bp.group.visible=true; Bp.pos.set(0.9,0,0); Bp.group.position.set(0.9,0,0); Bp.yaw=0; Bp.group.rotation.y=0;
    P.group.visible=true; P.pos.set(0,0,-0.2); P.group.position.set(0,0,-0.2); P.yaw=0; P.group.rotation.y=0;
    G.animateSkinned(A, 1.3, 1.0, 0.0);
    G.animateSkinned(Bp, 0.6, 1.0, 1.0);
    G.animateSkinned(P, 1.3, 1.0, 0.0);
    for(const e of [A,Bp,P]) e.group.updateMatrixWorld(true);
    G.camera.fov=34; G.camera.updateProjectionMatrix();
    G.camera.position.set(0.2,1.30,5.4); G.camera.lookAt(0,0.95,0);
  });
  await p.waitForTimeout(250); await p.screenshot({path:OUT+'arms_front.png'});
  // side view of the walking player
  await p.evaluate(()=>{
    const G=window.GRIND,P=G.player;
    G.camera.fov=32; G.camera.updateProjectionMatrix();
    G.camera.position.set(4.0,1.2,0.4); G.camera.lookAt(0,0.95,0);
  });
  await p.waitForTimeout(200); await p.screenshot({path:OUT+'arms_side.png'});
  console.log('ok');
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
