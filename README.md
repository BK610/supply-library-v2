## Built with

- [Next.js](https://nextjs.org/): React Framework
- [TailwindCSS](https://tailwindcss.com/): Utility class-based CSS styling framework
- [Vercel](https://vercel.com/): Hosting and deployment
- [Google Sheets](https://sheets.google.com/): Barebones CMS

## Getting started

### 1. Local setup:

*Assuming you've already cloned the repo.*

Add the URL for the Google Sheet as a local environment variable, in `.env.local`. Find the URL in the Google Sheet settings, under [File > Share > Publish to web > Item Library (Comma-separated values)].
```
NEXT_PUBLIC_SUPPLY_LIBRARY_ITEMS_DATA_URL={Published Google Sheet URL} 
```

Install dependencies.

```bash
npm install
```

### 2. Open locally

Run the development server locally.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

If you see the spreadsheet contents locally, you've set up the environment variables correctly.

### 3. Run the build command:

When everything's working as you want locally, build the project to make sure it'll build correctly on Vercel.

```bash
npm run build
```

If everything's successful, you're good to go.

## Deploy

This is deployed through Vercel. If you want access to the project so you can view your branch deployments, let me know.
