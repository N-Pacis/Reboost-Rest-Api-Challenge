import Joi from 'joi';
import _ from "lodash";

export async function validatePostCreation(req, res, next) {
    try {
        const schema = Joi.object({
            body: Joi.string().required().label("Body"),
            category: Joi.string().required().label("Category"),
        })
        
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: error.message,
                message: "Unable to create the post."
            })
        }

        return next()
    }
    catch (ex) {
        return res.status(400).send(ex.message)
    }
}


export async function validatePostUpdate(req, res, next) {
    try {
        const schema = Joi.object({
            body: Joi.string().label("Body"),
            category: Joi.string().label("Category"),
        })
        
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: error.message,
                message: "Unable to update the post."
            })
        }


        return next()
    }
    catch (ex) {
        return res.status(400).send(ex.message)
    }
}
