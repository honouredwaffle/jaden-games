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
    const rel=n=>{const a=new T.Vector3(),c=new T.Vector3();B[n].getWorldPosition(a);B['Hips'].getWorldPosition(c);return {z:+(a.z-c.z).toFixed(2), y:+(a.y-c.y).toFixed(2)};};
    const out=[];
    for(let i=0;i<12;i++){ const ph=i/12*Math.PI*2;
      G.animateSkinned(P,ph,1,1); P.root.updateMatrixWorld(true); G.groundClampOne(P,false,0.008); P.root.updateMatrixWorld(true);
      const kneeL=rel('LeftLeg'), toeL=rel('LeftToe_End'); const toeX=(()=>{const a=new T.Vector3(),c=new T.Vector3(),d=new T.Vector3();B['LeftToe_End'].getWorldPosition(a);B['RightToe_End'].getWorldPosition(d);B['Hips'].getWorldPosition(c);return +(a.x-d.x).toFixed(2);})();
      out.push({ph:+ph.toFixed(2), kneeZ:kneeL.z, kneeY:kneeL.y, toeZ:toeL.z, toeY:toeL.y, footX:toeX});
    }
    return out;
  });
  const hdr='ph    kneeZ  kneeY  toeZ   toeY   footX'; console.log(hdr);
  for(const s of r) console.log(String(s.ph).padEnd(6), String(s.kneeZ).padEnd(7), String(s.kneeY).padEnd(6), String(s.toeZ).padEnd(6), String(s.toeY).padEnd(7), s.footX);
  const maxKneeFwd=Math.max(...r.map(x=>x.kneeZ)), maxToeFwd=Math.max(...r.map(x=>x.toeZ));
  const maxKneeUp=Math.max(...r.map(x=>x.kneeY)), minToe=Math.min(...r.map(x=>x.toeY));
  console.log('\nLIMITS: knee max forward z='+maxKneeFwd+'  knee max height y='+maxKneeUp+'  toe max forward z='+maxToeFwd+'  toe lowest y='+minToe);
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
