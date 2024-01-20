import { Request, Response, Router } from "express";

export const emailRouter = Router({})

const nodemailer = require("nodemailer");

emailRouter.post("/email", async (req: Request, res: Response) => {

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user: "clengovno6@gmail.com",
          pass: "ltet sgcr vkvf dvhs",
        },
      });
      
      // async..await is not allowed in global scope, must use a wrapper
      
        const info = await transporter.sendMail({
          from: 'Vlad', // sender address
          to: req.body.email, // list of receivers
          subject: req.body.subject, // Subject line
          html: req.body.message, // html body
        });
        console.log(info)
      


    res.send({
        "email": req.body.email,
        "message": req.body.subject,
        "subject": req.body.message
    })
})


  