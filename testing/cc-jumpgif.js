// Renders the NEW jump as an animated GIF (frames -> ffmpeg) so the motion is easy to judge.
const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);
  const frames = await p.evaluate(()=>{
    const C=window.CLASH, GY=360, VY=820, G=2100, T=2*VY/G;
    const N=24, W=240, H=420;
    const out=[];
    for(let i=0;i<N;i++){
      const f=i/(N-1);                        // 0..1 over the whole clip
      let lift=0, jumpT=0.0001, onGround=false;
      // phase 1: anticipation crouch on the ground (f 0..0.12); phase 2: flight (0.12..0.80); phase 3: recover
      if(f<0.12){ onGround=true; jumpT=T; lift=0; }
      else if(f<0.80){ const t=(f-0.12)/0.68*T; lift=Math.max(0,VY*t-0.5*G*t*t); jumpT=Math.max(0.0001,T-t); onGround=false; }
      else { onGround=true; jumpT=0; lift=0; }
      const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
      const g=cv.getContext('2d');
      const bg=g.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#0a1030'); bg.addColorStop(1,'#241142'); g.fillStyle=bg; g.fillRect(0,0,W,H);
      // ground
      g.strokeStyle='rgba(255,255,255,.25)'; g.lineWidth=2; g.beginPath(); g.moveTo(0,GY); g.lineTo(W,GY); g.stroke();
      // contact shadow (grows as he nears ground)
      const sh=Math.max(0.22,1-lift/220);
      g.globalAlpha=0.35*sh; g.fillStyle='#000'; g.beginPath(); g.ellipse(W/2,GY+4,40*sh,9*sh,0,0,7); g.fill(); g.globalAlpha=1;
      g.save(); g.translate(W/2, GY-lift); g.scale(1.5,1.5);
      // anticipation crouch pose (grounded) for phase 1: reuse the game's CROUCH legs by nudging jump sweep
      let st=C.POSE.JUMP;
      C.paintFighter(g, C.CHARS[0], {t:1,anim:f*10,state:st,atk:null,hitFlash:0,superT:0,onGround,dir:1,jumpT,jumpDur:T});
      g.restore();
      g.fillStyle='#8fe3ff'; g.font='bold 12px Trebuchet MS'; g.textAlign='left';
      g.fillText('hhmm', -999, -999); // no-op
      out.push(cv.toDataURL('image/png'));
    }
    return out;
  });
  frames.forEach((d,i)=>fs.writeFileSync(`testing/.jf_${String(i).padStart(2,'0')}.png`, Buffer.from(d.split(',')[1],'base64')));
  console.log(JSON.stringify({n:frames.length, errs}));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
