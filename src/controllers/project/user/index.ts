import { Request, Response,Router } from "express"
import { getAllProjectDetails, getProjectDetailsById } from "../../../services/project";
import { ApiError } from "../../../utils/apiError"
import { ApiResponse } from "../../../utils/apiResponse"

const userProjectRouter = Router();

userProjectRouter.get("/get", async (req: Request, res: Response) => {

    try {

        const projectResponse: any = await getAllProjectDetails()

        if (!projectResponse) return res.status(400).send(new ApiError(400, "Unable to Fetch Project Details"))

        const data = projectResponse.filter((item: any) => item.status !== "DELETED" && item.status !== "INACTIVE")

        if (data.length === 0) return res.status(400).send(new ApiError(400, "No Project Exist in Database"))

        res.status(200).send(new ApiResponse(200, data, "Project Details Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(400, "Error while Fetching Project Details in catch", error))
    }
})

userProjectRouter.get("/", async (req: Request, res: Response) => {

    const projectId = (req as any).query.projectId

    try {

        const projectResponse: any = await getProjectDetailsById(projectId)

        if (!projectResponse) return res.status(400).send(new ApiError(400, "Error while Fetching Project Details by Id"))

        const data = projectResponse

        if (data.status === "DELETED" || data.status === "INACTIVE") return res.status(400).send(new ApiError(400, "No data Exist with this Project Id"))

        res.status(200).send(new ApiResponse(200, projectResponse, "Project Details Fetched Successfully"))

    } catch (error: any) {

        res.status(500).send(new ApiError(400, "Error while Fetching Project Details by Id in catch", error))
    }
})

export default userProjectRouter