import { useState, useEffect, useRef, useCallback } from "react";
import SiteFooter from "./SiteFooter";

/**
 * Untangling the Knots, Overloaded Laundry System
 * Systems design case study, single scroll page.
 *
 * Shell is shared with every case study: warm paper, plum ink, Quicksand
 * headings, Typer reveal, dark rose footer. Only ACCENT and TINT shift per
 * project, sampled from that project's own artefacts. This one is indigo.
 *
 * Assets live in /public. Swap gigamap to the .svg when it is uploaded.
 */

/* ============================ PALETTE ============================ */
const PAPER = "#FCFCFC";   // matches Portfolio.jsx exactly
const INK = "#3E2430";     // matches Portfolio.jsx (deep wine)
const MUTED = "#8A6F7C";    // matches Portfolio.jsx

/* per case study */
const ACCENT = "#4C5FA8"; // washed indigo
const TINT = "#DEE1EC"; // pale indigo hairline

const DISPLAY = "'Quicksand', system-ui, -apple-system, 'Segoe UI', sans-serif";
const BODY = "'Nunito Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
/* the footer is shared with the main site, so it keeps the site's own type */
const SITE_DISPLAY = "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif";
const SITE_INK = INK;
const SITE_PAPER = PAPER;

/* ============================= ASSETS ============================ */
const IMG = {
  process: "/laundry-process.jpg",
  gigamap: "/laundry-gigamap.jpg",
  systemMap: "/laundry-systemmap.jpg",
  solutions: "/laundry-solutions.jpg",
  tag: "/laundry-tag.png",
  pdf: "/untangling-the-knots.pdf",
  overload: "/laundry-overload.jpg",
  collection: "/laundry-collection.jpg",
  sorting: "/laundry-sorting.jpg",
  ironing: "/laundry-ironing.jpg",
  racks: "/laundry-racks.jpg",
  drying: "/laundry-drying.jpg",
  machines: "/laundry-machines.jpg",
  vendor1: "/laundry-vendor-1.jpg",
  vendor2: "/laundry-vendor-2.jpg",
  vendor3: "/laundry-vendor-3.jpg",
  vendor4: "/laundry-vendor-4.jpg",
};

/* ============================== TYPER ============================= */

const ALL_VARIATIONS = [
  "charFill",
  "charInverse",
  "charAccent",
  "charAccentInverse",
  "charAccentFill",
  "charBorder",
];

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// Solve cubic-bezier y for x (Newton, then bisection). Placing each glyph's
// delay along an eased curve makes the reveal ripple instead of march.
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
[data-typer] .word{white-space:pre;display:inline-block;}
[data-typer] .word .char{
  box-sizing:content-box;display:inline-block;
  color:var(--typer-fg);background:transparent;
  border:1px solid transparent;border-radius:0;
  transition:none;
}
[data-typer] .word .char.charInit{color:transparent;}
[data-typer] .word .char.charFill{
  color:var(--typer-bg);background:var(--typer-fg);border-radius:var(--typer-radius);
}
[data-typer] .word .char.charInverse{
  color:var(--typer-bg);background:var(--typer-fg);
}
[data-typer] .word .char.charAccent{color:var(--typer-accent);}
[data-typer] .word .char.charAccentInverse{
  color:var(--typer-accent-ink);background:var(--typer-accent);
}
[data-typer] .word .char.charAccentFill{
  color:var(--typer-accent-ink);background:var(--typer-accent);
  border-radius:var(--typer-radius);
}
[data-typer] .word .char.charBorder{
  color:var(--typer-fg);border-color:var(--typer-accent);border-radius:var(--typer-radius);
}
@media (prefers-reduced-motion: reduce){
  [data-typer]{opacity:1 !important;}
  [data-typer] .word .char{color:var(--typer-fg) !important;background:transparent !important;border-color:transparent !important;}
}
`;
  return <style>{css}</style>;
}

function Typer({ text, as = "span", once = false, delay = 0, accent, style, className }) {
  const ref = useRef(null);
  const timers = useRef([]);
  const fired = useRef(false);
  const Tag = as;

  const words = String(text).split(" ");

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  const run = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const chars = Array.from(node.querySelectorAll(".char"));
    node.setAttribute("data-typer-state", "running");

    if (reduced) {
      chars.forEach((el) => (el.className = "char"));
      return;
    }

    const total = chars.length;
    const spread = clamp(total * 26, 320, 900);
    const step = 58;

    chars.forEach((el, i) => {
      const t = total > 1 ? i / (total - 1) : 0;
      const eased = bezierEase(t, 0.16, 0.9, 0.3, 1);
      const start = delay + eased * spread;

      const hops = 2 + Math.floor(Math.random() * 2);
      const seen = [];
      for (let h = 0; h < hops; h++) {
        let v = ALL_VARIATIONS[Math.floor(Math.random() * ALL_VARIATIONS.length)];
        if (seen.includes(v)) {
          v = ALL_VARIATIONS[(ALL_VARIATIONS.indexOf(v) + 2) % ALL_VARIATIONS.length];
        }
        seen.push(v);
        timers.current.push(
          setTimeout(() => {
            el.className = "char " + v;
          }, start + h * step)
        );
      }
      timers.current.push(
        setTimeout(() => {
          el.className = "char";
        }, start + hops * step)
      );
    });
  }, [delay]);

  const reset = () => {
    const node = ref.current;
    if (!node) return;
    clearTimers();
    node.setAttribute("data-typer-state", "initial");
    node.querySelectorAll(".char").forEach((el) => (el.className = "char charInit"));
  };

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (once && fired.current) return;
            fired.current = true;
            run();
          } else if (!once) {
            reset();
          }
        });
      },
      { threshold: 0.35 }
    );

    io.observe(node);
    return () => {
      io.disconnect();
      clearTimers();
    };
  }, [run, once]);

  const vars = accent
    ? {
        "--typer-fg": accent.fg,
        "--typer-bg": accent.bg,
        "--typer-accent": accent.accent,
        "--typer-accent-ink": accent.bg,
      }
    : null;

  return (
    <Tag
      ref={ref}
      data-typer=""
      data-typer-state="initial"
      className={className}
      style={{ ...vars, ...style }}
    >
      {words.map((w, wi) => (
        <span className="word" key={wi}>
          {Array.from(w).map((c, ci) => (
            <span className="char charInit" key={ci}>
              {c}
            </span>
          ))}
          {wi < words.length - 1 ? <span className="char charInit">{"\u00A0"}</span> : null}
        </span>
      ))}
    </Tag>
  );
}

/* ============================ PRIMITIVES ========================== */

function Reveal({ children, delay = 0, style }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && setOn(true)),
      { threshold: 0.12 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0)" : "translateY(14px)",
        transition: `opacity .7s ease ${delay}ms, transform .7s cubic-bezier(.2,.8,.2,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* A loose thread, drawn once. The metaphor of the map, used as a rule. */
function ThreadRule({ flip = false }) {
  return (
    <div style={{ margin: "clamp(56px,8vw,104px) 0" }} aria-hidden="true">
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        style={{ width: "100%", height: 34, transform: flip ? "scaleX(-1)" : "none" }}
      >
        <path
          d="M0 22 C 140 6, 232 34, 372 20 S 620 4, 742 24 S 980 34, 1200 14"
          fill="none"
          stroke={TINT}
          strokeWidth="1.6"
        />
        <path
          d="M0 22 C 140 6, 232 34, 372 20"
          fill="none"
          stroke={ACCENT}
          strokeWidth="1.6"
          opacity="0.5"
        />
        <circle cx="372" cy="20" r="3" fill={ACCENT} />
      </svg>
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <div
      style={{
        fontFamily: BODY,
        fontSize: 12,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: ACCENT,
        marginBottom: 18,
      }}
    >
      {children}
    </div>
  );
}

function H2({ children, ...rest }) {
  return (
    <Typer
      as="h2"
      text={children}
      style={{
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: "clamp(28px,4.4vw,52px)",
        lineHeight: 1.12,
        letterSpacing: "-0.01em",
        margin: "0 0 24px",
        textTransform: "lowercase",
      }}
      {...rest}
    />
  );
}

function H3({ children }) {
  return (
    <h3
      style={{
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: "clamp(19px,2.1vw,25px)",
        lineHeight: 1.2,
        margin: "0 0 12px",
        textTransform: "lowercase",
      }}
    >
      {children}
    </h3>
  );
}

function P({ children, muted = false, style }) {
  return (
    <p
      style={{
        fontFamily: BODY,
        fontSize: "clamp(15px,1.35vw,17.5px)",
        lineHeight: 1.72,
        color: muted ? MUTED : INK,
        margin: "0 0 18px",
        maxWidth: "62ch",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

/**
 * Every section carries its own top breathing room by default, so two
 * sections that sit back to back with no thread between them never look
 * crammed. Where a ThreadRule precedes a Section the two margins collapse
 * harmlessly. Callers that must sit flush (a bleed image, a caption strip,
 * the title) pass their own paddingTop to override.
 */
function Section({ children, id, style }) {
  return (
    <section
      id={id}
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "clamp(60px,8vw,108px) clamp(20px,5vw,64px) 0",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function Caption({ children }) {
  return (
    <div
      style={{
        fontFamily: BODY,
        fontSize: 13.5,
        color: MUTED,
        marginTop: 12,
        lineHeight: 1.6,
        maxWidth: "62ch",
      }}
    >
      {children}
    </div>
  );
}

function Figure({ src, alt, caption, ratio }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure style={{ margin: "0 0 12px" }}>
      {failed ? (
        <div
          style={{
            border: `1px dashed ${TINT}`,
            borderRadius: 6,
            padding: "48px 24px",
            fontFamily: BODY,
            fontSize: 14,
            color: MUTED,
            background: "#fff",
          }}
        >
          missing asset: {src}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{
            width: "100%",
            display: "block",
            borderRadius: 4,
            border: `1px solid ${TINT}`,
            background: "#fff",
            aspectRatio: ratio || "auto",
            objectFit: ratio ? "cover" : "fill",
          }}
        />
      )}
      {caption ? <figcaption>{<Caption>{caption}</Caption>}</figcaption> : null}
    </figure>
  );
}

/* Full width photograph that breaks the column. */
function Bleed({ src, alt, caption, height = "clamp(280px,52vw,620px)" }) {
  return (
    <div style={{ margin: "clamp(40px,6vw,72px) 0" }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{
          width: "100%",
          height,
          objectFit: "cover",
          display: "block",
          background: "#fff",
        }}
      />
      {caption ? (
        <Section style={{ paddingTop: 0, marginTop: 0 }}>
          <Caption>{caption}</Caption>
        </Section>
      ) : null}
    </div>
  );
}

/* ============================== NAV =============================== */

function Nav() {
  const link = {
    fontFamily: BODY,
    fontSize: 15,
    color: INK,
    textDecoration: "none",
    textTransform: "lowercase",
  };
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "flex",
        justifyContent: "flex-end",
        gap: 20,
        padding: "22px clamp(20px,5vw,64px)",
        background: `${PAPER}f2`,
        backdropFilter: "blur(8px)",
      }}
    >
      <a href="/" style={link}>
        gauri
      </a>
      <span style={{ color: TINT }}>·</span>
      <a href="/#about" style={link}>
        about
      </a>
      <span style={{ color: TINT }}>·</span>
      <a href="/#work" style={link}>
        work
      </a>
      <span style={{ color: TINT }}>·</span>
      <a href="mailto:gauritseringsharma@gmail.com" style={link}>
        contact
      </a>
    </nav>
  );
}

/* ============================= TITLE ============================== */

function Title() {
  const metaLabel = {
    fontFamily: BODY,
    fontSize: 11.5,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: 7,
  };
  const metaValue = { fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: INK };

  const meta = [
    ["course", "Design Ecosystems, Semester 07\nMDes Interaction Design, Anant National University"],
    ["guided by", "Avni Sethi"],
    ["my role", "On ground research, documentation, solution development and implementation strategy"],
    ["team", "Abhineet Kumar, Gauri Tsering Sharma, Purva Tekale, Riya Khattri, Shreya Shinde, Tanishka Vyas"],
    ["output", "Gigamap, systems analysis, working RFID prototype"],
  ];

  return (
    <Section style={{ paddingTop: "clamp(48px,9vw,110px)" }}>
      <Eyebrow>systems design</Eyebrow>

      <Typer
        as="h1"
        once
        text="untangling the knots"
        style={{
          fontFamily: DISPLAY,
          fontWeight: 600,
          fontSize: "clamp(40px,8.6vw,104px)",
          lineHeight: 1.02,
          letterSpacing: "-0.02em",
          margin: "0 0 18px",
          textTransform: "lowercase",
        }}
      />

      <p
        style={{
          fontFamily: DISPLAY,
          fontWeight: 500,
          fontSize: "clamp(19px,2.6vw,30px)",
          color: MUTED,
          margin: "0 0 clamp(40px,6vw,72px)",
          textTransform: "lowercase",
          maxWidth: "24ch",
          lineHeight: 1.25,
        }}
      >
        mapping an overloaded hostel laundry system
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
          gap: "28px 32px",
          borderTop: `1px solid ${TINT}`,
          paddingTop: 30,
        }}
      >
        {meta.map(([label, value]) => (
          <div key={label}>
            <div style={metaLabel}>{label}</div>
            <div style={{ ...metaValue, whiteSpace: "pre-line" }}>{value}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ============================= INTRO ============================== */

const ISSUES = [
  "Loss and damage of garments",
  "Delayed deliveries and unpredictable turnaround times",
  "Manual and error prone tagging and logging",
  "Overburdened staff from inconsistent manpower allocation",
  "Low student awareness, accountability and compliance",
  "No clear communication or grievance redressal route",
  "Infrastructure that fails in bad weather",
];

function Intro() {
  return (
    <>
      <Bleed
        src={IMG.overload}
        alt="Dozens of tied cloth laundry bags stacked across the floor of the hostel laundry."
        caption="One day's intake, waiting on the floor."
      />

      <Section>
        <Eyebrow>the problem</Eyebrow>
        <H2>we picked a system we were already stuck inside</H2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "clamp(28px,4vw,60px)",
            alignItems: "start",
          }}
        >
          <div>
            <P>
              The hostel laundry service is not a side detail of student life. It is the thing
              everyone touches every week, and the thing everyone complains about. Clothes came back
              late, came back damaged, or did not come back at all. Nobody could tell you why,
              because nobody could see the whole of it.
            </P>
            <P>
              That was the appeal. We were not studying a system from the outside. We were six
              students inside it, with the same missing shirts as everyone else. The brief for
              Design Ecosystems asked us to read a real system through its variables, feedback loops
              and leverage points rather than its symptoms, and this one was close enough to touch.
            </P>
            <P muted>
              Overloaded Laundry System became the central variable, the root node that everything
              else in the map eventually hung from.
            </P>
          </div>

          <div>
            <div
              style={{
                fontFamily: BODY,
                fontSize: 11.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: MUTED,
                marginBottom: 16,
              }}
            >
              what kept breaking
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {ISSUES.map((t) => (
                <li
                  key={t}
                  style={{
                    fontFamily: BODY,
                    fontSize: 15.5,
                    lineHeight: 1.55,
                    padding: "13px 0",
                    borderBottom: `1px solid ${TINT}`,
                    display: "flex",
                    gap: 14,
                  }}
                >
                  <span style={{ color: ACCENT, flexShrink: 0 }}>·</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: "clamp(48px,7vw,84px)",
            padding: "clamp(28px,4vw,44px)",
            background: "#fff",
            border: `1px solid ${TINT}`,
            borderLeft: `3px solid ${ACCENT}`,
            borderRadius: 0,
          }}
        >
          <Eyebrow>research question</Eyebrow>
          <p
            style={{
              fontFamily: DISPLAY,
              fontWeight: 500,
              fontSize: "clamp(19px,2.4vw,28px)",
              lineHeight: 1.4,
              margin: 0,
              maxWidth: "40ch",
            }}
          >
            What factors contribute to the inefficiency and overload in the college laundry system,
            and how can process improvements create a fairer and more efficient experience for both
            students and staff?
          </p>
        </div>
      </Section>
    </>
  );
}

/* =========================== WALKTHROUGH ========================== */

const STEPS = [
  ["Fill the laundry bags", "student"],
  ["Drop them off at the collection point", "student"],
  ["Bags are stacked in one place", "staff"],
  ["Staff sit, sort and tag the clothes by hand", "staff"],
  ["Clothes are sorted by colour, light and dark", "staff"],
  ["Clothes are washed", "staff"],
  ["Clothes are dried", "staff"],
  ["Once dry, staff sort and bag by tag", "staff"],
  ["Each garment is ironed, stacked and tied into its bag", "staff"],
  ["Bags are placed on racks assigned to each hostel", "staff"],
  ["Students collect their bag from the rack", "student"],
  ["Students check the bag for missing items", "student"],
  ["Students sign the register confirming nothing is missing", "student"],
];

function Walkthrough() {
  return (
    <Section>
      <Eyebrow>evidence</Eyebrow>
      <H2>thirteen steps, eleven of them manual</H2>
      <P>
        Before mapping anything we walked the process end to end and photographed every stage, from
        a bag being filled in a hostel room to the register being signed a week later. Writing it
        out as a sequence made the fragility obvious. A single garment changes hands, piles and
        rooms more than a dozen times, and until the very last step there is no record of it
        anywhere except a handwritten room number.
      </P>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "clamp(16px,2vw,24px)",
          marginTop: 44,
        }}
      >
        <Figure
          src={IMG.collection}
          alt="A student handing over filled laundry bags at the collection table."
          ratio="4 / 3"
        />
        <Figure
          src={IMG.sorting}
          alt="Laundry staff sitting on the floor sorting and tagging clothes by hand."
          ratio="4 / 3"
        />
        <Figure
          src={IMG.ironing}
          alt="A member of staff ironing garments at a table late in the evening."
          ratio="4 / 3"
        />
        <Figure
          src={IMG.racks}
          alt="Two students checking a returned laundry bag against their count at the racks."
          ratio="4 / 3"
        />
      </div>
      <Caption>
        Intake, sorting, ironing and return. Four of the thirteen steps, all of them done by hand.
      </Caption>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(232px,1fr))",
          gap: "1px",
          background: TINT,
          border: `1px solid ${TINT}`,
          marginTop: "clamp(40px,6vw,72px)",
        }}
      >
        {STEPS.map(([label, who], i) => (
          <div
            key={label}
            style={{
              background: PAPER,
              padding: "22px 20px 26px",
              minHeight: 128,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 600,
                fontSize: 13,
                color: who === "student" ? ACCENT : MUTED,
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.5 }}>{label}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 22,
          flexWrap: "wrap",
          marginTop: 18,
          fontFamily: BODY,
          fontSize: 13,
          color: MUTED,
        }}
      >
        <span>
          <span style={{ color: ACCENT }}>■</span> handled by students
        </span>
        <span>
          <span style={{ color: MUTED }}>■</span> handled by laundry staff
        </span>
      </div>

      <div style={{ marginTop: "clamp(40px,6vw,72px)" }}>
        <Figure
          src={IMG.process}
          alt="Photographic walkthrough of the hostel laundry process, from filling the cloth bag through washing, drying, ironing and the final register entry."
          caption="The full documented walkthrough, shot across the collection point, wash floor, drying yard, ironing table and return racks."
        />
      </div>
    </Section>
  );
}

/* =========================== STAKEHOLDERS ========================= */

/**
 * Stakeholder map, rebuilt as vector so it stays sharp at any zoom and
 * picks up ACCENT automatically. Fonts are inherited from the page, which
 * is why this is inline SVG rather than an <img> pointing at a file.
 *
 * Geometry: three rows hanging off a root, plus a fourth row nested under
 * "affected stakeholders" inside the primary branch.
 */

const CARD_W = 310;
const CARD_H = 220;
const CHIP_H = 108;

const SH_ROOT = { cx: 1575, top: 40, w: 560, h: 110, label: "laundry system" };

const SH_TIERS = [
  {
    key: "tertiary",
    label: "tertiary stakeholders",
    cx: 525,
    children: [
      {
        cx: 175,
        title: ["parents and guardians"],
        role: [
          "indirectly concerned with the",
          "hygiene and wellbeing of students,",
          "may shape expectations of",
          "laundry service quality.",
        ],
      },
      {
        cx: 525,
        title: ["resource suppliers"],
        role: [
          "provide essentials like detergent,",
          "water, electricity and laundry",
          "consumables that keep the",
          "system running.",
        ],
      },
      {
        cx: 875,
        title: ["maintenance"],
        role: [
          "responsible for repairing and",
          "servicing laundry machines to",
          "prevent breakdowns and ensure",
          "smooth operation.",
        ],
      },
    ],
  },
  {
    key: "primary",
    label: "primary stakeholders",
    cx: 1575,
    children: [
      {
        cx: 1225,
        title: ["resident assistants", "and student pocs"],
        role: ["report issues upward when", "something breaks."],
      },
      {
        cx: 1575,
        chip: true,
        title: ["affected stakeholders"],
        children: [
          {
            cx: 1225,
            title: ["students"],
            role: [
              "use the laundry service, follow",
              "the rules, live with the system's",
              "outcomes.",
            ],
          },
          {
            cx: 1575,
            title: ["guests and faculty"],
            role: [
              "occasionally use the service,",
              "affected by its efficiency and",
              "availability.",
            ],
          },
          {
            cx: 2275,
            title: ["wardens"],
            role: [
              "oversee the system, approve",
              "policy, keep it running",
              "smoothly.",
            ],
          },
        ],
      },
      {
        cx: 1925,
        title: ["laundry staff"],
        role: [
          "handle collection, logging,",
          "washing, tagging, ironing",
          "and delivery.",
        ],
      },
    ],
  },
  {
    key: "secondary",
    label: "secondary stakeholders",
    cx: 2625,
    children: [
      {
        cx: 2275,
        title: ["warden"],
        role: [
          "supervises hostel operations,",
          "handles escalated laundry issues",
          "and ensures policy compliance.",
        ],
      },
      {
        cx: 2625,
        title: ["administration"],
        role: [
          "sets overall laundry policy,",
          "allocates budget, oversees",
          "vendor and staff contracts",
          "and performance.",
        ],
      },
      {
        cx: 2975,
        title: ["vendors"],
        role: [
          "supply detergent, tags and",
          "laundry bags, and maintain the",
          "machines and equipment.",
        ],
      },
    ],
  },
];

/* Rows */
const ROW_TIER = 400;
const ROW_CARD = 720;
const ROW_SUB = 1120;
const MID_TIER = 260;
const MID_CARD = 610;
const MID_SUB = 970;

/**
 * Orthogonal connector with rounded corners: down from the parent, across
 * the shared rail, then down into the child. The stub above the rail is
 * drawn once by the caller so the strokes never overlap and darken.
 */
function elbow(px, cx, railY, childTop, r = 20) {
  const startY = railY - r;
  if (Math.abs(cx - px) < 1) return `M ${px} ${startY} V ${childTop}`;
  const d = cx > px ? 1 : -1;
  return (
    `M ${px} ${startY}` +
    ` Q ${px} ${railY} ${px + d * r} ${railY}` +
    ` H ${cx - d * r}` +
    ` Q ${cx} ${railY} ${cx} ${railY + r}` +
    ` V ${childTop}`
  );
}

function ShCard({ node, top }) {
  const x = node.cx - CARD_W / 2;
  const titleLines = node.title;
  const titleTop = top + 46;
  return (
    <g>
      <rect
        x={x}
        y={top}
        width={CARD_W}
        height={CARD_H}
        rx={10}
        fill="#ffffff"
        stroke={ACCENT}
        strokeOpacity={0.4}
        strokeWidth={1.5}
      />
      {titleLines.map((line, i) => (
        <text
          key={i}
          x={node.cx}
          y={titleTop + i * 30}
          textAnchor="middle"
          fontFamily={DISPLAY}
          fontWeight="600"
          fontSize="24"
          fill={ACCENT}
        >
          {line}
        </text>
      ))}
      {(node.role || []).map((line, i) => (
        <text
          key={i}
          x={node.cx}
          y={titleTop + titleLines.length * 30 + 26 + i * 25}
          textAnchor="middle"
          fontFamily={BODY}
          fontSize="17"
          fill={MUTED}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function ShChip({ cx, top, w, h, label, size = 26 }) {
  return (
    <g>
      <rect x={cx - w / 2} y={top} width={w} height={h} rx={h / 2 > 26 ? 16 : 8} fill={ACCENT} />
      <text
        x={cx}
        y={top + h / 2 + size / 3}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight="600"
        fontSize={size}
        fill={PAPER}
      >
        {label}
      </text>
    </g>
  );
}

function StakeholderMap() {
  const line = {
    fill: "none",
    stroke: ACCENT,
    strokeOpacity: 0.45,
    strokeWidth: 2,
    markerEnd: "url(#sh-arrow)",
  };
  const stub = { fill: "none", stroke: ACCENT, strokeOpacity: 0.45, strokeWidth: 2 };

  const affected = SH_TIERS[1].children.find((c) => c.chip);
  const affectedBottom = ROW_CARD + CHIP_H;

  return (
    <svg
      viewBox="0 0 3320 1400"
      role="img"
      aria-label="Stakeholder map of the hostel laundry system. The laundry system branches into tertiary, primary and secondary stakeholders. Tertiary holds parents and guardians, resource suppliers and maintenance. Primary holds resident assistants and student POCs, laundry staff, and an affected stakeholders group containing students, guests and faculty, and wardens. Secondary holds the warden, administration and vendors."
      style={{ width: "100%", minWidth: 900, display: "block" }}
    >
      <defs>
        <marker
          id="sh-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ACCENT} fillOpacity={0.45} />
        </marker>
      </defs>

      {/* root */}
      <ShChip cx={SH_ROOT.cx} top={SH_ROOT.top} w={SH_ROOT.w} h={SH_ROOT.h} label={SH_ROOT.label} size={40} />

      {/* root to tiers */}
      <path d={`M ${SH_ROOT.cx} ${SH_ROOT.top + SH_ROOT.h} V ${MID_TIER - 20}`} style={stub} />
      {SH_TIERS.map((t) => (
        <path key={t.key} d={elbow(SH_ROOT.cx, t.cx, MID_TIER, ROW_TIER)} style={line} />
      ))}

      {SH_TIERS.map((t) => (
        <g key={t.key}>
          <ShChip cx={t.cx} top={ROW_TIER} w={470} h={CHIP_H} label={t.label} />

          {/* tier to its children */}
          <path d={`M ${t.cx} ${ROW_TIER + CHIP_H} V ${MID_CARD - 20}`} style={stub} />
          {t.children.map((c) => (
            <path key={c.cx} d={elbow(t.cx, c.cx, MID_CARD, ROW_CARD)} style={line} />
          ))}

          {t.children.map((c) =>
            c.chip ? (
              <ShChip key={c.cx} cx={c.cx} top={ROW_CARD} w={CARD_W} h={CHIP_H} label={c.title[0]} size={23} />
            ) : (
              <ShCard key={c.cx} node={c} top={ROW_CARD} />
            )
          )}
        </g>
      ))}

      {/* affected stakeholders to its own children */}
      <path d={`M ${affected.cx} ${affectedBottom} V ${MID_SUB - 20}`} style={stub} />
      {affected.children.map((c) => (
        <path key={c.cx} d={elbow(affected.cx, c.cx, MID_SUB, ROW_SUB)} style={line} />
      ))}
      {affected.children.map((c) => (
        <ShCard key={c.cx} node={c} top={ROW_SUB} />
      ))}
    </svg>
  );
}

function Stakeholders() {
  return (
    <Section>
      <Eyebrow>who is actually in this</Eyebrow>
      <H2>who the system touches, and who can change it</H2>
      <P>
        Redesigning the flow of clothes meant nothing without understanding the people moving them.
        We ran interviews, site observations and a lot of informal conversation with staff and
        students, then sorted everyone by how much of the system they touch and how much of it they
        can change.
      </P>
      <P>
        The gap between those two things turned out to be the story. Students and laundry staff sit
        closest to the failure and have the least authority over it, while administration sets the
        policy from a distance and rarely sees the pile on the floor. Wardens appear twice on this
        map, once as people affected by the system and once as people governing it, which is exactly
        why complaints stall where they do.
      </P>

      <div
        style={{
          marginTop: 48,
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          width: "100vw",
          maxWidth: "100vw",
          padding: "0 clamp(20px,5vw,64px)",
          boxSizing: "border-box",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 10,
        }}
      >
        <div style={{ maxWidth: 2000, margin: "0 auto" }}>
          <StakeholderMap />
        </div>
      </div>
      <Caption>
        Stakeholder map. Drag sideways on a narrow screen. Everyone affected sits nested inside the
        primary branch, since they experience the system rather than run it.
      </Caption>
    </Section>
  );
}

/* ============================= CLUSTERS =========================== */

const CLUSTERS = [
  {
    n: "01",
    name: "student behaviour and compliance",
    count: 9,
    about:
      "Students are the primary users, so their habits set the load. How many clothes go in, whether the eight item rule is known, whether it is followed, and whether anyone feels any consequence for ignoring it.",
    vars: [
      ["Clothes per student", "Average garments per cycle. Higher numbers overload the system when the limit is not enforced."],
      ["Awareness of clothes limit", "Whether students know the rule exists at all. Many were unaware or unclear."],
      ["Proxy submissions", "Submitting for friends, which breaks limits and erases accountability."],
      ["Trust in the system", "Confidence that clothes come back on time and intact. Low trust drives workarounds."],
    ],
  },
  {
    n: "02",
    name: "laundry process and operations",
    count: 11,
    about:
      "The internal chain, from intake to return. Logging, tagging, washing, drying, ironing and delivery are tightly linked, so an error in any one link surfaces as a failure somewhere else entirely.",
    vars: [
      ["Tagging method", "Paper tags, safety pins, colour codes. Some fall off or get misread."],
      ["Tagging accuracy", "Whether a tag correctly identifies its owner. A major cause of loss."],
      ["Lost clothes rate", "Garments unaccounted for per cycle. The clearest measure of system failure."],
      ["Clothes load per day", "Total daily volume. A mismatch with capacity is a direct cause of strain."],
    ],
  },
  {
    n: "03",
    name: "system design and infrastructure",
    count: 6,
    about:
      "The physical and structural side. How the space is built, how resources are allocated, and how the setup holds under peak load. Bad infrastructure does not just slow things down, it amplifies every other failure.",
    vars: [
      ["Submission system type", "Manual, token based, digital or unstructured. Sets the order of everything after it."],
      ["Laundry room capacity", "Space for sorting, storage, washing and drying. Overcrowding creates bottlenecks."],
      ["Schedule reliability", "Whether pickups and returns follow a fixed schedule."],
      ["Machine maintenance rate", "How often machines are serviced. Low maintenance means frequent breakdowns."],
    ],
  },
  {
    n: "04",
    name: "communication and feedback",
    count: 5,
    about:
      "The exchange of information between students, staff and administration. Unclear rules and weak reporting routes breed confusion and mistrust, and make patterns of failure impossible to detect.",
    vars: [
      ["Rule clarity", "How clearly limits and timelines are communicated. Ambiguity produces accidental violations."],
      ["Staff reporting channels", "Routes for staff to raise problems. Where these are missing, issues go unrecorded."],
      ["Feedback loop strength", "Whether input is gathered and acted on. Strong loops signal responsiveness."],
      ["Status update transparency", "Whether a student can find out where their clothes are."],
    ],
  },
  {
    n: "05",
    name: "system performance metrics",
    count: 5,
    about:
      "The diagnostic dashboard. Where the other clusters hold causes and behaviours, this one holds symptoms, and gives us something to measure an intervention against.",
    vars: [
      ["Average delivery time", "Submission to return. The core service metric."],
      ["Delay frequency", "How often delays occur, signalling recurring bottlenecks."],
      ["Staff satisfaction", "How staff feel about workload, support and recognition."],
      ["Complaint rate", "Complaints raised, which reflects dissatisfaction and whether a channel exists at all."],
    ],
  },
];

function Clusters() {
  const [open, setOpen] = useState("01");
  return (
    <Section>
      <Eyebrow>clustering</Eyebrow>
      <H2>thirty six variables, five clusters</H2>
      <P>
        Listing every variable we could find produced a flat mess. Grouping them into clusters was
        what made the system legible, because it showed which parts of the problem were behavioural,
        which were operational, which were structural, and which were only ever symptoms. Each
        cluster contains variables that either add pressure to the system or release it.
      </P>

      <div style={{ marginTop: 44, borderTop: `1px solid ${TINT}` }}>
        {CLUSTERS.map((c) => {
          const isOpen = open === c.n;
          const rest = c.count - c.vars.length;
          return (
            <div key={c.n} style={{ borderBottom: `1px solid ${TINT}` }}>
              <button
                onClick={() => setOpen(isOpen ? null : c.n)}
                aria-expanded={isOpen}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "26px 0",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "clamp(14px,3vw,32px)",
                  cursor: "pointer",
                  textAlign: "left",
                  color: INK,
                }}
              >
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 600,
                    fontSize: 13,
                    color: isOpen ? ACCENT : MUTED,
                    letterSpacing: "0.08em",
                    flexShrink: 0,
                  }}
                >
                  {c.n}
                </span>
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 600,
                    fontSize: "clamp(18px,2.4vw,27px)",
                    flex: 1,
                    lineHeight: 1.2,
                  }}
                >
                  {c.name}
                </span>
                <span style={{ fontFamily: BODY, fontSize: 13, color: MUTED, flexShrink: 0 }}>
                  {c.count}
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    color: ACCENT,
                    fontSize: 20,
                    lineHeight: 1,
                    flexShrink: 0,
                    transform: isOpen ? "rotate(45deg)" : "none",
                    transition: "transform .35s cubic-bezier(.2,.8,.2,1)",
                  }}
                >
                  +
                </span>
              </button>

              <div
                style={{
                  maxHeight: isOpen ? 1400 : 0,
                  overflow: "hidden",
                  transition: "max-height .6s cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <div style={{ padding: "0 0 36px" }}>
                  <P muted style={{ marginBottom: 28 }}>
                    {c.about}
                  </P>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
                      gap: "22px 32px",
                    }}
                  >
                    {c.vars.map(([name, desc]) => (
                      <div key={name}>
                        <div
                          style={{
                            fontFamily: BODY,
                            fontWeight: 700,
                            fontSize: 14.5,
                            marginBottom: 5,
                          }}
                        >
                          {name}
                        </div>
                        <div
                          style={{ fontFamily: BODY, fontSize: 14, color: MUTED, lineHeight: 1.6 }}
                        >
                          {desc}
                        </div>
                      </div>
                    ))}
                  </div>
                  {rest > 0 ? (
                    <div
                      style={{
                        fontFamily: BODY,
                        fontSize: 13.5,
                        color: MUTED,
                        marginTop: 24,
                        fontStyle: "italic",
                      }}
                    >
                      and {rest} more in this cluster
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "clamp(40px,6vw,72px)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "clamp(16px,2vw,24px)",
          }}
        >
          <Figure
            src={IMG.drying}
            alt="Clothes drying on lines in an open shed, exposed to the weather."
            ratio="4 / 3"
          />
          <Figure
            src={IMG.machines}
            alt="Industrial washing and drying machines on the laundry floor."
            ratio="4 / 3"
          />
        </div>
        <Caption>
          Infrastructure was the cluster with the fewest variables and the most visible consequences.
          Drying happens outdoors, so weather sits directly on the critical path.
        </Caption>
      </div>
    </Section>
  );
}

/* ============================ SYSTEM MAP ========================== */

const EFFECTS = [
  [
    "Delays in pickup and delivery",
    "Traced back to understaffing, weather dependent outdoor drying, unreliable schedules and a load that regularly exceeds capacity.",
  ],
  [
    "Mix ups and misplaced clothes",
    "Traced back to handwritten room number tags that fall off in the wash, manual sorting across shared piles, and rooms that change every semester.",
  ],
  [
    "Poor communication between students and vendors",
    "Traced back to the absence of any structured channel, no status visibility, and no grievance route that either side trusts.",
  ],
];

function SystemMap() {
  return (
    <Section>
      <Eyebrow>system mapping</Eyebrow>
      <H2>drawing it before fixing it</H2>
      <P>
        This stage was deliberately not about solutions. We drew the whole system by hand, on site,
        annotating flows, blocks and loops as we found them rather than as we assumed them. Working
        on paper kept it honest. You cannot quietly tidy a mess when you are drawing it in front of
        the people who live in it.
      </P>

      <div style={{ marginTop: 44 }}>
        <Figure
          src={IMG.systemMap}
          alt="Hand drawn system map of the hostel laundry process with three labelled problem zones."
          caption="The hand drawn system map. Three effect zones surfaced from it: delays in pickup and delivery, clothes getting mixed up and misplaced, and poor communication with vendors."
        />
      </div>

      <div style={{ marginTop: "clamp(48px,7vw,84px)" }}>
        <H3>influence map, effects traced back to causes</H3>
        <P style={{ marginBottom: 34 }}>
          Alongside the visual map we built an influence map to trace each surface complaint back
          through the system to the variables actually producing it. Every effect had more than one
          cause, and most causes sat several steps away from the thing students were annoyed about.
        </P>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "1px",
            background: TINT,
            border: `1px solid ${TINT}`,
          }}
        >
          {EFFECTS.map(([title, body], i) => (
            <div key={title} style={{ background: "#fff", padding: "28px 24px 32px" }}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: 12.5,
                  color: ACCENT,
                  letterSpacing: "0.1em",
                  marginBottom: 14,
                }}
              >
                effect {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: 19,
                  lineHeight: 1.28,
                  marginBottom: 12,
                }}
              >
                {title}
              </div>
              <div style={{ fontFamily: BODY, fontSize: 14.5, color: MUTED, lineHeight: 1.65 }}>
                {body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ===================== SITES AND LEVERAGE POINTS =================== */

const SITES = [
  "The manual logbook used to track clothes",
  "The absence of structured student to vendor communication",
  "The manual tagging system based on room numbers",
  "The lack of reminders for uncollected garments",
  "The eight clothes submission rule and its enforcement",
];

const LEVERAGE = [
  ["Enforce the eight clothes limit through auto return", "Makes the rule self enforcing instead of relying on staff to police it."],
  ["Financial accountability for vendors via a penalty clause", "Puts consequence where the contract already sits."],
  ["A manual complaint logging system", "Creates the first written record of failure the system has ever had."],
  ["Indoor drying infrastructure", "Removes weather from the critical path."],
  ["Increase laundry staff allocation", "Closes the gap between daily load and daily capacity."],
];

function SitesAndLeverage() {
  return (
    <Section>
      <Eyebrow>where to push</Eyebrow>
      <H2>five sites, five leverage points</H2>
      <P>
        Sites of intervention are the places where the system is visibly failing. Leverage points
        are the places where a small, focused push produces disproportionate change. They are not
        the same list, and telling them apart was the most useful thing this project taught me. The
        logbook is where the pain shows. The rule enforcement is where the pressure releases.
      </P>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "clamp(32px,5vw,64px)",
          marginTop: 48,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: BODY,
              fontSize: 11.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: MUTED,
              marginBottom: 20,
            }}
          >
            sites of intervention
          </div>
          {SITES.map((s, i) => (
            <div
              key={s}
              style={{
                display: "flex",
                gap: 16,
                padding: "16px 0",
                borderBottom: `1px solid ${TINT}`,
                fontFamily: BODY,
                fontSize: 15.5,
                lineHeight: 1.55,
              }}
            >
              <span style={{ color: MUTED, fontSize: 12.5, paddingTop: 3, flexShrink: 0 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div>
          <div
            style={{
              fontFamily: BODY,
              fontSize: 11.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: ACCENT,
              marginBottom: 20,
            }}
          >
            leverage points
          </div>
          {LEVERAGE.map(([title, why]) => (
            <div key={title} style={{ padding: "16px 0", borderBottom: `1px solid ${TINT}` }}>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 15.5, lineHeight: 1.45 }}>
                {title}
              </div>
              <div
                style={{ fontFamily: BODY, fontSize: 14, color: MUTED, lineHeight: 1.6, marginTop: 4 }}
              >
                {why}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================= GIGAMAP ============================ */

function Gigamap() {
  const wrap = useRef(null);
  const [zoom, setZoom] = useState(1);
  const drag = useRef({ active: false, x: 0, left: 0 });

  const onDown = (e) => {
    const node = wrap.current;
    if (!node) return;
    const point = e.touches ? e.touches[0].clientX : e.clientX;
    drag.current = { active: true, x: point, left: node.scrollLeft };
  };
  const onMove = (e) => {
    const node = wrap.current;
    if (!node || !drag.current.active) return;
    const point = e.touches ? e.touches[0].clientX : e.clientX;
    node.scrollLeft = drag.current.left - (point - drag.current.x);
  };
  const onUp = () => {
    drag.current.active = false;
  };

  const btn = {
    fontFamily: BODY,
    fontSize: 13.5,
    padding: "9px 16px",
    background: "none",
    border: `1px solid ${TINT}`,
    borderRadius: 3,
    color: INK,
    cursor: "pointer",
    textTransform: "lowercase",
  };

  return (
    <>
      <Section>
        <Eyebrow>the gigamap</Eyebrow>
        <H2>untangling the knots</H2>
        <P>
          The gigamap is the whole project held in one frame. Stakeholders, clusters, causes,
          effects, sites of intervention and leverage points all sit in a single interconnected
          diagram, so you can trace a complaint at the surface all the way down to the variable
          producing it without leaving the page.
        </P>
        <P>
          We built it as a tree threaded through with lines, because that is what the system felt
          like from inside. Not a flowchart with a beginning and an end, but something knotted,
          where pulling one thread tightens three others.
        </P>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
            gap: "1px",
            background: TINT,
            border: `1px solid ${TINT}`,
            margin: "40px 0 34px",
          }}
        >
          {[
            ["roots", "Core variables causing the inefficiencies and delays."],
            ["trunk", "The central flow linking causes to the variables they influence."],
            ["branches", "Variables that are not root causes but still shape the problem."],
          ].map(([k, v]) => (
            <div key={k} style={{ background: PAPER, padding: "24px 22px 28px" }}>
              <H3>{k}</H3>
              <div style={{ fontFamily: BODY, fontSize: 14.5, color: MUTED, lineHeight: 1.6 }}>
                {v}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button style={btn} onClick={() => setZoom((z) => clamp(z + 0.5, 1, 4))}>
            zoom in
          </button>
          <button style={btn} onClick={() => setZoom((z) => clamp(z - 0.5, 1, 4))}>
            zoom out
          </button>
          <a
            href={IMG.gigamap}
            target="_blank"
            rel="noreferrer"
            style={{ ...btn, textDecoration: "none" }}
          >
            open full size
          </a>
          <span style={{ fontFamily: BODY, fontSize: 13, color: MUTED }}>
            drag to move across the map
          </span>
        </div>
      </Section>

      <div
        ref={wrap}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
        style={{
          marginTop: 24,
          overflowX: "auto",
          overflowY: "hidden",
          cursor: "grab",
          background: "#fff",
          borderTop: `1px solid ${TINT}`,
          borderBottom: `1px solid ${TINT}`,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <img
          src={IMG.gigamap}
          alt="Untangling the Knots, the gigamap of the hostel laundry system, showing stakeholders on the left, the central overloaded laundry system tree, and leverage points on the right."
          draggable="false"
          style={{
            display: "block",
            height: `clamp(300px, ${44 * zoom}vw, ${640 * zoom}px)`,
            width: "auto",
            maxWidth: "none",
            transition: "height .45s cubic-bezier(.2,.8,.2,1)",
            userSelect: "none",
          }}
        />
      </div>

      <Section style={{ paddingTop: 18, marginTop: 0 }}>
        <Caption>
          Untangling the Knots. Stakeholders branch out on the left, the overloaded laundry system
          runs through the centre as roots, trunk and branches, and the leverage points sit on the
          right as the points where the system can actually be moved.
        </Caption>
      </Section>
    </>
  );
}

/* ============================ IDEA POOL =========================== */

const IDEAS = [
  ["Full pile returned if over limit", "The system returns everything if more than eight items are submitted. A hard deterrent."],
  ["Student led manual logging", "Students record their own count, introducing a check and balance at intake."],
  ["Manual complaint logbook", "A physical register reviewed by the warden. The first formal grievance route."],
  ["Segregated laundry bags", "Two bags, white and coloured, to cut damage during collective washing."],
  ["RFID tags with WhatsApp updates", "Real time tracking paired with the channel students already use."],
  ["Visual prompts in common areas", "Reminders in high footfall spots to close the gap between intent and action."],
];

function IdeaPool() {
  return (
    <Section>
      <Eyebrow>ideation</Eyebrow>
      <H2>twenty ideas against five sites</H2>
      <P>
        We ideated against the sites of intervention rather than against the complaints, which kept
        the ideas structural instead of cosmetic. Some are technological, some are just a poster in
        the right corridor. Both were worth keeping on the table, because a system this manual can
        be moved by very cheap things.
      </P>

      <div style={{ marginTop: 44 }}>
        <Figure
          src={IMG.solutions}
          alt="Hand drawn possible solutions map, twenty numbered interventions branching from a central node into five sites of intervention."
          caption="The full idea pool, drawn against the five sites of intervention. Six of the twenty are below."
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(248px,1fr))",
          gap: "1px",
          background: TINT,
          border: `1px solid ${TINT}`,
          marginTop: "clamp(40px,6vw,72px)",
        }}
      >
        {IDEAS.map(([title, desc]) => (
          <div key={title} style={{ background: PAPER, padding: "22px 20px 26px" }}>
            <div
              style={{ fontFamily: BODY, fontWeight: 700, fontSize: 15, lineHeight: 1.4, marginBottom: 7 }}
            >
              {title}
            </div>
            <div style={{ fontFamily: BODY, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
              {desc}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ============================ SHORTLIST =========================== */

function Shortlist() {
  const cards = [
    [
      "RFID enabled cloth tagging",
      "Waterproof, heat resistant tags scanned at submission and at return, creating a traceable loop that closes the gap where clothes currently disappear. The system enforces a hard limit of eight items per wash and flags a discrepancy the moment it happens, so the rule stops depending on anyone remembering it.",
    ],
    [
      "Visual cues and reminders for compliance",
      "Rule posters, illustrated instructions and calendar boards placed in hostels, laundry rooms and common areas. The unglamorous half of the pair, and the reason the first half works. Tracking a violation is useless if nobody knew the rule existed.",
    ],
  ];

  return (
    <Section>
      <Eyebrow>shortlisting</Eyebrow>
      <H2>two, chosen to work together</H2>
      <P>
        We shortlisted on feasibility, expected impact, cost and alignment with the leverage points.
        The two that survived are deliberately a pair. One makes the system legible, the other makes
        the rules legible. Either alone would have failed in a predictable way.
      </P>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "clamp(24px,3vw,40px)",
          marginTop: 48,
        }}
      >
        {cards.map(([title, body], i) => (
          <Reveal key={title} delay={i * 90}>
            <div
              style={{
                background: "#fff",
                border: `1px solid ${TINT}`,
                borderTop: `3px solid ${ACCENT}`,
                borderRadius: 0,
                padding: "clamp(26px,3vw,38px)",
                height: "100%",
              }}
            >
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: 12.5,
                  color: ACCENT,
                  letterSpacing: "0.1em",
                  marginBottom: 14,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <H3>{title}</H3>
              <div style={{ fontFamily: BODY, fontSize: 15.5, lineHeight: 1.7, color: MUTED }}>
                {body}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ============================ PROTOTYPE =========================== */

const PROTO_FUNCTIONS = [
  "Scan RFID tags attached to clothing items",
  "Log each garment submitted and returned",
  "Time stamp every transaction",
  "Enforce an eight clothes per load limit",
  "Flag mismatches and repeated scans",
  "Simulate real time logging against a student ID",
];

const FEEDBACK = [
  ["Ease of use", "Simpler, more intuitive and faster than the handwritten method."],
  ["Time saving", "No more writing room numbers and lists into logbooks, cutting intake time per student."],
  ["Error reduction", "Linking tags to student IDs automatically prevents mismatches."],
  ["Lost clothes prevention", "A tag per garment means traceability from submission to delivery."],
  ["Tag durability", "A removable, reusable tag was preferred for maintenance."],
  ["Vendor interest", "The contractor said he would invest if the hostel formally implemented it."],
  ["Scalability", "The model extends to other hostels with similar service structures."],
];

function Prototype() {
  return (
    <Section>
      <Eyebrow>implementation and testing</Eyebrow>
      <H2>we took it back to the man who does the washing</H2>
      <P>
        The prototype started as an RFID scanner on an Arduino Uno and moved to an ESP32 once we
        needed wireless, writing to a live Firebase interface. Abhineet built the technical rig. My
        job was everything around it: getting us onto the laundry floor, running the session,
        documenting what happened and translating what he had built into something a vendor could
        actually judge.
      </P>
      <P>
        That distinction mattered more than I expected. A working scanner proves the technology. It
        does not prove the intervention. The only thing that could do that was standing at the
        intake table and watching whether the person who logs hundreds of garments a week found it
        faster than his pen.
      </P>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
          gap: "1px",
          background: TINT,
          border: `1px solid ${TINT}`,
          margin: "44px 0 clamp(40px,6vw,72px)",
        }}
      >
        {PROTO_FUNCTIONS.map((f, i) => (
          <div key={f} style={{ background: PAPER, padding: "22px 20px 26px" }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 600,
                fontSize: 12.5,
                color: ACCENT,
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.55 }}>{f}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "clamp(16px,2vw,24px)",
        }}
      >
        <Figure
          src={IMG.vendor1}
          alt="The team setting up the Arduino and RFID scanner on a laptop at the laundry site."
          ratio="4 / 3"
        />
        <Figure
          src={IMG.vendor4}
          alt="A hand reaching towards the RFID module wired to a laptop during the trial."
          ratio="4 / 3"
        />
        <Figure
          src={IMG.vendor3}
          alt="The laundry manager trying the RFID scan himself while the team watches."
          ratio="4 / 3"
        />
        <Figure
          src={IMG.vendor2}
          alt="Discussion with the main laundry vendor about feasibility and interest in implementing the system."
          ratio="4 / 3"
        />
      </div>
      <Caption>
        Setup, first scan, the laundry manager running it himself, and the conversation about whether
        he would actually put money into it.
      </Caption>

      <div style={{ marginTop: "clamp(48px,7vw,84px)" }}>
        <H3>what the vendor said</H3>
        <P style={{ marginBottom: 32 }}>
          We walked him through scanning, tagging and logging on the live interface, then handed it
          over and let him use it himself. He was positive, and more specific than we expected.
        </P>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "24px 36px",
          }}
        >
          {FEEDBACK.map(([title, body]) => (
            <div key={title} style={{ borderTop: `1px solid ${TINT}`, paddingTop: 16 }}>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 15, marginBottom: 5 }}>
                {title}
              </div>
              <div style={{ fontFamily: BODY, fontSize: 14.5, color: MUTED, lineHeight: 1.6 }}>
                {body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* =========================== TAG DESIGN =========================== */

const SPECS = [
  ["quantity", "16 reusable tags per student, 8 per laundry bag"],
  ["material", "Waterproof, heat resistant silicone with an embedded chip"],
  ["attachment", "Snap press closure, similar to a badge clip"],
  ["fixing", "No loops, stitching or permanent fixtures"],
  ["cost", "Around ₹15 to ₹30 per tag, ₹200 to ₹300 per student per semester"],
];

function TagDesign() {
  return (
    <Section>
      <Eyebrow>artefact</Eyebrow>
      <H2>the tag had to survive a boiler and an iron</H2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))",
          gap: "clamp(32px,5vw,64px)",
          alignItems: "start",
          marginTop: 40,
        }}
      >
        <div>
          <P>
            Every constraint on this object came from watching the process. It gets washed at high
            temperature, it gets ironed, it gets handled by staff working at speed, and it belongs
            to a student who will lose it if it is fiddly. So the tag is a flexible silicone strip
            with a chip inside and a male snap that clicks into a female snap to close a loop around
            the fabric.
          </P>
          <P muted>
            No sewing, no pinning, no hole in anyone's shirt. On before the bag goes down, off
            before the iron comes out, back on next week.
          </P>

          <div style={{ marginTop: 32 }}>
            {SPECS.map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  gap: 20,
                  padding: "13px 0",
                  borderBottom: `1px solid ${TINT}`,
                  fontFamily: BODY,
                  fontSize: 15,
                  lineHeight: 1.55,
                }}
              >
                <span
                  style={{
                    color: MUTED,
                    fontSize: 11.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    minWidth: 92,
                    paddingTop: 4,
                    flexShrink: 0,
                  }}
                >
                  {k}
                </span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <Figure
          src={IMG.tag}
          alt="Reusable RFID tag design, a flexible silicone strip with an embedded chip closed by a snap button."
          caption="Reusable RFID tag. Flexible silicone strip, embedded chip, snap press closure."
        />
      </div>
    </Section>
  );
}

/* =========================== CONCERNS ============================= */

const CONCERNS = [
  [
    "What does it cost?",
    "Roughly ₹15 to ₹30 per tag, so ₹200 to ₹300 per student per semester. Tags are reusable and only need replacing if lost, so the cost sits in the first semester rather than repeating.",
  ],
  [
    "Why not use stickers, or store bought tags?",
    "Stickers peel in the wash, melt under the iron and damage fabric. Retail RFID tags are not waterproof or heat resistant. Silicone was chosen specifically because the tag has to survive both the boiler and the iron.",
  ],
  [
    "Can one tag cover multiple clothes?",
    "Each tag maps to one item. If a student bundles items under a single tag, they take on the risk for that bundle. That keeps the count honest without the system having to police it.",
  ],
];

function Concerns() {
  const [open, setOpen] = useState(null);
  return (
    <Section>
      <Eyebrow>peer review</Eyebrow>
      <H2>what the room pushed back on</H2>
      <P>
        Presenting to students, hostel residents and faculty produced the sharpest questions of the
        project, mostly about cost, durability and whether the rule could be gamed. Working the
        answers out in public is what turned the proposal from a concept into something with a
        defensible shape.
      </P>

      <div style={{ marginTop: 40, borderTop: `1px solid ${TINT}` }}>
        {CONCERNS.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <div key={q} style={{ borderBottom: `1px solid ${TINT}` }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "22px 0",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 20,
                  cursor: "pointer",
                  textAlign: "left",
                  color: INK,
                  fontFamily: BODY,
                  fontSize: "clamp(15.5px,1.6vw,18px)",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ flex: 1 }}>{q}</span>
                <span
                  aria-hidden="true"
                  style={{
                    color: ACCENT,
                    fontSize: 19,
                    lineHeight: 1,
                    flexShrink: 0,
                    transform: isOpen ? "rotate(45deg)" : "none",
                    transition: "transform .35s cubic-bezier(.2,.8,.2,1)",
                  }}
                >
                  +
                </span>
              </button>
              <div
                style={{
                  maxHeight: isOpen ? 400 : 0,
                  overflow: "hidden",
                  transition: "max-height .5s cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <div
                  style={{
                    fontFamily: BODY,
                    fontSize: 15.5,
                    color: MUTED,
                    lineHeight: 1.7,
                    maxWidth: "62ch",
                    padding: "0 0 26px",
                  }}
                >
                  {a}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* =========================== REFLECTION =========================== */

function Reflection() {
  return (
    <Section>
      <Eyebrow>reflection</Eyebrow>
      <H2>the complaint is never the problem</H2>
      <P>
        Every student in that hostel could tell you the laundry was bad. Not one of us, before this,
        could tell you why. The complaint was always about a specific missing shirt, and the answer
        was always somewhere else entirely: in a staffing ratio, in a paper tag that dissolves at
        sixty degrees, in a rule nobody had ever been told.
      </P>
      <P>
        What systems mapping gave me was the discipline to keep going past the first plausible
        cause. It is genuinely uncomfortable to draw a map for three weeks before you are allowed to
        propose anything. It is also the only reason the proposal was any good, because by the time
        we got to solutions we knew which of them were cosmetic.
      </P>
      <P>
        The other thing I took from it is that the best version of this ends with a person, not a
        prototype. The most useful hour of the whole project was the one spent watching a laundry
        contractor hold our scanner and tell us what was wrong with the tag.
      </P>
    </Section>
  );
}

/* ============================ FULL DECK =========================== */

function FullDeck() {
  const [hover, setHover] = useState(false);
  return (
    <Section>
      <div
        style={{
          background: "#fff",
          border: `1px solid ${TINT}`,
          borderLeft: `3px solid ${ACCENT}`,
          padding: "clamp(30px,4vw,48px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: "clamp(24px,4vw,48px)",
          alignItems: "center",
        }}
      >
        <div>
          <Eyebrow>the full thing</Eyebrow>
          <H3>read the whole document</H3>
          <P muted style={{ margin: 0, fontSize: 15.5 }}>
            Everything on this page, plus the parts that did not survive the edit: all
            thirty six variables written out, the complete idea pool, the stakeholder map
            and the full peer review. Forty seven pages, as submitted.
          </P>
        </div>

        <div>
          <a
            href={IMG.pdf}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              display: "inline-block",
              padding: "14px 30px",
              fontFamily: BODY,
              fontSize: 14.5,
              letterSpacing: "0.03em",
              textDecoration: "none",
              color: hover ? PAPER : ACCENT,
              background: hover ? ACCENT : "transparent",
              border: `1px solid ${hover ? ACCENT : ACCENT + "73"}`,
              borderRadius: 999,
              transition: "background 260ms ease, color 260ms ease, border-color 260ms ease",
            }}
          >
            download the pdf
          </a>
          <div
            style={{
              fontFamily: BODY,
              fontSize: 13,
              color: MUTED,
              marginTop: 14,
            }}
          >
            47 pages, 10 MB
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ============================== PAGE ============================== */

export default function Laundry() {
  useEffect(() => {
    const id = "laundry-fonts";
    if (document.getElementById(id)) return;
    const pre = document.createElement("link");
    pre.rel = "preconnect";
    pre.href = "https://fonts.gstatic.com";
    pre.crossOrigin = "anonymous";
    document.head.appendChild(pre);

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Nunito+Sans:wght@400;600;700&family=Poppins:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div
      style={{
        background: PAPER,
        color: INK,
        fontFamily: BODY,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <TyperStyles />
      <style>{`
        html{scroll-behavior:smooth;}
        body{margin:0;}
        *:focus-visible{outline:2px solid ${ACCENT};outline-offset:3px;}
        button{font:inherit;}
        figure{margin:0;}
      `}</style>

      <Nav />
      <Title />
      <Intro />
      <Walkthrough />
      <ThreadRule />
      <Stakeholders />
      <Clusters />
      <SystemMap />
      <ThreadRule flip />
      <SitesAndLeverage />
      <Gigamap />
      <ThreadRule />
      <IdeaPool />
      <Shortlist />
      <Prototype />
      <TagDesign />
      <ThreadRule flip />
      <Concerns />
      <Reflection />
      <FullDeck />

      <SiteFooter
        tint={ACCENT}
        heading={
          <Typer
            as="h2"
            text="let's connect"
            accent={{ fg: SITE_INK, bg: SITE_PAPER, accent: ACCENT }}
            style={{
              display: "block",
              fontFamily: SITE_DISPLAY,
              fontSize: "clamp(28px, 5.8vw, 68px)",
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              color: SITE_INK,
              margin: 0,
              textTransform: "lowercase",
            }}
          />
        }
      />
    </div>
  );
}
