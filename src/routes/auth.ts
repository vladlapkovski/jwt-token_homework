import express, {Request, Response, Router} from "express"
import { getIDBlog, socialRepository } from "../social-repository-blogs";
import { socialRepositoryForPostsInBlogs } from "../social-repositoryForPostsInBlogs"
import { collection, collection3, collectionAuthType, collectionPostsType } from '../db';
export const authRoutes = Router({}) 
import { ObjectId } from 'mongodb';
import { updateIDBlog } from "../social-repository-blogs"
import { socialRepositoryForAuth } from "../social-repository-auth";
import { jwtService } from "../aplication/jwt-service";


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