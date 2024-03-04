import { Request, Response } from "express"
import { projectNameUpdateSchemaValidator, projectRegisterSchemaValidator, projectStatusUpdateSchemaValidator } from "../../../middlewares/joiProject/index";
import { addProjectDetails, delPermanentProjectDetails, delProjectDetails, getAllProjectDetails, getProjectDetailsById, getProjectDetailsByName, updateProjectDetails } from "../../../services/project/index";
import { ApiError } from "../../../utils/apiError/index"
import { ApiResponse } from "../../../utils/apiResponse/index"
import { Router } from "express"
import { Project } from "../../../interface/index";

const adminProjectRouter = Router();

adminProjectRouter.get("/get", async (req: Request, res: Response) => {

    try {

        const projectResponse = await getAllProjectDetails() as Project[]

        if (!projectResponse) return res.status(400).send(new ApiError(400, "Error while Fetching Project Details"))

        const data = projectResponse.filter((item: any) => item.status !== "DELETED")

        if (data.length === 0) return res.status(400).send(new ApiError(400, "No data Exist in Project"))

        res.status(200).send(new ApiResponse(200, data, "Project Details Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(400, "Error while Fetching Project Details in catch", error))
    }
})

adminProjectRouter.get("/getById", async (req: Request, res: Response) => {

    const projectId = (req as any).query.projectId

    try {

        const projectResponse = await getProjectDetailsById(projectId) as Project[]

        if (!projectResponse) return res.status(400).send(new ApiError(400, "Error while Fetching Project Details by Id"))

        const data = projectResponse.filter((item: any) => item.status !== "DELETED")

        if (data.length === 0) return res.status(400).send(new ApiError(400, "No data Exist with this Project Id"))

        res.status(200).send(new ApiResponse(200, data, "Project Details Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(400, "Error while Fetching Project Details by Id in catch in admin", error))
    }
})

adminProjectRouter.post("/", projectRegisterSchemaValidator, async (req: Request, res: Response) => {

    try {

        const getDetails = await getProjectDetailsByName(req.body.projectName) as string[]

        if (getDetails.length !== 0) return res.status(400).send(new ApiError(400, "Project Name Already Exist"))

        const projectResponse = await addProjectDetails(req.body)

        if (!projectResponse) return res.status(400).send(new ApiError(400, "Unable to Add Data in Project"))

        res.status(200).send(new ApiResponse(200, projectResponse, "Project Added Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(400, "Error while Adding Data in Project in catch", error))
    }
})

adminProjectRouter.put("/update", projectNameUpdateSchemaValidator, async (req: Request, res: Response) => {

    const projectId = (req as any).query.projectId

    try {

        const projectResponse = await updateProjectDetails(projectId, req.body)

        if (!projectResponse) return res.status(400).send(new ApiError(400, "Unable to update Project Details"))

        res.status(200).send(new ApiResponse(200, projectResponse, "Project Details Updated Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(400, "Error while Updating Project Details in catch", error))
    }
})

adminProjectRouter.put("/del", async (req: Request, res: Response) => {

    const projectId = (req as any).query.projectId

    try {

        const projectResponse = await delPermanentProjectDetails(projectId) as Project

        if (!projectResponse) return res.status(400).send(new ApiError(400, "Unable to Delete Project Details"))

        const data = projectResponse

        // if (data.status === "DELETED") return res.status(400).send(new ApiError(400, "No data Exist with this Project Id"))

        res.status(200).send(new ApiResponse(200, projectResponse, "Project Details Deleted Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(400, "Error while Deleting Project Details in catch", error))
    }
})

adminProjectRouter.put("/temp", projectStatusUpdateSchemaValidator, async (req: Request, res: Response) => {

    const projectId = (req as any).query.projectId

    try {

        const projectResponse = await delProjectDetails(projectId, req.body)

        if (!projectResponse) return res.status(400).send(new ApiError(400, "Unable to Temporary Delete Project Details"))

        res.status(200).send(new ApiResponse(200, projectResponse, "Project Details Deleted Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(400, "Error while Deleting Project Details in catch", error))
    }
})

export default adminProjectRouter