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
    const Y=n=>{const v=new T.Vector3();B[n].getWorldPosition(v);return v.y;};
    const resetAll=()=>{for(const k in B){B[k].quaternion.copy(B[k].userData.rest);B[k].position.copy(B[k].userData.restPos);}P.root.updateMatrixWorld(true);};
    resetAll(); const rest=Math.min(Y('LeftToe_End'),Y('RightToe_End'));
    const scan=(R)=>{ let mn=9,arg=0; for(let i=0;i<64;i++){const ph=i/64*Math.PI*2;G.animateSkinned(P,ph,1,R);P.root.updateMatrixWorld(true);const m=Math.min(Y('LeftToe_End'),Y('RightToe_End'));if(m<mn){mn=m;arg=ph;}} return {min:+mn.toFixed(3),at:+arg.toFixed(2)}; };
    return { restToe:+rest.toFixed(3), walk:scan(0), run:scan(1), mannequinMinY:+G.MANNEQUIN.minY.toFixed(3), rootY:+P.root.position.y.toFixed(3) };
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
