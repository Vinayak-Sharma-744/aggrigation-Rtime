import axios from "axios"
import { getAllTimesheet } from "../services/timesheet/index"
import TimesheetCron from "../models/timesheetCron/index"
//cron job for timesheet
export const timesheetCron = async () => {

  console.log("cron is running for timesheet update");

  try {

    let userId = "";

    let page = 1;

    const limit = 20;

    let timesheet: any[] = [];

    while (true) {

      const response: any = await getAllTimesheet(limit, (page - 1) * limit);

      timesheet = timesheet.concat(response);

      if (response.length === 0) break

      else page++;

    }

    let timesheetData: any = {};

    for (let i = 0; i < timesheet.length; i++) {

      let element = timesheet[i];

      userId = element._userId as string;

      let currentTime = new Date().getHours();

      let previousTime = currentTime - 1;

      let today = new Date();
      // Get today's day, month, and year
      let todayDay = today.getDate();

      let todayMonth = today.getMonth() + 1; // Month is zero-based, so we add 1

      let todayYear = today.getFullYear();

      let createdAtDate = new Date(element.createdAt);
      // Get the day, month, and year of the createdAt date
      let createdAtDay = createdAtDate.getDate();

      let createdAtMonth = createdAtDate.getMonth() + 1; // Month is zero-based, so we add 1

      let createdAtYear = createdAtDate.getFullYear();

      console.log("today",todayDay,todayMonth,todayYear,"dfgvyreyfhkr",createdAtDay,createdAtMonth,createdAtYear)

      if (new Date(element.createdAt).getHours() <= currentTime && new Date(element.createdAt).getHours() > previousTime
        && todayYear === createdAtYear && todayMonth === createdAtMonth && todayDay === createdAtDay) {

        {
          axios.get(`${process.env.AUTH_SERVICE_URL}/internalapi/getuserbyid?userId=${element._userId}`)
            .then((user) => {

              timesheetData.username = user.data.result.name;
              timesheetData.projectname = element._projectId.projectName;
              timesheetData.taskname = element.taskName;
              timesheetData.starttime = element.startTime;
              timesheetData.endtime = element.endTime;
              timesheetData.description = element.description;
              timesheetData.status = element.status;

              TimesheetCron.create(timesheetData)

                .then(response => {

                  if (response) console.log("data has been inserted");

                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}