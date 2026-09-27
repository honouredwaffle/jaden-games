const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1000,height:640}});
  p.on('pageerror',e=>console.log('ERR',e.message.slice(0,150)));
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.cars.length>3,null,{timeout:25000});
  await p.waitForTimeout(600);
  // line up 3 parked cars in a clean open area for a hero shot
  await p.evaluate(()=>{ const G=window.GRIND; G.setPause(true);
    for(const q of G.peds) if(q.group) q.group.visible=false;
    for(const t of G.traffic) if(t.car) t.car.group.visible=false;
    const cars=G.cars.filter(c=>!c.isPlayer).slice(0,3);
    const kinds=['sedan','suv','sports'];
    let x=-6;
    cars.forEach((c,i)=>{ c.group.visible=true; c.pos.set(x,0,0); c.group.position.set(x,0,0); c.yaw=-0.7; c.group.rotation.y=-0.7; x+=7; });
    G.camera.fov=34; G.camera.updateProjectionMatrix();
    G.camera.position.set(1, 3.0, -12.5);
    G.camera.lookAt(1, 0.8, 0);
  });
  await p.waitForTimeout(250); await p.screenshot({path:OUT+'grind_cars_hero.png'});
  // single car side/3-4 close
  await p.evaluate(()=>{ const G=window.GRIND; const c=G.cars.filter(x=>!x.isPlayer)[0];
    c.pos.set(0,0,0); c.group.position.set(0,0,0); c.yaw=-0.6; c.group.rotation.y=-0.6;
    G.camera.fov=32; G.camera.updateProjectionMatrix();
    G.camera.position.set(4.4,1.7,-4.8); G.camera.lookAt(0,0.62,0); });
  await p.waitForTimeout(200); await p.screenshot({path:OUT+'grind_car_front.png'});
  console.log('SHOT ok');
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
