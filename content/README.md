# Blog content workflow

`content/posts/*.html` is the source of truth for blog posts.

## Post file format

```html
---
id: "best-things-to-do-in-gyeongju-korea"
title: "Best Things to Do in Gyeongju Korea"
excerpt: "A short SEO excerpt."
dateIso: "2026-05-12"
category: "travel"
status: "published"
thumbnailUrl: "https://example.com/image.jpg"
---

<h2>Article body</h2>
<p>HTML content goes here.</p>
```

Supported categories:

- `k-culture`
- `k-food`
- `living`
- `travel`
- `uncategorized`

## Commands

```bash
npm run sync:posts
npm run generate:post -- "best things to do in Gyeongju Korea"
npm run generate:post -- "best cafes in Seongsu Seoul" -- --category k-food --no-images
npm run generate:batch -- content/keywords_template.csv -- --no-images
```

`generate:post` uses these optional environment variables:

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `UNSPLASH_ACCESS_KEY`

After generating or editing post files, run:

```bash
npm run sync:posts
npm run lint
npm run build
```

## Analytics

Google Analytics 4 is loaded only when this environment variable is set:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Set it in Vercel project environment variables for Production, Preview, and Development as needed.
