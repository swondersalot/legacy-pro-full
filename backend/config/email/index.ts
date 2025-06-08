import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function loadTemplate(templateName: string, context: Record<string, any>) {
  const filePath = path.join(__dirname, "templates", `${templateName}.html`);
  const source = fs.readFileSync(filePath, "utf8");
  const compiled = handlebars.compile(source);
  return compiled(context);
}

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export default async function sendEmail(options: EmailOptions) {
  const html = loadTemplate(options.template, options.context);
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html,
  });
}
