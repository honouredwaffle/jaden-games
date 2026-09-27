const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const R=[]; const ok=(n,c,x='')=>R.push(`${c?'PASS':'FAIL'}  ${n}${x?'  '+x:''}`);
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:25000});
  await p.waitForTimeout(600);
  const r=await p.evaluate(()=>{
    const G=window.GRIND,P=G.player,T=G.THREE,B=P.bones;
    const rel=n=>{const a=new T.Vector3(),c=new T.Vector3();B[n].getWorldPosition(a);B['Hips'].getWorldPosition(c);return a.sub(c);};
    const ang=(n,ax)=>{const q=B[n].quaternion,rest=B[n].userData.rest;return (2*Math.acos(Math.min(1,Math.abs(q.dot(rest))))*180/Math.PI).toFixed(0);};
    // knee lift: how high does the foot get vs the other foot through the run cycle?
    const samples=[];
    for(let i=0;i<24;i++){
      const ph=i/24*Math.PI*2;
      G.animateSkinned(P,ph,1,1); P.root.updateMatrixWorld(true);
      const fL=rel('LeftToe_End'), fR=rel('RightToe_End'), hL=B['LeftHand'].getWorldPosition(new T.Vector3()), hp=B['Hips'].getWorldPosition(new T.Vector3());
      samples.push({ph:+ph.toFixed(2), footLiftL:+(fL.y-fR.y).toFixed(3), kneeL:+ang('LeftLeg','X'), kneeR:+ang('RightLeg','X'),
                    strideZ:+(fL.z-fR.z).toFixed(2), handFwd:+(hL.z-hp.z).toFixed(2), hipsY:+(hp.y).toFixed(3)});
    }
    return {samples};
  });
  const S=r.samples;
  const maxDiff=(k)=>Math.max(...S.map(x=>Math.abs(x[k])));
  const maxKnee=Math.max(...S.map(x=>Math.max(x.kneeL,x.kneeR)));
  const maxLift=Math.max(...S.map(x=>x.footLiftL));
  const maxStride=Math.max(...S.map(x=>Math.abs(x.strideZ)));
  const hipsRange=Math.max(...S.map(x=>x.hipsY))-Math.min(...S.map(x=>x.hipsY));
  const handRange=Math.max(...S.map(x=>x.handFwd))-Math.min(...S.map(x=>x.handFwd));
  console.log(JSON.stringify(S.slice(0,6)));
  ok('knee flexes >=80deg at run (reference ~90)', maxKnee>=80, 'max knee='+maxKnee.toFixed(0)+'deg');
  ok('swing foot lifts off the ground', maxLift>0.18, 'max foot lift='+maxLift.toFixed(2)+'m');
  ok('stride separation (one leg fwd, one back)', maxStride>0.75, 'max stride='+maxStride.toFixed(2)+'m');
  ok('pelvis bobs through the stride', hipsRange>0.03, 'bob='+hipsRange.toFixed(3)+'m');
  ok('hands swing front/back (not locked)', handRange>0.3, 'hand sweep='+handRange.toFixed(2)+'m');
  console.log(R.join('\n'));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none');
  console.log('SUMMARY:',R.filter(x=>x.startsWith('PASS')).length+'/'+R.length);
  await b.close();
})().catch(e=>{console.error('FAIL',e.stack||e.message);process.exit(1)});
