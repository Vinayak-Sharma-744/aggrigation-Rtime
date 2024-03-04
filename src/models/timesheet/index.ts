import mongoose from "mongoose";

const timeSheetSchema = new mongoose.Schema({

    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    _projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project"
    },
    taskName: String,
    startTime: Date,
    endTime: Date,
    description: String,
    IP_Address: String,
    status: {
        type: String,
        uppercase: true,
        enum: ["ACTIVE", "DELETED", "INACTIVE"],
        default: "ACTIVE",
    }

}, { timestamps: true })

export const timeSheetModel = mongoose.model("timesheet", timeSheetSchema)

