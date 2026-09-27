const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:800,height:520}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=6',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(1200);
  const info=await p.evaluate(()=>{
    const G=window.GRIND, T=G.THREE;
    const out=[];
    const scan=(q,label)=>{
      q.group.updateMatrixWorld(true);
      const bb=new T.Box3().setFromObject(q.group);
      let meshes=0,vis=false; q.group.traverse(o=>{ if(o.isMesh) meshes++; });
      out.push({label, x:+bb.min.x.toFixed(2), X:+bb.max.x.toFixed(2), y0:+bb.min.y.toFixed(2), y1:+bb.max.y.toFixed(2),
                w:+(bb.max.x-bb.min.x).toFixed(2), h:+(bb.max.y-bb.min.y).toFixed(2), vis:q.group.visible, meshes});
    };
    G.peds.slice(0,4).forEach((q,i)=>scan(q,'ped'+i));
    scan(G.player,'PLAYER');
    return out;
  });
  console.log(JSON.stringify(info,null,1));
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
