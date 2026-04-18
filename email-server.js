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
const transporter = nodemailer.createTransport({
  host: process.env.VITE_SMTP_SERVER || 'smtp-relay.brevo.com',
  port: parseInt(process.env.VITE_SMTP_PORT || '587'),
  secure: false, // TLS
  auth: {
    user: process.env.VITE_SMTP_LOGIN,
    pass: process.env.VITE_SMTP_PASSWORD
  }
});

// Test connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection failed:', error);
  } else {
    console.log('✅ SMTP connection successful');
  }
});

// Email endpoint
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
      from: process.env.VITE_SMTP_LOGIN,
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
    console.error('❌ Error sending email:', error);
    res.status(500).json({ 
      error: 'Email send failed',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'Email Server',
    port: PORT,
    smtpServer: process.env.VITE_SMTP_SERVER
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Email Server Running');
  console.log(`📨 Listening on http://localhost:${PORT}`);
  console.log(`🔗 API Endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health\n`);
});
