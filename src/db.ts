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
  extendedLikesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: string,
        newestLikes: [
          {
            addedAt: string | undefined,
            userId: string | undefined,
            login: string | undefined
          }
        ]
      }
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
  statusOfConfirmedEmail:boolean;
  confirmCode: any
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
  likesInfo: {
    likesCount: number,
    dislikesCount: number,
    myStatus: string
  }
}

export type CommentLikes = {
  [key: string]: any;
  commentId: ObjectId;
  userId: ObjectId;
  status: string;
}



export type RequestTypeOfRegistrationOfUser = {
  [key: string]: any;
  login: string;
  password: string;
  email: string;
  statusOfConfirmedEmail:boolean;
  confirmCode: any,
  userId: ObjectId
}

export type RequestTypeForResendEmail = {
  [key: string]: any;
  email: string;
  statusOfConfirmedEmail:boolean;
  confirmCode: any
}


export type ResendingEmailInputData = {
  [key: string]: any;
  email: string;
}

export type ConfirmRegistration = {
  [key: string]: any;
  code: string;
}

export type BannedRefreshTokeens = {
  [key: string]: any;
  refreshToken: string;
}

export type APIRequsts = {
  [key: string]: any;
  IP: string;
  URL: string;
  date: Date;
}

export type UserLoginInformation = {
  [key: string]: any;
  ip: string | string[];
  title: string;
  lastActiveDate: string;
  deviceId: string;
  userId: ObjectId;
}

export type BannedDeviceId = {
  [key: string]: any;
  deviceId: string;
}

export type PostLikes = {
  [key: string]: any;
  postId: ObjectId;
  userId: ObjectId;
  status: string;
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

export const collection4 = client.db().collection<GetPostComment>("Comments");

export const collection5 = client.db().collection<BannedRefreshTokeens>("RefreshTokens");

export const collection6 = client.db().collection<UserLoginInformation>("LoginInformation");

export const collection7 = client.db().collection<BannedDeviceId>("BannedDeviceId");

export const collection8 = client.db().collection<CommentLikes>("LikeStatusForComment");

export const collection9 = client.db().collection<PostLikes>("LikeStatusForPost");



export const runDb = async () => {
  try {
    await client.connect();
    console.log("connected successfully");
  } catch (e) {
    console.log("No connection");
    await client.close();
  }
};