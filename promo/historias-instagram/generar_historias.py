#!/usr/bin/env python3
"""Genera los proyectos HyperFrames de las dos historias de Instagram (versión 3).

  apuntes/      Historia 1 · Apuntes Académicos
  seguimiento/  Historia 2 · Seguimiento de Carrera

La interfaz del sitio no se redibuja: cada historia incrusta la página real (DOM tras el JS,
CSS, tipografías e imágenes del sitio) en un <iframe> de ancho de teléfono, escalado al cuadro,
y la anima cuadro a cuadro (desplazamiento, selectores, insignias, campos, indicadores).
Las capturas, las medidas y los valores salen de herramientas/preparar_sitio.cjs.

Uso:  python3 generar_historias.py
"""
import json
import os
import wave
from string import Template
import re

_T_END = re.compile(r"(\}\s*,\s*)(\d+(?:\.\d+)?)(\s*\);)")
_T_FN = re.compile(r"((?:tap\('[^']*',\s*[\d.]+,\s*[\d.]+,|(?:blurIn|blurOut|pop|steps)\([^,]+,|capSwap\('[^']*',\s*'[^']*',)\s*)(\d+(?:\.\d+)?)")


def shift(js, f):
    """Aplica f(t) a cada tiempo de inicio escrito en el código del timeline."""
    g = lambda m: m.group(1) + ('%.2f' % f(float(m.group(2)))) + (m.group(3) if m.lastindex >= 3 else '')
    return _T_FN.sub(g, _T_END.sub(g, js))

BASE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(BASE, '..', '..'))
COB, MAU, INK, SOFT = '#1344A5', '#922FA1', '#131720', '#4A4F59'
POS, NEG = '#165E2E', '#9B171F'

# ─────────────────────────────── estilos del video ───────────────────────────────
CSS = r"""
@font-face{font-family:'Fraunces';src:url('assets/fonts/fraunces-400-600.woff2') format('woff2');font-weight:400 600;font-style:normal}
@font-face{font-family:'Hanken Grotesk';src:url('assets/fonts/hanken-grotesk-400-600.woff2') format('woff2');font-weight:400 600;font-style:normal}
@font-face{font-family:'Geist Mono';src:url('assets/fonts/geist-mono-400-500.woff2') format('woff2');font-weight:400 500;font-style:normal}
#root{position:absolute;inset:0;overflow:hidden;font-family:'Hanken Grotesk',sans-serif;color:#131720}
.abs{position:absolute}
.serif{font-family:'Fraunces',serif;font-weight:400;letter-spacing:-0.015em}
.mono{font-family:'Geist Mono',monospace}
.cap{position:absolute;left:56px;top:226px;max-width:968px;padding:6px 16px;border-radius:18px;background:#FCF7F0;font-family:'Fraunces',serif;font-size:84px;line-height:1.05;letter-spacing:-0.015em;white-space:nowrap;opacity:0;z-index:40}
.cap em{font-style:normal;color:#1344A5}
.cap-sub{position:absolute;left:72px;top:338px;font-size:40px;line-height:1.3;color:#4A4F59;white-space:nowrap;opacity:0;z-index:40}
.screen{position:absolute;left:0;width:1080px;height:1600px;overflow:hidden;border-radius:44px 44px 0 0;background:#F2F4F8;box-shadow:0 -14px 44px rgba(19,23,32,.10)}
.cam{position:absolute;left:0;top:0;width:1080px}
.cam iframe{display:block;border:0;background:#F2F4F8}
.tap{position:absolute;width:70px;height:70px;margin:-35px 0 0 -35px;border-radius:50%;background:rgba(19,23,32,.20);opacity:0;pointer-events:none;z-index:60}
.ring{position:absolute;border:4px solid #1344A5;border-radius:20px;box-shadow:0 0 0 8px rgba(19,68,165,.10);opacity:0;pointer-events:none;z-index:55}
.drop{position:absolute;width:300px;background:#FFFFFF;border-radius:14px;box-shadow:0 18px 44px rgba(11,41,100,.22);overflow:hidden;opacity:0;z-index:58}
.drop div{position:relative;height:68px;display:flex;align-items:center;gap:18px;padding:0 24px;font-size:31px}
.drop i{width:26px;height:26px;border-radius:50%;border:3px solid #9AA1AD;flex:0 0 26px}
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
/* Drive simulado */
.sheet{position:absolute;left:0;width:1080px;height:1500px;background:#FFFFFF;border-radius:44px 44px 0 0;box-shadow:0 -14px 44px rgba(19,23,32,.16);overflow:hidden}
.handle{position:absolute;left:500px;top:22px;width:80px;height:8px;border-radius:4px;background:#DCD3C6}
.dcrumb{position:absolute;left:60px;top:66px;font-size:32px;color:#4A4F59;white-space:nowrap}
.dtitle{position:absolute;left:60px;top:116px;width:960px;font-size:52px;font-weight:600;line-height:1.18}
.dhead{position:absolute;left:60px;width:960px;font-family:'Geist Mono',monospace;font-size:28px;color:#4A4F59;padding-bottom:14px;border-bottom:2px solid #F0EBE3}
.drow{position:absolute;left:44px;width:992px;height:132px;display:flex;align-items:center;gap:30px;padding:0 16px;border-radius:18px}
.drow .ic{flex:0 0 64px;display:flex;justify-content:center}
.drow .tx b{display:block;font-size:39px;font-weight:500;white-space:nowrap}
.drow .tx span{font-size:29px;color:#4A4F59}
.dhl{position:absolute;inset:0;border-radius:18px;background:rgba(146,47,161,.09);border-left:8px solid #922FA1;opacity:0}
.pdf{width:52px;height:64px;border-radius:7px;background:#D93025;color:#fff;font:600 17px 'Hanken Grotesk',sans-serif;display:flex;align-items:flex-end;justify-content:center;padding-bottom:9px}
.viewer{position:absolute;left:0;top:0;width:1080px;height:1500px;background:#E9E3D9;opacity:0}
.vbar{position:absolute;left:0;top:0;width:1080px;height:120px;background:#FFFFFF;display:flex;align-items:center;gap:24px;padding:0 60px;font-size:34px;border-bottom:2px solid #E7DFD3}
.page{position:absolute;left:130px;top:170px;width:820px;height:1080px;background:#FFFFFF;box-shadow:0 18px 40px rgba(11,41,100,.14);padding:84px 74px}
.ln{height:22px;border-radius:6px;background:#E1E4E9;margin-bottom:26px}
.ln.t{height:40px;width:62%;background:#CED2D9;margin-bottom:52px}
/* muro de materias */
.tile{position:absolute;width:196px;height:110px;border-radius:12px;overflow:hidden;opacity:0}
.tile img{width:100%;height:100%;object-fit:cover;display:block}
/* cierre */
.end{position:absolute;left:0;top:0;width:1080px;height:1920px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding-bottom:240px}
.end-logo{width:460px;height:460px;opacity:0}
.end-name{font-size:124px;margin-top:6px;display:flex;line-height:1.05}
.end-name span{display:inline-block;opacity:0}
.end-url{font-size:48px;color:#1344A5;margin-top:18px;opacity:0}
.end-sec{font-size:42px;color:#4A4F59;margin-top:20px;line-height:1.3;opacity:0}
.end-extra{font-size:36px;color:#4A4F59;margin-top:12px;opacity:0}
/* seguimiento */
.clu{position:absolute;opacity:0;white-space:nowrap}
.seg{position:absolute;top:0;width:18px;height:64px;border-radius:4px;background:#E7DFD3}
.kp{position:absolute;width:470px;height:176px;background:#FFFFFF;border:1px solid #CED2D9;border-radius:20px;padding:24px 30px;opacity:0;box-shadow:0 14px 40px rgba(19,23,32,.12)}
.kp .l{font-family:'Geist Mono',monospace;font-size:28px;letter-spacing:.08em;color:#4A4F59;text-transform:uppercase}
.kp .v{font-family:'Fraunces',serif;font-size:80px;line-height:1.15;display:inline-block;transform-origin:0% 60%}
.feat{position:absolute;display:flex;align-items:center;gap:18px;padding:22px 34px;border-radius:999px;background:#FFFFFF;border:2px solid #E7DFD3;box-shadow:0 14px 36px rgba(19,23,32,.12);font-size:38px;font-weight:500;white-space:nowrap;opacity:0;z-index:30}
.feat i{width:40px;height:40px;border-radius:50%;background:#1344A5;color:#fff;font-style:normal;font-size:26px;display:flex;align-items:center;justify-content:center}
"""

HELPERS = r"""
  const tl = gsap.timeline({ paused: true });
  const blurIn = (s, t, d) => tl.fromTo(s, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: d || 0.24, ease: 'power4.out' }, t);
  const blurOut = (s, t, d) => tl.to(s, { opacity: 0, filter: 'blur(10px)', duration: d || 0.18, ease: 'power2.in' }, t);
  const tap = (s, x, y, t) => {
    tl.set(s, { left: x, top: y }, t);
    tl.fromTo(s, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out' }, t);
    tl.to(s, { scale: 0.8, duration: 0.08, ease: 'power2.in' }, t + 0.13);
    tl.to(s, { scale: 1.05, opacity: 0, duration: 0.22, ease: 'power2.out' }, t + 0.22);
  };
  const steps = (s, t, vals, dt) => vals.forEach((v, i) => tl.set(s, { innerHTML: v }, t + i * dt));
  const pop = (s, t) => tl.fromTo(s, { scale: 1.35 }, { scale: 1, duration: 0.3, ease: 'back.out(2.2)', immediateRender: false }, t);
  const capSwap = (a, b, t) => { if (a) blurOut(a, t, 0.16); blurIn(b, t + 0.12, 0.26); };
"""


def wav_dur(proj, name):
    with wave.open(os.path.join(BASE, proj, 'assets/sfx', name + '.wav')) as w:
        return w.getnframes() / w.getframerate()


def scene(cid, body, js, dur, iframe_id=None, fonts=False):
    """Escena con su línea de tiempo. Con iframe, el timeline se registra al cargar la página real."""
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


def cierre(p, sec, extra, dur):
    letters = ''.join(f'<span>{c}</span>' for c in 'AChETIQ')
    ex = f'<div id="{p}-ex" class="end-extra">{extra}</div>' if extra else ''
    body = f'''
      <div class="abs" style="inset:0;background:#FCF7F0"></div>
      <div class="end">
        <img id="{p}-logo" class="end-logo" src="assets/img/achetiq-logo.svg" alt="">
        <div id="{p}-name" class="serif end-name">{letters}</div>
        <div id="{p}-url" class="end-url mono">achetiq.github.io</div>
        <div id="{p}-sec" class="end-sec">{sec}</div>{ex}
      </div>'''
    js = f'''
  tl.fromTo('#{p}-logo', {{ opacity: 0, scale: 0.55 }}, {{ opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }}, 0.05);
  tl.fromTo('#{p}-name span', {{ opacity: 0, filter: 'blur(6px)', y: 16 }}, {{ opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.24, stagger: 0.05, ease: 'power3.out' }}, 0.45);
  blurIn('#{p}-url', 0.85); blurIn('#{p}-sec', 1.0);'''
    if extra:
        js += f"\n  blurIn('#{p}-ex', 1.12);"
    return body, js


def caps(p, items):
    out = ''
    for cid, html, sub in items:
        out += f'<div id="{p}-{cid}" class="cap">{html}</div>'
        if sub:
            out += f'<div id="{p}-{cid}s" class="cap-sub">{sub}</div>'
    return out


FOLDER = '<svg width="64" height="52" viewBox="0 0 64 52"><path d="M4 8a4 4 0 0 1 4-4h16l6 6h26a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#5F6368"/></svg>'
PDF = '<div class="pdf" data-layout-ignore>PDF</div>'
IRQ = 'Ingeniería de las Reacciones Químicas'


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
    W, H = M['W'], M['H']
    Z = 1080 / W
    PT = 430                                     # borde superior de la pantalla
    S1 = 190                                     # desplazamiento con el filtro a la vista
    irq = next(c for c in M['cards4'] if c['nombre'].startswith('Ingeniería de las Reacciones'))
    cv = irq['cover']
    S2 = round(cv[1] - (520 - PT) / Z, 1)        # portada de IRQ a 520 px del borde superior
    pill = M['pill4']
    pill_x, pill_y = (pill[0] + pill[2] / 2) * Z, PT + (pill[1] + pill[3] / 2 - S1) * Z
    cx, cy, cw, ch = cv[0] * Z, PT + (cv[1] - S2) * Z, cv[2] * Z, cv[3] * Z
    zoom_s = 1960 / ch
    zoom_dy = 960 - (cy + ch / 2)

    # ───── escena 1 · gancho (chat) ─────
    G_DUR = 4.45
    msgs = [('me', '', '¿Alguien tiene la Serie 7 de Reacciones resuelta?'),
            ('', 'Lu', 'creo que estaba en un drive viejo'),
            ('', 'Tomi', 'a mí me la pasaron por mail y no la encuentro'),
            ('me', '', 'rindo esta semana y no tengo nada')]
    colors = {'Lu': '#8E6AC7', 'Tomi': '#039585', 'Agus': '#AA7323'}
    mh = ''
    for i, (who, name, text) in enumerate(msgs):
        nm = f'<div class="who" style="color:{colors[name]}">{name}</div>' if name else ''
        mh += f'<div id="g-m{i}" class="msg {who}">{nm}<div class="bub">{text}</div></div>'
    mh += '<div id="g-typ" class="typing"><span></span><span></span><span></span></div>'
    mh += (f'<div id="g-m4" class="msg"><div class="who" style="color:{colors["Agus"]}">Agus</div><div class="bub">Está todo en la página de AChETIQ'
           '<div id="g-prev" class="prev"><img src="assets/img/og-image-achetiq.png" alt=""><div><b>Apuntes Académicos - AChETIQ</b>'
           '<span>achetiq.github.io</span></div></div></div></div>')
    gb = f'''
      <div class="abs" style="inset:0;background:#FCF7F0"></div>
      <div id="g-q" class="cap" style="white-space:normal;font-size:96px;opacity:1">¿Otra vez buscando<br>apuntes?</div>
      <div id="g-ok" class="cap" style="font-size:96px">Está todo <em>acá</em>.</div>
      <div id="g-chat" class="chat" data-layout-allow-overlap data-layout-allow-occlusion>
        <div class="chat-h" data-layout-allow-overlap><div class="av">IQ</div><div><div style="font-size:38px;font-weight:600">IQ · 4º año</div><div style="font-size:28px;color:#4A4F59">Grupo de la cursada</div></div></div>
        <div id="g-msgs" class="msgs" data-layout-allow-overlap>{mh}</div>
      </div>
      <div id="g-morph" class="abs" style="left:0;top:{PT}px;width:1080px;height:1490px;background:#F2F4F8;border-radius:44px 44px 0 0;opacity:0;z-index:30"></div>
      <div id="g-tap" class="tap"></div>'''
    gj = Template(r"""
  // el chat se arma desde abajo: cada mensaje nuevo empuja a los anteriores
  const ids = ['#g-m0', '#g-m1', '#g-m2', '#g-m3', '#g-typ', '#g-m4'];
  const hs = ids.map((s) => document.querySelector(s).offsetHeight + 18);
  const AV = 1110 - 150 - 30;
  // desplazamiento de la lista cuando lo visible supera el alto del chat (el indicador de escritura se reemplaza)
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
  tap('#g-tap', px + pw * 0.5, py + ph * 0.45, 3.3);
  tl.fromTo('#g-prev', { scale: 1 }, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 }, 3.42);
  // la vista previa del enlace se convierte en la pantalla del sitio
  tl.set('#g-morph', { transformOrigin: '0px 0px', x: px, y: py - $PT, scaleX: pw / 1080, scaleY: ph / 1490, borderRadius: '20px', opacity: 1 }, 3.58);
  tl.to('#g-morph', { x: 0, y: 0, scaleX: 1, scaleY: 1, borderRadius: '44px 44px 0px 0px', duration: 0.62, ease: 'power3.inOut' }, 3.58);
  tl.to('#g-chat', { opacity: 0, scale: 0.96, filter: 'blur(6px)', duration: 0.4, ease: 'power2.in' }, 3.6);
  blurOut('#g-ok', 3.95, 0.2);
""").substitute(PT=PT)
    gancho = scene('gancho', gb, gj, G_DUR, fonts=True)

    # ───── escena 2 · recorrido por el sitio ─────
    R0 = 3.95
    R_DUR = 16.55
    R = json.load(open(os.path.join(REPO, 'data/recursos.json')))
    mats = [m for m in R if m.get('anio')]
    irq_i = next(i for i, m in enumerate(mats) if m['id'] == 'ingenieria-de-las-reacciones-quimicas')
    slots = [(c, r) for r in range(8) for c in range(5)][:len(mats)]
    order = list(range(len(mats)))
    centro = slots.index((2, 3))                 # IRQ al centro del muro
    order[irq_i], order[centro] = order[centro], order[irq_i]
    year_col = {1: '#E7CDAA', 2: '#D1A6D8', 3: '#89AFD6', 4: '#537ABB', 5: '#264A8E'}
    WX, WY, TW, TH, G = 30, 520, 196, 110, 12
    tiles = ''
    tpos = {}
    for slot_i, mi in enumerate(order):
        m = mats[mi]
        c, r = slots[slot_i]
        x, y = WX + c * (TW + G), WY + r * (TH + G)
        if r == 7:
            x += (5 - (len(mats) - 35)) * (TW + G) / 2
        tpos[m['id']] = (x, y)
        if m['id'] == 'termodinamica':      # la imagen del sitio es de terceros: se usa el color del año
            inner = f'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:600 24px Hanken Grotesk;color:#0B2964">Termodinámica</div>'
        else:
            inner = f'<img src="assets/site/assets/img/materias/{m["id"]}.webp" alt="">'
        tiles += f'<div id="r-t-{m["id"]}" class="tile" data-layout-ignore style="left:{x:.0f}px;top:{y:.0f}px;background:{year_col[m["anio"]]}">{inner}</div>'
    ix, iy = tpos['ingenieria-de-las-reacciones-quimicas']

    def drow(rid, kind, name, meta, top):
        ic = FOLDER if kind == 'folder' else PDF
        return (f'<div id="{rid}" class="drow" style="top:{top}px"><div id="{rid}-hl" class="dhl"></div><div class="ic">{ic}</div>'
                f'<div class="tx"><b>{name}</b><span>{meta}</span></div></div>')
    lista1 = (drow('r-d1', 'folder', '03. Práctica', 'Modificado: 3 sept 2026', 360) +
              drow('r-d2', 'folder', '05. Presentaciones', 'Modificado: 3 sept 2026', 496))
    lista2 = (drow('r-e1', 'folder', 'Guías de Estudio', 'Modificado: 3 sept 2026', 250) +
              drow('r-e2', 'pdf', '2024 - GS - Resolución Serie 07.pdf', '11 ago 2026 · 2,3 MB', 386) +
              drow('r-e3', 'pdf', '2024 - NCMQ - Resolución Serie 06.pdf', '11 ago 2026 · 28,1 MB', 522) +
              drow('r-e4', 'pdf', '2024 - SMR - Resolución Series.pdf', '11 ago 2026 · 56,2 MB', 658))
    lines = '<div class="ln t"></div>' + ''.join(
        f'<div class="ln" style="width:{w}%{";background:transparent" if w == 0 else ""}"></div>'
        for w in [100, 94, 98, 72, 0, 100, 88, 96, 60, 0, 100, 91, 97, 83, 100, 55, 0, 100, 76])
    SH = 600                                     # borde superior de la hoja de Drive
    rb = f'''
      <div class="abs" style="inset:0;background:#FCF7F0"></div>
      <div id="r-screen" class="screen" style="top:{PT}px;opacity:0">
        <div id="r-cam" class="cam"><iframe id="r-fr" src="assets/site/pages/recursos/apuntes.html" style="width:{W}px;height:{H}px;zoom:{Z:.4f}" scrolling="no"></iframe></div>
      </div>
      <div id="r-zoom" class="abs" style="left:0;top:0;width:100px;height:56px;overflow:hidden;opacity:0;z-index:20"><img src="assets/site/assets/img/materias/ingenieria-de-las-reacciones-quimicas.webp" style="width:100%;height:100%;object-fit:cover;display:block" alt=""></div>
      <div id="r-label" class="abs" style="left:60px;top:1330px;width:960px;padding:30px 36px;background:#FCF7F0;border-radius:26px;opacity:0;z-index:21">
        <div class="mono" style="font-size:30px;letter-spacing:.12em;color:#4A4F59">4º AÑO</div>
        <div class="serif" style="font-size:66px;line-height:1.08;margin-top:6px">{IRQ}</div>
      </div>
      <div id="r-fade" class="abs" style="left:0;top:0;width:1080px;height:560px;background:linear-gradient(#FCF7F0 0%,#FCF7F0 62%,rgba(252,247,240,0) 100%);opacity:0;z-index:21"></div>
      <div id="r-sheet" class="sheet" style="top:{SH}px;z-index:22">
        <div class="handle"></div>
        <div id="r-l1">
          <div class="dcrumb">Compartidos conmigo › AChETIQ</div>
          <div class="dtitle">{IRQ}</div>
          <div class="dhead" style="top:300px">Nombre ↑</div>
          {lista1}
        </div>
        <div id="r-l2" style="opacity:0">
          <div class="dcrumb">… › {IRQ}</div>
          <div class="dtitle">03. Práctica</div>
          <div class="dhead" style="top:196px">Nombre ↑</div>
          {lista2}
        </div>
        <div id="r-morph" class="abs" style="left:0;top:0;width:1080px;height:1500px;background:#FFFFFF;opacity:0"></div>
        <div id="r-view" class="viewer">
          <div class="vbar">{PDF}<span>2024 - GS - Resolución Serie 07.pdf</span></div>
          <div id="r-page" class="page">{lines}</div>
        </div>
      </div>
      <div id="r-flood" class="flood" style="z-index:23"></div>
      <div id="r-wall" class="abs" style="left:0;top:0;width:1080px;height:1920px;z-index:24">{tiles}</div>
      {caps('r', [('c1', 'Apuntes de cada <em>materia</em>', None), ('c2', 'Filtrá por <em>año</em>', None),
                  ('c3', 'Elegí tu <em>materia</em>', None), ('c4', 'Su carpeta en <em>Drive</em>', None),
                  ('c5', 'Guías y series <em>resueltas</em>', None), ('c6', 'La Serie 7, <em>encontrada</em>.', None)])}
      <div id="r-cnt" class="cap" style="display:flex;align-items:baseline;gap:22px"><span id="r-n" style="font-size:170px;line-height:.9;color:{COB}">1</span><span>materias</span></div>
      <div id="r-cnts" class="cap-sub" style="top:418px">cada una con su carpeta de Drive</div>
      <div id="r-claim" class="cap" style="white-space:normal;font-size:96px">Toda la carrera,<br>a un <em>toque</em>.</div>
      <div id="r-claims" class="cap-sub" style="top:446px">Apuntes y guías aportados por estudiantes.</div>
      <div id="r-tap" class="tap"></div>'''
    rj = Template(r"""
  // geometría medida en la página real, dentro del iframe (px CSS del teléfono)
  const Z = $Z, PT = $PT;
  const RR = (el) => el.getBoundingClientRect();
  const p4 = Q('.pill-nav__pill[data-anio="4"]'), pT = Q('.pill-nav__pill[data-anio="all"]');
  const pr = RR(p4);
  const S1 = pr.top + pr.height / 2 - (1356 - PT) / Z;
  const PX = (pr.left + pr.width / 2) * Z, PY = 1356;
  const card = QA('.apuntes__grid > *').find((c) => (c.textContent || '').indexOf('Reacciones Químicas') >= 0);
  const otros = QA('.apuntes__grid > *').filter((c) => c.getAttribute('data-anio') !== '4');
  otros.forEach((c) => { c.style.display = 'none'; });
  const cr = RR(card.querySelector('.card-materia__cover'));
  otros.forEach((c) => { c.style.display = ''; });
  const S2 = cr.top - (520 - PT) / Z;
  const zx = cr.left * Z, zy = 520, zw = cr.width * Z, zh = cr.height * Z;
  Object.assign(document.getElementById('r-zoom').style, { left: zx + 'px', top: zy + 'px', width: zw + 'px', height: zh + 'px' });
  const ZS = 1960 / zh, ZDY = 960 - (zy + zh / 2);
  // pantalla: la página real (iframe) aparece donde terminó la vista previa del enlace
  tl.fromTo('#r-screen', { opacity: 0 }, { opacity: 1, duration: 0.18 }, 0.22);
  blurIn('#r-c1', 0.4);
  tl.fromTo('#r-cam', { y: 0 }, { y: -S1 * Z, duration: 1.3, ease: 'power2.inOut' }, 0.6);
  // filtro por año: el comportamiento real de apuntes.js (oculta las demás tarjetas)
  capSwap('#r-c1', '#r-c2', 2.0);
  tap('#r-tap', PX, PY, 2.2);
  tl.set(pT, { attr: { class: 'pill-nav__pill', 'aria-pressed': 'false' } }, 2.35);
  tl.set(p4, { attr: { class: 'pill-nav__pill is-active', 'aria-pressed': 'true' } }, 2.35);
  const grid = Q('.apuntes__grid');
  tl.to(grid, { opacity: 0, duration: 0.1 }, 2.35);
  QA('.apuntes__grid > *').forEach((c) => { if (c.getAttribute('data-anio') !== '4') tl.set(c, { display: 'none' }, 2.46); });
  tl.to(grid, { opacity: 1, duration: 0.22 }, 2.48);
  // desplazamiento continuo hasta la materia
  capSwap('#r-c2', '#r-c3', 2.8);
  tl.to('#r-cam', { y: -S2 * Z, duration: 1.85, ease: 'power2.inOut' }, 2.85);
  tap('#r-tap', zx + zw / 2, zy + zh / 2, 4.8);
  tl.to(card, { scale: 0.975, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 4.92);
  // la portada de la materia se acerca hasta llenar el cuadro
  tl.set('#r-zoom', { opacity: 1 }, 5.08);
  blurOut('#r-c3', 5.05, 0.16);
  tl.to('#r-zoom', { scale: ZS, y: ZDY, duration: 0.9, ease: 'power2.inOut' }, 5.1);
  tl.set('#r-screen', { opacity: 0 }, 6.05);
  tl.fromTo('#r-label', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }, 5.75);
  // la carpeta de Drive sube como una hoja sobre la portada
  tl.fromTo('#r-sheet', { y: 1400 }, { y: 0, duration: 0.65, ease: 'power3.inOut' }, 6.75);
  tl.to('#r-zoom', { y: ZDY - 330, duration: 0.65, ease: 'power3.inOut' }, 6.75);
  tl.to('#r-label', { y: -60, opacity: 0, duration: 0.35, ease: 'power2.in' }, 6.8);
  tl.to('#r-fade', { opacity: 1, duration: 0.4 }, 6.95);
  blurIn('#r-c4', 7.2);
  tl.to('#r-fade', { opacity: 0, duration: 0.3 }, 11.75);
  tl.fromTo('#r-d1, #r-d2', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.34, ease: 'expo.out', stagger: 0.08 }, 7.15);
  tap('#r-tap', 640, $D1Y, 8.1);
  tl.to('#r-d1-hl', { opacity: 0.55, duration: 0.1 }, 8.22);
  tl.to('#r-l1', { x: -1080, duration: 0.45, ease: 'power3.inOut' }, 8.35);
  tl.fromTo('#r-l2', { x: 1080, opacity: 1 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.inOut' }, 8.35);
  capSwap('#r-c4', '#r-c5', 8.45);
  tl.fromTo('#r-e1, #r-e2, #r-e3, #r-e4', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.34, ease: 'expo.out', stagger: 0.07 }, 8.6);
  tap('#r-tap', 700, $E2Y, 9.65);
  tl.to('#r-e2-hl', { opacity: 1, duration: 0.12 }, 9.77);
  // el archivo se abre: la fila crece hasta el visor
  tl.set('#r-morph', { transformOrigin: '0px 0px', x: 44, y: 386, scaleX: 992 / 1080, scaleY: 132 / 1500, opacity: 1 }, 9.95);
  tl.to('#r-morph', { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.5, ease: 'power3.inOut' }, 9.95);
  tl.to('#r-view', { opacity: 1, duration: 0.25 }, 10.3);
  tl.fromTo('#r-page', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'expo.out' }, 10.35);
  tl.fromTo('#r-page .ln', { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.25, stagger: 0.03, ease: 'power2.out' }, 10.45);
  capSwap('#r-c5', '#r-c6', 10.3);
  // alejamiento: la hoja vuelve a ser una portada en el muro de las 38 materias
  tl.to('#r-page', { x: $PGX, y: $PGY, scaleX: $PGSX, scaleY: $PGSY, transformOrigin: '0px 0px', duration: 0.6, ease: 'power3.inOut' }, 11.75);
  tl.to('#r-view .vbar, #r-l2, #r-morph', { opacity: 0, duration: 0.25 }, 11.75);
  tl.to('#r-sheet', { backgroundColor: 'rgba(255,255,255,0)', boxShadow: '0 0 0 rgba(0,0,0,0)', duration: 0.4 }, 11.75);
  tl.to('#r-view', { backgroundColor: 'rgba(233,227,217,0)', duration: 0.4 }, 11.75);
  tl.to('#r-zoom', { opacity: 0, duration: 0.4 }, 11.8);
  blurOut('#r-c6', 11.8, 0.16);
  tl.fromTo('#r-t-ingenieria-de-las-reacciones-quimicas', { opacity: 0 }, { opacity: 1, duration: 0.25 }, 12.25);
  tl.to('#r-page', { opacity: 0, duration: 0.2 }, 12.3);
  tl.set('#r-sheet', { opacity: 0 }, 12.5);
$WALL
  blurIn('#r-cnt', 12.3); blurIn('#r-cnts', 12.45);
  steps('#r-n', 12.35, $NUMS, 0.033);
  // cierre: la carrera entera, a un toque
  blurOut('#r-cnt', 14.0); blurOut('#r-cnts', 14.0);
  blurIn('#r-claim', 14.15, 0.28); blurIn('#r-claims', 14.45);
  tl.to('#r-wall', { y: 70, scale: 0.94, transformOrigin: '540px 1000px', duration: 0.6, ease: 'power2.inOut' }, 14.0);
  blurOut('#r-claim', 16.0); blurOut('#r-claims', 16.0);
$CONV
""")
    wall = ''
    conv = ''
    for mid, (x, y) in tpos.items():
        if mid == 'ingenieria-de-las-reacciones-quimicas':
            continue
        d = ((x - ix) ** 2 + (y - iy) ** 2) ** 0.5
        wall += f"\n  tl.fromTo('#r-t-{mid}', {{ opacity: 0, scale: 0.4 }}, {{ opacity: 1, scale: 1, duration: 0.34, ease: 'back.out(1.7)' }}, {12.35 + d / 1100:.2f});"
        conv += f"\n  tl.to('#r-t-{mid}', {{ x: {540 - (x + 98):.0f}, y: {880 - (y + 55):.0f}, scale: 0.2, opacity: 0, duration: 0.42, ease: 'power3.in' }}, {16.05 + (1 - d / 1400) * 0.25:.2f});"
    conv += f"\n  tl.to('#r-t-ingenieria-de-las-reacciones-quimicas', {{ x: {540 - (ix + 98):.0f}, y: {880 - (iy + 55):.0f}, scale: 0.2, opacity: 0, duration: 0.42, ease: 'power3.in' }}, 16.3);"
    page_x, page_y, page_w, page_h = 130, SH + 170, 820, 1080
    rj = rj.substitute(Z=f'{Z:.5f}', PT=PT,
                       D1Y=f'{SH + 360 + 66}', E2Y=f'{SH + 386 + 66}',
                       PGX=f'{ix - page_x:.1f}', PGY=f'{iy - page_y:.1f}', PGSX=f'{TW / page_w:.4f}', PGSY=f'{TH / page_h:.4f}',
                       WALL=wall, CONV=conv, NUMS=json.dumps([str(n) for n in range(1, 39)]))
    recorrido = scene('recorrido', rb, rj, R_DUR, iframe_id='r-fr')

    # ───── escena 3 · cierre ─────
    C0 = round(R0 + 16.35, 2)
    C_DUR = 3.3
    cb, cj = cierre('c', 'Recursos académicos › Apuntes', '', C_DUR)
    cierre_html = scene('cierre', cb, cj, C_DUR)
    total = round(C0 + C_DUR, 2)

    sfx = [('pop-a', 0.72, 0.16), ('pop-b', 1.37, 0.16), ('pop-b', 2.52, 0.18),
           ('toque', 3.43, 0.28), ('barrido-a', 3.58, 0.14)]
    sfx += [('toque', R0 + 2.33, 0.26), ('toque', R0 + 4.93, 0.26), ('barrido-b', R0 + 5.12, 0.16),
            ('barrido-a', R0 + 6.75, 0.12), ('toque', R0 + 8.23, 0.24), ('toque', R0 + 9.78, 0.24),
            ('barrido-b', R0 + 11.75, 0.13), ('cierre', C0 + 0.35 - 0.8, 0.32)]
    write_project(proj, {'gancho': gancho, 'recorrido': recorrido, 'cierre': cierre_html}, index_html(
        'Apuntes Académicos — historia', [('gancho', 0, G_DUR), ('recorrido', R0, R_DUR), ('cierre', C0, C_DUR)], sfx, total, 'apuntes'))
    return total


# ═══════════════════════════════ HISTORIA 2 · SEGUIMIENTO ═══════════════════════════════
def build_seguimiento():
    proj = os.path.join(BASE, 'seguimiento')
    M = json.load(open(os.path.join(proj, 'medidas.json')))
    V = json.load(open(os.path.join(proj, 'valores.json')))
    W, H = M['W'], M['H']
    Z = 1080 / W
    PT = 400

    # ───── escena 1 · gancho ─────
    G_DUR = 4.75
    nums1 = ''
    for i, n in enumerate(['6', '7', '8', '9', '13']):
        nums1 += f'<div id="g-a{i}" class="clu serif" style="left:{150 + i * 170}px;top:930px;font-size:124px;color:{COB}">{n}</div>'
    for i, n in enumerate(['1', '3', '4']):
        nums1 += f'<div id="g-b{i}" class="clu serif" style="left:{320 + i * 170}px;top:1170px;font-size:124px">{n}</div>'
    segs = ''.join(f'<div id="g-s{i}" class="seg" style="left:{i * 22}px"></div>' for i in range(41))
    grades = [('4', NEG, 170, 880), ('7', POS, 760, 820), ('2', NEG, 300, 1230), ('5', NEG, 820, 1180), ('8', POS, 520, 1390)]
    gr = ''.join(f'<div id="g-g{i}" class="clu serif" style="left:{x}px;top:{y}px;font-size:150px;color:{c}">{n}</div>'
                 for i, (n, c, x, y) in enumerate(grades))
    gb = f'''
      <div class="abs" style="inset:0;background:#FCF7F0"></div>
      <div class="abs" style="left:56px;top:226px;width:968px;height:120px;overflow:hidden;z-index:40">
        <div id="g-q0" class="cap" style="left:0;top:0;opacity:1">¿Qué puedo <em>cursar</em>?</div>
        <div id="g-q1" class="cap" style="left:0;top:0">¿Cuánto me <em>falta</em>?</div>
        <div id="g-q2" class="cap" style="left:0;top:0">¿Cuál es mi <em>promedio</em>?</div>
      </div>
      <div id="g-k1">
        <div class="clu" style="left:0;width:1080px;top:690px;text-align:center;font-size:58px;font-weight:600;opacity:1">Balances de Masa y Energía</div>
        <div class="clu" style="left:0;width:1080px;top:776px;text-align:center;font-size:38px;color:{SOFT};opacity:1">pide estas correlativas</div>
        {nums1}
        <div id="g-la" class="clu mono" style="left:0;width:1080px;top:1092px;text-align:center;font-size:30px;letter-spacing:.1em;color:{SOFT}">CURSADAS (REGULAR)</div>
        <div id="g-lb" class="clu mono" style="left:0;width:1080px;top:1332px;text-align:center;font-size:30px;letter-spacing:.1em;color:{SOFT}">APROBADAS</div>
      </div>
      <div id="g-k2">
        <div id="g-41" class="clu serif" style="left:0;width:1080px;top:600px;text-align:center;font-size:300px;line-height:1">41</div>
        <div id="g-41l" class="clu" style="left:0;width:1080px;top:930px;text-align:center;font-size:44px">materias obligatorias</div>
        <div id="g-bar" class="abs" style="left:89px;top:1040px;width:902px;height:64px;opacity:0">{segs}</div>
        <div id="g-av" class="clu" style="left:0;width:1080px;top:1150px;text-align:center;font-size:40px;color:{SOFT}">avance: <span class="serif" style="font-size:64px;color:{COB}">12,2 %</span></div>
      </div>
      <div id="g-k3">{gr}
        <div id="g-qm" class="clu serif" style="left:0;width:1080px;top:760px;text-align:center;font-size:360px;line-height:1;color:{COB}">?</div>
        <div id="g-qml" class="clu mono" style="left:0;width:1080px;top:1170px;text-align:center;font-size:32px;letter-spacing:.1em;color:{SOFT}">PROM. CON APLAZOS</div>
      </div>'''
    gj = ''
    scatter1 = [(-420, -380, -20), (380, -300, 15), (-300, 420, 25), (420, 380, -15), (-120, -520, 10), (-460, 120, -25), (480, -60, 20), (60, 520, -10)]
    for i in range(5):
        dx, dy, r = scatter1[i]
        gj += f"\n  tl.fromTo('#g-a{i}', {{ opacity: 0, x: {dx}, y: {dy}, rotation: {r}, scale: 0.7 }}, {{ opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.55, ease: 'expo.out' }}, {0.12 + i * 0.07:.2f});"
    for i in range(3):
        dx, dy, r = scatter1[5 + i]
        gj += f"\n  tl.fromTo('#g-b{i}', {{ opacity: 0, x: {dx}, y: {dy}, rotation: {r}, scale: 0.7 }}, {{ opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.55, ease: 'expo.out' }}, {0.47 + i * 0.07:.2f});"
    gj += '''
  blurIn('#g-la', 0.75); blurIn('#g-lb', 0.85);
  tl.to('#g-k1', { opacity: 0, filter: 'blur(10px)', scale: 0.96, duration: 0.24, ease: 'power2.in' }, 1.45);
  tl.to('#g-q0', { y: -120, opacity: 0, duration: 0.22, ease: 'power3.in' }, 1.5);
  tl.fromTo('#g-q1', { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: 'expo.out' }, 1.6);
  tl.fromTo('#g-41', { opacity: 0, scale: 1.3, filter: 'blur(12px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'expo.out' }, 1.65);
  blurIn('#g-41l', 1.85);
  tl.to('#g-bar', { opacity: 1, duration: 0.15 }, 1.95);'''
    for i in range(5):
        gj += f"\n  tl.to('#g-s{i}', {{ backgroundColor: '{COB}', duration: 0.08 }}, {2.05 + i * 0.07:.2f});"
    gj += '''
  blurIn('#g-av', 2.45);
  tl.to('#g-k2', { opacity: 0, filter: 'blur(10px)', scale: 0.96, duration: 0.24, ease: 'power2.in' }, 3.0);
  tl.to('#g-q1', { y: -120, opacity: 0, duration: 0.22, ease: 'power3.in' }, 3.05);
  tl.fromTo('#g-q2', { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: 'expo.out' }, 3.15);'''
    for i, (n, c, x, y) in enumerate(grades):
        gj += (f"\n  tl.fromTo('#g-g{i}', {{ opacity: 0, scale: 0.5, rotation: {(-1) ** i * 14} }}, {{ opacity: 1, scale: 1, rotation: {(-1) ** i * 6}, duration: 0.4, ease: 'back.out(1.7)' }}, {3.2 + i * 0.08:.2f});"
               f"\n  tl.to('#g-g{i}', {{ x: {540 - x - 40}, y: {900 - y}, scale: 0.3, opacity: 0, rotation: 0, duration: 0.42, ease: 'power3.in' }}, {3.8 + i * 0.03:.2f});")
    gj += '''
  tl.fromTo('#g-qm', { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.42, ease: 'back.out(1.8)' }, 4.1);
  blurIn('#g-qml', 4.2);
  tl.to('#g-q2', { opacity: 0, filter: 'blur(10px)', duration: 0.16 }, 4.4);
  tl.to('#g-k3', { y: -260, opacity: 0, scale: 0.8, duration: 0.42, ease: 'power3.in' }, 4.35);'''
    gancho = scene('gancho', gb, gj, G_DUR)

    # ───── escena 2 · la herramienta real ─────
    H0 = 4.4
    F = M['filas']
    S_PRIV, S_TAB, S_FIN, S_DASH = 470, 2256, 870, 1430

    def scr(x, y, S, scrollx=0):
        return x * Z - scrollx * Z, PT + (y - S) * Z

    def selc(n):
        r = F[str(n)]['sel']
        return scr(r[0] + r[2] / 2, r[1] + r[3] / 2, S_TAB)

    def rowc(n):
        r = F[str(n)]['fila']
        return PT + (r[1] + r[3] / 2 - S_TAB) * Z

    def ringbox(n):
        r = F[str(n)]['fila']
        x, y = scr(r[0], r[1], S_TAB)
        return x + 4, y + 2, min(r[2], 458) * Z - 8, r[3] * Z - 4

    links = [(6, 11), (6, 14), (4, 13), (5, 13), (3, 10), (3, 12)]
    paths = ''.join(f'<path id="h-ln{a}-{b}" d="M 0 0" pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="1"/>' for a, b in links)
    rings = ''.join(f'<div id="h-rg{n}" class="ring"></div>' for n in [10, 11, 12, 13, 14])
    feats = [('Correlativas', 60, 560), ('Avance de carrera', 540, 700), ('Promedios', 40, 860),
             ('Exámenes finales', 560, 1010), ('Exportá a Excel', 50, 1170), ('Google Sheets', 600, 1320), ('Respaldo en JSON', 120, 1470)]
    fh = ''.join(f'<div id="h-f{i}" class="feat" style="left:{x}px;top:{y}px"><i>✓</i>{tx}</div>' for i, (tx, x, y) in enumerate(feats))
    hb = f'''
      <div class="abs" style="inset:0;background:#FCF7F0"></div>
      <div id="h-screen" class="screen" style="top:{PT}px">
        <div id="h-cam" class="cam"><iframe id="h-fr" src="assets/site/pages/recursos/seguimiento.html" style="width:{W}px;height:{H}px;zoom:{Z:.4f}" scrolling="no"></iframe></div>
      </div>
      <div id="h-ringp" class="ring"></div>
      {rings}
      <svg class="abs" style="left:0;top:0;z-index:56" width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" stroke="{COB}" stroke-width="6" stroke-linecap="butt" data-layout-ignore>{paths}</svg>
      <div id="h-drop" class="drop"><div><i></i>No Cursada</div><div><i></i>Cursando</div><div id="h-op2"><i></i>Regular</div><div id="h-op3"><i></i>Aprobada</div></div>
      <div id="h-k0" class="kp" style="left:55px;top:1380px"><div class="l">Prom. sin aplazos</div><div id="h-k0v" class="v">—</div></div>
      <div id="h-k1" class="kp" style="left:555px;top:1380px"><div class="l">Prom. con aplazos</div><div id="h-k1v" class="v">—</div></div>
      {fh}
      {caps('h', [('c1', 'Tu carrera, en una <em>planilla</em>', None),
                  ('c2', 'Sin <em>cuentas</em>', 'Tus datos quedan en tu dispositivo.'),
                  ('c3', 'Marcá tus <em>materias</em>', None),
                  ('c4', 'Se habilitan sus <em>correlativas</em>', None),
                  ('c5', 'Cargá tus <em>finales</em>', 'Los promedios se calculan solos.'),
                  ('c6', 'Todo tu avance, al <em>día</em>', None)])}
      <div id="h-claim" class="cap" style="white-space:normal;font-size:92px">Marcá tus materias.<br>La planilla hace <em>el resto</em>.</div>
      <div id="h-tap" class="tap"></div><div id="h-tap2" class="tap"></div>'''

    def kpis(nombre):
        return [v for _, v in V[nombre]['kpis']]
    k_aga, k_fin = kpis('t_aga'), kpis('f_fis3')

    hj = Template(r"""
  const vals = QA('#seg-dashboard .seg-kpi__value');
  vals.forEach((v) => { v.style.display = 'inline-block'; v.style.transformOrigin = '0% 60%'; });
  // los paneles ocultos pasan a manejarse con display (se deshace bien al retroceder)
  const panelSeg = Q('#seg-panel-seguimiento'), panelFin = Q('#seg-panel-finales');
  panelFin.hidden = false; panelFin.style.display = 'none';
  // geometría medida en la página real, dentro del iframe (px CSS del teléfono)
  const Z = $Z, PT = $PT;
  const RR = (el) => el.getBoundingClientRect();
  const sy = (y, S) => PT + (y - S) * Z;
  const priv = RR(Q('.seguimiento__nota-privacidad'));
  const S_PRIV = priv.top - (660 - PT) / Z;
  Object.assign(document.getElementById('h-ringp').style, { left: (priv.left * Z - 6) + 'px', top: (660 - 6) + 'px', width: (priv.width * Z + 12) + 'px', height: (priv.height * Z + 12) + 'px' });
  const S_TAB = RR(Q('#seg-tabla-seguimiento thead')).top - (414 - PT) / Z;
  const filaR = (n) => RR(Q('#seg-tabla-seguimiento tr[data-numero="' + n + '"]'));
  const tw = RR(Q('#seg-tabla-seguimiento .seg-table-scroll'));
  [10, 11, 12, 13, 14].forEach((n) => { const r = filaR(n); Object.assign(document.getElementById('h-rg' + n).style, { left: (tw.left * Z + 4) + 'px', top: (sy(r.top, S_TAB) + 2) + 'px', width: (tw.width * Z - 8) + 'px', height: (r.height * Z - 4) + 'px' }); });
  [[6, 11], [6, 14], [4, 13], [5, 13], [3, 10], [3, 12]].forEach((ab) => {
    const ra = filaR(ab[0]), rb = filaR(ab[1]);
    const ya = sy(ra.top + ra.height / 2, S_TAB), yb = sy(rb.top + rb.height / 2, S_TAB), bx = 24 - Math.abs(yb - ya) / 160;
    document.getElementById('h-ln' + ab[0] + '-' + ab[1]).setAttribute('d', 'M 52 ' + ya + ' C ' + bx + ' ' + ya + ', ' + bx + ' ' + yb + ', 52 ' + yb);
  });
  const SELC = {};
  [3, 4, 5, 6].forEach((n) => { const r = RR(Q('#seg-estado-' + n)); SELC[n] = [(r.left + r.width / 2) * Z, sy(r.top + r.height / 2, S_TAB)]; });
  const tSeg = Q('.seg-tabs__tab[data-tab="seguimiento"]'), tFin = Q('.seg-tabs__tab[data-tab="finales"]');
  const S_FIN = RR(Q('.seg-tabs')).top - (412 - PT) / Z;
  const tc = (el) => { const r = RR(el); return [(r.left + r.width / 2) * Z, sy(r.top + r.height / 2, S_FIN)]; };
  const TF = tc(tFin), TS = tc(tSeg);
  panelSeg.style.display = 'none'; panelFin.style.display = 'block';
  const sc = Q('#seg-tabla-finales .seg-table-scroll');
  const scR = RR(sc);
  const fila = (n) => Q('#seg-tabla-finales tr[data-numero="' + n + '"]');
  const ins = (n) => Array.from(fila(n).querySelectorAll('input')).filter((i) => getComputedStyle(i.parentElement).display !== 'none');
  const INS = {}, SCR = {};
  [3, 5].forEach((n) => {
    INS[n] = ins(n).map(RR);
    SCR[n] = [0, 1, 2].map((k) => Math.max(0, Math.ceil(INS[n][2 * k + 1].right - (scR.left + scR.width) + 16)));
  });
  const finBottom = RR(Q('#seg-tabla-finales')).bottom;
  panelSeg.style.display = ''; panelFin.style.display = 'none';
  const KT = sy(finBottom, S_FIN) + 34;
  document.getElementById('h-k0').style.top = KT + 'px';
  document.getElementById('h-k1').style.top = KT + 'px';
  let tapN = 0;
  const tapA = (x, y, t) => tap((tapN++ % 2) ? '#h-tap2' : '#h-tap', x, y, t);
  const tapIn = (n, i, s, t) => { const r = INS[n][i]; tapA((r.left + r.width / 2 - s) * Z, sy(r.top + r.height / 2, S_FIN), t); };
  const S_DASH = RR(QA('#seg-dashboard .seg-kpi')[4]).top - (430 - PT) / Z;

  tl.fromTo('#h-screen', { y: 1500 }, { y: 0, duration: 0.55, ease: 'power3.out' }, 0.0);
  blurIn('#h-c1', 0.3);
  tl.to('#h-cam', { y: -S_PRIV * Z, duration: 1.25, ease: 'power2.inOut' }, 0.55);
  capSwap('#h-c1', '#h-c2', 1.85); blurIn('#h-c2s', 2.05);
  tl.fromTo('#h-ringp', { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'expo.out' }, 2.05);
  tl.to('#h-ringp', { opacity: 0, duration: 0.25 }, 3.25);
  blurOut('#h-c2s', 3.3);
  // de la cabecera a la tabla, sin cortes
  tl.to('#h-cam', { y: -S_TAB * Z, duration: 1.1, ease: 'power2.inOut' }, 3.35);
  capSwap('#h-c2', '#h-c3', 3.6);
  const marcar = (n, val, t, opt, dur) => {
    const sel = Q('#seg-estado-' + n);
    const c = SELC[n];
    tapA(c[0], c[1], t);
    tl.set('#h-drop', { left: c[0] - 150, top: c[1] + 46 }, t);
    tl.fromTo('#h-drop', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.16, ease: 'expo.out' }, t + 0.15);
    tl.set(opt, { backgroundColor: 'rgba(146,47,161,0.12)' }, t + 0.15 + dur);
    tl.set(opt + ' i', { borderColor: '$MAU', borderWidth: '9px' }, t + 0.15 + dur);
    tapA(c[0], c[1] + 46 + (opt === '#h-op3' ? 238 : 170), t + 0.08 + dur);
    tl.to('#h-drop', { opacity: 0, duration: 0.12 }, t + 0.3 + dur);
    tl.set(opt, { backgroundColor: 'rgba(146,47,161,0)' }, t + 0.42 + dur);
    tl.set(opt + ' i', { borderColor: '#9AA1AD', borderWidth: '3px' }, t + 0.42 + dur);
    tl.set(sel, { value: val }, t + 0.32 + dur);
    // la columna Disponible pasa a mostrar el estado de la materia, como en la herramienta
    const bm = Q('#seg-tabla-seguimiento tr[data-numero="' + n + '"] .seg-badge');
    const ap = val === 'Aprobada';
    tl.set(bm, { attr: { class: 'seg-badge seg-badge--' + (ap ? 'aprobada' : 'regular') } }, t + 0.32 + dur);
    tl.set(bm.querySelector('.seg-badge__icon'), { innerHTML: ap ? '✓' : '◐' }, t + 0.32 + dur);
    tl.set(bm.querySelector('.seg-badge__text'), { innerHTML: val }, t + 0.32 + dur);
  };
  const habilitar = (n, t) => {
    const b = Q('#seg-tabla-seguimiento tr[data-numero="' + n + '"] .seg-badge');
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
  // 1) Química aprobada: se habilitan Química Inorgánica y Química Orgánica
  marcar(6, 'Aprobada', 4.7, '#h-op3', 0.5);
  capSwap('#h-c3', '#h-c4', 5.65);
  linea(6, 11, 5.6); linea(6, 14, 5.68);
  habilitar(11, 5.92); habilitar(14, 6.04);
  // 2) Análisis Matemático I aprobada y Física I regular: Física II
  marcar(4, 'Aprobada', 7.0, '#h-op3', 0.3);
  marcar(5, 'Regular', 7.6, '#h-op2', 0.3);
  linea(4, 13, 8.2); linea(5, 13, 8.25); habilitar(13, 8.5);
  // 3) Álgebra regular: Probabilidad y Estadística y Análisis Matemático II
  marcar(3, 'Regular', 8.95, '#h-op2', 0.3);
  linea(3, 10, 9.55); linea(3, 12, 9.6); habilitar(10, 9.85); habilitar(12, 9.97);
  // el tablero (fuera de cuadro) ya refleja estos cambios, como en la herramienta real
  const KAGA = $KAGA;
  vals.forEach((v, i) => tl.set(v, { innerHTML: KAGA[i] }, 10.0));
  // a la pestaña de exámenes finales
  capSwap('#h-c4', '#h-c5', 10.6); blurIn('#h-c5s', 10.8);
  tl.to('#h-cam', { y: -S_FIN * Z, duration: 1.0, ease: 'power2.inOut' }, 10.55);
  tapA(TF[0], TF[1], 11.7);
  tl.set(tSeg, { attr: { 'aria-selected': 'false' } }, 11.83);
  tl.set(tFin, { attr: { 'aria-selected': 'true' } }, 11.83);
  tl.set(panelSeg, { display: 'none' }, 11.83);
  tl.set(panelFin, { display: 'block' }, 11.83);
  tl.fromTo('#h-k0, #h-k1', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out', stagger: 0.08 }, 12.0);
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
  tapA(TS[0], TS[1], 18.15);
  tl.set(tSeg, { attr: { 'aria-selected': 'true' } }, 18.28);
  tl.set(tFin, { attr: { 'aria-selected': 'false' } }, 18.28);
  tl.set(panelFin, { display: 'none' }, 18.28);
  tl.set(panelSeg, { display: 'block' }, 18.28);
  tl.to('#h-k0, #h-k1', { opacity: 0, y: 30, duration: 0.2 }, 18.25);
$DASH
  tl.to('#h-cam', { y: -S_DASH * Z, duration: 1.2, ease: 'power2.inOut' }, 18.95);
  // cierre: la planilla se aleja y aparecen sus funciones
  blurOut('#h-c6', 20.4);
  tl.to('#h-screen', { scale: 0.56, y: 140, borderRadius: '44px', transformOrigin: '540px 0px', duration: 0.75, ease: 'power3.inOut' }, 20.4);
$END
""")
    F_JS = ''
    t = 12.3
    seq = [(3, 0, '20/02/2024', '4', 'f_aga1'), (3, 1, '05/03/2024', '7', 'f_aga2'),
           (5, 0, '24/07/2024', '2', 'f_fis1'), (5, 1, '11/12/2024', '5', 'f_fis2'), (5, 2, '19/02/2025', '8', 'f_fis3')]
    scroll_now = '0'
    sfx_fin = []

    def desplazar(expr, t):
        return f"\n  tl.to(sc, {{ scrollLeft: {expr}, duration: 0.34, ease: 'power2.inOut' }}, {t:.2f});"
    for idx, (n, k, fecha, nota, vk) in enumerate(seq):
        fast = n == 5
        fi, ni = 2 * k, 2 * k + 1
        if not (n == 3 and k == 0):
            scroll_now = f'SCR[{n}][{k}]'
            F_JS += desplazar(scroll_now, t)
            t += 0.38
        F_JS += f"\n  tapIn({n}, {fi}, {scroll_now}, {t:.2f});"
        F_JS += f"\n  foco(ins({n})[{fi}], {t + 0.13:.2f}, {t + (0.55 if not fast else 0.3):.2f});"
        if fast:
            F_JS += f"\n  tl.set(ins({n})[{fi}], {{ value: '{fecha}' }}, {t + 0.15:.2f});"
            t += 0.28
        else:
            F_JS += f"\n  tipear(ins({n})[{fi}], '{fecha}', {t + 0.16:.2f}, 0.028);"
            sfx_fin += [('tecla', t + 0.16 + j * 0.056, 0.06) for j in range(5)]
            t += 0.5
        if n == 3 and k == 0:
            scroll_now = 'SCR[3][0]'
            F_JS += desplazar(scroll_now, t)
            t += 0.38
        F_JS += f"\n  tapIn({n}, {ni}, {scroll_now}, {t:.2f});"
        F_JS += f"\n  foco(ins({n})[{ni}], {t + 0.13:.2f}, {t + 0.45:.2f});"
        F_JS += f"\n  tl.set(ins({n})[{ni}], {{ value: '{nota}' }}, {t + 0.2:.2f});"
        sfx_fin.append(('tecla', t + 0.2, 0.08))
        kk = dict(V[vk]['kpis'])
        sin = kk['Prom. sin aplazos']
        prev_sin = dict(V[seq[idx - 1][4]]['kpis'])['Prom. sin aplazos'] if idx else '—'
        F_JS += f"\n  prom({json.dumps(sin) if sin != prev_sin else 'null'}, '{kk['Prom. con aplazos']}', {t + 0.32:.2f});"
        sfx_fin.append(('pop-a' if idx % 2 else 'pop-b', t + 0.33, 0.14))
        t += 0.5 if not fast else 0.4
        if (n == 3 and k == 1) or (n == 5 and k == 2):
            F_JS += desplazar('0', t)
            t += 0.38
            scroll_now = '0'
            nc = f"Q('#seg-tabla-finales tr[data-numero=\"{n}\"] [data-col=\"nota\"]')"
            F_JS += (f"\n  tl.set({nc}, {{ innerHTML: '{V[vk]['notaFin'][str(n)]}', color: '{POS}', fontWeight: '600' }}, {t:.2f}); pop({nc}, {t:.2f});")
            sfx_fin.append(('pop-b', t + 0.01, 0.14))
            t += 0.42
    fin_end = t
    D_JS = ''
    for i, (a, b) in enumerate(zip(k_aga, k_fin)):
        if a == b:
            continue
        D_JS += f"\n  tl.set(vals[{i}], {{ innerHTML: '{b}' }}, {18.45 + i * 0.06:.2f}); pop(vals[{i}], {18.45 + i * 0.06:.2f});"
    E_JS = "\n  blurIn('#h-claim', 20.6, 0.3);"
    for i in range(len(feats)):
        E_JS += f"\n  tl.fromTo('#h-f{i}', {{ opacity: 0, scale: 0.6, y: 30 }}, {{ opacity: 1, scale: 1, y: 0, duration: 0.42, ease: 'back.out(1.8)' }}, {20.95 + i * 0.12:.2f});"
    E_JS += "\n  blurOut('#h-claim', 23.65);"
    for i in range(len(feats)):
        E_JS += f"\n  tl.to('#h-f{i}', {{ x: {540 - feats[i][1] - 160}, y: {900 - feats[i][2]}, scale: 0.3, opacity: 0, duration: 0.4, ease: 'power3.in' }}, {23.6 + i * 0.02:.2f});"
    E_JS += "\n  tl.to('#h-screen', { scale: 0.12, y: 600, opacity: 0, duration: 0.45, ease: 'power3.in' }, 23.65);"
    hj = hj.substitute(Z=f'{Z:.5f}', PT=PT, MAU=MAU, KAGA=json.dumps(k_aga), FINALES=F_JS, DASH=D_JS, END=E_JS)
    delta = round(max(0.0, fin_end + 0.15 - 18.0), 2)
    cut = hj.index('  // de vuelta a Seguimiento')
    hj = hj[:cut] + shift(hj[cut:], lambda x: x + delta if x >= 17.95 else x)
    H_DUR = round(24.25 + delta, 2)
    herr = scene('herramienta', hb, hj, H_DUR, iframe_id='h-fr')

    # ───── escena 3 · cierre ─────
    C0 = round(H0 + 23.9 + delta, 2)
    C_DUR = 3.4
    cb, cj = cierre('c', 'Recursos académicos › Seguimiento de Carrera', 'También en Excel y Google Sheets', C_DUR)
    cierre_html = scene('cierre', cb, cj, C_DUR)
    total = round(C0 + C_DUR, 2)

    sfx = [('pop-a', 0.3, 0.12), ('pop-b', 0.6, 0.12), ('pop-a', 1.75, 0.14), ('pop-b', 3.3, 0.12), ('pop-a', 4.15, 0.14),
           ('barrido-a', 4.35, 0.14)]
    H = H0
    sfx += [('barrido-b', H + 3.35, 0.1)]
    for tt, d in [(4.7, 0.5), (7.0, 0.3), (7.6, 0.3), (8.95, 0.3)]:
        sfx.append(('toque', H + tt + 0.13, 0.24))
        sfx.append(('toque', H + tt + 0.21 + d, 0.2))
    sfx += [('pop-a', H + 5.93, 0.13), ('pop-b', H + 6.05, 0.13), ('pop-a', H + 8.51, 0.13), ('pop-b', H + 9.86, 0.13), ('pop-a', H + 9.98, 0.13)]
    sfx += [('barrido-a', H + 10.55, 0.1), ('toque', H + 11.83, 0.24)]
    sfx += [(n, H + tt, v) for n, tt, v in sfx_fin]
    sfx += [('toque', H + 18.28 + delta, 0.24), ('barrido-b', H + 20.4 + delta, 0.12), ('cierre', C0 + 0.35 - 0.8, 0.32)]
    write_project(proj, {'gancho': gancho, 'herramienta': herr, 'cierre': cierre_html}, index_html(
        'Seguimiento de Carrera — historia', [('gancho', 0, G_DUR), ('herramienta', H0, H_DUR), ('cierre', C0, C_DUR)], sfx, total, 'seguimiento'))
    return total, fin_end, delta


if __name__ == '__main__':
    print('apuntes', build_apuntes())
    print('seguimiento', build_seguimiento())
