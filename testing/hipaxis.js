const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage();
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:25000});
  await p.waitForTimeout(600);
  const r=await p.evaluate(()=>{
    const G=window.GRIND,P=G.player,T=G.THREE,B=P.bones,H=B['Hips'];
    const wp=()=>{P.root.updateMatrixWorld(true);const v=new T.Vector3();H.getWorldPosition(v);return v;};
    const rest=H.userData.restPos.clone();
    const test=(dx,dy,dz)=>{ H.position.set(rest.x+dx,rest.y+dy,rest.z+dz); const v=wp(); H.position.copy(rest); return [+(v.x).toFixed(3),+(v.y).toFixed(3),+(v.z).toFixed(3)]; };
    H.position.copy(rest); const base=wp().toArray().map(v=>+v.toFixed(3));
    return { base, plusX:test(0.5,0,0), plusY:test(0,0.5,0), plusZ:test(0,0,0.5), restPos:rest.toArray().map(v=>+v.toFixed(3)) };
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
