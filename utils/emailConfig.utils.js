import { createTransport } from "nodemailer"

export async function sendEmail(to,subject,html){
    let transporter = createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        service:"gmail",
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    
    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html
    }

    try{
        let transport = await transporter.sendMail(mailOptions)
        return "Success"
    }
    catch(ex){
        return "Failure";
    }
}
