const { chromium } = require('playwright-core');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html'); await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{
    const C=window.CLASH, VY=820,G=2100,T=2*VY/G;
    const TH=26,SH=24;
    const rot=(a,x,y)=>[x*Math.cos(a)-y*Math.sin(a), x*Math.sin(a)+y*Math.cos(a)];
    const rec=[];
    const orig=C.drawLeg3d;
    C.drawLeg3d=function(g,hipX,hipY,th,kn,thL,shL,w,col,shoe,ft){ rec.push({hipX,hipY,th:+th.toFixed(2),kn:+kn.toFixed(2),ft:+(ft||0).toFixed(2)}); return orig.apply(this,arguments); };
    const cv=document.createElement('canvas'); cv.width=300; cv.height=500; const g=cv.getContext('2d');
    const out={};
    for(const jk of [0,0.13,0.26,0.40,0.50,0.60,0.74,0.88,0.94,1.0]){
      rec.length=0;
      const jumpT=jk>=1?0.0001:T*(1-jk), onGround=jk>=1;
      C.paintFighter(g,C.CHARS[0],{t:1,anim:0,state:C.POSE.JUMP,atk:null,hitFlash:0,superT:0,onGround,dir:1,jumpT,jumpDur:T});
      const leg=rec[rec.length-1]; // front leg is drawn last
      const k=rot(leg.th,0,TH), s=rot(leg.th+leg.kn,0,SH);
      const kneeY=leg.hipY+k[1], footY=leg.hipY+k[1]+s[1], kneeX=k[0], footX=k[0]+s[0];
      out['jk='+jk]={th:leg.th,kn:leg.kn,hipY:+leg.hipY.toFixed(0),kneeXY:[+kneeX.toFixed(0),+kneeY.toFixed(0)],footXY:[+footX.toFixed(0),+footY.toFixed(0)]};
    }
    C.drawLeg3d=orig;
    return {out, ground:Math.round(C.GROUND_Y())};
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
