import express from 'express'
const router = express.Router()
import { changePassword, checkCode, createUser, deleteAccount, getUserInformation, login, resetPassword, sendResetCode, updateUserInformation, validateUserEmail } from '../controllers/user.controller.js'
import authenticate from '../middlewares/auth.middleware.js';
import { validateLogin, validatePasswordReset, validateProfileUpdate, validateUserRegistration } from '../validators/user.validator.js';

router.get("/profile", authenticate, getUserInformation)

router.post("/register", validateUserRegistration, createUser)

router.patch("/verifyEmail", validateUserEmail)

router.post("/login", validateLogin, login)

router.post("/forgotPassword/sendResetCode", sendResetCode)

router.get("/forgotPassword/checkCode/:userId/:code", checkCode)

router.patch("/resetPassword/:userId", validatePasswordReset, resetPassword)

router.put("/profile/update", authenticate, validateProfileUpdate, updateUserInformation)

router.patch("/profile/changePassword", authenticate, changePassword)

router.delete("/profile/delete", authenticate, deleteAccount)

export default router;