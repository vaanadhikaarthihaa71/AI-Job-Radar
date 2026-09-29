# 📡 Job Radar — Realtime Career Intelligence Briefing

**Job Radar** is an automated multi-industry career ledger and live intelligence engine tracking Tech, Healthcare, Finance, Marketing, Skilled Trades, Creative, and Education positions in real-time.

---

## 🏗️ Architecture & Authentication Diagram

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND (Vite / React)                           |
|  - Editorial Newspaper Ledger View                                               |
|  - Realtime Google OAuth 2.0 Auth Context (useAuth)                              |
|  - Sensible Feature Gating (Browsing is public; Save/Apply/AI Chat require auth) |
|  - Grounded AI Chatbot Panel (ChatPanel)                                         |
+--------------------------+--------------------------------+-----------------------+
                           |                                |
                           v                                v
+---------------------------------------+  +----------------------------------------+
|   LOCAL / VERCEL SERVERLESS ENDPOINTS |  |          SUPABASE DATABASE             |
|   - /api/jobs                         |  |  - jobs table (PostgreSQL)             |
|   - /api/chat                         |  |  - user_saved_jobs (RLS auth.uid())    |
|                                       |  |  - Supabase Auth (Google OAuth)        |
+------------------+--------------------+  +-------------------+--------------------+
                   |                                           ^
                   v                                           |
+---------------------------------------+  +-------------------+--------------------+
|            ANTHROPIC API              |  |         PYTHON CRAWLER WORKER          |
|   - Model: claude-3-5-sonnet-20241022 |  |  - Async scrapers (Indeed, Ashby, etc) |
|   - Grounded context prompt           |  |  - Deduplication & Relevancy Scoring   |
+---------------------------------------+  +----------------------------------------+
```

---

## 🔐 Supabase Auth + Google Cloud Configuration Setup

To enable real **Sign in with Google** via Supabase OAuth 2.0:

### 1. Configure Google Cloud Console
1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** with Application Type: **Web application**.
3. Under **Authorized Redirect URIs**, add your Supabase Callback URL:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
4. Copy the generated **Client ID** and **Client Secret**.

### 2. Configure Supabase Dashboard
1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication** -> **Providers** -> **Google**.
3. Toggle Google to **Enabled**.
4. Paste your Google **Client ID** and **Client Secret**.
5. Save changes.

---

## 🗄️ Database Schema & RLS Security

### `user_saved_jobs` Table
Stores user-saved, applied, and hidden job statuses tied to Supabase Auth users. Protected by Row Level Security (RLS) so users can only access their own records.

```sql
CREATE TABLE IF NOT EXISTS public.user_saved_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('saved', 'applied', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, job_id)
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved jobs"
    ON public.user_saved_jobs
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

On initial Google sign-in, existing `localStorage` saved/applied/hidden states are automatically migrated into `user_saved_jobs` for the authenticated user ID.

---

## 🔒 Grounding & Safety Mechanism

Answers produced by the AI Assistant come **strictly from retrieved job rows** in Supabase and the local dataset, not from the LLM's general background knowledge or invented sources. The model is constrained by system prompts to say plainly if data is absent and never invent job listings or numbers.

---

## 🔑 Environment Variables

Create a `.env` file or configure Vercel Project Settings:

```env
# Backend Supabase Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# Frontend Vite Supabase Credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Assistant Key (SERVER-SIDE ONLY — Never exposed to client bundle)
ANTHROPIC_API_KEY=sk-ant-api-key-here
```

> ⚠️ **Security Notice**: `ANTHROPIC_API_KEY` is strictly server-side and accessed only inside `/api/chat` serverless functions. It is never bundled into client-side JavaScript or browser dev tools.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Sign In with Google Setup
Click **"SIGN IN WITH GOOGLE"** in the top-right header or in feature gating prompts to authenticate via Supabase Auth.

### 3. Run Development Server
```bash
npm run dev
```

Visit **http://localhost:3000/** in your browser.
