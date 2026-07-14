# SampleProject
Java Full Stack Program

## Anime Sanyasi website

This repository includes a static Vercel website for Anime Sanyasi:

- `index.html`
- `styles.css`
- `assets/anime-welcome.png`
- `about.html`
- `privacy.html`
- `contact.html`
- `robots.txt`
- `sitemap.xml`
- `vercel.json`

The homepage is structured as a monthly anime ranking article. The July 2026
issue uses current Summer 2026 seasonal data and original commentary.

### Monthly update checklist

1. Update the month and last-updated date in `index.html`.
2. Refresh the top 10 titles and source links.
3. Rewrite the commentary so the article stays original.
4. Update `sitemap.xml` `lastmod` dates.
5. Commit and push to `master`; Vercel redeploys automatically.

### AdSense notes

The page has clearly labeled ad slots but does not include live AdSense code yet.
After AdSense approval, add your publisher script and responsive ad units where the
`ad-slot` blocks appear. Keep ads separated from navigation and content buttons.

### Deploy on Vercel

1. Push these files to GitHub.
2. In Vercel, choose **Add New > Project**.
3. Import `kancherlasaitheja/SampleProject`.
4. Keep the root directory as `./`.
5. Use **Other** as the framework preset.
6. Deploy.
