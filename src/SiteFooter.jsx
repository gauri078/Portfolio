import { useState, useEffect, useRef } from "react";
import { FOOTER_IMG } from "./footerImage";

/**
 * SiteFooter, lifted verbatim from Portfolio.jsx so every page ends the same
 * way: the orchid with the WebGL displacement, the paper wash over the top,
 * the social links, the copyright line.
 *
 * Two props:
 *   heading  the title node, so each page supplies its own Typer instance
 *   tint     optional hex. When set, a blend layer recolours the orchid to
 *            that hue for that page only. The main site passes nothing and
 *            keeps the rose.
 */

const PINK = "#C4587E";
const PAPER = "#FCFCFC";
const INK = "#3E2430";
const MUTED = "#8A6F7C";
const BODY = "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif";
const SHELL = { maxWidth: 1080, margin: "0 auto", width: "100%", padding: "0 clamp(24px, 6vw, 72px)", boxSizing: "border-box" };

/* ==================== DISPLACEMENT (hero image) ==================== */

/**
 * A grid-based cursor displacement effect over the hero image.
 *
 * A coarse RG float texture holds a per-cell push vector. Cursor movement injects
 * velocity into nearby cells with an inverse-distance falloff, gated by pointer
 * SPEED (slow drags do nothing), and every cell relaxes back toward zero each
 * frame. The fragment shader reads that field and offsets its sample of the
 * image, sampling R/G/B at slightly different offsets for chromatic aberration
 * and adding film grain only where the push is actually large.
 *
 * The original drives this from html-in-canvas; here the content is a plain
 * image texture, so the effect works everywhere rather than only in browsers
 * with the experimental drawElementImage API. The loop sleeps as soon as the
 * field goes quiet, and pauses entirely offscreen or under reduced motion.
 */

const DISP_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main () {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const DISP_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent;
uniform sampler2D uField;
uniform vec2 uResolution;
uniform vec2 uUvScale;
uniform vec2 uUvOffset;
uniform vec3 uPaper;
uniform float uFeather;
uniform float uShift;
uniform float uAberration;
uniform float uGrain;
uniform float uGrainPx;
uniform float uGrainTick;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

void main () {
  vec2 base = vec2(vUv.x, 1.0 - vUv.y);
  vec2 offset = texture(uField, base).rg;
  vec2 push = offset * 0.02 * uShift;
  vec2 cuv = base * uUvScale + uUvOffset;   // cover mapping, widened by zoom
  vec2 lo = max(uUvOffset, vec2(0.0)) + vec2(0.001);
  vec2 hi = min(uUvOffset + uUvScale, vec2(1.0)) - vec2(0.001);
  float ab = uAberration * 0.08;
  vec2 s0 = cuv - push * (1.0 + ab);
  vec2 s1 = cuv - push;
  vec2 s2 = cuv - push * (1.0 - ab);
  vec3 col = vec3(
    texture(uContent, clamp(s0, lo, hi)).r,
    texture(uContent, clamp(s1, lo, hi)).g,
    texture(uContent, clamp(s2, lo, hi)).b
  );
  // Outside the image the page colour shows through. With uFeather > 0 that
  // boundary is a soft ramp instead of a hard cut, so a zoomed-out image
  // dissolves into the page on every edge rather than ending on a line.
  float f = max(uFeather, 0.0001);
  float inside =
    smoothstep(0.0, f, s1.x) * (1.0 - smoothstep(1.0 - f, 1.0, s1.x)) *
    smoothstep(0.0, f, s1.y) * (1.0 - smoothstep(1.0 - f, 1.0, s1.y));
  col = mix(uPaper, col, inside);
  float pushPx = length(push * uResolution);
  float gate = smoothstep(1.5, 18.0, pushPx);   // grain only where it moved
  vec2 cell = floor(gl_FragCoord.xy / max(uGrainPx, 1.0));
  float gn = hash(cell + vec2(uGrainTick * 0.37, uGrainTick * 0.113));
  col += (gn - 0.5) * 0.3 * uGrain * gate;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function ImageDisplacement({
  src,
  zoom = 1,          // 1 = fill the frame (cover); below 1 pulls back to show more
  anchorX = "center",  // "left" | "center" | "right", where the image sits when zoomed out
  anchorY = "center",  // "top" | "center" | "bottom"
  nudgeX = 0,        // fine offset in frame widths: positive moves the image right
  nudgeY = 0,        // positive moves the image up
  feather = 0,       // softness of the image edges, in image widths (0 = hard cut)
  grid = 50,
  cellAspect = 1,
  radius = 0.12,
  strength = 0.14,
  threshold = 260,
  relaxation = 0.92,
  shift = 1.2,
  aberration = 1.5,
  grain = 0.12,
  grainSize = 1,
  grainSpeed = 1,
  scramble = 1,
  style,
}) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const cfg = { zoom, anchorX, anchorY, nudgeX, nudgeY, feather, grid, cellAspect, radius, strength, threshold, relaxation, shift, aberration, grain, grainSize, grainSpeed, scramble };
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, depth: false, stencil: false, antialias: false });
    if (!gl || gl.isContextLost()) {
      // no WebGL2: fall back to the plain image
      host.style.backgroundImage = `url(${src})`;
      host.style.backgroundSize = "cover";
      host.style.backgroundPosition = "center";
      return;
    }

    const compile = (type, text) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, text);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, DISP_VERT);
    const fs = compile(gl.FRAGMENT_SHADER, DISP_FRAG);
    const program = gl.createProgram();
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);

    const U = {};
    const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(program, i);
      U[info.name] = gl.getUniformLocation(program, info.name);
    }

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const contentTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, contentTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([250, 244, 248, 255]));

    const fieldTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fieldTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionQuery.matches;

    let cols = 0, rows = 0, rowScale = 1, outW = 1, outH = 1, dpr = 1;
    let field = new Float32Array(0), fieldDirty = false, scrambled = false;
    let imgW = 1, imgH = 1, imgReady = false;

    function syncGrid() {
      const nextCols = Math.round(Math.min(Math.max(cfgRef.current.grid, 4), 100));
      const aspect = Math.min(Math.max(cfgRef.current.cellAspect, 0.25), 4);
      const nextRows = Math.max(2, Math.min(Math.round((nextCols * outH * aspect) / outW), 200));
      if (nextCols === cols && nextRows === rows) { rowScale = (outH * cols) / (outW * rows); return; }
      cols = nextCols; rows = nextRows;
      rowScale = (outH * cols) / (outW * rows);
      field = new Float32Array(cols * rows * 2);
      // one-time scramble on load that relaxes into place
      if (!scrambled && !reduced && cfgRef.current.scramble > 0) {
        const amp = 40 * Math.min(cfgRef.current.scramble, 3);
        for (let i = 0; i < field.length; i++) field[i] = (Math.random() * 2 - 1) * amp;
      }
      scrambled = true;
      gl.bindTexture(gl.TEXTURE_2D, fieldTex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, cols, rows, 0, gl.RG, gl.FLOAT, field);
      fieldDirty = false;
    }

    function syncSize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      outW = Math.max(1, host.clientWidth);
      outH = Math.max(1, host.clientHeight);
      const w = Math.round(outW * dpr), h = Math.round(outH * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      syncGrid();
    }
    syncSize();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgW = img.naturalWidth; imgH = img.naturalHeight; imgReady = true;
      gl.bindTexture(gl.TEXTURE_2D, contentTex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      start();
    };
    img.src = src;

    const mouse = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0, speed: 0, gate: 0, lastT: 0 };
    let tracking = false;

    function stepSimulation(delta) {
      const c = cfgRef.current;
      const relax = Math.min(Math.max(c.relaxation, 0.5), 0.995);
      const decay = Math.pow(relax, delta * 60);
      let maxAbs = 0;
      for (let i = 0; i < field.length; i++) {
        const v = field[i] * decay;
        field[i] = v;
        const a = Math.abs(v);
        if (a > maxAbs) maxAbs = a;
      }
      const injecting = tracking && (mouse.vX !== 0 || mouse.vY !== 0);
      if (injecting) {
        const gx = mouse.x * cols, gy = mouse.y * rows;
        const maxDist = cols * Math.min(Math.max(c.radius, 0.02), 1);
        const maxSq = maxDist * maxDist;
        const gain = Math.min(Math.max(c.strength, 0), 1) * 100 * mouse.gate;
        for (let j = 0; j < rows; j++) {
          const dy = (gy - j) * rowScale;
          for (let i = 0; i < cols; i++) {
            const dx = gx - i;
            const dSq = dx * dx + dy * dy;
            if (dSq < maxSq) {
              const power = Math.min(maxDist / Math.sqrt(dSq), 10);
              const idx = 2 * (i + cols * j);
              field[idx] += gain * mouse.vX * power;
              field[idx + 1] += gain * mouse.vY * power;
            }
          }
        }
      }
      const vDecay = Math.pow(0.9, delta * 60);
      mouse.vX *= vDecay; mouse.vY *= vDecay;
      if (Math.abs(mouse.vX) < 0.0001) mouse.vX = 0;
      if (Math.abs(mouse.vY) < 0.0001) mouse.vY = 0;
      fieldDirty = true;
      const alive = injecting || mouse.vX !== 0 || mouse.vY !== 0 || maxAbs > 0.03;
      if (!alive && maxAbs > 0) field.fill(0);
      return alive;
    }

    let time = 0;
    function render() {
      if (fieldDirty) {
        fieldDirty = false;
        gl.bindTexture(gl.TEXTURE_2D, fieldTex);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RG, gl.FLOAT, field);
      }
      const c = cfgRef.current;
      // object-fit: cover
      const ca = canvas.width / canvas.height, ia = imgW / imgH;
      let sx = 1, sy = 1;
      if (ca > ia) sy = ia / ca; else sx = ca / ia;
      const z = Math.max(0.2, Math.min(c.zoom, 4));
      sx /= z; sy /= z;
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, contentTex); gl.uniform1i(U.uContent, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fieldTex); gl.uniform1i(U.uField, 1);
      gl.uniform2f(U.uResolution, canvas.width, canvas.height);
      // offset places the image inside the frame: 0 pins its left/top edge to the
      // frame edge, (1 - s) pins the right/bottom edge, (1 - s)/2 centres it.
      let ox = c.anchorX === "left" ? 0 : c.anchorX === "right" ? 1 - sx : (1 - sx) / 2;
      let oy = c.anchorY === "top" ? 0 : c.anchorY === "bottom" ? 1 - sy : (1 - sy) / 2;
      // sampling further left/up makes the image appear further right/down
      ox -= (c.nudgeX || 0) * sx;
      oy += (c.nudgeY || 0) * sy;
      gl.uniform2f(U.uUvScale, sx, sy);
      gl.uniform2f(U.uUvOffset, ox, oy);
      gl.uniform3f(U.uPaper, 0.988, 0.988, 0.988);
      gl.uniform1f(U.uFeather, Math.max(0, Math.min(c.feather || 0, 0.5)));
      gl.uniform1f(U.uShift, Math.min(Math.max(c.shift, 0), 4));
      gl.uniform1f(U.uAberration, Math.min(Math.max(c.aberration, 0), 3));
      gl.uniform1f(U.uGrain, Math.min(Math.max(c.grain, 0), 1));
      gl.uniform1f(U.uGrainPx, Math.max(1, Math.min(Math.max(c.grainSize, 0.5), 4) * dpr * 1.5));
      gl.uniform1f(U.uGrainTick, Math.floor(time * Math.min(Math.max(c.grainSpeed, 0), 4) * 18));
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    let raf = 0, last = performance.now(), running = false, visible = true, destroyed = false;
    function frame(now) {
      if (destroyed) return;
      if (!visible) { running = false; return; }
      const delta = Math.min((now - last) / 1000, 1 / 30);
      last = now; time += delta;
      let alive = false;
      if (!reduced) alive = stepSimulation(delta);
      render();
      if (!alive) { running = false; return; }   // sleep once the field is quiet
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (destroyed || running || !visible || !imgReady) return;
      running = true; last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function onMotionChange() {
      reduced = motionQuery.matches;
      if (reduced) { field.fill(0); mouse.vX = 0; mouse.vY = 0; fieldDirty = true; }
      start();
    }
    motionQuery.addEventListener("change", onMotionChange);

    function onPointerMove(e) {
      if (reduced) return;
      const box = host.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) return;
      const x = (e.clientX - box.left) / box.width;
      const y = (e.clientY - box.top) / box.height;
      const now = performance.now();
      if (!tracking) { tracking = true; mouse.prevX = x; mouse.prevY = y; mouse.speed = 0; mouse.gate = 0; mouse.lastT = now; }
      mouse.vX = x - mouse.prevX; mouse.vY = y - mouse.prevY;
      const dt = Math.max((now - mouse.lastT) / 1000, 0.001);
      mouse.lastT = now;
      const distPx = Math.hypot(mouse.vX * box.width, mouse.vY * box.height);
      mouse.speed += (distPx / dt - mouse.speed) * Math.min(dt * 25, 1);
      const th = Math.max(cfgRef.current.threshold, 0);
      if (th <= 0) mouse.gate = 1;
      else {
        const step = Math.min(Math.max((mouse.speed - th) / th, 0), 1);
        mouse.gate = step * step * (3 - 2 * step);
      }
      mouse.prevX = x; mouse.prevY = y; mouse.x = x; mouse.y = y;
      start();
    }
    function onPointerLeave() { tracking = false; mouse.vX = 0; mouse.vY = 0; mouse.speed = 0; mouse.gate = 0; }

    window.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);

    const ro = new ResizeObserver(() => { syncSize(); start(); });
    ro.observe(host);
    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1]?.isIntersecting ?? true;
      if (visible) start();
    });
    io.observe(canvas);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      gl.deleteTexture(contentTex); gl.deleteTexture(fieldTex);
      gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs);
      gl.deleteBuffer(quad);
    };
  }, [src]);

  return (
    <div ref={hostRef} aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", ...style }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}

/* ========================== VIEWPORT ========================== */

// One source of truth for breakpoints: phone < 640, tablet < 1024, else desktop.
function useViewport() {
  const [vp, setVp] = useState({ w: 1280, isPhone: false, isTablet: false });
  useEffect(() => {
    const read = () => {
      const w = window.innerWidth;
      setVp({ w, isPhone: w < 640, isTablet: w >= 640 && w < 1024 });
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return vp;
}

/* ============================ FOOTER ============================ */

const SOCIALS = [
  { label: "email", href: "mailto:gauritseringsharma@gmail.com" },
  { label: "linkedin", href: "https://www.linkedin.com/in/gauri-tsering-sharma-053189212/" },
  { label: "x", href: "https://x.com/gauri_everybody" },
];

function FooterLink({ label, href, accent }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ fontFamily: BODY, fontWeight: 300, fontSize: "clamp(14px, 1.6vw, 17px)", color: hover ? accent : INK, textDecoration: "none", borderBottom: `1px solid ${hover ? accent : "rgba(74,64,70,0.18)"}`, paddingBottom: 3, transition: "color 250ms ease, border-color 250ms ease" }}
    >
      {label}
    </a>
  );
}

export default function SiteFooter({ heading, tint }) {
  const { isPhone } = useViewport();
  const accent = tint || PINK;

  return (
    <footer
      id="contact"
      style={{
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        padding: isPhone ? "90px 0 56px" : "clamp(110px, 18vh, 200px) 0 72px",
        background: PAPER,
        minHeight: isPhone ? "78svh" : "82vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* same displacement effect as the hero, on its own orchid */}
      <ImageDisplacement src={FOOTER_IMG} zoom={isPhone ? 0.9 : 0.62} anchorX="right" anchorY="bottom" feather={0.14} />

      {/* Per page recolour. Blend mode "color" swaps hue and saturation but
          keeps the luminosity of the petals, so the flower reads as the same
          photograph in a different key. Paper stays paper because white has
          nowhere to go. */}
      {tint ? (
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: tint, mixBlendMode: "color", opacity: 0.82,
          }}
        />
      ) : null}

      {/* paper wash over the top so it grows out of the section above seamlessly */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 0, height: "34%",
          zIndex: 1, pointerEvents: "none",
          background: `linear-gradient(to bottom, ${PAPER} 0%, rgba(252,252,252,0.88) 28%, rgba(252,252,252,0.5) 60%, rgba(252,252,252,0) 100%)`,
        }}
      />

      {/* On phones the flowers sit right under the type, so lay a paper scrim
          behind the text. */}
      {isPhone && (
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background:
              "linear-gradient(to bottom, rgba(252,252,252,0.92) 0%, rgba(252,252,252,0.86) 46%, rgba(252,252,252,0.55) 74%, rgba(252,252,252,0.15) 100%)",
          }}
        />
      )}

      <div style={{ ...SHELL, textAlign: "left", position: "relative", zIndex: 2 }}>
        {heading}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px 32px", marginTop: 38, alignItems: "center" }}>
          {SOCIALS.map((x) => <FooterLink key={x.label} accent={accent} {...x} />)}
        </div>
        <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: 12, color: MUTED, margin: "78px 0 0" }}>
          © {new Date().getFullYear()} gauri
        </p>
      </div>
    </footer>
  );
}
