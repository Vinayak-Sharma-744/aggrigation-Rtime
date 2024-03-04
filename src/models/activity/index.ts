import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({

    activity: [{ taskName: String, create: Date }],
    _timesheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "timesheet"
    },
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "user"
    }
}, { timestamps: true })

export const activityModel = mongoose.model("activity", activitySchema)