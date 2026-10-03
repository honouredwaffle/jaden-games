const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(500);
  await p.screenshot({path:'testing/cc-menu.png'});
  await p.click('body'); await p.waitForTimeout(300);
  await p.evaluate(()=>window.CLASH.setSel(0)); await p.waitForTimeout(500);
  await p.screenshot({path:'testing/cc-select.png'});
  await p.keyboard.press('Enter'); await p.waitForTimeout(1600);
  const st = await p.evaluate(()=>{
    function px(x,y){ const d=ctx.getImageData(Math.round(x),Math.round(y),1,1).data; return [d[0],d[1],d[2]]; }
    let hits=0; for(let x=60;x<600;x+=2){ const q=px(x,38); if(q[0]>120&&q[1]<200&&q[2]<160&&q[0]>q[2]) hits++; }
    return {screen:window.CLASH.screen, p1:window.CLASH.p1.char.name, p2:window.CLASH.p2.char.name, barPixels:hits};
  });
  await p.screenshot({path:'testing/cc-fight.png'});
  console.log(JSON.stringify({st,errs}));
  await b.close();
})();
