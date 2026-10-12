import { useState, useEffect, useRef } from "react";
import { PortableText } from "@portabletext/react";
import SiteFooter from "./SiteFooter";
import { Typer, TyperStyles, useViewport, PAPER, INK, MUTED, PINK, BLUSH, DISPLAY, BODY, SHELL } from "./Portfolio.jsx";
import { sanity, imageUrl, CASE_STUDY_QUERY } from "./sanity";

/**
 * CaseStudy, the one page every new Sanity project uses at /work/<slug>.
 *
 * Built from the same shell as the coded case studies: paper, wine ink,
 * Poppins, the Typer reveal on headings, the hide-on-scroll nav, a loose
 * thread as a rule, and the shared orchid footer. Only the accent family
 * changes per project, picked in the Studio from the three the site already
 * uses. DriverBen, Laundry and TapIn are not touched by anything here.
 *
 * Content is whatever blocks were added in the Studio, rendered in order.
 */

/* ============================ ACCENTS ============================ */
// Sampled from the existing pages: rose from the home page, indigo from
// laundry, sage from tapin. TINT is the hairline, FRAME the palest wash.
const ACCENTS = {
  rose: { ACCENT: PINK, TINT: BLUSH, FRAME: "#FBF1F5", footerTint: undefined },
  indigo: { ACCENT: "#4C5FA8", TINT: "#DEE1EC", FRAME: "#EDEFF6", footerTint: "#4C5FA8" },
  sage: { ACCENT: "#6E7E3D", TINT: "#C3CE93", FRAME: "#EEF1DF", footerTint: "#6E7E3D" },
};

/* ============================ TYPE ============================ */
const H1 = { display: "block", fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(48px, 11vw, 140px)", lineHeight: 0.98, letterSpacing: "-0.03em", color: INK, margin: "16px 0 0" };
const H2 = { display: "block", fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(28px, 5vw, 60px)", lineHeight: 1.02, letterSpacing: "-0.02em", color: INK, margin: "clamp(36px,5vw,64px) 0 0" };
const H3 = { fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(20px, 2.4vw, 26px)", lineHeight: 1.2, letterSpacing: "-0.01em", color: INK, margin: "32px 0 0" };
const PARA = { fontFamily: BODY, fontWeight: 300, fontSize: "clamp(15px, 1.6vw, 17px)", lineHeight: 1.7, color: INK, margin: "16px 0 0", maxWidth: 640 };
const CAPTION = { fontFamily: BODY, fontWeight: 300, fontSize: 13, color: MUTED, margin: "10px 0 0" };
const LABEL = { margin: "0 0 6px", fontFamily: BODY, fontSize: 12, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED };

// Typer colours for this page's accent.
const typerVars = (a) => ({ "--typer-accent": a.ACCENT, "--typer-accent-ink": PAPER });

/* ============================= NAV ============================= */
// Same nav as the coded case studies: links back to the home page, hides on
// scroll down and reappears on scroll up.

function NavItem({ label, href, compact, accent }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ fontFamily: BODY, fontSize: compact ? 12.5 : 15, fontWeight: 400, letterSpacing: "0.02em", color: hover ? accent : INK, textDecoration: "none", transition: "color 250ms ease", lineHeight: 1.2, whiteSpace: "nowrap" }}
    >
      {label}
    </a>
  );
}

function Nav({ accent }) {
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
      else if (Math.abs(delta) > 6) setShown(delta < 0); // up reveals, down hides
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
      <NavItem label="gauri" href="/" compact={isPhone} accent={accent} />
      <NavItem label="about" href="/#about" compact={isPhone} accent={accent} />
      <NavItem label="work" href="/#work" compact={isPhone} accent={accent} />
      <NavItem label="contact" href="#contact" compact={isPhone} accent={accent} />
    </nav>
  );
}

/* ============================ PIECES ============================ */

/* A loose thread, drawn once, as on the laundry page. */
function ThreadRule({ a, flip = false }) {
  return (
    <div style={{ margin: "clamp(48px,7vw,96px) 0" }} aria-hidden="true">
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ width: "100%", height: 34, display: "block", transform: flip ? "scaleX(-1)" : "none" }}>
        <path d="M0 22 C 140 6, 232 34, 372 20 S 620 4, 742 24 S 980 34, 1200 14" fill="none" stroke={a.TINT} strokeWidth="1.6" />
        <path d="M0 22 C 140 6, 232 34, 372 20" fill="none" stroke={a.ACCENT} strokeWidth="1.6" opacity="0.5" />
        <circle cx="372" cy="20" r="3" fill={a.ACCENT} />
      </svg>
    </div>
  );
}

/**
 * One Sanity image. Width and height come from the file, so the space is
 * reserved before it loads. `ratio` crops to a shape around the focal point
 * chosen in the Studio (used by the banner and the gallery tiles).
 */
function Figure({ value, a, ratio, width = 1600, radius = 14, caption = true, sizes }) {
  if (!value?.asset) return null;
  const dims = value.asset.metadata?.dimensions;
  let src;
  let w = dims?.width;
  let h = dims?.height;
  if (ratio) {
    src = imageUrl(value).width(width).height(Math.round(width / ratio)).fit("crop").url();
    w = width;
    h = Math.round(width / ratio);
  } else {
    src = imageUrl(value).width(width).fit("max").url();
  }
  const srcSet = [640, 1000, 1600, 2400]
    .filter((x) => x <= Math.max(width, 640))
    .map((x) => {
      const u = ratio ? imageUrl(value).width(x).height(Math.round(x / ratio)).fit("crop") : imageUrl(value).width(x).fit("max");
      return `${u.url()} ${x}w`;
    })
    .join(", ");
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ borderRadius: radius, overflow: "hidden", border: radius ? `1px solid ${a.TINT}` : "none", background: a.FRAME }}>
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes || "(max-width: 1080px) 100vw, 1080px"}
          width={w}
          height={h}
          alt={value.alt || ""}
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "auto", display: "block", ...(ratio ? { aspectRatio: String(ratio), objectFit: "cover" } : null) }}
        />
      </div>
      {caption && value.caption ? <figcaption style={CAPTION}>{value.caption}</figcaption> : null}
    </figure>
  );
}

/* Rich text: paragraphs, two heading sizes, bold, italic, links. */
function textComponents(a) {
  return {
    block: {
      normal: ({ children }) => <p style={PARA}>{children}</p>,
      h2: ({ value, children }) => <Typer as="h2" text={plain(value)} style={{ ...H2, ...typerVars(a) }} />,
      h3: ({ children }) => <h3 style={H3}>{children}</h3>,
    },
    marks: {
      strong: ({ children }) => <strong style={{ fontWeight: 500 }}>{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      link: ({ value, children }) => {
        const href = value?.href || "#";
        const external = /^https?:/.test(href);
        return (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            style={{ color: a.ACCENT, textDecoration: "none", borderBottom: `1px solid ${a.TINT}` }}
          >
            {children}
          </a>
        );
      },
    },
    // The Studio has lists switched off; render any stray one as plain text.
    list: ({ children }) => <div>{children}</div>,
    listItem: ({ children }) => <p style={PARA}>{children}</p>,
  };
}

// Headings type themselves in with Typer, which needs plain text.
function plain(block) {
  return (block?.children || []).map((c) => c.text).join("");
}

function RichText({ value, a }) {
  if (!Array.isArray(value)) return null;
  return <PortableText value={value} components={textComponents(a)} />;
}

/* ============================ BLOCKS ============================ */
// One renderer per block type in the Studio. Each sits in the page column,
// apart from the full-width image, which runs edge to edge.

function Column({ children, wide = false }) {
  return <div style={{ ...SHELL, ...(wide ? { maxWidth: 1240 } : null) }}>{children}</div>;
}

const BLOCK_GAP = "clamp(40px,6vw,72px)";

function SideBySide({ block, a, imageFirst }) {
  const { isPhone } = useViewport();
  const image = <Figure value={block.image} a={a} width={1200} sizes="(max-width: 640px) 100vw, 540px" />;
  const text = <div style={{ alignSelf: "center" }}><RichText value={block.body} a={a} /></div>;
  return (
    <Column>
      <div style={{ display: "grid", gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr", gap: isPhone ? 28 : "clamp(32px,5vw,64px)", alignItems: "start" }}>
        {/* On phones the image always comes first, so the layouts read the same. */}
        {imageFirst || isPhone ? <>{image}{text}</> : <>{text}{image}</>}
      </div>
    </Column>
  );
}

const SPACE = { small: "clamp(16px,2vw,24px)", medium: "clamp(40px,6vw,72px)", large: "clamp(80px,12vw,140px)" };

function Block({ block, a, index }) {
  const { isPhone } = useViewport();
  switch (block._type) {
    case "richText":
      return <Column><RichText value={block.body} a={a} /></Column>;

    case "singleImage":
      return <Column><Figure value={block.image} a={a} /></Column>;

    case "fullWidthImage":
      return (
        <div>
          <Figure value={block.image} a={a} ratio={block.crop === "banner" ? 2.6 : undefined} width={2400} radius={0} caption={false} sizes="100vw" />
          {block.image?.caption ? <Column><p style={CAPTION}>{block.image.caption}</p></Column> : null}
        </div>
      );

    case "imagePair":
      return (
        <Column wide>
          <div style={{ display: "grid", gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr", gap: isPhone ? 20 : "clamp(16px,2.4vw,28px)", alignItems: "start" }}>
            <Figure value={block.left} a={a} width={1200} sizes="(max-width: 640px) 100vw, 600px" />
            <Figure value={block.right} a={a} width={1200} sizes="(max-width: 640px) 100vw, 600px" />
          </div>
        </Column>
      );

    case "imageGallery": {
      const cols = isPhone ? 1 : Math.min(block.columns || 3, 3);
      return (
        <Column wide>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "clamp(12px,1.8vw,20px)" }}>
            {(block.images || []).map((img) => (
              <Figure key={img._key} value={img} a={a} ratio={4 / 3} width={900} radius={12} sizes={`(max-width: 640px) 100vw, ${Math.round(1240 / cols)}px`} />
            ))}
          </div>
        </Column>
      );
    }

    case "imageText":
      return <SideBySide block={block} a={a} imageFirst />;

    case "textImage":
      return <SideBySide block={block} a={a} imageFirst={false} />;

    case "pullQuote":
      return (
        <Column>
          <blockquote style={{ margin: 0, padding: "clamp(28px,4vw,44px) clamp(24px,4vw,48px)", background: a.FRAME, borderLeft: `3px solid ${a.ACCENT}`, borderRadius: "0 14px 14px 0" }}>
            <p style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: "clamp(22px,3vw,34px)", lineHeight: 1.3, letterSpacing: "-0.01em", color: INK, margin: 0, maxWidth: 820 }}>
              {block.quote}
            </p>
            {block.attribution ? (
              <footer style={{ fontFamily: BODY, fontWeight: 400, fontSize: 13, letterSpacing: "0.06em", color: a.ACCENT, marginTop: 18 }}>
                {block.attribution}
              </footer>
            ) : null}
          </blockquote>
        </Column>
      );

    case "divider":
      if (block.style === "space") return <div aria-hidden="true" style={{ height: SPACE[block.size] || SPACE.medium }} />;
      return <Column><ThreadRule a={a} flip={index % 2 === 1} /></Column>;

    default:
      // A block type the website doesn't know yet: skip it rather than break the page.
      return null;
  }
}

/* ============================ HEADER ============================ */

function Title({ doc, a }) {
  const { isPhone } = useViewport();
  const meta = [
    ["year", doc.year],
    ["role", doc.role],
    ["tools", doc.tools?.length ? doc.tools.join(", ") : null],
  ].filter(([, v]) => v);
  return (
    <header style={{ ...SHELL, paddingTop: isPhone ? 120 : "clamp(140px, 18vh, 220px)" }}>
      {doc.category ? (
        <span style={{ fontFamily: BODY, fontSize: 12, fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase", color: a.ACCENT }}>
          {doc.category}
        </span>
      ) : null}
      <Typer as="h1" text={doc.title} once style={{ ...H1, ...typerVars(a) }} />
      {doc.summary ? (
        <p style={{ ...PARA, fontSize: "clamp(17px,1.6vw,21px)", lineHeight: 1.6, margin: "clamp(22px,3vw,34px) 0 0" }}>{doc.summary}</p>
      ) : null}
      {meta.length ? (
        <div style={{ display: "grid", gridTemplateColumns: isPhone ? "1fr" : `repeat(${meta.length}, minmax(0, 1fr))`, gap: "clamp(20px,3vw,34px)", marginTop: "clamp(34px,5vw,54px)", maxWidth: 820 }}>
          {meta.map(([k, v]) => (
            <div key={k}>
              <p style={LABEL}>{k}</p>
              <p style={{ margin: 0, fontFamily: BODY, fontSize: "clamp(15px,1.3vw,17px)", fontWeight: 400, color: INK }}>{v}</p>
            </div>
          ))}
        </div>
      ) : null}
      {doc.externalLink ? (
        <a href={doc.externalLink} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 30, fontFamily: BODY, fontSize: 14, color: a.ACCENT, textDecoration: "none", borderBottom: `1px solid ${a.TINT}` }}>
          view the project ↗
        </a>
      ) : null}
      {doc.thumbnail?.asset ? (
        <div style={{ marginTop: "clamp(38px,6vw,66px)" }}>
          <Figure value={doc.thumbnail} a={a} width={2000} />
        </div>
      ) : null}
    </header>
  );
}

function BackToWork({ a }) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ ...SHELL, marginTop: "clamp(60px,8vw,110px)" }}>
      <a
        href="/#work"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ fontFamily: BODY, fontSize: 15, color: hover ? a.ACCENT : INK, textDecoration: "none", borderBottom: `1px solid ${hover ? a.ACCENT : a.TINT}`, paddingBottom: 3, transition: "color 250ms ease, border-color 250ms ease" }}
      >
        ← all work
      </a>
    </div>
  );
}

/* ============================ STATES ============================ */

function Message({ title, body, a }) {
  return (
    <div style={{ ...SHELL, minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 140 }}>
      <Typer as="h1" text={title} once style={{ ...H1, fontSize: "clamp(40px, 8vw, 96px)", ...typerVars(a) }} />
      <p style={PARA}>{body}</p>
      <p style={{ ...PARA, marginTop: 28 }}>
        <a href="/#work" style={{ color: a.ACCENT, textDecoration: "none", borderBottom: `1px solid ${a.TINT}` }}>← back to all work</a>
      </p>
    </div>
  );
}

/* ============================= PAGE ============================= */

export default function CaseStudy({ slug }) {
  // "loading" | "missing" | "error" | the project
  const [doc, setDoc] = useState("loading");

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(l);
    return () => { document.head.removeChild(l); };
  }, []);

  useEffect(() => {
    let live = true;
    sanity
      .fetch(CASE_STUDY_QUERY, { slug })
      .then((d) => { if (live) setDoc(d || "missing"); })
      .catch((err) => {
        console.warn("Could not load this case study from Sanity.", err);
        if (live) setDoc("error");
      });
    return () => { live = false; };
  }, [slug]);

  useEffect(() => {
    if (doc && typeof doc === "object") document.title = `${doc.title} · gauri`;
  }, [doc]);

  const a = ACCENTS[doc?.accentColor] || ACCENTS.rose;

  let body;
  if (doc === "loading") body = <div style={{ minHeight: "100vh" }} />;
  else if (doc === "missing") body = <Message a={a} title="not found" body="This project doesn't exist, or it isn't published yet." />;
  else if (doc === "error") body = <Message a={a} title="one moment" body="This case study couldn't load right now. Please try again in a little while." />;
  else {
    body = (
      <main>
        <Title doc={doc} a={a} />
        <div style={{ display: "flex", flexDirection: "column", gap: BLOCK_GAP, marginTop: BLOCK_GAP }}>
          {(doc.content || []).map((block, i) => (
            <Block key={block._key || i} block={block} a={a} index={i} />
          ))}
        </div>
        <BackToWork a={a} />
      </main>
    );
  }

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: BODY, minHeight: "100vh", overflowX: "hidden" }}>
      <TyperStyles />
      <Nav accent={a.ACCENT} />
      {body}
      <div style={{ height: "clamp(60px,8vw,110px)" }} />
      <SiteFooter
        tint={a.footerTint}
        heading={
          <Typer
            text="let's connect"
            as="h2"
            fps={20}
            style={{ display: "block", fontFamily: DISPLAY, fontSize: "clamp(28px, 5.8vw, 68px)", fontWeight: 600, lineHeight: 1.04, letterSpacing: "-0.02em", color: INK, margin: 0, ...typerVars(a) }}
          />
        }
      />
    </div>
  );
}
