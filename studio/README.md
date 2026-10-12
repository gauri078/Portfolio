# Portfolio Studio (Sanity)

The editing screen for the **projects** on the portfolio. Only projects live here.
Home page copy, navigation and footer stay in code.

- Sanity project ID: `1ht9hdq0` (public identifier, not a secret)
- Dataset: `production`
- This folder has its own `package.json`, separate from the website. The website
  build on Vercel does not use it.

## Requirements

Node 22.12 or newer (check with `node -v`). Studio uses React 19; the website
stays on React 18 because the two folders never share packages.

## Run the Studio on your computer

```bash
cd studio
npm install
npm run dev
```

Open http://localhost:3333 and sign in with the Sanity account that owns the
project. No token or password goes in any file.

## First-time setup in the Studio

1. Open **Projects** in the left menu.
2. Click the **...** menu at the top right of the list and choose **Reset Order**.
   This gives every existing project a starting position. Do it once, after
   your first projects exist.
3. After that, drag rows up and down to reorder. The website sorts by this order.

Note: reordering saves immediately, and it also updates the published copy of a
project that has unpublished edits. So a reorder shows on the live site without
pressing Publish.

## Add a project

1. Projects, then the **+** button.
2. Fill in the **Details** tab (title, slug, summary, category, year, accent colour).
3. Open the **Case study** tab and add blocks with **Add item**. Drag blocks to reorder
   them, or remove them with the **...** menu on each block.
4. Press **Publish** when it is ready. Until then it stays a draft and is not
   visible to website visitors.

## Blocks available

Rich text, Single image, Full-width image, Two images side by side, Image gallery,
Image + Text, Text + Image, Pull quote, Divider. They are defined in
`schemaTypes/blocks/`. Adding a new kind of block means adding a file there and
a matching renderer on the website.

## The three existing coded case studies

driver ben, untangling the knots and tapin stay as coded pages. In Sanity, their
list rows use the **Existing coded page** field to point at `/driverben`,
`/laundry` or `/tapin`. Leave that field empty for every new project.

## Checks

```bash
npm run validate   # checks the schema for mistakes
npm run build      # confirms the Studio compiles
```

## Hosting the Studio online (optional)

`npm run deploy` publishes the editing screen to a `yourname.sanity.studio` address
so you can edit from any computer. You pick the name the first time. This does
not touch the portfolio website or Vercel.

## Safety notes

- Do not create a Sanity write token for the website. The website only reads
  published content and needs no token.
- Do not put secrets in `.env` files that are committed. `.env` files in this
  folder are already ignored by git.
