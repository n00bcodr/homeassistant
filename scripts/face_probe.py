"""Prepare images for the Gemini face confirmation.

usage: face_probe.py <frigate event id> [candidate names...]
Writes /media/Doorbell/probe/probe.jpg (the largest face crop Frigate kept for the
event) and ref_<Name>.jpg (the largest library crop of each candidate).
Prints JSON: {"ok": true, "size": [w, h]} or {"ok": false, "why": "..."}.
"""
import glob, json, os, sys
from PIL import Image

BASE = "/media/frigate/clips/faces"
OUT = "/media/Doorbell/probe"


def main():
    event, names = sys.argv[1], sys.argv[2:] or ["Pat", "Ramu", "Hilary"]
    os.makedirs(OUT, exist_ok=True)
    crops = glob.glob(f"{BASE}/train/{event}-*.webp")
    if not crops:
        print(json.dumps({"ok": False, "why": "no crops"}))
        return
    best = max(crops, key=os.path.getsize)
    im = Image.open(best).convert("RGB")
    if min(im.size) < 90:
        print(json.dumps({"ok": False, "why": "too small", "size": im.size}))
        return
    im.save(f"{OUT}/probe.jpg", quality=90)
    for n in names:
        fs = glob.glob(f"{BASE}/{n}/*.webp")
        if not fs:
            continue
        Image.open(max(fs, key=os.path.getsize)).convert("RGB").save(f"{OUT}/ref_{n}.jpg", quality=90)
    print(json.dumps({"ok": True, "size": im.size}))


main()
