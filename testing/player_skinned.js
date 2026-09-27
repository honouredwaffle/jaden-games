const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC = '/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const R=[]; const ok=(n,c,x='')=>R.push(`${c?'PASS':'FAIL'}  ${n}${x?'  '+x:''}`);
(async()=>{
  const browser=await chromium.launch({executablePath:EXEC,headless:true,
    args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:414,height:896}});
  const errs=[]; page.on('pageerror',e=>errs.push('pageerror: '+e.message));
  page.on('console',m=>{ if(m.type()==='error'&&!/favicon|404|File not found/.test(m.text())) errs.push('console: '+m.text()); });
  await page.goto('http://127.0.0.1:8951/grind.html?n=4',{waitUntil:'load'});
  // wait for character.glb to finish loading
  await page.waitForFunction(()=>window.GRIND && window.GRIND.MANNEQUIN && window.GRIND.MANNEQUIN.ready, null, {timeout:20000});
  await page.waitForTimeout(800);

  const info = await page.evaluate(async ()=>{
    const G=window.GRIND, P=G.player;
    const boneKeys=o=>{ const b={}; o.traverse(n=>{ if(n.isBone){ const k=n.name.replace(/^mixamorig[0-9]*:?/,''); if(!b[k]) b[k]=n; } }); return b; };
    const meshes=o=>{let c=0;o.traverse(n=>{if(n.isMesh)c++});return c;};
    const ped=G.peds.find(p=>p.skinned);
    const pB=P.skinned?boneKeys(P.root):{}, dB=ped?boneKeys(ped.root):{};
    // does the player use the SAME bone set as a crowd ped?
    const pKeys=Object.keys(pB).sort().join(','), dKeys=Object.keys(dB).sort().join(',');
    // same rig mesh count?
    const pMesh=P.skinned?meshes(P.root):-1, dMesh=ped?meshes(ped.root):-1;
    // capture walk pose vs idle pose quats
    G.animateSkinned(P.skinned?P:{bones:pB}, 1.2, 1, 1);
    const walk = pB['LeftUpLeg'] ? pB['LeftUpLeg'].quaternion.toArray().map(v=>+v.toFixed(4)) : null;
    G.animateWalk && null;
    G.idleSkinned({bones:pB}, 0);
    const idle = pB['LeftUpLeg'] ? pB['LeftUpLeg'].quaternion.toArray().map(v=>+v.toFixed(4)) : null;
    const diff = walk&&idle ? walk.reduce((s,v,i)=>s+Math.abs(v-idle[i]),0) : 0;
    // player must NOT be one of the wandering peds
    const inPeds = G.peds.indexOf(P) >= 0 || G.peds.some(p=>p.root===P.root);
    return { skinned:P.skinned, hasRoot:!!P.root, bones:Object.keys(pB).length, pedBones:Object.keys(dB).length,
             sameRig:pKeys===dKeys, pMesh, dMesh, diff:+diff.toFixed(4), inPeds, peds:G.peds.length };
  });

  ok('player is the skinned character', info.skinned===true);
  ok('player has the rig root + bones', info.hasRoot && info.bones>40, 'bones='+info.bones);
  ok('player rig === crowd ped rig (same bones)', info.sameRig===true, 'pedBones='+info.pedBones);
  ok('player mesh count === ped mesh count', info.pMesh===info.dMesh, `player=${info.pMesh} ped=${info.dMesh}`);
  ok('walk pose differs from idle (bones animate)', info.diff>0.01, 'quat delta='+info.diff);
  ok('player is NOT duplicated in the ped crowd', info.inPeds===false, 'peds='+info.peds);

  // simulate movement: hold W and confirm legs swing (bone quats change over time)
  const motion = await page.evaluate(async ()=>{
    const G=window.GRIND, P=G.player;
    const key=n=>n.replace(/^mixamorig[0-9]*:?/,'');
    const leg=()=>P.bones['LeftUpLeg'].quaternion.toArray().map(v=>+v.toFixed(3));
    const seen=new Set();
    for(let f=0;f<12;f++){ P.phase += 0.5; G.animateSkinned(P, P.phase, 1, 1);
      seen.add(P.bones['LeftUpLeg'].quaternion.toArray().map(v=>v.toFixed(2)).join(',')); }
    return { distinct:seen.size, keySample:key('mixamorig1LeftUpLeg') };
  });
  ok('run cycle sweeps through distinct leg poses', motion.distinct>=4, 'distinct='+motion.distinct+' kneeKey='+motion.keySample);

  console.log(R.join('\n'));
  console.log('\nERRORS:', errs.length? errs.join('\n'):'none');
  console.log('SUMMARY:', R.filter(x=>x.startsWith('PASS')).length+'/'+R.length);
  await browser.close();
})().catch(e=>{console.error('FAIL',e.stack||e.message);process.exit(1);});
