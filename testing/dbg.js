const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage();
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:25000});
  await p.waitForTimeout(600);
  const r=await p.evaluate(()=>{
    const G=window.GRIND, P=G.player, T=G.THREE, B=P.bones;
    const W=n=>{ const v=new T.Vector3(); B[n].getWorldPosition(v); return [+v.x.toFixed(3),+v.y.toFixed(3),+v.z.toFixed(3)]; };
    const keys=Object.keys(B).filter(k=>/Hand|Toe|Hips|Shoulder|Arm|UpLeg/.test(k));
    const rest={}; for(const k in B) B[k].quaternion.copy(B[k].userData.rest);
    P.root.updateMatrixWorld(true);
    const before={ Hips:W('Hips'), LeftHand:W('LeftHand'), LeftToe_End:W('LeftToe_End'), LeftArm:W('LeftArm'), LeftShoulder:W('LeftShoulder') };
    G.idleSkinned(P,0); P.root.updateMatrixWorld(true);
    const after={ Hips:W('Hips'), LeftHand:W('LeftHand'), LeftToe_End:W('LeftToe_End'), LeftArm:W('LeftArm'), LeftShoulder:W('LeftShoulder') };
    return {keys, before, after, rootScale:P.root.scale.x, wrapPos:P.group.position.toArray().map(v=>+v.toFixed(2)), rootPos:P.root.position.toArray().map(v=>+v.toFixed(3))};
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
