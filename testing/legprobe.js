const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:600,height:400}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=2&cb='+Date.now(),{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(700);
  const out=await p.evaluate(()=>{
    const G=window.GRIND,T=G.THREE; const q=G.peds[0],B=q.bones;
    q.group.rotation.y=0; q.group.position.set(0,0,0); G.setPause(true);
    const wp=n=>{const v=new T.Vector3();B[n].getWorldPosition(v);return v;};
    const f=v=>[v.x.toFixed(2),v.y.toFixed(2),v.z.toFixed(2)].join(',');
    const L=[];
    for(const ph of [0, 1.0, 2.0, 3.14, 4.0, 5.0]){
      G.animateSkinned(q,ph,1.0,0.0); q.group.updateMatrixWorld(true);
      const kl=wp('LeftLeg'), kr=wp('RightLeg'), fl=wp('LeftFoot'), fr=wp('RightFoot');
      // knee world dir: knee->ankle, should point DOWN (+back for bend)
      const shin=wp('LeftToeBase')?null:null;
      const dL=wp('LeftToeBase').clone().sub(wp('LeftFoot'));
      L.push('ph='+ph.toFixed(1)+' kneeXgap='+Math.abs(kl.x-kr.x).toFixed(2)+' footXgap='+Math.abs(fl.x-fr.x).toFixed(2)
        +' footZ L='+fl.z.toFixed(2)+' R='+fr.z.toFixed(2)+' footY L='+fl.y.toFixed(2)+' R='+fr.y.toFixed(2));
    }
    // knee joint world direction (thigh vs shin) at a split phase
    G.animateSkinned(q,1.4,1.0,0.0); q.group.updateMatrixWorld(true);
    const thigh=wp('LeftLeg').clone().sub(wp('LeftUpLeg'));
    const shin=wp('LeftFoot').clone().sub(wp('LeftLeg'));
    L.push('thigh dir (hip->knee)='+f(thigh));
    L.push('shin  dir (knee->ankle)='+f(shin));
    return L.join('\n');
  });
  console.log(out);
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
