const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:900,height:620}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message.slice(0,140)));
  await p.goto('http://127.0.0.1:8951/grind.html?n=3',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(900);
  const out=await p.evaluate(()=>{
    const G=window.GRIND,T=G.THREE;
    const q=G.peds[0], B=q.bones;
    q.group.rotation.y=0; q.group.position.set(0,0,0); q.group.updateMatrixWorld(true);
    const wp=n=>{const v=new T.Vector3();B[n].getWorldPosition(v);return v;};
    const rel=(a,b)=>[(a.x-b.x).toFixed(2),(a.y-b.y).toFixed(2),(a.z-b.z).toFixed(2)].join(',');
    const L=[];
    const meas=(tag)=>{ q.group.updateMatrixWorld(true);
      const sh=wp('LeftShoulder'), el=wp('LeftArm'), hand=wp('LeftHand');
      const shR=wp('RightShoulder'), handR=wp('RightHand');
      L.push(tag+': Lelbow-rel-shoulder('+rel(el,sh)+') Lhand-rel-shoulder('+rel(hand,sh)+') Rhand-rel-shoulder('+rel(handR,shR)+')');
    };
    G.idleSkinned(q,0); meas('IDLE');
    G.animateSkinned(q,0.0,1.0,0.0); meas('WALK p0  ');
    G.animateSkinned(q,1.57,1.0,0.0); meas('WALK p90 ');
    G.animateSkinned(q,0.0,1.0,1.0); meas('RUN  p0  ');
    let above=0, maxUp=-9;
    for(let i=0;i<40;i++){ const ph=i/40*2*Math.PI; G.animateSkinned(q,ph,1.0,1.0); q.group.updateMatrixWorld(true);
      const d=wp('LeftHand').y-wp('LeftShoulder').y, d2=wp('RightHand').y-wp('RightShoulder').y;
      maxUp=Math.max(maxUp,d,d2); if(d>0.02||d2>0.02) above++; }
    L.push('RUN stride: frames with hand ABOVE shoulder = '+above+'/40, max(hand-shoulder y)='+maxUp.toFixed(2));
    return L.join('\n');
  });
  console.log(out); console.log('ERRORS', errs.length?errs:'none');
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
