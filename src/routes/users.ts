import express, {Request, Response, Router} from "express"
import { getIDBlog, socialRepository } from "../social-repository-blogs";
import { socialRepositoryForPostsInBlogs } from "../social-repositoryForPostsInBlogs"
import { CreateUserType, collection, collection3, collectionAuthType, collectionPostsType } from '../db';
export const usersRoutes = Router({}) 
import { ObjectId } from 'mongodb';
import { updateIDBlog } from "../social-repository-blogs"
import { socialRepositoryForUsers } from "../social-repository-users";


const auth = "admin:qwerty";
const encodedAuth = Buffer.from(auth).toString("base64");


usersRoutes.get('/', async (req: Request, res: Response) => {
  const searchLoginTerm = req.query.searchLoginTerm as string || null; // поисковый термин для имени пользователя
  const searchEmailTerm = req.query.searchEmailTerm as string || null; // поисковый термин для email пользователя
  const sortBy = req.query.sortBy as string || 'createdAt'; // поле для сортировки
  const sortDirection = req.query.sortDirection as string || 'desc'; // направление сортировки
  const pageNumber = parseInt(req.query.pageNumber as string) || 1; // номер страницы (по умолчанию 1)
  const pageSize = parseInt(req.query.pageSize as string) || 10; // количество элементов на странице (по умолчанию 10)
  const startIndex = (pageNumber - 1) * pageSize; // индекс начального элемента
  const endIndex = pageNumber * pageSize; // индекс конечного элемента

  const users = await socialRepositoryForUsers.getUsers();

  // Применяем фильтрацию по поисковым терминам, если они указаны
  let filteredUsers = users;
    let filteredUsers1 = users;
   

    if (searchLoginTerm && !searchEmailTerm) {
      filteredUsers = filteredUsers.filter(user => user.login.toLowerCase().includes(searchLoginTerm.toLowerCase()));
    }

    if (!searchLoginTerm && searchEmailTerm) {
      filteredUsers = filteredUsers.filter(user => user.email.toLowerCase().includes(searchEmailTerm.toLowerCase()));
    }

    if (searchLoginTerm && searchEmailTerm) {
      filteredUsers1 = filteredUsers1.filter(user => user.login.toLowerCase().includes(searchLoginTerm.toLowerCase()));
      filteredUsers = filteredUsers.filter(user => user.email.toLowerCase().includes(searchEmailTerm.toLowerCase()));
      let filteredUsers3 = [...filteredUsers1, ...filteredUsers];
      filteredUsers = Array.from(new Set(filteredUsers3));
    }

    // Применяем сортировку
    filteredUsers.sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

  const paginatedUsers = filteredUsers.slice(startIndex, endIndex); // получаем только нужные элементы для текущей страницы

  return res.status(200).json({
    pagesCount: Math.ceil(filteredUsers.length / pageSize), // общее количество страниц
    page: pageNumber, // текущая страница
    pageSize: pageSize, // размер страницы
    totalCount: filteredUsers.length, // общее количество элементов после фильтрации
    items: paginatedUsers // массив пользователей для текущей страницы
  });
});



usersRoutes.post('/', async (req: Request, res: Response) => {

const { login, password, email, createdAt } = req.body as CreateUserType;

const authHeader = await req.headers.authorization;

if (!authHeader || authHeader !== `Basic ${encodedAuth}`) {
    return res.status(401).send();
}

const errorsMessages = [];

// Проверяем, что все обязательные поля заполнены
if (typeof login !== "string" || !login || login?.trim()?.length == 0 || login?.length > 10 || login?.length < 3) {
    errorsMessages.push({
    message: 'Invalid login', 
    field: "login"
    });
}

if (typeof password !== "string" || !password || password?.trim()?.length == 0 || password?.length > 20 || password?.length < 6) {
    errorsMessages.push({
    message: 'Invalid password', 
    field: "password"
    });
}

// const emailRegex = new RegExp('^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');

if (typeof email !== "string" || !email) {
    errorsMessages.push({
    message: 'Invalid email', 
    field: "email"
    });
}


if (errorsMessages.length > 0) {
    return res.status(400).json({
    errorsMessages
    });
}

// Создаем новый блог
const newUser = await socialRepositoryForUsers.createUser(login, password, email, createdAt);

// Возвращаем созданный блог с кодом 201
return res.status(201).json(newUser);

});



usersRoutes.delete("/:userId", async (req: Request, res: Response) => {

    const userId = new ObjectId(req.params.userId);
    
    const index = await collection3.findOne({ _id: userId });
    
    const authHeader = req.headers.authorization;
  
    if (!authHeader || authHeader !== `Basic ${encodedAuth}`) {
      return res.status(401).send();
    }
  
    if (index) {
      await collection3.deleteOne({ _id: userId });
      return res.status(204).send();
    } else {
      return res.status(404).send()
    }
  
  });