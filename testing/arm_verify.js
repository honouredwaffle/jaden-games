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
    const rel=n=>{ const a=new T.Vector3(), c=new T.Vector3(); B[n].getWorldPosition(a); B['Hips'].getWorldPosition(c); return a.sub(c); };
    const rows=[];
    const rec=(label)=>{ P.root.updateMatrixWorld(true); const hL=rel('LeftHand'), hR=rel('RightHand'), fL=rel('LeftToe_End'), fR=rel('RightToe_End');
      rows.push({label, Lhand:{x:+hL.x.toFixed(2),y:+hL.y.toFixed(2),z:+hL.z.toFixed(2)}, Rhand:{x:+hR.x.toFixed(2),y:+hR.y.toFixed(2),z:+hR.z.toFixed(2)}, Ltoe:+fL.z.toFixed(2), Rtoe:+fR.z.toFixed(2)}); };
    G.idleSkinned(P,0); rec('idle');
    G.animateSkinned(P,0,1,0); rec('walk s=0');
    G.animateSkinned(P,Math.PI/2,1,0); rec('walk s=+1');
    G.animateSkinned(P,Math.PI,1,0); rec('walk s=0b');
    G.animateSkinned(P,3*Math.PI/2,1,0); rec('walk s=-1');
    G.animateSkinned(P,Math.PI/2,1,1); rec('run s=+1');
    return rows;
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
