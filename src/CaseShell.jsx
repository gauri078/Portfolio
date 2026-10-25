import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * CaseShell, the shared frame for every case study.
 *
 * Borrowed structure: a sticky sidebar that holds the project facts (role,
 * timeline, team) and a contents list that tracks where you are, so a long
 * page always shows its own shape. On narrower screens the sidebar folds into
 * a meta strip under the title and the contents list goes away.
 *
 * Each page passes its own theme, so the frame wears that page's accent and
 * typefaces instead of imposing one look across the site.
 *
 *   theme     { ink, muted, accent, line, paper, display, body }
 *   name      short project name for the sidebar
 *   meta      [[label, value], ...]
 *   sections  [{ id, label }, ...]  ids must exist on the page
 *   header    the page title block, rendered at the top of the main column
 *   top       how far below the viewport top the sidebar sticks (clear any nav)
 */

const WIDE = 1100;

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const read = () => setWide(window.innerWidth >= WIDE);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return wide;
}

function jump(id, offset) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
}

function MetaList({ theme, meta, columns }) {
  return (
    <dl
      style={{
        margin: 0,
        display: "grid",
        gridTemplateColumns: columns || "1fr",
        gap: columns ? "18px 28px" : 16,
      }}
    >
      {meta.map(([label, value]) => (
        <div key={label} style={{ minWidth: 0 }}>
          <dt
            style={{
              fontFamily: theme.body,
              fontSize: 10.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: theme.muted,
              marginBottom: 4,
            }}
          >
            {label}
          </dt>
          <dd
            style={{
              margin: 0,
              fontFamily: theme.body,
              fontSize: columns ? 15 : 13,
              lineHeight: 1.5,
              color: theme.ink,
              whiteSpace: "pre-line",
            }}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CaseLayout({ theme, name, meta, sections, header, children, top = 40 }) {
  const wide = useWide();
  const mainRef = useRef(null);
  const [active, setActive] = useState(sections[0] && sections[0].id);
  const [progress, setProgress] = useState(0);

  // The sidebar never scrolls on its own. If the facts and the contents do not
  // both fit the window height, the facts move under the title instead.
  const stickyRef = useRef(null);
  const fullHeight = useRef(0);
  const [roomy, setRoomy] = useState(true);
  useLayoutEffect(() => {
    if (!wide) return undefined;
    const measure = () => {
      if (stickyRef.current && roomy) fullHeight.current = stickyRef.current.scrollHeight;
      setRoomy(fullHeight.current + top + 16 <= window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [wide, roomy, top]);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const main = mainRef.current;
      if (!main) return;
      const box = main.getBoundingClientRect();
      const span = Math.max(1, box.height - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, -box.top / span)));
      const line = window.innerHeight * 0.35;
      let current = sections[0] && sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  const strip = (
    <div
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "clamp(28px,5vw,40px) clamp(20px,6vw,72px) 0",
      }}
    >
      <div style={{ borderTop: `1px solid ${theme.line}`, paddingTop: 22 }}>
        <MetaList theme={theme} meta={meta} columns="repeat(auto-fit, minmax(150px, 1fr))" />
      </div>
    </div>
  );

  if (!wide) {
    return (
      <div ref={mainRef}>
        {header}
        {strip}
        {children}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "236px minmax(0, 1fr)" }}>
      <aside style={{ position: "relative" }}>
        <div
          ref={stickyRef}
          style={{
            position: "sticky",
            top,
            padding: "0 12px 0 clamp(24px, 2.6vw, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <a
            href="/#work"
            style={{ fontFamily: theme.body, fontSize: 13, color: theme.muted, textDecoration: "none" }}
          >
            ← back to work
          </a>
          <div style={{ fontFamily: theme.display, fontSize: 19, fontWeight: 600, color: theme.ink, lineHeight: 1.15 }}>
            {name}
          </div>
          {roomy ? <MetaList theme={theme} meta={meta} /> : null}
          <div style={{ height: 1, background: theme.line }} />
          <nav aria-label="Contents">
            <div
              style={{
                fontFamily: theme.body,
                fontSize: 10.5,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: theme.muted,
                marginBottom: 10,
              }}
            >
              contents
            </div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 2 }}>
              {sections.map((s) => {
                const on = s.id === active;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        jump(s.id, top);
                      }}
                      aria-current={on ? "true" : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "5px 0",
                        fontFamily: theme.body,
                        fontSize: 13.5,
                        color: on ? theme.ink : theme.muted,
                        textDecoration: "none",
                        transition: "color 200ms ease",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: on ? 22 : 12,
                          height: 1,
                          background: on ? theme.accent : theme.line,
                          transition: "width 240ms ease, background 240ms ease",
                          flex: "0 0 auto",
                        }}
                      />
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <div style={{ flex: 1, height: 2, background: theme.line, borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.round(progress * 100)}%`,
                  height: "100%",
                  background: theme.accent,
                }}
              />
            </div>
            <span
              style={{
                fontFamily: theme.body,
                fontSize: 11,
                color: theme.muted,
                fontVariantNumeric: "tabular-nums",
                minWidth: 30,
                textAlign: "right",
              }}
            >
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
      </aside>
      <div ref={mainRef} style={{ minWidth: 0 }}>
        {header}
        {roomy ? null : strip}
        {children}
      </div>
    </div>
  );
}

/* Numbered section label with a hairline, e.g. "02  THE PROCESS ————" */
export function StepLabel({ theme, n, children, style }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 18,
        fontFamily: theme.body,
        fontSize: 12,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: theme.accent,
        ...style,
      }}
    >
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{n}</span>
      <span>{children}</span>
      <span aria-hidden="true" style={{ flex: 1, height: 1, background: theme.line, minWidth: 24 }} />
    </div>
  );
}

/* The problem in one sentence, then the question it turns into. */
export function ProblemCard({ theme, label = "the problem", statement, hmw, hmwLabel = "how might we", style }) {
  return (
    <div
      style={{
        borderLeft: `2px solid ${theme.accent}`,
        padding: "6px 0 6px clamp(18px, 2.4vw, 30px)",
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: theme.body,
          fontSize: 12,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: theme.muted,
          marginBottom: 14,
        }}
      >
        {label}
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: theme.display,
          fontWeight: 500,
          fontSize: "clamp(23px, 3vw, 36px)",
          lineHeight: 1.22,
          letterSpacing: "-0.01em",
          color: theme.ink,
          maxWidth: "26ch",
          textWrap: "balance",
        }}
      >
        {statement}
      </p>
      {hmw ? (
        <p
          style={{
            margin: "clamp(16px, 2vw, 22px) 0 0",
            fontFamily: theme.body,
            fontSize: "clamp(15.5px, 1.5vw, 18px)",
            lineHeight: 1.55,
            color: theme.muted,
            maxWidth: "52ch",
          }}
        >
          <strong style={{ color: theme.ink, fontWeight: 600 }}>{hmwLabel}</strong> {hmw}
        </p>
      ) : null}
    </div>
  );
}

/* A row of big numbers. Every value should be a real figure from the work. */
export function StatRow({ theme, stats, style }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "clamp(22px, 3vw, 36px)",
        borderTop: `1px solid ${theme.line}`,
        paddingTop: "clamp(22px, 3vw, 30px)",
        ...style,
      }}
    >
      {stats.map(([value, label]) => (
        <div key={label} style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: theme.display,
              fontWeight: 600,
              fontSize: "clamp(28px, 3.4vw, 46px)",
              lineHeight: 1,
              whiteSpace: "nowrap",
              letterSpacing: "-0.02em",
              color: theme.accent,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontFamily: theme.body,
              fontSize: 14,
              lineHeight: 1.5,
              color: theme.muted,
              marginTop: 10,
              maxWidth: "24ch",
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* One key learning, set large, with an optional line or two under it. */
export function KeyLearning({ theme, quote, children, style }) {
  return (
    <figure style={{ margin: 0, ...style }}>
      <blockquote
        style={{
          margin: 0,
          fontFamily: theme.display,
          fontWeight: 500,
          fontSize: "clamp(26px, 3.8vw, 46px)",
          lineHeight: 1.16,
          letterSpacing: "-0.015em",
          color: theme.ink,
          maxWidth: "22ch",
          textWrap: "balance",
        }}
      >
        <span style={{ color: theme.accent }}>“</span>
        {quote}
        <span style={{ color: theme.accent }}>”</span>
      </blockquote>
      {children ? (
        <figcaption
          style={{
            marginTop: "clamp(18px, 2.4vw, 26px)",
            fontFamily: theme.body,
            fontSize: "clamp(15px, 1.4vw, 17px)",
            lineHeight: 1.7,
            color: theme.muted,
            maxWidth: "58ch",
          }}
        >
          {children}
        </figcaption>
      ) : null}
    </figure>
  );
}
