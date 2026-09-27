const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:600,height:400}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=3&cb='+Date.now(),{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(700);
  const out=await p.evaluate(()=>{
    const G=window.GRIND,T=G.THREE; const q=G.peds[0],B=q.bones; G.setPause(true);
    q.group.rotation.y=0; q.group.position.set(0,0,0);
    const wp=n=>{const v=new T.Vector3();B[n].getWorldPosition(v);return v;};
    const lowToe=()=>Math.min(wp('LeftToeBase').y,wp('RightToeBase').y);
    const L=['restToe='+(q.restToe||0).toFixed(3)+'  rest lowToe='+lowToe().toFixed(3)];
    let a=[9,-9], c=[9,-9];
    for(let i=0;i<24;i++){ const ph=i/24*2*Math.PI;
      // analytic only
      G.animateSkinned(q,ph,1.0,0.0); q.group.position.set(0,0,0); q.group.rotation.y=0; q.group.updateMatrixWorld(true);
      const l1=lowToe(); a[0]=Math.min(a[0],l1); a[1]=Math.max(a[1],l1);
      // + exact clamp
      G.groundClampOne(q,false,0.12); q.group.updateMatrixWorld(true);
      const l2=lowToe(); c[0]=Math.min(c[0],l2); c[1]=Math.max(c[1],l2);
    }
    L.push('WALK analytic-only lowToe: '+a[0].toFixed(3)+' .. '+a[1].toFixed(3));
    L.push('WALK +clamp        lowToe: '+c[0].toFixed(3)+' .. '+c[1].toFixed(3));
    // pelvis (Hips) height range with clamp
    let h=[9,-9];
    for(let i=0;i<24;i++){ const ph=i/24*2*Math.PI;
      G.animateSkinned(q,ph,1.0,0.0); q.group.position.set(0,0,0); q.group.rotation.y=0; q.group.updateMatrixWorld(true);
      G.groundClampOne(q,false,0.12); q.group.updateMatrixWorld(true);
      const y=wp('Hips').y; h[0]=Math.min(h[0],y); h[1]=Math.max(h[1],y);
    }
    L.push('WALK pelvis(Hips) worldY range: '+h[0].toFixed(3)+' .. '+h[1].toFixed(3)+'  (bob '+(h[1]-h[0]).toFixed(3)+'m)');
    return L.join('\n');
  });
  console.log(out);
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
