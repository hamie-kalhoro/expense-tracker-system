# Email Notification System Setup Guide

## Current Status

✅ **Completed:**

- Notification infrastructure integrated (NotificationsCenter in Dashboard)
- Friend request email templates created
- User validation implemented (checks if recipient exists before sending)
- Toast notifications for user feedback
- .env configured with Brevo SMTP credentials

⚠️ **Missing:**

- Backend service to actually send emails via Brevo SMTP
- Email delivery to user inboxes

## Why Backend is Needed

The frontend Vite app cannot directly send emails because:

- SMTP credentials cannot be exposed in frontend code (security risk)
- CORS restrictions prevent direct SMTP connections
- Proper email sending requires a backend service

## Solution: Choose One Option

### Option 1: Firebase Cloud Functions (Recommended) ⭐

**Best for:** Firebase projects (you already use Firestore)
**Difficulty:** Medium
**Cost:** Free tier includes email sending

#### Steps:

1. Install Firebase CLI:

   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase Functions in your project:

   ```bash
   firebase init functions
   ```

3. Create email function in `functions/src/index.ts`:

   ```typescript
   import * as functions from 'firebase-functions';
   import * as nodemailer from 'nodemailer';

   const transporter = nodemailer.createTransport({
     host: 'smtp-relay.brevo.com',
     port: 587,
     secure: false,
     auth: {
       user: process.env.BREVO_LOGIN,
       pass: process.env.BREVO_PASSWORD,
     },
   });

   export const sendEmail = functions.https.onCall(async (data, context) => {
     try {
       await transporter.sendMail({
         from: 'a87784001@smtp-brevo.com',
         to: data.to,
         subject: data.subject,
         html: data.htmlContent,
       });
       return { success: true };
     } catch (error) {
       console.error('Email error:', error);
       throw new functions.https.HttpsError('internal', 'Email send failed');
     }
   });
   ```

4. Set environment variables:

   ```bash
   firebase functions:config:set brevo.login="a87784001@smtp-brevo.com"
   firebase functions:config:set brevo.password="rpcIAGMFfamvKOUk"
   ```

5. Deploy:

   ```bash
   firebase deploy --only functions
   ```

6. Update `emailService.ts` to call Cloud Function instead of `/api/send-email`

---

### Option 2: Simple Express Backend

**Best for:** Quick setup
**Difficulty:** Easy
**Cost:** Your own server

#### Steps:

1. Create `server.js` in project root:

   ```javascript
   const express = require('express');
   const nodemailer = require('nodemailer');
   const cors = require('cors');
   require('dotenv').config();

   const app = express();
   app.use(cors());
   app.use(express.json());

   const transporter = nodemailer.createTransport({
     host: 'smtp-relay.brevo.com',
     port: 587,
     secure: false,
     auth: {
       user: process.env.VITE_SMTP_LOGIN,
       pass: process.env.VITE_SMTP_PASSWORD,
     },
   });

   app.post('/api/send-email', async (req, res) => {
     try {
       const { to, subject, htmlContent } = req.body;
       await transporter.sendMail({
         from: 'a87784001@smtp-brevo.com',
         to,
         subject,
         html: htmlContent,
       });
       res.json({ success: true });
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Email failed' });
     }
   });

   app.listen(3001, () => console.log('Email server on port 3001'));
   ```

2. Install dependencies:

   ```bash
   npm install express nodemailer cors dotenv
   ```

3. Add to package.json scripts:

   ```json
   "server": "node server.js",
   "dev:all": "concurrently \"npm run dev\" \"npm run server\""
   ```

4. Run both frontend and backend:
   ```bash
   npm run dev:all
   ```

---

### Option 3: EmailJS (Third-party Service)

**Best for:** Quick setup without backend
**Difficulty:** Easiest  
**Cost:** Free tier available

#### Steps:

1. Sign up at [emailjs.com](https://emailjs.com)
2. Create email service and template
3. Update `emailService.ts` to use EmailJS SDK
4. Expose EmailJS public key in .env

---

## Quick Development Mode

For testing without sending real emails:

**Current Setup:** The app is already set up for this!

- Friend requests are validated locally
- Toast notifications show success/error
- Console logs show what would be sent
- No emails are actually sent (backend missing)

This allows you to test the UI/UX before setting up email backend.

## Testing the Notification System

Even without email backend:

1. Open app at `http://localhost:5176`
2. Create two test accounts
3. Send friend request from Account 1 → Account 2
4. Check:
   - Toast notification appears ✓
   - NotificationsCenter shows badge ✓
   - Notification appears in dropdown ✓
5. Accept request
6. Check: Notification center updates ✓

## Environment Variables

Current `.env` configuration:

```
VITE_SMTP_SERVER=smtp-relay.brevo.com
VITE_SMTP_PORT=587
VITE_SMTP_LOGIN=a87784001@smtp-brevo.com
VITE_SMTP_PASSWORD=rpcIAGMFfamvKOUk
```

These are configured but only used when backend is set up.

## Next Steps

1. **For Development:** Keep current setup, test UI/UX
2. **For Production:** Choose Option 1, 2, or 3 from above
3. **Questions?** Check console logs for what would be emailed

---

## Troubleshooting

**Problem:** Notifications don't appear  
**Solution:** Check browser console for errors, ensure FriendsContext is loading properly

**Problem:** Can't send friend requests  
**Solution:** Verify user exists in Firestore before sending, check toast messages

**Problem:** Want to add email backend later  
**Solution:** Implement any option above, then update `emailService.ts` to call backend API

---

## File Locations

- **Frontend:** `d:\Fun Coding\expense tracker system for friends\expense-tracker-system\src\`
- **Email Service:** `src\services\emailService.ts`
- **Notifications:** `src\components\NotificationsCenter.tsx`
- **Friends Logic:** `src\contexts\FriendsContext.tsx`
- **Config:** `.env` and `vite.config.ts`
