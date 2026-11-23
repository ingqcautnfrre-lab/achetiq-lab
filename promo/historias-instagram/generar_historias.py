#!/usr/bin/env python3
"""Genera los proyectos HyperFrames de las dos historias de Instagram.

  apuntes/      Historia 1 · Apuntes Académicos (boceto B + introducción breve)
  seguimiento/  Historia 2 · Seguimiento de Carrera (boceto A sin horarios)

Escribe HTML estático: cada elemento temporizado queda escrito en el HTML. Ver el SPEC.md de
cada proyecto. Ejecutar desde cualquier carpeta: python3 generar_historias.py
"""
import json
import os

BASE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(BASE, '..', '..'))
plan = json.load(open(os.path.join(REPO, 'data/plan_academico.json')))
MAT = {m['numero']: m for m in plan['materias']}

# ───────────────────────── sistema visual (crema) ─────────────────────────
CSS = r"""
@font-face{font-family:'Fraunces';src:url('assets/fonts/fraunces-400-600.woff2') format('woff2');font-weight:400 600;font-style:normal}
@font-face{font-family:'Hanken Grotesk';src:url('assets/fonts/hanken-grotesk-400-600.woff2') format('woff2');font-weight:400 600;font-style:normal}
@font-face{font-family:'Geist Mono';src:url('assets/fonts/geist-mono-400-500.woff2') format('woff2');font-weight:400 500;font-style:normal}
#root{position:absolute;inset:0;background:#FCF7F0;overflow:hidden;font-family:'Hanken Grotesk',sans-serif;color:#131720}
.abs{position:absolute}
.serif{font-family:'Fraunces',serif;font-weight:400;letter-spacing:-0.015em}
.mono{font-family:'Geist Mono',monospace}
.soft{color:#4A4F59}
.tap{position:absolute;width:88px;height:88px;margin:-44px 0 0 -44px;border-radius:50%;background:rgba(19,23,32,.26);box-shadow:0 6px 18px rgba(11,41,100,.22);opacity:0;pointer-events:none;z-index:20}
.chip{display:flex;align-items:center;gap:16px;padding:18px 26px;border-radius:16px;background:#FFFFFF;border:2px solid #E7DFD3;font-size:34px;white-space:nowrap;opacity:0}
.frag{white-space:nowrap;opacity:0}
.pdf{width:52px;height:64px;border-radius:7px;background:#D93025;color:#fff;font:600 17px 'Hanken Grotesk',sans-serif;display:flex;align-items:flex-end;justify-content:center;padding-bottom:9px;flex:0 0 52px}
.pdf.s{width:36px;height:44px;font-size:12px;padding-bottom:6px;flex:0 0 36px;border-radius:5px}
/* página de apuntes */
.crumbs{font-size:32px;color:#4A4F59}
.h1{font-size:116px;line-height:1.02}
.lead{font-size:40px;line-height:1.4;color:#4A4F59}
.pills{display:flex;flex-wrap:wrap;gap:16px}
.pill{height:76px;padding:0 34px;border-radius:999px;border:2px solid #DCD3C6;background:#FFFFFF;font-size:34px;display:flex;align-items:center}
.pill.on{background:#1344A5;border-color:#1344A5;color:#FFFFFF}
.grid2{position:absolute;left:72px;width:936px;display:grid;grid-template-columns:1fr 1fr;column-gap:24px;row-gap:28px}
.gcell{position:relative}
.gimg{height:256px;border-radius:16px;overflow:hidden;background:#E7CDAA}
.gimg img{width:100%;height:100%;object-fit:cover;display:block}
.gname{margin-top:12px;height:76px;font-size:30px;font-weight:500;line-height:1.25}
/* Drive simulado */
.drive{left:0;top:0;width:1080px;height:1920px;background:#FFFFFF;padding:350px 72px 0;opacity:0}
.drv-search{height:96px;border-radius:999px;background:#F1EEE8;font-size:36px;color:#4A4F59;padding:0 40px;display:flex;align-items:center;gap:22px}
.drv-crumb{margin-top:44px;font-size:34px;color:#4A4F59;line-height:1.3}
.drv-title{margin-top:10px;font-size:56px;font-weight:600;line-height:1.18}
.drv-head{margin-top:38px;padding-bottom:16px;border-bottom:2px solid #E7DFD3;font-family:'Geist Mono',monospace;font-size:28px;letter-spacing:.06em;color:#4A4F59}
.drv-row{position:relative;height:124px;display:flex;align-items:center;gap:30px;border-bottom:2px solid #F0EBE3;font-size:40px;padding:0 12px}
.drv-row > *:not(.hl):not(.tap){position:relative;z-index:1}
.drv-row .ic{flex:0 0 64px;display:flex;justify-content:center}
.hl{position:absolute;inset:0;background:rgba(146,47,161,.09);border-left:8px solid #922FA1;opacity:0;z-index:0}
.viewer{left:0;top:0;width:1080px;height:1920px;background:#E9E3D9;opacity:0}
.viewer-bar{position:absolute;left:0;top:250px;width:1080px;height:116px;background:#FFFFFF;display:flex;align-items:center;gap:26px;padding:0 72px;font-size:36px;border-bottom:2px solid #E7DFD3}
.viewer-page{position:absolute;left:100px;top:420px;width:880px;height:1150px;background:#FFFFFF;box-shadow:0 18px 40px rgba(11,41,100,.14);padding:64px 64px}
.pg-head{display:flex;justify-content:space-between;font-size:28px;color:#4A4F59;border-bottom:2px solid #131720;padding-bottom:14px}
.pg-title{margin-top:34px;font-size:36px;font-weight:600;line-height:1.3}
.pg-text{margin-top:26px;font-size:30px;line-height:1.45}
/* cierre */
.flood{left:0;top:0;width:1080px;height:1920px;background:#FCF7F0;opacity:0}
.claim{left:72px;width:936px;font-size:100px;line-height:1.04;opacity:0}
.claim-sub{left:72px;width:900px;font-size:46px;line-height:1.35;color:#4A4F59;opacity:0}
.end{left:72px;top:400px;width:936px;display:flex;flex-direction:column;align-items:center;text-align:center;opacity:0}
.end-logo{width:280px;height:280px}
.end-name{font-size:96px;margin-top:18px;display:flex}
.end-name span{display:inline-block;opacity:0}
.end-url{font-size:42px;color:#1344A5;margin-top:14px}
.end-sec{font-size:38px;color:#4A4F59;margin-top:18px;line-height:1.3}
.end-extra{font-size:34px;color:#4A4F59;margin-top:10px}
/* seguimiento */
.qwin{left:72px;top:330px;width:936px;height:250px;overflow:hidden}
.q{position:absolute;left:0;top:0;font-size:112px;line-height:1.02;white-space:nowrap}
.tok{font-size:36px;color:#4A4F59;white-space:nowrap;opacity:0}
.tok b{color:#131720;font-weight:500}
.pillb{height:62px;padding:0 24px;border-radius:999px;font-size:32px;font-weight:500;display:flex;align-items:center;gap:10px;white-space:nowrap;opacity:0}
.b-no{color:#9B171F;background:#FBEFEF;border:2px solid rgba(155,23,31,.3)}
.b-si{color:#165E2E;background:#EDF6F0;border:2px solid rgba(22,94,46,.35)}
.b-reg{color:#1344A5;background:#EEF3FC;border:2px solid rgba(19,68,165,.3)}
.b-lvl{color:#006459;background:#EAF7F4;border:2px solid rgba(3,149,133,.4)}
.nota{display:flex;align-items:baseline;gap:14px;padding:14px 24px;border-radius:16px;white-space:nowrap;opacity:0}
.nota .k{font-family:'Geist Mono',monospace;font-size:30px}
.nota .v{font-family:'Fraunces',serif;font-size:60px;line-height:1}
.n-mal{background:#FBEFEF;border:2px solid #EBC3C5;color:#9B171F}
.n-bien{background:#EDF6F0;border:2px solid #BFDCC9;color:#165E2E}
.hh1{left:72px;top:300px;width:936px;font-size:96px;line-height:1.02}
.kcard{position:absolute;width:456px;height:180px;background:#FFFFFF;border:2px solid #E7DFD3;border-radius:20px;padding:22px 26px}
.kl{font-family:'Geist Mono',monospace;font-size:28px;letter-spacing:.05em;color:#4A4F59;white-space:nowrap}
.kv{font-family:'Fraunces',serif;font-size:84px;line-height:1.1;margin-top:8px;white-space:nowrap}
.kv small{font-family:'Hanken Grotesk',sans-serif;font-size:34px;color:#4A4F59;margin-left:8px}
.tbl{left:72px;top:750px;width:936px;background:#FFFFFF;border:2px solid #E7DFD3;border-radius:20px}
.lvl{height:64px;padding:0 28px;display:flex;align-items:center;font-size:32px;font-weight:500}
.trow{position:relative;height:96px;display:flex;align-items:center;padding:0 28px;gap:22px;border-top:1px solid #EFE8DE;font-size:36px}
.trow .n{font-family:'Geist Mono',monospace;font-size:30px;width:56px;color:#4A4F59}
.trow .nm{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tint{position:absolute;inset:0;background:#EDF6F0;opacity:0;z-index:0}
.trow > *:not(.tint){position:relative;z-index:1}
.sel{position:relative;height:64px;width:270px;padding:0 20px;border:2px solid #DCD3C6;border-radius:12px;font-size:30px;display:flex;align-items:center;justify-content:space-between;background:#FFFFFF}
.sel-ring{position:absolute;inset:-6px;border:4px solid #922FA1;border-radius:16px;opacity:0}
.sel-win{position:relative;width:200px;height:40px;overflow:hidden}
.sel-win span{position:absolute;left:0;top:0;line-height:40px;white-space:nowrap}
.sel .tap{position:absolute}
.dd{position:absolute;right:0;top:72px;width:300px;background:#FFFFFF;border:2px solid #DCD3C6;border-radius:14px;box-shadow:0 18px 40px rgba(11,41,100,.16);opacity:0;z-index:30;overflow:hidden}
.dd div{position:relative;height:70px;display:flex;align-items:center;padding:0 24px;font-size:30px}
.bwrap{position:relative;width:290px;height:58px}
.badge{position:absolute;right:0;top:0;height:58px;padding:0 22px;border-radius:999px;font-size:28px;font-weight:500;display:flex;align-items:center;gap:10px;white-space:nowrap}
.note{left:72px;width:936px;font-family:'Geist Mono',monospace;font-size:28px;color:#4A4F59;opacity:0}
.tabs{left:72px;top:300px;width:936px;height:76px;display:flex;gap:44px;border-bottom:2px solid #E7DFD3;font-size:36px}
.tabs div{padding-top:10px;white-space:nowrap}
.tab-ul{left:72px;top:370px;height:5px;background:#1344A5;width:200px}
.fcard{position:absolute;left:72px;width:936px;background:#FFFFFF;border:2px solid #E7DFD3;border-radius:20px;padding:24px 28px;opacity:0}
.fhead{display:flex;align-items:baseline;gap:18px;height:52px}
.fhead .n{font-family:'Geist Mono',monospace;font-size:30px;color:#4A4F59}
.fhead .nm{font-size:40px;font-weight:500;white-space:nowrap}
.ffin{position:absolute;right:28px;top:14px;display:flex;align-items:baseline;gap:14px}
.ffin .k{font-family:'Geist Mono',monospace;font-size:28px;color:#4A4F59;letter-spacing:.05em}
.ffin .v{font-family:'Fraunces',serif;font-size:64px;line-height:1;color:#165E2E;opacity:0}
.atts{display:flex;gap:12px;margin-top:26px}
.att{width:284px;height:132px;border-radius:16px;padding:14px 15px;opacity:0}
.att .d{font-family:'Geist Mono',monospace;font-size:28px;white-space:nowrap}
.att .g{display:flex;align-items:baseline;gap:12px;margin-top:4px}
.att .g b{font-family:'Fraunces',serif;font-weight:400;font-size:64px;line-height:1;opacity:0}
.att .g i{font-style:normal;font-family:'Geist Mono',monospace;font-size:28px;opacity:0}
.a-mal{background:#FBEFEF;border:2px solid #EBC3C5;color:#9B171F}
.a-bien{background:#EDF6F0;border:2px solid #BFDCC9;color:#165E2E}
.prom{position:absolute;top:1430px;width:456px;height:140px;background:#FFFFFF;border:2px solid #E7DFD3;border-radius:20px;padding:18px 26px;opacity:0}
"""

JS_HELPERS = r"""
  const tl = gsap.timeline({ paused: true });
  const blurIn = (s, t, d = 0.24) => tl.fromTo(s, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: d, ease: 'power4.out' }, t);
  const blurOut = (s, t, d = 0.2) => tl.to(s, { opacity: 0, filter: 'blur(10px)', duration: d, ease: 'power2.in' }, t);
  const tap = (s, t) => {
    tl.fromTo(s, { opacity: 0, scale: 1.45 }, { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out' }, t);
    tl.to(s, { scale: 0.78, duration: 0.08, ease: 'power2.in' }, t + 0.14);
    tl.to(s, { scale: 1.08, opacity: 0, duration: 0.24, ease: 'power2.out' }, t + 0.24);
  };
  const press = (s, t) => { tl.to(s, { scale: 0.965, duration: 0.09, ease: 'power2.in' }, t + 0.12); tl.to(s, { scale: 1, duration: 0.22, ease: 'power3.out' }, t + 0.22); };
  const roll = (a, b, t, h) => { tl.to(a, { y: -h, opacity: 0, filter: 'blur(6px)', duration: 0.22, ease: 'power3.in' }, t); tl.fromTo(b, { y: h, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.32, ease: 'expo.out' }, t + 0.12); };
  const steps = (s, t, vals, dt) => vals.forEach((v, i) => tl.set(s, { innerHTML: v }, t + i * dt));
  const spring = (s, t, from) => tl.fromTo(s, Object.assign({ opacity: 0, scale: 0.6 }, from || {}), { opacity: 1, scale: 1, rotation: (from && from.rot) || 0, duration: 0.42, ease: 'back.out(1.6)' }, t);
"""

FOLDER = '<svg width="64" height="52" viewBox="0 0 64 52"><path d="M4 8a4 4 0 0 1 4-4h16l6 6h26a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#5F6368"/></svg>'
FOLDER_S = '<svg width="44" height="36" viewBox="0 0 64 52"><path d="M4 8a4 4 0 0 1 4-4h16l6 6h26a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#5F6368"/></svg>'
SEARCH = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4A4F59" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>'
PDF = '<div class="pdf" data-layout-ignore>PDF</div>'
PDF_S = '<div class="pdf s" data-layout-ignore>PDF</div>'
IRQ = 'Ingeniería de las Reacciones Químicas'


import re
import wave

_T_END = re.compile(r"(\}\s*,\s*)(\d+(?:\.\d+)?)(\s*\);)")
_T_FN = re.compile(r"((?:tap|press|blurIn|blurOut|steps)\('[^']*',\s*)(\d+(?:\.\d+)?)")
_T_ROLL = re.compile(r"(roll\('[^']*',\s*'[^']*',\s*)(\d+(?:\.\d+)?)")


def shift(js, f):
    """Aplica f(t) a cada tiempo de inicio escrito en el código del timeline."""
    g = lambda m: m.group(1) + ('%.2f' % f(float(m.group(2)))) + (m.group(3) if m.lastindex >= 3 else '')
    return _T_ROLL.sub(g, _T_FN.sub(g, _T_END.sub(g, js)))


def wav_dur(proj, name):
    with wave.open(os.path.join(BASE, proj, 'assets/sfx', name + '.wav')) as w:
        return w.getnframes() / w.getframerate()


def cls_style(cls, x, y):
    extra = ''
    if '" style="' in cls:
        cls, extra = cls.split('" style="', 1)
    return f'class="abs {cls}" style="left:{x}px;top:{y}px;{extra}"'


def scene(cid, body, js, dur):
    return f'''<template>
  <style>{CSS}</style>
  <div id="root" data-composition-id="{cid}" data-width="1080" data-height="1920">
    <div id="{cid}-all" class="clip" data-start="0" data-duration="{dur}" data-track-index="1" style="position:absolute;inset:0">{body}
    </div>
  </div>
  <script>{JS_HELPERS}{js}
  window.__timelines["{cid}"] = tl;
  </script>
</template>
'''


def index_html(title, scenes, sfx, total, proj):
    hosts = ''
    for i, (sid, start, dur) in enumerate(scenes):
        hosts += f'''
      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{start}" data-duration="{dur}" data-track-index="{1 + (i % 2)}" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:{i + 1}"></div>'''
    audio = ''
    for i, (name, t, vol) in enumerate(sfx):
        audio += f'''
      <audio id="sfx-{i:02d}" class="clip" src="assets/sfx/{name}.wav" data-start="{t:.2f}" data-duration="{wav_dur(proj, name):.2f}" data-track-index="{5 + i % 2}" data-volume="{vol}"></audio>'''
    return f'''<!doctype html>
<html lang="es-AR" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>{title}</title>
    <script src="assets/lib/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #FCF7F0; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="1080" data-height="1920">{hosts}{audio}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
'''


def cierre(p, l1, l2, sub, sec, extra, dur):
    """Afirmación + cierre con la marca. Devuelve (body, js)."""
    letters = ''.join(f'<span id="{p}-ch{i}">{c}</span>' for i, c in enumerate('AChETIQ'))
    extra_html = f'<div class="end-extra">{extra}</div>' if extra else ''
    body = f'''
      <div id="{p}-flood" class="abs flood"></div>
      <div id="{p}-l1" class="abs claim serif" style="top:540px">{l1}</div>
      <div id="{p}-l2" class="abs claim serif" style="top:650px">{l2}</div>
      <div id="{p}-sub" class="abs claim-sub" style="top:900px">{sub}</div>
      <div id="{p}-end" class="abs end">
        <img id="{p}-logo" class="end-logo" src="assets/img/achetiq-logo.svg" alt="">
        <div class="serif end-name">{letters}</div>
        <div id="{p}-url" class="end-url mono">achetiq.github.io</div>
        <div id="{p}-sec" class="end-sec">{sec}</div>{extra_html}
      </div>'''
    js = f'''
  tl.fromTo('#{p}-flood', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, ease: 'power2.inOut' }}, 0);
  blurIn('#{p}-l1', 0.25, 0.28);
  blurIn('#{p}-l2', 0.5, 0.28);
  blurIn('#{p}-sub', 0.85, 0.24);
  blurOut('#{p}-l1', 3.2); blurOut('#{p}-l2', 3.24); blurOut('#{p}-sub', 3.28);
  tl.set('#{p}-end', {{ opacity: 1 }}, 3.4);
  tl.fromTo('#{p}-logo', {{ opacity: 0, scale: 0.82, y: 30 }}, {{ opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.4)' }}, 3.4);
  tl.fromTo('#{p}-end .end-name span', {{ opacity: 0.25, filter: 'blur(4px)' }}, {{ opacity: 1, filter: 'blur(0px)', duration: 0.18, stagger: 0.05 }}, 3.7);
  blurIn('#{p}-url', 4.05); blurIn('#{p}-sec', 4.18);'''
    if extra:
        js += f"\n  blurIn('#{p}-end .end-extra', 4.3);"
    return body, js


# ═════════════════════════════ HISTORIA 1 · APUNTES ═════════════════════════════
GRID = ['introduccion-a-la-ingenieria-quimica', 'quimica', 'analisis-matematico-i', 'fisica-i',
        'quimica-inorganica', 'quimica-organica', 'fisicoquimica', 'ingenieria-de-las-reacciones-quimicas',
        'fenomenos-de-transporte', 'operaciones-unitarias-i', 'operaciones-unitarias-ii',
        'tecnologia-de-la-energia-termica', 'control-automatico-de-procesos',
        'calidad-y-control-estadistico-de-procesos', 'organizacion-industrial',
        'diseno-simulacion-optimizacion-y-seguridad-de-procesos']
GRID_NAMES = ['Introducción a la Ingeniería Química', 'Química', 'Análisis Matemático I', 'Física I',
              'Química Inorgánica', 'Química Orgánica', 'Fisicoquímica', IRQ, 'Fenómenos de Transporte',
              'Operaciones Unitarias I', 'Operaciones Unitarias II', 'Tecnología de la Energía Térmica',
              'Control Automático de Procesos', 'Calidad y Control Estadístico de Procesos',
              'Organización Industrial', 'Diseño, Simulación, Optimización y Seguridad de Procesos']
Y0 = 1920              # comienzo de la página dentro del mundo
GRID_TOP = Y0 + 990
PITCH = 372
IRQ_I = GRID.index('ingenieria-de-las-reacciones-quimicas')
IRQ_X = 72 + 456 + 24 + 228
IRQ_Y = GRID_TOP + (IRQ_I // 2) * PITCH + 128
CAM_IRQ = 960 - IRQ_Y

FRAGS = [  # (html, x, y, rot, clase)
    (f'{FOLDER_S}<span>03. Práctica</span>', 90, 720, -5, 'chip'),
    ('Apuntes', 690, 700, 4, 'frag serif soft" style="font-size:64px'),
    (f'{PDF_S}<span>2024 - GS - Resolución Serie 07.pdf</span>', 150, 860, 3, 'chip'),
    ('Guías de ejercicios', 560, 1010, -6, 'frag mono soft" style="font-size:36px'),
    (f'{FOLDER_S}<span>Guías de Estudio</span>', 80, 1100, 6, 'chip'),
    ('Bibliografía', 640, 1210, 5, 'frag serif soft" style="font-size:58px'),
    (f'{FOLDER_S}<span>05. Presentaciones</span>', 330, 1300, -3, 'chip'),
    (f'{PDF_S}<span>2024 - SMR - Resolución Series.pdf</span>', 100, 1440, -6, 'chip'),
]


def drive_panel(pid, crumb, title, rows):
    r = ''
    for rid, kind, name in rows:
        ic = FOLDER if kind == 'folder' else PDF
        r += (f'<div id="{rid}" class="drv-row"><div id="{rid}-hl" class="hl"></div><div class="ic">{ic}</div>'
              f'<span>{name}</span><div id="{rid}-tap" class="tap" style="left:62%;top:50%"></div></div>')
    return f'''
      <div id="{pid}" class="abs drive">
        <div class="drv-search">{SEARCH}<span>Buscar en Drive</span></div>
        <div class="drv-crumb">{crumb}</div>
        <div class="drv-title">{title}</div>
        <div class="drv-head">Nombre</div>
        {r}
      </div>'''


def viewer(p):
    # trazos «manuscritos»: perfil de concentración de la doble película y renglones de resolución
    strokes = [
        'M70 40 L70 330', 'M250 40 L250 330', 'M70 330 L560 330',
        'M20 80 C 60 85, 70 120, 90 160 S 200 250, 250 260', 'M250 260 C 300 262, 420 270, 540 275',
        'M20 150 C 80 152, 140 200, 250 300',
        'M600 70 C 640 60, 690 90, 730 70 S 800 60, 820 80', 'M600 130 C 650 120, 700 150, 760 128',
        'M600 190 C 640 182, 680 205, 730 188 S 790 176, 810 196', 'M600 250 C 660 240, 700 262, 770 246',
    ]
    paths = ''.join(f'<path id="{p}-st{i}" d="{d}" pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="1"/>'
                    for i, d in enumerate(strokes))
    labels = ('<text x="12" y="30" font-size="24">GAS</text><text x="262" y="30" font-size="24">LÍQUIDO</text>'
              '<text x="40" y="365" font-size="22">interfase</text>')
    return f'''
      <div id="{p}-view" class="abs viewer">
        <div class="viewer-bar">{PDF}<span>2024 - GS - Resolución Serie 07.pdf</span></div>
        <div class="viewer-page">
          <div class="pg-head"><span class="mono">UTN · FRRe</span><span>Ingeniería de las Reacciones</span></div>
          <div class="pg-title">Serie 7: Reacciones heterogéneas fluido-fluido</div>
          <div class="pg-text">1. Desafío. a. Mencione brevemente las hipótesis principales en que se basa la teoría de la doble película.</div>
          <div class="pg-text">b. Indique el régimen cinético que caracteriza los siguientes perfiles.</div>
          <svg class="abs" style="left:64px;top:700px" width="760" height="400" viewBox="0 0 860 400" fill="none" stroke="#1F3F8F" stroke-width="4" stroke-linecap="round" data-layout-ignore>
            <g fill="#1F3F8F" stroke="none" font-family="Hanken Grotesk" id="{p}-pglab" opacity="0">{labels}</g>{paths}
          </svg>
        </div>
      </div>'''


def build_apuntes():
    out = os.path.join(BASE, 'apuntes')
    P1X, P1Y = GEOM.get('prac', [116, 828])
    P2X, P2Y = GEOM.get('s07', [116, 886])
    # ───── escena «toma» ─────
    T_DUR = 13.6
    frags = ''.join(
        f'<div id="t-f{i}" {cls_style(cls, x, y)}>{h}</div>'
        for i, (h, x, y, r, cls) in enumerate(FRAGS))
    pills = '<div class="pill on">Todos</div>' + ''.join(f'<div class="pill">{i}º año</div>' for i in range(1, 6))
    cells = ''
    for i, (g, n) in enumerate(zip(GRID, GRID_NAMES)):
        tap = '<div id="t-gtap" class="tap" style="left:50%;top:128px"></div>' if i == IRQ_I else ''
        cells += f'<div class="gcell" id="t-g{i}"><div class="gimg"><img src="assets/img/{g}.webp" alt=""></div><div class="gname">{n}</div>{tap}</div>'
    body = f'''
      <div id="t-world" class="abs" style="left:0;top:0;width:1080px;height:6000px">
        <div id="t-intro" class="abs" style="left:0;top:0;width:1080px;height:1920px">
          <div id="t-q" class="abs serif" style="left:72px;top:330px;width:936px;font-size:112px;line-height:1.02">¿Dónde quedaron<br>los apuntes?</div>
          {frags}
        </div>
        <div id="t-page" class="abs" style="left:72px;top:{Y0 + 300}px;width:936px">
          <div class="crumbs">Inicio › Recursos académicos › Apuntes</div>
          <div class="serif h1" style="margin-top:14px">Apuntes Académicos</div>
          <div class="lead" style="margin-top:26px">Cada materia enlaza a su carpeta de Google Drive.</div>
          <div class="pills" style="margin-top:36px">{pills}</div>
        </div>
        <div class="grid2" style="top:{GRID_TOP}px">{cells}</div>
      </div>
      {drive_panel('t-drv1', 'Compartidos conmigo › AChETIQ', IRQ,
                   [('t-r-prac', 'folder', '03. Práctica'), ('t-r-pres', 'folder', '05. Presentaciones')])}
      {drive_panel('t-drv2', f'… › {IRQ}', '03. Práctica',
                   [('t-r-guias', 'folder', 'Guías de Estudio'),
                    ('t-r-s07', 'pdf', '2024 - GS - Resolución Serie 07.pdf'),
                    ('t-r-smr', 'pdf', '2024 - SMR - Resolución Series.pdf')])}
      {viewer('t')}'''
    js = ''
    # gancho: pregunta visible en el cuadro 0, fragmentos con resorte
    for i, (h, x, y, r, cls) in enumerate(FRAGS):
        js += f"\n  tl.fromTo('#t-f{i}', {{ opacity: 0, scale: 0.6, rotation: {r * 3}, y: -30 }}, {{ opacity: 1, scale: 1, rotation: {r}, y: 0, duration: 0.42, ease: 'back.out(1.6)' }}, {0.15 + i * 0.13:.2f});"
    js += f'''
  // paneo 1: el gancho sube y entra la página real
  tl.to('#t-intro [id^="t-f"]', {{ y: -420, filter: 'blur(8px)', duration: 0.8, ease: 'power3.in', stagger: 0.015 }}, 2.3);
  tl.to('#t-world', {{ y: -{Y0}, duration: 0.85, ease: 'power3.inOut' }}, 2.3);
  tl.set('#t-intro', {{ opacity: 0 }}, 3.2);
  // paneo 2: la cámara recorre la grilla y frena en IRQ
  tl.to('#t-world', {{ y: {CAM_IRQ}, duration: 1.25, ease: 'power2.inOut' }}, 3.9);
  tap('#t-gtap', 5.2);
  press('#t-g{IRQ_I}', 5.2);
  tl.set('#t-world', {{ transformOrigin: '{IRQ_X}px {IRQ_Y}px' }}, 0);
  tl.to('#t-world', {{ scale: 8, x: {540 - IRQ_X}, duration: 0.7, ease: 'power3.in' }}, 5.4);
  tl.fromTo('#t-drv1', {{ opacity: 0, scale: 0.2 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }}, 5.85);
  tl.set('#t-world', {{ opacity: 0 }}, 6.3);
  tl.fromTo('#t-r-prac, #t-r-pres', {{ opacity: 0, x: 40 }}, {{ opacity: 1, x: 0, duration: 0.35, ease: 'expo.out', stagger: 0.08 }}, 6.0);
  tap('#t-r-prac-tap', 7.15);
  tl.to('#t-r-prac-hl', {{ opacity: 0.6, duration: 0.1 }}, 7.27);
  tl.set('#t-drv1', {{ transformOrigin: '{P1X}px {P1Y}px' }}, 7.3);
  tl.to('#t-drv1', {{ scale: 7, x: {540 - P1X}, y: {960 - P1Y}, duration: 0.6, ease: 'power3.in' }}, 7.35);
  tl.fromTo('#t-drv2', {{ opacity: 0, scale: 0.2 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }}, 7.7);
  tl.set('#t-drv1', {{ opacity: 0 }}, 8.1);
  tl.fromTo('#t-r-guias, #t-r-s07, #t-r-smr', {{ opacity: 0, x: 40 }}, {{ opacity: 1, x: 0, duration: 0.35, ease: 'expo.out', stagger: 0.08 }}, 7.85);
  tap('#t-r-s07-tap', 8.65);
  tl.to('#t-r-s07-hl', {{ opacity: 1, duration: 0.14 }}, 8.77);
  tl.set('#t-drv2', {{ transformOrigin: '{P2X}px {P2Y}px' }}, 8.9);
  tl.to('#t-drv2', {{ scale: 7, x: {540 - P2X}, y: {960 - P2Y}, duration: 0.6, ease: 'power3.in' }}, 8.95);
  tl.fromTo('#t-view', {{ opacity: 0, scale: 0.2 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }}, 9.3);
  tl.set('#t-drv2', {{ opacity: 0 }}, 9.7);
  tl.to('#t-pglab', {{ opacity: 1, duration: 0.3 }}, 9.85);
  tl.to('#t-view svg path', {{ strokeDashoffset: 0, duration: 0.32, ease: 'power1.inOut', stagger: 0.09 }}, 9.9);
  // alejamiento continuo hasta la grilla completa
  tl.to('#t-view', {{ scale: 0.08, opacity: 0, duration: 0.42, ease: 'power3.in' }}, 11.15);
  tl.set('#t-world', {{ opacity: 1 }}, 11.35);
  tl.to('#t-world', {{ scale: 0.6, x: -96, duration: 0.95, ease: 'power3.out' }}, 11.35);'''
    js = shift(js, lambda t: t + (0.4 if t >= 3.85 else 0) + (0.3 if t >= 9.95 else 0))
    toma = scene('toma', body, js, T_DUR)

    # ───── escena «cierre» ─────
    C_START, C_DUR = 13.4, 6.3
    cb, cj = cierre('c', '38 materias.', 'Una carpeta cada una.',
                    'Apuntes, guías y bibliografía aportados por la comunidad estudiantil.',
                    'Recursos académicos › Apuntes', '', C_DUR)
    cierre_html = scene('cierre', cb, cj, C_DUR)

    total = round(C_START + C_DUR, 2)
    sfx = [('pop-a', 0.16, 0.45), ('pop-b', 0.42, 0.45), ('pop-c', 0.68, 0.45), ('pop-a', 0.94, 0.4),
           ('barrido-a', 2.28, 0.55), ('barrido-c', 4.35, 0.3),
           ('toque-a', 5.73, 0.8), ('barrido-b', 5.85, 0.6),
           ('toque-b', 7.68, 0.8), ('barrido-a', 7.78, 0.6),
           ('toque-a', 9.18, 0.8), ('barrido-c', 9.38, 0.6),
           ('barrido-inv', 11.8, 0.6), ('barrido-b', C_START - 0.05, 0.3),
           ('impacto', C_START + 3.4 + 0.35 - 0.9, 0.75)]
    os.makedirs(os.path.join(out, 'compositions'), exist_ok=True)
    open(os.path.join(out, 'compositions/toma.html'), 'w').write(toma)
    open(os.path.join(out, 'compositions/cierre.html'), 'w').write(cierre_html)
    open(os.path.join(out, 'index.html'), 'w').write(
        index_html('Apuntes Académicos — historia', [('toma', 0, T_DUR), ('cierre', C_START, C_DUR)], sfx, total, 'apuntes'))
    return total


# ═════════════════════════════ HISTORIA 2 · SEGUIMIENTO ═════════════════════════════
# Valores leídos de la herramienta real con el estado de ejemplo (ver SPEC.md)
GEOM = json.load(open(os.path.join(BASE, 'geometria.json'))) if os.path.exists(os.path.join(BASE, 'geometria.json')) else {}
KPIS = [('APROBADAS', '17', ''), ('AVANCE', '39,0 %', ''), ('NO CURSADAS / CURSANDO', '22', ''),
        ('DISPONIBLES', '9', ''), ('REGULARES', '3', ''), ('PROM. SIN APLAZOS', '7,76', ''),
        ('PROM. CON APLAZOS', '6,95', ''), ('HS. OBLIGATORIAS APROB.', '58', 'hs'),
        ('HS. ELECTIVAS APROB.', '5', 'hs'), ('% ELECTIVAS COMPLETADAS', '20,8 %', '')]
FINALES = [(3, 'Álgebra y Geometría Analítica', [('20/02/2024', 4), ('05/03/2024', 7)], 7),
           (5, 'Física I', [('24/07/2024', 2), ('11/12/2024', 5), ('19/02/2025', 8)], 8),
           (12, 'Análisis Matemático II', [('16/07/2025', 3), ('03/12/2025', 7)], 7)]

TOKS = [  # (html, x, y, rot, grupo, clase)
    ('Cursadas req. <b>6, 7, 8, 9, 13</b>', 72, 700, -3, 0, 'tok mono'),
    ('Aprobadas req. <b>1, 3, 4</b>', 520, 790, 4, 0, 'tok mono'),
    ('✕ No disponible', 110, 860, -6, 0, 'pillb b-no'),
    ('<b>11, 12, 13</b>', 700, 905, 8, 0, 'tok mono" style="font-size:52px'),
    ('41 obligatorias', 90, 1000, 3, 1, 'tok serif" style="font-size:60px;color:#131720'),
    ('24 hs electivas', 590, 1080, -5, 1, 'tok mono'),
    ('Regular', 330, 1150, 6, 1, 'pillb b-reg'),
    ('Nivel III', 720, 1210, -4, 1, 'pillb b-lvl'),
    ('<span class="k">1° nota</span><span class="v">4</span>', 80, 1280, -4, 2, 'nota n-mal'),
    ('<span class="k">2° nota</span><span class="v">7</span>', 430, 1320, 5, 2, 'nota n-bien'),
    ('Se aprueba con <b>6</b>', 110, 1450, 2, 2, 'tok mono'),
    ('Máximo <b>4</b> instancias', 560, 1490, -6, 2, 'tok mono'),
]


def kcard(i, label, val, unit, x, y, vid):
    u = f'<small>{unit}</small>' if unit else ''
    return (f'<div id="h-k{i}" class="kcard" style="left:{x}px;top:{y}px"><div class="kl">{label}</div>'
            f'<div class="kv"><span id="{vid}">{val}</span>{u}</div></div>')


def kpos(i):
    return 72 + (i % 2) * 480, 540 + (i // 2) * 198


def build_seguimiento():
    out = os.path.join(BASE, 'seguimiento')
    # ───── escena «gancho» ─────
    G_DUR = 3.9
    toks = ''.join(f'<div id="g-t{i}" {cls_style(cls, x, y)}>{h}</div>'
                   for i, (h, x, y, r, g, cls) in enumerate(TOKS))
    gb = f'''
      <div class="abs qwin" id="g-qwin">
        <div id="g-q0" class="q serif">¿Qué puedo<br>cursar?</div>
        <div id="g-q1" class="q serif" style="opacity:0">¿Cuánto<br>me falta?</div>
        <div id="g-q2" class="q serif" style="opacity:0">¿Cuál es mi<br>promedio?</div>
      </div>
      {toks}'''
    gj = ''
    for i, (h, x, y, r, g, cls) in enumerate(TOKS):
        t0 = [0.15, 1.3, 2.45][g] + (i % 4) * 0.13
        gj += f"\n  tl.fromTo('#g-t{i}', {{ opacity: 0, scale: 0.6, rotation: {r * 3} }}, {{ opacity: 1, scale: 1, rotation: {r}, duration: 0.42, ease: 'back.out(1.6)' }}, {t0:.2f});"
    gj += '''
  roll('#g-q0', '#g-q1', 1.15, 260);
  roll('#g-q1', '#g-q2', 2.3, 260);'''
    for i, (h, x, y, r, g, cls) in enumerate(TOKS):
        dx = (x + 200 - 540) * 1.6
        dy = (y - 1100) * 1.2
        gj += f"\n  tl.to('#g-t{i}', {{ x: {dx:.0f}, y: {dy:.0f}, opacity: 0, filter: 'blur(12px)', duration: 0.36, ease: 'power3.in' }}, {3.45 + (i % 3) * 0.02:.2f});"
    gj += "\n  blurOut('#g-qwin', 3.48, 0.24);"
    gancho = scene('gancho', gb, gj, G_DUR)

    # ───── escena «herramienta» ─────
    H_START, H_DUR = 3.7, 15.9
    a, f, t = '#507ED3', '#EEF4FD', '#315393'
    a2, f2, t2 = '#8E6AC7', '#F5F2FC', '#5F4489'
    dd = ''.join(f'<div id="h-dd{i}">{o}' + ('<div id="h-tap-dd" class="tap" style="left:40%;top:50%"></div>' if i == 3 else '') + '</div>'
                 for i, o in enumerate(['No Cursada', 'Cursando', 'Regular', 'Aprobada']))

    def selrow(n, name, rid, extra='', z=''):
        return (f'<div id="{rid}" class="trow" style="{z}"><div id="{rid}-tint" class="tint"></div><div class="n">{n}</div><div class="nm">{name}</div>'
                f'<div id="{rid}-sel" class="sel"><div id="{rid}-ring" class="sel-ring"></div><div class="sel-win"><span id="{rid}-s0">No Cursada</span>'
                f'<span id="{rid}-s1" style="opacity:0;color:#165E2E;font-weight:500">Aprobada ✓</span></div><span>▾</span>{extra}</div></div>')

    def badgerow(n, name, rid):
        return (f'<div id="{rid}" class="trow"><div class="n">{n}</div><div class="nm">{name}</div>'
                f'<div class="bwrap"><div id="{rid}-no" class="badge b-no">✕ No disponible</div>'
                f'<div id="{rid}-si" class="badge b-si" style="opacity:0">✓ Disponible</div></div></div>')

    cards = ''
    for i, (lab, val, unit) in enumerate(KPIS):
        x, y = kpos(i)
        start_val = {0: '0', 1: '0,0 %'}.get(i, val)
        c = kcard(i, lab, start_val, unit, x, y, f'h-v{i}')
        cards += c.replace('class="kcard" style="', 'class="kcard" style="opacity:0;') if i >= 2 else c
    att_html = ''
    fy = 560
    for j, (n, name, atts, fin) in enumerate(FINALES):
        chips = ''
        for k, (d, g) in enumerate(atts):
            cls = 'a-mal' if g < 6 else 'a-bien'
            tag = 'aplazo' if g < 6 else 'aprobado'
            chips += (f'<div id="h-a{j}{k}" class="att {cls}"><div class="d">{k + 1}° · {d}</div>'
                      f'<div class="g"><b id="h-a{j}{k}g">{g}</b><i id="h-a{j}{k}i">{tag}</i></div></div>')
        att_html += (f'<div id="h-f{j}" class="fcard" style="top:{fy + j * 286}px"><div class="fhead"><span class="n">{n}</span><span class="nm">{name}</span></div>'
                     f'<div class="ffin"><div class="k">NOTA FINAL</div><div id="h-f{j}v" class="v">{fin}</div></div><div class="atts">{chips}</div></div>')
    hb = f'''
      <div id="h-head" class="abs serif hh1">Seguimiento de<br>Carrera</div>
      <div id="h-cards">{cards}</div>
      <div id="h-tbl" class="abs tbl">
        <div class="lvl" style="border-top:5px solid {a};background:{f};color:{t};border-radius:18px 18px 0 0">Nivel I</div>
        {selrow(4, 'Análisis Matemático I', 'h-r4')}
        {selrow(5, 'Física I', 'h-r5')}
        {selrow(6, 'Química', 'h-r6', f'<div id="h-tap-sel" class="tap" style="left:40%;top:50%"></div><div id="h-dd" class="dd" data-layout-allow-overlap data-layout-allow-occlusion>{dd}</div>', 'z-index:5')}
        <div class="lvl" style="border-top:5px solid {a2};background:{f2};color:{t2}">Nivel II</div>
        {badgerow(11, 'Química Inorgánica', 'h-r11')}
        {badgerow(14, 'Química Orgánica', 'h-r14')}
      </div>
      <div id="h-note1" class="abs note" style="top:1400px">Ejemplo: Niveles I y II aprobados</div>
      <div id="h-note2" class="abs note" style="top:1530px">Ejemplo · valores calculados por la planilla</div>
      <div id="h-fin" class="abs" style="left:0;top:0;width:1080px;height:1920px;background:#FCF7F0;opacity:0">
        <div class="abs tabs"><div id="h-tb0">Seguimiento</div><div id="h-tb1">Exámenes finales</div><div id="h-tb2" class="soft">Nota al estudiante</div></div>
        <div id="h-ul" class="abs tab-ul"></div>
        <div id="h-intro" class="abs soft" style="left:72px;top:420px;width:936px;font-size:40px;line-height:1.35;opacity:0">Se aprueba con 6. Máximo 4 instancias en condición regular.</div>
        {att_html}
        <div id="h-p0" class="prom" style="left:72px"><div class="kl">PROM. SIN APLAZOS</div><div class="kv" style="font-size:64px">7,76</div></div>
        <div id="h-p1" class="prom" style="left:552px"><div class="kl">PROM. CON APLAZOS</div><div class="kv" style="font-size:64px">6,95</div></div>
      </div>'''
    hj = '''
  blurIn('#h-head', 0.0, 0.28);'''
    # primera parte: solo las dos primeras tarjetas
    hj += '''
  tl.fromTo('#h-k0, #h-k1', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out', stagger: 0.08 }, 0.15);
  tl.fromTo('#h-tbl', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 0.3);
  tl.fromTo('#h-tbl .trow', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.35, ease: 'expo.out', stagger: 0.06 }, 0.4);
  tap('#h-tap-sel', 1.2);
  tl.to('#h-r6-ring', { opacity: 1, duration: 0.12 }, 1.32);
  tl.fromTo('#h-dd', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.22, ease: 'expo.out' }, 1.4);
  tap('#h-tap-dd', 1.9);
  tl.to('#h-dd3', { backgroundColor: 'rgba(146,47,161,.12)', duration: 0.1 }, 2.02);
  tl.to('#h-dd', { opacity: 0, duration: 0.15 }, 2.22);
  tl.to('#h-r6-ring', { opacity: 0, duration: 0.2 }, 2.3);
  roll('#h-r6-s0', '#h-r6-s1', 2.25, 40);
  tl.to('#h-r6-tint', { opacity: 1, duration: 0.25 }, 2.3);
  steps('#h-v1', 2.3, ['0,8 %', '1,6 %', '2,4 %'], 0.067); tl.set('#h-v0', { innerHTML: '1' }, 2.3);
  tl.to('#h-r11-no, #h-r14-no', { opacity: 0, scale: 0.8, duration: 0.14, stagger: 0.12 }, 2.6);
  tl.fromTo('#h-r11-si, #h-r14-si', { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)', stagger: 0.12 }, 2.68);
  roll('#h-r4-s0', '#h-r4-s1', 3.25, 40); tl.to('#h-r4-tint', { opacity: 1, duration: 0.2 }, 3.3);
  roll('#h-r5-s0', '#h-r5-s1', 3.4, 40); tl.to('#h-r5-tint', { opacity: 1, duration: 0.2 }, 3.45);'''
    av = ['4,9', '7,3', '9,8', '12,2', '14,6', '17,1', '19,5', '22,0', '24,4', '26,8', '29,3', '31,7', '34,1', '36,6', '39,0']
    hj += f"\n  steps('#h-v1', 3.35, {[v + ' %' for v in av]}, 0.067);"
    hj += f"\n  steps('#h-v0', 3.35, {[str(n) for n in range(2, 18)][:15]}, 0.067); tl.set('#h-v0', {{ innerHTML: '17' }}, 4.36);"
    hj += '''
  blurIn('#h-note1', 3.45);
  // el tablero se rearma con los diez indicadores
  tl.to('#h-tbl', { y: 120, opacity: 0, filter: 'blur(8px)', duration: 0.38, ease: 'power3.in' }, 4.6);
  blurOut('#h-note1', 4.6);'''
    for i in range(2, 10):
        hj += f"\n  tl.fromTo('#h-k{i}', {{ opacity: 0, y: 40, scale: 0.94 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.42, ease: 'expo.out' }}, {4.95 + (i - 2) * 0.09:.2f});"
    hj += '''
  blurIn('#h-note2', 5.8);
  // foco en «Prom. con aplazos» y paso a la pestaña de finales
  tl.to('#h-k0, #h-k1, #h-k2, #h-k3, #h-k4, #h-k5, #h-k7, #h-k8, #h-k9, #h-head, #h-note2', { opacity: 0.25, duration: 0.3 }, 8.0);
  tl.to('#h-k6', { borderColor: '#1344A5', scale: 1.05, duration: 0.3, ease: 'power2.out' }, 8.0);
  tl.set('#h-k6', { transformOrigin: '228px 90px' }, 0);
  tl.to('#h-k6', { scale: 7, x: 240, y: -264, opacity: 0, duration: 0.6, ease: 'power3.in' }, 8.6);
  tl.fromTo('#h-fin', { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }, 8.95);
  tl.set('#h-cards, #h-head, #h-note2', { opacity: 0 }, 9.4);
  tl.set('#h-ul', { transformOrigin: '0% 50%' }, 0);
  tl.to('#h-ul', { x: UL_X, scaleX: UL_S, duration: 0.4, ease: 'power3.inOut' }, 9.5);
  tl.to('#h-tb1', { color: '#1344A5', duration: 0.2 }, 9.6);
  tl.to('#h-tb0', { color: '#4A4F59', duration: 0.2 }, 9.6);
  blurIn('#h-intro', 9.75);'''
    t = 10.2
    fin_times = []
    for j, (n, name, atts, fin) in enumerate(FINALES):
        hj += f"\n  tl.fromTo('#h-f{j}', {{ opacity: 0, y: 40 }}, {{ opacity: 1, y: 0, duration: 0.42, ease: 'expo.out' }}, {t:.2f});"
        tt = t + 0.15
        for k, (d, g) in enumerate(atts):
            hj += (f"\n  tl.fromTo('#h-a{j}{k}', {{ opacity: 0, x: 24 }}, {{ opacity: 1, x: 0, duration: 0.3, ease: 'expo.out' }}, {tt:.2f});"
                   f"\n  tl.fromTo('#h-a{j}{k}g', {{ opacity: 0, scale: 1.4 }}, {{ opacity: 1, scale: 1, duration: 0.26, ease: 'back.out(2)' }}, {tt + 0.16:.2f});"
                   f"\n  blurIn('#h-a{j}{k}i', {tt + 0.24:.2f}, 0.18);")
            tt += 0.34
        hj += f"\n  tl.fromTo('#h-f{j}v', {{ opacity: 0, scale: 1.5 }}, {{ opacity: 1, scale: 1, duration: 0.32, ease: 'back.out(2)' }}, {tt + 0.05:.2f});"
        fin_times.append(tt + 0.05)
        t = tt + 0.2
    hj += f'''
  tl.fromTo('#h-p0, #h-p1', {{ opacity: 0, y: 30 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: 'expo.out', stagger: 0.1 }}, {t + 0.15:.2f});'''
    p_time = t + 0.15
    t0x, t0w = GEOM.get('tab0', [72, 200]); t1x, t1w = GEOM.get('tab1', [316, 280])
    hj = hj.replace('UL_X', str(round(t1x - t0x))).replace('UL_S', '%.3f' % (t1w / t0w))
    hb = hb.replace('class="abs tab-ul"', 'class="abs tab-ul" style="left:%dpx;width:%dpx"' % (round(t0x), round(t0w)))
    hj = shift(hj, lambda t: t + (0.4 if t >= 4.55 else 0))
    herr = scene('herramienta', hb, hj, H_DUR)

    # ───── escena «cierre» ─────
    C_START, C_DUR = 19.4, 6.4
    cb, cj = cierre('c', 'Marcá tus materias.', 'La planilla calcula el resto.',
                    'Tus datos quedan en tu dispositivo.',
                    'Recursos académicos › Seguimiento de Carrera', 'También en Excel y Google Sheets', C_DUR)
    cierre_html = scene('cierre', cb, cj, C_DUR)
    total = round(C_START + C_DUR, 2)
    H = H_START
    sfx = [('pop-a', 0.17, 0.42), ('pop-b', 0.43, 0.42), ('pop-c', 1.33, 0.42), ('pop-a', 1.59, 0.42),
           ('pop-b', 2.48, 0.42), ('pop-c', 2.74, 0.42),
           ('barrido-a', 3.4, 0.55),
           ('toque-a', H + 1.33, 0.8), ('toque-b', H + 2.03, 0.8),
           ('pop-a', H + 2.34, 0.5), ('pop-b', H + 2.72, 0.45), ('pop-c', H + 2.84, 0.45),
           ('barrido-b', H + 4.98, 0.5), ('pop-a', H + 5.4, 0.35), ('pop-b', H + 5.67, 0.35), ('pop-c', H + 5.94, 0.35),
           ('barrido-c', H + 9.0, 0.6),
           ] + [(['pop-a', 'pop-b', 'pop-c'][j], H + ft + 0.42, 0.5) for j, ft in enumerate(fin_times)] + [
           ('pop-a', H + p_time + 0.45, 0.4),
           ('barrido-b', C_START - 0.05, 0.3),
           ('impacto', C_START + 3.4 + 0.35 - 0.9, 0.75)]
    os.makedirs(os.path.join(out, 'compositions'), exist_ok=True)
    open(os.path.join(out, 'compositions/gancho.html'), 'w').write(gancho)
    open(os.path.join(out, 'compositions/herramienta.html'), 'w').write(herr)
    open(os.path.join(out, 'compositions/cierre.html'), 'w').write(cierre_html)
    open(os.path.join(out, 'index.html'), 'w').write(
        index_html('Seguimiento de Carrera — historia',
                   [('gancho', 0, G_DUR), ('herramienta', H_START, H_DUR), ('cierre', C_START, C_DUR)], sfx, total, 'seguimiento'))
    return total, fin_times, p_time


if __name__ == '__main__':
    print('apuntes', build_apuntes())
    print('seguimiento', build_seguimiento())
