import { collection, collection3, GetUserType, collectionBlogsType, collectionPostsType} from './db';
import { ObjectId } from 'mongodb';
import { blogsRoutes } from './routes/blogs';


export const socialRepositoryForUsers = {
  async getUsers(): Promise<GetUserType[]> {
    const foundUsers = await collection3.find({}).toArray();
    const users = foundUsers.map((user) => {
      const { _id, password, userId, ...rest } = user;
      return rest;
    });
    return users;
  },
  
    async createUser(login: string, password: string, email: string, createdAt: string): Promise<GetUserType | undefined> {
      if (!login.trim() || !password.trim() || !email.trim()) {
        return undefined;
      }
      const createdAtUser = new Date().toISOString();
      const objectId = new ObjectId();
      const result = await collection3.insertOne({
        id: objectId,
        login,
        password,
        email,
        createdAt: createdAtUser,
        _id: objectId,
        statusOfConfirmedEmail: true,
        confirmCode: "no code status confirmed",
        userId: objectId
      });
      return {
        id: result.insertedId,
        login,
        email,
        createdAt: createdAtUser,
        statusOfConfirmedEmail:true,
        confirmCode: "no code status confirmed",
        userId: objectId
      };
    }
  };


  export const deleteUserById = {
    async deleteUser(): Promise<void | GetUserType[]> {
      return collection3.find({}).toArray();
    }
  };