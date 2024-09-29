import express, {Request, Response, Router} from "express"
import { collection, collection1, collectionPostsType, collectionBlogsType, collection3, collection4, collection5, collection6, collection7, collection8 } from '../db'
import { ObjectId } from "mongodb";

export const dataRouter = Router()


dataRouter.delete("/", async (req: Request, res: Response) => {
    await collection.deleteMany({ _id: ObjectId });
    await collection1.deleteMany({ _id: ObjectId });
    await collection3.deleteMany({ _id: ObjectId });
    await collection4.deleteMany({ _id: ObjectId });
    await collection5.deleteMany({ _id: ObjectId });
    await collection6.deleteMany({ _id: ObjectId });
    await collection7.deleteMany({ _id: ObjectId });
    await collection8.deleteMany({ _id: ObjectId });
    return res.status(204).send();
});