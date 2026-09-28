const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(500);
  const out = await p.evaluate(()=>{
    const r={};
    r.W=W; r.H=H;
    r.screen=screen;
    r.fn = typeof drawHUD;
    // manually call drawHUD on a clean ctx and sample
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#101010'; ctx.fillRect(0,0,W,H);
    try { drawHUD(ctx); r.hudOK=true; } catch(e){ r.hudErr=e.message; }
    const c=document.querySelector('canvas');
    function px(x,y){ const d=c.getContext('2d').getImageData(Math.round(x),Math.round(y),1,1).data; return [d[0],d[1],d[2]]; }
    r.atBarL=px(W*0.15,38);   // inside left bar body
    r.atBarR=px(W*0.85,38);
    return r;
  });
  console.log(JSON.stringify(out,null,1));
  await b.close();
})();
