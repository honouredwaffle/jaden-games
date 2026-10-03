// Calibration: render known game poses + candidate tuck/reach/land leg angles so I can pick the right
// (thigh, knee) signs for the jump. Draws each as a fighter with legs overridden via a wrapper.
const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);
  const dataUrl = await p.evaluate(()=>{
    const C=window.CLASH, GY=300;
    const CW=190, CH=250, COLS=6;
    const cells=[
      // label, override-hook (paints legs manually after a plain body)
      ['CROUCH(known)', S=>{C.paintFighter(S.g,C.CHARS[0],Object.assign({t:1,anim:0,state:C.POSE.CROUCH,atk:null,hitFlash:0,superT:0,onGround:true,dir:1},{}));}],
      ['HOP(known)',    S=>{C.paintFighter(S.g,C.CHARS[0],{t:1,anim:0,state:C.POSE.HOP,atk:null,hitFlash:0,superT:0,onGround:false,dir:1});}],
      ['KICK hit',      S=>{C.paintFighter(S.g,C.CHARS[0],{t:1,anim:0,state:C.POSE.KICK,atk:{kind:'kick',t:0.15,startup:.11,active:.1,recover:.24}});}],
      // candidate tucks (thigh th, knee kn)
      ['TUCK a th=-1.9 kn=+1.9', {th:-1.9,kn:1.9,ft:0.5}],
      ['TUCK b th=-1.6 kn=+2.4', {th:-1.6,kn:2.4,ft:0.6}],
      ['TUCK c th=-2.2 kn=+2.6', {th:-2.2,kn:2.6,ft:0.7}],
      ['LAND   th=-0.95 kn=1.5', {th:-0.95,kn:1.5,ft:0.35}],
      ['LAND2  th=-0.7  kn=1.1', {th:-0.7,kn:1.1,ft:0.3}],
      ['REACH  th=-0.15 kn=-0.2',{th:-0.15,kn:-0.2,ft:0.0}],
      ['REACH2 th=-0.45 kn=0.6', {th:-0.45,kn:0.6,ft:0.1}],
      ['STRETCH th=0.15 kn=-0.1',{th:0.15,kn:-0.1,ft:-0.1}],
      ['LAUNCH th=-0.6 kn=0.2',  {th:-0.6,kn:0.2,ft:0.15}],
    ];
    const rows=Math.ceil(cells.length/COLS);
    const cv=document.createElement('canvas'); cv.width=CW*COLS; cv.height=CH*rows;
    const g=cv.getContext('2d');
    const bg=g.createLinearGradient(0,0,0,cv.height); bg.addColorStop(0,'#0a1030'); bg.addColorStop(1,'#241142'); g.fillStyle=bg; g.fillRect(0,0,cv.width,cv.height);
    cells.forEach((cell,i)=>{
      const cx=(i%COLS)*CW+CW/2, cy=Math.floor(i/COLS)*CH;
      // ground line
      g.strokeStyle='rgba(255,255,255,.15)'; g.beginPath(); g.moveTo((i%COLS)*CW,cy+GY); g.lineTo((i%COLS)*CW+CW,cy+GY); g.stroke();
      g.save(); g.translate(cx,cy+GY); g.scale(1.2,1.2);
      const ovr=typeof cell[1]==='object'?cell[1]:null;
      if(ovr){
        // paint torso/arms/head from a JUMP body, then override legs with candidates
        const ST=C.styleConfig? C.styleConfig(C.CHARS[0]) : null;
        C.paintFighter(g, C.CHARS[0], {t:1,anim:0,state:C.POSE.JUMP,atk:null,hitFlash:0,superT:0,onGround:false,dir:1,jumpT:0,jumpDur:0,
          __legOverride:ovr});
      } else {
        cell[1]({g});
      }
      g.restore();
      g.fillStyle='#ffd166'; g.font='bold 12px Trebuchet MS'; g.textAlign='center';
      g.fillText(cell[0], cx, cy+22);
    });
    return cv.toDataURL('image/png');
  });
  fs.writeFileSync('testing/cc-legcal.png', Buffer.from(dataUrl.split(',')[1],'base64'));
  console.log(JSON.stringify({errs}));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
