#!/usr/bin/env python3
"""Genera las composiciones HyperFrames de los bocetos (A, B, C, A+B).

Escribe HTML estático en promo/historias-instagram/bocetos/: cada elemento
temporizado queda escrito en el HTML (no lo crea un script en tiempo de render).
"""
import json, os, sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.path.dirname(os.path.abspath(__file__))
plan = json.load(open(os.path.join(REPO, 'data/plan_academico.json')))
MAT = {m['numero']: m for m in plan['materias']}
OBL = [m for m in plan['materias'] if m['tipo'] == 'obligatoria']

NIVEL_ORDER = {
    'I': [1, 2, 3, 4, 5, 6, 7, 8],
    'II': [9, 10, 11, 12, 13, 14, 15, 40],
    'III': [16, 17, 18, 19, 20, 21, 22, 23, 24, 41],
    'IV': [25, 26, 27, 28, 29, 30, 31, 32],
    'V': [33, 34, 35, 36, 37, 38, 39],
}
NIVEL_COL = {  # tokens.css --nivel-*
    'I': ('#507ED3', '#EEF4FD', '#315393'),
    'II': ('#8E6AC7', '#F5F2FC', '#5F4489'),
    'III': ('#039585', '#EAF7F4', '#006459'),
    'IV': ('#AA7323', '#FAF2E9', '#744B0A'),
    'V': ('#C65A4F', '#FDF0EE', '#893830'),
}
ABBR = {1: 'IIQ', 2: 'IyS', 3: 'AGA', 4: 'AM1', 5: 'F1', 6: 'Q', 7: 'SR', 8: 'FI',
        9: 'IEP', 10: 'PyE', 11: 'QI', 12: 'AM2', 13: 'F2', 14: 'QO', 15: 'Lg', 40: 'In1',
        16: 'BME', 17: 'Td', 18: 'MSA', 19: 'CM', 20: 'FQ', 21: 'FT', 22: 'QA', 23: 'MQB',
        24: 'QAp', 41: 'In2', 25: 'DSO', 26: 'OU1', 27: 'TET', 28: 'Ec', 29: 'OU2', 30: 'IRQ',
        31: 'CCE', 32: 'OI', 33: 'CAP', 34: 'MI', 35: 'IA', 36: 'PB', 37: 'HyS', 38: 'MIE',
        39: 'PF'}
SIN_CARPETA = {28, 40, 41}


def disponibles(est):
    out = []
    for m in OBL:
        n = m['numero']
        if est.get(n, 'No Cursada') != 'No Cursada':
            continue
        if all(est.get(c) in ('Regular', 'Aprobada') for c in m['cursadas_requeridas']) and \
           all(est.get(a) == 'Aprobada' for a in m['aprobadas_requeridas']):
            out.append(n)
    return out


EST_I_II = {n: 'Aprobada' for n in NIVEL_ORDER['I'] + NIVEL_ORDER['II']}
DISP_I_II = set(disponibles(EST_I_II))
PF_FALTAN = len(MAT[39]['cursadas_requeridas']) + len(MAT[39]['aprobadas_requeridas'])


def pct(n):
    return ('%.1f' % (100 * n / 41)).replace('.', ',')


# ───────────────────────────── CSS compartido ─────────────────────────────
CSS = r"""
@font-face{font-family:'Fraunces';src:url('assets/fonts/fraunces-400-600.woff2') format('woff2');font-weight:400 600;font-style:normal}
@font-face{font-family:'Hanken Grotesk';src:url('assets/fonts/hanken-grotesk-400-600.woff2') format('woff2');font-weight:400 600;font-style:normal}
@font-face{font-family:'Geist Mono';src:url('assets/fonts/geist-mono-400-500.woff2') format('woff2');font-weight:400 500;font-style:normal}
#root{position:absolute;inset:0;background:#F2F4F8;overflow:hidden;font-family:'Hanken Grotesk',sans-serif;color:#131720}
.part{position:absolute;inset:0;background:#F2F4F8;overflow:hidden}
.abs{position:absolute}
.serif{font-family:'Fraunces',serif;font-weight:400;letter-spacing:-0.015em}
.mono{font-family:'Geist Mono',monospace}
.blabel{position:absolute;z-index:40;left:60px;top:1680px;padding:8px 12px;border-radius:8px;background:rgba(242,244,248,.92);font-family:'Geist Mono',monospace;font-size:28px;letter-spacing:.06em;color:#5B5F69}
.tap{position:absolute;width:88px;height:88px;margin:-44px 0 0 -44px;border-radius:50%;background:rgba(19,23,32,.28);box-shadow:0 6px 18px rgba(11,41,100,.25);opacity:0;pointer-events:none;z-index:20}
/* tarjeta de título */
.tc{position:absolute;left:72px;top:380px;width:936px;display:flex;flex-direction:column;gap:26px}
.tc-letter{font-size:300px;line-height:.9;color:#1344A5}
.tc-name{font-size:96px;line-height:1.05}
.tc-desc{font-size:44px;line-height:1.35;color:#444953}
.tc-label{margin-top:36px;font-size:28px;letter-spacing:.08em;color:#5B5F69}
/* gancho */
.hook{left:72px;top:300px;width:936px}
.hook-day{font-size:46px;color:#444953}
.hook-time{font-size:270px;line-height:.95;margin-top:6px}
.hook-need{font-size:54px;font-weight:500;margin-top:18px}
.bubbles{left:72px;top:840px;width:936px;display:flex;flex-direction:column;gap:22px}
.bubble{align-self:flex-start;max-width:780px;padding:26px 36px;border-radius:36px 36px 36px 10px;background:#FFFFFF;border:2px solid #E1E4E9;font-size:42px;line-height:1.3;opacity:0}
.bubble.me{align-self:flex-end;background:#1344A5;color:#F9FAFC;border-color:#1344A5;border-radius:36px 36px 10px 36px}
.q{left:72px;top:820px;width:936px;font-size:92px;line-height:1.05}
.tok{font-size:38px;color:#444953;white-space:nowrap;opacity:0}
.tok b{color:#131720;font-weight:500}
.chip{left:72px;top:262px;height:66px;padding:0 28px;border-radius:999px;background:#FFFFFF;border:2px solid #CED2D9;font-size:34px;display:flex;align-items:center;gap:14px;opacity:0;z-index:15}
.chip-dot{width:14px;height:14px;border-radius:50%;background:#1344A5}
.chip-win{position:relative;width:104px;height:42px;overflow:hidden}
.chip-win span{position:absolute;left:0;top:0;line-height:42px}
/* página de apuntes */
.page{left:72px;top:350px;width:936px}
.crumbs{font-size:32px;color:#444953;margin-bottom:14px}
.page-h1{font-size:116px;line-height:1.02;margin:0 0 34px}
.pills{display:flex;flex-wrap:wrap;gap:16px}
.pill{position:relative;height:76px;padding:0 34px;border-radius:999px;border:2px solid #CED2D9;background:#F9FAFC;font-size:34px;display:flex;align-items:center}
.pill.on{background:#1344A5;border-color:#1344A5;color:#FFFFFF}
.card{left:72px;top:900px;width:936px;background:#F9FAFC;border:2px solid #E1E4E9;border-radius:20px;overflow:hidden}
.card-cover{height:380px;overflow:hidden}
.card-cover img{width:100%;height:100%;object-fit:cover;display:block}
.card-body{position:relative;padding:32px 40px 36px}
.card-year{font-family:'Geist Mono',monospace;font-size:28px;letter-spacing:.12em;color:#5B5F69}
.card-name{font-size:46px;font-weight:500;line-height:1.2;margin:10px 0 14px}
.card-cta{font-family:'Geist Mono',monospace;font-size:30px;color:#1344A5;display:flex;gap:12px}
.card-cta span{display:inline-block}
.zoom{left:74px;top:902px;width:932px;height:380px;overflow:hidden;opacity:0;z-index:12}
.zoom img{width:100%;height:100%;object-fit:cover;display:block}
/* Drive simulado */
.drive{left:0;top:0;width:1080px;height:1920px;background:#FFFFFF;padding:350px 72px 0;opacity:0;z-index:13}
.drv-search{height:96px;border-radius:999px;background:#EEF1F6;font-size:36px;color:#5B5F69;padding:0 40px;display:flex;align-items:center;gap:22px}
.drv-crumb{margin-top:44px;font-size:34px;color:#5B5F69;line-height:1.3}
.drv-title{margin-top:10px;font-size:56px;font-weight:600;line-height:1.18}
.drv-head{margin-top:38px;padding-bottom:16px;border-bottom:2px solid #E1E4E9;font-family:'Geist Mono',monospace;font-size:28px;letter-spacing:.06em;color:#5B5F69}
.drv-row{position:relative;height:124px;display:flex;align-items:center;gap:30px;border-bottom:2px solid #EEF0F3;font-size:40px;padding:0 12px}
.drv-row .ic{flex:0 0 64px;display:flex;justify-content:center}
.pdf{width:52px;height:64px;border-radius:7px;background:#D93025;color:#fff;font:600 17px 'Hanken Grotesk',sans-serif;display:flex;align-items:flex-end;justify-content:center;padding-bottom:9px}
.hl{position:absolute;inset:0;background:#E3ECFB;opacity:0;z-index:0}
.drv-row > *:not(.hl){position:relative;z-index:1}
.drv-row > .tap{position:absolute;z-index:20}
.viewer{left:0;top:0;width:1080px;height:1920px;background:#E3E6EC;opacity:0;z-index:14}
.viewer-bar{position:absolute;left:0;top:250px;width:1080px;height:116px;background:#FFFFFF;display:flex;align-items:center;gap:26px;padding:0 72px;font-size:36px;border-bottom:2px solid #E1E4E9}
.viewer-page{position:absolute;left:130px;top:430px;width:820px;height:1080px;background:#FFFFFF;box-shadow:0 18px 40px rgba(11,41,100,.14);padding:80px 70px}
.ln{height:22px;border-radius:6px;background:#E1E4E9;margin-bottom:26px}
.ln.t{height:40px;width:62%;background:#CED2D9;margin-bottom:52px}
/* cierre */
.flood{left:0;top:0;width:1080px;height:1920px;background:#F2F4F8;opacity:0;z-index:16}
.claim{left:72px;top:560px;width:936px;font-size:104px;line-height:1.06;opacity:0;z-index:17}
.claim-sub{left:72px;top:1010px;width:936px;font-size:44px;line-height:1.35;color:#444953;opacity:0;z-index:17}
.endcard{left:72px;top:470px;width:936px;display:flex;flex-direction:column;align-items:center;gap:22px;opacity:0;z-index:18}
.end-logo{width:300px;height:300px}
.end-name{font-size:92px}
.end-url{font-size:38px;color:#1344A5}
.end-sticker{margin-top:56px;width:640px;height:150px;border:3px dashed #9AA1AD;border-radius:28px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#5B5F69;font-family:'Geist Mono',monospace}
/* seguimiento */
.tool{left:72px;top:340px;width:936px}
.tool-h1{font-size:96px;line-height:1.04;margin:0}
.kpis{display:flex;gap:24px;margin-top:30px}
.kpi{flex:1;background:#F9FAFC;border:2px solid #E1E4E9;border-radius:20px;padding:24px 30px}
.kpi-l{font-family:'Geist Mono',monospace;font-size:26px;letter-spacing:.1em;color:#5B5F69}
.kpi-v{font-size:96px;line-height:1.08}
.kpi-h{font-family:'Geist Mono',monospace;font-size:23px;color:#5B5F69}
.tbl{margin-top:30px;background:#F9FAFC;border:2px solid #E1E4E9;border-radius:20px}
.lvl{height:64px;padding:0 28px;display:flex;align-items:center;font-size:32px;font-weight:500}
.trow{position:relative;height:96px;display:flex;align-items:center;padding:0 28px;gap:22px;border-top:1px solid #E1E4E9;font-size:36px}
.trow .n{font-family:'Geist Mono',monospace;font-size:30px;width:56px;color:#444953}
.trow .nm{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tint{position:absolute;inset:0;background:#EBF3EE;opacity:0;z-index:0}
.trow > *:not(.tint){position:relative;z-index:1}
.trow .sel .tap{position:absolute}
.sel{position:relative;height:64px;width:270px;padding:0 20px;border:2px solid #CED2D9;border-radius:12px;font-size:30px;display:flex;align-items:center;justify-content:space-between;background:#FFFFFF}
.sel-win{position:relative;width:200px;height:40px;overflow:hidden}
.sel-win span{position:absolute;left:0;top:0;line-height:40px;white-space:nowrap}
.dd{position:absolute;right:0;top:72px;width:300px;background:#FFFFFF;border:2px solid #CED2D9;border-radius:14px;box-shadow:0 18px 40px rgba(11,41,100,.18);opacity:0;z-index:30;overflow:hidden}
.dd div{position:relative;height:70px;display:flex;align-items:center;padding:0 24px;font-size:30px}
.bwrap{position:relative;width:290px;height:58px}
.badge{position:absolute;right:0;top:0;height:58px;padding:0 22px;border-radius:999px;font-size:28px;font-weight:500;display:flex;align-items:center;gap:10px;white-space:nowrap}
.b-no{color:#9B171F;background:#F8ECEC;border:2px solid rgba(155,23,31,.3)}
.b-si{color:#165E2E;background:#EAF3ED;border:2px solid rgba(22,94,46,.35);opacity:0}
.b-ok{color:#165E2E;background:#EAF3ED;border:2px solid rgba(22,94,46,.35)}
.note{left:72px;top:1480px;width:936px;font-family:'Geist Mono',monospace;font-size:28px;color:#5B5F69;opacity:0}
/* grilla de portadas */
.cam{left:0;top:0;width:1080px;height:3400px}
.grid2{position:absolute;left:72px;top:300px;width:936px;display:grid;grid-template-columns:1fr 1fr;column-gap:24px;row-gap:28px}
.gcell{position:relative}
.gimg{height:256px;border-radius:16px;overflow:hidden;background:#E7CDAA}
.gimg img{width:100%;height:100%;object-fit:cover;display:block}
.gname{margin-top:12px;height:76px;font-size:30px;font-weight:500;line-height:1.25}
/* banda de KPI fija y ventana de la tabla */
.kband{left:72px;top:262px;width:936px;background:#F9FAFC;border:2px solid #E1E4E9;border-radius:20px;padding:22px 30px 26px;z-index:6}
.kband-row{display:flex;justify-content:space-between;align-items:flex-end}
.bar{margin-top:16px;height:14px;border-radius:7px;background:#E1E4E9;overflow:hidden}
.bar-fill{height:100%;width:100%;background:#1344A5}
.win{left:72px;top:540px;width:936px;height:1040px;overflow:hidden;border:2px solid #E1E4E9;border-radius:20px;background:#F9FAFC}
.strip{position:absolute;left:0;top:0;width:100%}
.srow{position:relative;height:84px;display:flex;align-items:center;gap:20px;padding:0 24px;border-top:1px solid #E1E4E9;font-size:33px}
.srow .n{font-family:'Geist Mono',monospace;font-size:28px;width:52px;color:#444953}
.srow .nm{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st{position:relative;flex:0 0 280px;width:280px;height:52px}
.st span{position:absolute;right:0;top:0;height:52px;padding:0 18px;border-radius:999px;font-size:26px;font-weight:500;display:flex;align-items:center;gap:8px;white-space:nowrap}
.st-gray{color:#444953;background:#FFFFFF;border:2px solid #CED2D9}
.readline{left:72px;top:1080px;width:936px;height:4px;background:#1344A5;opacity:0;z-index:7}
.pop{left:300px;top:1220px;width:708px;background:#FFFFFF;border:2px solid #CED2D9;border-radius:18px;box-shadow:0 18px 40px rgba(11,41,100,.18);padding:26px 30px;font-size:34px;line-height:1.35;opacity:0;z-index:9}
/* tabla periódica */
.ptitle{left:72px;top:330px;width:936px;font-size:88px;line-height:1.05}
.psub{left:72px;top:444px;width:936px;font-size:28px;letter-spacing:.04em;color:#5B5F69}
.cell{position:absolute;width:90px;height:104px;border-radius:10px;padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between}
.cell .cn{font-family:'Geist Mono',monospace;font-size:20px;line-height:1}
.cell .ca{font-family:'Fraunces',serif;font-size:36px;line-height:1;text-align:center;letter-spacing:-0.02em}
.cell .cf{position:absolute;right:6px;top:6px;width:20px;height:16px;opacity:0}
.plegend{left:72px;top:1210px;width:936px;font-size:27px;line-height:1.5;color:#5B5F69}
.hero{width:90px;height:104px;border-radius:10px;background:#922FA1;color:#FFFFFF;padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;opacity:0;z-index:12}
.hero .cn{font-family:'Geist Mono',monospace;font-size:20px;line-height:1}
.hero .ca{font-family:'Fraunces',serif;font-size:36px;line-height:1;text-align:center}
.bigfolder{left:360px;top:800px;width:360px;height:300px;opacity:0;z-index:12}
.cnt{left:72px;top:1300px;width:936px;opacity:0}
.cnt-l{font-family:'Geist Mono',monospace;font-size:28px;letter-spacing:.1em;color:#5B5F69}
.cnt-v{font-size:150px;line-height:1}
.bonds{left:0;top:0;width:1080px;height:1920px;z-index:9;pointer-events:none}
"""

JS_HELPERS = r"""
  const tl = gsap.timeline({ paused: true });
  const blurIn = (s, t, d = 0.22) => tl.fromTo(s, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: d, ease: 'power4.out' }, t);
  const blurOut = (s, t, d = 0.18) => tl.to(s, { opacity: 0, filter: 'blur(10px)', duration: d, ease: 'power2.in' }, t);
  const popIn = (s, t) => tl.fromTo(s, { opacity: 0, y: 40, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.34, ease: 'back.out(1.7)' }, t);
  const tap = (s, t) => {
    tl.fromTo(s, { opacity: 0, scale: 1.45 }, { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out' }, t);
    tl.to(s, { scale: 0.78, duration: 0.08, ease: 'power2.in' }, t + 0.14);
    tl.to(s, { scale: 1.08, opacity: 0, duration: 0.24, ease: 'power2.out' }, t + 0.24);
  };
  const press = (s, t) => { tl.to(s, { scale: 0.965, duration: 0.09, ease: 'power2.in' }, t + 0.12); tl.to(s, { scale: 1, duration: 0.2, ease: 'power3.out' }, t + 0.22); };
  const roll = (a, b, t, h) => { tl.to(a, { y: -h, opacity: 0, duration: 0.22, ease: 'power3.in' }, t); tl.fromTo(b, { y: h, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'expo.out' }, t + 0.12); };
  const steps = (s, t, vals, dt) => vals.forEach((v, i) => tl.set(s, { innerHTML: v }, t + i * dt));
"""

FOLDER_SVG = '<svg width="64" height="52" viewBox="0 0 64 52"><path d="M4 8a4 4 0 0 1 4-4h16l6 6h26a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#5F6368"/></svg>'
SEARCH_SVG = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5B5F69" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>'
INFO_SVG = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1344A5" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'


def pdf_icon():
    return '<div class="pdf" data-layout-ignore>PDF</div>'


# ───────────────────────────── piezas HTML ─────────────────────────────
def title_card(p, letter, name, desc, label, dur):
    return f'''
    <div id="{p}-title" class="clip part" data-start="0" data-duration="{dur}" data-track-index="1">
      <div id="{p}-tc" class="tc">
        <div id="{p}-tc-letter" class="serif tc-letter">{letter}</div>
        <div id="{p}-tc-name" class="serif tc-name">{name}</div>
        <div id="{p}-tc-desc" class="tc-desc">{desc}</div>
        <div id="{p}-tc-label" class="mono tc-label">{label}</div>
      </div>
    </div>'''


def title_js(p, dur):
    return f'''
  blurIn('#{p}-tc-letter', 0.05, 0.26);
  blurIn('#{p}-tc-name', 0.22);
  blurIn('#{p}-tc-desc', 0.38);
  blurIn('#{p}-tc-label', 0.5);
  blurOut('#{p}-tc', {dur - 0.24:.2f}, 0.2);'''


def hook(p, day, time, need):
    return f'''
      <div id="{p}-hook" class="abs hook">
        <div class="hook-day">{day}</div>
        <div id="{p}-time" class="serif hook-time">{time}</div>
        <div class="hook-need">{need}</div>
      </div>'''


def chip(p, a, b):
    return f'''
      <div id="{p}-chip" class="abs chip mono"><span class="chip-dot"></span><span class="chip-win"><span id="{p}-chip-a">{a}</span><span id="{p}-chip-b">{b}</span></span></div>'''


def bubbles(p):
    msgs = [('me', '¿Alguien tiene la Serie 7 resuelta?'), ('', 'creo que estaba en un drive viejo'),
            ('', 'a mí me la pasaron por mail'), ('', '¿de qué año era?'), ('', 'preguntá en el grupo de 4º')]
    inner = ''.join(f'<div id="{p}-bb{i}" class="bubble {c}">{t}</div>' for i, (c, t) in enumerate(msgs))
    return f'<div id="{p}-bubbles" class="abs bubbles">{inner}</div>'


def bubbles_js(p, t0):
    times = [0.45, 0.95, 1.35, 1.7, 2.05]
    return ''.join(f"\n  popIn('#{p}-bb{i}', {t0 + t:.2f});" for i, t in enumerate(times))


TOKENS = [('Cursadas req. <b>6, 7, 8, 9, 13</b>', 70, 1010, -4), ('Aprobadas req. <b>1, 3, 4</b>', 330, 1100, 3),
          ('<b>11, 12, 13</b>', 120, 1205, 6), ('Aprobadas req. <b>3, 4, 6</b>', 400, 1290, -5),
          ('<b>9, 12, 13</b>', 690, 1010, -8), ('Cursadas req. <b>16, 17, 21</b>', 110, 1390, 2),
          ('<b>4, 6</b>', 820, 1195, 10), ('<b>25, 29</b>', 740, 1470, -3)]


def tangle(p):
    return ''.join(f'<div id="{p}-tok{i}" class="abs tok mono" style="left:{x}px;top:{y}px">{t}</div>'
                   for i, (t, x, y, r) in enumerate(TOKENS))


def tangle_js(p, t0):
    out = ''
    for i, (t, x, y, r) in enumerate(TOKENS):
        out += f"\n  tl.fromTo('#{p}-tok{i}', {{ opacity: 0, scale: 0.6, rotation: {r * 3} }}, {{ opacity: 1, scale: 1, rotation: {r}, duration: 0.3, ease: 'back.out(1.6)' }}, {t0 + i * 0.13:.2f});"
    return out


def tangle_out_js(p, t):
    return ''.join(f"\n  tl.to('#{p}-tok{i}', {{ x: {-1200 if i % 2 else 1200}, opacity: 0, filter: 'blur(12px)', duration: 0.34, ease: 'power3.in' }}, {t + i * 0.015:.3f});"
                   for i in range(len(TOKENS)))


def drive_panel(pid, crumb, title, rows, extra_cls=''):
    """rows: list of (row_id, kind, name). kind in folder|pdf"""
    r = ''
    for rid, kind, name in rows:
        ic = FOLDER_SVG if kind == 'folder' else pdf_icon()
        r += f'<div id="{rid}" class="drv-row"><div id="{rid}-hl" class="hl"></div><div class="ic">{ic}</div><span>{name}</span><div id="{rid}-tap" class="tap" style="left:60%;top:50%"></div></div>'
    return f'''
      <div id="{pid}" class="abs drive {extra_cls}">
        <div class="drv-search">{SEARCH_SVG}<span>Buscar en Drive</span></div>
        <div class="drv-crumb">{crumb}</div>
        <div class="drv-title">{title}</div>
        <div class="drv-head">Nombre</div>
        {r}
      </div>'''


IRQ = 'Ingeniería de las Reacciones Químicas'


def drive_l1(p):
    return drive_panel(f'{p}-drv1', 'Compartidos conmigo › AChETIQ', IRQ,
                       [(f'{p}-r-prac', 'folder', '03. Práctica'), (f'{p}-r-pres', 'folder', '05. Presentaciones')])


def drive_l2(p):
    return drive_panel(f'{p}-drv2', f'… › {IRQ}', '03. Práctica',
                       [(f'{p}-r-guias', 'folder', 'Guías de Estudio'),
                        (f'{p}-r-s07', 'pdf', '2024 - GS - Resolución Serie 07.pdf'),
                        (f'{p}-r-smr', 'pdf', '2024 - SMR - Resolución Series.pdf')])


def viewer(p):
    lines = '<div class="ln t"></div>' + ''.join(
        f'<div class="ln" style="width:{w}%"></div>' for w in [100, 94, 98, 72, 0, 100, 88, 96, 60, 0, 100, 91, 97, 83, 100, 55])
    return f'''
      <div id="{p}-view" class="abs viewer">
        <div class="viewer-bar">{pdf_icon()}<span>2024 - GS - Resolución Serie 07.pdf</span></div>
        <div class="viewer-page">{lines.replace('width:0%', 'width:0%;background:transparent')}</div>
      </div>'''


def claim(p, text, sub=''):
    s = f'<div id="{p}-claimsub" class="abs claim-sub">{sub}</div>' if sub else ''
    return f'''
      <div id="{p}-flood" class="abs flood"></div>
      <div id="{p}-claim" class="abs claim serif">{text}</div>{s}'''


def endcard(p):
    return f'''
      <div id="{p}-end" class="abs endcard">
        <img class="end-logo" src="assets/img/achetiq-logo.svg" alt="">
        <div class="serif end-name">AChETIQ</div>
        <div class="end-url mono">achetiq.github.io</div>
        <div class="end-sticker">zona del sticker de enlace</div>
      </div>'''


def claim_end_js(p, t, with_end=True, with_sub=False, hide=''):
    js = f'''
  tl.fromTo('#{p}-flood', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, ease: 'power2.inOut' }}, {t:.2f});'''
    if hide:
        js += f"\n  tl.set('{hide}', {{ opacity: 0 }}, {t + 0.32:.2f});"
    js += f'''
  blurIn('#{p}-claim', {t + 0.2:.2f}, 0.26);'''
    if with_sub:
        js += f"\n  blurIn('#{p}-claimsub', {t + 0.55:.2f}, 0.22);"
    if with_end:
        js += f'''
  blurOut('#{p}-claim', {t + 2.3:.2f});'''
        if with_sub:
            js += f"\n  blurOut('#{p}-claimsub', {t + 2.3:.2f});"
        js += f'''
  tl.fromTo('#{p}-end', {{ opacity: 0, y: 30 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }}, {t + 2.5:.2f});'''
    return js


def apuntes_page(p):
    pills = f'<div id="{p}-pill-all" class="pill on">Todos</div>' + ''.join(
        (f'<div id="{p}-pill-{i}" class="pill">{i}º año' + (f'<div id="{p}-tap-pill" class="tap" style="left:50%;top:50%"></div>' if i == 4 else '') + '</div>') for i in range(1, 6))
    return f'''
      <div id="{p}-page" class="abs page">
        <div class="crumbs">Inicio › Recursos académicos › Apuntes</div>
        <div class="serif page-h1">Apuntes Académicos</div>
        <div class="pills">{pills}</div>
      </div>'''


def card(cid, img, year, name):
    return f'''
      <div id="{cid}" class="abs card">
        <div class="card-cover"><img src="assets/img/{img}.webp" alt=""></div>
        <div class="card-body">
          <div class="card-year">{year}</div>
          <div class="card-name">{name}</div>
          <div class="card-cta">Acceder al repositorio <span id="{cid}-arrow">→</span></div>
          <div id="{cid}-tap" class="tap" style="left:62%;top:40%"></div>
        </div>
      </div>'''


GRID = ['introduccion-a-la-ingenieria-quimica', 'quimica', 'analisis-matematico-i', 'fisica-i',
        'quimica-inorganica', 'quimica-organica', 'fisicoquimica', 'ingenieria-de-las-reacciones-quimicas',
        'fenomenos-de-transporte', 'operaciones-unitarias-i', 'operaciones-unitarias-ii',
        'tecnologia-de-la-energia-termica', 'control-automatico-de-procesos',
        'calidad-y-control-estadistico-de-procesos', 'organizacion-industrial',
        'diseno-simulacion-optimizacion-y-seguridad-de-procesos']
GRID_NAMES = {'introduccion-a-la-ingenieria-quimica': 'Introducción a la Ingeniería Química', 'quimica': 'Química',
              'analisis-matematico-i': 'Análisis Matemático I', 'fisica-i': 'Física I',
              'quimica-inorganica': 'Química Inorgánica', 'quimica-organica': 'Química Orgánica',
              'fisicoquimica': 'Fisicoquímica', 'ingenieria-de-las-reacciones-quimicas': IRQ,
              'fenomenos-de-transporte': 'Fenómenos de Transporte', 'operaciones-unitarias-i': 'Operaciones Unitarias I',
              'operaciones-unitarias-ii': 'Operaciones Unitarias II',
              'tecnologia-de-la-energia-termica': 'Tecnología de la Energía Térmica',
              'control-automatico-de-procesos': 'Control Automático de Procesos',
              'calidad-y-control-estadistico-de-procesos': 'Calidad y Control Estadístico',
              'organizacion-industrial': 'Organización Industrial',
              'diseno-simulacion-optimizacion-y-seguridad-de-procesos': 'Diseño, Simulación y Seguridad'}
# geometría de la grilla: celda 456×256 + nombre 12+76, gap 28 → paso 372
G_ROW = 372
IRQ_IDX = GRID.index('ingenieria-de-las-reacciones-quimicas')  # 7 → fila 3, col 1
IRQ_CX = 72 + 456 + 24 + 228
IRQ_CY = 300 + (IRQ_IDX // 2) * G_ROW + 128
CAM_Y_END = 960 - IRQ_CY


def grid(p):
    cells = ''
    for i, g in enumerate(GRID):
        tapdiv = f'<div id="{p}-gtap" class="tap" style="left:50%;top:128px"></div>' if g == GRID[IRQ_IDX] else ''
        cells += f'<div class="gcell"><div class="gimg"><img src="assets/img/{g}.webp" alt=""></div><div class="gname">{GRID_NAMES[g]}</div>{tapdiv}</div>'
    return f'<div id="{p}-cam" class="abs cam"><div class="grid2">{cells}</div></div>'


def seg_tool(p):
    a, f, t = NIVEL_COL['I']
    a2, f2, t2 = NIVEL_COL['II']

    dd = ''.join(f'<div id="{p}-dd{i}">{o}' + (f'<div id="{p}-tap-dd" class="tap" style="left:40%;top:50%"></div>' if i == 3 else '') + '</div>' for i, o in enumerate(['No Cursada', 'Cursando', 'Regular', 'Aprobada']))

    def selrow(n, name, rid, extra='', z=''):
        return f'''<div id="{rid}" class="trow" style="{z}"><div id="{rid}-tint" class="tint"></div><div class="n">{n}</div><div class="nm">{name}</div>
          <div id="{rid}-sel" class="sel"><div class="sel-win"><span id="{rid}-s0">No Cursada</span><span id="{rid}-s1" style="opacity:0;color:#165E2E;font-weight:500">Aprobada ✓</span></div><span>▾</span>{extra}
          </div></div>'''

    def badgerow(n, name, rid):
        return f'''<div id="{rid}" class="trow"><div class="n">{n}</div><div class="nm">{name}</div>
          <div class="bwrap"><div id="{rid}-no" class="badge b-no">✕ No disponible</div><div id="{rid}-si" class="badge b-si">✓ Disponible</div></div></div>'''

    return f'''
      <div id="{p}-tool" class="abs tool">
        <div class="serif tool-h1">Seguimiento de Carrera</div>
        <div class="kpis">
          <div class="kpi"><div class="kpi-l">AVANCE</div><div class="serif kpi-v"><span id="{p}-av">0,0</span> %</div><div class="kpi-h">sobre 41 obligatorias</div></div>
          <div class="kpi"><div class="kpi-l">APROBADAS</div><div id="{p}-ap" class="serif kpi-v">0</div><div class="kpi-h">obligatorias + electivas</div></div>
        </div>
        <div class="tbl">
          <div class="lvl" style="border-top:5px solid {a};background:{f};color:{t};border-radius:18px 18px 0 0">Nivel I</div>
          {selrow(4, 'Análisis Matemático I', p + '-r4')}
          {selrow(5, 'Física I', p + '-r5')}
          {selrow(6, 'Química', p + '-r6', f'<div id="{p}-tap-sel" class="tap" style="left:40%;top:50%"></div><div id="{p}-dd" class="dd" data-layout-allow-overlap data-layout-allow-occlusion>{dd}</div>', 'z-index:5')}
          <div class="lvl" style="border-top:5px solid {a2};background:{f2};color:{t2}">Nivel II</div>
          {badgerow(11, 'Química Inorgánica', p + '-r11')}
          {badgerow(14, 'Química Orgánica', p + '-r14')}
        </div>
      </div>
      <div id="{p}-note" class="abs note">Ejemplo: Nivel I completo · valores calculados con la lógica real</div>'''


def seg_strip(p):
    """Tabla completa en tira vertical + tiempos de cruce para la cámara."""
    html = ''
    y = 0
    rows_meta = []  # (rid, y_center, kind)
    for niv, nums in NIVEL_ORDER.items():
        a, f, t = NIVEL_COL[niv]
        html += f'<div class="lvl" style="height:64px;border-top:5px solid {a};background:{f};color:{t}">Nivel {niv}</div>'
        y += 64
        for n in nums:
            rid = f'{p}-s{n}'
            name = MAT[n]['nombre']
            if niv in ('I', 'II'):
                st = f'<span id="{rid}-a" class="st-gray">No Cursada</span><span id="{rid}-b" class="b-ok" style="opacity:0">✓ Aprobada</span>'
                kind = 'aprob'
            elif n in DISP_I_II:
                st = f'<span id="{rid}-a" class="b-no">✕ No disponible</span><span id="{rid}-b" class="b-ok" style="opacity:0">✓ Disponible</span>'
                kind = 'disp'
            else:
                st = f'<span id="{rid}-a" class="b-no">✕ No disponible</span>'
                kind = 'no'
            html += f'<div id="{rid}" class="srow"><div class="n">{n}</div><div class="nm">{name}</div><div class="st">{st}</div></div>'
            rows_meta.append((rid, y + 42, kind, n))
            y += 84
    return f'<div id="{p}-strip" class="strip">{html}</div>', y, rows_meta


def seg_travel(p, dy=0):
    strip, h, meta = seg_strip(p)
    html = f'''
      <div id="{p}-kband" class="abs kband" data-layout-allow-occlusion style="top:{262 + dy}px">
        <div class="kband-row">
          <div><div class="kpi-l">AVANCE</div><div class="serif kpi-v"><span id="{p}-av">0,0</span> %</div></div>
          <div style="text-align:right"><div class="kpi-l">APROBADAS</div><div id="{p}-ap" class="serif kpi-v">0</div></div>
        </div>
        <div class="bar"><div id="{p}-fill" class="bar-fill"></div></div>
      </div>
      <div id="{p}-win" class="abs win" style="top:{540 + dy}px;height:{1040 - dy}px">{strip}</div>
      <div id="{p}-pop" class="abs pop" data-layout-allow-occlusion data-layout-allow-overlap><b>39 · Proyecto Final</b><br><span style="color:#9B171F">✕ No disponible</span> · faltan {PF_FALTAN} materias<br><span class="mono" style="font-size:26px;color:#5B5F69">regulares: 25, 26, 27, 29, 30, 32 · aprobadas: 16, 20, 21, 24, 28</span></div>'''
    return html, h, meta


def seg_travel_js(p, t0, D, dy=0):
    strip, h, meta = seg_strip(p)
    travel = h - (1040 - dy)
    read = 520  # línea de lectura dentro de la ventana
    v = travel / D
    js = f'''
  tl.fromTo('#{p}-kband', {{ opacity: 0, y: -30 }}, {{ opacity: 1, y: 0, duration: 0.35, ease: 'expo.out' }}, {t0 - 0.3:.2f});
  tl.fromTo('#{p}-win', {{ opacity: 0, y: 60 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }}, {t0 - 0.2:.2f});
  tl.fromTo('#{p}-fill', {{ scaleX: 0, transformOrigin: '0% 50%' }}, {{ scaleX: 0, duration: 0.01 }}, 0);
  tl.fromTo('#{p}-strip', {{ y: 0 }}, {{ y: {-travel}, duration: {D}, ease: 'none' }}, {t0 + 0.3:.2f});'''
    aprob = 0
    flips = []
    prev = t0 + 0.2
    for rid, yc, kind, n in meta:
        cross = t0 + 0.3 + max(0, (yc - read)) / v
        if yc < read:
            cross = t0 + 0.35 + (yc / read) * 0.5
        cross = max(cross, prev + 0.06)
        prev = cross
        if kind in ('aprob', 'disp'):
            flips.append((cross, rid, kind))
    for cross, rid, kind in flips:
        js += f'''
  tl.to('#{rid}-a', {{ opacity: 0, scale: 0.8, duration: 0.14, ease: 'power2.in' }}, {cross:.2f});
  tl.fromTo('#{rid}-b', {{ opacity: 0, scale: 1.25 }}, {{ opacity: 1, scale: 1, duration: 0.28, ease: 'back.out(2)' }}, {cross + 0.08:.2f});'''
        if kind == 'aprob':
            aprob += 1
            js += f"\n  tl.set('#{p}-av', {{ innerHTML: '{pct(aprob)}' }}, {cross + 0.08:.2f}); tl.set('#{p}-ap', {{ innerHTML: '{aprob}' }}, {cross + 0.08:.2f});"
            js += f"\n  tl.to('#{p}-fill', {{ scaleX: {aprob / 41:.4f}, duration: 0.2, ease: 'power2.out', overwrite: 'auto' }}, {cross + 0.08:.2f});"
    t_end = t0 + 0.3 + D
    js += f'''
  tl.fromTo('#{p}-pop', {{ opacity: 0, y: 24 }}, {{ opacity: 1, y: 0, duration: 0.35, ease: 'expo.out' }}, {t_end + 0.1:.2f});'''
    return js, t_end


# ───────────────────────────── celdas tabla periódica ─────────────────────────────
CELL_W, CELL_H, GAP_X, GAP_Y = 90, 104, 6, 34
P_TOP = 560


def cell_pos(n):
    for r, (niv, nums) in enumerate(NIVEL_ORDER.items()):
        if n in nums:
            c = nums.index(n)
            w = len(nums) * CELL_W + (len(nums) - 1) * GAP_X
            left = (1080 - w) // 2 + c * (CELL_W + GAP_X)
            return left, P_TOP + r * (CELL_H + GAP_Y), niv
    raise KeyError(n)


FOLDER_MINI = '<svg viewBox="0 0 20 16"><path d="M1 3a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1z" fill="#1344A5"/></svg>'


def ptable(p, neutral=False):
    html = ''
    for niv, nums in NIVEL_ORDER.items():
        a, f, t = NIVEL_COL[niv]
        for n in nums:
            x, y, _ = cell_pos(n)
            if neutral:
                st = f'left:{x}px;top:{y}px;background:#EAEDF2;border:2px solid #CED2D9;color:#5B5F69'
            else:
                st = f'left:{x}px;top:{y}px;background:{f};border-top:5px solid {a};color:{t}'
            html += f'<div id="{p}-c{n}" class="cell" style="{st}"><div class="cn">{n}</div><div class="ca">{ABBR[n]}</div><div id="{p}-c{n}-f" class="cf">{FOLDER_MINI}</div></div>'
    return f'<div id="{p}-ptab" class="abs" style="left:0;top:0;width:1080px;height:1920px">{html}</div>'


# ───────────────────────────── escenas ─────────────────────────────
def scene(cid, body, js):
    return f'''<template>
  <style>{CSS}</style>
  <div id="root" data-composition-id="{cid}" data-width="1080" data-height="1920">{body}
  </div>
  <script>{JS_HELPERS}{js}
  window.__timelines["{cid}"] = tl;
  </script>
</template>
'''


def label(p, text):
    return f'<div class="blabel">{text}</div>'


# ---------- INTRO ----------
def build_intro():
    body = '''
    <div id="in-all" class="clip part" data-start="0" data-duration="3.2" data-track-index="1">
      <div class="tc">
        <div id="in-k" class="mono tc-label" style="margin:0">AChETIQ · HISTORIAS DE INSTAGRAM</div>
        <div id="in-t" class="serif" style="font-size:150px;line-height:1">Bocetos</div>
        <div id="in-d" class="tc-desc">Cuatro propuestas para los videos de Apuntes Académicos y de Seguimiento de Carrera.</div>
        <div id="in-l" class="tc-desc" style="color:#131720">A · B · C · A+B</div>
        <div id="in-n" class="mono tc-label">Bocetos de idea, no versiones finales</div>
      </div>
    </div>'''
    js = '''
  blurIn('#in-k', 0.1); blurIn('#in-d', 0.35); blurIn('#in-l', 0.55); blurIn('#in-n', 0.7);
  blurOut('#in-all .tc', 2.95, 0.2);'''
    return scene('intro', body, js), 3.2


# ---------- A ----------
def build_a():
    p = 'a'
    T = 2.8
    AP = 13.0
    SG = 11.0
    body = title_card(p, 'A', 'Domingo, 23:47',
                      'Un estudiante resuelve un problema real en un minuto.',
                      'PROPUESTA 1 DE 4', T)
    # Apuntes
    body += f'''
    <div id="{p}-ap" class="clip part" data-start="{T}" data-duration="{AP}" data-track-index="1">
      {hook(p, 'Domingo', '23:47', 'Parcial de Reacciones mañana')}
      {bubbles(p)}
      {chip(p, '23:47', '23:48')}
      {apuntes_page(p)}
      {card(p + '-cardA', 'introduccion-a-la-ingenieria-quimica', '1º AÑO', 'Introducción a la Ingeniería Química')}
      {card(p + '-cardB', 'ingenieria-de-las-reacciones-quimicas', '4º AÑO', IRQ)}
      <div id="{p}-zoom" class="abs zoom"><img src="assets/img/ingenieria-de-las-reacciones-quimicas.webp" alt=""></div>
      {drive_l1(p)}
      {drive_l2(p)}
      {claim(p, '38 materias.<br>Una carpeta cada una.')}
      {endcard(p)}
      {label(p, 'BOCETO A · HISTORIA 1: APUNTES')}
    </div>'''
    t = T
    js = title_js(p, T)
    js += f'''
  blurIn('#{p}-hook', {t:.2f}, 0.15);{bubbles_js(p, t)}
  tl.to('#{p}-bubbles', {{ x: -1150, filter: 'blur(12px)', opacity: 0, duration: 0.35, ease: 'power3.in' }}, {t + 2.75:.2f});
  blurOut('#{p}-hook', {t + 2.8:.2f}, 0.22);
  tl.fromTo('#{p}-chip', {{ opacity: 0, x: -20 }}, {{ opacity: 1, x: 0, duration: 0.3, ease: 'expo.out' }}, {t + 3.0:.2f});
  tl.fromTo('#{p}-page', {{ opacity: 0, y: 50 }}, {{ opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' }}, {t + 3.1:.2f});
  tl.fromTo('#{p}-cardA', {{ opacity: 0, y: 80 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }}, {t + 3.25:.2f});
  tl.set('#{p}-cardB', {{ opacity: 0 }}, 0);
'''
    # tap on "4º año" pill: posicion medida en el snapshot (ver ajuste más abajo)
    js += f'''
  tap('#{p}-tap-pill', {t + 4.05:.2f});
  tl.to('#{p}-pill-all', {{ backgroundColor: '#F9FAFC', color: '#131720', borderColor: '#CED2D9', duration: 0.18 }}, {t + 4.2:.2f});
  tl.to('#{p}-pill-4', {{ backgroundColor: '#1344A5', color: '#FFFFFF', borderColor: '#1344A5', duration: 0.18 }}, {t + 4.2:.2f});
  tl.to('#{p}-cardA', {{ x: -260, opacity: 0, filter: 'blur(8px)', duration: 0.26, ease: 'power3.in' }}, {t + 4.3:.2f});
  tl.fromTo('#{p}-cardB', {{ x: 260, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }}, {t + 4.45:.2f});
  tap('#{p}-cardB-tap', {t + 5.3:.2f});
  press('#{p}-cardB', {t + 5.3:.2f});
  tl.to('#{p}-cardB-arrow', {{ x: 16, duration: 0.2, ease: 'power3.out' }}, {t + 5.42:.2f});
  tl.set('#{p}-zoom', {{ opacity: 1 }}, {t + 5.7:.2f});
  tl.fromTo('#{p}-zoom', {{ scale: 1, y: 0 }}, {{ scale: 5.2, y: -132, duration: 0.55, ease: 'power3.in' }}, {t + 5.7:.2f});
  tl.fromTo('#{p}-drv1', {{ opacity: 0, filter: 'blur(14px)', scale: 1.06 }}, {{ opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.35, ease: 'expo.out' }}, {t + 6.15:.2f});
  tl.fromTo('#{p}-r-prac, #{p}-r-pres', {{ opacity: 0, x: 40 }}, {{ opacity: 1, x: 0, duration: 0.35, ease: 'expo.out', stagger: 0.07 }}, {t + 6.3:.2f});
  tl.set('#{p}-page, #{p}-cardB, #{p}-zoom', {{ opacity: 0 }}, {t + 6.55:.2f});
  tap('#{p}-r-prac-tap', {t + 6.95:.2f});
  tl.to('#{p}-r-prac-hl', {{ opacity: 1, duration: 0.12 }}, {t + 7.05:.2f});
  tl.fromTo('#{p}-drv2', {{ opacity: 1, x: 1080 }}, {{ x: 0, duration: 0.45, ease: 'expo.out' }}, {t + 7.25:.2f});
  tl.set('#{p}-drv1', {{ opacity: 0 }}, {t + 7.75:.2f});
  tl.fromTo('#{p}-r-guias, #{p}-r-s07, #{p}-r-smr', {{ opacity: 0, x: 40 }}, {{ opacity: 1, x: 0, duration: 0.35, ease: 'expo.out', stagger: 0.07 }}, {t + 7.4:.2f});
  tap('#{p}-r-s07-tap', {t + 8.0:.2f});
  tl.to('#{p}-r-s07-hl', {{ opacity: 1, duration: 0.14 }}, {t + 8.1:.2f});
  roll('#{p}-chip-a', '#{p}-chip-b', {t + 8.25:.2f}, 42);
  tl.set('#{p}-chip-b', {{ y: 42, opacity: 0 }}, 0);
{claim_end_js(p, t + 8.8, hide='#' + p + '-drv2, #' + p + '-chip')}'''
    # Seguimiento
    s = T + AP
    body += f'''
    <div id="{p}-sg" class="clip part" data-start="{s}" data-duration="{SG}" data-track-index="1">
      {hook(p + 'g', 'Lunes', '08:10', 'Inscripción a cursado')}
      <div id="{p}g-q" class="abs q serif">¿Qué puedo cursar?</div>
      {tangle(p + 'g')}
      {chip(p + 'g', '08:10', '08:11')}
      {seg_tool(p + 'g')}
      {claim(p + 'g', 'Marcá tus materias.<br>La planilla calcula el resto.', 'Tus datos quedan en tu dispositivo.')}
      {endcard(p + 'g')}
      {label(p, 'BOCETO A · HISTORIA 2: SEGUIMIENTO')}
    </div>'''
    g = p + 'g'
    js += f'''
  blurIn('#{g}-hook', {s:.2f}, 0.15);
  blurIn('#{g}-q', {s + 0.5:.2f}, 0.24);{tangle_js(g, s + 1.0)}{tangle_out_js(g, s + 2.45)}
  blurOut('#{g}-hook', {s + 2.45:.2f}, 0.2); blurOut('#{g}-q', {s + 2.45:.2f}, 0.2);
  tl.set('#{g}-chip-b', {{ y: 42, opacity: 0 }}, 0);
  tl.fromTo('#{g}-chip', {{ opacity: 0, x: -20 }}, {{ opacity: 1, x: 0, duration: 0.3, ease: 'expo.out' }}, {s + 2.7:.2f});
  tl.fromTo('#{g}-tool', {{ opacity: 0, y: 50 }}, {{ opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' }}, {s + 2.75:.2f});
  tap('#{g}-tap-sel', {s + 3.6:.2f});
  tl.fromTo('#{g}-dd', {{ opacity: 0, y: -12 }}, {{ opacity: 1, y: 0, duration: 0.22, ease: 'expo.out' }}, {s + 3.78:.2f});
  tap('#{g}-tap-dd', {s + 4.25:.2f});
  tl.to('#{g}-dd3', {{ backgroundColor: '#E3ECFB', duration: 0.1 }}, {s + 4.35:.2f});
  tl.to('#{g}-dd', {{ opacity: 0, duration: 0.15 }}, {s + 4.55:.2f});
  roll('#{g}-r6-s0', '#{g}-r6-s1', {s + 4.6:.2f}, 40);
  tl.to('#{g}-r6-tint', {{ opacity: 1, duration: 0.25 }}, {s + 4.65:.2f});
  steps('#{g}-av', {s + 4.7:.2f}, ['0,8', '1,6', '2,4'], 0.05); tl.set('#{g}-ap', {{ innerHTML: '1' }}, {s + 4.7:.2f});
  tl.to('#{g}-r11-no, #{g}-r14-no', {{ opacity: 0, scale: 0.8, duration: 0.14, stagger: 0.12 }}, {s + 5.0:.2f});
  tl.fromTo('#{g}-r11-si, #{g}-r14-si', {{ opacity: 0, scale: 1.3 }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)', stagger: 0.12 }}, {s + 5.08:.2f});
  roll('#{g}-r4-s0', '#{g}-r4-s1', {s + 5.7:.2f}, 40); tl.to('#{g}-r4-tint', {{ opacity: 1, duration: 0.2 }}, {s + 5.75:.2f});
  roll('#{g}-r5-s0', '#{g}-r5-s1', {s + 5.85:.2f}, 40); tl.to('#{g}-r5-tint', {{ opacity: 1, duration: 0.2 }}, {s + 5.9:.2f});
  steps('#{g}-av', {s + 5.8:.2f}, ['4,9', '7,3', '9,8', '12,2', '14,6', '17,1', '19,5'], 0.06);
  steps('#{g}-ap', {s + 5.8:.2f}, ['2', '3', '4', '5', '6', '7', '8'], 0.06);
  blurIn('#{g}-note', {s + 6.0:.2f});
  roll('#{g}-chip-a', '#{g}-chip-b', {s + 6.3:.2f}, 42);
{claim_end_js(g, s + 6.9, True, True, hide='#' + g + '-tool, #' + g + '-chip, #' + g + '-note')}'''
    return scene('prop-a', body, js), T + AP + SG


# ---------- B ----------
def build_b():
    p = 'b'
    T = 2.8
    AP = 9.4
    SG = 9.2
    body = title_card(p, 'B', 'Un toque abre la materia',
                      'Sin introducción: la cámara entra en la materia sin cortes.',
                      'PROPUESTA 2 DE 4', T)
    body += f'''
    <div id="{p}-ap" class="clip part" data-start="{T}" data-duration="{AP}" data-track-index="1">
      {grid(p)}
      {drive_l1(p)}
      {drive_l2(p)}
      {viewer(p)}
      {claim(p, '38 materias.<br>Una carpeta cada una.')}
      {label(p, 'BOCETO B · HISTORIA 1: APUNTES')}
    </div>'''
    t = T
    js = title_js(p, T)
    # inmersiones: grilla → Drive L1 → L2 → visor
    js += f'''
  tl.set('#{p}-cam', {{ transformOrigin: '{IRQ_CX}px {IRQ_CY}px' }}, 0);
  tl.fromTo('#{p}-cam', {{ y: 260 }}, {{ y: {CAM_Y_END}, duration: 1.0, ease: 'power2.out' }}, {t:.2f});
  tap('#{p}-gtap', {t + 1.05:.2f});
  tl.to('#{p}-cam', {{ scale: 8, x: {540 - IRQ_CX}, duration: 0.7, ease: 'power3.in' }}, {t + 1.3:.2f});
  tl.fromTo('#{p}-drv1', {{ opacity: 0, scale: 0.2 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }}, {t + 1.85:.2f});
  tl.set('#{p}-cam', {{ opacity: 0 }}, {t + 2.3:.2f});
  tap('#{p}-r-prac-tap', {t + 2.75:.2f});
  tl.set('#{p}-drv1', {{ transformOrigin: '116px 852px' }}, {t + 2.9:.2f});
  tl.to('#{p}-drv1', {{ scale: 7, x: 424, y: 108, duration: 0.6, ease: 'power3.in' }}, {t + 2.95:.2f});
  tl.fromTo('#{p}-drv2', {{ opacity: 0, scale: 0.2 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }}, {t + 3.4:.2f});
  tl.set('#{p}-drv1', {{ opacity: 0 }}, {t + 3.8:.2f});
  tap('#{p}-r-s07-tap', {t + 4.25:.2f});
  tl.to('#{p}-r-s07-hl', {{ opacity: 1, duration: 0.12 }}, {t + 4.35:.2f});
  tl.set('#{p}-drv2', {{ transformOrigin: '116px 976px' }}, {t + 4.4:.2f});
  tl.to('#{p}-drv2', {{ scale: 7, x: 424, y: -16, duration: 0.6, ease: 'power3.in' }}, {t + 4.45:.2f});
  tl.fromTo('#{p}-view', {{ opacity: 0, scale: 0.2 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }}, {t + 4.9:.2f});
  tl.set('#{p}-drv2', {{ opacity: 0 }}, {t + 5.3:.2f});
  tl.to('#{p}-view', {{ scale: 0.08, opacity: 0, duration: 0.45, ease: 'power3.in' }}, {t + 6.0:.2f});
  tl.set('#{p}-cam', {{ opacity: 1 }}, {t + 6.2:.2f});
  tl.to('#{p}-cam', {{ scale: 1, x: 0, duration: 0.6, ease: 'power3.out' }}, {t + 6.2:.2f});
  tl.fromTo('#{p}-flood', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, ease: 'power2.inOut' }}, {t + 6.8:.2f});
  tl.set('#{p}-cam', {{ opacity: 0 }}, {t + 7.12:.2f});
  blurIn('#{p}-claim', {t + 6.95:.2f}, 0.26);'''
    s = T + AP
    trav_html, h, meta = seg_travel(p + 'g')
    body += f'''
    <div id="{p}-sg" class="clip part" data-start="{s}" data-duration="{SG}" data-track-index="1">
      {trav_html}
      {claim(p + 'g', 'Marcá tus materias.<br>La planilla calcula el resto.', 'Tus datos quedan en tu dispositivo.')}
      {label(p, 'BOCETO B · HISTORIA 2: SEGUIMIENTO')}
    </div>'''
    tjs, t_end = seg_travel_js(p + 'g', s + 0.3, 4.4)
    js += tjs
    js += claim_end_js(p + 'g', t_end + 1.4, False, True, hide=f'#{p}g-kband, #{p}g-win, #{p}g-pop')
    return scene('prop-b', body, js), T + AP + SG


# ---------- C ----------
def build_c():
    p = 'c'
    T = 2.8
    AP = 8.8
    SG = 8.2
    body = title_card(p, 'C', 'La tabla periódica de la carrera',
                      'El plan como tabla periódica: cada materia, un elemento.',
                      'PROPUESTA 3 DE 4', T)
    hx, hy, _ = cell_pos(30)
    body += f'''
    <div id="{p}-ap" class="clip part" data-start="{T}" data-duration="{AP}" data-track-index="1">
      <div id="{p}-head"><div class="abs ptitle serif">La tabla de la carrera</div><div class="abs psub mono">PLAN 2023 · 41 OBLIGATORIAS · PERÍODO = NIVEL</div></div>
      {ptable(p)}
      <div id="{p}-hero" class="abs hero" data-layout-allow-overlap style="left:{hx}px;top:{hy}px"><div class="cn">30</div><div class="ca">IRQ</div></div>
      <div id="{p}-folder" class="abs bigfolder"><svg viewBox="0 0 64 52" width="360" height="292"><path d="M4 8a4 4 0 0 1 4-4h16l6 6h26a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#922FA1"/></svg></div>
      {drive_l1(p)}
      {drive_l2(p)}
      <div id="{p}-claim" class="abs serif" style="left:72px;top:1260px;width:936px;font-size:76px;line-height:1.08;opacity:0">38 materias.<br>Una carpeta cada una.</div>
      {label(p, 'BOCETO C · HISTORIA 1: APUNTES')}
    </div>'''
    t = T
    js = title_js(p, T)
    order = [n for nums in NIVEL_ORDER.values() for n in nums]
    js += f'''
  blurIn('#{p}-head', {t:.2f});
  tl.fromTo('#{p}-ptab .cell', {{ opacity: 0, scale: 0.6 }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.6)', stagger: 0.012 }}, {t + 0.05:.2f});
  tl.fromTo('#{p}-hero', {{ opacity: 0, scale: 1 }}, {{ opacity: 1, scale: 1.18, duration: 0.25, ease: 'back.out(2)' }}, {t + 0.85:.2f});
  tl.to('#{p}-ptab, #{p}-head', {{ opacity: 0.18, filter: 'blur(6px)', duration: 0.4, ease: 'power2.inOut' }}, {t + 1.25:.2f});
  tl.to('#{p}-hero', {{ x: {540 - 45 - hx}, y: {950 - 52 - hy}, scale: 3.4, duration: 0.6, ease: 'power3.inOut' }}, {t + 1.25:.2f});
  tl.to('#{p}-hero', {{ opacity: 0, duration: 0.2 }}, {t + 1.9:.2f});
  tl.fromTo('#{p}-folder', {{ opacity: 0, scale: 0.85 }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: 'expo.out' }}, {t + 1.85:.2f});
  tl.to('#{p}-folder', {{ scale: 3, opacity: 0, duration: 0.45, ease: 'power3.in' }}, {t + 2.35:.2f});
  tl.fromTo('#{p}-drv1', {{ opacity: 0, scale: 0.3 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }}, {t + 2.55:.2f});
  tl.set('#{p}-ptab, #{p}-head', {{ opacity: 0 }}, {t + 3.05:.2f});
  tap('#{p}-r-prac-tap', {t + 3.35:.2f});
  tl.to('#{p}-r-prac-hl', {{ opacity: 1, duration: 0.12 }}, {t + 3.45:.2f});
  tl.fromTo('#{p}-drv2', {{ opacity: 1, x: 1080 }}, {{ x: 0, duration: 0.45, ease: 'expo.out' }}, {t + 3.6:.2f});
  tl.set('#{p}-drv1', {{ opacity: 0 }}, {t + 4.1:.2f});
  tl.set('#{p}-drv2', {{ transformOrigin: '{hx + 45}px {hy + 52}px' }}, {t + 4.6:.2f});
  tl.to('#{p}-drv2', {{ scale: 0.06, opacity: 0, duration: 0.5, ease: 'power3.in' }}, {t + 4.7:.2f});
  tl.to('#{p}-ptab, #{p}-head', {{ opacity: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' }}, {t + 4.9:.2f});'''
    with_f = [n for n in order if n not in SIN_CARPETA]
    sel = ', '.join(f'#{p}-c{n}-f' for n in with_f)
    js += f'''
  tl.fromTo('{sel}', {{ opacity: 0, scale: 0.3 }}, {{ opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)', stagger: 0.022 }}, {t + 5.3:.2f});
  tl.to('{', '.join(f'#{p}-c{n}' for n in SIN_CARPETA)}', {{ opacity: 0.35, duration: 0.3 }}, {t + 5.3:.2f});
  blurIn('#{p}-claim', {t + 6.3:.2f}, 0.26);'''
    # Seguimiento
    s = T + AP
    g = p + 'g'
    # enlaces 6→11 y 6→14
    x6, y6, _ = cell_pos(6)
    bonds = ''
    for tn in (11, 14):
        xt, yt, _ = cell_pos(tn)
        x1, y1 = x6 + 45, y6 + 104
        x2, y2 = xt + 45, yt
        mid = (y1 + y2) / 2
        bonds += f'<path id="{g}-bond{tn}" d="M{x1} {y1} C {x1} {mid}, {x2} {mid}, {x2} {y2}" stroke="#1344A5" stroke-width="5" fill="none" stroke-linecap="butt" pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="1"/>'
    body += f'''
    <div id="{p}-sg" class="clip part" data-start="{s}" data-duration="{SG}" data-track-index="1">
      <div id="{g}-head"><div class="abs ptitle serif">La tabla de la carrera</div><div class="abs psub mono">TOCÁ UNA MATERIA · MIRÁ QUÉ SE HABILITA</div></div>
      {ptable(g, neutral=True)}
      <svg class="abs bonds" viewBox="0 0 1080 1920">{bonds}</svg>
      <div id="{g}-cnt" class="abs cnt"><div class="cnt-l">AVANCE · EJEMPLO</div><div class="serif cnt-v"><span id="{g}-av">0,0</span> %</div></div>
      <div id="{g}-claim" class="abs serif" style="left:72px;top:1300px;width:936px;font-size:76px;line-height:1.08;opacity:0">Marcá tus materias.<br>La planilla calcula el resto.</div>
      {label(p, 'BOCETO C · HISTORIA 2: SEGUIMIENTO')}
    </div>'''
    cob = "{ backgroundColor: '#1344A5', borderColor: '#1344A5', color: '#FFFFFF', duration: 0.22 }"
    disp = "{ boxShadow: '0 0 0 5px #2E8A4E', backgroundColor: '#EAF3ED', color: '#165E2E', duration: 0.22 }"
    cob_st = cob.replace('}', ", stagger: 0.07, boxShadow: '0 0 0 0px #2E8A4E' }")
    lvl1 = ', '.join(f'#{g}-c{n}' for n in NIVEL_ORDER['I'])
    lvl2 = ', '.join(f'#{g}-c{n}' for n in NIVEL_ORDER['II'])
    lvl3 = ', '.join(f'#{g}-c{n}' for n in sorted(DISP_I_II))
    js += f'''
  blurIn('#{g}-head', {s:.2f});
  tl.fromTo('#{g}-ptab .cell', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25, stagger: 0.008 }}, {s:.2f});
  tl.to('#{g}-c6', {cob}, {s + 0.6:.2f});
  tl.fromTo('#{g}-c6', {{ scale: 1 }}, {{ scale: 1.15, duration: 0.15, yoyo: true, repeat: 1 }}, {s + 0.6:.2f});
  tl.to('#{g}-bond11, #{g}-bond14', {{ strokeDashoffset: 0, duration: 0.45, ease: 'power2.inOut', stagger: 0.1 }}, {s + 0.9:.2f});
  tl.to('#{g}-c11, #{g}-c14', {disp.replace('}', ', stagger: 0.1 }')}, {s + 1.3:.2f});
  tl.to('#{g}-bond11, #{g}-bond14', {{ opacity: 0, duration: 0.25 }}, {s + 2.2:.2f});
  tl.to('{lvl1}', {cob_st}, {s + 2.3:.2f});
  blurIn('#{g}-cnt', {s + 2.3:.2f});
  steps('#{g}-av', {s + 2.35:.2f}, ['2,4', '4,9', '7,3', '9,8', '12,2', '14,6', '17,1', '19,5'], 0.07);
  tl.to('{lvl2}', {disp.replace('}', ', stagger: 0.05 }')}, {s + 2.9:.2f});
  tl.to('{lvl2}', {cob_st}, {s + 3.7:.2f});
  steps('#{g}-av', {s + 3.75:.2f}, ['22,0', '24,4', '26,8', '29,3', '31,7', '34,1', '36,6', '39,0'], 0.07);
  tl.to('{lvl3}', {disp.replace('}', ', stagger: 0.035 }')}, {s + 4.35:.2f});
  blurOut('#{g}-cnt', {s + 5.4:.2f});
  blurIn('#{g}-claim', {s + 5.6:.2f}, 0.26);'''
    return scene('prop-c', body, js), T + AP + SG


# ---------- A+B ----------
def build_ab():
    p = 'x'
    T = 2.8
    AP = 12.6
    SG = 11.2
    body = title_card(p, 'A+B', 'El gancho de A, la cámara de B',
                      'La situación de A con la cámara continua de B.',
                      'PROPUESTA 4 DE 4', T)
    body += f'''
    <div id="{p}-ap" class="clip part" data-start="{T}" data-duration="{AP}" data-track-index="1">
      {grid(p)}
      {hook(p, 'Domingo', '23:47', 'Parcial de Reacciones mañana')}
      {bubbles(p)}
      {drive_l1(p)}
      {drive_l2(p)}
      {chip(p, '23:47', '23:48')}
      {claim(p, '38 materias.<br>Una carpeta cada una.')}
      {endcard(p)}
      {label(p, 'BOCETO A+B · HISTORIA 1: APUNTES')}
    </div>'''
    t = T
    js = title_js(p, T)
    js += f'''
  blurIn('#{p}-hook', {t:.2f}, 0.15);{bubbles_js(p, t)}
  tl.set('#{p}-cam', {{ transformOrigin: '{IRQ_CX}px {IRQ_CY}px', y: 1700 }}, 0);
  tl.to('#{p}-bubbles', {{ y: -1400, filter: 'blur(12px)', duration: 0.5, ease: 'power3.in' }}, {t + 2.75:.2f});
  tl.to('#{p}-hook', {{ y: -1400, filter: 'blur(12px)', duration: 0.5, ease: 'power3.in' }}, {t + 2.75:.2f});
  tl.to('#{p}-cam', {{ y: {CAM_Y_END}, duration: 1.1, ease: 'power3.out' }}, {t + 2.95:.2f});
  tl.set('#{p}-hook, #{p}-bubbles', {{ opacity: 0 }}, {t + 3.3:.2f});
  tl.set('#{p}-chip-b', {{ y: 42, opacity: 0 }}, 0);
  tl.fromTo('#{p}-chip', {{ opacity: 0, x: -20 }}, {{ opacity: 1, x: 0, duration: 0.3, ease: 'expo.out' }}, {t + 3.2:.2f});
  tap('#{p}-gtap', {t + 4.15:.2f});
  tl.to('#{p}-cam', {{ scale: 8, x: {540 - IRQ_CX}, duration: 0.7, ease: 'power3.in' }}, {t + 4.4:.2f});
  tl.fromTo('#{p}-drv1', {{ opacity: 0, scale: 0.2 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }}, {t + 4.95:.2f});
  tl.set('#{p}-cam', {{ opacity: 0 }}, {t + 5.4:.2f});
  tap('#{p}-r-prac-tap', {t + 5.85:.2f});
  tl.set('#{p}-drv1', {{ transformOrigin: '116px 852px' }}, {t + 6.0:.2f});
  tl.to('#{p}-drv1', {{ scale: 7, x: 424, y: 108, duration: 0.6, ease: 'power3.in' }}, {t + 6.05:.2f});
  tl.fromTo('#{p}-drv2', {{ opacity: 0, scale: 0.2 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }}, {t + 6.5:.2f});
  tl.set('#{p}-drv1', {{ opacity: 0 }}, {t + 6.9:.2f});
  tap('#{p}-r-s07-tap', {t + 7.35:.2f});
  tl.to('#{p}-r-s07-hl', {{ opacity: 1, duration: 0.12 }}, {t + 7.45:.2f});
  roll('#{p}-chip-a', '#{p}-chip-b', {t + 7.6:.2f}, 42);
{claim_end_js(p, t + 8.3, hide='#' + p + '-drv2, #' + p + '-chip')}'''
    s = T + AP
    g = p + 'g'
    trav_html, h, meta = seg_travel(g, 90)
    body += f'''
    <div id="{p}-sg" class="clip part" data-start="{s}" data-duration="{SG}" data-track-index="1">
      {hook(g, 'Lunes', '08:10', 'Inscripción a cursado')}
      <div id="{g}-q" class="abs q serif">¿Qué puedo cursar?</div>
      {tangle(g)}
      {trav_html}
      {chip(g, '08:10', '08:11')}
      {claim(g, 'Marcá tus materias.<br>La planilla calcula el resto.', 'Tus datos quedan en tu dispositivo.')}
      {label(p, 'BOCETO A+B · HISTORIA 2: SEGUIMIENTO')}
    </div>'''
    js += f'''
  blurIn('#{g}-hook', {s:.2f}, 0.15);
  blurIn('#{g}-q', {s + 0.5:.2f}, 0.24);{tangle_js(g, s + 1.0)}{tangle_out_js(g, s + 2.45)}
  blurOut('#{g}-hook', {s + 2.45:.2f}, 0.2); blurOut('#{g}-q', {s + 2.45:.2f}, 0.2);
  tl.set('#{g}-chip-b', {{ y: 42, opacity: 0 }}, 0);
  tl.fromTo('#{g}-chip', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3 }}, {s + 2.7:.2f});'''
    tjs, t_end = seg_travel_js(g, s + 3.0, 4.0, 90)
    js += tjs
    js += f"\n  roll('#{g}-chip-a', '#{g}-chip-b', {t_end + 0.3:.2f}, 42);"
    js += claim_end_js(g, t_end + 1.3, False, True, hide=f'#{g}-kband, #{g}-win, #{g}-pop, #{g}-chip')
    return scene('prop-ab', body, js), T + AP + SG


def main():
    os.makedirs(os.path.join(OUT, 'compositions'), exist_ok=True)
    scenes = []
    for sid, builder in [('intro', build_intro), ('prop-a', build_a), ('prop-b', build_b),
                         ('prop-c', build_c), ('prop-ab', build_ab)]:
        html, dur = builder()
        open(os.path.join(OUT, 'compositions', sid + '.html'), 'w').write(html)
        scenes.append((sid, round(dur, 2)))
    t = 0
    hosts = ''
    for sid, dur in scenes:
        hosts += f'''
      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{t:.2f}" data-duration="{dur}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>'''
        t += dur
    total = round(t, 2)
    index = f'''<!doctype html>
<html lang="es-AR" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/lib/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #F2F4F8; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="1080" data-height="1920">{hosts}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
'''
    open(os.path.join(OUT, 'index.html'), 'w').write(index)
    print('escenas', scenes, 'total', total)


if __name__ == '__main__':
    main()
