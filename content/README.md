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

## Mobile automation with GitHub Actions

Use the `Generate blog post` workflow to create a post from your phone:

1. Open GitHub > `insidekoreanow` > Actions.
2. Select `Generate blog post`.
3. Tap `Run workflow`.
4. Enter a keyword, for example `best things to do in Gyeongju Korea`.
5. Leave category as `auto` or choose one manually.
6. Run the workflow.
7. Review the generated pull request, then merge it if the post is good.

Required repository secrets:

- `ANTHROPIC_API_KEY`
- `UNSPLASH_ACCESS_KEY`

Optional repository variable:

- `ANTHROPIC_MODEL` (defaults to `claude-3-5-sonnet-latest`)

## Analytics

Google Analytics 4 is loaded only when this environment variable is set:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Set it in Vercel project environment variables for Production, Preview, and Development as needed.
