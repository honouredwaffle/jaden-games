const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1000,height:640}});
  p.on('pageerror',e=>console.log('ERR',e.message.slice(0,150)));
  await p.goto('http://127.0.0.1:8951/grind.html',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.cars.length>3,null,{timeout:25000});
  await p.waitForTimeout(2500);
  await p.screenshot({path:OUT+'grind_natural.png'});
  // pose next to a parked car with the game's own camera
  await p.evaluate(()=>{ const G=window.GRIND, P=G.player;
    const c=G.cars.find(x=>!x.isPlayer); G.setPause(true);
    P.pos.set(c.pos.x+5, 0, c.pos.z+3); P.group.position.copy(P.pos); P.yaw=Math.atan2(c.pos.x-P.pos.x, c.pos.z-P.pos.z);
    G.cam.yaw=P.yaw+Math.PI; G.cam.pitch=0.30; G.cam.dist=8; });
  await p.waitForTimeout(400); await p.screenshot({path:OUT+'grind_natural2.png'});
  console.log('NAT ok');
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
