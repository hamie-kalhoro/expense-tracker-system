# 🎓 SplitEase — Shared Expense Tracker for Friends

A beautiful, real-time web app for tracking and equalizing shared expenses among friends. Built with React + TypeScript and powered by **Supabase**.

![SplitEase](https://img.shields.io/badge/SplitEase-Expense_Tracker-blue?style=for-the-badge)

## ✨ Features

- **🔐 Secure Authentication** — Sign in via Supabase Auth (Email or OAuth)
- **💰 Expense Tracking** — Log expenses with descriptions, amounts, and categories
- **👥 Smart Splitting** — Auto-split expenses among friends with even division
- **🛡️ Data Isolation** — Strict Row Level Security (RLS) ensures your data is only visible to you and your participants
- **📊 Public Metrics** — Secure platform-wide stats (total users, average rating) via public RPC
- **💬 Feedback System** — Built-in review system to capture user suggestions
- **🌙 Premium UI** — Stunning glassmorphism design with smooth animations and dark mode

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript |
| **Styling** | Vanilla CSS (Modern Design System) |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime) |
| **Security** | Row Level Security (RLS) + Custom RPCs |
| **Icons** | Lucide React |
| **State** | React Context API |
| **Build** | Vite 8 |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd expense-tracker
npm install
```

### 2. Configure Supabase

1. Create a new project at [Supabase Console](https://supabase.com/).
2. Go to **SQL Editor** and run the contents of `supabase_schema.sql`. This will:
   - Create all tables (`users`, `expenses`, `friendships`, `reviews`, `notifications`)
   - Enable Row Level Security (RLS)
   - Create the `get_platform_stats` RPC for landing page metrics
3. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx      # Main authenticated dashboard
│   ├── LandingPage.tsx    # Secure public landing page
│   └── ReviewModal.tsx    # Feedback & Rating system
├── contexts/
│   ├── AuthContext.tsx     # Supabase Auth state
│   ├── DataContext.tsx     # Expense calculations & logic
│   └── FriendsContext.tsx  # Social graph management
├── supabase/
│   └── supabaseClient.ts  # Client initialization
└── index.css              # Design system & tokens
```

## 🚢 Deployment

### Vercel (Recommended)
This project is optimized for Vercel. Connect your GitHub repository for automatic deployments. 

> [!IMPORTANT]
> Large files like the demo video (>100MB) should be hosted externally (YouTube/Vimeo) or compressed to prevent build failures.

## 📄 License

MIT
