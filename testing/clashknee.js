const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);
  // render the walk pose in isolation at 8 phases onto a clean canvas, and record knee angle formula
  const res = await p.evaluate(()=>{
    const c=CHARS[0]; // goku
    const out=[];
    for(let i=0;i<8;i++){
      const a = (i/8)*Math.PI*2;
      const legs=[];
      for(const L of [{ph:0},{ph:Math.PI}]){
        const sw=Math.sin(a+L.ph), lift=Math.max(0,Math.cos(a+L.ph));
        const thigh=sw*0.52;
        const knee=-(0.30+0.95*Math.max(0,-sw)) - 0.55*lift;
        legs.push({thigh:+thigh.toFixed(2), knee:+knee.toFixed(2)});
      }
      out.push(legs);
    }
    return out;
  });
  console.log('phase  leg0(thigh,knee)   leg1(thigh,knee)');
  res.forEach((r,i)=>console.log(String(i).padEnd(6), JSON.stringify(r[0]).padEnd(22), JSON.stringify(r[1])));
  // now screenshot fight while walking
  await p.evaluate(()=>window.CLASH.setSel(0));
  await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  await p.keyboard.press('Enter'); await p.waitForTimeout(1300);
  await p.keyboard.down('KeyD');
  for(let i=0;i<4;i++){ await p.waitForTimeout(110); await p.screenshot({path:`testing/cc-walk-${i}.png`}); }
  await p.keyboard.up('KeyD');
  console.log('errs', JSON.stringify(errs));
  await b.close();
})();
