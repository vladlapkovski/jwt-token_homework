import { ObjectId } from "mongodb";
import { BannedRefreshTokeens, ConfirmRegistration, GetUserType, RequestTypeOfRegistrationOfUser, collection3, collection5 } from "./db";
import { v4 as uuidv4 } from 'uuid';
import { Router } from "express";
import { RegistrationOfUserSocialRepository } from "./send-mail";

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
      confirmCode: activationCode,
      userId: objectId
    });


    if(result) {
      const mail = RegistrationOfUserSocialRepository.RegistrationOfUser(login, password,email,activationCode) 
        if(!mail){
          return undefined
        }
    }

    return {
      id: result.insertedId,
      login,
      password,
      email,
      createdAt: createdAtUser,
      statusOfConfirmedEmail: false,
      confirmCode: activationCode,
      userId: objectId
    };
  }
};




export const CheckLoginForRepeat = { 
  async Checking(login: string, password: string): Promise<boolean> {
      if (!login.trim() || !password.trim()) {
          return false;
      }
      const user = await collection3.findOne({ login: login });

      if (user) {
          return false;
      } else {
        return true
      }
  }
};

export const CheckMailForRepeat = { 
  async Checking(password: string, email: string): Promise<boolean> {
      if (!email.trim() || !password.trim()) {
          return false;
      }
      const user = await collection3.findOne({ email: email });

      if (user) {
          return false;
      } else {
        return true
      }
  }
};

export const ConfirmEmail = { 
  async UpdateConfirmationStatus(code: string): Promise<GetUserType | undefined> {
      if (!code.trim()) {
          return undefined;
      }
      const user = await collection3.findOneAndUpdate(
        { "confirmCode" : code },
        { $set: { "statusOfConfirmedEmail" : true } }
      )

      if (user) {
        return user;
      } else {
        return undefined
      }
  }
};


export const CheckEmailForConfirmStatus = { 
  async NoConfirmedStatus(code: string): Promise<boolean> {
      if (!code.trim()) {
          return false;
      }
      const user = await collection3.findOne({ confirmCode: code });

      if(!user){
        return false
      }

      if (user?.statusOfConfirmedEmail == true) {
          return false;
      } else {
        return true
      }
  }
};


export const CheckEmailAndConfirmStatusForResend = { 
  async FindEmailInDB(email: string): Promise<boolean> {
      if (!email.trim()) {
          return false;
      }
      const user = await collection3.findOne({ email: email });

      if (!user || user.statusOfConfirmedEmail === true) {
        return false;
      } else {
        return true
      }
  }
};



export const RevokedRefreshToken = {
  async Revoke(token: string): Promise<boolean> {
      try {
          await collection5.insertOne({
              refreshToken: token
          });
          return true;
      } catch (error) {
          return false;
      }
  }
};