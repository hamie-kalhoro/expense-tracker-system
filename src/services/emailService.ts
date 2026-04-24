// Email service using Brevo SMTP via backend server

interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
}

/**
 * Send email via backend email server (running on port 3001)
 * Backend handles Brevo SMTP relay securely
 */
export const sendEmailViaBrevo = async (payload: EmailPayload): Promise<boolean> => {
  try {
    const API_URL = import.meta.env.VITE_EMAIL_SERVER_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Email sent successfully:', data);
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Email send failed:', error);
      return false;
    }
  } catch (error) {
    console.warn('⚠️ Email server not available. Make sure to run: npm run dev:email-server');
    console.log('Email would be sent to:', payload.to);
    console.log('Subject:', payload.subject);
    return false;
  }
};

/**
 * Send welcome email to new users (OAuth or Email)
 */
export const sendWelcomeEmail = async (
  recipientEmail: string,
  username: string,
  appUrl: string = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5175'
) => {
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      
      <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: -0.5px;">Welcome to SplitEase! 👋</h1>
        <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.9);">The easiest way to share expenses.</p>
      </div>

      <div style="padding: 40px 30px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Account Activated successfully</h2>
        
        <p style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
          Hi <strong>@${username}</strong>,
        </p>

        <p style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
          Your account is fully set up. At SplitEase, we make tracking balances, splitting bills, and settling up incredibly simple.
        </p>

        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; color: #334155; font-size: 16px;">Here's what you can do right now:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 15px; line-height: 1.5;">
            <li style="margin-bottom: 8px;"><strong>Add Friends:</strong> Search for your friends using their @username.</li>
            <li style="margin-bottom: 8px;"><strong>Log Expenses:</strong> Did you pay for dinner? Log it, split the cost, and SplitEase calculates who owes what.</li>
            <li><strong>Settle Up:</strong> See exactly your net balance across all your friends.</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 35px 0;">
          <a href="${appUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);">
            Go to your Dashboard
          </a>
        </div>
      </div>

      <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">© 2026 SplitEase. All rights reserved.</p>
        <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">You received this because you registered an account on SplitEase.</p>
      </div>
    </div>
  `;

  return sendEmailViaBrevo({
    to: recipientEmail,
    subject: `Welcome to SplitEase, @${username}! 🎉`,
    htmlContent
  });
};

/**
 * Send friend request email notification
 */
export const sendFriendRequestEmail = async (
  recipientEmail: string,
  recipientUsername: string,
  senderUsername: string,
  appUrl: string = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5175'
) => {
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: -0.5px;">SplitEase</h1>
        <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.9);">Expense sharing done right.</p>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">New Friend Request</h2>
        <p style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
          Hi <strong>@${recipientUsername}</strong>,
        </p>
        <p style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
          <strong>@${senderUsername}</strong> wants to be friends on SplitEase so you can start sharing expenses.
        </p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${appUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);">
            Open SplitEase to Accept
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 30px;">
          Tip: You can manage all your friend requests directly in your Profile hub.
        </p>
      </div>
      <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">© 2026 SplitEase. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmailViaBrevo({
    to: recipientEmail,
    subject: `@${senderUsername} wants to split expenses with you! 💸`,
    htmlContent
  });
};

export const sendJoinAppReminderEmail = async (
  recipientEmail: string,
  senderUsername: string,
  appUrl: string = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5175'
) => {
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: -0.5px;">SplitEase</h1>
        <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.9);">Expense sharing done right.</p>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Action Required</h2>
        <p style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
          Hi there,
        </p>
        <p style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
          <strong>@${senderUsername}</strong> tried to add you as a friend on SplitEase to share an expense, but you don't have an account registered with this email address yet.
        </p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; color: #334155; font-size: 16px;">How to get started:</h3>
          <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 15px; line-height: 1.5;">
            <li style="margin-bottom: 6px;">Sign up using this exact email address</li>
            <li style="margin-bottom: 6px;">Pick your unique username</li>
            <li>Accept the pending request from @${senderUsername}</li>
          </ol>
        </div>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${appUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);">
            Create Your Account
          </a>
        </div>
      </div>
      <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">© 2026 SplitEase. All rights reserved.</p>
        <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">This is an automated invitation.</p>
      </div>
    </div>
  `;

  return sendEmailViaBrevo({
    to: recipientEmail,
    subject: `@${senderUsername} invited you to SplitEase! 📧`,
    htmlContent
  });
};
