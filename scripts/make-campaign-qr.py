"""Generate campaign QR codes for VetPath outreach channels.

Every outreach door gets its own utm_campaign tag so lib/firstTouch.ts can
record which one actually brought each veteran in. Re-run after adding a
channel; PNGs land in print/qr/ and the base64 map in print/qr/qr-base64.json
for embedding directly into print pieces.
"""
import base64, io, json, pathlib
import qrcode
from qrcode.constants import ERROR_CORRECT_M

SITE = "https://vetpathusa.com"
BRAND_INK = "#0F6E56"

CAMPAIGNS = {
    "pendleton":   "Camp Pendleton Transition Readiness Program (Frank)",
    "ocvso":       "Orange County Veterans Service Office (Frank)",
    "ca-checklist":"California benefits checklist handout",
    "tx-checklist":"Texas benefits checklist handout",
    "vso":         "VSO one-pager handout",
    "dfw-board":   "DFW engagement board / Dallas VAC (Kaleb)",
    "nasfw":       "NAS Fort Worth JRB transition office (Kaleb)",
    "vrcn":        "VetResources Community Network listing",
    "nrd":         "National Resource Directory listing",
}

out_dir = pathlib.Path("print/qr")
out_dir.mkdir(parents=True, exist_ok=True)
b64_map, rows = {}, []

for tag, desc in CAMPAIGNS.items():
    url = f"{SITE}/?utm_campaign={tag}"
    qr = qrcode.QRCode(version=None, error_correction=ERROR_CORRECT_M, box_size=10, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color=BRAND_INK, back_color="white").convert("RGB")
    png = out_dir / f"vetpath-{tag}.png"
    img.save(png)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    b64_map[tag] = base64.b64encode(buf.getvalue()).decode()
    rows.append((tag, desc, url, png.stat().st_size // 1024))

(out_dir / "qr-base64.json").write_text(json.dumps(b64_map, indent=1), encoding="utf-8")

print(f"{'TAG':<14} {'KB':>3}  URL")
for tag, desc, url, kb in rows:
    print(f"{tag:<14} {kb:>3}  {url}")
print(f"\n{len(rows)} codes -> {out_dir}")
