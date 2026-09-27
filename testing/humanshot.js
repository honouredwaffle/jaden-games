const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1000,height:680}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=6',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(1200);
  // put 4 NPCs + the player in a row facing the camera; freeze everything
  await p.evaluate(()=>{ const G=window.GRIND,P=G.player; G.setPause(true);
    for(const q of G.peds) if(q.group) q.group.visible=false;
    const src=G.peds.slice(0,4);
    const xs=[-2.4,-0.8,0.8,2.4];
    src.forEach((q,i)=>{ q.group.visible=true; q.pos.set(xs[i],0,0); q.group.position.set(xs[i],0,0);
      q.yaw=0; q.group.rotation.y=0; G.idleSkinned(q,1); });
    P.pos.set(0,0,0); P.group.position.set(0,0,0); P.yaw=0; P.group.rotation.y=0; G.animateSkinned(P,0.6,0.3,0);
    // manual camera so nothing clips
    G.camera.fov=34; G.camera.updateProjectionMatrix();
    G.camera.position.set(0,1.35,6.4); G.camera.lookAt(0,1.0,0);
  });
  await p.waitForTimeout(250); await p.screenshot({path:OUT+'ingame_crowd.png'});
  // portrait of the player up close
  await p.evaluate(()=>{ const G=window.GRIND,P=G.player;
    G.camera.fov=30; G.camera.updateProjectionMatrix();
    G.camera.position.set(0.0,1.45,2.2); G.camera.lookAt(0,1.3,0); });
  await p.waitForTimeout(200); await p.screenshot({path:OUT+'ingame_player2.png'});
  console.log('ok');
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
