import Joi from "joi"
import { ApiError } from "../../utils/apiError"

export const projectResgisterSchema = Joi.object({

    projectName: Joi.string().required(),

})

export const projectNameUpdateSchema = Joi.object({

    projectName: Joi.string().required(),

})

export const projectStatusUpdateSchema = Joi.object({

    status: Joi.string().valid("ACTIVE", "INACTIVE", "DELETED").required(),
})

export const projectRegisterSchemaValidator = (req: any, res: any, next: any) => {

    try {

        const { error } = projectResgisterSchema.validate(req.body)

        if (error) return res.status(400).send(new ApiError(400, error.details[0].message.split('\"').join('')))

        next()

    } catch (error) {

        res.status(400).send(new ApiError(400, "Joi Validation Error in Add Project Details"))
    }
}

export const projectNameUpdateSchemaValidator = (req: any, res: any, next: any) => {

    try {

        const { error } = projectNameUpdateSchema.validate(req.body)

        if (error) return res.status(400).send(new ApiError(400, error.details[0].message.split('\"').join('')))

        next()

    } catch (error) {

        res.status(401).send(new ApiError(401, "Joi Validation Error in Update Project Details"))
    }
}

export const projectStatusUpdateSchemaValidator = (req: any, res: any, next: any) => {

    try {

        const { error } = projectStatusUpdateSchema.validate(req.body)

        if (error) return res.status(400).send(new ApiError(400, error.details[0].message.split('\"').join('')))

        next()

    } catch (error) {

        res.status(401).send(new ApiError(401, "Joi Validation Error in Update Project Details"))
    }

}