import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { getUnfilledTimesheetUsers } from '../../../unfilledtimesheetusers';

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID_GMAIL as string,
  process.env.CLIENT_SECRET_GMAIL as string,
  process.env.REDIRECT_URI_GMAIL as string
);
oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN_GMAIL as string,
});

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

const sendMailAdmin = async (names: string, admin: string) => {
  try {
    const { token } = await oAuth2Client.getAccessToken();
    const transportOptions: EmailTransportOptions = {
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
    const transport = nodemailer.createTransport(transportOptions);

    const currentDate = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate: string = currentDate.toLocaleDateString('en-US', options);

    const mailOptions = {
      from: 'R Time (RELINNS TECHNOLOGY)',
      to: `${admin}`,
      subject: 'Users That Missed Time Sheet ${formattedDate}',
      text: `${names} missed time sheet for ${formattedDate}`,
      html: `
       <div
    style="
      font-family: Arial, sans-serif;
      background-color: #f8f8f8;
      padding: 20px;
      border-radius: 10px;
      max-width: 600px;
      margin: 0 auto;
    "
  >
    <img
      src="https://cdn.botpenguin.com/assets/upload/uc-AD-795bf8ea2560495c879b0258fbdb131b-zh-gK.jpeg"
      alt="Relinns Logo"
      style="max-width: 100%; height: auto; margin-bottom: 20px"
    />

    <h2 style="color: #333; font-size: 24px; margin-bottom: 10px">
      Users That Missed Time Sheet Today
    </h2>
    <p style="color: #555; font-size: 16px; line-height: 1.5">
      ${names}
    </p>

    <p style="font-style: italic; color: #777; margin-top: 20px">
      Thank you,<br />
      RELINNS TECHNOLOGY
    </p>
  </div>
      `,
    };

    const result = await transport.sendMail(mailOptions);

    return result;
  } catch (error: any) {
    console.error('Error in admin mail processing:', error.message);
    throw error; // Throw the error after logging
  }
};

export default sendMailAdmin;
