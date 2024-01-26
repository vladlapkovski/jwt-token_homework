import { ObjectId } from "mongodb";
import { GetUserType, RequestTypeOfRegistrationOfUser, collection3 } from "./db";
import { v4 as uuidv4 } from 'uuid';
import { Router } from "express";

export const emailRouter = Router({})

const nodemailer = require("nodemailer");

export const socialRepositoryForRegistrationUsers = {
async RegistrateUser(login: string, password: string, email: string): Promise<RequestTypeOfRegistrationOfUser | undefined> {
    if (!login.trim() || !password.trim() || !email.trim()) {
      return undefined;
    }
    const activationCode = uuidv4()
    const createdAtUser = new Date().toISOString();
    const objectId = new ObjectId();
    const result = await collection3.insertOne({
      id: objectId,
      login,
      password,
      email,
      createdAt: createdAtUser,
      _id: objectId,
      statusOfConfirmedEmail: false,
      confirmCode: activationCode
    });
    return {
      id: result.insertedId,
      login,
      password,
      email,
      createdAt: createdAtUser,
      statusOfConfirmedEmail: false,
      confirmCode: activationCode  
    };
  }
};

// export const RegistrationOfUserSocialRepository = { 
//   async RegistrationOfUser(login: string, password: string, email: string): Promise<RequestTypeOfRegistrationOfUser | undefined> {
//       if (!login.trim() || !password.trim() || !email.trim()) {
//           return undefined;
//       }
//       const transporter = nodemailer.createTransport({
//         service: "Gmail",
//         host: "smtp.gmail.com",
//         port: 465,
//         secure: true,
//         auth: {
//           user: "clengovno6@gmail.com",
//           pass: "ltet sgcr vkvf dvhs",
//         },
//       });
//       const user = await collection3.findOne({ $or: [{ login: login }, { email: email }] });

//       if (!user) {
//           return undefined;
//       }
//       const info = await transporter.sendMail({
//         from: 'Vlad', // sender address
//         to: email, // list of receivers
//         subject: "SCHOOL OF DOTA2", // Subject line
//         html: `https://jwt-token-homework.vercel.app/hometask_07/api/auth/registration-confirmation?${uuidv4()}`, // html body
//       });
      
//       return {
//         login,
//         password,
//         email,
//         statusOfConfirmedEmail: false
//       };
//   }
// };


export const CheckMailAndLoginForRepeat = { 
  async Checking(login: string, password: string, email: string): Promise<boolean> {
      if (!email.trim() || !login.trim() || !password.trim()) {
          return false;
      }
      const user = await collection3.findOne({ $or: [{ login: login }, { email: email }] });

      if (user) {
          return false;
      } else {
        return true
      }
  }
};