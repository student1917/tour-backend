export const otpEmailTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
    <h2>🔑 Your OTP Code</h2>
    <p>Here is your one-time password (OTP):</p>
    <h1 style="color: #4CAF50;">${otp}</h1>
    <p>This code will expire in <b>${process.env.OTP_EXPIRE_MIN} minutes</b>.</p>
    <p>If you didn’t request this, you can safely ignore this email.</p>
    <br/>
    <p>Best regards,<br/>ThuTam</p>
  </div>
`;
