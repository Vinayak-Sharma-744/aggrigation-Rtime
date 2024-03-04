import { getUnfilledTimesheetUsers } from "../../../unfilledtimesheetusers/index";
import sendMail from "../connection/index";

const userMailGen = async () => {
  console.log(`Let's start`);

  try {
    const { numberOfUnfilledUsers } = await getUnfilledTimesheetUsers();

    for (const user of numberOfUnfilledUsers) {
      if (!user.status) {
        continue;
      } else {
        console.log(`Before cron: Name - ${user.name}, Time - ${user.time}`);
        try {
          // console.log('User function start');
          // const currentTime = new Date();
          // const preferredTime = new Date(currentTime);
          // const TIME = user.time.split(':');
          // const hr = TIME[0];
          // const minute = TIME[1];
          // console.log(`Hours are ${hr}, Minutes are ${minute}`);

          // preferredTime.setHours(parseInt(hr, 10), parseInt(minute, 10), 0, 0);

          // if (currentTime <= preferredTime && preferredTime < new Date(currentTime.getTime() + 10 * 60 * 1000)) {
            console.log(`going to send mail to user ${user.name}`);
            
            await sendMail(user.name as string, user.email as string);
            console.log(`Mail sent to ${user.name} at ${user.email}`);
          // } else {
          //   continue;
          // }
          console.log('User function end');
        } catch (error) {
          console.log(`Error while execution of time func ${error}`);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export default userMailGen;
