import express, {Request, Response, Router} from "express"
import { getIDBlog, socialRepository } from "../social-repository-blogs";
import { socialRepositoryForPostsInBlogs } from "../social-repositoryForPostsInBlogs"
import { ConfirmRegistration, RequestTypeOfRegistrationOfUser, ResendingEmailInputData, collection, collection3, collection5, collection6, collection7, collectionAuthType, collectionPostsType } from '../db';
export const authRoutes = Router({}) 
import { ObjectId } from 'mongodb';
import { updateIDBlog } from "../social-repository-blogs"
import { socialRepositoryForAuth } from "../social-repository-auth";
import { jwtService, tokenService } from "../aplication/jwt-service";
import { CheckEmailAndConfirmStatusForResend, CheckEmailForConfirmStatus, CheckLoginForRepeat, CheckMailForRepeat, ConfirmEmail, RevokedRefreshToken, socialRepositoryForRegistrationUsers } from "../registrationOfUser";
import { RegistrationOfUserSocialRepository, ResendEmailSocialRepository } from "../send-mail";
import { socialRepositoryForIP, socialRepositoryForLoginInformation, socialRepositoryForLoginInformation2 } from "../userInformation";
import { rateLimit } from 'express-rate-limit'

import bcrypt from 'bcrypt';


export const limiter = rateLimit({
	windowMs:  9.5 * 1000, // 10 sec
	limit: 5, // Limit each IP to 100 requests per `window`
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: true, // Disable the `X-RateLimit-*` headers
    
})

export const limiter2 = rateLimit({
	windowMs:  9.5 * 1000, // 10 sec
	limit: 5, // Limit each IP to 100 requests per `window`
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: true, // Disable the `X-RateLimit-*` headers
    
})

export const limiter3 = rateLimit({
	windowMs:  9.5 * 1000, // 10 sec
	limit: 5, // Limit each IP to 100 requests per `window`
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: true, // Disable the `X-RateLimit-*` headers
    
})

export const limiter4 = rateLimit({
	windowMs:  9.5 * 1000, // 10 sec
	limit: 5, // Limit each IP to 100 requests per `window`
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: true, // Disable the `X-RateLimit-*` headers
    
})




authRoutes.post('/login', limiter, async (req: Request, res: Response) => {
    const { loginOrEmail, password } = req.body as collectionAuthType;
    let title = req.get('User-Agent');

    if (!title) {
        title = "browser";
    }

    const errorsMessages = [];
    
    if (typeof loginOrEmail !== "string" || !loginOrEmail || loginOrEmail.trim().length === 0) {
        errorsMessages.push({
            message: 'Invalid loginOrEmail', 
            field: "loginOrEmail"
        });
    }

    if (typeof password !== "string" || !password || password.trim().length === 0 || password.length > 20) {
        errorsMessages.push({
            message: 'Invalid password', 
            field: "password"
        });
    }

    if (errorsMessages.length > 0) {
        return res.status(400).json({ errorsMessages });
    }

    let session;

    const user = await socialRepositoryForAuth.createAuth(loginOrEmail, password);

    if (user) {
        let ip = await socialRepositoryForIP.IP(req);

        if (!ip) {
            ip = "no ip address received";
        }

        const userId = user.id;
        const checkForActiveSessions = await collection6.findOne({ userId: user.id });

        if (checkForActiveSessions?.title !== title) {
            session = await socialRepositoryForLoginInformation.createInfo(title, ip, userId);

            if (!session) {
                return res.status(400).send();
            }
        }

        if (session === undefined) {
            return res.status(400).send();
        }

        const JWTtoken = await jwtService.createJWT(user);
        const refreshToken = await tokenService.createRefreshToken(user, session.deviceId);

        return res.status(200)
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
            .json({ accessToken: JWTtoken });
    } else {
        console.log(new Date().toISOString())
        return res.status(401).send();
        }
});



authRoutes.get('/:me', async (req: Request, res: Response) => {
    const me = req.params.me;
    
    if(!req.headers.authorization) {
        res.sendStatus(401)
        return
    }


    const token = req.headers.authorization.split(" ")[1]

    const JWTtoken = await jwtService.getUserIdByToken(token)   

    const authUser = await collection3.findOne({ _id: JWTtoken as ObjectId });
  
    if (authUser) {
      const { _id, createdAt, password, confirmCode, id, statusOfConfirmedEmail, ...rest } = authUser;
      return res.status(200).send(rest);
    } else {
        return res.sendStatus(401);
    }
  });







  authRoutes.post('/registration', limiter2, async (req: Request, res: Response) => {
    const { login, password, email } = req.body as RequestTypeOfRegistrationOfUser;

    const errorsMessages = [];

    const websiteEmailRegex = new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');

    // Проверяем, что все обязательные поля заполнены
    if (typeof login !== "string" || !login || login?.trim()?.length == 0 || login?.trim()?.length < 3 || login?.trim()?.length > 10) {
        errorsMessages.push({
            message: 'Invalid login', 
            field: "login"
        });
    }

    if (typeof password !== "string" || !password || password?.trim()?.length == 0 || password?.length > 20 || password?.length < 6) {
        errorsMessages.push({
            message: 'Invalid password', 
            field: "password"
        });
    }

    if (typeof email!== "string" || !email || email?.trim()?.length == 0 || !websiteEmailRegex.test(email)) {
        errorsMessages.push({
            message: 'Invalid email', 
            field: "email"
        });
    }


    if (errorsMessages.length > 0) {
        return res.status(400).json({
            errorsMessages
        });
    }
    // Проверяем данные в базе данных
    const checkLogin = await CheckLoginForRepeat.Checking(login, password)
    if (checkLogin == false) {
        return res.status(400).json({ errorsMessages: [{ message: "invalid login", field: "login" }] });
    }
    
    const checkMail = await CheckMailForRepeat.Checking(password, email)
    if (checkMail == false) {
        return res.status(400).json({ errorsMessages: [{ message: "invalid email", field: "email" }] });
    }

    const RegisteredUser = await socialRepositoryForRegistrationUsers.RegistrateUser(login, password, email);

    if (RegisteredUser) {
        return res.status(204).send()
    } else {
        return res.status(400).send();
    }
});




authRoutes.post('/registration-email-resending', limiter3, async (req: Request, res: Response) => {
    const { email } = req.body as ResendingEmailInputData;

    const errorsMessages = [];

    // Проверяем, что все обязательные поля заполнены

    if (typeof email!== "string" || !email || email?.trim()?.length == 0) {
        errorsMessages.push({
            message: 'Invalid email', 
            field: "email"
        });
    }


    if (errorsMessages.length > 0) {
        return res.status(400).json({
            errorsMessages
        });
    }
    // Проверяем данные в базе данных
    const checkEmail = await CheckEmailAndConfirmStatusForResend.FindEmailInDB(email)
    if (checkEmail == false) {
        return res.status(400).json({ errorsMessages: [{ message: "email was confirmed", field: "email" }] })
    }
        
    const ResendMail = await ResendEmailSocialRepository.Resend(email)
    if (ResendMail) {
        return res.status(204).send("Input data is accepted. Email with confirmation code will be send to passed email address")
    } else {
        return res.status(400).json({ errorsMessages: [{ message: "invalid email", field: "email" }] });
    }
});




authRoutes.post('/registration-confirmation', limiter4, async (req: Request, res: Response) => {
    const { code } = req.body as ConfirmRegistration;

    const errorsMessages = [];

    // Проверяем, что все обязательные поля заполнены

    if (typeof code!== "string" || !code || code?.trim()?.length == 0) {
        errorsMessages.push({
            message: 'Invalid code', 
            field: "code"
        });
    }


    if (errorsMessages.length > 0) {
        return res.status(400).json({
            errorsMessages
        });
    }
    // Проверяем данные в базе данных
    
    const status = await CheckEmailForConfirmStatus.NoConfirmedStatus(code)    

    if(status == false) {
        return res.status(400).json({ errorsMessages: [{ message: "code already confirmed", field: "code" }] });
    }    

    const confirmation = await ConfirmEmail.UpdateConfirmationStatus(code)
    if (confirmation) {
        return res.status(204).send("Email was verified. Account was activated")
    } else {
        return res.status(400).json({ errorsMessages: [{ message: " Invalid code", field: "code" }] });
    }
});



authRoutes.post('/logout', async (req: Request, res: Response) => {
    const token = req.cookies['refreshToken']; // Get refreshToken from cookies
    
    const userId = await tokenService.getUserIdByToken(token); // Get user id by refreshToken
    if(userId == undefined){
        return res.sendStatus(401)
    }
    const authUser = await collection3.findOne({ _id: userId as ObjectId });

    const checkTokenForValid = await collection5.findOne({ refreshToken: token })
    if(checkTokenForValid) {
        return res.sendStatus(401);
    }

    const deviceId = await tokenService.getDeviceIdByToken(token)
    const checkDeviceIdForValid = await collection6.findOne({deviceId: deviceId})
    if (checkDeviceIdForValid == undefined){
        return res.sendStatus(401);   
    } 

    const revoked = await RevokedRefreshToken.Revoke(token); // Revoke refreshToken
     
    const deleteUser = await collection6.deleteOne({ 
        $and: [
            { deviceId: deviceId as unknown as string },
            { userId: userId }
        ]
    })

    if (!authUser || revoked == false) {
        return res.sendStatus(401);
    } else {
        return res.sendStatus(204);
    }
});


  authRoutes.post('/refresh-token', async (req: Request, res: Response) => {
    

    const RefreshToken = req.cookies['refreshToken']
    if(!RefreshToken) {
        return res.sendStatus(404);
    }
    let title = req.get('User-Agent');

    if (!title) {
        title = "browser";
    }

    let ip = await socialRepositoryForIP.IP(req);

        if (!ip) {
            ip = "no ip address received";
        }

    const userId = await tokenService.getUserIdByToken(RefreshToken)   

    if(userId == null){
        return res.sendStatus(404);
    }

    const authUser = await collection3.findOne({ _id: userId as ObjectId });
    if(!authUser){
        return res.sendStatus(401);  
    }
    
    const deviceId = await tokenService.getDeviceIdByToken(RefreshToken)
    const checkDeviceIdForValid = await collection6.findOne({deviceId: deviceId})
    if (checkDeviceIdForValid == undefined){
        return res.sendStatus(401);   
    } 

    const deviceId2 = deviceId?.toString()
    if (deviceId2 == undefined){
        return res.sendStatus(401);   
    } 
    const checkTokenForValid = await collection5.findOne({ refreshToken: RefreshToken })
    
    if(checkTokenForValid) {
       return res.sendStatus(401);
    }

    const revoked = await RevokedRefreshToken.Revoke(RefreshToken);
    
    const deleteUser = await collection6.deleteOne({ 
        $and: [
            { deviceId: deviceId as unknown as string },
            { userId: userId }
        ]
    })
    
    const session = await socialRepositoryForLoginInformation2.createInfo2(title, ip, userId, deviceId2);

            if (!session) {
                return res.status(400).send();
            }
    

    if (authUser) {
    const JWTtoken = await jwtService.createJWT(authUser)
    const refreshToken = await tokenService.createRefreshToken(authUser, deviceId2)
    return res.status(200)
      .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true})
      .json({ accessToken: JWTtoken });
    } else {
        return res.sendStatus(401);
    }
  }); 