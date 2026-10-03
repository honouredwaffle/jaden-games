const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  for(const vp of [{width:1280,height:720,name:'landscape'},{width:390,height:844,name:'portrait'}]){
    const p = await b.newPage({viewport:vp});
    const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
    await p.goto('file://'+process.cwd()+'/cursed-clash.html');
    await p.waitForTimeout(400);
    await p.evaluate(()=>{ const C=window.CLASH; C.setCtrlMode(1); C.goSelect(); C.setSel(0); C.setArenaOverride(0); C.startFight(); });
    await p.waitForTimeout(1400);
    const res = await p.evaluate(()=>{
      const btns=[...document.querySelectorAll('#pad .btn')].map(el=>({k:el.dataset.k,r:el.getBoundingClientRect()}));
      const rects=btns.map(o=>({k:o.k,x:o.r.left,y:o.r.top,w:o.r.width,h:o.r.height}));
      const overlaps=[];
      for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
        const a=rects[i],bb=rects[j];
        const ox=Math.max(0,Math.min(a.x+a.w,bb.x+bb.w)-Math.max(a.x,bb.x));
        const oy=Math.max(0,Math.min(a.y+a.h,bb.y+bb.h)-Math.max(a.y,bb.y));
        if(ox>4&&oy>4) overlaps.push([a.k,bb.k,Math.round(ox*oy)]);
      }
      const C=window.CLASH, gy=C.GROUND_Y();
      const inC=(el)=> el.x+el.w>0&&el.x<innerWidth&&el.y+el.h>0&&el.y<innerHeight;
      return {rects:rects.map(r=>({k:r.k,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.w),h:Math.round(r.h)})),
        overlaps, p1:Math.round(C.p1.x), p2:Math.round(C.p2.x), W:innerWidth, H:innerHeight,
        buttons:btns.map(o=>o.k), offscreen: rects.filter(r=>!inC(r)).map(r=>r.k)};
    });
    await p.screenshot({path:`testing/cc-pad-${vp.name}.png`});
    console.log(vp.name, JSON.stringify(res));
    await p.close();
  }
  await b.close();
})();
