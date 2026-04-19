import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Brevo SMTP
// CRITICAL: The "from" address must be a verified sender in Brevo.
// We fall back to the SMTP login email, which is almost always verified.
const defaultSender = process.env.VITE_SMTP_LOGIN || 'a87784001@smtp-brevo.com';

const transporter = nodemailer.createTransport({
  host: process.env.VITE_SMTP_SERVER || 'smtp-relay.brevo.com',
  port: parseInt(process.env.VITE_SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.VITE_SMTP_LOGIN,
    pass: process.env.VITE_SMTP_PASSWORD
  }
});

// Test connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection failed. Check your VITE_SMTP_* variables.');
    console.error('Error details:', error);
  } else {
    console.log(`✅ SMTP connection successful. Ready to send from: ${defaultSender}`);
  }
});

// Main Email Endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, htmlContent } = req.body;

    if (!to || !subject || !htmlContent) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, htmlContent' 
      });
    }

    console.log(`📧 Sending email to ${to}...`);

    const mailOptions = {
      from: `"SplitEase" <${defaultSender}>`,
      to: to,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.response);
    res.json({ 
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    res.status(500).json({ 
      error: 'Email send failed',
      details: error.message
    });
  }
});

// Test Endpoint (allows testing without UI)
app.post('/api/test-email', async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ error: 'Please provide a "to" email address in the JSON body.' });
    }

    console.log(`🧪 Testing email pipeline to ${to}...`);
    
    const info = await transporter.sendMail({
      from: `"SplitEase Test" <${defaultSender}>`,
      to: to,
      subject: 'SplitEase SMTP Test Successful 🚀',
      html: '<h1 style="color: #6366f1;">It works!</h1><p>Your SplitEase email server is configured correctly.</p>'
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    res.status(500).json({ error: 'Test failed', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'SplitEase Email Server',
    port: PORT,
    smtpServer: process.env.VITE_SMTP_SERVER || 'Not configured in .env'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Email Server Running');
  console.log(`📨 Listening on http://localhost:${PORT}`);
  console.log(`🔗 API Endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`🧪 Test Endpoint: POST http://localhost:${PORT}/api/test-email { "to": "your@email.com" }`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health\n`);
});
