const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage();
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:25000});
  await p.waitForTimeout(600);
  const r=await p.evaluate(()=>{
    const G=window.GRIND, P=G.player, T=G.THREE;
    const bone=n=>{ let o=null; P.root.traverse(x=>{ if(x.isBone && x.name.replace(/^mixamorig[0-9]*:?/,'')===n) o=x; }); return o; };
    const wx=o=>{ const v=new T.Vector3(); o.getWorldPosition(v); return v; };
    const res=[];
    const Larm=bone('LeftArm'), Lfa=bone('LeftForeArm'), Lhand=bone('LeftHand'), hips=bone('Hips');
    const LUP=bone('LeftUpLeg'), Lleg=bone('LeftLeg'), Lfoot=bone('LeftFoot'), Ltoe=bone('LeftToe_End');
    const q0={}; for(const k of ['LeftArm','RightArm','LeftForeArm','RightForeArm']) q0[k]=bone(k).quaternion.clone();
    for(const hang of [1.18,1.30,1.45,1.57,1.70]){
      for(const k in q0) bone(k).quaternion.copy(q0[k]);
      Larm.quaternion.copy(q0.LeftArm).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0), hang));
      Lfa.quaternion.copy(q0.LeftForeArm).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0), 0.30));
      P.root.updateMatrixWorld(true);
      const h=wx(Lhand), hp=wx(hips);
      res.push({hang, dx:+(h.x-hp.x).toFixed(3), dy:+(h.y-hp.y).toFixed(3), dz:+(h.z-hp.z).toFixed(3)});
    }
    // leg: default stride foot heights (is the planted foot near the ground?)
    const out2=[];
    for(const ph of [0,1.57,3.14,4.71]){
      G.animateSkinned(P,ph,1,0); P.root.updateMatrixWorld(true);
      out2.push({ph:+ph.toFixed(2), toeL:+wx(Ltoe).y.toFixed(3), toeR:+wx(bone('RightToe_End')).y.toFixed(3),
                 footL:+wx(Lfoot).y.toFixed(3)});
    }
    return {arms:res, feet:out2, groundY:+wx(Ltoe).y.toFixed(3)};
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
