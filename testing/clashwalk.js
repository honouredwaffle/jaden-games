const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);
  await p.evaluate(()=>{ window.CLASH.setSel(0); });
  await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  await p.keyboard.press('Enter'); await p.waitForTimeout(1300);

  // instrument: capture knee angles while walking
  const data = await p.evaluate(async()=>{
    const P1=window.CLASH.p1;
    const samples=[];
    // force walk by holding D
    return new Promise(res=>{
      let n=0;
      const iv=setInterval(()=>{
        P1.state=1; // WALK pose
        samples.push({anim:+P1.anim.toFixed(2), vx:+P1.vx.toFixed(0)});
        if(++n>=12){ clearInterval(iv); res(samples); }
      },60);
    });
  });
  // capture actual pixel frames while walking
  await p.keyboard.down('KeyD');
  const shots=[];
  for(let i=0;i<4;i++){ await p.waitForTimeout(120); await p.screenshot({path:`testing/cc-walk-${i}.png`}); }
  await p.keyboard.up('KeyD');
  const st = await p.evaluate(()=>({anim:window.CLASH.p1.anim.toFixed(2), screen:window.CLASH.screen}));
  console.log(JSON.stringify({errs, st, moved:data[data.length-1]},null,1));
  await b.close();
})();
