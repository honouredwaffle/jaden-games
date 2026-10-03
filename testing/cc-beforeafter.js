const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs = require('fs');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1200,height:700}});
  await p.goto('file://'+process.cwd()+'/final-riot.html',{waitUntil:'load'});
  await p.waitForTimeout(400);
  const durl = await p.evaluate(()=>{
    const C=window.CLASH;
    const N=4, cw=180, ch=520, SC=2.6;
    const cv=document.createElement('canvas'); cv.width=cw*N*2; cv.height=ch;
    const g=cv.getContext('2d');
    g.fillStyle='#0a0714'; g.fillRect(0,0,cv.width,cv.height);
    // OLD curve (the broken one)
    function oldJ(a){ const sw=Math.sin(a), lift=Math.max(0,Math.cos(a));
      return {thigh:sw*0.52, knee:-(0.30+0.95*Math.max(0,-sw))-0.55*lift, foot:0.22*sw}; }
    const cols={far:'#4f9dff',near:'#ff9b3d'};
    function drawLeg(g,j,c,hip){ g.save(); g.translate(hip,-48); g.rotate(j.thigh);
      g.fillStyle=c; g.fillRect(-7.5,0,15,26); g.strokeStyle='#000'; g.lineWidth=1.2; g.strokeRect(-7.5,0,15,26);
      g.translate(0,26); g.rotate(j.knee);
      g.fillStyle=c; g.fillRect(-6.6,0,13.2,24); g.strokeStyle='#000'; g.strokeRect(-6.6,0,13.2,24);
      g.translate(0,24); g.rotate(j.foot||0);
      g.fillStyle='#e8e8ee'; g.fillRect(-9.5,-12.75,19,12.75); g.strokeStyle='#000'; g.strokeRect(-9.5,-12.75,19,12.75);
      g.restore(); }
    for(const set of ['OLD','NEW']){
      const base = set==='OLD'?0:cw*N;
      for(let i=0;i<N;i++){
        const ph=i/N, cx=base+i*cw+cw/2;
        g.save(); g.translate(cx,ch*0.44); g.scale(SC,SC);
        g.strokeStyle='rgba(120,255,150,.45)'; g.lineWidth=0.7; g.beginPath(); g.moveTo(-34,0); g.lineTo(34,0); g.stroke();
        if(set==='OLD'){
          const a=ph*6.2831853;
          drawLeg(g,oldJ(a),cols.far,-8); drawLeg(g,oldJ(a+Math.PI),cols.near,8);
        } else {
          drawLeg(g,C.walkJoint(ph),cols.far,-8); drawLeg(g,C.walkJoint(ph+0.5),cols.near,8);
        }
        g.restore();
      }
      g.fillStyle=set==='OLD'?'#ff5c5c':'#5cff9d'; g.font='bold 26px sans-serif'; g.textAlign='center';
      g.fillText(set==='OLD'?'BEFORE — knee folded the WRONG way':'AFTER — real joints (hip+knee+ankle)', base+cw*N/2, 36);
    }
    g.fillStyle='#7a76a0'; g.font='14px monospace'; g.textAlign='center';
    for(let i=0;i<N;i++) g.fillText('phase '+(i/N).toFixed(2), cw/2+i*cw, ch-8);
    for(let i=0;i<N;i++) g.fillText('phase '+(i/N).toFixed(2), cw*N+cw/2+i*cw, ch-8);
    return cv.toDataURL('image/png');
  });
  fs.writeFileSync('testing/cc-walk-beforeafter.png', Buffer.from(durl.split(',')[1],'base64'));
  console.log('written');
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
