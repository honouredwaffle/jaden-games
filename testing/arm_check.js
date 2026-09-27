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
    const hand=(name)=>{ let o=null; P.root.traverse(n=>{ if(n.isBone && n.name.replace(/^mixamorig[0-9]*:?/,'')===name) o=n; }); const v=new T.Vector3(); if(o) o.getWorldPosition(v); return v; };
    const hip=()=>{ let o=null; P.root.traverse(n=>{ if(n.isBone && n.name.replace(/^mixamorig[0-9]*:?/,'')==='Hips') o=n; }); const v=new T.Vector3(); if(o) o.getWorldPosition(v); return v; };
    const out=[];
    for(const ph of [0, Math.PI/2, Math.PI, 3*Math.PI/2]){
      G.idleSkinned(P,0); const h0=[hand('LeftHand'),hand('RightHand')]; const p0=hip();
      G.animateSkinned(P,ph,1,0); P.root.updateMatrixWorld(true);
      const hL=hand('LeftHand'), hR=hand('RightHand'); const p1=hip();
      out.push({ph:+ph.toFixed(2),
        L:{dx:+(hL.x-p1.x).toFixed(3), dz:+(hL.z-p1.z).toFixed(3)},
        R:{dx:+(hR.x-p1.x).toFixed(3), dz:+(hR.z-p1.z).toFixed(3)}});
    }
    // also a leg check: foot fwd/back + ground contact during stride
    const foot=(name)=>{ let o=null; P.root.traverse(n=>{ if(n.isBone && n.name.replace(/^mixamorig[0-9]*:?/,'')===name) o=n; }); const v=new T.Vector3(); if(o) o.getWorldPosition(v); return v; };
    const legs=[];
    for(const ph of [0, Math.PI/2, Math.PI, 3*Math.PI/2]){
      G.animateSkinned(P,ph,1,0); P.root.updateMatrixWorld(true);
      const fL=foot('LeftToe_End'), fR=foot('RightToe_End');
      legs.push({ph:+ph.toFixed(2), Lz:+fL.z.toFixed(3), Rz:+fR.z.toFixed(3)});
    }
    return {arms:out, legs, pelvisY:+hip().y.toFixed(3)};
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
