import express, {Request, Response, Router} from "express"
import { getIDBlog, socialRepository } from "../social-repository-blogs";
import { socialRepositoryForPostsInBlogs } from "../social-repositoryForPostsInBlogs"
import { collection, collectionBlogsType, collectionPostsType } from '../db';
export const blogsRoutes = Router({}) 
import { ObjectId } from 'mongodb';
import { updateIDBlog } from "../social-repository-blogs"


const auth = "admin:qwerty";
const encodedAuth = Buffer.from(auth).toString("base64");


blogsRoutes.delete("/:blogId", async (req: Request, res: Response) => {

  const blogId = new ObjectId(req.params.blogId);
  
  const index = await collection.findOne({ _id: blogId });
  
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Basic ${encodedAuth}`) {
    return res.status(401).send();
  }

  if (index) {
    await collection.deleteOne({ _id: blogId });
    return res.status(204).send();
  } else {
    return res.status(404).send()
  }

});
  
  
  
blogsRoutes.post('/', async (req: Request, res: Response) => {
    
  const { name, description, websiteUrl, createdAt, isMembership } = req.body as collectionBlogsType;

  const authHeader = await req.headers.authorization;

  if (!authHeader || authHeader !== `Basic ${encodedAuth}`) {
    return res.status(401).send();
  }

  const errorsMessages = [];

  // Проверяем, что все обязательные поля заполнены
  if (typeof name !== "string" || !name || name?.trim()?.length == 0 || name?.length > 15) {
    errorsMessages.push({
      message: 'Invalid name', 
      field: "name"
    });
  }

  if (typeof description !== "string" || !description || description?.trim()?.length == 0 || description?.length > 500) {
    errorsMessages.push({
      message: 'Invalid description', 
      field: "description"
    });
  }

  const websiteUrlRegex = new RegExp('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$');

  if (typeof websiteUrl !== "string" || !websiteUrl || websiteUrl?.length > 100 || !websiteUrlRegex.test(websiteUrl)) {
    errorsMessages.push({
      message: 'Invalid websiteUrl', 
      field: "websiteUrl"
    });
  }


  if (errorsMessages.length > 0) {
    return res.status(400).json({
      errorsMessages
    });
  }

  // Создаем новый блог
  const newBlog = await socialRepository.createBlog(name, description, websiteUrl, createdAt, isMembership);

  // blogs.push(newBlog); // добавляем новый блог в массив

  // Возвращаем созданный блог с кодом 201
  return res.status(201).json(newBlog);

});
  
  
  
blogsRoutes.get('/', async (req: Request, res: Response) => {
  const searchNameTerm = req.query.searchNameTerm as string || null; // поисковый термин для имени блога
  const sortBy = req.query.sortBy as string || 'createdAt'; // поле для сортировки
  const sortDirection = req.query.sortDirection as string || 'desc'; // направление сортировки
  const pageNumber = parseInt(req.query.pageNumber as string) || 1; // номер страницы (по умолчанию 1)
  const pageSize = parseInt(req.query.pageSize as string) || 10; // количество элементов на странице (по умолчанию 10)
  const startIndex = (pageNumber - 1) * pageSize; // индекс начального элемента
  const endIndex = pageNumber * pageSize; // индекс конечного элемента
  const blogs = await socialRepository.getBlogs();
  
  // Применяем фильтрацию по поисковому термину, если он указан
  let filteredBlogs = blogs;
  if (searchNameTerm) {
    filteredBlogs = blogs.filter(blog => blog.name.toLowerCase().includes(searchNameTerm.toLowerCase()));
  }
  
  // Применяем сортировку
  filteredBlogs.sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });
  
  const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex); // получаем только нужные элементы для текущей страницы
  
  return res.status(200).json({
    pagesCount: Math.ceil(filteredBlogs.length / pageSize), // общее количество страниц
    page: pageNumber, // текущая страница
    pageSize: pageSize, // размер страницы
    totalCount: filteredBlogs.length, // общее количество элементов после фильтрации
    items: paginatedBlogs // массив блогов для текущей страницы
  });
});
  
  
blogsRoutes.get('/:id', async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);

  const blog = await collection.findOne({ $or: [{ _id: id }, { id }] });

  if (blog) {
    const { _id, ...rest } = blog;
    res.status(200).send(rest);
  } else {
    res.sendStatus(404);
  }
});
  
  
  
blogsRoutes.put('/:id', async (req: Request, res: Response) => {

  const id = new ObjectId(req.params.id);

  const { name, description, websiteUrl } = req.body as collectionBlogsType;

  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Basic ${encodedAuth}`) {
    return res.status(401).send();
  }

  const errorsMessages = [];

  const websiteUrlRegex = new RegExp('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$');

  if (!websiteUrl || websiteUrl.length > 100 || !websiteUrlRegex.test(websiteUrl)) {
    errorsMessages.push({
      message: 'Invalid website URL',
      field: "websiteUrl"
    });
  }

  if (!name || name.trim().length == 0 || name.length > 15) {
    errorsMessages.push({
      message: 'Invalid name',
      field: "name"
    });
  }

  if (!description || description.length > 500) {
    errorsMessages.push({
      message: 'Invalid description',
      field: "description"
    });
  }

  if (errorsMessages.length > 0) {
    return res.status(400).json({
      errorsMessages
    });
  }

  // Обновляем блог по его id
  const updatedBlog = await updateIDBlog.updateBlog(id, name, description, websiteUrl);
  if (!updatedBlog) {
    return res.status(404).send();
  } else {
    return res.status(204).send();
  }
});
    



