# ruff: noqa: INP001, T201
"""Generates the animated washing machine SVGs next to this script.

Run: python make_svgs.py
Each file is a self-contained SVG (no scripts, no external files) so it also works
as a data URI in an <img>, which is how the room-tile card shows it.
"""

import pathlib

BODY = (
    "M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2"
    "M7,4A1,1 0 0,0 6,5A1,1 0 0,0 7,6A1,1 0 0,0 8,5A1,1 0 0,0 7,4"
    "M10,4A1,1 0 0,0 9,5A1,1 0 0,0 10,6A1,1 0 0,0 11,5A1,1 0 0,0 10,4"
    "M12,8A6,6 0 0,0 6,14A6,6 0 0,0 12,20A6,6 0 0,0 18,14A6,6 0 0,0 12,8Z"
)
WAVE = "M14.83,11.17C16.39,12.73 16.39,15.27 14.83,16.83C13.27,18.39 10.73,18.39 9.17,16.83L14.83,11.17Z"


def svg(color: str, inner: str, disc: str = "") -> str:
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 32 32" width="256" height="256">'
        f'<circle cx="12" cy="12" r="16" fill="{color}" fill-opacity=".2">{disc}</circle>'
        f'<path fill="{color}" d="{BODY}"/>{inner}</svg>'
    )


def rot(dur: str, cx: int = 12, cy: int = 14) -> str:
    return (
        f'<animateTransform attributeName="transform" type="rotate" from="0 {cx} {cy}" '
        f'to="360 {cx} {cy}" dur="{dur}" repeatCount="indefinite"/>'
    )


def washing() -> str:
    """Soapy water sloshing from side to side."""
    c = "#00BCD4"
    suds = "".join(
        f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" fill-opacity=".9"/>'
        for x, y, r in (
            (9.4, 13.5, 0.9),
            (11.8, 13, 1.1),
            (14.4, 13.6, 0.8),
            (12.9, 12.2, 0.55),
        )
    )
    slosh = (
        '<g><animateTransform attributeName="transform" type="rotate" values="-14 12 14;14 12 14;-14 12 14" '
        'keyTimes="0;.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="2.4s" repeatCount="indefinite"/>'
        f'<rect x="3" y="14" width="18" height="10" fill="{c}" fill-opacity=".85"/>{suds}</g>'
    )
    return svg(
        c,
        '<defs><clipPath id="d"><circle cx="12" cy="14" r="5.3"/></clipPath></defs>'
        f'<g clip-path="url(#d)">{slosh}</g>',
    )


def rinsing() -> str:
    c = "#2196F3"
    wave = (
        f'<path fill="{c}" fill-opacity=".85" d="M0 14 q3 -2 6 0 t6 0 t6 0 t6 0 t6 0 V22 H0Z">'
        '<animateTransform attributeName="transform" type="translate" from="0 0" to="-12 0" dur="1.2s" repeatCount="indefinite"/></path>'
    )
    return svg(
        c,
        f'<defs><clipPath id="d"><circle cx="12" cy="14" r="5.4"/></clipPath></defs>'
        f'<g clip-path="url(#d)">{wave}</g>',
    )


def spinning() -> str:
    c = "#9C27B0"
    ring = (
        f'<circle cx="12" cy="14" r="3.6" fill="none" stroke="{c}" stroke-width="1.4" '
        f'stroke-dasharray="4 3.2" stroke-linecap="round">{rot("0.5s")}</circle>'
    )
    return svg(c, ring)


def drying() -> str:
    c = "#FF5722"
    # heat shimmering up inside the drum (no rotation)
    heat = "".join(
        f'<path fill="none" stroke="{c}" stroke-width="1.1" stroke-linecap="round" d="M{x} 19 q-1 -1.3 0 -2.6 t0 -2.6 t0 -2.6" opacity="0">'
        f'<animateTransform attributeName="transform" type="translate" values="0 2.5;0 -2.5" dur="1.8s" begin="{b}s" repeatCount="indefinite"/>'
        f'<animate attributeName="opacity" values="0;.95;0" dur="1.8s" begin="{b}s" repeatCount="indefinite"/></path>'
        for x, b in ((9.6, 0), (12, 0.6), (14.4, 1.2))
    )
    glow = (
        f'<circle cx="12" cy="14" r="5.3" fill="{c}" fill-opacity=".12">'
        '<animate attributeName="fill-opacity" values=".08;.3;.08" dur="1.8s" repeatCount="indefinite"/></circle>'
    )
    return svg(
        c,
        '<defs><clipPath id="d"><circle cx="12" cy="14" r="5.3"/></clipPath></defs>'
        f'{glow}<g clip-path="url(#d)">{heat}</g>',
    )


def cycle_complete() -> str:
    c = "#4CAF50"
    tick = (
        f'<path d="M8.8 14.2 L11.2 16.6 L15.4 11.8" fill="none" stroke="{c}" stroke-width="1.6" '
        'stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="12" stroke-dashoffset="12">'
        '<animate attributeName="stroke-dashoffset" values="12;0;0" keyTimes="0;0.3;1" dur="2.5s" repeatCount="indefinite"/></path>'
    )
    pulse = '<animate attributeName="fill-opacity" values=".2;.38;.2" dur="2.5s" repeatCount="indefinite"/>'
    return svg(c, tick, pulse)


def paused() -> str:
    c = "#FF9800"
    bars = (
        f'<g fill="{c}"><rect x="9.2" y="11.4" width="1.8" height="5.2" rx=".5"/>'
        '<rect x="13" y="11.4" width="1.8" height="5.2" rx=".5"/>'
        '<animate attributeName="opacity" values="1;.35;1" dur="2.4s" repeatCount="indefinite"/></g>'
    )
    return svg(c, bars)


def delayed_start() -> str:
    c = "#FFC107"
    clock = (
        f'<circle cx="12" cy="14" r="4.2" fill="none" stroke="{c}" stroke-width="1.2"/>'
        f'<line x1="12" y1="14" x2="12" y2="11.2" stroke="{c}" stroke-width="1.2" stroke-linecap="round">{rot("6s")}</line>'
        f'<line x1="12" y1="14" x2="13.6" y2="14" stroke="{c}" stroke-width="1.2" stroke-linecap="round">{rot("72s")}</line>'
    )
    return svg(c, clock)


FILES = {
    "washing": washing,
    "rinsing": rinsing,
    "spinning": spinning,
    "drying": drying,
    "cycle_complete": cycle_complete,
    "paused": paused,
    "delayed_start": delayed_start,
}

if __name__ == "__main__":
    out = pathlib.Path(__file__).parent
    for name, fn in FILES.items():
        (out / f"{name}.svg").write_text(fn(), encoding="utf-8")
        print(name)
