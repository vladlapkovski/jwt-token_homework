import { Request, Response, Router } from "express";
import { RequestTypeForResendEmail, RequestTypeOfRegistrationOfUser, ResendingEmailInputData, collection3 } from "./db";
import { v4 as uuidv4 } from 'uuid';

export const emailRouter = Router({})

const nodemailer = require("nodemailer");

  

  export const RegistrationOfUserSocialRepository = { 
    async RegistrationOfUser(login: string, password: string, email: string, activationCode: string): Promise<RequestTypeOfRegistrationOfUser | undefined> {
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
          html: `<h1>Thank for your registration</h1>
          <p>To finish registration please follow the link below:
              <a href='https://somesite.com/confirm-email?code=${activationCode}'>complete registration</a>
          </p>`, // html body
        });
        
        return {
          login,
          password,
          email,
          statusOfConfirmedEmail: false,
          confirmCode: activationCode
        };
    }
};



export const ResendEmailSocialRepository = { 
  async Resend(email: string): Promise< RequestTypeForResendEmail  | undefined> {
    if (!email.trim()) {
        return undefined;
    }
    const activationCode = uuidv4()

    const user = await collection3.findOneAndUpdate(
      { "email" : email },
      { $set: { "confirmCode" : activationCode } }
    )

    if(!user){
      return undefined
    }
    
    const mail = RegistrationOfUserSocialRepositorySendEmailForResend.Resend(email,activationCode) 
      if(!mail){
        return undefined
      }

    return {
      email,
      statusOfConfirmedEmail: false,
      confirmCode: activationCode
    };
  }
};

  

export const RegistrationOfUserSocialRepositorySendEmailForResend = { 
  async Resend(email: string, activationCode: string): Promise<RequestTypeForResendEmail | undefined> {
      if (!email.trim()) {
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
      const user = await collection3.findOne({ email: email });

      if (!user) {
          return undefined;
      }
      const info = await transporter.sendMail({
        from: 'Vlad', // sender address
        to: email, // list of receivers
        subject: "SCHOOL OF DOTA2", // Subject line
        html: `<h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${activationCode}'>complete registration</a>
        </p>`, // html body
      });
      
      return {
        email,
        statusOfConfirmedEmail: false,
        confirmCode: activationCode
      };
  }
};