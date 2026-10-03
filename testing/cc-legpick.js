// Grid of candidate leg poses drawn BIG with a hip dot + forward arrow, so the tuck shape is unambiguous.
// Faces +x (right). +y is DOWN. Hip at the white dot; orange arrow = forward.
const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(400);
  const dataUrl = await p.evaluate(()=>{
    const C=window.CLASH;
    const TH=26, SH=24, W=15;
    const cand=[
      ['stand',0.06,-0.10],['CROUCHref',1.00,-0.42],
      ['tuckA',-1.60,1.30],['tuckB',-1.90,1.30],
      ['tuckC',-2.10,1.60],['tuckD',-2.30,1.70],
      ['tuckE',-2.50,1.90],['tuckF',-2.30,2.20],
      ['reach',0.20,-0.15],['land',1.02,-0.44],
    ];
    const CW=210, CH=250, COLS=5, rows=Math.ceil(cand.length/COLS);
    const cv=document.createElement('canvas'); cv.width=CW*COLS; cv.height=CH*rows;
    const g=cv.getContext('2d');
    const bg=g.createLinearGradient(0,0,0,cv.height); bg.addColorStop(0,'#0a1030'); bg.addColorStop(1,'#241142'); g.fillStyle=bg; g.fillRect(0,0,cv.width,cv.height);
    cand.forEach((c,i)=>{
      const cx=(i%COLS)*CW+CW*0.42, cy=Math.floor(i/COLS)*CH+CH*0.55;
      // hip dot
      g.save(); g.translate(cx,cy);
      const S=2.2; g.scale(S,S);
      // forward arrow (orange, +x)
      g.strokeStyle='#ff9d3a'; g.lineWidth=2; g.beginPath(); g.moveTo(0,0); g.lineTo(30,0); g.stroke();
      g.beginPath(); g.moveTo(30,0); g.lineTo(24,-4); g.lineTo(24,4); g.closePath(); g.fillStyle='#ff9d3a'; g.fill();
      // both legs (back leg dark, front leg bright)
      C.drawLeg3d(g, -8, 0, c[1], c[2], TH,SH,W, '#22344f', '#c9d6e6', 0.3);
      C.drawLeg3d(g,  8, 0, c[1], c[2], TH,SH,W, '#4f7fb5', '#eaf2ff', 0.3);
      g.restore();
      // hip marker
      g.fillStyle='#fff'; g.beginPath(); g.arc(cx,cy,4,0,7); g.fill();
      // knee / ankle coords (from the same math, for the label)
      const rr=(a,x,y)=>[x*Math.cos(a)-y*Math.sin(a), x*Math.sin(a)+y*Math.cos(a)];
      const kn=rr(c[1],0,TH), sh=rr(c[1]+c[2],0,SH), an=[kn[0]+sh[0],kn[1]+sh[1]];
      g.fillStyle='#ffd166'; g.font='bold 13px Trebuchet MS'; g.textAlign='left';
      g.fillText(c[0], (i%COLS)*CW+12, Math.floor(i/COLS)*CH+22);
      g.fillStyle='#8fe3ff'; g.font='11px Trebuchet MS';
      g.fillText('th '+c[1]+'  kn '+c[2], (i%COLS)*CW+12, Math.floor(i/COLS)*CH+38);
      g.fillStyle='#9ef'; 
      g.fillText('knee '+(+kn[0].toFixed(0))+','+(+kn[1].toFixed(0))+' foot '+(+an[0].toFixed(0))+','+(+an[1].toFixed(0)), (i%COLS)*CW+12, Math.floor(i/COLS)*CH+52);
    });
    return cv.toDataURL('image/png');
  });
  fs.writeFileSync('testing/cc-legpick.png', Buffer.from(dataUrl.split(',')[1],'base64'));
  console.log(JSON.stringify({errs}));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
