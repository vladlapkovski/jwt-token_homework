import express, {Request, Response, Router} from "express"
import { getIDBlog, socialRepository } from "../social-repository-blogs";
import { socialRepositoryForPostsInBlogs } from "../social-repositoryForPostsInBlogs"
import { ConfirmRegistration, RequestTypeOfRegistrationOfUser, ResendingEmailInputData, collection, collection3, collectionAuthType, collectionPostsType } from '../db';
export const authRoutes = Router({}) 
import { ObjectId } from 'mongodb';
import { updateIDBlog } from "../social-repository-blogs"
import { socialRepositoryForAuth } from "../social-repository-auth";
import { jwtService } from "../aplication/jwt-service";
import { CheckMailAndLoginForRepeat, ConfirmEmail, socialRepositoryForRegistrationUsers } from "../registrationOfUser";
import { RegistrationOfUserSocialRepository, ResendEmailSocialRepository } from "../send-mail";


authRoutes.post('/login', async (req: Request, res: Response) => {
    const { loginOrEmail, password } = req.body as collectionAuthType;

    const errorsMessages = [];

    // Проверяем, что все обязательные поля заполнены
    if (typeof loginOrEmail !== "string" || !loginOrEmail || loginOrEmail?.trim()?.length == 0) {
        errorsMessages.push({
            message: 'Invalid loginOrEmail', 
            field: "loginOrEmail"
        });
    }

    if (typeof password !== "string" || !password || password?.trim()?.length == 0 || password?.length > 20) {
        errorsMessages.push({
            message: 'Invalid password', 
            field: "password"
        });
    }

    if (errorsMessages.length > 0) {
        return res.status(400).json({
            errorsMessages
        });
    }

    // Проверяем данные в базе данных
    const user = await socialRepositoryForAuth.createAuth(loginOrEmail, password);

    if (user) {
        const JWTtoken = await jwtService.createJWT(user)
        // Если данные верны, возвращаем статус 204
        return res.status(200).json({ accessToken: JWTtoken });
    } else {
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
      const { _id, createdAt, password, ...rest } = authUser;
      res.status(200).send(rest);
    } else {
      res.sendStatus(404);
    }
  });







  authRoutes.post('/registration', async (req: Request, res: Response) => {
    const { login, password, email } = req.body as RequestTypeOfRegistrationOfUser;

    const errorsMessages = [];

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
    const checkLoginAndEmail = await CheckMailAndLoginForRepeat.Checking(login, password, email)
    if (checkLoginAndEmail == false) {
        return res.status(400).json({
            message: 'Invalid email',
            field: 'email'
          });
    }
    const RegisteredUser = await socialRepositoryForRegistrationUsers.RegistrateUser(login, password, email);

    if (RegisteredUser) {
        const SendMail = await RegistrationOfUserSocialRepository.RegistrationOfUser(login, password, email)
        if (SendMail) {
            return res.status(204).send("Input data is accepted. Email with confirmation code will be send to passed email address")
        } else {
            return res.status(400).send();
        }
    } else {
        return res.status(400).send(); 
    }
});




authRoutes.post('/registration-email-resending', async (req: Request, res: Response) => {
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
    // const checkLoginAndEmail = await CheckMailAndLoginForRepeat.Checking(login, password, email)
    // if (checkLoginAndEmail == false) {
    //     return res.status(400).send("the user with the given email or password already exists");
    // }
        
    const SendMail = await ResendEmailSocialRepository.Resend(email)
    if (SendMail) {
        return res.status(200).send("Input data is accepted. Email with confirmation code will be send to passed email address")
    } else {
        return res.status(400).json({
            message: 'Invalid email',
            field: 'email'
          });
    }
});




authRoutes.post('/registration-confirmation', async (req: Request, res: Response) => {
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
    
        
    const confirmation = await ConfirmEmail.UpdateConfirmationStatus(code)
    if (confirmation) {
        return res.status(200).send("Email was verified. Account was activated")
    } else {
        return res.status(400).json({
            message: 'Invalid code',
            field: 'code'
          });
    }
});