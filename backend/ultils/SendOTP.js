const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email_ID,
    pass: process.env.Email_Password,
  },
});

async function sendOTP(email, otp, type) {
  await transporter.sendMail({
    from: `WatchHub <${process.env.Email_ID}>`,
    to: email,
    subject: `Your WatchHub OTP`,
    html: `
      <h2>Your WatchHub OTP For ${type}</h2>
      <p><strong>Here is your ${otp} for ${type}</strong></p>
      <p>It Valid for 5 minutes so hurry up !</p>
      <p>Thank you for Using WatchHub</p>
    `,
  });
}

module.exports = sendOTP;
