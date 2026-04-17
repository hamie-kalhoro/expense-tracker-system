# 🎓 SplitEase — Shared Expense Tracker for Students

A beautiful, real-time web app for tracking and equalizing shared expenses among friends. Built with React + TypeScript and powered by Firebase.

![SplitEase](https://img.shields.io/badge/SplitEase-Expense_Tracker-blue?style=for-the-badge)

## ✨ Features

- **🔐 Google Authentication** — Sign in securely via Firebase Auth
- **💰 Expense Tracking** — Log expenses with descriptions, amounts, categories
- **👥 Smart Splitting** — Auto-split expenses among friends with even division
- **📊 Real-time Balances** — See who owes whom, updated instantly via Firestore
- **🔄 Settlement Suggestions** — Greedy algorithm minimizes the number of payments needed
- **✏️ Manual Corrections** — Edit or delete any expense you created
- **📱 Responsive Design** — Looks great on desktop, tablet, and mobile
- **🌙 Dark Mode UI** — Premium glassmorphism design with smooth animations

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| Styling | Vanilla CSS (glassmorphism, responsive) |
| Auth | Firebase Authentication (Google) |
| Database | Cloud Firestore (real-time NoSQL) |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Routing | React Router v7 |
| Build | Vite 8 |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd expense-tracker
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Authentication → Google** sign-in provider
3. Create a **Firestore** database (start in test mode or use the provided rules)
4. Go to **Project Settings → General → Your apps → Web** and copy the config

5. Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```

### 3. Deploy Firestore Rules

Copy the contents of `firestore.rules` to your Firebase Console → Firestore → Rules.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> **Mock Mode:** If `.env` is not configured, the app runs in mock/preview mode with a demo account and in-memory data.

## 📁 Project Structure

```
src/
├── components/
│   ├── Login.tsx          # Auth login page
│   └── Dashboard.tsx      # Main dashboard with modals
├── contexts/
│   ├── AuthContext.tsx     # Firebase Auth state
│   └── DataContext.tsx     # Expense data + calculations
├── firebase/
│   ├── config.ts          # Firebase initialization
│   └── expenses.ts        # Firestore CRUD helpers
├── App.tsx                # Router + providers
├── main.tsx               # Entry point
└── index.css              # Design system
```

## 🔒 Security

- Firestore Security Rules enforce per-user data access
- Only expense creators can edit/delete their records
- Participants can only read expenses they're involved in
- See `firestore.rules` for the full ruleset

## 🚢 Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload dist/ to Netlify
```

### CI/CD

Connect your GitHub repo to Vercel or Netlify for automatic deployments on every push.

## 📄 License

MIT
