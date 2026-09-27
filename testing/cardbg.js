const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:600,height:400}});
  p.on('pageerror',e=>console.log('ERR',e.message.slice(0,150)));
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.cars.length>0,null,{timeout:25000});
  await p.waitForTimeout(500);
  const dbg=await p.evaluate(()=>{
    const G=window.GRIND, c=G.cars.find(x=>!x.isPlayer)||G.cars[0];
    const out=[];
    c.group.traverse(o=>{ if(o.isMesh){ o.geometry.computeBoundingBox(); const bb=o.geometry.boundingBox;
      out.push({ mat:o.material&&o.material.type, ymin:+bb.min.y.toFixed(2), ymax:+bb.max.y.toFixed(2),
                 xmin:+bb.min.x.toFixed(2), xmax:+bb.max.x.toFixed(2), zmin:+bb.min.z.toFixed(2), zmax:+bb.max.z.toFixed(2),
                 tris:(o.geometry.index?o.geometry.index.count/3:o.geometry.attributes.position.count/3)|0 }); } });
    return out;
  });
  console.log(JSON.stringify(dbg,null,0));
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
