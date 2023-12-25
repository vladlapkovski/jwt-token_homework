import express, {Request, Response, Router} from "express"
import { getIDBlog, socialRepository } from "../social-repository-blogs";
import { socialRepositoryForPostsInBlogs } from "../social-repositoryForPostsInBlogs"
import { collection, collection4, collectionBlogsType, collectionPostsType } from '../db';
export const commentsRoutes = Router({}) 
import { ObjectId } from 'mongodb';
import { updateIDBlog } from "../social-repository-blogs"


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