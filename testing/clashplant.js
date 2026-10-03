const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(400);
  await p.evaluate(()=>window.CLASH.setSel(0));
  await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  await p.keyboard.press('Enter'); await p.waitForTimeout(1300);
  // freeze player + force walk pose, sample the leg column for non-bg pixels
  const r = await p.evaluate(()=>{
    const P=window.CLASH.p1, gy=H*0.82;
    P.state=1; // WALK
    P.x = W*0.5; P.y = gy; P.dir=1;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
    // draw just the fighter at several anim phases, merged onto one strip
    const res=[];
    for(let i=0;i<4;i++){
      P.anim = i*1.4;
      const before=[];
      ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
      ctx.save(); ctx.translate(P.x,P.y); ctx.scale(P.dir,1);
      paintFighter(ctx,P.char,P); ctx.restore();
      // scan vertical line at the fighter x, from mid-body to ground
      let lowest=null, topmost=null;
      for(let y=gy-130;y<=gy+6;y++){
        const d=ctx.getImageData(Math.round(P.x),Math.round(y),1,1).data;
        if(d[0]+d[1]+d[2]>40){ if(topmost===null)topmost=y; lowest=y; }
      }
      res.push({phase:i, top:topmost-Math.round(gy), bottom:(lowest===null?null:lowest-Math.round(gy))});
    }
    return res;
  });
  console.log(JSON.stringify({errs, r},null,1));
  await p.screenshot({path:'testing/cc-walkcheck.png'});
  await b.close();
})();
