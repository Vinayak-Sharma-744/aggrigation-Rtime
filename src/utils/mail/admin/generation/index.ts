import sendMailAdmin from '../connection';
import { getUnfilledTimesheetUsers } from '../../../unfilledtimesheetusers';
import * as cron from 'node-cron';
import getUserString from '../userString';
import fetchAdmin from '../fetchAdmin';

const adminMailGen = async () => {
  try {
    const admins = await fetchAdmin();
    const usersNamesThatMissedSheet = await getUserString();
    console.log('Users are:', usersNamesThatMissedSheet);

    for (const key of admins) {
      const { email, time, name } = key;

      if (!usersNamesThatMissedSheet) {
        console.log('Names are:', usersNamesThatMissedSheet);
        console.log('Everyone filled timesheet today');
        return;
      } else {
        // console.log(`Sending mails to ${name}`);
        // const currentTime = new Date();
        // const preferredTime = new Date(currentTime);
        // const TIME = time.split(':');
        // const hr = TIME[0];
        // const minute = TIME[1];
        // console.log(`Hours are ${hr}, Minutes are ${minute}`);

        // preferredTime.setHours(parseInt(hr, 10), parseInt(minute, 10), 0, 0);

        // if (currentTime <= preferredTime && preferredTime < new Date(currentTime.getTime() + 10 * 60 * 1000)) {
          // console.log(`******** im going to send mail to admin ${name} `);
          
          await sendMailAdmin(usersNamesThatMissedSheet as string, email as string).catch((error) => {
            console.log(error);
            throw error;
          });

          // console.log(`Mail sent to ${name} at ${email}`);
        // } else {
        //   continue;
        // }
        console.log(`Mail sent successfully to ${name}`);
      }
    }
  } catch (error) {
    console.error(`Error in admin mailGen: ${error}`);
    throw error;
  }
};

export default adminMailGen;
