import mongoose from "mongoose";
import axios from "axios";
import { parse } from "json2csv";
import { Router, Response, Request } from "express";
import { delPermanentTimesheetService, delTimesheetService, findMissingTimesheetForThirtyDays, getAllTimesheet, getAllTimesheetWithPopulateProject, getAllUsers, getAllUsersFilledTimsheetToday, addTimeSheet, timeSheetHoursByProject, totalIncorrectTimesheetForAdmin, getTimeSheetByTimesheetId } from "../../../services/timesheet/index";
import { ApiError } from "../../../utils/apiError/index";
import { ApiResponse } from "../../../utils/apiResponse/index";
import { timeSheetRegisterSchemaValidator, timeSheetStatusUpdateSchemaValidator } from "../../../middlewares/joiTimesheet/index"
import { Count, Task, TimeSheet, User, UserData, unFilledUsersByDate } from "../../../interface/index";

const adminTimesheetRouter = Router()

adminTimesheetRouter.post("/", timeSheetRegisterSchemaValidator, async (req: Request, res: Response) => {

    const IP_Address = req.headers.ip as string

    const userId = (req as any).headers.userid

    if (!userId) return res.status(400).send(new ApiError(400, "Invalid User Id"))

    try {

        const timeSheetResponse = await addTimeSheet(req.body, IP_Address, userId) as Task[]

        if (!timeSheetResponse) return res.status(200).send(new ApiError(200, "Unable to Add Data in TimeSheet"))

        res.status(201).send(new ApiResponse(201, timeSheetResponse, "TimeSheet Added Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Adding Data in TimeSheet", error))
    }
})

adminTimesheetRouter.get("/get", async (req: Request, res: Response) => {

    const page = Number(req.query.page as string)

    const checkLimit = Number(req.query.limit as string)

    const limit = checkLimit ? checkLimit : 20

    const skip = (page - 1) * limit;

    try {

        const timeSheetResponse = await getAllTimesheet(limit, skip, { status: { $ne: "DELETED" } }) as Task[]

        let data = timeSheetResponse

        if (!timeSheetResponse) return res.status(200)
            .send(new ApiError(200, "Unable to Fetch TimeSheet Details"))

        if (data.length === 0) return res.status(200)
            .send(new ApiError(200, "No data Exist in Timesheet"))

        const totalRecords = data.length;

        const totalPages = Math.ceil(totalRecords / limit);

        for (let timeSheet of data) {

            const Id = timeSheet._userId

            const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/internalapi/getUserById`, { params: { userId: Id } })

            const username = response.data.result?.name;

            if (username !== null) timeSheet.username = username;
        }

        // Prepare response object

        const response = {
            page: page,
            perPage: limit,
            totalPages: totalPages,
            totalRecords: totalRecords,
            data: data
        };

        res.status(200).send(new ApiResponse(200, response, "TimeSheet Details Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Fetching TimeSheet Details", error))
    }
})

adminTimesheetRouter.get("/export", async (req: Request, res: Response) => {

    const startDate = req.query.startDate as string

    const endDate = req.query.endDate as string

    try {

        const timeSheetResponse = await getAllTimesheetWithPopulateProject() as TimeSheet[]

        let data = timeSheetResponse.filter((timeSheet: TimeSheet) => {

            timeSheet.projectName = timeSheet._projectId.projectName

            // Filter entries based on start date, end date

            let isInRange = false;

            if (startDate && endDate) {

                isInRange = (new Date(timeSheet.createdAt) >= new Date(startDate) && new Date(timeSheet.createdAt) <= new Date(endDate))

            }
            return (
                isInRange &&
                timeSheet.status !== "DELETED" &&
                timeSheet.status !== "INACTIVE"
            );
        });

        const fields = [
            "_userId",
            "projectName",
            "taskName",
            "startTime",
            "endTime",
            "description",
            "IP_Address",
            "status",
            "createdAt",
        ];

        if (data.length === 0) return res.status(200).send(new ApiError(200, "No data Exist in Timesheet for this Time Log"))

        const csvData = parse(data, { fields });

        // Set response headers to trigger file download
        res.setHeader('Content-Type', 'text/csv');

        res.setHeader('Content-Disposition', 'attachment; filename=timesheet.csv');

        // Send CSV data as response
        // res.status(200).send(new ApiResponse(200, csvData, "TimeSheet Details Exported Successfully"))

        res.download(csvData)

    } catch (error: any) {

        res.status(500).send(new ApiError(400, "Error while creating CSV file for TimeSheet Details", error))
    }
})

adminTimesheetRouter.get("/get/count-employe-today", async (req: Request, res: Response) => {

    try {

        const timeSheetResponse = await getAllTimesheet() as Task[]

        if (!timeSheetResponse) return res.status(200)
            .send(new ApiError(200, "No Timesheet exist in database in admin"))

        const numberOfFilledUsers = await getAllUsersFilledTimsheetToday() as UserData[]

        const totalUsers = (await getAllUsers()).filter((user: User) => user.status === true) as User[]

        const numberOfUnfilledUsers: any = totalUsers.filter((user: User) => {
            // Check if the user _id is not present in filledTimeSheets array
            return !numberOfFilledUsers.some((filledUser: any) => filledUser._id.toString() === user._id.toString());

        });

        const numberOfUnfilledUsersData = numberOfUnfilledUsers.map((user: User) => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            time: user.time,
            phone: user.phone
        }));

        if (req.query.admin) return res.status(200).send(new ApiResponse(200, { todayNumberOfFilledUsers: numberOfFilledUsers.length, todayNumberOfUnfilledUsers: numberOfUnfilledUsers.length }, "Count Today Users TimeSheet Details Fetched Successfully"))

        res.status(200).send(new ApiResponse(200, { todayNumberOfFilledUsers: numberOfFilledUsers, todayNumberOfUnfilledUsers: numberOfUnfilledUsersData }, "Count Today Users TimeSheet Details Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Fetching TimeSheet Filled Details in admin in catch", error))
    }
})

adminTimesheetRouter.get("/total-timesheet-hours", async (req: Request, res: Response) => {

    const today: string = new Date().toISOString().split("T")[0];

    try {

        const timeSheetResponse = await getAllTimesheet() as Task[]

        let totalHours: number = timeSheetResponse.reduce((total: number, timeSheet: Task) => {

            const startDate: string = new Date(timeSheet.startTime).toISOString().split("T")[0]; // Extract date from startTime

            const endDate: string = new Date(timeSheet.endTime).toISOString().split("T")[0]; // Extract date from endTime

            if (startDate === today && endDate === today && timeSheet.status !== "DELETED" && timeSheet.status !== "INACTIVE") {

                const start: Date = new Date(timeSheet.startTime)

                const end: Date = new Date(timeSheet.endTime)

                const diff = end.getTime() - start.getTime()

                total += (diff) / (1000 * 60 * 60)
            }

            return total

        }, 0)

        totalHours = parseFloat(totalHours.toFixed(2));

        return res.status(200).send(new ApiResponse(200, totalHours, "Total TimeSheet Hours Details Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Fetching Total TimeSheet Hours Details in admin in catch", error))
    }
})

adminTimesheetRouter.get("/timesheet-miss-thirty-days", async (req: Request, res: Response) => {

    try {

        const missingUsersByDate = await findMissingTimesheetForThirtyDays() as unFilledUsersByDate[]

        if (req.query.admin) {

            let count: Count = {}

            missingUsersByDate.forEach((user: unFilledUsersByDate) => {

                count[user.date] = user.unfilledUserIds.length;
            })

            return res.status(200).send(new ApiResponse(200, count, "TimeSheet Details for 30 Days with Date Fetched Successfully"))

        }

        res.status(200).send(new ApiResponse(200, missingUsersByDate, "TimeSheet Details for 30 Days with Date Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Fetching Miss TimeSheet Details for 30 Days", error))
    }
})

adminTimesheetRouter.get("/timesheet-hours-by-project", async (req: Request, res: Response) => {

    try {

        const result = await timeSheetHoursByProject()

        if (!result) return res.status(200)
            .send(new ApiError(200, "Unable to Fetch TimeSheet Hours By Project Details in Admin"))

        res.status(200).send(new ApiResponse(200, result, "TimeSheet Hours Filled according to Project Details Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Fetching TimeSheet Hours By Project Details in admin in catch", error))
    }
})

adminTimesheetRouter.get("/incorrect-timesheet", async (req: Request, res: Response) => {

    try {

        const timeSheetResponse = await totalIncorrectTimesheetForAdmin(req.query.timeperiod as string) as Task[]

        // if (!timeSheetResponse) return res.status(400).send(new ApiError(400, "Error while Fetching TimeSheet Details"))

        // const net = timeSheetResponse.filter((timesheet: any) => {

        //     const groupHours = timesheet.timesheets.reduce((groupTotal: any, timesheet: any) => {

        //         if (timesheet.endTime && timesheet.startTime) {

        //             const countTime = new Date(timesheet.endTime).getTime() - new Date(timesheet.startTime).getTime();

        //             return groupTotal + (countTime / (1000 * 60 * 60));
        //         }

        //         return groupTotal;

        //     }, 0);

        //     if (groupHours < 8 || groupHours > 10) return timesheet
        // })

        if (req.query.admin) return res.status(200).send(new ApiResponse(200, timeSheetResponse.length, "Total Number of Incorrect TimeSheet Fetched Successfully"))

        res.status(200).send(new ApiResponse(200, timeSheetResponse, "Total Number of Incorrect TimeSheet Details Fetched Successfully"))
    }
    catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Fetching TimeSheet Details", error))
    }


})

adminTimesheetRouter.get("/timesheetbyId", async (req: Request, res: Response) => {

    const timesheetId = (req as any).query.timesheetId;

    try {

        const timeSheetResponse = await getTimeSheetByTimesheetId(timesheetId) as Task[]

        if (!timeSheetResponse) return res.status(400)
            .send(new ApiError(400, "Unable to Fetch TimeSheet Details"))

        const data = timeSheetResponse.filter((timeSheet: Task) => timeSheet.status !== "DELETED")

        if (data.length === 0) return res.status(200)
            .send(new ApiError(200, "No data Exist with this Timesheet Id"))

        res.status(200).send(new ApiResponse(200, timeSheetResponse, "TimeSheet Details Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Fetching TimeSheet Details", error))
    }
})

adminTimesheetRouter.put("/temp", timeSheetStatusUpdateSchemaValidator, async (req: Request, res: Response) => {

    const timesheetId = new mongoose.Types.ObjectId(req.query.timesheetId as string);

    try {

        const data = await getTimeSheetByTimesheetId(timesheetId) as Task[]

        if (data[0].status === "DELETED") return res.status(200)
            .send(new ApiError(200, "No data Exist with this Timesheet Id"))

        const timeSheetResponse = await delTimesheetService(timesheetId, req.body)

        if (!timeSheetResponse) return res.status(200)
            .send(new ApiError(400, "Unable to change the status of TimeSheet Details"))

        res.status(200).send(new ApiResponse(200, timeSheetResponse, "TimeSheet Details changing status of Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while changing status of TimeSheet Details", error))
    }
})

adminTimesheetRouter.put("/del", async (req: Request, res: Response) => {

    const timesheetId = new mongoose.Types.ObjectId(req.query.timesheetId as string);

    try {

        const data = await getTimeSheetByTimesheetId(timesheetId) as Task[]

        if (data[0].status === "DELETED") return res.status(200)
            .send(new ApiError(200, "No data Exist with this Timesheet Id"))

        const timeSheetResponse = await delPermanentTimesheetService(timesheetId)

        if (!timeSheetResponse) return res.status(400)
            .send(new ApiError(400, "Unable to Delete TimeSheet Details"))

        res.status(204).send(new ApiResponse(204, timeSheetResponse, "TimeSheet Details Deleted Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(400, "Error while Deleting TimeSheet Details", error))
    }
})

export default adminTimesheetRouter