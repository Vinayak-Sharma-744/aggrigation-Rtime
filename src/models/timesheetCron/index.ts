import mongoose from "mongoose";

const timesheetSchema: mongoose.Schema = new mongoose.Schema({
    "username": {
        type: String,
        required: true
    },
    "projectname": {
        type: String,
        required: true
    },
    "taskname": {
        type: String,
        required: true
    },
    "starttime": {
        type: Date,
        required: true
    },
    "endtime": {
        type: Date,
        required: true
    },
    "description": {
        type: String
    },
    "status": {
        type: String
    }
}, { timestamps: true })

const TimesheetCron = mongoose.model("timesheetcron", timesheetSchema);
export default TimesheetCron;