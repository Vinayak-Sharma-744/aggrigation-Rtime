import { getUnfilledTimesheetUsers } from "../../unfilledtimesheetusers";
import getTextMessageInput from "../template/getTextMessageInput";
import sendMessage from "../connection/index";

const userWhatsappGen = async () => {
  getUnfilledTimesheetUsers()
    .then(({ numberOfUnfilledUsers }) => {
      numberOfUnfilledUsers.forEach(
        async (user: {phone: number; name: string; status: boolean; time: string;}) => {

          if (!user.status) {

            return;

          } else {

            console.log(` For Whatsapp name - ${user.name} , time - ${user.time}`);

            try {
              console.log("start cron");

              const currentTime = new Date();
              const preferredTime = new Date(currentTime);
              const TIME = user.time.split(":");
              const hr = TIME[0];
              const minute = TIME[1];
              console.log(`hours are ${hr} , minutes are ${minute}`);

              preferredTime.setHours(parseInt(hr, 10),parseInt(minute, 10),0,0);

              if (currentTime <= preferredTime && preferredTime < new Date(currentTime.getTime() + 10 * 60 * 1000)) {

                const data = getTextMessageInput("+919464429459", user.name);

                sendMessage(data);

                console.log(`whatsapp message sent to ${user.name}`);
              }
              // console.log("cron end");
            } catch (error) {

              console.log(`error while execution of whatsapp time func ${error}`);

              throw error;

            }
          }
        }
      );
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

export default userWhatsappGen;
