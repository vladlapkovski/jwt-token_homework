import { collection, collection1, collectionBlogsType, collectionPostsType } from './db';
import { ObjectId } from 'mongodb';
import { blogsRoutes } from './routes/blogs';

export const socialRepositoryForPostsInBlogs = {
    async getPostsInBlogs(): Promise<collectionPostsType[]> {
      const foundPosts = await collection1.find({}).toArray();
      const posts = foundPosts.map((post) => {
        const { _id, ...rest } = post;
        return rest;
      });
      return posts;
    },
  
    async createPostInBlogs(
      title: string,
      shortDescription: string,
      content: string,
      blogId: string,
      blogName: string,
      createdAt: string
    ): Promise<collectionPostsType | undefined> {
      if (!title.trim() || !shortDescription.trim() || !content.trim() || !blogId.trim()) {
        return undefined;
      }
      
      let blog;
      try {
        blog = await collection.findOne({ _id: new ObjectId(blogId) });
      } catch (error) {
        return undefined;
      }
  
      if (typeof blog !== "object" || !blog) {
        return undefined;
      }
  
      const BLOGNAME = blog.name;
      const createdAt2 = new Date().toISOString();
      const objectId1 = new ObjectId();
      const result = await collection1.insertOne({
        id: objectId1,
        title,
        shortDescription,
        content,
        blogId,
        blogName: BLOGNAME,
        createdAt: createdAt2,
        _id: objectId1,
      });
  
      return {
        id: result.insertedId,
        title,
        shortDescription,
        content,
        blogId,
        blogName: BLOGNAME,
        createdAt: createdAt2
      };
    }
  };