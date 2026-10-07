# Chrome Extension Auth Demo with Supabase

A Chrome extension built with WXT + React that demonstrates Google OAuth authentication via Supabase and CRUD operations on notes.

## Features

- 🔐 Google OAuth authentication
- 📝 Create, read, update, delete notes
- 💾 Persistent session across browser restarts
- 🎨 Modern UI with gradient design

## Prerequisites

- Node.js (v16+)
- Chrome browser
- Supabase account
- Google Cloud Console account

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon/Public key

### 2. Configure Google OAuth in Supabase

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**
8. In Supabase dashboard, go to **Authentication** → **Providers** → **Google**
9. Enable Google provider and paste Client ID and Client Secret
10. Save

### 3. Create Database Table

In Supabase SQL Editor, run:

```sql
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table notes enable row level security;

-- Policy: Users can only see their own notes
create policy "Users can view own notes"
  on notes for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own notes
create policy "Users can insert own notes"
  on notes for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own notes
create policy "Users can update own notes"
  on notes for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own notes
create policy "Users can delete own notes"
  on notes for delete
  using (auth.uid() = user_id);
```

### 4. Clone and Install

```bash
git clone <your-repo-url>
cd Chrome-Extension-Auth-Demo
npm install
```

### 5. Configure Environment Variables

Create `.env` file:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 6. Configure OAuth Client ID

Edit `wxt.config.ts` and replace `YOUR_GOOGLE_CLIENT_ID`:

```typescript
oauth2: {
  client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  scopes: ['openid', 'email', 'profile'],
}
```

### 7. Run Development Server

```bash
npm run dev
```

### 8. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `.output/chrome-mv3-dev/` folder
5. The extension icon should appear in your toolbar

### 9. Test the Extension

1. Click the extension icon
2. Click **Sign in with Google**
3. Complete Google OAuth flow
4. Add, edit, and delete notes
5. Close and reopen browser - session should persist

## Project Structure

```
Chrome-Extension-Auth-Demo/
├── entrypoints/
│   ├── popup/              # Extension popup UI
│   │   └── App.tsx         # Main React component
│   ├── background.ts       # Background service worker
│   └── content.ts          # Content script
├── lib/
│   ├── auth.ts            # Authentication logic
│   ├── session.ts         # Session management
│   ├── notes.ts           # Notes CRUD operations
│   └── supabaseClient.ts  # Supabase client config
├── public/                # Static assets
├── .env                   # Environment variables
├── wxt.config.ts         # WXT configuration
└── package.json
```

## Build for Production

```bash
npm run build
```

The production build will be in `.output/chrome-mv3/`

## Technologies Used

- **WXT** - Chrome extension framework
- **React** - UI library
- **TypeScript** - Type safety
- **Supabase** - Backend and authentication
- **Chrome Identity API** - OAuth flow
