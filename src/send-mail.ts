import { Request, Response, Router } from "express";
import { RequestTypeOfRegistrationOfUser, collection3 } from "./db";
import { v4 as uuidv4 } from 'uuid';

export const emailRouter = Router({})

const nodemailer = require("nodemailer");

const code = uuidv4()


// export const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "clengovno6@gmail.com",
//     pass: "ltet sgcr vkvf dvhs",
//   },
// });
  
  
  
//   export const info = await transporter.sendMail({
//     from: 'Vlad', // sender address
//     to: req.body.email, // list of receivers
//     subject: req.body.subject, // Subject line
//     html: req.body.message, // html body
//   });
//   console.log(info)
  

  export const RegistrationOfUserSocialRepository = { 
    async RegistrationOfUser(login: string, password: string, email: string): Promise<RequestTypeOfRegistrationOfUser | undefined> {
        if (!login.trim() || !password.trim() || !email.trim()) {
            return undefined;
        }
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: "clengovno6@gmail.com",
            pass: "ltet sgcr vkvf dvhs",
          },
        });
        const user = await collection3.findOne({ $or: [{ login: login }, { email: email }] });

        if (!user) {
            return undefined;
        }
        const info = await transporter.sendMail({
          from: 'Vlad', // sender address
          to: email, // list of receivers
          subject: "SCHOOL OF DOTA2", // Subject line
          html: `https://jwt-token-homework.vercel.app/hometask_07/api/auth/registration-confirmation?${code}`, // html body
        });
        
        return {
          login,
          password,
          email,
          statusOfConfirmedEmail: false,
          confirmCode: code
        };
    }
};


  