const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(500);
  await p.evaluate(()=>{ window.CLASH.setSel(0); });
  await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  const info = await p.evaluate(()=>{
    const c=document.querySelector('canvas');
    const g=c.getContext('2d');
    const dpr = c.width/c.getBoundingClientRect().width;
    function px(x,y){ const d=g.getImageData(Math.round(x*dpr),Math.round(y*dpr),1,1).data; return [d[0],d[1],d[2]]; }
    const W=c.getBoundingClientRect().width;
    // sample along left health bar (y~30) and right
    const leftBar=px(W*0.06,30), rightBar=px(W*0.94,30);
    const leftMid=px(W*0.15,30), rightMid=px(W*0.85,30);
    return {leftBar,rightBar,leftMid,rightMid, dpr};
  });
  console.log(JSON.stringify(info));
  await p.screenshot({path:'testing/out-clash-fight2.png'});
  await b.close();
})();
