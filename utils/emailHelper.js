const nodemailer = require('nodemailer');

const mailHelper = async (options) => {
    var transporter = nodemailer.createTransport({
        host: process.env.SMTP,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.EMAIL_HOST,
          pass: process.env.EMAIL_PASS
        }
      });

    const dataOption = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(dataOption);
}

module.exports = mailHelper;