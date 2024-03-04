import { Router, Request, Response } from "express"
import { getIncorrectTimesheetForUser, addTimeSheet, getRecentTimesheetByUserId, getTimeSheetByTimesheetId, getTimeSheetByuserId, updateTimeSheet } from "../../../services/timesheet"
import { ApiError } from "../../../utils/apiError"
import { ApiResponse } from "../../../utils/apiResponse"
import { timeSheetRegisterSchemaValidator, timeSheetUpdateSchemaValidator } from "../../../middlewares/joiTimesheet/index";
import { addDataActivityService, updateActivityService } from "../../../services/activity";
import { Task } from "../../../interface";

const userTimeSheetRouter = Router()

userTimeSheetRouter.post("/", timeSheetRegisterSchemaValidator, async (req: Request, res: Response) => {

    const IP_Address = req.headers.ip as string

    const userId = (req as any).headers.userid

    if (!userId) return res.status(400).send(new ApiError(400, "Invalid User Id"))

    try {

        const timeSheetResponse = await addTimeSheet(req.body, IP_Address, userId) as Task

        if (!timeSheetResponse) return res.status(400)
            .send(new ApiError(400, "Error while Adding Data in TimeSheet"))

        await addDataActivityService({
            _timesheetId: timeSheetResponse._id,
            _userId: userId,
            activity: [{
                taskName: timeSheetResponse.taskName,
                create: new Date().toISOString()
            }]
        })

        res.status(201).send(new ApiResponse(201, timeSheetResponse, "TimeSheet Added Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Adding Data in TimeSheet", error))
    }
})

userTimeSheetRouter.get("/get", async (req: Request, res: Response) => {

    // const userId = new mongoose.Types.ObjectId(req.headers.userid as string) || new mongoose.Types.ObjectId("65cdb427d4a72552099936b7")
    const userId = ((req as any).headers.userid) as string

    const page = Number(req.query.page as string)

    const limit = Number(req.query.limit as string) || 20

    const skip = (page - 1) * limit;

    const startDate: any = req.query.startDate;

    const endDate: any = req.query.endDate;

    // console.log("page", page, "limit", limit, "skip", skip, "startDate", startDate, "endDate", endDate)

    try {

        const timeSheetResponse = await getTimeSheetByuserId(userId, limit, skip, { status: { $nin: ["DELETED", "INACTIVE"] } }, startDate, endDate) as Task[]

        let data = timeSheetResponse
        // if (!timeSheetResponse) return res.status(400)
        //     .send(new ApiError(400, "Error while Fetching TimeSheet Details"))

        // let data = timeSheetResponse.filter((timeSheet: Task) => {

        //     // Filter entries based on start date, end date

        //     let isInRange = true

        //     if (startDate && endDate) {

        //         isInRange = ((new Date(timeSheet.createdAt) >= new Date(startDate)) && (new Date(timeSheet.createdAt) <= new Date(endDate)))

        //     }

        //     if (isInRange) return timeSheet
        // });

        const totalRecords = data.length;

        const totalPages = Math.ceil(totalRecords / limit);

        // Prepare response object
        const response = {
            page: page,
            perPage: limit,
            totalPages: totalPages,
            totalRecords: totalRecords,
            data: timeSheetResponse
        };

        res.status(200).send(new ApiResponse(200, response, "TimeSheet Details Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Fetching TimeSheet Details in catch in user", error))
    }
})

userTimeSheetRouter.get("/latest", async (req: Request, res: Response) => {

    const userId = (req as any).headers.userid

    try {

        const timeSheetResponse = await getRecentTimesheetByUserId(userId, { status: { $nin: ["DELETED", "INACTIVE"] } }) as Task[]

        if (!timeSheetResponse) return res.status(400)
            .send(new ApiError(400, "Error while Fetching TimeSheet Details"))

        // const data = timeSheetResponse.filter((timeSheet: Task) => timeSheet.status !== "DELETED" && timeSheet.status !== "INACTIVE")

        if (timeSheetResponse.length === 0) return res.status(200)
            .send(new ApiError(200, "No Latest data Exist in Timesheet"))

        res.status(200).send(new ApiResponse(200, timeSheetResponse, "TimeSheet Details Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Fetching TimeSheet Details", error))
    }
})

userTimeSheetRouter.get("/incorrect-timesheet", async (req: Request, res: Response) => {

    try {

        const userId = (req as any).headers.userid

        const timesheetIncorrect = await getIncorrectTimesheetForUser(userId, req.query.timeperiod as string) as any

        if (!timesheetIncorrect) return res.status(200)
            .send(new ApiError(200, "No Incorrect TimeSheet Details exists"))

        if (timesheetIncorrect.length === 0) return res
            .status(200).send(new ApiError(200, "No Incorrect TimeSheet Details exists for the given Timeframe"))

        res.status(200).send(new ApiResponse(200, { timesheets: timesheetIncorrect }, "Total Number of Incorrect TimeSheet Details for the given Timeframe Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Fetching Incorrect TimeSheet Details", error))
    }
})

userTimeSheetRouter.put("/update", timeSheetUpdateSchemaValidator, async (req: Request, res: Response) => {

    const timesheetId = (req as any).query.timesheetId

    const userId = (req as any).headers.userid

    const IP_Address = req.socket.remoteAddress as string

    try {

        const data = await getTimeSheetByTimesheetId(timesheetId, { status: { $nin: ["DELETED", "INACTIVE"] } }) as Task[]

        //check whether user has not requested for deleted timesheet ot insctive timesheet

        // const check = data.filter((timeSheet: Task) => timeSheet.status !== "DELETED" && timeSheet.status !== "INACTIVE")

        if (data.length === 0) return res.status(200)
            .send(new ApiError(200, "No data Exist with this Timesheet Id"))

        await updateActivityService(userId, timesheetId, req.body)

        const timeSheetResponse = await updateTimeSheet(timesheetId, req.body, IP_Address)

        if (!timeSheetResponse) return res.status(400)
            .send(new ApiError(400, "Error while Updating TimeSheet Details"))

        res.status(200)
            .send(new ApiResponse(200, timeSheetResponse, "TimeSheet Details Updated Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(500, "Error while Updating TimeSheet Details", error))

    }
})

export default userTimeSheetRouter
