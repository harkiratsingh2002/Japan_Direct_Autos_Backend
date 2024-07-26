const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text, html) {
  try {
    // Create a transport object using the Gmail SMTP server
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Upgrade later to true for a secure connection (TLS)
      auth: {
        user: process.env.EMAIL_USER, // Use environment variables for email credentials
        pass: process.env.EMAIL_PASS
      }
    });

    // Define the email options
    const mailOptions = {
      from: '"Japan Direct Autos" surewander@gmail.com', // Sender address
      to,
      subject,
      text, // Plain text body
      html // HTML body (optional)
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = sendEmail;