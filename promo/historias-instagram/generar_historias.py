#!/usr/bin/env python3
"""Genera los proyectos HyperFrames de las dos historias de Instagram (versión 4).

  apuntes/      Historia 1 · Apuntes Académicos
  seguimiento/  Historia 2 · Seguimiento de Carrera

La interfaz del sitio no se redibuja: cada historia incrusta la página real (DOM tras el JS, CSS,
tipografías e imágenes) en un <iframe> con la vista web de escritorio (1200 px CSS), dentro de una
ventana de navegador. Una cámara acerca las zonas donde hay que leer. Las posiciones se miden dentro
del iframe al arrancar; las capturas y los valores de la herramienta salen de
herramientas/preparar_sitio.cjs. El cierre anima el logo por capas como la intro de los videos de
Series Resueltas (.claude/motor/guia/templates/intro).

Uso:  python3 generar_historias.py
"""
import json
import os
import re
import wave
from string import Template

BASE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(BASE, '..', '..'))
COB, MAU, INK, SOFT = '#1344A5', '#922FA1', '#131720', '#4A4F59'
POS, NEG = '#165E2E', '#9B171F'
# ventana del navegador en el cuadro
WX, WT, WW, WH, BAR = 30, 430, 1020, 1100, 76

_T_END = re.compile(r"(\}\s*,\s*)(\d+(?:\.\d+)?)(\s*\);)")
_T_FN = re.compile(r"((?:tap\(\s*[^,]+,\s*[^,]+,|tapC\(\s*[^,]+,\s*[^,]+,|(?:blurIn|blurOut|pop|steps|cam|camR)\([^,]+,|capSwap\('[^']*',\s*'[^']*',)\s*)(\d+(?:\.\d+)?)")


def shift(js, f):
    """Aplica f(t) a cada tiempo de inicio escrito en el código del timeline."""
    g = lambda m: m.group(1) + ('%.2f' % f(float(m.group(2)))) + (m.group(3) if m.lastindex >= 3 else '')
    return _T_FN.sub(g, _T_END.sub(g, js))


CSS = r"""
@font-face{font-family:'Fraunces';src:url('assets/fonts/fraunces-400-600.woff2') format('woff2');font-weight:400 600;font-style:normal}
@font-face{font-family:'Hanken Grotesk';src:url('assets/fonts/hanken-grotesk-400-600.woff2') format('woff2');font-weight:400 600;font-style:normal}
@font-face{font-family:'Geist Mono';src:url('assets/fonts/geist-mono-400-500.woff2') format('woff2');font-weight:400 500;font-style:normal}
#root{position:absolute;inset:0;overflow:hidden;font-family:'Hanken Grotesk',sans-serif;color:#131720}
.abs{position:absolute}
.serif{font-family:'Fraunces',serif;font-weight:400;letter-spacing:-0.015em}
.mono{font-family:'Geist Mono',monospace}
.cap{position:absolute;left:56px;top:226px;max-width:968px;padding:6px 16px;border-radius:18px;background:#FCF7F0;font-family:'Fraunces',serif;font-size:84px;line-height:1.05;letter-spacing:-0.015em;white-space:nowrap;color:#131720;opacity:0;z-index:40}
.cap em{font-style:normal;color:inherit}
.cap-sub{position:absolute;left:72px;top:338px;font-size:40px;line-height:1.3;color:#4A4F59;white-space:nowrap;opacity:0;z-index:40}
.cam{position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0}
.win{position:absolute;left:30px;top:430px;width:1020px;height:1100px;border-radius:28px;overflow:hidden;background:#F2F4F8;border:1px solid #E1DACE;box-shadow:0 26px 64px rgba(19,23,32,.16)}
.wbar{position:absolute;left:0;top:0;width:100%;height:76px;background:#FFFFFF;border-bottom:1px solid #E7DFD3;display:flex;align-items:center;gap:16px;padding:0 24px;z-index:3}
.wbar i{width:15px;height:15px;border-radius:50%;background:#E2DDD4;flex:0 0 15px}
.url{flex:1;height:48px;margin-left:12px;border-radius:999px;background:#F1EEE8;display:flex;align-items:center;gap:12px;padding:0 22px;font-size:25px;color:#4A4F59;white-space:nowrap;overflow:hidden}
.wbody{position:absolute;left:0;top:76px;width:100%;bottom:0;overflow:hidden}
.scroller{position:absolute;left:0;top:0;width:100%}
.scroller iframe{display:block;border:0;background:#F2F4F8}
.tap{position:absolute;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(19,23,32,.22);opacity:0;pointer-events:none;z-index:60}
.ring{position:absolute;border:3px solid #1344A5;border-radius:10px;box-shadow:0 0 0 6px rgba(19,68,165,.10);opacity:0;pointer-events:none;z-index:55}
.drop{position:absolute;width:190px;background:#FFFFFF;border-radius:10px;box-shadow:0 14px 34px rgba(11,41,100,.22);overflow:hidden;opacity:0;z-index:58}
.drop div{position:relative;height:40px;display:flex;align-items:center;gap:12px;padding:0 16px;font-size:19px}
.drop i{width:16px;height:16px;border-radius:50%;border:2px solid #9AA1AD;flex:0 0 16px}
.flood{position:absolute;left:0;top:0;width:1080px;height:1920px;background:#FCF7F0;opacity:0}
/* chat */
.chat{position:absolute;left:48px;top:470px;width:984px;height:1110px;background:#FFFFFF;border-radius:40px;box-shadow:0 18px 50px rgba(19,23,32,.10);overflow:hidden}
.chat-h{position:absolute;left:0;top:0;width:100%;height:124px;display:flex;align-items:center;gap:22px;padding:0 34px;border-bottom:2px solid #F0EBE3;background:#FFFFFF;z-index:2}
.av{width:72px;height:72px;border-radius:50%;background:#1344A5;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:30px}
.msgs{position:absolute;left:0;right:0;top:150px;display:flex;flex-direction:column;gap:18px;padding:0 30px}
.msg{max-width:720px;align-self:flex-start;opacity:0}
.msg.me{align-self:flex-end}
.msg .who{font-size:27px;font-weight:600;margin:0 0 6px 18px}
.bub{padding:20px 28px;border-radius:30px 30px 30px 8px;background:#F1EEE8;font-size:37px;line-height:1.28}
.msg.me .bub{background:#1344A5;color:#FFFFFF;border-radius:30px 30px 8px 30px}
.typing{display:flex;gap:10px;padding:26px 30px;border-radius:30px 30px 30px 8px;background:#F1EEE8;align-self:flex-start;opacity:0}
.typing span{width:14px;height:14px;border-radius:50%;background:#9AA1AD;display:block}
.prev{margin-top:14px;border-radius:20px;overflow:hidden;background:#FFFFFF;border:2px solid #E7DFD3}
.prev img{display:block;width:100%;height:230px;object-fit:cover}
.prev div{padding:14px 20px 18px}
.prev b{display:block;font-size:32px;font-weight:600;color:#131720}
.prev span{font-size:28px;color:#4A4F59}
/* Drive simulado (vista web) */
.dv{position:absolute;inset:0;background:#FFFFFF}
.dcrumb{position:absolute;left:40px;top:30px;font-size:24px;color:#4A4F59;white-space:nowrap}
.dtitle{position:absolute;left:40px;top:66px;font-size:38px;font-weight:600;white-space:nowrap}
.dhead{position:absolute;left:40px;top:144px;width:940px;height:46px;display:flex;align-items:center;font-size:22px;color:#4A4F59;border-bottom:1px solid #E7DFD3}
.drow{position:absolute;left:24px;width:972px;height:78px;display:flex;align-items:center;font-size:27px;border-bottom:1px solid #F0EBE3;padding:0 16px;border-radius:10px}
.drow .nm{flex:0 0 560px;display:flex;align-items:center;gap:20px;white-space:nowrap}
.drow .c2,.dhead .c2{flex:0 0 220px;font-size:22px;color:#4A4F59}
.drow .c3,.dhead .c3{flex:0 0 140px;font-size:22px;color:#4A4F59;text-align:right}
.dhead .nm{flex:0 0 560px;padding-left:16px}
.dhl{position:absolute;inset:0;border-radius:10px;background:rgba(146,47,161,.09);opacity:0}
.dhl + *{position:relative}
.folder{width:40px;height:33px;flex:0 0 40px}
.pdf{width:34px;height:42px;border-radius:5px;background:#D93025;color:#fff;font:600 12px 'Hanken Grotesk',sans-serif;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;flex:0 0 34px}
.dsec{position:absolute;left:40px;font-size:24px;font-weight:600;color:#4A4F59}
.chipf{position:absolute;left:40px;top:250px;width:440px;height:76px;border:1px solid #E1DACE;border-radius:14px;display:flex;align-items:center;gap:18px;padding:0 22px;font-size:27px;background:#FFFFFF}
.fcard{position:absolute;top:396px;width:296px;height:330px;border:1px solid #E1DACE;border-radius:16px;overflow:hidden;background:#FFFFFF}
.fthumb{position:absolute;left:0;top:0;width:100%;height:232px;background:#F1EEE8;display:flex;justify-content:center;align-items:flex-end}
.fpage{width:180px;height:206px;background:#FFFFFF;box-shadow:0 4px 14px rgba(19,23,32,.10);padding:22px 18px}
.fl{height:9px;border-radius:3px;background:#E1E4E9;margin-bottom:11px}
.fname{position:absolute;left:0;top:232px;width:100%;height:98px;display:flex;align-items:center;gap:14px;padding:0 18px;font-size:21px;line-height:1.25;border-top:1px solid #E7DFD3}
.fhl{position:absolute;inset:0;border:4px solid #922FA1;border-radius:16px;opacity:0}
.viewer{position:absolute;inset:0;background:#E9E3D9;opacity:0}
.vbar{position:absolute;left:0;top:0;width:100%;height:84px;background:#FFFFFF;display:flex;align-items:center;gap:20px;padding:0 36px;font-size:27px;border-bottom:1px solid #E7DFD3}
.page{position:absolute;left:260px;top:112px;width:500px;height:610px;background:#FFFFFF;box-shadow:0 14px 34px rgba(11,41,100,.14);padding:54px 48px}
.ln{height:14px;border-radius:4px;background:#E1E4E9;margin-bottom:17px}
.ln.t{height:26px;width:62%;background:#CED2D9;margin-bottom:34px}
/* muro de materias */
.tile{position:absolute;width:196px;height:110px;border-radius:12px;overflow:hidden;opacity:0}
.tile img{width:100%;height:100%;object-fit:cover;display:block}
/* cierre */
.end{position:absolute;left:0;top:0;width:1080px;height:1920px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding-bottom:200px}
.end svg{width:660px;height:660px;overflow:visible}
.end-name{font-size:128px;margin-top:4px;display:flex;line-height:1.05}
.end-name span{display:inline-block;opacity:0}
.end-url{font-size:48px;color:#1344A5;margin-top:16px;opacity:0}
.end-sec{font-size:42px;color:#4A4F59;margin-top:18px;line-height:1.3;opacity:0}
.end-extra{font-size:36px;color:#4A4F59;margin-top:12px;opacity:0}
/* seguimiento */
.qq{position:absolute;left:72px;font-family:'Fraunces',serif;font-size:88px;line-height:1.05;letter-spacing:-0.015em;white-space:nowrap;opacity:0}
.qh{position:absolute;left:76px;display:flex;align-items:center;gap:12px;font-size:34px;color:#4A4F59;white-space:nowrap;opacity:0}
.pn{min-width:58px;height:58px;padding:0 14px;border-radius:14px;background:#FFFFFF;border:2px solid #E1DACE;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:36px;color:#131720}
.seg{width:12px;height:30px;border-radius:3px;background:#E1DACE}
.kp{position:absolute;width:470px;height:170px;background:#FFFFFF;border:1px solid #CED2D9;border-radius:20px;padding:22px 30px;opacity:0;box-shadow:0 14px 40px rgba(19,23,32,.12);z-index:62}
.kp .l{font-family:'Geist Mono',monospace;font-size:28px;letter-spacing:.06em;color:#4A4F59;text-transform:uppercase}
.kp .v{font-family:'Fraunces',serif;font-size:78px;line-height:1.15;display:inline-block;transform-origin:0% 60%}
.feat{position:absolute;display:flex;align-items:center;gap:18px;padding:22px 34px;border-radius:999px;background:#FFFFFF;border:2px solid #E7DFD3;box-shadow:0 14px 36px rgba(19,23,32,.12);font-size:38px;font-weight:500;white-space:nowrap;opacity:0;z-index:30}
.feat i{width:40px;height:40px;border-radius:50%;background:#1344A5;color:#fff;font-style:normal;font-size:26px;display:flex;align-items:center;justify-content:center}
"""

HELPERS = r"""
  const tl = gsap.timeline({ paused: true });
  const blurIn = (s, t, d) => tl.fromTo(s, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: d || 0.24, ease: 'power4.out' }, t);
  const blurOut = (s, t, d) => tl.to(s, { opacity: 0, filter: 'blur(10px)', duration: d || 0.18, ease: 'power2.in' }, t);
  let tapN = 0;
  const tap = (x, y, t) => {
    const s = (tapN++ % 2) ? '#tap2' : '#tap1';
    tl.set(s, { left: x, top: y }, t);
    tl.fromTo(s, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out', immediateRender: false }, t);
    tl.to(s, { scale: 0.8, duration: 0.08, ease: 'power2.in' }, t + 0.13);
    tl.to(s, { scale: 1.05, opacity: 0, duration: 0.22, ease: 'power2.out' }, t + 0.22);
  };
  let tapM = 0;
  const tapC = (x, y, t) => {
    const s = (tapM++ % 2) ? '#tap4' : '#tap3';
    tl.set(s, { left: x, top: y }, t);
    tl.fromTo(s, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out', immediateRender: false }, t);
    tl.to(s, { scale: 0.8, duration: 0.08, ease: 'power2.in' }, t + 0.13);
    tl.to(s, { scale: 1.05, opacity: 0, duration: 0.22, ease: 'power2.out' }, t + 0.22);
  };
  const steps = (s, t, vals, dt) => vals.forEach((v, i) => tl.set(s, { innerHTML: v }, t + i * dt));
  const pop = (s, t) => tl.fromTo(s, { scale: 1.35 }, { scale: 1, duration: 0.3, ease: 'back.out(2.2)', immediateRender: false }, t);
  const capSwap = (a, b, t) => { if (a) blurOut(a, t, 0.16); blurIn(b, t + 0.12, 0.26); };
"""

# cámara sobre la ventana: lleva el rectángulo (en px del cuadro, sin cámara) al centro de la zona visible
CAMERA = r"""
  const WX = $WX, CT = $CT, ZF = $ZF;
  const RR = (el) => el.getBoundingClientRect();
  const P = (x, y, S) => [WX + x * ZF, CT + (y - S) * ZF];            // px CSS del sitio -> px del cuadro
  const enfoque = (x0, y0, x1, y1, S, k) => {
    const a = P(x0, y0, S), b = P(x1, y1, S);
    const kk = Math.min(k, 1000 / (b[0] - a[0]), 1060 / (b[1] - a[1]));
    return { scale: kk, x: 540 - kk * (a[0] + b[0]) / 2, y: Math.max(1000 - kk * (a[1] + b[1]) / 2, 372 - kk * $WT) };
  };
  const cam = (sel, t, d, st) => tl.to(sel, Object.assign({ duration: d, ease: 'power2.inOut' }, st), t);
"""


def wav_dur(proj, name):
    with wave.open(os.path.join(BASE, proj, 'assets/sfx', name + '.wav')) as w:
        return w.getnframes() / w.getframerate()


def scene(cid, body, js, dur, iframe_id=None, fonts=False):
    if iframe_id:
        boot = Template(r"""
  const fr = document.getElementById('$fid');
  function arrancar() {
    const D = fr.contentDocument;
    const Q = (s) => D.querySelector(s);
    const QA = (s) => Array.from(D.querySelectorAll(s));
$HELPERS$JS
    window.__timelines['$cid'] = tl;
  }
  function listo() { const D = fr.contentDocument; return D && D.readyState === 'complete' && D.querySelector('main'); }
  function esperar() {
    const D = fr.contentDocument;
    const imgs = Array.from(D.images).map((i) => (i.complete ? Promise.resolve() : (i.decode ? i.decode().catch(() => 0) : Promise.resolve())));
    return Promise.all([D.fonts.ready, document.fonts.ready].concat(imgs)).then(arrancar);
  }
  if (listo()) esperar(); else fr.addEventListener('load', esperar);
""").substitute(fid=iframe_id, HELPERS=HELPERS, JS=js, cid=cid)
    elif fonts:
        boot = "\n  document.fonts.ready.then(() => {" + HELPERS + js + f"\n  window.__timelines['{cid}'] = tl;\n  }});\n"
    else:
        boot = HELPERS + js + f"\n  window.__timelines['{cid}'] = tl;\n"
    return f'''<template>
  <style>{CSS}</style>
  <div id="root" data-composition-id="{cid}" data-width="1080" data-height="1920">
    <div id="{cid}-all" class="clip" data-start="0" data-duration="{dur}" data-track-index="1" style="position:absolute;inset:0">{body}
    </div>
  </div>
  <script>{boot}
  </script>
</template>
'''


def index_html(title, scenes, sfx, total, proj):
    hosts = ''
    for i, (sid, start, dur) in enumerate(scenes):
        hosts += f'''
      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{start}" data-duration="{dur}" data-track-index="{1 + (i % 2)}" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:{i + 1}"></div>'''
    audio = ''
    for i, (name, t, vol) in enumerate(sorted(sfx, key=lambda s: s[1])):
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


def win(wid, url, inner, extra_style=''):
    lock = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A4F59" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
    return (f'<div id="{wid}" class="win" style="{extra_style}"><div class="wbar"><i></i><i></i><i></i>'
            f'<div class="url">{lock}<span>{url}</span></div></div><div class="wbody">{inner}</div></div>')


# ─────────────── cierre: logo animado por capas (como la intro de Series Resueltas) ───────────────
LOGO_PARAMS = {
    'cuadros': [[656, 684, 1406, 1435, 0], [1522, 684, 2273, 1435, 1], [2390, 684, 3143, 1435, 2],
                [656, 1542, 1407, 2295, 1], [1518, 1541, 2275, 2295, 2], [2390, 1541, 3143, 2295, 3],
                [656, 2398, 1407, 3151, 2], [1512, 2398, 2265, 3151, 3]],
    'escritura': {'caja': [406, 1236, 3600, 2506], 'angulo': -8, 'borde': 150},
    'verde': {'caja': [598, 2171, 2380, 2631], 'angulo': -14.5, 'borde': 140},
    'naranja': {'caja': [888, 2192, 2678, 2652], 'angulo': -14.4, 'borde': 140},
    'azul_caja': [2425, 2421, 3316, 3318],
    'T': {'cuadros': [0.14, 0.07, 0.3], 'azul': [0.42, 0.78], 'escritura': [0.5, 1.1], 'punto_i': [1.06, 1.24],
          'verde': [0.98, 1.22], 'naranja': [1.06, 1.32]},
}
LOGO_JS = r"""
  // capas del logo (port de la intro de los videos de Series Resueltas), con tweens de GSAP buscables
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('c-svg');
  const nodo = (tag, at) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); return e; };
  const LP = $LP, T = LP.T, L0 = 0;
  const defs = nodo('defs', {}); svg.insertBefore(defs, svg.firstChild);
  svg.querySelectorAll('[fill="#b6b9bd"]').forEach((n) => n.remove());
  const uno = (c) => svg.querySelector('g[fill="' + c + '"]') || svg.querySelector('path[fill="' + c + '"]');
  const gris = uno('#a3a6aa'), azul = uno('#77a8c9'), naranja = uno('#df8642'), verde = uno('#758346');
  const negros = Array.from(svg.children).filter((n) => n.tagName === 'path' && !n.getAttribute('fill'));
  negros.sort((a, b) => b.getAttribute('d').length - a.getAttribute('d').length);
  const escritura = negros[0], puntos = negros.slice(1);
  const ancla = nodo('g', {}); svg.insertBefore(ancla, gris); gris.remove();
  const pluma = (x) => 0.55 * x + 0.45 * (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  LP.cuadros.forEach((q) => {
    const r = nodo('rect', { x: q[0], y: q[1], width: q[2] - q[0] + 1, height: q[3] - q[1] + 1, fill: '#a3a6aa' });
    ancla.appendChild(r);
    tl.fromTo(r, { scale: 0.55, opacity: 0, svgOrigin: ((q[0] + q[2]) / 2) + ' ' + ((q[1] + q[3]) / 2) },
      { scale: 1, opacity: 1, duration: T.cuadros[2], ease: 'power4.out' }, L0 + T.cuadros[0] + q[4] * T.cuadros[1]);
  });
  const mascara = (id, cfg, el, tr) => {
    const a = cfg.angulo * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a), c = cfg.caja;
    const proy = [[c[0], c[1]], [c[2], c[1]], [c[0], c[3]], [c[2], c[3]]].map((p) => p[0] * dx + p[1] * dy);
    const s0 = Math.min.apply(null, proy), s1 = Math.max.apply(null, proy), b = cfg.borde;
    const at = (u) => { const s = s0 - b + (s1 - s0 + 2 * b) * u; return { x1: (s - b) * dx, y1: (s - b) * dy, x2: s * dx, y2: s * dy }; };
    const gr = nodo('linearGradient', Object.assign({ id: 'g-' + id, gradientUnits: 'userSpaceOnUse' }, at(0)));
    gr.append(nodo('stop', { offset: 0, 'stop-color': '#fff' }), nodo('stop', { offset: 1, 'stop-color': '#000' }));
    const m = nodo('mask', { id: 'm-' + id, maskUnits: 'userSpaceOnUse', x: -4000, y: -4000, width: 12000, height: 12000 });
    m.appendChild(nodo('rect', { x: -4000, y: -4000, width: 12000, height: 12000, fill: 'url(#g-' + id + ')' }));
    defs.append(gr, m);
    el.setAttribute('mask', 'url(#m-' + id + ')');
    tl.fromTo(gr, { attr: at(0) }, { attr: at(1), duration: tr[1] - tr[0], ease: pluma }, L0 + tr[0]);
  };
  mascara('esc', LP.escritura, escritura, T.escritura);
  mascara('ver', LP.verde, verde, T.verde);
  mascara('nar', LP.naranja, naranja, T.naranja);
  const ac = LP.azul_caja;
  tl.fromTo(azul, { x: 160, y: -220, scale: 0.8, opacity: 0, svgOrigin: ((ac[0] + ac[2]) / 2) + ' ' + ((ac[1] + ac[3]) / 2) },
    { x: 0, y: 0, scale: 1, opacity: 1, duration: T.azul[1] - T.azul[0], ease: 'power4.out' }, L0 + T.azul[0]);
  puntos.forEach((p) => tl.fromTo(p, { y: -160, opacity: 0 }, { y: 0, opacity: 1, duration: T.punto_i[1] - T.punto_i[0], ease: 'power4.out' }, L0 + T.punto_i[0]));
"""


def cierre(sec, extra):
    svg = open(os.path.join(REPO, 'assets/img/logo/achetiq-logo.svg')).read()
    svg = re.sub(r'<svg[^>]*>', '<svg id="c-svg" xmlns="http://www.w3.org/2000/svg" viewBox="160 135 3566 3566">', svg, count=1)
    letters = ''.join(f'<span>{c}</span>' for c in 'AChETIQ')
    ex = f'<div id="c-ex" class="end-extra">{extra}</div>' if extra else ''
    body = f'''
      <div class="abs" style="inset:0;background:#FCF7F0"></div>
      <div class="end">
        {svg}
        <div id="c-name" class="serif end-name">{letters}</div>
        <div id="c-url" class="end-url mono">achetiq.github.io</div>
        <div id="c-sec" class="end-sec">{sec}</div>{ex}
      </div>'''
    js = Template(LOGO_JS).substitute(LP=json.dumps(LOGO_PARAMS)) + '''
  tl.fromTo('#c-name span', { opacity: 0, filter: 'blur(6px)', y: 16 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.24, stagger: 0.05, ease: 'power3.out' }, 1.3);
  blurIn('#c-url', 1.7); blurIn('#c-sec', 1.85);'''
    if extra:
        js += "\n  blurIn('#c-ex', 1.97);"
    return body, js


def caps(p, items):
    out = ''
    for cid, html, sub in items:
        out += f'<div id="{p}-{cid}" class="cap">{html}</div>'
        if sub:
            out += f'<div id="{p}-{cid}s" class="cap-sub">{sub}</div>'
    return out


FOLDER = '<svg class="folder" viewBox="0 0 64 52"><path d="M4 8a4 4 0 0 1 4-4h16l6 6h26a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#5F6368"/></svg>'
PDF = '<div class="pdf" data-layout-ignore>PDF</div>'
IRQ = 'Ingeniería de las Reacciones Químicas'
TAPS = '<div id="tap1" class="tap"></div><div id="tap2" class="tap"></div>'


def write_project(proj, files, index):
    os.makedirs(os.path.join(proj, 'compositions'), exist_ok=True)
    for old in os.listdir(os.path.join(proj, 'compositions')):
        os.remove(os.path.join(proj, 'compositions', old))
    for name, html in files.items():
        open(os.path.join(proj, 'compositions', name + '.html'), 'w').write(html)
    open(os.path.join(proj, 'index.html'), 'w').write(index)


# ═════════════════════════════════ HISTORIA 1 · APUNTES ═════════════════════════════════
def build_apuntes():
    proj = os.path.join(BASE, 'apuntes')
    M = json.load(open(os.path.join(proj, 'medidas.json')))
    W, H = M['W'], max(M['H'], M.get('docH', 0) + 20)
    ZF = WW / W

    # ───── escena 1 · gancho (chat) ─────
    G_DUR = 4.45
    msgs = [('me', '', '¿Alguien tiene la Serie 7 de Reacciones resuelta?'),
            ('', 'Paraguayo', 'creo que estaba en un drive viejo'),
            ('', 'Ele P', 'a mí me la pasaron por mail y no la encuentro'),
            ('me', '', 'rindo esta semana y no tengo nada')]
    colors = {'Paraguayo': '#8E6AC7', 'Ele P': '#039585', 'Vicki G': '#AA7323'}
    mh = ''
    for i, (who, name, text) in enumerate(msgs):
        nm = f'<div class="who" style="color:{colors[name]}">{name}</div>' if name else ''
        mh += f'<div id="g-m{i}" class="msg {who}">{nm}<div class="bub">{text}</div></div>'
    mh += '<div id="g-typ" class="typing"><span></span><span></span><span></span></div>'
    mh += (f'<div id="g-m4" class="msg"><div class="who" style="color:{colors["Vicki G"]}">Vicki G</div><div class="bub">Está todo en la página de AChETIQ'
           '<div id="g-prev" class="prev"><img src="assets/img/og-image-achetiq.png" alt=""><div><b>Apuntes Académicos - AChETIQ</b>'
           '<span>achetiq.github.io</span></div></div></div></div>')
    gb = f'''
      <div class="abs" style="inset:0;background:#FCF7F0"></div>
      <div id="g-q" class="cap" style="white-space:normal;font-size:96px;opacity:1">¿Otra vez buscando<br>apuntes?</div>
      <div id="g-ok" class="cap" style="font-size:96px">Está todo acá.</div>
      <div id="g-chat" class="chat" data-layout-allow-overlap data-layout-allow-occlusion>
        <div class="chat-h" data-layout-allow-overlap><div class="av">IQ</div><div><div style="font-size:38px;font-weight:600">IQ · 4º año</div><div style="font-size:28px;color:#4A4F59">Grupo de la cursada</div></div></div>
        <div id="g-msgs" class="msgs" data-layout-allow-overlap>{mh}</div>
      </div>
      <div id="g-morph" class="abs" style="left:{WX}px;top:{WT}px;width:{WW}px;height:{WH}px;background:#F2F4F8;border-radius:28px;opacity:0;z-index:30"></div>
      {TAPS}'''
    gj = Template(r"""
  const ids = ['#g-m0', '#g-m1', '#g-m2', '#g-m3', '#g-typ', '#g-m4'];
  const hs = ids.map((s) => document.querySelector(s).offsetHeight + 18);
  const AV = 1110 - 150 - 30;
  const upto = (k) => { let h = 0; for (let j = 0; j <= k; j++) { if (j === 4 && k === 5) continue; h += hs[j]; } return -Math.max(0, h - AV); };
  tl.set('#g-msgs', { y: 0 }, 0);
  tl.set('#g-m0, #g-m1', { opacity: 1 }, 0);
  const reveal = (k, t) => {
    tl.to('#g-msgs', { y: upto(k), duration: 0.32, ease: 'power3.out' }, t);
    tl.fromTo(ids[k], { opacity: 0, y: 26, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'back.out(1.6)' }, t);
  };
  reveal(2, 0.7); reveal(3, 1.35);
  reveal(4, 2.05);
  tl.fromTo('#g-typ span', { y: 0 }, { y: -8, duration: 0.14, yoyo: true, repeat: 1, stagger: 0.08, ease: 'sine.inOut' }, 2.15);
  tl.to('#g-typ', { opacity: 0, duration: 0.1 }, 2.48);
  tl.to('#g-msgs', { y: upto(5), duration: 0.32, ease: 'power3.out' }, 2.5);
  tl.set('#g-typ', { display: 'none' }, 2.5);
  tl.fromTo('#g-m4', { opacity: 0, y: 26, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.34, ease: 'back.out(1.6)' }, 2.5);
  capSwap('#g-q', '#g-ok', 2.8);
  const pr = document.querySelector('#g-prev').getBoundingClientRect();
  const rr = document.querySelector('#gancho-all').getBoundingClientRect();
  const sx = 1080 / rr.width;
  const px = (pr.left - rr.left) * sx, py = (pr.top - rr.top) * sx, pw = pr.width * sx, ph = pr.height * sx;
  tap(px + pw * 0.5, py + ph * 0.45, 3.3);
  tl.fromTo('#g-prev', { scale: 1 }, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 }, 3.42);
  // la vista previa del enlace se convierte en la ventana del sitio
  tl.set('#g-morph', { transformOrigin: '0px 0px', x: px - $WX, y: py - $WT, scaleX: pw / $WW, scaleY: ph / $WH, opacity: 1 }, 3.58);
  tl.to('#g-morph', { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.62, ease: 'power3.inOut' }, 3.58);
  tl.to('#g-chat', { opacity: 0, scale: 0.96, filter: 'blur(6px)', duration: 0.4, ease: 'power2.in' }, 3.6);
  blurOut('#g-ok', 3.95, 0.2);
""").substitute(WX=WX, WT=WT, WW=WW, WH=WH)
    gancho = scene('gancho', gb, gj, G_DUR, fonts=True)

    # ───── escena 2 · recorrido ─────
    R0 = 3.95
    R = json.load(open(os.path.join(REPO, 'data/recursos.json')))
    mats = [m for m in R if m.get('anio')]
    irq_i = next(i for i, m in enumerate(mats) if m['id'] == 'ingenieria-de-las-reacciones-quimicas')
    slots = [(c, r) for r in range(8) for c in range(5)][:len(mats)]
    order = list(range(len(mats)))
    centro = slots.index((2, 3))
    order[irq_i], order[centro] = order[centro], order[irq_i]
    year_col = {1: '#E7CDAA', 2: '#D1A6D8', 3: '#89AFD6', 4: '#537ABB', 5: '#264A8E'}
    TX, TY, TW, TH, G = 30, 520, 196, 110, 12
    tiles = ''
    tpos = {}
    for slot_i, mi in enumerate(order):
        m = mats[mi]
        c, r = slots[slot_i]
        x, y = TX + c * (TW + G), TY + r * (TH + G)
        if r == 7:
            x += (5 - (len(mats) - 35)) * (TW + G) / 2
        tpos[m['id']] = (x, y)
        tiles += (f'<div id="r-t-{m["id"]}" class="tile" data-layout-ignore style="left:{x:.0f}px;top:{y:.0f}px;background:{year_col[m["anio"]]}">'
                  f'<img src="assets/site/assets/img/materias/{m["id"]}.webp" alt=""></div>')
    ix, iy = tpos['ingenieria-de-las-reacciones-quimicas']

    def drow(rid, kind, name, fecha, tam, top):
        ic = FOLDER if kind == 'folder' else PDF
        return (f'<div id="{rid}" class="drow" style="top:{top}px"><div id="{rid}-hl" class="dhl"></div>'
                f'<div class="nm">{ic}<span>{name}</span></div><div class="c2">{fecha}</div><div class="c3">{tam}</div></div>')
    head = '<div class="dhead"><div class="nm">Nombre ↑</div><div class="c2">Última modificación</div><div class="c3">Tamaño</div></div>'
    raiz = (drow('r-d1', 'folder', '03. Práctica', '3 sept 2026', '—', 196) +
            drow('r-d2', 'folder', '05. Presentaciones', '3 sept 2026', '—', 274))

    def fcard(fid, name, left):
        lines = ''.join(f'<div class="fl" style="width:{w}%"></div>' for w in [70, 100, 92, 100, 80, 96, 64, 100, 88])
        return (f'<div id="{fid}" class="fcard" style="left:{left}px"><div class="fthumb"><div class="fpage">{lines}</div></div>'
                f'<div class="fname">{PDF}<span>{name}</span></div><div id="{fid}-hl" class="fhl"></div></div>')
    practica = ('<div class="dsec" style="top:206px">Carpetas</div>'
                f'<div id="r-e1" class="chipf">{FOLDER}<span>Guías de Estudio</span></div>'
                '<div class="dsec" style="top:354px">Archivos</div>' +
                fcard('r-e2', '2024 - GS - Resolución Serie 07.pdf', 40) +
                fcard('r-e3', '2024 - NCMQ - Resolución Serie 06.pdf', 362) +
                fcard('r-e4', '2024 - SMR - Resolución Series.pdf', 684))
    lines = '<div class="ln t"></div>' + ''.join(
        f'<div class="ln" style="width:{w}%{";background:transparent" if w == 0 else ""}"></div>'
        for w in [100, 94, 98, 72, 0, 100, 88, 96, 60, 0, 100, 91, 97, 83, 100, 55, 0, 100, 76])
    sitio = (f'<div id="r-scr" class="scroller"><iframe id="r-fr" src="assets/site/pages/recursos/apuntes.html" '
             f'style="width:{W}px;height:{H}px;zoom:{ZF:.5f}" scrolling="no"></iframe></div>')
    drive = f'''<div id="r-dv" class="dv">
          <div id="r-l1" class="abs" style="inset:0"><div class="dcrumb">Compartidos conmigo › AChETIQ</div><div class="dtitle">{IRQ}</div>{head}{raiz}</div>
          <div id="r-l2" class="abs" style="inset:0;opacity:0"><div class="dcrumb">… › {IRQ}</div><div class="dtitle">03. Práctica</div>{practica}</div>
          <div id="r-morph" class="abs" style="left:0;top:0;width:1020px;height:774px;background:#E9E3D9;opacity:0"></div>
          <div id="r-view" class="viewer"><div class="vbar">{PDF}<span>2024 - GS - Resolución Serie 07.pdf</span></div><div id="r-page" class="page">{lines}</div></div>
        </div>'''
    rb = f'''
      <div id="r-cam" class="cam">
        {win('r-win', 'achetiq.github.io/pages/recursos/apuntes', sitio, 'opacity:0')}
        {TAPS}
      </div>
      {win('r-win2', 'drive.google.com · Compartidos conmigo', drive, 'opacity:0;z-index:25;top:400px;height:470px')}
      <div id="r-flood" class="flood" style="z-index:23"></div>
      <div id="r-wall" class="abs" style="left:0;top:0;width:1080px;height:1920px;z-index:24">{tiles}</div>
      {caps('r', [('c1', 'Apuntes de cada materia', None), ('c2', 'Filtrá por año', None),
                  ('c3', 'Elegí tu materia', None), ('c4', 'Su carpeta en Drive', None),
                  ('c5', 'Guías y series resueltas', None), ('c6', 'La Serie 7, encontrada.', None)])}
      <div id="r-cnt" class="cap" style="display:flex;align-items:baseline;gap:22px"><span id="r-n" style="font-size:170px;line-height:.9">1</span><span>materias</span></div>
      <div id="r-cnts" class="cap-sub" style="top:418px">cada una con su carpeta de Drive</div>
      <div id="r-claim" class="cap" style="white-space:normal;font-size:96px">Toda la carrera,<br>a un toque.</div>
      <div id="r-claims" class="cap-sub" style="top:446px">Apuntes y guías aportados por estudiantes.</div>
      {TAPS.replace('tap1', 'tap3').replace('tap2', 'tap4')}'''
    rj = Template(CAMERA.replace('$WT', str(WT)) + r"""
  const p4 = Q('.pill-nav__pill[data-anio="4"]'), pT = Q('.pill-nav__pill[data-anio="all"]');
  const hd = RR(Q('.page-header')), fl = RR(Q('.apuntes-filter')), pr4 = RR(p4);
  const card = QA('.apuntes__grid > *').find((c) => (c.textContent || '').indexOf('Reacciones Químicas') >= 0);
  const otros = QA('.apuntes__grid > *').filter((c) => c.getAttribute('data-anio') !== '4');
  otros.forEach((c) => { c.style.display = 'none'; });
  const gr = RR(Q('.apuntes__grid')), cr = RR(card), cv = RR(card.querySelector('.card-materia__cover'));
  otros.forEach((c) => { c.style.display = ''; });
  const S1 = Math.max(0, gr.top - 40);
  // la ventana aparece donde terminó la vista previa del enlace
  tl.fromTo('#r-win', { opacity: 0 }, { opacity: 1, duration: 0.18 }, 0.22);
  blurIn('#r-c1', 0.4);
  // 1) cabecera real: se acerca para leer de qué se trata
  cam('#r-cam', 0.6, 0.8, enfoque(hd.left - 10, hd.top - 30, hd.right * 0.62, hd.bottom + 10, 0, 1.7));
  // 2) filtro por año
  capSwap('#r-c1', '#r-c2', 2.0);
  const ef = enfoque(fl.left - 10, fl.top - 20, fl.left + 760, fl.bottom + 30, 0, 1.8);
  cam('#r-cam', 2.0, 0.6, ef);
  const p4c = P(pr4.left + pr4.width / 2, pr4.top + pr4.height / 2, 0);
  tap(p4c[0], p4c[1], 2.75);
  tl.set(pT, { attr: { class: 'pill-nav__pill', 'aria-pressed': 'false' } }, 2.9);
  tl.set(p4, { attr: { class: 'pill-nav__pill is-active', 'aria-pressed': 'true' } }, 2.9);
  const grid = Q('.apuntes__grid');
  tl.to(grid, { opacity: 0, duration: 0.1 }, 2.9);
  otros.forEach((c) => tl.set(c, { display: 'none' }, 3.0));
  tl.to(grid, { opacity: 1, duration: 0.22 }, 3.02);
  // 3) desplazamiento continuo hasta las tarjetas de 4º año y acercamiento a IRQ
  capSwap('#r-c2', '#r-c3', 3.3);
  cam('#r-cam', 3.25, 1.1, { scale: 1, x: 0, y: 0 });
  tl.to('#r-scr', { y: -S1 * ZF, duration: 1.4, ease: 'power2.inOut' }, 3.3);
  const ei = enfoque(cr.left - 20, cr.top - 20, cr.right + 20, cr.bottom + 20, S1, 1.6);
  cam('#r-cam', 4.6, 0.7, ei);
  const cc = P(cv.left + cv.width / 2, cv.top + cv.height / 2, S1);
  tap(cc[0], cc[1], 5.45);
  tl.to(card, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 5.57);
  // 4) se entra a la materia: la portada se agranda y desaparece
  blurOut('#r-c3', 5.7, 0.16);
  tl.to(card.querySelector('.card-materia__body'), { opacity: 0, duration: 0.14 }, 5.72);
  tl.to(card, { borderColor: 'rgba(0,0,0,0)', boxShadow: 'none', backgroundColor: 'rgba(0,0,0,0)', duration: 0.14 }, 5.72);
  const kd = 7.5;
  cam('#r-cam', 5.75, 0.72, { scale: kd, x: 540 - kd * cc[0], y: 960 - kd * cc[1], ease: 'power2.in' });
  tl.to('#r-cam', { opacity: 0, filter: 'blur(14px)', duration: 0.26, ease: 'power1.in' }, 6.22);
  tl.fromTo('#r-win2', { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'expo.out' }, 6.4);
  blurIn('#r-c4', 6.55);
  tl.fromTo('#r-d1, #r-d2', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.34, ease: 'expo.out', stagger: 0.08 }, 6.6);
  // 5) carpeta 03. Práctica (la más completa de la materia)
  tapC($D1X, $D1Y, 7.7);
  tl.to('#r-d1-hl', { opacity: 1, duration: 0.1 }, 7.82);
  tl.to('#r-l1', { x: -1020, duration: 0.42, ease: 'power3.inOut' }, 7.95);
  tl.to('#r-win2', { height: 850, duration: 0.42, ease: 'power3.inOut' }, 7.95);
  tl.set('#r-l1', { opacity: 0 }, 8.4);
  tl.fromTo('#r-l2', { x: 1020, opacity: 1 }, { x: 0, opacity: 1, duration: 0.42, ease: 'power3.inOut' }, 7.95);
  capSwap('#r-c4', '#r-c5', 8.05);
  tl.fromTo('#r-e1, #r-e2, #r-e3, #r-e4', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.34, ease: 'expo.out', stagger: 0.07 }, 8.2);
  // 6) se abre la Serie 7: la tarjeta crece hasta el visor
  tapC($E2X, $E2Y, 9.45);
  tl.to('#r-e2-hl', { opacity: 1, duration: 0.12 }, 9.57);
  tl.set('#r-morph', { transformOrigin: '0px 0px', x: 40, y: 396, scaleX: 296 / 1020, scaleY: 330 / 774, opacity: 1 }, 9.75);
  tl.set('#r-l2', { opacity: 0 }, 10.4);
  tl.to('#r-morph', { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.48, ease: 'power3.inOut' }, 9.75);
  tl.to('#r-view', { opacity: 1, duration: 0.22 }, 10.1);
  tl.fromTo('#r-page', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'expo.out' }, 10.15);
  tl.fromTo('#r-page .ln', { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.25, stagger: 0.03, ease: 'power2.out' }, 10.25);
  capSwap('#r-c5', '#r-c6', 10.1);
  // 7) la ventana vuelve a ser una portada: el muro de las 38 materias
  tl.to('#r-win2', { x: $TGX, y: $TGY, scaleX: $TSX, scaleY: $TSY, transformOrigin: '0px 0px', opacity: 0.0, duration: 0.6, ease: 'power3.inOut' }, 11.45);
  tl.fromTo('#r-flood', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 11.5);
  blurOut('#r-c6', 11.5, 0.16);
  tl.fromTo('#r-t-ingenieria-de-las-reacciones-quimicas', { opacity: 0 }, { opacity: 1, duration: 0.25 }, 11.85);
$WALL
  blurIn('#r-cnt', 11.95); blurIn('#r-cnts', 12.1);
  steps('#r-n', 12.0, $NUMS, 0.033);
  blurOut('#r-cnt', 13.65); blurOut('#r-cnts', 13.65);
  blurIn('#r-claim', 13.8, 0.28); blurIn('#r-claims', 14.1);
  tl.to('#r-wall', { y: 70, scale: 0.94, transformOrigin: '540px 1000px', duration: 0.6, ease: 'power2.inOut' }, 13.65);
  blurOut('#r-claim', 15.65); blurOut('#r-claims', 15.65);
$CONV
""")
    wall = ''
    conv = ''
    for mid, (x, y) in tpos.items():
        if mid == 'ingenieria-de-las-reacciones-quimicas':
            continue
        d = ((x - ix) ** 2 + (y - iy) ** 2) ** 0.5
        wall += f"\n  tl.fromTo('#r-t-{mid}', {{ opacity: 0, scale: 0.4 }}, {{ opacity: 1, scale: 1, duration: 0.34, ease: 'back.out(1.7)' }}, {12.0 + d / 1100:.2f});"
        conv += f"\n  tl.to('#r-t-{mid}', {{ x: {540 - (x + 98):.0f}, y: {800 - (y + 55):.0f}, scale: 0.2, opacity: 0, duration: 0.42, ease: 'power3.in' }}, {15.7 + (1 - d / 1400) * 0.25:.2f});"
    conv += f"\n  tl.to('#r-t-ingenieria-de-las-reacciones-quimicas', {{ x: {540 - (ix + 98):.0f}, y: {800 - (iy + 55):.0f}, scale: 0.2, opacity: 0, duration: 0.42, ease: 'power3.in' }}, 15.95);"
    body_y = WT + BAR
    rj = rj.substitute(WX=WX, CT=WT + BAR, ZF=f'{ZF:.5f}',
                       D1X=WX + 400, D1Y=400 + BAR + 196 + 39, E2X=WX + 40 + 148, E2Y=400 + BAR + 396 + 140,
                       TGX=f'{ix - WX:.1f}', TGY=f'{iy - 400:.1f}', TSX=f'{TW / WW:.4f}', TSY=f'{TH / 850:.4f}',
                       WALL=wall, CONV=conv, NUMS=json.dumps([str(n) for n in range(1, 39)]))
    R_DUR = 16.5
    recorrido = scene('recorrido', rb, rj, R_DUR, iframe_id='r-fr')

    # ───── escena 3 · cierre ─────
    C0 = round(R0 + 16.22, 2)
    C_DUR = 3.9
    cb, cj = cierre('Recursos académicos › Apuntes', '')
    cierre_html = scene('cierre', cb, cj, C_DUR)
    total = round(C0 + C_DUR, 2)

    sfx = [('pop-a', 0.72, 0.16), ('pop-b', 1.37, 0.16), ('pop-b', 2.52, 0.18),
           ('toque', 3.43, 0.26), ('barrido-a', 3.58, 0.12)]
    sfx += [('toque', R0 + 2.88, 0.24), ('barrido-b', R0 + 3.3, 0.08), ('toque', R0 + 5.58, 0.24), ('barrido-a', R0 + 5.8, 0.14),
            ('toque', R0 + 7.83, 0.22), ('toque', R0 + 9.58, 0.22),
            ('barrido-b', R0 + 11.45, 0.12), ('cierre', C0 + 1.1 - 0.8, 0.3)]
    write_project(proj, {'gancho': gancho, 'recorrido': recorrido, 'cierre': cierre_html}, index_html(
        'Apuntes Académicos — historia', [('gancho', 0, G_DUR), ('recorrido', R0, R_DUR), ('cierre', C0, C_DUR)], sfx, total, 'apuntes'))
    return total


# ═══════════════════════════════ HISTORIA 2 · SEGUIMIENTO ═══════════════════════════════
def build_seguimiento():
    proj = os.path.join(BASE, 'seguimiento')
    M = json.load(open(os.path.join(proj, 'medidas.json')))
    V = json.load(open(os.path.join(proj, 'valores.json')))
    W, H = M['W'], M['H']
    ZF = WW / W

    # ───── escena 1 · gancho: tres dudas en una lista clara ─────
    G_DUR = 4.9
    pills1 = ''.join(f'<div class="pn">{n}</div>' for n in ['6', '7', '8', '9', '13'])
    segs = ''.join(f'<div id="g-s{i}" class="seg"></div>' for i in range(41))
    pills3 = ''.join(f'<div class="pn" style="color:{NEG if int(n) < 6 else POS}">{n}</div>' for n in ['4', '7', '2', '5', '8'])
    gb = f'''
      <div class="abs" style="inset:0;background:#FCF7F0"></div>
      <div id="g-blk">
        <div id="g-q1" class="qq" style="top:330px;opacity:1">¿Qué puedo cursar?</div>
        <div id="g-h1" class="qh" style="top:446px">Balances de Masa y Energía pide {pills1}</div>
        <div id="g-q2" class="qq" style="top:590px">¿Cuánto me falta?</div>
        <div id="g-h2" class="qh" style="top:706px"><div style="display:flex;gap:3px">{segs}</div><span>de 41 obligatorias</span></div>
        <div id="g-q3" class="qq" style="top:850px">¿Cuál es mi promedio?</div>
        <div id="g-h3" class="qh" style="top:966px">{pills3}<span style="font-family:Fraunces;font-size:44px;color:#131720">→ ?</span></div>
        <div id="g-ans" class="qq" style="top:1130px;font-size:72px">Una planilla lo calcula por vos.</div>
      </div>'''
    gj = '''
  blurIn('#g-h1', 0.2);
  tl.fromTo('#g-h1 .pn', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'back.out(1.8)' }, 0.25);
  blurIn('#g-q2', 0.95, 0.26); blurIn('#g-h2', 1.12);'''
    for i in range(5):
        gj += f"\n  tl.to('#g-s{i}', {{ backgroundColor: '{COB}', duration: 0.08 }}, {1.3 + i * 0.07:.2f});"
    gj += '''
  blurIn('#g-q3', 1.85, 0.26); blurIn('#g-h3', 2.02);
  tl.fromTo('#g-h3 .pn', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'back.out(1.8)' }, 2.07);
  tl.to('#g-q1, #g-h1, #g-q2, #g-h2, #g-q3, #g-h3', { opacity: 0.35, duration: 0.3 }, 2.85);
  blurIn('#g-ans', 2.9, 0.3);
  tl.to('#g-blk', { y: -320, opacity: 0, filter: 'blur(8px)', duration: 0.4, ease: 'power3.in' }, 4.3);'''
    gancho = scene('gancho', gb, gj, G_DUR)

    # ───── escena 2 · la herramienta (vista web) ─────
    H0 = 4.55
    sitio = (f'<div id="h-scr" class="scroller"><iframe id="h-fr" src="assets/site/pages/recursos/seguimiento.html" '
             f'style="width:{W}px;height:{H}px;zoom:{ZF:.5f}" scrolling="no"></iframe></div>')
    links = [(6, 11), (6, 14), (4, 13), (5, 13), (3, 10), (3, 12)]
    paths = ''.join(f'<path id="h-ln{a}-{b}" d="M 0 0" pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="1"/>' for a, b in links)
    rings = ''.join(f'<div id="h-rg{n}" class="ring"></div>' for n in [10, 11, 12, 13, 14])
    feats = [('Correlativas', 60, 560), ('Avance de carrera', 540, 700), ('Promedios', 40, 860),
             ('Exámenes finales', 560, 1010), ('Exportá a Excel', 50, 1170), ('Google Sheets', 600, 1320), ('Respaldo en JSON', 120, 1470)]
    fh = ''.join(f'<div id="h-f{i}" class="feat" style="left:{x}px;top:{y}px"><i>✓</i>{tx}</div>' for i, (tx, x, y) in enumerate(feats))
    hb = f'''
      <div id="h-cam" class="cam">
        {win('h-win', 'achetiq.github.io/pages/recursos/seguimiento', sitio)}
        <div id="h-ringp" class="ring"></div><div id="h-rk5" class="ring"></div><div id="h-rk6" class="ring"></div>
        {rings}
        <svg class="abs" style="left:0;top:0;z-index:56" width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" stroke="{COB}" stroke-width="3" stroke-linecap="butt" data-layout-ignore>{paths}</svg>
        <div id="h-drop" class="drop"><div><i></i>No Cursada</div><div><i></i>Cursando</div><div id="h-op2"><i></i>Regular</div><div id="h-op3"><i></i>Aprobada</div></div>
        {TAPS}
      </div>
      <div id="h-k0" class="kp" style="left:55px;top:1330px"><div class="l">Prom. sin aplazos</div><div id="h-k0v" class="v">—</div></div>
      <div id="h-k1" class="kp" style="left:555px;top:1330px"><div class="l">Prom. con aplazos</div><div id="h-k1v" class="v">—</div></div>
      {fh}
      {caps('h', [('c1', 'Tu carrera, en una planilla', None),
                  ('c2', 'Sin cuentas', 'Tus datos quedan en tu dispositivo.'),
                  ('c3', 'Marcá tus materias', None),
                  ('c4', 'Se habilitan sus correlativas', None),
                  ('c5', 'Cargá tus finales', 'Los promedios se calculan solos.'),
                  ('c6', 'Todo tu avance, al día', None)])}
      <div id="h-claim" class="cap" style="white-space:normal;font-size:92px">Marcá tus materias.<br>La planilla hace el resto.</div>'''

    def kpis(nombre):
        return [v for _, v in V[nombre]['kpis']]
    k_aga, k_fin = kpis('t_aga'), kpis('f_fis3')
    falt = {k: V[k]['falt'] for k in ['t_quimica', 't_fis', 't_aga']}

    hj = Template(CAMERA.replace('$WT', str(WT)) + r"""
  const vals = QA('#seg-dashboard .seg-kpi__value');
  vals.forEach((v) => { v.style.display = 'inline-block'; v.style.transformOrigin = '0% 60%'; });
  const panelSeg = Q('#seg-panel-seguimiento'), panelFin = Q('#seg-panel-finales');
  panelFin.hidden = false; panelFin.style.display = 'none';
  const hd = RR(Q('.page-header')), priv = RR(Q('.seguimiento__nota-privacidad'));
  const S_PRIV = Math.max(0, priv.top - 260);
  Object.assign(document.getElementById('h-ringp').style, (function () { const a = P(priv.left, priv.top, S_PRIV); return { left: (a[0] - 5) + 'px', top: (a[1] - 5) + 'px', width: (priv.width * ZF + 10) + 'px', height: (priv.height * ZF + 10) + 'px' }; })());
  const fila = (n) => Q('#seg-tabla-seguimiento tr[data-numero="' + n + '"]');
  const filaR = (n) => RR(fila(n));
  const tbl = RR(Q('#seg-tabla-seguimiento .seg-table-scroll'));
  const S_TAB = Math.max(0, filaR(3).top - 120);
  const colDisp = RR(Q('#seg-tabla-seguimiento thead th[data-col="disp"]'));
  // rectángulo de la tabla que se acerca: de N° a Disponible, filas 3 a 14
  const ET = enfoque(tbl.left, filaR(3).top - 10, colDisp.right + 6, filaR(14).bottom + 6, S_TAB, 1.6);
  [10, 11, 12, 13, 14].forEach((n) => { const r = filaR(n), a = P(tbl.left, r.top, S_TAB); Object.assign(document.getElementById('h-rg' + n).style, { left: (a[0] + 2) + 'px', top: (a[1] + 1) + 'px', width: ((colDisp.right - tbl.left) * ZF - 4) + 'px', height: (r.height * ZF - 2) + 'px' }); });
  [[6, 11], [6, 14], [4, 13], [5, 13], [3, 10], [3, 12]].forEach((ab) => {
    const ra = filaR(ab[0]), rb = filaR(ab[1]);
    const ya = P(0, ra.top + ra.height / 2, S_TAB)[1], yb = P(0, rb.top + rb.height / 2, S_TAB)[1], x0 = P(tbl.left, 0, 0)[0] + 2, bx = x0 - 22 - Math.abs(yb - ya) / 40;
    document.getElementById('h-ln' + ab[0] + '-' + ab[1]).setAttribute('d', 'M ' + x0 + ' ' + ya + ' C ' + bx + ' ' + ya + ', ' + bx + ' ' + yb + ', ' + x0 + ' ' + yb);
  });
  const SELC = {};
  [3, 4, 5, 6].forEach((n) => { const r = RR(Q('#seg-estado-' + n)); SELC[n] = P(r.left + r.width / 2, r.top + r.height / 2, S_TAB); });
  const tSeg = Q('.seg-tabs__tab[data-tab="seguimiento"]'), tFin = Q('.seg-tabs__tab[data-tab="finales"]');
  const tabsR = RR(Q('.seg-tabs'));
  const S_FIN = Math.max(0, tabsR.top - 30);
  const TF = (function () { const r = RR(tFin); return P(r.left + r.width / 2, r.top + r.height / 2, S_FIN); })();
  const TS = (function () { const r = RR(tSeg); return P(r.left + r.width / 2, r.top + r.height / 2, S_FIN); })();
  panelSeg.style.display = 'none'; panelFin.style.display = 'block';
  const sc = Q('#seg-tabla-finales .seg-table-scroll');
  const scR = RR(sc);
  const finTbl = RR(Q('#seg-tabla-finales'));
  const filaF = (n) => Q('#seg-tabla-finales tr[data-numero="' + n + '"]');
  const ins = (n) => Array.from(filaF(n).querySelectorAll('input')).filter((i) => getComputedStyle(i.parentElement).display !== 'none');
  const INS = {}, SCR = {};
  [3, 5].forEach((n) => { INS[n] = ins(n).map(RR); SCR[n] = [0, 1, 2].map((k) => Math.max(0, Math.ceil(INS[n][2 * k + 1].right - (scR.left + scR.width) + 12))); });
  panelSeg.style.display = ''; panelFin.style.display = 'none';
  const EF = enfoque(finTbl.left, tabsR.top - 6, finTbl.right, finTbl.bottom + 6, S_FIN, 1.3);
  const tapIn = (n, i, s, t) => { const r = INS[n][i]; const a = P(r.left + r.width / 2 - s, r.top + r.height / 2, S_FIN); tap(a[0], a[1], t); };
  const dash = RR(Q('#seg-dashboard'));
  const S_DASH = Math.max(0, dash.top - 40);
  const ED = enfoque(dash.left, dash.top - 6, dash.right, dash.bottom + 6, S_DASH, 1.2);
  const kpR = QA('#seg-dashboard .seg-kpi').map(RR);
  [5, 6].forEach((i) => { const r = kpR[i], a = P(r.left, r.top, S_DASH); Object.assign(document.getElementById('h-rk' + i).style, { left: (a[0] - 4) + 'px', top: (a[1] - 4) + 'px', width: (r.width * ZF + 8) + 'px', height: (r.height * ZF + 8) + 'px' }); });

  tl.fromTo('#h-cam', { y: 1500 }, { y: 0, duration: 0.6, ease: 'power3.out' }, 0.12);
  blurIn('#h-c1', 0.3);
  cam('#h-cam', 0.75, 0.8, enfoque(hd.left - 10, hd.top - 20, hd.right + 10, hd.bottom + 10, 0, 1.5));
  // privacidad
  capSwap('#h-c1', '#h-c2', 1.95); blurIn('#h-c2s', 2.15);
  cam('#h-cam', 1.95, 0.7, { scale: 1, x: 0, y: 0 });
  tl.to('#h-scr', { y: -S_PRIV * ZF, duration: 0.7, ease: 'power2.inOut' }, 1.95);
  tl.fromTo('#h-ringp', { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'expo.out' }, 2.55);
  tl.to('#h-ringp', { opacity: 0, duration: 0.25 }, 3.4);
  blurOut('#h-c2s', 3.45);
  // a la tabla, sin cortes
  tl.to('#h-scr', { y: -S_TAB * ZF, duration: 1.0, ease: 'power2.inOut' }, 3.5);
  cam('#h-cam', 3.9, 0.7, ET);
  capSwap('#h-c2', '#h-c3', 3.7);
  const FALT = $FALT;
  const marcar = (n, val, t, opt, dur) => {
    const sel = Q('#seg-estado-' + n), c = SELC[n];
    tap(c[0], c[1], t);
    tl.set('#h-drop', { left: c[0] - 95, top: c[1] + 26 }, t);
    tl.fromTo('#h-drop', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.16, ease: 'expo.out' }, t + 0.15);
    tl.set(opt, { backgroundColor: 'rgba(146,47,161,0.12)' }, t + 0.15 + dur);
    tl.set(opt + ' i', { borderColor: '$MAU', borderWidth: '6px' }, t + 0.15 + dur);
    tap(c[0], c[1] + 26 + (opt === '#h-op3' ? 140 : 100), t + 0.08 + dur);
    tl.to('#h-drop', { opacity: 0, duration: 0.12 }, t + 0.3 + dur);
    tl.set(opt, { backgroundColor: 'rgba(146,47,161,0)' }, t + 0.42 + dur);
    tl.set(opt + ' i', { borderColor: '#9AA1AD', borderWidth: '2px' }, t + 0.42 + dur);
    tl.set(sel, { value: val }, t + 0.32 + dur);
    const bm = fila(n).querySelector('.seg-badge'), ap = val === 'Aprobada';
    tl.set(bm, { attr: { class: 'seg-badge seg-badge--' + (ap ? 'aprobada' : 'regular') } }, t + 0.32 + dur);
    tl.set(bm.querySelector('.seg-badge__icon'), { innerHTML: ap ? '✓' : '◐' }, t + 0.32 + dur);
    tl.set(bm.querySelector('.seg-badge__text'), { innerHTML: val }, t + 0.32 + dur);
  };
  const faltantes = (paso, t) => { Object.keys(FALT[paso]).forEach((n) => { const r = fila(n); if (r) tl.set(r.querySelector('[data-col="falt"]'), { innerHTML: FALT[paso][n] }, t); }); };
  const habilitar = (n, t) => {
    const b = fila(n).querySelector('.seg-badge');
    tl.set(b, { attr: { class: 'seg-badge seg-badge--disponible' } }, t);
    tl.set(b.querySelector('.seg-badge__icon'), { innerHTML: '✓' }, t);
    tl.set(b.querySelector('.seg-badge__text'), { innerHTML: 'Disponible' }, t);
    tl.fromTo(b, { scale: 1.3 }, { scale: 1, duration: 0.32, ease: 'back.out(2.2)', immediateRender: false }, t);
    tl.fromTo('#h-rg' + n, { opacity: 0 }, { opacity: 1, duration: 0.18 }, t);
    tl.to('#h-rg' + n, { opacity: 0, duration: 0.3 }, t + 0.9);
  };
  const linea = (a, b, t) => {
    tl.to('#h-ln' + a + '-' + b, { strokeDashoffset: 0, duration: 0.38, ease: 'power2.inOut' }, t);
    tl.to('#h-ln' + a + '-' + b, { opacity: 0, duration: 0.3 }, t + 1.2);
  };
  marcar(6, 'Aprobada', 4.85, '#h-op3', 0.5);
  capSwap('#h-c3', '#h-c4', 5.8);
  linea(6, 11, 5.75); linea(6, 14, 5.83);
  habilitar(11, 6.07); habilitar(14, 6.19); faltantes('t_quimica', 6.07);
  marcar(4, 'Aprobada', 7.15, '#h-op3', 0.3);
  marcar(5, 'Regular', 7.75, '#h-op2', 0.3);
  linea(4, 13, 8.35); linea(5, 13, 8.4); habilitar(13, 8.65); faltantes('t_fis', 8.65);
  marcar(3, 'Regular', 9.1, '#h-op2', 0.3);
  linea(3, 10, 9.7); linea(3, 12, 9.75); habilitar(10, 10.0); habilitar(12, 10.12); faltantes('t_aga', 10.0);
  const KAGA = $KAGA;
  vals.forEach((v, i) => tl.set(v, { innerHTML: KAGA[i] }, 10.15));
  // pestaña de exámenes finales
  capSwap('#h-c4', '#h-c5', 10.75); blurIn('#h-c5s', 10.95);
  cam('#h-cam', 10.7, 0.6, { scale: 1, x: 0, y: 0 });
  tl.to('#h-scr', { y: -S_FIN * ZF, duration: 0.9, ease: 'power2.inOut' }, 10.75);
  tap(TF[0], TF[1], 11.75);
  tl.set(tSeg, { attr: { 'aria-selected': 'false' } }, 11.88);
  tl.set(tFin, { attr: { 'aria-selected': 'true' } }, 11.88);
  tl.set(panelSeg, { display: 'none' }, 11.88);
  tl.set(panelFin, { display: 'block' }, 11.88);
  cam('#h-cam', 12.0, 0.6, EF);
  tl.fromTo('#h-k0, #h-k1', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out', stagger: 0.08 }, 12.2);
  const foco = (el, t, t2) => {
    tl.set(el, { borderColor: '#1344A5', outline: '2px solid #1344A5', outlineOffset: '2px' }, t);
    tl.set(el, { borderColor: '', outline: '', outlineOffset: '' }, t2);
  };
  const tipear = (el, txt, t, dt) => { for (let k = 1; k <= txt.length; k++) tl.set(el, { value: txt.slice(0, k) }, t + (k - 1) * dt); };
  const prom = (sin, con, t) => {
    if (sin) { tl.set('#h-k0v', { innerHTML: sin }, t); pop('#h-k0v', t); }
    tl.set('#h-k1v', { innerHTML: con }, t); pop('#h-k1v', t);
  };
$FINALES
  // de vuelta a Seguimiento: el tablero completo
  capSwap('#h-c5', '#h-c6', 18.0); blurOut('#h-c5s', 18.0);
  cam('#h-cam', 17.95, 0.5, { scale: 1, x: 0, y: 0 });
  tap(TS[0], TS[1], 18.45);
  tl.set(tSeg, { attr: { 'aria-selected': 'true' } }, 18.58);
  tl.set(tFin, { attr: { 'aria-selected': 'false' } }, 18.58);
  tl.set(panelFin, { display: 'none' }, 18.58);
  tl.set(panelSeg, { display: 'block' }, 18.58);
  [[3, '7'], [5, '8']].forEach((nv) => {
    const n = nv[0], b = fila(n).querySelector('.seg-badge'), ni = Q('#seg-nota-' + n);
    tl.set(Q('#seg-estado-' + n), { value: 'Aprobada' }, 18.58);
    tl.set(b, { attr: { class: 'seg-badge seg-badge--aprobada' } }, 18.58);
    tl.set(b.querySelector('.seg-badge__icon'), { innerHTML: '✓' }, 18.58);
    tl.set(b.querySelector('.seg-badge__text'), { innerHTML: 'Aprobada' }, 18.58);
    if (ni) tl.set(ni, { value: nv[1] }, 18.58);
  });
  tl.to('#h-k0, #h-k1', { opacity: 0, y: 30, duration: 0.2 }, 18.55);
  tl.to('#h-scr', { y: -S_DASH * ZF, duration: 0.7, ease: 'power2.inOut' }, 18.65);
  cam('#h-cam', 18.7, 0.7, ED);
$DASH
  tl.fromTo('#h-rk5, #h-rk6', { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'expo.out', stagger: 0.1 }, 19.6);
  tl.to('#h-rk5, #h-rk6', { opacity: 0, duration: 0.3 }, 20.75);
  // cierre: la planilla se aleja y aparecen sus funciones
  blurOut('#h-c6', 21.0);
  cam('#h-cam', 21.0, 0.8, { scale: 0.56, x: 238, y: 300 });
$END
""")
    F_JS = ''
    t = 12.5
    seq = [(3, 0, '20/02/2024', '4', 'f_aga1'), (3, 1, '05/03/2024', '7', 'f_aga2'),
           (5, 0, '24/07/2024', '2', 'f_fis1'), (5, 1, '11/12/2024', '5', 'f_fis2'), (5, 2, '19/02/2025', '8', 'f_fis3')]
    scroll_now = '0'
    sfx_fin = []

    def desplazar(expr, t):
        return f"\n  tl.to(sc, {{ scrollLeft: {expr}, duration: 0.3, ease: 'power2.inOut' }}, {t:.2f});"
    for idx, (n, k, fecha, nota, vk) in enumerate(seq):
        fast = n == 5
        fi, ni = 2 * k, 2 * k + 1
        if k == 2:
            scroll_now = f'SCR[{n}][{k}]'
            F_JS += desplazar(scroll_now, t)
            t += 0.34
        F_JS += f"\n  tapIn({n}, {fi}, {scroll_now}, {t:.2f});"
        F_JS += f"\n  foco(ins({n})[{fi}], {t + 0.13:.2f}, {t + (0.5 if not fast else 0.3):.2f});"
        if fast:
            F_JS += f"\n  tl.set(ins({n})[{fi}], {{ value: '{fecha}' }}, {t + 0.15:.2f});"
            t += 0.28
        else:
            F_JS += f"\n  tipear(ins({n})[{fi}], '{fecha}', {t + 0.16:.2f}, 0.026);"
            sfx_fin += [('tecla', t + 0.16 + j * 0.052, 0.06) for j in range(5)]
            t += 0.48
        F_JS += f"\n  tapIn({n}, {ni}, {scroll_now}, {t:.2f});"
        F_JS += f"\n  foco(ins({n})[{ni}], {t + 0.13:.2f}, {t + 0.42:.2f});"
        F_JS += f"\n  tl.set(ins({n})[{ni}], {{ value: '{nota}' }}, {t + 0.2:.2f});"
        sfx_fin.append(('tecla', t + 0.2, 0.08))
        kk = dict(V[vk]['kpis'])
        sin = kk['Prom. sin aplazos']
        prev_sin = dict(V[seq[idx - 1][4]]['kpis'])['Prom. sin aplazos'] if idx else '—'
        F_JS += f"\n  prom({json.dumps(sin) if sin != prev_sin else 'null'}, '{kk['Prom. con aplazos']}', {t + 0.32:.2f});"
        sfx_fin.append(('pop-a' if idx % 2 else 'pop-b', t + 0.33, 0.13))
        t += 0.48 if not fast else 0.4
        if (n == 3 and k == 1) or (n == 5 and k == 2):
            if scroll_now != '0':
                F_JS += desplazar('0', t)
                t += 0.34
                scroll_now = '0'
            nc = f"Q('#seg-tabla-finales tr[data-numero=\"{n}\"] [data-col=\"nota\"]')"
            F_JS += (f"\n  tl.set({nc}, {{ innerHTML: '{V[vk]['notaFin'][str(n)]}', color: '{POS}', fontWeight: '600' }}, {t:.2f}); pop({nc}, {t:.2f});")
            F_JS += (f"\n  tl.set(Q('#seg-tabla-finales tr[data-numero=\"{n}\"] [data-col=\"estado\"]'), {{ innerHTML: 'Aprobada' }}, {t:.2f});")
            sfx_fin.append(('pop-b', t + 0.01, 0.13))
            t += 0.42
    fin_end = t
    D_JS = ''
    for i, (a, b) in enumerate(zip(k_aga, k_fin)):
        if a == b:
            continue
        D_JS += f"\n  tl.set(vals[{i}], {{ innerHTML: '{b}' }}, {19.2 + i * 0.06:.2f}); pop(vals[{i}], {19.2 + i * 0.06:.2f});"
    E_JS = "\n  blurIn('#h-claim', 21.2, 0.3);"
    for i in range(len(feats)):
        E_JS += f"\n  tl.fromTo('#h-f{i}', {{ opacity: 0, scale: 0.6, y: 30 }}, {{ opacity: 1, scale: 1, y: 0, duration: 0.42, ease: 'back.out(1.8)' }}, {21.55 + i * 0.12:.2f});"
    E_JS += "\n  blurOut('#h-claim', 23.9);"
    for i in range(len(feats)):
        E_JS += f"\n  tl.to('#h-f{i}', {{ x: {540 - feats[i][1] - 160}, y: {800 - feats[i][2]}, scale: 0.3, opacity: 0, duration: 0.4, ease: 'power3.in' }}, {23.85 + i * 0.02:.2f});"
    E_JS += "\n  tl.to('#h-cam', { opacity: 0, scale: 0.12, x: 475, y: 700, duration: 0.45, ease: 'power3.in' }, 23.9);"
    hj = hj.substitute(WX=WX, CT=WT + BAR, ZF=f'{ZF:.5f}', MAU=MAU, KAGA=json.dumps(k_aga), FALT=json.dumps(falt, ensure_ascii=False),
                       FINALES=F_JS, DASH=D_JS, END=E_JS)
    delta = round(max(0.0, fin_end + 0.15 - 17.95), 2)
    cut = hj.index('  // de vuelta a Seguimiento')
    hj = hj[:cut] + shift(hj[cut:], lambda x: x + delta if x >= 17.9 else x)
    H_DUR = round(24.5 + delta, 2)
    herr = scene('herramienta', hb, hj, H_DUR, iframe_id='h-fr')

    # ───── escena 3 · cierre ─────
    C0 = round(H0 + 24.2 + delta, 2)
    C_DUR = 4.3
    cb, cj = cierre('Recursos académicos › Seguimiento de Carrera', 'También en Excel y Google Sheets')
    cierre_html = scene('cierre', cb, cj, C_DUR)
    total = round(C0 + C_DUR, 2)

    H = H0
    sfx = [('pop-a', 0.3, 0.12), ('pop-b', 1.3, 0.12), ('pop-a', 2.4, 0.12), ('pop-b', 3.3, 0.12), ('barrido-a', 4.45, 0.12)]
    sfx += [('barrido-b', H + 3.5, 0.08)]
    for tt, d in [(4.85, 0.5), (7.15, 0.3), (7.75, 0.3), (9.1, 0.3)]:
        sfx.append(('toque', H + tt + 0.13, 0.22))
        sfx.append(('toque', H + tt + 0.21 + d, 0.18))
    sfx += [('pop-a', H + 6.08, 0.12), ('pop-b', H + 6.2, 0.12), ('pop-a', H + 8.66, 0.12), ('pop-b', H + 10.01, 0.12), ('pop-a', H + 10.13, 0.12)]
    sfx += [('barrido-a', H + 10.75, 0.08), ('toque', H + 11.88, 0.22)]
    sfx += [(n, H + tt, v) for n, tt, v in sfx_fin]
    sfx += [('toque', H + 18.58 + delta, 0.22), ('barrido-b', H + 21.0 + delta, 0.1), ('cierre', C0 + 1.1 - 0.8, 0.3)]
    write_project(proj, {'gancho': gancho, 'herramienta': herr, 'cierre': cierre_html}, index_html(
        'Seguimiento de Carrera — historia', [('gancho', 0, G_DUR), ('herramienta', H0, H_DUR), ('cierre', C0, C_DUR)], sfx, total, 'seguimiento'))
    return total, fin_end, delta


if __name__ == '__main__':
    print('apuntes', build_apuntes())
    print('seguimiento', build_seguimiento())
