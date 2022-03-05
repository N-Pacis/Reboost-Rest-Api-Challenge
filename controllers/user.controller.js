import { User } from "../models/user.model.js";
import lodash from "lodash";
const { pick } = lodash;
import { genSalt, hash } from "bcrypt";
import { sendEmail } from "../utils/emailConfig.utils.js";
import bcrypt from "bcrypt";
const { compare } = bcrypt;


export const getUserInformation = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select(
      "-Password -verificationCode -isVerified -passwordResetCode -requestPasswordReset"
    );
    if (!user) return res.status(404).send("User not found!");
    return res.send({
      status: 200,
      message: "ok",
      data: user,
    });
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const createUser = async (req, res) => {
  try {
    let user = new User(
      pick(req.body, [
        "Username",
        "Email",
        "Password"
      ])
    );

    const time = new Date();
    user.CreatedAt = time;
    
    let randomCode = Math.floor(1000 + Math.random() * 9000);
    user.verificationCode = "REB" + randomCode.toString();
    let checkVerificationCode = await User.findOne({
      verificationCode: user.verificationCode,
    });
    if (checkVerificationCode) {
      let randomCode = Math.floor(2000 + Math.random() * 80000);
      user.verificationCode = "REB" + randomCode.toString();
    }
    const salt = await genSalt(10);
    user.Password = await hash(user.Password, salt);

    try {
      const subject = "Reebost REST API System: Verify Your Email";
      const html = `<body>
            <div style="width:90%;margin: -2% 2% 2% 4%;box-shadow: 2px 2px 10px rgb(196, 196, 196);background-color: #fff;border-radius: 5px;position: relative;padding-bottom: 4%;">
                <h1 style="font-family: sans-serif;font-size: 30px;font-weight: bold;text-align: center;color:#265DE7;text-transform: uppercase;padding-top: 2%;">Reebost REST API System</h1>
                <p style="font-family: sans-serif;font-size: 18px;margin: 2% 1.5%;"><span style="font-weight: bold;">Verify Your Email Using the code below.</span> You will find the respective field where you will enter the provided code. This is a One Time Pin which means it can only be used once. If you did not request this please ignore the message.If you did then copy the following Code.</p>
                <div style="display: flex;">
                    <div style="text-align:center;font-family:sans-serif;font-weight:bold;font-size:20px;padding:0.9% 0% 0.5% !important;background-color: rgba(9, 44, 9, 0.185); width: 20%;margin-left: 45%;">${
                      user.verificationCode
                    }</div>
                </div>
            </div>
                <p style="background-color: #265DE7;width: 100%;margin-top: 1%;color: #fff;text-align: center;font-family: sans-serif;padding:1% 0%;"><span style="font-weight: bold;">Reebost </span>&copy; ${time.getFullYear()}</p>
        </body>`;
      let checkSendEmail = await sendEmail(user.Email, subject, html);
      if (checkSendEmail == "Success") {
        await user.save();
        return res.status(201).send({
          message:
            "Registered successfully. Check your email to complete email verification",
        });
      } else {
        return res.status(400).send({
          message: "Unable to send the email for verification",
        });
      }
    } catch (ex) {
      res.status(400).send(ex.message);
    }
  } catch (ex) {
    res.status(500).send(ex.message);
  }
};

export const validateUserEmail = async (req, res) => {
  const code = req.body.code;
  if (!code)
    return res.status(400).send("You must provide a verification code!");
  try {
    let checkCode = await User.findOne({
      verificationCode: code,
      isVerified: false,
    });
    if (!checkCode) return res.status(400).send("Invalid verification code");

    let user = await User.findOneAndUpdate(
      { verificationCode: code },
      { isVerified: true },
      { new: true }
    );
    res
      .status(200)
      .send(
        "Email verification completed successfully. You can now login to your account!"
      );
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const login = async (req, res) => {
  try {
    let user = await User.findOne({ Email: req.body.Email });
    if (!user) return res.status(400).send("Invalid Email or Password!");
    
    if (!user.isVerified) {
      return res
        .status(400)
        .send(
          "You must first confirm your email. Check your inbox for confirmation code!"
        );
    }

    const validPassword = await compare(req.body.Password, user.Password);
    if (!validPassword)
      return res.status(400).send("Invalid Email or Password!");

    const token = user.generateAuthToken();
    let time = new Date()
    user.LastLoggedIn = time
    await user.save()

    res.header("Authorization", token).send({
      status: 200,
      message: "Login Successful",
      token,
      data: user,
    });
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const sendResetCode = async (req, res) => {
  try {
    if (!req.body.Email) return res.status(400).send("Email is required");

    let user = await User.findOne({ Email: req.body.Email });
    if (!user)
      return res
        .status(400)
        .send("Unable to find the user with the provided email");

    const time = new Date();
    let resetCode = Math.floor(10000 + Math.random() * 90000);

    const subject = "Reebost REST API System: Reset your password";
    const html = `<body>
        <div style="width:90%;margin: -2% 2% 2% 4%;box-shadow: 2px 2px 10px rgb(196, 196, 196);background-color: #fff;border-radius: 5px;position: relative;padding-bottom: 4%;">
            <h1 style="font-family: sans-serif;font-size: 30px;font-weight: bold;text-align: center;color: #265DE7;text-transform: uppercase;padding-top: 2%;">Reebost REST API System</h1>
            <p style="font-family: sans-serif;font-size: 18px;margin: 2% 1.5%;"><span style="font-weight: bold;">Reset your password Using the code below.</span> You will find the respective field where you will enter the provided code. This is a One Time Pin which means it can only be used once and it is only valid for 30 minutes. If you did not request this please ignore the message.If you did then copy the following Code.</p>
            <div style="display: flex;">
                <div style="text-align:center;font-family:sans-serif;font-weight:bold;font-size:20px;padding:0.9% 0% 0.5% !important;background-color: rgba(9, 44, 9, 0.185); width: 20%;margin-left: 45%;">${resetCode}</div>
            </div>
        </div>
            <p style="background-color: #265DE7;width: 100%;margin-top: 1%;color: #fff;text-align: center;font-family: sans-serif;padding:1% 0%;"><span style="font-weight: bold;">Reboost </span>&copy; ${time.getFullYear()}</p>
    </body>`;
    let checkSendEmail = await sendEmail(user.Email, subject, html);
    if (checkSendEmail == "Success") {
      await User.findByIdAndUpdate(
        user._id,
        {
          passwordResetCode: {
            code: resetCode,
            creationTime: time,
          },
          requestPasswordReset: true,
        },
        { new: true }
      );
      return res.status(200).send({
        message: `Sent the password reset code to ${user.Email}`,
        data: {
          message:
            "Copy this userId as it'll be used in the next step of resetting password",
          userId: user._id.toString(),
        },
      });
    } else {
      return res.status(400).send({
        message: "Unable to send the email for password reset",
      });
    }
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const checkCode = async (req, res) => {
  try {
    let user = await User.findById(req.params.userId);
    if (!user)
      return res
        .status(404)
        .send("Unable to find the user with the provided userId");

    if (
      user.passwordResetCode &&
      user.passwordResetCode.code != req.params.code
    ) {
      return res.status(400).send("Invalid Code!");
    }
    let time = new Date();
    let creationTimeInSeconds =
      user.passwordResetCode.creationTime.getTime() / 1000;
    let timeInSeconds = time.getTime() / 1000;
    if (timeInSeconds - creationTimeInSeconds > 1800) {
      return res
        .status(400)
        .send(
          "Code Expired. Please go back to password reset page to get a new code"
        );
    }

    await User.findByIdAndUpdate(
      user._id,
      {
        passwordResetCode: {
          code: req.params.code,
          creationTime: time,
          valid: true,
        },
      },
      { new: true }
    );

    return res.status(200).send("Code is valid");
  } catch (ex) {
    return res.status(400).send(ex.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    let user = await User.findById(req.params.userId);
    if (!user)
      return res
        .status(400)
        .send("Unable to find the user with the provided userId");

    if (!user.passwordResetCode)
      return res.status(400).send("You don't have a password reset code");
    if (!user.passwordResetCode.valid)
      return res.status(400).send("Invalid password reset code");
    if (!user.requestPasswordReset)
      return res.status(400).send("You did not request password resetting");

    let salt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(req.body.newPassword, salt);

    await User.findByIdAndUpdate(
      req.params.userId,
      {
        Password: newPassword,
        passwordResetCode: null,
        requestPasswordReset: false,
      },
      { new: true }
    );

    res
      .status(200)
      .send(
        "Reset Password Successfully!You can now login with your new password"
      );
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const updateUserInformation = async (req, res) => {
  try {
    try {
      let userInfo = await User.findById(req.user._id).select("-Password");
      if (!userInfo) return res.status(404).send("User not found!");

      let username = req.body.Username
        ? req.body.Username
        : userInfo.Username;

      let user = await User.findByIdAndUpdate(
        req.user._id,
        {
          Username: username,
        },
        { new: true }
      ).select(
        "-Password -AccountType -verificationCode -isVerified -passwordResetCode -requestPasswordReset -CreatedAt"
      );
      res.status(200).send({
        message: "User updated successfully",
        data: user,
      });
    } catch (ex) {
      res.status(400).send(ex.message);
    }
  } catch (ex) {
    res.status(500).send(ex.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user._id }).select("Password");
    let validatePassword = await bcrypt.compare(
      req.body.oldPassword,
      user.Password
    );
    if (!validatePassword) return res.status(400).send("Invalid old password!");
    let newPasswordSalt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(req.body.newPassword, newPasswordSalt);

    await User.findByIdAndUpdate(
      req.user._id,
      { Password: newPassword },
      { new: true }
    );
    res
      .status(200)
      .send(
        "Password Updated Successfully! Next time Log in with your new Password"
      );
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const deleteAccount = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(404).send("The user does not exist");

    await User.findByIdAndRemove(req.user._id);
    res.status(200).send("User deleted successfully");
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};
