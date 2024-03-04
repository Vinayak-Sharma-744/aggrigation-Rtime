import Joi from "joi"
import { ApiError } from "../../utils/apiError/index"

const timeSheetResgisterSchema = Joi.object({

    _projectId: Joi.string().required(),
    taskName: Joi.string().required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    description: Joi.string().required(),

})

const timeSheetDataUpdateSchema = Joi.object({

    _projectId: Joi.string().optional(),
    taskName: Joi.string().optional(),
    startTime: Joi.date().optional(),
    endTime: Joi.date().optional(),
    description: Joi.string().optional(),

})

const timeSheetStatusUpdateSchema = Joi.object({

    status: Joi.string().valid("ACTIVE", "INACTIVE", "DELETED").required(),
})

export const timeSheetRegisterSchemaValidator = (req: any, res: any, next: any) => {

    try {

        const { error } = timeSheetResgisterSchema.validate(req.body)

        if (error) return res.status(400).send(new ApiError(400, error.details[0].message.split('\"').join('')))

        next()

    } catch (error) {
        res.status(400).send(new ApiError(400, "Joi Validation Error in Add TimeSheet Details"))
    }
}

export const timeSheetUpdateSchemaValidator = (req: any, res: any, next: any) => {

    try {

        const { error } = timeSheetDataUpdateSchema.validate(req.body)

        if (error) return res.status(400).send(new ApiError(400, error.details[0].message.split('\"').join('')))

        next()

    } catch (error) {

        res.status(401).send(new ApiError(401, "Joi Validation Error in Update TimeSheet Details"))
    }
}

export const timeSheetStatusUpdateSchemaValidator = (req: any, res: any, next: any) => {

    try {

        const { error } = timeSheetStatusUpdateSchema.validate(req.body)

        if (error) return res.status(400).send(new ApiError(400, error.details[0].message.split('\"').join('')))

        next()

    } catch (error) {

        res.status(401).send(new ApiError(401, "Joi Validation Error in Update TimeSheet Details"))
    }
}