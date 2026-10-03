const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(500); await p.screenshot({path:'testing/cc-diff-menu.png'});
  await p.click('body'); await p.waitForTimeout(300); await p.screenshot({path:'testing/cc-diff-select.png'});
  console.log(JSON.stringify({errs})); await b.close();
})();
