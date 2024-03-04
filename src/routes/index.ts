import { Router } from "express";
import userTimeSheetRouter from "../controllers/timesheet/user/index";
import adminTimesheetRouter from "../controllers/timesheet/admin/index";
import adminProjectRouter from "../controllers/project/admin/index";
import userProjectRouter from "../controllers/project/user/index";

const router = Router();

// timesheet routes
router.use("/timesheet", userTimeSheetRouter)
router.use("/timesheet/admin",adminTimesheetRouter)

// project routes
router.use("/project", userProjectRouter)
router.use("/project/admin",adminProjectRouter)


export default router