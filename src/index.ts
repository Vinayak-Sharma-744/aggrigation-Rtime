import cron from "node-cron"
import {timesheetCron} from "./helper"
import dotenv from 'dotenv';
import { connectDB } from './db/config';
import { app } from './app';
import adminMailGen from './utils/mail/admin/generation';
import userMailGen from './utils/mail/user/generation/index';
import userWhatsappGen from './utils/whatsapp/generation';
import scheduleReminderCronJob from './utils/googleChat/cron';
dotenv.config();

connectDB().then(() => {
    
    app.on("error", (error) => {
        console.log("error in listen", error)
        throw error
    })
    app.listen(process.env.PORT, () => {
        console.log(`Server is live at ${process.env.PORT}`)
    })
})

.then(()=>{
    cron.schedule('00 22 * * *', async () => {  

        // console.log('Start whatsapp cron'); 
        // await userWhatsappGen().catch((err) => {
        // console.log('Cron error in userWhatsappGen:', err);
        // throw err
        // });

        console.log('Start userMailGen cron');
        await userMailGen().catch((err) => {
          console.log('Cron error in userMailGen:', err);
        throw err
        });
      
        console.log('Start adminMailGen cron');
        await adminMailGen().catch((err) => {
          console.log('Cron error in adminMailGen:', err);
          throw err
        });

        console.log('google chat cron')
        await scheduleReminderCronJob().catch((err)=>{
          console.log("cron error in chat message", err);
          throw err
        })
    });

  })
.catch((error) => {
    console.log("DB Connection error", error)
})
