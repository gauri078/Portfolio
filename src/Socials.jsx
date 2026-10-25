import { useState } from "react";

/**
 * Social icons for the top-left of every nav: LinkedIn, X and email.
 * One place for the links, so changing a handle means changing it once.
 */

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/gauri-tsering-sharma-053189212/",
  x: "https://x.com/gauri_everybody",
  email: "mailto:gauritseringsharma@gmail.com",
};

const ICONS = {
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.66 4.8 6.13v5.43h-4v-4.82c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.9h-4v-11Z" />
  ),
  x: (
    <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
  ),
  email: (
    <path d="M3 5.5h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Zm1.4 2 7.6 5.4 7.6-5.4H4.4ZM20 9.35l-7.42 5.27a1 1 0 0 1-1.16 0L4 9.35V16.5h16V9.35Z" />
  ),
};

const LABELS = { linkedin: "LinkedIn", x: "X", email: "Email" };

export function SocialIcons({ color, hoverColor, size = 18, gap = 16 }) {
  const [hover, setHover] = useState(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap, pointerEvents: "auto" }}>
      {Object.keys(SOCIAL_LINKS).map((key) => {
        const href = SOCIAL_LINKS[key];
        const external = href.startsWith("http");
        return (
          <a
            key={key}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            aria-label={LABELS[key]}
            title={LABELS[key]}
            onMouseEnter={() => setHover(key)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(key)}
            onBlur={() => setHover(null)}
            style={{ display: "inline-flex", color: hover === key ? hoverColor : color, transition: "color 250ms ease, transform 250ms ease", transform: hover === key ? "translateY(-1px)" : "none" }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              {ICONS[key]}
            </svg>
          </a>
        );
      })}
    </div>
  );
}
