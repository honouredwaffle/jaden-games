const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC = '/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const browser=await chromium.launch({executablePath:EXEC,headless:true,
    args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:414,height:896}});
  const errs=[]; page.on('pageerror',e=>errs.push('pageerror: '+e.message));
  page.on('console',m=>{ if(m.type()==='error'&&!/favicon|404|File not found/.test(m.text())) errs.push('console: '+m.text()); });
  await page.goto('http://127.0.0.1:8951/grind.html?n=4',{waitUntil:'load'});
  await page.waitForFunction(()=>window.GRIND && window.GRIND.MANNEQUIN && window.GRIND.MANNEQUIN.ready, null, {timeout:20000});
  await page.waitForTimeout(600);
  const out = await page.evaluate(()=>{
    const G=window.GRIND, P=G.player;
    const keys=o=>{const b={};o.traverse(n=>{if(n.isBone){const k=n.name.replace(/^mixamorig[0-9]*:/,'');if(!b[k])b[k]=n;}});return b;};
    let pm=0; if(P.root)P.root.traverse(n=>{if(n.isMesh)pm++});
    return {
      skinned:P.skinned, hasGroup:!!P.group, hasRoot:!!P.root, bones: P.bones?Object.keys(P.bones).length:0,
      groupChildren:P.group?P.group.children.length:-1, pMesh:pm,
      groupUserHumanoid: !!(P.group&&P.group.userData&&P.group.userData.humanoid),
      peds:G.peds.length, pedsSkinned:G.peds.filter(p=>p.skinned).length,
      mannequin:{ready:G.MANNEQUIN.ready,h:G.MANNEQUIN.h,minY:G.MANNEQUIN.minY,maxY:G.MANNEQUIN.maxY}
    };
  });
  console.log(JSON.stringify(out,null,2));
  console.log('ERRORS:', errs.length?errs.join('\n'):'none');
  await browser.close();
})().catch(e=>{console.error('FAIL',e.stack||e.message);process.exit(1);});
