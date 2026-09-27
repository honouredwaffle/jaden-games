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
    const Y=n=>{ P.root.updateMatrixWorld(true); const v=new T.Vector3(); B[n].getWorldPosition(v); return +v.y.toFixed(3); };
    const resetAll=()=>{ for(const k in B){ B[k].quaternion.copy(B[k].userData.rest); B[k].position.copy(B[k].userData.restPos); } };
    resetAll(); const rest={hips:Y('Hips'),knee:Y('LeftLeg'),ank:Y('LeftFoot'),toe:Y('LeftToe_End'),grp:+P.group.position.y.toFixed(3),root:+P.root.position.y.toFixed(3)};
    const rows=[];
    for(const [label,fn] of [
      ['idle',()=>G.idleSkinned(P,0)],
      ['walk ph0',()=>G.animateSkinned(P,0,1,0)],
      ['walk ph3.14',()=>G.animateSkinned(P,Math.PI,1,0)],
      ['walk ph1.57',()=>G.animateSkinned(P,Math.PI/2,1,0)],
    ]){ fn(); rows.push({label, hips:Y('Hips'), kneeL:Y('LeftLeg'), ankL:Y('LeftFoot'), toeL:Y('LeftToe_End'), toeR:Y('RightToe_End'), hipsPos:B['Hips'].position.toArray().map(v=>+v.toFixed(2))}); }
    return {rest,rows};
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
