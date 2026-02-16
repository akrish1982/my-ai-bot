# Testing & Deployment Guide

## 1. Local Testing
You can run the entire application locally on your machine.

### Prerequisites
- Node.js installed
- Supabase Project set up (which you have)
- `.env.local` file configured with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `OPENAI_API_KEY`
  - `VLLM_API_URL` (Optional)

### Running the App
1. Open your terminal in the project directory.
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Flow
1. **Login**: Go to `/auth/login`. Enter any email/password. It will auto-create a user if needed (dev mode logic).
2. **Create Bot**: You'll be redirected to `/create`. 
   - Fill in details.
   - Add a URL (e.g. `https://example.com`) to test ingestion (check Supabase logs/dashboard if webhook fires).
   - Click "Create Bot".
3. **Public Page**: Go to `/[your_username]` (e.g. `http://localhost:3000/ananth` assuming your email is `ananth@...`).
   - You should see your bot.
4. **Chat**: Type a message.
   - It should stream a response.
   - If you added knowledge and the ingestion finished, it should cite it.

## 2. Deployment
### Frontend (Vercel)
The easiest way to deploy Next.js is **Vercel**.
1. Push your code to GitHub.
2. Go to Vercel -> "Add New Project" -> Import your repo.
3. **Environment Variables**: Copy everything from `.env.local` into Vercel's Environment Variables settings.
4. Click **Deploy**.

### Backend (Supabase)
Your database is likely already in the cloud if you created the project nicely.
- **Edge Functions**: You already deployed `ingest-knowledge`.
- **Database**: Schemas are applied.

### Production Tips
- **Auth**: In Supabase Dashboard > Authentication, ensure "Site URL" and "Redirect URLs" are set to your production domain (e.g., `https://my-ai-bot.vercel.app`).
- **Edge Function Secrets**: Ensure `OPENAI_API_KEY` is set in Supabase Secrets for the deployed function (`supabase secrets set ...`).
