const nodemailer = require("nodemailer");
const { EMAIL_SERVER, EMAIL_FROM } = require("./index");

const transporter = nodemailer.createTransport(EMAIL_SERVER);

async function sendEmail({ to, subject, html }) {
  await transporter.sendMail({ from: EMAIL_FROM, to, subject, html });
}

module.exports = sendEmail;
