const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);
  const out = await p.evaluate(()=>{
    const r={};
    const c=document.querySelector('canvas');
    function px(x,y){ const d=ctx.getImageData(Math.round(x),Math.round(y),1,1).data; return [d[0],d[1],d[2]]; }
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle='#101010'; ctx.fillRect(0,0,c.width,c.height);
    // control rect
    ctx.fillStyle='#ff0000'; ctx.fillRect(100,100,50,50);
    r.control=px(120,120);
    // try bar via roundRect+fill
    ctx.fillStyle='#00ff00'; roundRect(ctx,200,200,300,40,6); ctx.fill();
    r.roundRectFill=px(250,220);
    // now full drawHUD
    drawHUD(ctx);
    r.barAt=[px(200,38),px(300,38),px(400,38)];
    r.meterAt=px(200,58);
    // scan row y=38 for any non-bg
    let hits=0; for(let x=0;x<1280;x+=4){ const q=px(x,38); if(!(q[0]===16&&q[1]===16&&q[2]===16)) hits++; }
    r.hitsRow38=hits;
    return r;
  });
  console.log(JSON.stringify(out,null,1));
  await b.close();
})();
