import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

/**
 * Read-only connection to the portfolio's Sanity project.
 *
 * The project ID and dataset are public identifiers, not secrets. There is no
 * token here on purpose: the website only ever reads published content, and
 * the "published" perspective means drafts are never returned, even by mistake.
 */
export const sanity = createClient({
  projectId: "1ht9hdq0",
  dataset: "production",
  apiVersion: "2025-02-19",
  useCdn: true,
  perspective: "published",
  // Give up quickly if Sanity is down, so the page falls back instead of waiting.
  maxRetries: 2,
});

const builder = createImageUrlBuilder(sanity);

/** Image URL for a Sanity image field, respecting the crop and focal point set in the Studio. */
export const imageUrl = (source) => builder.image(source).auto("format");

/* ============================ QUERIES ============================ */

// Rows for the "selected work" list, in the order set by dragging in the Studio.
export const PROJECT_LIST_QUERY = `*[_type == "project" && defined(slug.current)] | order(orderRank asc) {
  title,
  "slug": slug.current,
  summary,
  category,
  year,
  statusLabel,
  legacyPath,
  externalLink,
  "hasCaseStudy": count(content) > 0
}`;

// Every image field gets its asset expanded so the page knows the picture's
// proportions before it loads (no jumping layout).
const FIGURE = `{ ..., asset->{ _id, url, metadata { dimensions, lqip } } }`;

// One CMS case study. Projects that point at a coded page are excluded, so
// /work/<slug> can never show an empty page for driver ben, laundry or tapin.
export const CASE_STUDY_QUERY = `*[_type == "project" && slug.current == $slug && !defined(legacyPath)][0] {
  title,
  "slug": slug.current,
  summary,
  category,
  year,
  role,
  tools,
  statusLabel,
  externalLink,
  accentColor,
  thumbnail ${FIGURE},
  content[] {
    ...,
    image ${FIGURE},
    left ${FIGURE},
    right ${FIGURE},
    images[] ${FIGURE}
  }
}`;
