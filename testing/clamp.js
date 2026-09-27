const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage();
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:25000});
  await p.waitForTimeout(700);
  const r=await p.evaluate(()=>{
    const G=window.GRIND,P=G.player,T=G.THREE,B=P.bones;
    const out={restToe:+P.restToe.toFixed(3)};
    const scan=(R,amt)=>{ let mn=9,mx=-9; for(let i=0;i<48;i++){ const ph=i/48*Math.PI*2;
      G.animateSkinned(P,ph,amt,R); P.root.updateMatrixWorld(true); G.groundClampOne(P,false); P.root.updateMatrixWorld(true);
      const a=new T.Vector3(),c=new T.Vector3(); B['LeftToe_End'].getWorldPosition(a); B['RightToe_End'].getWorldPosition(c);
      const m=Math.min(a.y,c.y); mn=Math.min(mn,m); mx=Math.max(mx,m); } return {min:+mn.toFixed(3),max:+mx.toFixed(3)}; };
    out.walk=scan(0,1); out.run=scan(1,1); out.idleHalf=scan(0,0.1);
    // live-frame check: does the clamp survive a real frame (loop overrides?)? sample the actual player toe after a frame
    return out;
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
