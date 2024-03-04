import { activityModel } from "../../models/activity"
import { getTimeSheetByTimesheetId } from "../timesheet"


export const addDataActivityService = async (data: any) => {

    return new Promise((resolve, reject) => {
        activityModel.create(data).then(resolve).catch(reject)
    })
}

export const updateActivityService = async (userId: any, timesheetId: any, data: any) => {

    const previousTask: any = await getTimeSheetByTimesheetId(timesheetId)

    const previousTaskName = previousTask[0].taskName

    const newTaskName = data.taskName

    if (previousTaskName === newTaskName) return null

    return new Promise((resolve, reject) => {

        activityModel.findOneAndUpdate({ _timesheetId: timesheetId }, { $push: { activity: { taskName: data.taskName, create: new Date().toISOString() } } }, { new: true }).then(resolve).catch(reject)

    })
}