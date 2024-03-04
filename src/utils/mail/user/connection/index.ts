import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID_GMAIL as string,
  process.env.CLIENT_SECRET_GMAIL as string,
  process.env.REDIRECT_URI_GMAIL as string
);

oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN_GMAIL as string,
});

const sendMail = async (name: string, email: string): Promise<any> => {
  try {
    interface OAuth2Credentials {
      type: 'OAuth2';
      user: string;
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      accessToken: string;
    }

    interface EmailTransportOptions {
      service: string;
      auth: OAuth2Credentials;
    }

    const { token } = await oAuth2Client.getAccessToken();

    const emailTransporterOptions: EmailTransportOptions = {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'vinayak@relinns.com',
        clientId: process.env.CLIENT_ID_GMAIL as string,
        clientSecret: process.env.CLIENT_SECRET_GMAIL as string,
        refreshToken: process.env.REFRESH_TOKEN_GMAIL as string,
        accessToken: token as string,
      },
    };

    const emailTransporter = nodemailer.createTransport(emailTransporterOptions);

    const currentDate = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate: string = currentDate.toLocaleDateString('en-US', options);

    const mailOptions = {
      from: 'RELINNS TECHNOLOGY',
      to: email,
      subject: 'Time Sheet Missed',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f8f8f8; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
  <img src="https://cdn.botpenguin.com/assets/upload/uc-AD-795bf8ea2560495c879b0258fbdb131b-zh-gK.jpeg" alt="Relinns Logo" style="max-width: 100%; height: auto; margin-bottom: 20px;">

  <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">Hi ${name},</h1>
  <p style="color: #555; font-size: 16px; line-height: 1.5;">Your time sheet for ${formattedDate} is pending. Kindly take a moment to fill it out professionally. Your timely submission is greatly appreciated and helps us maintain accurate records.</p>

  <p style="font-style: italic; color: #777; margin-top: 20px;">Thank you for your cooperation,<br>RELINNS TECHNOLOGY</p>
</div>

      `,
    };

    const result = await emailTransporter.sendMail(mailOptions);
    return result;
  } catch (error: any) {
    console.error('Error in sendMail:', error.message);
    return error;
  }
};

export default sendMail;
