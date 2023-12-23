import express, {Request, Response, Router} from "express"
import { getIDBlog, socialRepository} from "../social-repository-blogs";
import { socialRepositoryForPostsInBlogs } from "../social-repositoryForPostsInBlogs"
import { collection, collectionBlogsType, collectionPostsType } from '../db';
export const postsForBlogsRoutes = Router({}) 
import { ObjectId } from 'mongodb';
import { updateIDBlog } from "../social-repository-blogs"


const auth = "admin:qwerty";
const encodedAuth = Buffer.from(auth).toString("base64");

postsForBlogsRoutes.post('/blogs/:blogId/posts', async (req: Request, res: Response) => {
    const { title, shortDescription, content, blogName, createdAt } = req.body as collectionPostsType;

    const blogId = req.params.blogId;
    
    const authHeader = req.headers.authorization;
  
    if (!authHeader || authHeader !== `Basic ${encodedAuth}`) {
      return res.status(401).send();
    }
  
  
    let blog;
    try {
      blog = await collection.findOne({ _id: new ObjectId(blogId) });
    } catch (error) {
      return res.status(404).json({
        message: 'Invalid blogId',
        field: 'blogId'
      });
    }
  
    if (typeof blog !== "object" || !blog) {
      return res.status(404).json({
        message: 'Invalid blogId',
        field: 'blogId'
      });
    }
  
    const errorsMessages = [];
    if (!title || title.trim().length == 0 || title.length > 30) {
      errorsMessages.push({
        message: 'Invalid title',
        field: 'title'
      });
    }
    if (!shortDescription || shortDescription.length > 100) {
      errorsMessages.push({
        message: 'Invalid shortDescription',
        field: 'shortDescription'
      });
    }
    if (!content || content.trim().length == 0 || content.length > 1000) {
      errorsMessages.push({
        message: 'Invalid content',
        field: 'content'
      });
    }
    
    if (errorsMessages.length > 0) {
      return res.status(400).json({
        errorsMessages
      });
    } 
  
  
    const newPost = await socialRepositoryForPostsInBlogs.createPostInBlogs(title, shortDescription, content, blogId, blogName, createdAt);
  
   
    return res.status(201).json(newPost);
  });
  
  
  postsForBlogsRoutes.get('/blogs/:blogId/posts', async (req: Request, res: Response) => {
    const searchNameTerm = req.query.searchNameTerm as string || null; // поисковый термин для имени блога
    const sortBy = req.query.sortBy as string || 'createdAt'; // поле для сортировки
    const sortDirection = req.query.sortDirection as string || 'desc'; // направление сортировки
    const pageNumber = parseInt(req.query.pageNumber as string) || 1; // номер страницы (по умолчанию 1)
    const pageSize = parseInt(req.query.pageSize as string) || 10; // количество элементов на странице (по умолчанию 10)
    const startIndex = (pageNumber - 1) * pageSize; // индекс начального элемента
    const endIndex = pageNumber * pageSize; // индекс конечного элемента
    const posts = await socialRepositoryForPostsInBlogs.getPostsInBlogs();
    const blogId = new ObjectId(req.params.blogId);
    let blog;
  try {
    blog = await collection.findOne({ _id: blogId });
  } catch (error) {
    return res.status(404).json({
      message: 'Invalid blogId',
      field: 'blogId'
    });
  }

  if (!blog) {
    return res.status(404).json({
      message: 'Invalid blogId',
      field: 'blogId'
    });
  }

  let filteredPosts = posts.filter(post => post.blogId === req.params.blogId);
  if (searchNameTerm) {
    filteredPosts = posts.filter(post => post.title.toLowerCase().includes(searchNameTerm.toLowerCase()));
  }

  filteredPosts.sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });
    
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex); // получаем только нужные элементы для текущей страницы

    
    return res.status(200).json({
      pagesCount: Math.ceil(filteredPosts.length / pageSize), // общее количество страниц
      page: pageNumber, // текущая страница
      pageSize: pageSize, // размер страницы
      totalCount: filteredPosts.length, // общее количество элементов после фильтрации
      items: paginatedPosts // массив постов для текущей страницы
    });
  });