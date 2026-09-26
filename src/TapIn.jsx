import React, { useState, useEffect, useRef, useMemo } from "react";
import SiteFooter from "./SiteFooter";

/*
  TapIn.jsx - clean editorial case study
  A collaborative tool that helps college students navigate group projects
  with more clarity, connection, and confidence. Built end to end in two weeks
  for Semester 6, Interaction Design, mentored by Parag Sarma.

  Shell constants match Portfolio.jsx. The accent family is sage green.
  Typer uses the same charFill/charAccent ripple animation as the homepage.
*/

/* ---- shell constants (shared across the site) ---- */
const PAPER = "#FCFCFC";
const INK = "#3E2430";
const MUTED = "#8A6F7C";

/* ---- tapin accent family (sage green) ---- */
const ACCENT = "#6E7E3D";
const TINT = "#C3CE93";
const FRAME = "#EEF1DF";
const LINE = "#E2E6CD";

const SANS = "'Poppins', system-ui, -apple-system, sans-serif";
const COL = 820; // narrower editorial column

/* ================================================================= */
/* viewport                                                           */
/* ================================================================= */
function useViewport() {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return { w, isPhone: w < 640, isTablet: w >= 640 && w < 1024 };
}

/* ================================================================= */
/* typer: charFill / charAccent ripple (matches homepage)             */
/* ================================================================= */

const ALL_VARIATIONS = [
  "charFill",
  "charInverse",
  "charAccent",
  "charAccentInverse",
  "charAccentFill",
  "charBorder",
];

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

function bezierEase(x, x1, y1, x2, y2, eps = 1e-6) {
  const bx = (t) => 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3;
  const by = (t) => 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3;
  const bxD = (t) =>
    3 * (1 - t) ** 2 * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t ** 2 * (1 - x2);
  let t = x;
  for (let i = 0; i < 8; i++) {
    const dx = bx(t) - x;
    if (Math.abs(dx) < eps) return by(t);
    const d = bxD(t);
    if (Math.abs(d) < 1e-6) break;
    t -= dx / d;
  }
  let lo = 0;
  let hi = 1;
  t = x;
  for (let i = 0; i < 30; i++) {
    const cx = bx(t);
    if (Math.abs(cx - x) < eps) return by(t);
    if (cx < x) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }
  return by(t);
}

function TyperStyles() {
  const css = `
[data-typer]{
  --typer-fg:${INK};
  --typer-bg:${PAPER};
  --typer-accent:${ACCENT};
  --typer-accent-ink:${PAPER};
  --typer-radius:5px;
}
[data-typer][data-typer-state="initial"]{opacity:0;}
[data-typer][data-typer-state="running"]{opacity:1;}
[data-typer] .word{white-space:pre;display:inline;}
[data-typer] .word .char{box-sizing:content-box;display:inline-block;color:var(--typer-fg);background:transparent;transition:none;}
[data-typer] .word .char.charInit{color:transparent;}
[data-typer] .word .char.charFill{color:var(--typer-bg);background:var(--typer-fg);border-radius:var(--typer-radius);}
[data-typer] .word .char.charFill:has(+ .charFill){border-top-right-radius:0;border-bottom-right-radius:0;}
[data-typer] .word .char.charFill + .charFill{border-radius:0;}
[data-typer] .word .char.charFill + .charFill:last-child,
[data-typer] .word .char.charFill + .charFill:has(+ :not(.charFill)){border-radius:0 var(--typer-radius) var(--typer-radius) 0;}
[data-typer] .word .char.charInverse{color:var(--typer-bg);background:var(--typer-fg);}
[data-typer] .word .char.charAccent{color:var(--typer-accent);background:transparent;}
[data-typer] .word .char.charAccentInverse{color:var(--typer-accent-ink);background:var(--typer-accent);border-radius:var(--typer-radius);}
[data-typer] .word .char.charAccentInverse:has(+ .charAccentInverse){border-top-right-radius:0;border-bottom-right-radius:0;}
[data-typer] .word .char.charAccentInverse + .charAccentInverse{border-radius:0;}
[data-typer] .word .char.charAccentInverse + .charAccentInverse:last-child,
[data-typer] .word .char.charAccentInverse + .charAccentInverse:has(+ :not(.charAccentInverse)){border-radius:0 var(--typer-radius) var(--typer-radius) 0;}
[data-typer] .word .char.charAccentFill{color:var(--typer-accent);background:var(--typer-accent);}
[data-typer] .word .char.charBorder{position:relative;color:var(--typer-fg);}
[data-typer] .word .char.charBorder::after{content:"";display:inline-block;position:absolute;inset:0;border:1px solid var(--typer-accent);border-radius:var(--typer-radius);}
[data-typer] .word .char.charBorder:has(+ .charBorder)::after{border-right:1px solid transparent;border-top-right-radius:0;border-bottom-right-radius:0;}
[data-typer] .word .char.charBorder + .charBorder::after{border-left:1px solid transparent;border-right:1px solid transparent;border-radius:0;}
[data-typer] .word .char.charBorder + .charBorder:last-child::after,
[data-typer] .word .char.charBorder + .charBorder:has(+ :not(.charBorder))::after{border-left:1px solid transparent;border-right:1px solid var(--typer-accent);border-radius:0 var(--typer-radius) var(--typer-radius) 0;}
@media (prefers-reduced-motion: reduce){
  [data-typer][data-typer-state="initial"]{opacity:1;}
  [data-typer] .word .char.charInit{color:var(--typer-fg);}
}
`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function Typer({
  text,
  as: Tag = "span",
  fps = 22,
  cycles = 4,
  window: win = 0.42,
  threshold = 0.3,
  once = false,
  style,
  className,
}) {
  const ref = useRef(null);
  const [frame, setFrame] = useState(-1);

  const glyphs = useMemo(() => Array.from(text), [text]);

  const starts = useMemo(() => {
    const n = glyphs.length;
    return glyphs.map((_, i) => {
      const x = n <= 1 ? 0 : i / (n - 1);
      return bezierEase(x, 0.45, 0, 0.55, 1) * (1 - win);
    });
  }, [glyphs, win]);

  const totalFrames = useMemo(() => Math.ceil((1 + 0.15) * fps * 1.4), [fps]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    let interval = null;
    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
    const run = () => {
      stop();
      setFrame(0);
      let f = 0;
      interval = setInterval(() => {
        f += 1;
        setFrame(f);
        if (f >= totalFrames) stop();
      }, 1000 / fps);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          if (once) io.disconnect();
        } else if (!once) {
          stop();
          setFrame(-1);
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [fps, totalFrames, threshold, once]);

  const progress = frame < 0 ? 0 : clamp(frame / totalFrames, 0, 1);

  const words = [];
  let cur = [];
  glyphs.forEach((g, i) => {
    if (g === " ") {
      words.push({ chars: cur });
      words.push({ space: true });
      cur = [];
    } else cur.push({ g, i });
  });
  if (cur.length) words.push({ chars: cur });

  const classFor = (i) => {
    if (frame < 0) return "charInit";
    const local = clamp((progress - starts[i]) / win, 0, 1);
    if (local <= 0) return "charInit";
    if (local >= 1) return "";
    const step = Math.floor(local * cycles);
    return ALL_VARIATIONS[(i + step) % ALL_VARIATIONS.length];
  };

  return (
    <Tag
      ref={ref}
      data-typer=""
      data-typer-state={frame < 0 ? "initial" : "running"}
      className={className}
      style={style}
    >
      {words.map((w, wi) =>
        w.space ? (
          <span key={`s${wi}`}> </span>
        ) : (
          <span className="word" key={`w${wi}`}>
            {w.chars.map(({ g, i }) => (
              <span key={i} className={`char ${classFor(i)}`}>
                {g}
              </span>
            ))}
          </span>
        )
      )}
    </Tag>
  );
}

/* ================================================================= */
/* nav: fixed, hides on scroll down, reveals on scroll up             */
/* ================================================================= */
function NavItem({ label, href, compact }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: SANS,
        fontSize: compact ? 13 : 15,
        fontWeight: 500,
        textTransform: "lowercase",
        textDecoration: "none",
        color: hover ? ACCENT : INK,
        transition: "color 200ms ease",
      }}
    >
      {label}
    </a>
  );
}

function Nav() {
  const { isPhone } = useViewport();
  const [shown, setShown] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 80) setShown(true);
      else if (Math.abs(delta) > 6) setShown(delta < 0);
      lastY.current = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: isPhone ? 16 : "clamp(22px, 3.4vw, 38px)",
        right: isPhone ? 16 : "clamp(24px, 6vw, 72px)",
        left: isPhone ? 16 : "auto",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: isPhone ? "space-between" : "flex-end",
        gap: isPhone ? 12 : 26,
        transform: shown ? "translateY(0)" : "translateY(-160%)",
        transition: "transform 340ms cubic-bezier(.2,.8,.2,1)",
        willChange: "transform",
      }}
    >
      <NavItem label="gauri" href="/" compact={isPhone} />
      <NavItem label="about" href="/#about" compact={isPhone} />
      <NavItem label="work" href="/#work" compact={isPhone} />
      <NavItem label="contact" href="/#contact" compact={isPhone} />
    </nav>
  );
}

/* ================================================================= */
/* layout primitives                                                  */
/* ================================================================= */

function Section({ children, id, wide, style }) {
  return (
    <section
      id={id}
      style={{
        maxWidth: wide ? 1180 : COL,
        margin: "0 auto",
        padding: `clamp(72px,10vw,128px) clamp(20px,5vw,64px) 0`,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function ThreadRule() {
  return (
    <div
      aria-hidden
      style={{
        maxWidth: COL,
        margin: "clamp(72px,10vw,128px) auto 0",
        padding: "0 clamp(20px,5vw,64px)",
      }}
    >
      <div style={{ height: 1, background: LINE }} />
    </div>
  );
}

function SectionNumber({ n }) {
  return (
    <span
      style={{
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.14em",
        color: ACCENT,
      }}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

function Kicker({ children }) {
  return (
    <p
      style={{
        margin: "0 0 14px",
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: ACCENT,
      }}
    >
      {children}
    </p>
  );
}

function P({ children, style }) {
  return (
    <p
      style={{
        margin: "0 0 20px",
        fontFamily: SANS,
        fontSize: "clamp(16px, 1.2vw, 18px)",
        lineHeight: 1.75,
        fontWeight: 400,
        color: INK,
        textTransform: "lowercase",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

/* blockquote for key insights */
function Quote({ children }) {
  return (
    <blockquote
      style={{
        margin: "32px 0",
        paddingLeft: 20,
        borderLeft: `3px solid ${TINT}`,
        fontFamily: SANS,
        fontSize: "clamp(18px, 1.6vw, 22px)",
        lineHeight: 1.55,
        fontWeight: 500,
        color: ACCENT,
        textTransform: "lowercase",
      }}
    >
      {children}
    </blockquote>
  );
}

/* full-bleed image with caption */
function FullImage({ src, alt, caption }) {
  return (
    <figure
      style={{
        margin: "40px 0",
        padding: 0,
      }}
    >
      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${LINE}`,
          background: FRAME,
        }}
      >
        {src ? (
          <img
            src={src}
            alt={alt || caption || ""}
            style={{ width: "100%", display: "block" }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              aspectRatio: "16/9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: ACCENT,
                textTransform: "lowercase",
              }}
            >
              {alt || "image placeholder"}
            </span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption
          style={{
            fontFamily: SANS,
            fontSize: 13,
            fontStyle: "italic",
            color: MUTED,
            marginTop: 10,
            textTransform: "lowercase",
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* phone screen frame */
function Phone({ src, label, w = 220 }) {
  return (
    <figure style={{ margin: 0, width: w, flex: "0 0 auto" }}>
      <div
        style={{
          width: w,
          aspectRatio: "390 / 844",
          borderRadius: 24,
          overflow: "hidden",
          background: FRAME,
          border: `1px solid ${LINE}`,
          boxShadow: "0 16px 36px -24px rgba(62,36,48,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {src ? (
          <img
            src={src}
            alt={label}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <span
            style={{
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 500,
              color: ACCENT,
              textTransform: "lowercase",
              textAlign: "center",
              padding: "0 16px",
            }}
          >
            {label}
          </span>
        )}
      </div>
      {label && (
        <figcaption
          style={{
            fontFamily: SANS,
            fontSize: 12,
            color: MUTED,
            marginTop: 10,
            textTransform: "lowercase",
            textAlign: "center",
          }}
        >
          {label}
        </figcaption>
      )}
    </figure>
  );
}

function PhoneRow({ children }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "clamp(16px,2.6vw,28px)",
        overflowX: "auto",
        paddingBottom: 8,
        margin: "8px 0 0",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children}
    </div>
  );
}

/* ================================================================= */
/* page sections                                                      */
/* ================================================================= */

function Hero() {
  const { isPhone } = useViewport();
  return (
    <header
      style={{
        maxWidth: COL,
        margin: "0 auto",
        padding: `${isPhone ? "120px" : "clamp(160px, 22vh, 260px)"} clamp(20px,5vw,64px) 0`,
      }}
    >
      <Kicker>case study</Kicker>
      <Typer
        as="h1"
        text="tapin"
        once
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          textTransform: "lowercase",
          fontSize: "clamp(64px, 14vw, 160px)",
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
          margin: "12px 0 0",
          color: INK,
        }}
      />
      <p
        style={{
          margin: "clamp(24px,3vw,36px) 0 0",
          fontFamily: SANS,
          fontSize: "clamp(18px, 1.7vw, 24px)",
          lineHeight: 1.55,
          fontWeight: 400,
          color: INK,
          textTransform: "lowercase",
          maxWidth: 560,
        }}
      >
        a collaborative tool that helps college students navigate group projects
        with more clarity, connection, and confidence.
      </p>
    </header>
  );
}

function MetaStrip() {
  const { isPhone } = useViewport();
  const items = [
    ["role", "end to end, solo"],
    ["timeline", "2 weeks"],
    ["tools", "figma"],
    ["mentor", "parag sarma"],
    ["context", "sem 6, interaction design"],
  ];
  return (
    <Section>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: isPhone ? "20px 32px" : "16px 56px",
          paddingBottom: 4,
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        {items.map(([k, v]) => (
          <div key={k}>
            <p
              style={{
                margin: "0 0 4px",
                fontFamily: SANS,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              {k}
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: SANS,
                fontSize: 15,
                fontWeight: 500,
                color: INK,
                textTransform: "lowercase",
              }}
            >
              {v}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SectionOverview() {
  return (
    <Section>
      <SectionNumber n={1} />
      <Typer
        as="h2"
        text="overview"
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          textTransform: "lowercase",
          fontSize: "clamp(32px, 5vw, 52px)",
          lineHeight: 1.05,
          color: INK,
          margin: "10px 0 clamp(24px,3vw,36px)",
        }}
      />
      <P>
        in college, group projects are supposed to teach teamwork. in practice,
        they often play out the same way: one person overworks, another coasts,
        and a third holds back with ideas they never voice. tapin started from
        that friction.
      </P>
      <P>
        i ran the whole process solo in two weeks: interviews, synthesis,
        personas, a problem statement, information architecture, and hi-fi
        screens in figma.
      </P>
    </Section>
  );
}

function SectionResearch() {
  const { isPhone } = useViewport();
  const solo = [
    "need for control over outcomes",
    "fear of unpredictable teammates",
    "trust as a precondition for collaboration",
    "high personal standards causing friction",
    "micromanaging when others underperform",
  ];
  const team = [
    "prefers teams, but only with the right people",
    "wants to pick teammates by skill and ethic",
    "enjoys shared momentum and learning",
    "still works solo on critical parts if the team slips",
  ];
  return (
    <Section>
      <SectionNumber n={2} />
      <Typer
        as="h2"
        text="research"
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          textTransform: "lowercase",
          fontSize: "clamp(32px, 5vw, 52px)",
          lineHeight: 1.05,
          color: INK,
          margin: "10px 0 clamp(24px,3vw,36px)",
        }}
      />
      <P>
        i interviewed classmates about how they actually behave in group work.
        two clear mindsets came up, so i studied each on its own terms.
      </P>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr",
          gap: "clamp(16px,2.4vw,24px)",
          marginTop: 12,
        }}
      >
        {[
          ["prefer working alone", solo],
          ["prefer working in a team", team],
        ].map(([heading, list]) => (
          <div
            key={heading}
            style={{
              background: FRAME,
              border: `1px solid ${LINE}`,
              borderRadius: 14,
              padding: "clamp(20px,2.6vw,28px)",
            }}
          >
            <h3
              style={{
                margin: "0 0 14px",
                fontFamily: SANS,
                fontSize: 15,
                fontWeight: 600,
                color: ACCENT,
                textTransform: "lowercase",
              }}
            >
              {heading}
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {list.map((t, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: SANS,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: INK,
                    padding: "7px 0",
                    borderTop: i === 0 ? "none" : `0.5px solid ${LINE}`,
                    textTransform: "lowercase",
                  }}
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Quote>
        the problem was not solo people versus team people. it was a shared set
        of anxieties about control, trust, and recognition that plays out
        differently depending on who you are.
      </Quote>

      <P style={{ color: MUTED, fontSize: 15 }}>
        secondary research confirmed the pattern: teamwork is built into
        university curricula everywhere, yet free-riding, skill mismatches, and
        low trust remain the most common barriers.
      </P>
    </Section>
  );
}

function SectionPersonas() {
  const { isPhone } = useViewport();
  const people = [
    {
      name: "reet kapoor",
      tag: "the over-controller",
      quote: "if it is not done my way, it is not done right.",
      bio: "delivers high-quality work but takes on too much. resents teammates who coast and struggles to delegate.",
      hmw: "set clear roles from the start, so she does not feel she has to take over.",
    },
    {
      name: "meher singh",
      tag: "the coaster",
      quote: "i will do my part if they tell me what to do.",
      bio: "easygoing, does the bare minimum. teammates usually take over, which lets her coast unchallenged.",
      hmw: "make each person's tasks visible, so contribution is clear and necessary.",
    },
    {
      name: "varun mishra",
      tag: "the quiet one",
      quote: "i have ideas, but what if they don't like them?",
      bio: "prefers working alone to avoid conflict. often overlooked, contributes only when asked directly.",
      hmw: "let quieter members share ideas without the pressure of speaking up in front of everyone.",
    },
  ];
  return (
    <Section>
      <SectionNumber n={3} />
      <Typer
        as="h2"
        text="personas"
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          textTransform: "lowercase",
          fontSize: "clamp(32px, 5vw, 52px)",
          lineHeight: 1.05,
          color: INK,
          margin: "10px 0 clamp(24px,3vw,36px)",
        }}
      />
      <P>
        the same tension produces three very different people. framing it through
        all three kept the solution honest.
      </P>

      {people.map((p, i) => (
        <div
          key={p.name}
          style={{
            marginTop: i === 0 ? 24 : 40,
            paddingTop: i === 0 ? 0 : 40,
            borderTop: i === 0 ? "none" : `1px solid ${LINE}`,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isPhone ? "1fr" : "1fr 1.2fr",
              gap: "clamp(16px,2.6vw,32px)",
              alignItems: "start",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 4px",
                  fontFamily: SANS,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: ACCENT,
                }}
              >
                persona {i + 1}
              </p>
              <h3
                style={{
                  margin: "0 0 2px",
                  fontFamily: SANS,
                  fontSize: "clamp(22px,2.8vw,30px)",
                  fontWeight: 600,
                  color: INK,
                  textTransform: "lowercase",
                }}
              >
                {p.name}
              </h3>
              <p
                style={{
                  margin: "0 0 14px",
                  fontFamily: SANS,
                  fontSize: 13,
                  color: MUTED,
                  textTransform: "lowercase",
                }}
              >
                {p.tag}
              </p>
              <blockquote
                style={{
                  margin: 0,
                  paddingLeft: 14,
                  borderLeft: `2px solid ${TINT}`,
                  fontFamily: SANS,
                  fontSize: "clamp(15px,1.4vw,18px)",
                  lineHeight: 1.5,
                  fontWeight: 500,
                  color: ACCENT,
                  textTransform: "lowercase",
                }}
              >
                {p.quote}
              </blockquote>
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 16px",
                  fontFamily: SANS,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: INK,
                  textTransform: "lowercase",
                }}
              >
                {p.bio}
              </p>
              <div
                style={{
                  background: FRAME,
                  border: `1px solid ${LINE}`,
                  borderRadius: 12,
                  padding: "14px 18px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 6px",
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: ACCENT,
                  }}
                >
                  how might we
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: SANS,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: INK,
                    textTransform: "lowercase",
                  }}
                >
                  {p.hmw}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </Section>
  );
}

function SectionProblem() {
  return (
    <Section>
      <SectionNumber n={4} />
      <Typer
        as="h2"
        text="problem"
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          textTransform: "lowercase",
          fontSize: "clamp(32px, 5vw, 52px)",
          lineHeight: 1.05,
          color: INK,
          margin: "10px 0 clamp(24px,3vw,36px)",
        }}
      />
      <div
        style={{
          background: ACCENT,
          borderRadius: 16,
          padding: "clamp(28px,4vw,52px)",
        }}
      >
        <p
          style={{
            margin: "0 0 14px",
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: FRAME,
          }}
        >
          problem statement
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: SANS,
            fontSize: "clamp(20px, 3vw, 34px)",
            lineHeight: 1.35,
            fontWeight: 600,
            color: PAPER,
            textTransform: "lowercase",
          }}
        >
          how might we create a context in which every team member feels compelled
          to contribute meaningfully, regardless of team dynamics or personal
          preferences?
        </p>
      </div>
    </Section>
  );
}

function SectionSolution() {
  const { isPhone } = useViewport();
  const pillars = [
    [
      "understand each other",
      "personalised icebreakers and visible strengths help a team learn who they are working with before the work starts.",
    ],
    [
      "build shared habits",
      "team prompts and light structure give everyone a role and a rhythm, so contribution does not depend on one person pushing.",
    ],
    [
      "reflect and recognise",
      "reflection tools and shoutouts close the loop, so effort is seen and quieter wins get acknowledged.",
    ],
  ];
  return (
    <Section>
      <SectionNumber n={5} />
      <Typer
        as="h2"
        text="solution"
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          textTransform: "lowercase",
          fontSize: "clamp(32px, 5vw, 52px)",
          lineHeight: 1.05,
          color: INK,
          margin: "10px 0 clamp(24px,3vw,36px)",
        }}
      />
      <P>
        tapin creates a space for students to understand their teammates, express
        themselves, and contribute with intention. the aim is simple: make
        teamwork less awkward and more deliberate.
      </P>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "1fr" : "repeat(3, 1fr)",
          gap: "clamp(14px,2vw,22px)",
          marginTop: 24,
        }}
      >
        {pillars.map(([h, b], i) => (
          <div
            key={h}
            style={{
              background: FRAME,
              border: `1px solid ${LINE}`,
              borderRadius: 14,
              padding: "clamp(20px,2.6vw,26px)",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: TINT,
                color: "#3f4a1c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              {i + 1}
            </div>
            <h3
              style={{
                margin: "0 0 6px",
                fontFamily: SANS,
                fontSize: 15,
                fontWeight: 600,
                color: INK,
                textTransform: "lowercase",
              }}
            >
              {h}
            </h3>
            <p
              style={{
                margin: 0,
                fontFamily: SANS,
                fontSize: 14,
                lineHeight: 1.6,
                color: MUTED,
                textTransform: "lowercase",
              }}
            >
              {b}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SectionIA() {
  return (
    <Section>
      <SectionNumber n={6} />
      <Typer
        as="h2"
        text="information architecture"
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          textTransform: "lowercase",
          fontSize: "clamp(28px, 4.4vw, 46px)",
          lineHeight: 1.05,
          color: INK,
          margin: "10px 0 clamp(24px,3vw,36px)",
        }}
      />
      <P>
        five spaces hold the product together: home, icebreakers, community,
        projects, and profile. each maps to a moment in the group work arc.
      </P>
      <FullImage
        alt="information architecture diagram"
        caption="information architecture showing the five main spaces and their relationships."
      />
    </Section>
  );
}

function SectionScreens() {
  const groups = [
    [
      "onboarding and setup",
      "students set up a profile, pick strengths, and land on a home that shows projects and recommended icebreakers.",
      [
        ["onboarding 1", null],
        ["onboarding 2", null],
        ["select strengths", null],
        ["home", null],
      ],
    ],
    [
      "building a team",
      "start a project, choose teammates by complementary skills, open a group chat.",
      [
        ["project details", null],
        ["choose teammates", null],
        ["community", null],
        ["group chat", null],
      ],
    ],
    [
      "icebreakers",
      "light games that lower the social barrier and give quieter members an easy first contribution.",
      [
        ["icebreakers", null],
        ["guess the liar", null],
      ],
    ],
    [
      "contribution and feedback",
      "personal contribution views and peer feedback make effort visible.",
      [
        ["contribution", null],
        ["feedback", null],
        ["notifications", null],
        ["profile", null],
      ],
    ],
  ];
  return (
    <Section wide>
      <SectionNumber n={7} />
      <Typer
        as="h2"
        text="screens"
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          textTransform: "lowercase",
          fontSize: "clamp(32px, 5vw, 52px)",
          lineHeight: 1.05,
          color: INK,
          margin: "10px 0 clamp(24px,3vw,36px)",
        }}
      />
      {groups.map(([h, b, screens], gi) => (
        <div key={h} style={{ marginTop: gi === 0 ? 16 : "clamp(48px,6vw,72px)" }}>
          <h3
            style={{
              margin: "0 0 6px",
              fontFamily: SANS,
              fontSize: "clamp(16px,1.5vw,20px)",
              fontWeight: 600,
              color: INK,
              textTransform: "lowercase",
            }}
          >
            {h}
          </h3>
          <p
            style={{
              margin: "0 0 4px",
              fontFamily: SANS,
              fontSize: 14,
              lineHeight: 1.6,
              color: MUTED,
              maxWidth: 600,
              textTransform: "lowercase",
            }}
          >
            {b}
          </p>
          <PhoneRow>
            {screens.map(([label, src]) => (
              <Phone key={label} label={label} src={src} />
            ))}
          </PhoneRow>
        </div>
      ))}
    </Section>
  );
}

function SectionReflection() {
  return (
    <Section>
      <SectionNumber n={8} />
      <Typer
        as="h2"
        text="reflection"
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          textTransform: "lowercase",
          fontSize: "clamp(32px, 5vw, 52px)",
          lineHeight: 1.05,
          color: INK,
          margin: "10px 0 clamp(24px,3vw,36px)",
        }}
      />
      <P>
        the two-week constraint was the point. it forced me to move from
        interviews to a defensible problem statement fast and to trust synthesis
        instead of gathering endlessly. building for three opposite personas kept
        the concept from bending toward any one type of student.
      </P>
      <P>
        if i took this further, i would test the icebreakers and contribution
        views with real teams mid-project, the two features that carry the most
        weight against the problem statement, and see whether visible
        contribution actually shifts behaviour.
      </P>
    </Section>
  );
}

/* ================================================================= */
/* page                                                               */
/* ================================================================= */
export default function TapIn() {
  return (
    <main
      style={{
        background: PAPER,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <TyperStyles />
      <Nav />
      <Hero />
      <MetaStrip />
      <ThreadRule />
      <SectionOverview />
      <ThreadRule />
      <SectionResearch />
      <ThreadRule />
      <SectionPersonas />
      <ThreadRule />
      <SectionProblem />
      <SectionSolution />
      <ThreadRule />
      <SectionIA />
      <SectionScreens />
      <ThreadRule />
      <SectionReflection />
      <div style={{ height: "clamp(60px,8vw,110px)" }} />
      <SiteFooter tint={ACCENT} heading="let's tap in" />
    </main>
  );
}
