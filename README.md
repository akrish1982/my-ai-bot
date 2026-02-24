This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Make sure your env.local variables are also set in Vercel → Project → Settings → Environment Variables:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
And in Supabase → Authentication → URL Configuration, add your production domain to the allowed redirect URLs (e.g. https://my-ai-bot.com).

Pointing your Cloudflare domain to Vercel
In Vercel: Project → Settings → Domains → Add your domain (e.g. my-ai-bot.com)
Vercel will give you a DNS record (usually a CNAME or A record)
In Cloudflare: Go to DNS → Add record
For root domain (my-ai-bot.com): Add an A record → Vercel's IP (they'll give it to you)
For www: Add a CNAME → cname.vercel-dns.com
Important: Set Cloudflare proxy to DNS only (grey cloud, not orange) — Vercel handles its own TLS/SSL


 Cost Estimate for 10 Users
Service	Free Tier	Limits	Cost if exceeded
Vercel	Free (Hobby)	100GB bandwidth, 6hr fn execution	$20/mo (Pro)
Supabase	Free	500MB DB, 2GB bandwidth, 50k MAU	$25/mo (Pro)
OpenAI	Pay-per-use	—	See below
Cloudflare	Free (DNS)	Unlimited DNS	$0
OpenAI cost for 10 light users
The biggest variable is which model and how much they chat.

Model	Input	Output	Est. 10 users/month
gpt-4o-mini	$0.15/1M tokens	$0.60/1M tokens	~$1–5/mo
gpt-4o	$2.50/1M tokens	$10/1M tokens	~$10–30/mo