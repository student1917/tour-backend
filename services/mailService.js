import nodemailer from "nodemailer";

export const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"BookingTour-TravelWorld" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(info.messageId);

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
