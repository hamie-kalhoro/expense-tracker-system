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
    // Call local backend email server
    const response = await fetch('http://localhost:3001/api/send-email', {
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
 * Send friend request email notification
 */
export const sendFriendRequestEmail = async (
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  appUrl: string = 'http://localhost:5175'
) => {
  const htmlContent = `
    <div style="font-family: Outfit, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">SplitEase 💰</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Split expenses effortlessly</p>
      </div>

      <div style="background: #f9fafb; padding: 24px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Friend Request from ${senderName}</h2>
        
        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
          Hi ${recipientName},
        </p>

        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
          <strong>${senderName}</strong> sent you a friend request on SplitEase! They want to split expenses with you. 
        </p>

        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 24px;">
          To respond to this request and start splitting expenses together, please log in to SplitEase:
        </p>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Open SplitEase
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          If you don't have a SplitEase account yet, you can <a href="${appUrl}" style="color: #667eea; text-decoration: none;">create one here</a> using this email address.
        </p>
      </div>

      <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
        <p style="margin: 0; color: #92400e; font-size: 13px;">
          <strong>💡 Tip:</strong> Don't forget to accept the friend request once you log in so you can start splitting expenses together!
        </p>
      </div>

      <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;">© 2026 SplitEase. All rights reserved.</p>
        <p style="margin: 8px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  return sendEmailViaBrevo({
    to: recipientEmail,
    subject: `${senderName} sent you a friend request on SplitEase 🎉`,
    htmlContent
  });
};

/**
 * Send reminder email to non-registered user
 */
export const sendJoinAppReminderEmail = async (
  recipientEmail: string,
  senderName: string,
  appUrl: string = 'http://localhost:5175'
) => {
  const htmlContent = `
    <div style="font-family: Outfit, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">SplitEase 💰</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Split expenses effortlessly</p>
      </div>

      <div style="background: #fee2e2; padding: 24px; border-radius: 12px; border-left: 4px solid #dc2626; margin-bottom: 30px;">
        <p style="margin: 0; color: #b91c1c; font-weight: 600; font-size: 15px;">
          ⚠️ Friend Request Not Yet Delivered
        </p>
      </div>

      <div style="background: #f9fafb; padding: 24px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Join SplitEase to Accept ${senderName}'s Friend Request</h2>
        
        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
          Hi there,
        </p>

        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
          <strong>${senderName}</strong> tried to send you a friend request on SplitEase, but there's no account registered with your email address (<strong>${recipientEmail}</strong>).
        </p>

        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
          To receive the friend request and start splitting expenses with ${senderName}, you'll need to create a SplitEase account.
        </p>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Sign Up Now
          </a>
        </div>

        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #6b7280; font-size: 13px;">
            <strong>How to get started:</strong>
          </p>
          <ol style="margin: 8px 0 0 0; padding-left: 20px; color: #6b7280; font-size: 13px;">
            <li>Click "Sign Up Now" above</li>
            <li>Sign up with this email address: <strong>${recipientEmail}</strong></li>
            <li>Check SplitEase for friend requests</li>
            <li>Accept ${senderName}'s request and start splitting!</li>
          </ol>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          Once you create an account with this email, ${senderName}'s friend request will be waiting for you!
        </p>
      </div>

      <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;">© 2026 SplitEase. All rights reserved.</p>
        <p style="margin: 8px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  return sendEmailViaBrevo({
    to: recipientEmail,
    subject: `${senderName} wants to split expenses with you on SplitEase 📧`,
    htmlContent
  });
};
