import { GetUserType, collection, collection2, collection3, collectionAuthType, collectionBlogsType, collectionPostsType } from './db';
import { ObjectId } from 'mongodb';
import { blogsRoutes } from './routes/blogs';


export const socialRepositoryForAuth = { 
    async createAuth(loginOrEmail: string, password: string): Promise<GetUserType | undefined> {
        if (!loginOrEmail.trim() || !password.trim()) {
            return undefined;
        }
        const user = await collection3.findOne({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] });

        if (!user || user.password !== password) {
            return undefined;
        }

        const { _id, password: userPassword, ...rest } = user;
        return rest;
    }
};


// export const getInformationForCurrentUser = {
//     async getBlog(): Promise<GetUserType> {
//       const foundCurrentUser = await collection3.find({}).toArray();
//       const Users = foundCurrentUser.map((user) => {
//         const { _id, createdAt, ...rest } = user;
//         return rest;
//       });
//       return Users;
//     }
//   };