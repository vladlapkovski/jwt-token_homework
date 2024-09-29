import express, {Request, Response, Router} from "express"
import { getIDBlog, socialRepository } from "../social-repository-blogs";
import { socialRepositoryForPostsInBlogs } from "../social-repositoryForPostsInBlogs"
import { CreateCommentsType, collection, collection3, collection4, collection8, collectionBlogsType, collectionPostsType } from '../db';
export const commentsRoutes = Router({}) 
import { ObjectId } from 'mongodb';
import { updateIDBlog } from "../social-repository-blogs"
import { jwtService } from "../aplication/jwt-service";
import { updateIdComment, updateLikeStatusByIdCommentMinusDislikeCount, updateLikeStatusByIdCommentMinusLikeCount, updateLikeStatusByIdCommentPlusDislikeCount, updateLikeStatusByIdCommentPlusLikeCount } from "../social-repository-posts";


const auth = "admin:qwerty";
const encodedAuth = Buffer.from(auth).toString("base64");


commentsRoutes.get('/:id', async (req: Request, res: Response) => {

    if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const JWTtoken = await jwtService.getUserIdByToken(token);

      if(JWTtoken){
        const id = new ObjectId(req.params.id);
  
        const comment = await collection4.findOne({ $or: [{ _id: id }, { id }] }); 
        if(!comment){
          return res.sendStatus(404);
        }
        const likeStatus = await collection8.findOne({$and: [{userId: JWTtoken}, {commentId: id}]})

        if(likeStatus){
          return res.status(200).send({
            id: comment?.id,
            content: comment?.content,
            commentatorInfo: {
            userId: comment?.commentatorInfo.userId,
            userLogin: comment?.commentatorInfo.userLogin,
          },
            createdAt: comment?.createdAt,
            likesInfo: {
            likesCount: comment?.likesInfo.likesCount,
            dislikesCount: comment?.likesInfo.dislikesCount,
            myStatus: likeStatus?.status
            
        }
          })
        } if(!likeStatus) {
          return res.status(200).send({
            id: comment?.id,
            content: comment?.content,
            commentatorInfo: {
            userId: comment?.commentatorInfo.userId,
            userLogin: comment?.commentatorInfo.userLogin,
          },
            createdAt: comment?.createdAt,
            likesInfo: {
            likesCount: comment?.likesInfo.likesCount,
            dislikesCount: comment?.likesInfo.dislikesCount,
            myStatus: "None"
            
        }
          })
        }

      }
    } 
    
    

    const id = new ObjectId(req.params.id);
  
    const comment = await collection4.findOne({ $or: [{ _id: id }, { id }] }); 
  
    if (comment) {
      const { _id, postId, ...rest } = comment;
      return res.status(200).send(rest); 
    } else {
      return res.sendStatus(404);
    }
  });


commentsRoutes.delete('/:id', async (req: Request, res: Response) => {

  const id = new ObjectId(req.params.id);

  if (!req.headers.authorization) {
    res.sendStatus(401);
    return;
  }

  const token = req.headers.authorization.split(" ")[1];
  const JWTtoken = await jwtService.getUserIdByToken(token);// userId перенаименовать
  const authUser = await collection3.findOne({ _id: JWTtoken as ObjectId });
  const Comment = await collection4.findOne({ id: id})
  
  
  if(!Comment){
    return res.sendStatus(404)
  }


  if(!JWTtoken){
    return res.sendStatus(401)
  }

  if (Comment.commentatorInfo.userId.toString() !== JWTtoken.toString()) {
   
    return res.sendStatus(403);
  } 

  if (!authUser) {
    return res.status(401).json({ message: 'User not found' });
  } 

  const postIndex = await collection4.findOne({ _id: id })

  
  if (postIndex) {
    await collection4.deleteOne({ _id: id });
    return res.status(204).send();
  } else {
    return res.status(404).send()
  }

});



commentsRoutes.put('/:id', async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);

  const { content } = req.body as CreateCommentsType;

  if (!req.headers.authorization) {
    res.sendStatus(401);
    return;
  }

  const token = req.headers.authorization.split(" ")[1];
  const JWTtoken = await jwtService.getUserIdByToken(token);
  const authUser = await collection3.findOne({ _id: JWTtoken as ObjectId });
  const Comment = await collection4.findOne({ "id": id})

  if(!Comment){
    return res.sendStatus(404)
  }


  if(!JWTtoken){
    return res.sendStatus(401)
  }

  if (Comment.commentatorInfo.userId.toString() !== JWTtoken.toString()) {
    return res.sendStatus(403);
  } 


  if (!authUser) {
    return res.sendStatus(401);
  } 

  const errorsMessages = [];

  if (!content || content?.trim()?.length == 0 || content?.length > 300 || content?.length < 20) {
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

  const updatedComment = await updateIdComment.updateCommentById(content, id);

  if (!updatedComment) {
    return res.status(404).send("Comment not found");
  } else {
    return res.status(204).send(updatedComment);
  }
});




commentsRoutes.put('/:id/like-status', async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);

  const { likeStatus } = req.body;
  if (!req.headers.authorization) {
    res.sendStatus(401);
    return;
  }

  const token = req.headers.authorization.split(" ")[1];
  const JWTtoken = await jwtService.getUserIdByToken(token);
  const authUser = await collection3.findOne({ _id: JWTtoken as ObjectId });
  const Comment = await collection4.findOne({ "id": id})

  if(!Comment){
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

  const myLikesStatus = await collection8.findOne({$and: [{userId: JWTtoken}, {commentId: id}]})

  const comment = await collection4.findOne({id:id})
  if(myLikesStatus?.status == likeStatus){
    return res.status(204).send({
      id: comment?.id,
      content: comment?.content,
      commentatorInfo: {
      userId: comment?.commentatorInfo.userId,
      userLogin: comment?.commentatorInfo.userLogin,
    },
      createdAt: comment?.createdAt,
      postId: comment?.postId,
      likesInfo: {
      likesCount: comment?.likesInfo.likesCount,
      dislikesCount: comment?.likesInfo.dislikesCount,
      myStatus: myLikesStatus?.status

  }
    })
  }

  if( /*myLikesStatus?.commentatorInfo.userId === "None"  && */likeStatus == "Like"){
    
    const updatedCommentLikeStatus = await updateLikeStatusByIdCommentPlusLikeCount.updateCommentById(likeStatus, id, JWTtoken);
    if (!updatedCommentLikeStatus) {
      return res.status(404).send("Comment not found");
    } else {
      return res.status(204).send(updatedCommentLikeStatus);
    }
  }


  if(myLikesStatus?.status === "Like" && likeStatus === "None"){
    const updatedCommentLikeStatus = await updateLikeStatusByIdCommentMinusLikeCount.updateCommentById(likeStatus, id, JWTtoken);
    if (!updatedCommentLikeStatus) {
      return res.status(404).send("Comment not found");
    } else {
      return res.status(204).send(updatedCommentLikeStatus);
    }
  }


  if( /*myLikesStatus?.commentatorInfo.userId === "None" && */likeStatus === "Dislike"){
    
    const updatedCommentLikeStatus = await updateLikeStatusByIdCommentPlusDislikeCount.updateCommentById(likeStatus, id, JWTtoken);
    if (!updatedCommentLikeStatus) {
      return res.status(404).send("Comment not found");
    } else {
      return res.status(204).send(updatedCommentLikeStatus);
    }
  }

  if(myLikesStatus?.status === "Dislike" && likeStatus === "None"){
    
    const updatedCommentLikeStatus = await updateLikeStatusByIdCommentMinusDislikeCount.updateCommentById(likeStatus, id, JWTtoken);
    if (!updatedCommentLikeStatus) {
      return res.status(404).send("Comment not found");
    } else {
      return res.status(204).send(updatedCommentLikeStatus);
    }
  }
  
  return res.status(204).send();
});