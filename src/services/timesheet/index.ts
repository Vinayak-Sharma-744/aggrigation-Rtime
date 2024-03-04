import mongoose from "mongoose"
import axios from "axios"
import moment from "moment"
import { timeSheetModel } from "../../models/timesheet"
import { Id, TimeSheetData } from "../../interface"

export const addTimeSheet = (data: TimeSheetData, IP_Address: string, userId: string) => {

    return new Promise((resolve, reject) => {

        timeSheetModel.create({ ...data, IP_Address: IP_Address, _userId: userId }).then(resolve).catch(reject)

    })
}

export const updateTimeSheet = (timesheetId: Id, data: TimeSheetData, IP_Address: string) => {

    return new Promise((resolve, reject) => {

        timeSheetModel.findOneAndUpdate({ _id: timesheetId }, {

            startTime: data?.startTime,
            endTime: data?.endTime,
            description: data?.description,
            taskName: data?.taskName,
            IP_Address: IP_Address

        },
            { new: true }).then(resolve).catch(reject)
    })
}

export const getTimeSheetByuserId = (userId: string, limit: number, skip: number, search: object = {}, startDate: Date, endDate: Date) => {

    const query = {
        ...search,
        _userId: userId,
        startTime: { $gte: startDate }, // Filter for records with startTime greater than or equal to the provided startTime
        endTime: { $lte: endDate }
    }

    return new Promise((resolve, reject) => {

        timeSheetModel.find(query).sort({ startTime: -1 }).skip(skip).limit(limit).then(resolve).catch(reject)
    })
}

export const getTimeSheetByTimesheetId = (timesheetId: Id, search: object = {}) => {

    const query = {
        ...search,
        _id: timesheetId
    }

    return new Promise((resolve, reject) => {

        timeSheetModel.find(query).then(resolve).catch(reject)
    })
}

export const getRecentTimesheetByUserId = (userId: Id, search: object = {}) => {

    const query = {
        ...search,
        _userId: userId
    }

    return new Promise((resolve, reject) => {

        timeSheetModel.find(query).sort({ startTime: -1 }).limit(5).populate({ path: "_projectId", select: "projectName" }).then(resolve).catch(reject)
    })
}

export const getAllTimesheet = (limit: number = 0, skip: number = 0, search: object = {}) => {

    return new Promise((resolve, reject) => {

        timeSheetModel.find(search).sort({ startTime: -1 }).skip(skip).limit(limit).populate({ path: "_projectId", select: "projectName" }).lean().then(resolve).catch(reject)
        // timeSheetModel.find(search).populate("_projectId").skip(skip).limit(limit).then(resolve).catch(reject)
    })
}

export const getAllTimesheetWithPopulateProject = () => {

    return new Promise((resolve, reject) => {

        timeSheetModel.find().sort({ startTime: -1 }).populate({ path: "_projectId", select: "projectName" }).then(resolve).catch(reject)

    })
}

export const getAllUsersFilledTimsheetToday = () => {

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Set the time to the start of today

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // Set the time to the end of today

    return new Promise((resolve, reject) => {

        timeSheetModel.distinct("_userId", {
            startTime: { $gte: todayStart, $lte: todayEnd }
        }).then(resolve).catch(reject)
    })
}

export const findMissingTimesheetForThirtyDays = () => {

    return new Promise(async (resolve, reject) => {

        const currentDate = moment();
        const thirtyDaysAgo = moment().subtract(30, 'days');

        // If the current date is in a new month or year, adjust 30 days ago accordingly

        if (thirtyDaysAgo.month() !== currentDate.month() || thirtyDaysAgo.year() !== currentDate.year()) {
            thirtyDaysAgo.endOf('month');
        }

        const allUsers = await getAllUsers();

        const activeUserIds = allUsers.filter(user => user.status === true).map(user => user._id);

        timeSheetModel.aggregate([
            {
                $match: {
                    status: { $nin: ["INACTIVE", "DELETED"] },
                    startTime: { $gte: thirtyDaysAgo.startOf('day').toDate(), $lte: currentDate.endOf('day').toDate() }

                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    filledUserIds: { $addToSet: { $toString: '$_userId' } }
                }
            },
            {
                $project: {
                    date: '$_id',
                    unfilledUserIds: { $setDifference: [activeUserIds, "$filledUserIds"] },
                }
            }
        ]).then(resolve).catch(reject);
    })
}

export const timeSheetHoursByProject = () => {

    return new Promise((resolve, reject) => {

        timeSheetModel.aggregate([
            {
                $match: {
                    status: { $nin: ["INACTIVE", "DELETED"] }
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: '_projectId',
                    foreignField: '_id',
                    as: 'project'
                }
            },
            {
                $unwind: '$project' // Unwind the 'project' array to get individual project documents
            },
            {
                $match: {
                    'project.status': { $nin: ["INACTIVE", "DELETED"] }
                }
            },
            {
                $group: {
                    _id: '$_projectId',
                    totalHours: {
                        $sum: {
                            $divide: [{ $subtract: ['$endTime', '$startTime'] }, 3600000] // Convert milliseconds to hours
                        }
                    },
                    projectName: { $first: '$project.projectName' }
                }
            },
            {
                $addFields: {
                    totalHours: {
                        $round: ['$totalHours', 2]
                    }
                }
            },
            {
                $project: {
                    _id: 0, // Exclude _id field
                    projectName: 1, // Include projectName field
                    totalHours: 1 // Include totalHours field
                }
            }
        ]).then(resolve).catch(reject)
    })
}

// export const totalIncorrectTimesheetForAdmin = () => {

//     return new Promise((resolve, reject) => {

//         const today = new Date();
//         const previousDay = new Date(today);
//         previousDay.setDate(today.getDate() - 1); // Set to the previous day

//         const startOfDay = new Date(previousDay.getFullYear(), previousDay.getMonth(), previousDay.getDate(), 0, 0, 0);
//         const endOfDay = new Date(previousDay.getFullYear(), previousDay.getMonth(), previousDay.getDate(), 23, 59, 59);

//         timeSheetModel.aggregate([
//             {
//                 $match: {
//                     status: "ACTIVE", // Filter by status
//                     startTime: { $gte: startOfDay, $lte: endOfDay } // Filter by previous day
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$_userId",
//                     timesheets: { $push: "$$ROOT" } // Store the entire timesheet document in an array
//                 }
//             },
//             {
//                 $project: {
//                     // _userId: "$_id", // Rename _id to _userId
//                     timesheets: 1 // Keep the timesheets field
//                 }
//             }
//         ]).then(resolve).catch(reject)

//     })
// }

export const totalIncorrectTimesheetForAdmin = (query: string) => {

    return new Promise((resolve, reject) => {

        const today = new Date();

        let startDate, endDate;

        switch (query) {

            case "yesterday":

                startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0, 0);

                endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59);

                break;

            case "last_week":

                startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 0, 0, 0);

                endDate = today;

                break;

            case "last_month":

                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0);

                endDate = today;

                break;

            default:

                reject("Invalid query parameter");

                return

        }

        timeSheetModel.aggregate([
            {
                $match: {
                    status: "ACTIVE",
                    startTime: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: "$_userId",
                    totalHours: {
                        $sum: {
                            $divide: [{ $subtract: ["$endTime", "$startTime"] }, 1000 * 60 * 60] // Convert milliseconds to hours
                        }
                    }
                }
            },
            {
                $match: {
                    $or: [
                        { totalHours: { $lt: 8 } }, // Less than 8 hours
                        { totalHours: { $gt: 10 } } // Greater than 10 hours
                    ]
                }
            },
            {
                $project: {
                    _id: 1
                }
            }
            // {
            //     $count: "numberOfUsers" // Count the number of users matching the criteria
            // }
        ]).then(resolve).catch(reject);
    })
}

// export const getIncorrectTimesheetForUser = (userId: Id, query: string) => {

//     return new Promise((resolve, reject) => {

//         // const today = new Date();
//         // const previousDay = new Date(today);
//         // previousDay.setDate(today.getDate() - 1); // Set to the previous day

//         // const startOfDay = new Date(previousDay.getFullYear(), previousDay.getMonth(), previousDay.getDate(), 0, 0, 0);
//         // const endOfDay = new Date(previousDay.getFullYear(), previousDay.getMonth(), previousDay.getDate(), 23, 59, 59);

//         // const today = new Date();

//         // let startDate, endDate;

//         // switch (query) {

//         //     case "yesterday":

//         //         startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0, 0);

//         //         endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59);

//         //         console.log("startDate", startDate, "endDate", endDate)

//         //         break;

//         //     case "last_week":

//         //         startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 0, 0, 0);

//         //         endDate = today;

//         //         break;

//         //     case "last_month":

//         //         startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0);

//         //         endDate = today;

//         //         break;

//         //     default:

//         //         reject("Invalid query parameter");

//         //         return;
//         // }

//         // timeSheetModel.aggregate([
//         //     {
//         //         $match: {
//         //             status: "ACTIVE", 
//         //             startTime: { $gte: startDate, $lte: endDate },
//         //             _userId: userId
//         //         }
//         //     },
//         //     {
//         //         $group: {
//         //             _id: null,
//         //             totalHours: {
//         //                 $sum: {
//         //                     $divide: [{ $subtract: ["$endTime", "$startTime"] }, 1000 * 60 * 60]
//         //                 }
//         //             }
//         //         }
//         //     }
//         // ]).then(resolve).catch(reject)

//         // timeSheetModel.aggregate([
//         //     {
//         //         $match: {
//         //             status: "ACTIVE",
//         //             startTime: { $gte: startDate, $lte: endDate },
//         //             _userId: userId
//         //         }
//         //     },
//         //     {
//         //         $group: {
//         //             _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
//         //             totalHours: {
//         //                 $sum: {
//         //                     $divide: [{ $subtract: ["$endTime", "$startTime"] }, 1000 * 60 * 60] // Convert milliseconds to hours
//         //                 }
//         //             }
//         //         }
//         //     },
//         //     {
//         //         $match: {
//         //             totalHours: {
//         //                 $not: {
//         //                     $gte: 8,
//         //                     $lte: 10
//         //                 }
//         //             }
//         //         }
//         //     },
//         //     {
//         //         $project: {
//         //             _id: 0,
//         //             date: { $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: { $dateFromString: { dateString: "$_id" } } } },
//         //             totalHours: { $round: ["$totalHours", 2] }
//         //         }
//         //     }
//         // ]).then(resolve).catch(reject)

//         const today = new Date();
//         let startDate, endDate;

//         switch (query) {
//             case "yesterday":
//                 startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0, 0);
//                 endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59);
//                 break;
//             case "last_week":
//                 startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 0, 0, 0);
//                 endDate = today;
//                 break;
//             case "last_month":
//                 startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0);
//                 endDate = today;
//                 break;
//             default:

//                 return reject("Invalid query parameter");
//         }

//         timeSheetModel.aggregate([
//             {
//                 $match: {
//                     status: "ACTIVE",
//                     startTime: { $gte: startDate, $lte: endDate },
//                     _userId: userId
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$_id",
//                     totalHours: {
//                         $sum: {
//                             $divide: [{ $subtract: ["$endTime", "$startTime"] }, 1000 * 60 * 60] // Convert milliseconds to hours
//                         }
//                     }
//                 }
//             },
//             {
//                 $match: {
//                     $or: [
//                         { totalHours: { $lt: 8 } }, // Less than 8 hours
//                         { totalHours: { $gt: 10 } } // Greater than 10 hours
//                     ]
//                 }
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     totalHours: 1,

//                 }
//             }]).then(resolve).catch(reject)
//     })
// }

export const getIncorrectTimesheetForUser = (userId: Id, query: string) => {

    return new Promise((resolve, reject) => {

        const today = new Date();

        let startDate, endDate;

        switch (query) {

            case "yesterday":

                startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0, 0);

                endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59);

                break;

            case "last_week":

                startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 0, 0, 0);

                endDate = today;

                break;

            case "last_month":

                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0);

                endDate = today;

                break;

            default:

                reject("Invalid query parameter");

                return

        }


        timeSheetModel.aggregate([
            {
                $match: {
                    startTime: {
                        $gte: startDate,
                        $lte: endDate
                    },
                    _userId: mongoose.Types.ObjectId.createFromHexString(userId as unknown as string)
                }
            },
            {
                $addFields: {
                    day: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                    hoursWorked: { $divide: [{ $subtract: ["$endTime", "$startTime"] }, 1000 * 60 * 60] }
                }
            },
            {
                $group: {
                    _id: { userId: "$_userId", day: "$day" },
                    totalHours: { $sum: "$hoursWorked" }
                }
            },
            {
                $match: {
                    $or: [
                        { totalHours: { $lt: 8 } },
                        { totalHours: { $gt: 10 } }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    incorrectTimesheet: { $sum: 1 } // Count the number of incorrect days
                }
            }

        ]).then(resolve).catch(console.error)
    })
}

export const getAllUsers = async () => {

    const limit = 20;

    let allUsers: any[] = [];

    let nextPage = 1;

    try {

        while (true) {

            const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/internalapi/users?page=${nextPage}&limit=${limit}`);

            const { success, result } = response.data;

            if (!success || result.length === 0) break

            else nextPage++;

            allUsers = allUsers.concat(result);
        }

        return allUsers;

    } catch (error) {

        console.error('Error fetching users:', error);

        throw error;
    }

}

export const delPermanentTimesheetService = (timesheetId: Id) => {

    return new Promise((resolve, reject) => {

        timeSheetModel.findOneAndUpdate({ _id: timesheetId }, { $set: { status: "DELETED" } }, { new: true }).then(resolve).catch(reject)
    })
}

export const delTimesheetService = (timesheetId: Id, data: TimeSheetData) => {

    return new Promise((resolve, reject) => {

        timeSheetModel.findOneAndUpdate({ _id: timesheetId }, { $set: data }, { new: true }).then(resolve).catch(reject)
    })
}


