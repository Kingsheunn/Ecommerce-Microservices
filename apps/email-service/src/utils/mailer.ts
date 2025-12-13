import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMail = async ({
  email,
  subject,
  text,
}: {
  email: string;
  subject: string;
  text: string;
}) => {
  try {
    const res = await transporter.sendMail({
      from: process.env.FROM_EMAIL || '"E-commerce App" <akinwaleseun424@gmail.com>',
      to: email,
      subject,
      text,
    });

    console.log("MESSAGE SENT:", res.messageId);
    return res;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendMail;
