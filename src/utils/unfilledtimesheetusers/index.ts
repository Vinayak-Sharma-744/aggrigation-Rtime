import { getAllTimesheet, getAllUsers, getAllUsersFilledTimsheetToday } from "../../services/timesheet"

export const getUnfilledTimesheetUsers = async () => {

    const timeSheetResponse: any = await getAllTimesheet()

    if (!timeSheetResponse) return {error:"No Timesheet Exist in Database"}

    const filledTimeSheets: any = await getAllUsersFilledTimsheetToday()

    const totalUsers: any = await getAllUsers()

    const numberOfFilledUsers = filledTimeSheets;

    const numberOfUnfilledUsers = totalUsers.filter((user: any) => !filledTimeSheets.includes(user._id));

    return { numberOfFilledUsers, numberOfUnfilledUsers }

} 