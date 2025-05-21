import nodemailer from 'nodemailer';

// For development purposes, we'll use a test account
// In production, use environment variables for SMTP config
let transporter: nodemailer.Transporter;

const setupTransporter = async () => {
  // Create a test account if no SMTP settings are provided
  if (!process.env.SMTP_HOST) {
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log('Using test email account:', testAccount.user);
  } else {
    // Use configured SMTP settings
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
};

// Initialize transporter
setupTransporter().catch(console.error);

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!transporter) {
      await setupTransporter();
    }
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ExpenseFlow" <expenseflow@example.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    console.log('Email sent:', info.messageId);
    
    // If using Ethereal, log the URL to view the email
    if (!process.env.SMTP_HOST) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Template for expense status change
export const sendExpenseStatusChangeEmail = async (
  userEmail: string,
  userName: string,
  expenseId: number,
  amount: number,
  status: string,
  category: string,
  comment?: string
): Promise<boolean> => {
  const subject = `Expense ${status.toUpperCase()}: Your expense request has been ${status}`;
  
  const text = `
    Hello ${userName},
    
    Your expense request #${expenseId} for $${amount.toFixed(2)} (${category}) has been ${status}.
    ${comment ? `\nComment: ${comment}` : ''}
    
    Please log in to the ExpenseFlow system to view details.
    
    Thank you,
    ExpenseFlow Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Expense ${status.toUpperCase()}</h2>
      <p>Hello ${userName},</p>
      <p>Your expense request <strong>#${expenseId}</strong> for <strong>$${amount.toFixed(2)}</strong> (${category}) has been <strong>${status}</strong>.</p>
      ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ''}
      <p>Please log in to the ExpenseFlow system to view details.</p>
      <p>Thank you,<br>ExpenseFlow Team</p>
    </div>
  `;
  
  return await sendEmail({
    to: userEmail,
    subject,
    text,
    html
  });
};

// Template for new expense notification to manager
export const sendNewExpenseNotificationEmail = async (
  managerEmail: string,
  managerName: string,
  employeeName: string,
  expenseId: number,
  amount: number,
  category: string
): Promise<boolean> => {
  const subject = `New Expense Requires Your Approval`;
  
  const text = `
    Hello ${managerName},
    
    A new expense request #${expenseId} from ${employeeName} for $${amount.toFixed(2)} (${category}) requires your approval.
    
    Please log in to the ExpenseFlow system to review this request.
    
    Thank you,
    ExpenseFlow Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">New Expense Requires Your Approval</h2>
      <p>Hello ${managerName},</p>
      <p>A new expense request <strong>#${expenseId}</strong> from <strong>${employeeName}</strong> for <strong>$${amount.toFixed(2)}</strong> (${category}) requires your approval.</p>
      <p>Please log in to the ExpenseFlow system to review this request.</p>
      <p>Thank you,<br>ExpenseFlow Team</p>
    </div>
  `;
  
  return await sendEmail({
    to: managerEmail,
    subject,
    text,
    html
  });
};
