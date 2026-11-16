# Baked Boscombe (Bournemouth) – website

## Quick start (no tools needed)
The `website/` folder is the complete site, with every file at the top level and no sub-folders:
index.html, about.html, services.html (Menu), gallery.html, contact.html, 404.html,
styles.css, main.js, chatbot.js, site-config.js, the images, site.webmanifest, robots.txt and sitemap.xml.

- **Open locally:** double-click `index.html`.
- **GitHub + Vercel:** upload ALL files from `website/` (or the WEBSITE zip) to the TOP of the repository, not inside a folder. In Vercel choose Framework Preset "Other", with no build command and no output directory.
- **Netlify:** drag the `website` folder onto app.netlify.com/drop.
- **cPanel:** upload all files into `public_html`.

## Order enquiry form – one-time activation
The form and chat assistant email enquiries to bakedboscombe@gmail.com through FormSubmit. The FIRST time the form is
used, FormSubmit sends an activation email to that inbox (check spam). Click "Activate" once; after that every
enquiry arrives by email.

## Where the details came from
- Phone, email and Facebook link: supplied by the client. Facebook needs a login, so the page couldn't be read.
- Address (43 Palmerston Road, Boscombe, Bournemouth BH1 4HW) and food hygiene rating 5 (Very Good, inspected 30 Nov 2023): the Food Standards Agency register.
- Photos: royalty-free Unsplash stock, labelled on the Gallery page as illustrative.

## Please confirm with the client
- **Menu:** the six sections are typical bakery and café ranges. Check what they actually sell, e.g. do they do breakfast, lunch, sourdough or vegan options, and whether they take celebration cake orders.
- **Opening hours:** not available, so the site points to Facebook and the phone number. Send the hours and they can be added everywhere.
- **Photos:** real photos of their bakes and the shop would make a big difference. Facebook photos can be saved and sent over.
- **Reviews:** none were added. Paste real Google or Facebook reviews into `reviews` in `src/site.config.js`.
- **Domain:** www.bakedboscombe.co.uk is a placeholder. Update `url` in `src/site.config.js`.

## Editing (optional, needs Node.js)
Sources are in `src/` and `public/assets/`. Run `npm run build` and then `node flatten.js` to regenerate `website/`.
The `server.js` file adds an optional live AI chat (needs ANTHROPIC_API_KEY).
