# Email Notification System - Testing & Troubleshooting Guide

## System Status

✅ **Working:**

- Frontend notification UI (NotificationsCenter component)
- Friend request validation (checks if user exists)
- Toast notifications for user feedback
- Email templates with beautiful HTML formatting
- Backend email server running on port 3001
- FriendsContext integrated with notifications

⚠️ **Issue:**

- Brevo SMTP authentication failed (credentials may be invalid)
- Emails not currently sending to recipients

## Testing Setup

### Terminal 1: Frontend Dev Server

```bash
npm run dev
# Running on http://localhost:5176
```

### Terminal 2: Email Server

```bash
npm run dev:email-server
# Running on http://localhost:3001
```

### Both Together (Optional)

```bash
npm run dev:all
# Starts both frontend and email server
```

## How to Test Notification UI (Without Email)

1. **Open App**: Go to `http://localhost:5176`
2. **Create Account 1**:
   - Email: `user1@example.com`
   - Name: `Alice`
3. **Create Account 2**:
   - Email: `user2@example.com`
   - Name: `Bob`
4. **Send Friend Request** (From Alice):
   - Log in as Alice
   - Find "Friends" section
   - Enter `user2@example.com`
   - Click "Send Request"
5. **Verify UI Feedback**:
   - ✓ Toast notification appears
   - ✓ Bell icon shows `[1]` badge in header
   - ✓ Click bell to open notifications dropdown
   - ✓ See "Bob wants to split expenses" notification
6. **Accept Request** (As Bob):
   - Log in as Bob
   - Open notifications dropdown
   - Click green ✓ button
   - ✓ See "Friend request accepted" in dropdown
   - ✓ New friend appears in friends list

## Email Testing (When SMTP Fixed)

### Test Email Flow

1. Send friend request to registered user
2. Check browser console for email logs
3. Verify email appears in recipient inbox
4. Send request to non-existent email
5. Verify "join reminder" email sent

### Console Logs to Watch

```
✅ Email sent successfully: { messageId: '...' }
❌ Email send failed: { error: 'Authentication failed' }
⚠️ Email server not available: ...
```

## Fixing SMTP Authentication

### Option 1: Update Brevo Credentials

If you have a valid Brevo account:

1. Log in to [Brevo.com](https://brevo.com)
2. Go to Settings → SMTP & API
3. Copy correct credentials:
   - SMTP Server: `smtp-relay.brevo.com`
   - Port: `587`
   - Email: (your actual Brevo email)
   - Password: (your actual Brevo API key)
4. Update `.env`:
   ```
   VITE_SMTP_LOGIN=your-actual-brevo-email@example.com
   VITE_SMTP_PASSWORD=your-actual-brevo-api-key
   ```
5. Restart email server:
   ```bash
   Ctrl+C  # Kill email server
   npm run dev:email-server  # Start again
   ```

### Option 2: Use Test Email Service

For development without real Brevo account, use [Mailtrap](https://mailtrap.io):

1. Sign up at Mailtrap (free tier)
2. Get SMTP credentials from dashboard
3. Update `.env` with Mailtrap settings
4. Restart email server

### Option 3: Disable Email, Keep UI Testing

Comment out email sending in FriendsContext to focus on UI/UX:

```typescript
// await sendFriendRequestEmail(...); // Commented for testing UI only
```

## Current Credentials Issue

**Current Status**: Brevo credentials in `.env` are showing authentication failure

**Error Message**:

```
535 5.7.8 Authentication failed
```

This means either:

- Credentials are incorrect
- Account is disabled
- SMTP relay service needs activation

**Next Steps**:

1. Verify Brevo account is active
2. Check if API key is correct
3. Consider switching to Mailtrap for testing
4. Or implement OAuth2 authentication

## Notification Center Features

### Currently Working ✓

- Real-time notification badge with count
- Dropdown list of pending friend requests
- Accept/Reject buttons for each request
- Toast notifications on actions
- Auto-hide non-persistent notifications after 5 seconds

### Sender Sees ✓

- Success toast when request sent
- Success notification in center
- Request moves to "Sent Requests" list

### Receiver Sees ✓

- Toast when new request arrives
- Badge update on notification bell
- New request in dropdown
- Quick accept/reject buttons
- Success toast when action taken

## File Locations

- **Email Server**: `email-server.js`
- **Email Service**: `src/services/emailService.ts`
- **Notifications Component**: `src/components/NotificationsCenter.tsx`
- **Notifications Context**: `src/contexts/NotificationsContext.tsx`
- **Friends Logic**: `src/contexts/FriendsContext.tsx`
- **Configuration**: `.env`, `vite.config.ts`, `package.json`

## Next Actions

### For Testing UI/UX Today:

1. Make sure both servers running (dev + email-server)
2. Create test accounts
3. Send friend requests
4. Verify notification UI works

### For Email Delivery:

1. Fix SMTP credentials (update .env)
2. Or switch to Mailtrap service
3. Restart email server after credential changes

### For Production:

1. Use Firebase Cloud Functions (more secure)
2. Deploy email server to hosting (Heroku, Railway, Render)
3. Use environment variables securely
4. Consider EmailJS or SendGrid for simpler setup

---

## Quick Debug Checklist

- [ ] Frontend running on `http://localhost:5176`
- [ ] Email server running on `http://localhost:3001`
- [ ] Test health check: `curl http://localhost:3001/health`
- [ ] Browser console shows network requests to `/api/send-email`
- [ ] Firestore has test user accounts created
- [ ] Friend requests update Firestore properly
- [ ] Notifications appear in UI after request sent/received

## Support Commands

```bash
# Check email server health
curl http://localhost:3001/health

# View email server logs
# (already displayed in terminal where it's running)

# Test email endpoint manually
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","htmlContent":"<p>Test</p>"}'

# Restart everything
npm run dev:all
```
