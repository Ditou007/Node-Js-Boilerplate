import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'zoho',
  host: 'smtp.zoho.com',
  port: 587,
  auth: {
    user: process.env.ZOHO_EMAIL as string,
    pass: process.env.ZOHO_PASSWORD as string,
  },
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: process.env.ZOHO_EMAIL as string,
    to,
    subject,
    html,
  }

  return transporter.sendMail(mailOptions)
}
