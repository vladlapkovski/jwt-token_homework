import { collection, collection1, collectionBlogsType, collectionPostsType } from './db';
import { ObjectId } from 'mongodb';
import { blogsRoutes } from './routes/blogs';

export const socialRepository = {
  async getBlogs(): Promise<collectionBlogsType[]> {
    const foundBlogs = await collection.find({}).toArray();
    const blogs = foundBlogs.map((blog) => {
      const { _id, ...rest } = blog;
      return rest;
    });
    return blogs;
  },

  async createBlog(name: string, description: string, websiteUrl: string, createdAt: string, isMembership: boolean): Promise<collectionBlogsType | undefined> {
    if (!name.trim() || !description.trim() || !websiteUrl.trim()) {
      return undefined;
    }
    const createdAt1 = new Date().toISOString();
    const objectId = new ObjectId();
    const result = await collection.insertOne({
      id: objectId,
      name,
      description,
      websiteUrl,
      createdAt: createdAt1,
      isMembership: false,
      _id: objectId
    });
    return {
      id: result.insertedId,
      name,
      description,
      websiteUrl,
      createdAt: createdAt1,
      isMembership: false
    };
  }
};
export const getIDBlog = {
  async getBlog(): Promise<collectionBlogsType[]> {
    const foundBlogs = await collection.find({}).toArray();
    const blogs = foundBlogs.map((blog) => {
      const { _id, ...rest } = blog;
      return rest;
    });
    return blogs;
  }
};

export const deleteIDBlog = {
  async deleteBlog(): Promise<void | collectionBlogsType[]> {
    return collection.find({}).toArray();
  }
};

export const updateIDBlog = {
  async updateBlog(id: ObjectId, name: string, description: string, websiteUrl: string) {
    if (typeof name !== 'string' || !name.trim() || typeof description !== 'string' || !description.trim() || typeof websiteUrl !== 'string' || !websiteUrl.trim()) {
      return undefined;
    }

    const updateDocument = {
      $set: {
        name,
        description,
        websiteUrl
      }
    };

    const result = await collection.findOneAndUpdate({ _id: id }, updateDocument);

    if (result) {
      const updatedBlog = result as collectionBlogsType;
      return {
        id: updatedBlog.id.toString(),
        name: updatedBlog.name,
        description: updatedBlog.description,
        websiteUrl: updatedBlog.websiteUrl
      };
    } else {
      return undefined;
    }
  }
};
  



