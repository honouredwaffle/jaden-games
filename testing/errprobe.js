const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage();
  p.on('pageerror',e=>console.log('STACK>>', (e.stack||e.message).split('\n').slice(0,4).join(' | ').slice(0,400)));
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForTimeout(3000);
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
