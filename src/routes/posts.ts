import express, {Request, Response, Router} from "express"
import { CreateCommentsRepository, GetCommentSocialRepository, GetCommentSocialRepository1, socialRepository, updateIDPost } from "../social-repository-posts";
import { collection, collectionPostsType, collection1, CreateCommentsType, GetPostComment, collection2, collection3, collection8, collection9 } from "../db";
import { Collection, ObjectId } from 'mongodb';
import { jwtService } from "../aplication/jwt-service";
import { title } from "process";
import { updateLikeStatusByIdPostMinusDislikeCount, updateLikeStatusByIdPostMinusLikeCount, updateLikeStatusByIdPostPlusDislikeCount, updateLikeStatusByIdPostPlusLikeCount } from "../social-repository-postLikes";



export const postsRouter = Router()

const auth = "admin:qwerty";
const encodedAuth = Buffer.from(auth).toString("base64");


postsRouter.get('/', async (req: Request, res: Response) => {
  const searchNameTerm = req.query.searchNameTerm as string || null; // поисковый термин для имени блога
  const sortBy = req.query.sortBy as string || 'createdAt'; // поле для сортировки
  const sortDirection = req.query.sortDirection as string || 'desc'; // направление сортировки
  const pageNumber = parseInt(req.query.pageNumber as string) || 1; // номер страницы (по умолчанию 1)
  const pageSize = parseInt(req.query.pageSize as string) || 10; // количество элементов на странице (по умолчанию 10)
  const startIndex = (pageNumber - 1) * pageSize; // индекс начального элемента
  const endIndex = pageNumber * pageSize; // индекс конечного элемента
  const posts = await socialRepository.getPosts();

  let filteredPosts = posts;
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

  const paginatedBlogs = filteredPosts.slice(startIndex, endIndex); // получаем только нужные элементы для текущей страницы

  return res.status(200).json({
    pagesCount: Math.ceil(filteredPosts.length / pageSize), // общее количество страниц
    page: pageNumber, // текущая страница
    pageSize: pageSize, // размер страницы
    totalCount: filteredPosts.length, // общее количество элементов после фильтрации
    items: paginatedBlogs // массив блогов для текущей страницы
  });
});

postsRouter.get('/:id', async (req: Request, res: Response) => {

  const id = new ObjectId(req.params.id);

  const post = await collection1.findOne({ $or: [{ _id: id }, { id }] }); 

  if (post) {
    const { _id, ...rest } = post;
    res.status(200).send(rest); 
  } else {
    res.sendStatus(404);
  }
});

postsRouter.delete('/:postId', async (req: Request, res: Response) => {

  const postId = new ObjectId(req.params.postId);

  const postIndex = await collection1.findOne({ _id: postId })

  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Basic ${encodedAuth}`) {
    return res.status(401).send();
  }

  if (postIndex) {
    await collection1.deleteOne({ _id: postId });
    return res.status(204).send();
  } else {
    return res.status(404).send()
  }

});


postsRouter.post('/', async (req: Request, res: Response) => {
  
  const { title, shortDescription, content, blogId, blogName, createdAt } = req.body as collectionPostsType;
 
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Basic ${encodedAuth}`) {
    return res.status(401).send();
  }

    // Проверяем, что все обязательные поля заполнены
  const errorsMessages = [];
  const noUseErrors = [];

  let blog;
    try {
      blog = await collection.findOne({ _id: new ObjectId(blogId) });
    } catch (error) {
      noUseErrors.push({
        message: 'Invalid blogId',
        field: 'blogId'
      });
    }

    if (typeof blog !== "object" || !blog) {
      errorsMessages.push({
        message: 'Invalid blogId',
        field: 'blogId'
      });
    }


  
  
  if (!title || title?.trim()?.length == 0 || title?.length > 30) {
    errorsMessages.push({
      message: 'Invalid title',
      field: 'title'
    });
  }
  if (!shortDescription || shortDescription?.length > 100) {
    errorsMessages.push({
      message: 'Invalid shortDescription',
      field: 'shortDescription'
    });
  }
  if (!content || content?.trim()?.length == 0 || content?.length > 1000) {
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

  

  // Создаем новый пост
  const newPost = await socialRepository.createPost(title, shortDescription, content, blogId, blogName, createdAt);

  // Возвращаем созданный пост с кодом 201
  return res.status(201).json(newPost);

});


postsRouter.put('/:id', async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);
  const { title, shortDescription, content, blogId, blogName } = req.body as collectionPostsType;
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Basic ${encodedAuth}`) {
    return res.status(401).send();
  }

  const errorsMessages = [];
  const nouseerrors = [];

  let blog;
    try {
      blog = await collection.findOne({ _id: new ObjectId(blogId) });
    } catch (error) {
      nouseerrors.push({
        message: 'Invalid blogId',
        field: 'blogId'
      });
    }

    if (typeof blog !== "object" || !blog) {
      errorsMessages.push({
        message: 'Invalid blogId',
        field: 'blogId'
      });
    }

  if (!title || title?.trim()?.length == 0 || title?.length > 30) {
    errorsMessages.push({
      message: 'Invalid title', 
      field: "title"
    });
  }

  if (!shortDescription || shortDescription?.length > 100) {
    errorsMessages.push({
      message: 'Invalid shortDescription', 
      field: "shortDescription"
    });
  }

  if (!content || content?.trim()?.length == 0 || content?.length > 1000) {
    errorsMessages.push({
      message: 'Invalid content', 
      field: "content"
    });
  }

  if (errorsMessages.length > 0) {
    return res.status(400).json({
      errorsMessages
    });
  }

  const updatedPost = await updateIDPost.updatePost(id, title, shortDescription, content, blogId, blogName);

  if (!updatedPost) {
    return res.status(404).send("Post not found");
  } else {
    return res.status(204).send(updatedPost);
  }
});






postsRouter.post('/:postId/comments', async (req: Request, res: Response) => {

  const { content } = req.body as CreateCommentsType;

  const postId = new ObjectId(req.params.postId);


  if (!req.headers.authorization) {
    res.sendStatus(401);
    return;
  }


  let post;
    try {
      post = await collection1.findOne({ _id: new ObjectId(postId) });
    } catch (error) {
      return res.status(404).json({
        message: 'Invalid postId',
        field: 'postId'
      });
    }
  
    if (!post) {
      return res.status(404).json({
        message: 'Invalid postId1',
        field: 'postId'
      });
    }



  const token = req.headers.authorization.split(" ")[1];
  const JWTtoken = await jwtService.getUserIdByToken(token);
  const authUser = await collection3.findOne({ _id: JWTtoken as ObjectId });

  if (!authUser) {
    return res.status(401).json({ message: 'User not found' });
  } 
    
  const { _id, createdAt, password, email, ...rest } = authUser; 

  const modifiedRest: {
    [key: string]: any;
    userId: ObjectId;
    userLogin: string;
  } = {
    userId: rest.id,
    userLogin: rest.login,
  };

  // Проверяем, что все обязательные поля заполнены
  const errorsMessages = [];
  
  if (!content || content?.trim()?.length == 0 || content?.length > 300 || content?.length < 20) {
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

  // Создаем новый пост
  const newComment = await CreateCommentsRepository.CreateComment(content, modifiedRest, postId);

  // Возвращаем созданный пост с кодом 201
  return res.status(201).json(newComment);
  })




  postsRouter.get('/:postId/comments', async (req: Request, res: Response) => {
    const postId = new ObjectId(req.params.postId);
    let comments = [];
  
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const JWTtoken = await jwtService.getUserIdByToken(token);
  
      if (JWTtoken) {
        // Получаем статусы из коллекции
        const statuses = await collection8.find({ userId: JWTtoken }).toArray();
        // Получаем комментарии
        const comments1 = await GetCommentSocialRepository.getComments();
        // Фильтруем комментарии по postId
        let filteredComments = comments1.filter(comment => comment.postId == req.params.postId);
        
        // Обновляем статусы комментариев
        let updatedComments = filteredComments.map(comment => {
          const correspondingStatus = statuses.find(status => status.commentId.toString() === comment.id.toString());
          
          // Если нашли соответствующий статус, обновляем поле myStatus в комментарии
          if (correspondingStatus) {
            comment.likesInfo.myStatus = correspondingStatus.status;
          } else {
            // Если статус не найден, устанавливаем myStatus в "None"
            comment.likesInfo.myStatus = "None";
          }
          return comment;
        });
  
        const sortBy = req.query.sortBy as string || 'createdAt'; // поле для сортировки
        const sortDirection = req.query.sortDirection as string || 'desc'; // направление сортировки
        const pageNumber = parseInt(req.query.pageNumber as string) || 1; // номер страницы (по умолчанию 1)
        const pageSize = parseInt(req.query.pageSize as string) || 10; // количество элементов на странице (по умолчанию 10)
        const startIndex = (pageNumber - 1) * pageSize; // индекс начального элемента
        const endIndex = pageNumber * pageSize; // индекс конечного элемента
  
        let post;
        try {
          post = await collection1.findOne({ _id: postId });
        } catch (error) {
          return res.status(404).json({
            message: 'Invalid postId',
            field: 'postId'
          });
        }
  
        if (!post) {
          return res.status(404).json({
            message: 'Invalid postId',
            field: 'postId'
          });
        }
  
        // Сортируем комментарии
        updatedComments.sort((a, b) => {
          if (a && b) {
            if (sortDirection === 'asc') {
              return a[sortBy] > b[sortBy] ? 1 : -1;
            } else {
              return a[sortBy] < b[sortBy] ? 1 : -1;
            }
          }
          return 0; // Если a или b равны null, не меняем порядок
        });
  
        // Удаляем поля _id и postId из комментариев
        updatedComments = updatedComments.map(({ _id, postId, ...rest }) => rest);
  
        // Получаем только нужные элементы для текущей страницы
        const paginatedComments = updatedComments.slice(startIndex, endIndex);
  
        return res.status(200).json({
          pagesCount: Math.ceil(updatedComments.length / pageSize), // общее количество страниц
          page: pageNumber, // текущая страница
          pageSize: pageSize, // размер страницы
          totalCount: updatedComments.length, // общее количество элементов после фильтрации
          items: paginatedComments // массив постов для текущей страницы
        });
      }
    }
  
    // Если нет авторизации, просто возвращаем все комментарии
    comments = await GetCommentSocialRepository.getComments();
    const sortBy = req.query.sortBy as string || 'createdAt'; // поле для сортировки
    const sortDirection = req.query.sortDirection as string || 'desc'; // направление сортировки
    const pageNumber = parseInt(req.query.pageNumber as string) || 1; // номер страницы (по умолчанию 1)
    const pageSize = parseInt(req.query.pageSize as string) || 10; // количество элементов на странице (по умолчанию 10)
    const startIndex = (pageNumber - 1) * pageSize; // индекс начального элемента
    const endIndex = pageNumber * pageSize; // индекс конечного элемента
    
    let post;
    try {
      post = await collection1.findOne({ _id: postId });
    } catch (error) {
      return res.status(404).json({
        message: 'Invalid postId',
        field: 'postId'
      });
    }
  
    if (!post) {
      return res.status(404).json({
        message: 'Invalid postId',
        field: 'postId'
      });
    }
  
    // Фильтруем комментарии по postId
    let filteredComments = comments.filter(comment => comment.postId == req.params.postId);
  
    // Сортируем комментарии
    filteredComments.sort((a, b) => {
      if (a && b) {
        if (sortDirection === 'asc') {
          return a[sortBy] > b[sortBy] ? 1 : -1;
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1;
        }
      }
      return 0; // Если a или b равны null, не меняем порядок
    });
  
    // Удаляем поля _id и postId из комментариев
    filteredComments = filteredComments.map(({ _id, postId, ...rest }) => rest);
  
    // Получаем только нужные элементы для текущей страницы
    const paginatedComments = filteredComments.slice(startIndex, endIndex);
  
    return res.status(200).json({
      pagesCount: Math.ceil(filteredComments.length / pageSize), // общее количество страниц
      page: pageNumber, // текущая страница
      pageSize: pageSize, // размер страницы
      totalCount: filteredComments.length, // общее количество элементов после фильтрации
      items: paginatedComments // массив постов для текущей страницы
    });
  });



  postsRouter.put('/:id/like-status', async (req: Request, res: Response) => {
    const id = new ObjectId(req.params.id);
  
    const { likeStatus } = req.body;
    if (!req.headers.authorization) {
      res.sendStatus(401);
      return;
    }
  
    const token = req.headers.authorization.split(" ")[1];
    const JWTtoken = await jwtService.getUserIdByToken(token);
    const authUser = await collection3.findOne({ _id: JWTtoken as ObjectId });
    const Post = await collection1.findOne({ "id": id})
  
    if(!Post){
      return res.sendStatus(404)
    }
  
  
    if(!JWTtoken){
      return res.sendStatus(401)
    }
  
    // if (Comment.commentatorInfo.userId.toString() !== JWTtoken.toString()) {
    //   return res.sendStatus(403);
    // } 
  
  
    if (!authUser) {
      return res.sendStatus(401);
    } 
  
    const errorsMessages = [];
   
    const statusArray = ['None', 'Like', 'Dislike'];
    if (!likeStatus || likeStatus?.trim()?.length == 0 || !statusArray.includes(likeStatus)) {
      errorsMessages.push({
        message: 'Invalid likeStatus', 
        field: "likeStatus"
      });
    }
  
    if (errorsMessages.length > 0) {
      return res.status(400).json({
        errorsMessages
      });
    }
  
    const myLikesStatus = await collection9.findOne({$and: [{userId: JWTtoken}, {commentId: id}]})
  
    const post = await collection1.findOne({id:id})
    if(myLikesStatus?.status == likeStatus){
      return res.status(204).send({
        id: post?.id,
        title: post?.title,
        shortDescription: post?.shortDescription,
        content: post?.content,
        blogId: post?.blogId,
        blogName: post?.blogName,
        createdAt: post?.createdAt,
        extendedLikesInfo: {
        likesCount: post?.likesInfo.likesCount,
        dislikesCount: post?.likesInfo.dislikesCount,
        myStatus: myLikesStatus?.status
  
    }
      })
    }
  
    if( /*myLikesStatus?.commentatorInfo.userId === "None"  && */likeStatus == "Like"){
      
      const updatedCommentLikeStatus = await updateLikeStatusByIdPostPlusLikeCount.updatePostById(likeStatus, id, JWTtoken);
      if (!updatedCommentLikeStatus) {
        return res.status(404).send("Comment not found");
      } else {
        return res.status(204).send(updatedCommentLikeStatus);
      }
    }
  
  
    if(myLikesStatus?.status === "Like" && likeStatus === "None"){
      const updatedCommentLikeStatus = await updateLikeStatusByIdPostMinusLikeCount.updatePostById(likeStatus, id, JWTtoken);
      if (!updatedCommentLikeStatus) {
        return res.status(404).send("Comment not found");
      } else {
        return res.status(204).send(updatedCommentLikeStatus);
      }
    }
  
  
    if( /*myLikesStatus?.commentatorInfo.userId === "None" && */likeStatus === "Dislike"){
      
      const updatedCommentLikeStatus = await updateLikeStatusByIdPostPlusDislikeCount.updatePostById(likeStatus, id, JWTtoken);
      if (!updatedCommentLikeStatus) {
        return res.status(404).send("Comment not found");
      } else {
        return res.status(204).send(updatedCommentLikeStatus);
      }
    }
  
    if(myLikesStatus?.status === "Dislike" && likeStatus === "None"){
      
      const updatedCommentLikeStatus = await updateLikeStatusByIdPostMinusDislikeCount.updatePostById(likeStatus, id, JWTtoken);
      if (!updatedCommentLikeStatus) {
        return res.status(404).send("Comment not found");
      } else {
        return res.status(204).send(updatedCommentLikeStatus);
      }
    }
    
    return res.status(204).send();
  });