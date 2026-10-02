"""Generate campaign QR codes for VetPath outreach channels.

Every outreach door gets its own utm_campaign tag so lib/firstTouch.ts can
record which one actually brought each veteran in. Re-run after adding a
channel; PNGs land in print/qr/ and the base64 map in print/qr/qr-base64.json
for embedding directly into print pieces.

Partner offices (Oct 2026) work differently. Their codes are opaque, minted in
Supabase with  select * from public.mint_partner_code('<office name>');  and
the code-to-office mapping lives ONLY in public.partner_codes. This repo is
public, so a partner's name or code never goes into CAMPAIGNS. Make their QR
with:

    python scripts/make-campaign-qr.py --partner k7m3qx

which writes print/qr/partners/vetpath-partner-k7m3qx.png (gitignored).
"""
import argparse, base64, io, json, pathlib, re, sys
import qrcode
from qrcode.constants import ERROR_CORRECT_M

SITE = "https://vetpathusa.com"
BRAND_INK = "#0F6E56"
# Must match PARTNER_CODE in lib/firstTouch.ts and the check on public.partner_codes.
PARTNER_CODE = re.compile(r"^[a-hjkmnp-z2-9]{6}$")

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
    "facebook":    "Facebook posts (Frank's network)",
    "linkedin":    "LinkedIn posts (Frank's network)",
}


def qr_image(url):
    qr = qrcode.QRCode(version=None, error_correction=ERROR_CORRECT_M, box_size=10, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    return qr.make_image(fill_color=BRAND_INK, back_color="white").convert("RGB")


ap = argparse.ArgumentParser(description="Generate VetPath campaign and partner QR codes.")
ap.add_argument("--partner", nargs="+", metavar="CODE",
                help="opaque partner code(s) from public.mint_partner_code; output is gitignored")
args = ap.parse_args()

if args.partner:
    out_dir = pathlib.Path("print/qr/partners")
    out_dir.mkdir(parents=True, exist_ok=True)
    for raw in args.partner:
        code = raw.strip().lower()
        if not PARTNER_CODE.match(code):
            sys.exit(f"not a partner code: {raw!r} (6 characters from a-z and 2-9, never i, l, o, 0 or 1)")
        url = f"{SITE}/?utm_source=partner&utm_campaign={code}"
        png = out_dir / f"vetpath-partner-{code}.png"
        qr_image(url).save(png)
        print(f"{code}  {url}  -> {png}")
    sys.exit(0)

out_dir = pathlib.Path("print/qr")
out_dir.mkdir(parents=True, exist_ok=True)
b64_map, rows = {}, []

for tag, desc in CAMPAIGNS.items():
    url = f"{SITE}/?utm_campaign={tag}"
    img = qr_image(url)
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
