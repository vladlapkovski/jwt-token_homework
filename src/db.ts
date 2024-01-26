import { MongoClient, ObjectId } from "mongodb";
import dotenv from 'dotenv';
import { type } from "os";
import { V4Options } from "uuid";

dotenv.config();

export type collectionBlogsType = {
  [key: string]: any;
  id: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

export type collectionPostsType = {
  [key: string]: any;
  id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}

export type collectionAuthType = {
  [key: string]: any;
  loginOrEmail: string;
  password: string;
}


export type CreateUserType = {
  [key: string]: any;
  id: ObjectId;
  login: string;
  userPassword: string;
  email: string;
  createdAt: string;
}

export type GetUserType = {
  [key: string]: any;
  id: ObjectId;
  login: string;
  email: string;
  createdAt: string;
}



export type CreateCommentsType = {
  [key: string]: any;
  content: string;
}


export type GetPostComment = {
  [key: string]: any;
  id: ObjectId;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  postId: string;
}



export type RequestTypeOfRegistrationOfUser = {
  [key: string]: any;
  login: string;
  password: string;
  email: string;
  statusOfConfirmedEmail:boolean;
  confirmCode: any
}

const URL = process.env.MONGO_URL;
console.log("url:", URL);
if (!URL) {
  throw Error("URL not found");
}
const client = new MongoClient(URL);

export const collection = client.db().collection<collectionBlogsType>("social");

export const collection1 = client.db().collection<collectionPostsType>("Postsocial");

export const collection2 = client.db().collection<collectionAuthType>("Auth");

export const collection3 = client.db().collection<GetUserType>("Users");

export const collection4 = client.db().collection<CreateCommentsType>("Comments");


export const runDb = async () => {
  try {
    await client.connect();
    console.log("connected successfully");
  } catch (e) {
    console.log("No connection");
    await client.close();
  }
};