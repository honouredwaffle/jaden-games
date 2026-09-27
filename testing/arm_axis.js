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
    const wx=o=>{ const v=new T.Vector3(); o.getWorldPosition(v); B['Hips'].getWorldPosition(v2); return v.clone(); };
    const v2=new T.Vector3();
    const rel=o=>{ const a=new T.Vector3(), c=new T.Vector3(); o.getWorldPosition(a); B['Hips'].getWorldPosition(c); return a.sub(c); };
    const set=(name,ax,ang)=>{ const b=B[name]; b.quaternion.copy(b.userData.rest).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(ax==='X'?1:0,ax==='Y'?1:0,ax==='Z'?1:0),ang)); };
    const reset=()=>{ for(const k in B) B[k].quaternion.copy(B[k].userData.rest); P.root.updateMatrixWorld(true); };
    const out={};
    // arm axes
    const armAxes={};
    for(const ax of ['X','Y','Z']){
      reset(); set('LeftArm',ax,0.6); P.root.updateMatrixWorld(true);
      const h=rel(B['LeftHand']);
      armAxes[ax]={dx:+h.x.toFixed(3),dy:+h.y.toFixed(3),dz:+h.z.toFixed(3)};
    }
    // where does the arm sit in the REST pose?
    reset(); const rest=rel(B['LeftHand']);
    // leg axes
    const legAxes={};
    for(const ax of ['X','Y','Z']){
      reset(); set('LeftUpLeg',ax,0.6); P.root.updateMatrixWorld(true);
      const t=rel(B['LeftToe_End']);
      legAxes[ax]={dx:+t.x.toFixed(3),dy:+t.y.toFixed(3),dz:+t.z.toFixed(3)};
    }
    reset(); const restToe=rel(B['LeftToe_End']);
    // how far down is the hand from hips in rest?
    return { armAxes, restHand:{dx:+rest.x.toFixed(3),dy:+rest.y.toFixed(3),dz:+rest.z.toFixed(3)},
             legAxes, restToe:{dx:+restToe.x.toFixed(3),dy:+restToe.y.toFixed(3),dz:+restToe.z.toFixed(3)} };
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
