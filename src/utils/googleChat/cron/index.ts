import cron from "node-cron";
import { fetchData } from "../fetchData/index";
import { sendData } from "../sendReminder/index";
import { getUnfilledTimesheetUsers } from "../../unfilledtimesheetusers/index";
import getChatUserString from "../usersString";
const notFilled: string[] = [];

const scheduleReminderCronJob = async () => {
  const users: string = await getChatUserString();
  console.log(users);

  getUnfilledTimesheetUsers()
    .then(({ numberOfUnfilledUsers }) => {
      numberOfUnfilledUsers.forEach(
        (user: { _id: string; status: boolean }) => {

          if (user.status === false) {

            return;

          } else {

            notFilled.push(user._id as string);
            
          }
        }
      );
    })

    .catch((err) => console.log("Data don't get"));

  console.log("Running sendReminder...");

  await sendData(users as string);

  console.log("Reminder sent successfully!");
};

export = scheduleReminderCronJob;
