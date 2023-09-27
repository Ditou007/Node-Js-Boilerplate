import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: process.env.GMAIL,
    to,
    subject,
    html,
  }

  return transporter.sendMail(mailOptions)
}
