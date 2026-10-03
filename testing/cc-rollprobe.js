const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(400);
  const res = await p.evaluate(()=>{
    const C=window.CLASH, f=C.p1;
    const GW=900, GH=720;
    const cv=document.createElement('canvas'); cv.width=GW; cv.height=GH; const g=cv.getContext('2d');
    const gy=C.GROUND_Y();
    function lowestBody(rollT){
      g.clearRect(0,0,GW,GH);
      f.x=GW/2; f.y=gy; f.dir=1; f.combo=0; f.comboT=0; f.hitFlash=0;
      f.state=C.POSE.ROLL; f.rolling=true; f.rollT=rollT; f.rollDir=1;
      f.draw(g);
      const d=g.getImageData(0,0,GW,GH).data; let maxY=-1;
      for(let y=0;y<GH;y++) for(let x=0;x<GW;x++){ const i=(y*GW+x)*4; const r=d[i],gg=d[i+1],bb=d[i+2],a=d[i+3];
        if(a>25 && !(r<14&&gg<14&&bb<14)){ if(y>maxY) maxY=y; } }   // ignore the black shadow
      return maxY;
    }
    const RT=C.ROLL_TIME; let worst=-1, worstAt=0, samples=[];
    for(let k=0;k<=20;k++){ const rollT=RT*(1-k/20); const y=lowestBody(rollT); const below=y-gy;
      samples.push(+below.toFixed(1)); if(below>worst){ worst=below; worstAt=+(1-rollT/RT).toFixed(2); } }
    // same for trip (should also stay above)
    function lowestBodyState(setter){ g.clearRect(0,0,GW,GH); f.x=GW/2; f.y=gy; f.dir=1; f.rolling=false; f.combo=0; setter(); f.draw(g);
      const d=g.getImageData(0,0,GW,GH).data; let maxY=-1;
      for(let y=0;y<GH;y++) for(let x=0;x<GW;x++){ const i=(y*GW+x)*4; const r=d[i],gg=d[i+1],bb=d[i+2],a=d[i+3];
        if(a>25 && !(r<14&&gg<14&&bb<14)){ if(y>maxY) maxY=y; } } return maxY; }
    f.rolling=false; f.tripped=true; f.tripT=1; f.getupT=0; const tripBelow=lowestBodyState(()=>{ f.state=C.POSE.TRIP; f.tripped=true; f.tripT=1; })-gy;
    f.tripped=false;
    return {groundY:gy, rollWorstBelowPx:worst, rollWorstAtProg:worstAt, rollSamples:samples, tripBelowPx:tripBelow};
  });
  console.log(JSON.stringify({res,errs},null,1));
  await b.close();
})();
