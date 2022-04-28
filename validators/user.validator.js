import Joi from 'joi';
import { User } from "../models/user.model.js";
import _ from "lodash";

export async function validateUserRegistration(req, res, next) {
    try {
        const schema = Joi.object({
            Username: Joi.string().min(3).required().label("Username"),
            Email: Joi.string().min(5).required().label("Email"),
            Password: Joi.string().min(5).required().label("Password")
        })
        
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: error.message,
                message: "Unable to register the account."
            })
        }

        let checkEmail = await User.findOne({ Email: req.body.Email })
        if (checkEmail) return res.status(400).send("Email is already registered!")

        let checkUsername = await User.findOne({ Username: req.body.Username })
        if (checkUsername) return res.status(400).send("Username is already registered!")

        return next()
    }
    catch (ex) {
        return res.status(400).send(ex.message)
    }
}

export async function validateLogin(req, res, next) {
    try {
        const schema = Joi.object({
            Email: Joi.string().min(5).required().label("Email"),
            Password: Joi.string().min(5).required().label("Password"),
        })

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: error.message,
                message: "Unable to login to your account."
            })
        }

        return next()
    }
    catch (ex) {
        return res.status(400).send(ex.message)
    }
}

export async function validatePasswordReset(req, res, next) {
    try {
        const schema = Joi.object({
            newPassword: Joi.string().min(6).required()
        })
        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({
                error: error.message,
                message: "Unable to continue with password reset."
            })
        }

        return next()
    }
    catch (ex) {
        return res.status(400).send(ex.message)
    }
}

export async function validateProfileUpdate(req, res, next) {
    try {
        const schema = Joi.object({
            Username: Joi.string().min(3).label("Username"),
        })

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: error.message,
                message: "Unable to update profile."
            })
        }
        if (req.body.Username) {
            let checkUsername = await User.findOne({ Username: req.body.Username })
            if (checkUsername) return res.status(400).send("Username is already registered!")
        }

        return next()
    }
    catch (ex) {
        return res.status(400).send(ex.message)
    }
}

export async function validatePasswordChange(req, res, next) {
    try {
        const schema = Joi.object({
            oldPassword: Joi.string().min(6).required(),
            newPassword: Joi.string().min(6).required()
        })

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: error.message,
                message: "Unable to update profile."
            })
        }
        return next()
    }
    catch (ex) {
        return res.status(400).send(ex.message)
    }
}