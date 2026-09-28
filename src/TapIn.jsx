import React, { useState, useEffect, useRef } from "react";
import SiteFooter from "./SiteFooter";

/*
  TapIn.jsx
  A collaborative tool that helps college students navigate group projects
  with more clarity, connection, and confidence. Built end to end in two weeks
  for Semester 6, Interaction Design, mentored by Parag Sarma.

  Shell constants match Portfolio.jsx exactly so the background is seamless
  across the whole site. Only the accent family shifts for this project:
  a sage green sampled from the deck's own geometry.
*/

/* ---- shell constants (fixed across the site) ---- */
const PAPER = "#FCFCFC"; // matches Portfolio.jsx
const INK = "#3E2430"; // deep wine
const MUTED = "#8A6F7C";

/* ---- tapin accent family (sage green) ---- */
const ACCENT = "#6E7E3D"; // sage, deepened for text and headings
const TINT = "#C3CE93"; // soft sage, for pills and fills
const FRAME = "#EEF1DF"; // palest wash, for panels and screen backdrops
const LINE = "#E2E6CD"; // hairline on the wash

const SANS = "'Poppins', system-ui, -apple-system, sans-serif";

/* ------------------------------------------------------------------ */
/* viewport                                                            */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* typer, character reveal on scroll into view                        */
/* ------------------------------------------------------------------ */
function Typer({ text, size, weight = 600, color = INK, as = "h2", once = false }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setOn(true);
            played.current = true;
          } else if (!once && !e.isIntersecting) {
            if (played.current) setOn(false);
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const Tag = as;
  const chars = Array.from(text);
  return (
    <Tag
      ref={ref}
      style={{
        margin: 0,
        fontFamily: SANS,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: "-0.01em",
        color,
        textTransform: "lowercase",
      }}
    >
      {chars.map((c, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            whiteSpace: c === " " ? "pre" : "normal",
            transform: on ? "translateY(0)" : "translateY(0.5em)",
            opacity: on ? 1 : 0,
            transition: `transform 520ms cubic-bezier(.2,.8,.2,1) ${
              i * 26
            }ms, opacity 520ms cubic-bezier(.2,.8,.2,1) ${i * 26}ms`,
          }}
        >
          {c === " " ? "\u00A0" : c}
        </span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* nav, fixed, hides on scroll down, reveals on scroll up             */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* layout primitives                                                  */
/* ------------------------------------------------------------------ */
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

function ThreadRule({ style }) {
  return (
    <div
      aria-hidden
      style={{
        maxWidth: 1180,
        margin: "clamp(64px,9vw,120px) auto 0",
        padding: "0 clamp(20px,5vw,64px)",
        ...style,
      }}
    >
      <div style={{ height: 1, background: LINE }} />
    </div>
  );
}

/* small eyebrow label above section headings */
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

/* body paragraph */
function P({ children, style }) {
  return (
    <p
      style={{
        margin: "0 0 18px",
        fontFamily: SANS,
        fontSize: "clamp(15px,1.15vw,17px)",
        lineHeight: 1.72,
        fontWeight: 400,
        color: INK,
        maxWidth: 720,
        textTransform: "lowercase",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function Pill({ children, solid }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: 500,
        padding: "6px 14px",
        borderRadius: 999,
        textTransform: "lowercase",
        background: solid ? TINT : FRAME,
        color: solid ? "#3f4a1c" : INK,
        border: solid ? "none" : `0.5px solid ${LINE}`,
      }}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* phone screen frame, renders an image or a labelled placeholder     */
/* ------------------------------------------------------------------ */
function Phone({ src, label, w = 250 }) {
  return (
    <figure style={{ margin: 0, width: w, flex: "0 0 auto" }}>
      <div
        style={{
          width: w,
          aspectRatio: "390 / 844",
          borderRadius: 26,
          overflow: "hidden",
          background: FRAME,
          border: `1px solid ${LINE}`,
          boxShadow: "0 18px 40px -28px rgba(62,36,48,0.5)",
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
              fontSize: 13,
              fontWeight: 500,
              color: ACCENT,
              textTransform: "lowercase",
              textAlign: "left",
              padding: "0 18px",
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
            fontSize: 12.5,
            color: MUTED,
            marginTop: 12,
            textTransform: "lowercase",
          }}
        >
          {label}
        </figcaption>
      )}
    </figure>
  );
}

/* horizontal, scrollable row of phones */
function PhoneRow({ children }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "clamp(18px,3vw,34px)",
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

/* ------------------------------------------------------------------ */
/* sections                                                           */
/* ------------------------------------------------------------------ */
function Title() {
  const { isPhone } = useViewport();
  return (
    <Section
      style={{
        paddingTop: isPhone ? 120 : "clamp(150px, 20vh, 240px)",
        paddingBottom: 0,
      }}
    >
      <Kicker>semester 6 · interaction design · 2 weeks</Kicker>
      <Typer
        text="tapin"
        as="h1"
        once
        size="clamp(64px, 13vw, 168px)"
        color={INK}
      />
      <p
        style={{
          margin: "clamp(22px,3vw,34px) 0 0",
          fontFamily: SANS,
          fontSize: "clamp(17px,1.6vw,22px)",
          lineHeight: 1.6,
          fontWeight: 400,
          color: INK,
          maxWidth: 640,
          textTransform: "lowercase",
        }}
      >
        a collaborative tool that helps college students navigate group projects
        with more clarity, connection, and confidence.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: "clamp(28px,4vw,42px)",
        }}
      >
        <Pill solid>research</Pill>
        <Pill>synthesis</Pill>
        <Pill>3 personas</Pill>
        <Pill>problem framing</Pill>
        <Pill>hi-fi prototype</Pill>
      </div>
    </Section>
  );
}

/* two column meta strip */
function Meta() {
  const { isPhone } = useViewport();
  const items = [
    ["role", "solo, end to end"],
    ["timeline", "2 weeks"],
    ["scope", "research to hi-fi prototype"],
    ["tools", "figma"],
    ["mentor", "parag sarma"],
    ["context", "anant national university"],
  ];
  return (
    <Section>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "1fr" : "repeat(3, 1fr)",
          gap: "clamp(20px,3vw,34px)",
        }}
      >
        {items.map(([k, v]) => (
          <div key={k}>
            <p
              style={{
                margin: "0 0 6px",
                fontFamily: SANS,
                fontSize: 12,
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
                fontSize: "clamp(15px,1.3vw,18px)",
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

function Overview() {
  return (
    <Section>
      <Kicker>the short version</Kicker>
      <Typer text="one product, two weeks, start to finish" size="clamp(28px,4vw,46px)" />
      <div style={{ height: "clamp(24px,3vw,36px)" }} />
      <P>
        in college, group projects are meant to prepare students for real teamwork.
        in practice they often collapse into the same pattern: one person over
        works to protect quality, another coasts, and a third stays quiet with
        ideas they never voice. tapin started from that friction and worked toward
        a single question, how do you get everyone in a team to contribute
        meaningfully, whatever their instincts are.
      </P>
      <P>
        i ran the whole process on my own inside a two week window: interviews,
        synthesis, secondary research, three personas with journeys, a problem
        statement, and a full information architecture carried through to hi-fi
        screens.
      </P>
    </Section>
  );
}

function Primary() {
  const { isPhone } = useViewport();
  const solo = [
    "need for control over outcomes, to avoid uncertainty",
    "fear of unpredictable teammates makes solo work feel safer",
    "trust is a precondition, low trust erodes any motivation to collaborate",
    "high personal standards become a source of friction",
    "micromanaging as a coping mechanism when others underperform",
    "ownership as pride, sharing feels like a loss of it",
  ];
  const team = [
    "prefers teams for speed and quality, but only with the right people",
    "wants some control over who is on the team, by skill and work ethic",
    "enjoys the social side, learning from others, shared momentum",
    "learned over time that doing everything alone is inefficient",
    "actively pulls quieter members in by asking for their view",
    "will still work solo on critical parts if the team is not aligning",
  ];
  return (
    <Section>
      <Kicker>primary research</Kicker>
      <Typer text="i started with my own classmates" size="clamp(26px,3.6vw,42px)" />
      <div style={{ height: "clamp(22px,3vw,32px)" }} />
      <P>
        i interviewed fellow students about how they actually behave in group
        work. two clear mindsets came up, so i studied each on its own terms
        rather than flattening them into one average user.
      </P>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr",
          gap: "clamp(20px,3vw,34px)",
          marginTop: 30,
        }}
      >
        {[
          ["those who prefer working alone", solo],
          ["those who prefer working in a team", team],
        ].map(([heading, list]) => (
          <div
            key={heading}
            style={{
              background: FRAME,
              border: `1px solid ${LINE}`,
              borderRadius: 16,
              padding: "clamp(22px,3vw,30px)",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                fontFamily: SANS,
                fontSize: "clamp(16px,1.5vw,19px)",
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
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    color: INK,
                    padding: "8px 0",
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
    </Section>
  );
}

function Affinity() {
  const clusters = [
    "control",
    "lack of trust",
    "fear",
    "behaviour",
    "accountability",
    "ownership",
    "structure",
    "frustration",
    "standards",
    "compromise",
  ];
  return (
    <Section>
      <Kicker>synthesis · affinity mapping</Kicker>
      <Typer text="ten themes underneath the noise" size="clamp(26px,3.6vw,42px)" />
      <div style={{ height: "clamp(22px,3vw,32px)" }} />
      <P>
        i clustered every insight from both mindsets into affinity groups. the
        same tensions kept surfacing on both sides, which told me the problem was
        not solo people versus team people, it was a shared set of anxieties about
        control, trust, and recognition that plays out differently per person.
      </P>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 24,
          maxWidth: 820,
        }}
      >
        {clusters.map((c, i) => (
          <Pill key={c} solid={i % 3 === 0}>
            {c}
          </Pill>
        ))}
      </div>
    </Section>
  );
}

function Secondary() {
  const { isPhone } = useViewport();
  const blocks = [
    [
      "why teamwork matters",
      "universities build teamwork into their curricula because it is tied to academic and professional achievement. group work develops communication, problem solving, and collaboration.",
    ],
    [
      "what gets in the way",
      "the common barriers are consistent: weak collaborative skills, free riding, competence status, low trust, and skill mismatches between members.",
    ],
    [
      "what actually helps",
      "clear expectations, guided team building stages, and structured opportunities to build trust and communication improve how teams work together.",
    ],
    [
      "the indian context",
      "teamwork is recognised across the indian education system, yet a significant share of indian workers report difficulty with it, which points to a gap worth closing during education.",
    ],
  ];
  return (
    <Section>
      <Kicker>secondary research</Kicker>
      <Typer text="checking my read against the field" size="clamp(26px,3.6vw,42px)" />
      <div style={{ height: "clamp(22px,3vw,32px)" }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr",
          gap: "clamp(18px,2.6vw,28px)",
          marginTop: 8,
        }}
      >
        {blocks.map(([h, b]) => (
          <div key={h}>
            <h3
              style={{
                margin: "0 0 10px",
                fontFamily: SANS,
                fontSize: "clamp(16px,1.5vw,19px)",
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
                fontSize: 15,
                lineHeight: 1.68,
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

/* persona block */
function Persona({ name, tag, quote, bio, drivers, hmw, index }) {
  const { isPhone } = useViewport();
  return (
    <div style={{ marginTop: index === 0 ? 30 : "clamp(48px,7vw,88px)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "1fr" : "minmax(0,1fr) minmax(0,1.1fr)",
          gap: "clamp(22px,3.4vw,46px)",
          alignItems: "start",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 6px",
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            persona {index + 1}
          </p>
          <h3
            style={{
              margin: "0 0 4px",
              fontFamily: SANS,
              fontSize: "clamp(24px,3vw,34px)",
              fontWeight: 600,
              color: INK,
              textTransform: "lowercase",
            }}
          >
            {name}
          </h3>
          <p
            style={{
              margin: "0 0 18px",
              fontFamily: SANS,
              fontSize: 14,
              color: MUTED,
              textTransform: "lowercase",
            }}
          >
            {tag}
          </p>
          <blockquote
            style={{
              margin: 0,
              paddingLeft: 16,
              borderLeft: `2px solid ${TINT}`,
              fontFamily: SANS,
              fontSize: "clamp(16px,1.6vw,20px)",
              lineHeight: 1.5,
              fontWeight: 500,
              color: ACCENT,
              textTransform: "lowercase",
            }}
          >
            {quote}
          </blockquote>
        </div>

        <div>
          <p
            style={{
              margin: "0 0 18px",
              fontFamily: SANS,
              fontSize: 15.5,
              lineHeight: 1.7,
              color: INK,
              textTransform: "lowercase",
            }}
          >
            {bio}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {drivers.map((d) => (
              <span
                key={d}
                style={{
                  fontFamily: SANS,
                  fontSize: 12.5,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: FRAME,
                  border: `0.5px solid ${LINE}`,
                  color: INK,
                  textTransform: "lowercase",
                }}
              >
                {d}
              </span>
            ))}
          </div>
          <div
            style={{
              background: FRAME,
              border: `1px solid ${LINE}`,
              borderRadius: 14,
              padding: "18px 20px",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontFamily: SANS,
                fontSize: 11.5,
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
                fontSize: 15,
                lineHeight: 1.6,
                color: INK,
                textTransform: "lowercase",
              }}
            >
              {hmw}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Personas() {
  const people = [
    {
      name: "reet kapoor",
      tag: "interaction design student, the over controller",
      quote: "if it is not done my way, it is not done right.",
      bio:
        "reet delivers high quality work and takes on too much to keep control of it. capable but prone to burnout, she resents teammates who do not contribute equally and struggles to delegate because she fears the result will not meet her standard.",
      drivers: ["control", "high standards", "burnout", "reluctant to delegate"],
      hmw:
        "set clear roles from the start, so reet does not feel she has to take over tasks to protect quality.",
    },
    {
      name: "meher singh",
      tag: "media studies student, the coaster",
      quote: "i will do my part if they tell me what to do.",
      bio:
        "meher is easygoing and does the bare minimum. she has grown used to being a passive contributor because teammates usually take over, which lets her coast. she stays under the radar and avoids confrontation about her lack of input.",
      drivers: ["low effort", "avoids conflict", "under the radar", "disconnected"],
      hmw:
        "make each member's tasks visible, so contribution is clear and meher's participation becomes necessary rather than optional.",
    },
    {
      name: "varun mishra",
      tag: "visual communication student, the quiet one",
      quote: "i have ideas, but what if they don't like them?",
      bio:
        "varun prefers working alone to avoid conflict and pressure. he is often overlooked in groups and struggles to assert his ideas, fearing judgment. he only contributes when asked directly and feels safer taking a backseat.",
      drivers: ["fear of judgment", "overlooked", "quiet", "wants a safe space"],
      hmw:
        "let quieter members share ideas without the pressure of speaking up in front of everyone, so varun feels safe to contribute.",
    },
  ];
  return (
    <Section>
      <Kicker>three ways the problem shows up</Kicker>
      <Typer text="reet, meher, and varun" size="clamp(28px,4vw,46px)" />
      <div style={{ height: "clamp(18px,2.4vw,26px)" }} />
      <P>
        the same underlying tension produces three very different people. framing
        it through all three kept the solution honest, it had to work for the one
        who does too much, the one who does too little, and the one who holds
        back.
      </P>
      {people.map((p, i) => (
        <Persona key={p.name} index={i} {...p} />
      ))}
    </Section>
  );
}

function Problem() {
  return (
    <Section>
      <div
        style={{
          background: ACCENT,
          borderRadius: 20,
          padding: "clamp(34px,5vw,64px)",
        }}
      >
        <p
          style={{
            margin: "0 0 18px",
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#EEF1DF",
          }}
        >
          problem statement
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: SANS,
            fontSize: "clamp(22px,3.4vw,40px)",
            lineHeight: 1.3,
            fontWeight: 600,
            color: PAPER,
            textTransform: "lowercase",
            maxWidth: 900,
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

function Solution() {
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
      <Kicker>the solution</Kicker>
      <Typer text="tapin" size="clamp(40px,7vw,84px)" />
      <div style={{ height: "clamp(20px,2.6vw,30px)" }} />
      <P>
        tapin creates a safe space for students to understand their teammates,
        express themselves, and contribute meaningfully, through personalised
        icebreakers, team habit building prompts, and reflection tools. the aim is
        simple, make teamwork less awkward and more intentional.
      </P>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "1fr" : "repeat(3, 1fr)",
          gap: "clamp(16px,2.4vw,26px)",
          marginTop: 30,
        }}
      >
        {pillars.map(([h, b], i) => (
          <div
            key={h}
            style={{
              background: FRAME,
              border: `1px solid ${LINE}`,
              borderRadius: 16,
              padding: "clamp(22px,3vw,28px)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: TINT,
                color: "#3f4a1c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 16,
              }}
            >
              {i + 1}
            </div>
            <h3
              style={{
                margin: "0 0 8px",
                fontFamily: SANS,
                fontSize: 17,
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
                fontSize: 14.5,
                lineHeight: 1.62,
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

/* information architecture, placeholder image slot */
function IA() {
  return (
    <Section>
      <Kicker>information architecture</Kicker>
      <Typer text="how the app is organised" size="clamp(26px,3.6vw,42px)" />
      <div style={{ height: "clamp(22px,3vw,32px)" }} />
      <P>
        five spaces hold the product together: home, icebreakers, community,
        projects, and profile. each maps to a moment in the group work arc, from
        meeting your team to reflecting once the project ships.
      </P>
      <div
        style={{
          marginTop: 22,
          background: FRAME,
          border: `1px solid ${LINE}`,
          borderRadius: 16,
          aspectRatio: "16 / 8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        {/* swap for the IA export, e.g. <img src="/tapin-ia.png" ... /> */}
        <span
          style={{
            fontFamily: SANS,
            fontSize: 14,
            color: ACCENT,
            textTransform: "lowercase",
          }}
        >
          information architecture diagram goes here
        </span>
      </div>
    </Section>
  );
}

/* hi-fi screens, grouped by flow. labels double as placeholders
   until the real exports are dropped into public/ */
function Screens() {
  const groups = [
    [
      "onboarding and setup",
      "students set up a profile, pick their strengths, and land on a home that shows ongoing projects and recommended icebreakers.",
      [
        ["onboarding 1", null],
        ["onboarding 2", null],
        ["select your strengths", null],
        ["home", null],
      ],
    ],
    [
      "building a team",
      "start a project, choose teammates by complementary skills, and open a group chat, so the team forms with intention rather than by default.",
      [
        ["enter project details", null],
        ["choose your teammates", null],
        ["community", null],
        ["group chat", null],
      ],
    ],
    [
      "icebreakers",
      "light games like spy and guess the liar lower the social barrier and give quieter members an easy first contribution.",
      [
        ["icebreakers", null],
        ["guess the liar", null],
      ],
    ],
    [
      "contribution and feedback",
      "personal contribution views and peer feedback make effort visible and recognised, the core of the problem statement.",
      [
        ["personal contribution", null],
        ["feedback for a teammate", null],
        ["notifications", null],
        ["profile", null],
      ],
    ],
  ];
  return (
    <Section>
      <Kicker>hi-fi screens</Kicker>
      <Typer text="the product, screen by screen" size="clamp(26px,3.6vw,42px)" />
      <div style={{ height: "clamp(12px,2vw,20px)" }} />
      {groups.map(([h, b, screens], gi) => (
        <div key={h} style={{ marginTop: gi === 0 ? 26 : "clamp(40px,6vw,72px)" }}>
          <h3
            style={{
              margin: "0 0 8px",
              fontFamily: SANS,
              fontSize: "clamp(18px,1.8vw,22px)",
              fontWeight: 600,
              color: INK,
              textTransform: "lowercase",
            }}
          >
            {h}
          </h3>
          <p
            style={{
              margin: "0 0 6px",
              fontFamily: SANS,
              fontSize: 15,
              lineHeight: 1.66,
              color: MUTED,
              maxWidth: 720,
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

function Reflection() {
  return (
    <Section>
      <Kicker>reflection</Kicker>
      <Typer text="what two weeks taught me" size="clamp(26px,3.6vw,42px)" />
      <div style={{ height: "clamp(22px,3vw,32px)" }} />
      <P>
        the constraint was the point. two weeks forced me to move from interviews
        to a defensible problem statement fast, and to trust synthesis instead of
        gathering endlessly. building for three opposite personas kept the concept
        from bending toward any one type of student.
      </P>
      <P>
        if i took this further, i would test the icebreakers and the contribution
        views with real teams mid project, the two features that carry the most
        weight against the problem statement, and see whether visible contribution
        actually shifts behaviour rather than just measuring it.
      </P>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                               */
/* ------------------------------------------------------------------ */
export default function TapIn() {
  return (
    <main
      style={{
        background: PAPER,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Nav />
      <Title />
      <Meta />
      <ThreadRule />
      <Overview />
      <ThreadRule />
      <Primary />
      <Affinity />
      <Secondary />
      <ThreadRule />
      <Personas />
      <ThreadRule />
      <Problem />
      <Solution />
      <IA />
      <Screens />
      <ThreadRule />
      <Reflection />
      <div style={{ height: "clamp(60px,8vw,110px)" }} />
      <SiteFooter tint={ACCENT} heading="let's tap in" />
    </main>
  );
}
