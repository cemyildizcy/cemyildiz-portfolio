from pathlib import Path
from playwright.sync_api import sync_playwright
import json

ROOT = Path(__file__).parent
URL = (ROOT / "index.html").as_uri()
CASES = [("desktop",1440,1000,1),("mobile",390,844,1),("narrow",320,844,1),("zoom200",390,844,2)]
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for name,w,h,scale in CASES:
        page=browser.new_page(viewport={"width":w,"height":h}, device_scale_factor=1)
        errors=[]
        page.on("console",lambda msg,e=errors:e.append(f"console:{msg.type}:{msg.text}") if msg.type=="error" else None)
        page.on("pageerror",lambda exc,e=errors:e.append(f"page:{exc}"))
        page.goto(URL,wait_until="networkidle")
        if scale==2:
            page.evaluate("document.documentElement.style.zoom='200%'")
        page.locator("body").click(position={"x":w-2,"y":h-2})
        page.wait_for_timeout(150)
        data=page.evaluate("""() => {
          const q=s=>document.querySelector(s), rect=s=>{const r=q(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};
          const targets=[...document.querySelectorAll('nav a,.project-tab,.layer-tab,.actions a,.file-links a,.ledger-row button,.contact a')].map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim(),w:r.width,h:r.height,visible:!!(r.width&&r.height)}});
          return {innerWidth,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,active:document.activeElement.tagName,skip:rect('.skip'),hero:rect('.hero'),live:rect('.live-cutaway'),figure:rect('.figure'),h1:rect('h1'),fileTitle:rect('.file-head h2'),targets,images:[...document.images].map(i=>({src:i.src,loaded:i.complete&&i.naturalWidth>0,naturalWidth:i.naturalWidth}))};
        }""")
        data.update(name=name,width=w,height=h,scale=scale,errors=errors,minTarget=min(x['h'] for x in data['targets'] if x['visible']))
        if scale==2:
            data['overflowers']=page.evaluate("() => [...document.querySelectorAll('*')].map(e=>({tag:e.tagName,cls:e.className,text:(e.textContent||'').trim().slice(0,40),right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width})).filter(x=>x.right>innerWidth+1)")
        results.append(data)
        if name=="desktop": page.screenshot(path=str(ROOT/"desktop.png"),full_page=True)
        if name=="mobile": page.screenshot(path=str(ROOT/"mobile-390.png"),full_page=True)
        if name=="mobile":
            page.locator('.skip').focus()
            data["skipWhenFocused"]=page.evaluate("() => ({active:document.activeElement.className,rect:document.activeElement.getBoundingClientRect().toJSON()})")
            page.locator('.skip').blur()
            # Exercise project and all layer controls with keyboard.
            page.locator('.project-tab[aria-selected="true"]').focus(); page.keyboard.press("ArrowRight")
            data["projectAfterArrow"]=page.locator('.project-tab[aria-selected="true"]').inner_text()
            for key in ["output","decision","ai","limits"]:
                page.locator(f'.layer-tab[data-layer="{key}"]').click()
                data.setdefault("layers",[]).append(page.locator('#layer-panel h3').inner_text())
    browser.close()
(ROOT/"verification.json").write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(results,ensure_ascii=False,indent=2))
