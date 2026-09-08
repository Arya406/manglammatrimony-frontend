import os
import time
import json
import urllib.request
import urllib.parse
from datetime import datetime

CHROME_DEBUG_URL = "http://127.0.0.1:9222"
FRONTEND_URL = "http://localhost:3000"
ARTIFACT_DIR = r"C:\Users\aryas\.gemini\antigravity-ide\brain\ef0935e4-7843-4a16-afea-2dae4828f62e"

def send_cdp(ws_url, method, params=None):
    import websocket
    ws = websocket.create_connection(ws_url)
    msg_id = 1
    req = {"id": msg_id, "method": method, "params": params or {}}
    ws.send(json.dumps(req))
    while True:
        resp = json.loads(ws.recv())
        if resp.get("id") == msg_id:
            ws.close()
            return resp.get("result", {})

def capture_qa():
    req = urllib.request.Request(f"{CHROME_DEBUG_URL}/json")
    with urllib.request.urlopen(req) as resp:
        targets = json.loads(resp.read().decode())
    
    target = None
    for t in targets:
        if t.get("type") == "page":
            target = t
            break
            
    if not target:
        req_new = urllib.request.Request(f"{CHROME_DEBUG_URL}/json/new?{urllib.parse.quote(FRONTEND_URL)}", method="PUT")
        with urllib.request.urlopen(req_new) as resp:
            target = json.loads(resp.read().decode())
            
    ws_url = target["webSocketDebuggerUrl"]
    print("Connecting to CDP at:", ws_url)
    
    import websocket
    ws = websocket.create_connection(ws_url)
    
    def call(method, params=None):
        nonlocal ws
        import random
        mid = random.randint(1, 1000000)
        ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))
        while True:
            r = json.loads(ws.recv())
            if r.get("id") == mid:
                return r.get("result", {})

    call("Page.navigate", {"url": FRONTEND_URL})
    time.sleep(3)

    # Scroll down to Journey section
    call("Runtime.evaluate", {
        "expression": """
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        """
    })
    time.sleep(1)

    viewports = [
        ("qa_desktop_1440", 1440, 900),
        ("qa_desktop_1280", 1280, 800),
        ("qa_desktop_1024", 1024, 768),
        ("qa_tablet_768", 768, 1024),
        ("qa_mobile_414", 414, 896),
        ("qa_mobile_390", 390, 844),
        ("qa_mobile_375", 375, 812),
    ]

    for name, w, h in viewports:
        call("Emulation.setDeviceMetricsOverride", {
            "width": w,
            "height": h,
            "deviceScaleFactor": 1,
            "mobile": w < 768
        })
        time.sleep(0.5)
        call("Runtime.evaluate", {
            "expression": """
            const el = document.getElementById('how-it-works');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
            """
        })
        time.sleep(0.5)
        shot = call("Page.captureScreenshot", {"format": "png"})
        import base64
        out_path = os.path.join(ARTIFACT_DIR, f"{name}.png")
        with open(out_path, "wb") as f:
            f.write(base64.b64decode(shot["data"]))
        print(f"Captured {name} at {w}x{h}")

    # Now on 1440px desktop, let's capture specific phases in the 12s cycle:
    call("Emulation.setDeviceMetricsOverride", {
        "width": 1440,
        "height": 900,
        "deviceScaleFactor": 1,
        "mobile": False
    })
    time.sleep(0.5)
    call("Runtime.evaluate", {
        "expression": """
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        """
    })

    # Precise phase sampling:
    # 01 Active: 1.0s (cycle t=1.0s)
    # Traveling 01->02: 2.8s (cycle t=2.8s)
    # 02 Active: 4.5s (cycle t=4.5s)
    # Traveling 02->03: 6.5s (cycle t=6.5s)
    # 03 Active: 8.0s (cycle t=8.0s)
    # Traveling 03->04: 10.0s (cycle t=10.0s)
    # 04 Active: 11.0s (cycle t=11.0s)
    # Smooth Loop (04 to 01): 11.8s (cycle t=11.8s)
    
    # We can control CSS animation time precisely using Document Timeline or pausing!
    phases = [
        ("qa_phase_01_active", 1.2),
        ("qa_phase_travel_01_to_02", 2.9),
        ("qa_phase_02_active", 4.5),
        ("qa_phase_travel_02_to_03", 6.5),
        ("qa_phase_03_active", 8.2),
        ("qa_phase_travel_03_to_04", 10.0),
        ("qa_phase_04_active", 11.2),
        ("qa_phase_loop_04_to_01", 11.8),
    ]

    for pname, t_sec in phases:
        # Pause animation at exact timestamp using document timeline / negative delay
        call("Runtime.evaluate", {
            "expression": f"""
            (function() {{
              const targetTime = {t_sec};
              const cards = document.querySelectorAll('[class*="card1"], [class*="card2"], [class*="card3"], [class*="card4"], [class*="pulse"], [class*="beacon"], [class*="cardImage"], [class*="stepNumber"]');
              cards.forEach(el => {{
                el.style.animationPlayState = 'paused';
                el.style.animationDelay = `-${{targetTime}}s`;
              }});
            }})()
            """
        })
        time.sleep(0.3)
        shot = call("Page.captureScreenshot", {"format": "png"})
        import base64
        out_path = os.path.join(ARTIFACT_DIR, f"{pname}.png")
        with open(out_path, "wb") as f:
            f.write(base64.b64decode(shot["data"]))
        print(f"Captured {pname} at t={t_sec}s")

    # Resume animations
    call("Runtime.evaluate", {
        "expression": """
        const cards = document.querySelectorAll('[class*="card1"], [class*="card2"], [class*="card3"], [class*="card4"], [class*="pulse"], [class*="beacon"], [class*="cardImage"], [class*="stepNumber"]');
        cards.forEach(el => {
          el.style.animationPlayState = 'running';
          el.style.animationDelay = '';
        });
        """
    })

    ws.close()
    print("Visual QA capture complete!")

if __name__ == "__main__":
    capture_qa()
