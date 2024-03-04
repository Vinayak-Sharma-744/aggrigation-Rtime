import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({

    projectName: String,
    status: {
        type: String,
        uppercase: true,
        enum: ["ACTIVE", "DELETED", "INACTIVE"],
        default: "ACTIVE",
    }

}, { timestamps: true })

export const projectModel = mongoose.model("project", projectSchema)