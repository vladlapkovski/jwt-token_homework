import express, {Request, Response, Router} from "express"
import { getIDBlog, socialRepository } from "../social-repository-blogs";
import { socialRepositoryForPostsInBlogs } from "../social-repositoryForPostsInBlogs"
import { collection, collection3, collection4, collectionBlogsType, collectionPostsType } from '../db';
export const commentsRoutes = Router({}) 
import { ObjectId } from 'mongodb';
import { updateIDBlog } from "../social-repository-blogs"
import { jwtService } from "../aplication/jwt-service";


commentsRoutes.get('/:id', async (req: Request, res: Response) => {

    const id = new ObjectId(req.params.id);
  
    const comment = await collection4.findOne({ $or: [{ _id: id }, { id }] }); 
  
    if (comment) {
      const { _id, postId, ...rest } = comment;
      res.status(200).send(rest); 
    } else {
      res.sendStatus(404);
    }
  });


commentsRoutes.delete('/:id', async (req: Request, res: Response) => {

  const id = new ObjectId(req.params.id);

  if (!req.headers.authorization) {
    res.sendStatus(401);
    return;
  }

  const token = req.headers.authorization.split(" ")[1];
  const JWTtoken = await jwtService.getUserIdByToken(token);
  const authUser = await collection3.findOne({ _id: JWTtoken as ObjectId });

  if (!authUser) {
    return res.status(404).json({ message: 'User not found' });
  } 

  const postIndex = await collection4.findOne({ _id: id })

  
  if (postIndex) {
    await collection4.deleteOne({ _id: id });
    return res.status(204).send();
  } else {
    return res.status(404).send()
  }

});