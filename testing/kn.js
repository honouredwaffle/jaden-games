const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage();
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:25000});
  await p.waitForTimeout(600);
  const r=await p.evaluate(()=>{
    const G=window.GRIND,P=G.player,T=G.THREE,B=P.bones;
    const reset=()=>{for(const k in B){B[k].quaternion.copy(B[k].userData.rest);B[k].position.copy(B[k].userData.restPos);}};
    const q=(n,ax,a)=>{const b=B[n]; b.quaternion.copy(b.userData.rest).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(ax==='X'?1:0,ax==='Y'?1:0,ax==='Z'?1:0),a));};
    const pos=n=>{P.root.updateMatrixWorld(true);const v=new T.Vector3();B[n].getWorldPosition(v);return v;};
    reset(); P.root.updateMatrixWorld(true);
    const k0=pos('LeftLeg').clone(), t0=pos('LeftToe_End').clone(), h0=pos('Hips').clone();
    const out={};
    for(const a of [1.2,-1.2]){
      reset(); q('LeftLeg','X',a); P.root.updateMatrixWorld(true);
      const k=pos('LeftLeg'), t=pos('LeftToe_End');
      out['kneeX'+a]= { toeRelZ:+(t.z-k.z).toFixed(2), toeRelY:+(t.y-k.y).toFixed(2), kneeLiftY:+(k.y-k0.y).toFixed(2) };
    }
    reset(); P.root.updateMatrixWorld(true);
    return {rest:{toeZ:+(t0.z-k0.z).toFixed(2), toeY:+(t0.y-k0.y).toFixed(2)}, ...out};
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
