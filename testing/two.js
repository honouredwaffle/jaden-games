const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:520,height:640}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:25000});
  await p.waitForTimeout(700);
  await p.evaluate(()=>{ const G=window.GRIND,P=G.player; G.setPause(true);
    P.pos.set(-40,0,-36); P.group.position.set(-40,0,-36); P.yaw=0;
    for(const c of G.cars) c.group.visible=false;
    if(G.traffic) for(const t of G.traffic) if(t.car) t.car.group.visible=false;
    for(const q of G.peds) if(q.group) q.group.visible=false;
    G.camera.fov=40; G.camera.updateProjectionMatrix(); });
  const shot=async(name,ph,R)=>{
    await p.evaluate(({ph,R})=>{ const G=window.GRIND,P=G.player;
      P.group.position.y=0; G.animateSkinned(P,ph,1,R); P.root.updateMatrixWorld(true); G.groundClampOne(P,false,R>0.5?0.008:0.045);
      const yaw=P.yaw-Math.PI/2;   // camera on the other side (character's left)
      G.camera.position.set(P.pos.x+Math.sin(yaw)*3.4, 1.35, P.pos.z+Math.cos(yaw)*3.4);
      G.camera.lookAt(P.pos.x,1.05,P.pos.z); },{ph,R});
    await p.waitForTimeout(130); await p.screenshot({path:OUT+name+'.png'});
  };
  await shot('t_run_a',1.047,1);
  await shot('t_run_b',4.189,1);
  console.log('ok'); await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
