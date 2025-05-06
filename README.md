# WakeUpNPC2

A Nuxt 3 application that displays a balanced wall of content including claim translations, quotes, and memes.

## For Content Contributors

If you're here to add or edit content (quotes, claims, or memes), please read our [Contributing Guide](.github/CONTRIBUTING.md) for step-by-step instructions.

## Content Structure

- **Claims**: Translations of claims, stored in `content/claims/`
- **Quotes**: Notable quotes, stored in `content/quotes/`
- **Memes**: Images with captions, stored in `public/memes/` with metadata in `content/memes/`

## Templates

For convenience, we provide templates for each content type in the `templates/` directory:
- [Quote Template](templates/quote.md)
- [Claim Template](templates/claim.md)
- [Meme Template](templates/meme.md)

## For Developers

### Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev
```

### Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build
```

### Deployment

This site is designed to be deployed on Netlify or Vercel, which will automatically rebuild the site when new content is merged into the main branch.
