import { ObjectId } from "mongodb";
import { GetPostComment, collection1, collection9, collectionPostsType } from "./db";

export const updateLikeStatusByIdPostPlusLikeCount = {
    async updatePostById(likeStatus: string, postId: ObjectId, userId: ObjectId): Promise<collectionPostsType | undefined > {
      if (typeof likeStatus !== 'string' || !likeStatus.trim()) {
        return undefined;
      }
      const definiteUserLikeStatusForDefiniteComment = await collection9.findOne({$and: [{userId: userId}, {commentId: postId}]})
      
      const findComment= await collection1.findOne({ "id": postId })
      if(findComment == null){
        
        return undefined
      }
      if(definiteUserLikeStatusForDefiniteComment?.status == likeStatus){
        
        return findComment
      }
      
      const updateComment = {
        $set: {
          likesInfo: {
            likesCount: findComment.likesInfo.likesCount+1,
            dislikesCount: findComment.likesInfo.dislikesCount,
            myStatus: "None"
          }
        }
      };
      
      const resultForUpdateComment = await collection1.findOneAndUpdate({ "id": postId }, updateComment);
      
      if(definiteUserLikeStatusForDefiniteComment){
        const updateStatus = {
          $set: { 
            status: "Like"
          }
        };
        const resultForUpdateDefinedUserLikeStatus = await collection9.findOneAndUpdate({$and: [{userId: userId}, {commentId: postId}]}, updateStatus)
        if(!resultForUpdateDefinedUserLikeStatus ){
          return undefined
        }
      } else {
      const resultOfCreatingDefiniteUserLikeStatus = await collection9.insertOne({
        postId: postId,
        userId: userId,
        status: "Like",
        })
        if(!resultOfCreatingDefiniteUserLikeStatus){
          return undefined
        }
      }
      if (resultForUpdateComment) {
        return resultForUpdateComment;
      } else {
        return undefined;
      }
    }
  };
  


  export const updateLikeStatusByIdPostPlusDislikeCount = {
    async updatePostById(likeStatus: string, id: ObjectId,userId: ObjectId): Promise<collectionPostsType | undefined > {
      if (typeof likeStatus !== 'string' || !likeStatus.trim()) {
        return undefined;
      }
      const result1 = await collection9.findOne({$and: [{userId: userId}, {commentId: id}]})
      let updateComment = {}
      const likesCount1 = await collection1.findOne({ "id": id })
      if(likesCount1 == null){
        return undefined
      }
      if(result1?.status == likeStatus){
        return likesCount1
      }
      if(result1?.status == "Like"){
        updateComment = {
          $set: {
            likesInfo: {
              "likesCount": likesCount1.likesInfo.likesCount-1,
              "dislikesCount": likesCount1.likesInfo.dislikesCount+1,
              "myStatus": "None"
            }
          }
        };
      } else {
         updateComment = {
          $set: {
            likesInfo: {
              "likesCount": likesCount1.likesInfo.likesCount,
              "dislikesCount": likesCount1.likesInfo.dislikesCount+1,
              "myStatus": "None"
            }
          }
        };
      }
      
  
      const result = await collection1.findOneAndUpdate({ "id": id }, updateComment);
      
      if(result1){
        const updateStatus = {
          $set: {
            commentId: likesCount1.id,
            userId: userId,
            status: "Dislike",
          }
        };
        const result2 = await collection9.findOneAndUpdate({$and: [{userId: userId}, {commentId: id}]}, updateStatus)
        if(!result2){
          return undefined
        }
      }else {
      const result2 = await collection9.insertOne({
        postId: likesCount1.id,
        userId: userId,
        status: "Dislike",
        })
        if(!result2){
          return undefined
        }
      }
      if (result) {
        return result;
      } else {
        return undefined;
      }
    }
  };


  export const updateLikeStatusByIdPostMinusDislikeCount = {
    async updatePostById(likeStatus: string, id: ObjectId,userId: ObjectId): Promise<collectionPostsType | undefined > {
      if (typeof likeStatus !== 'string' || !likeStatus.trim()) {
        return undefined;
      }
      const result1 = await collection9.findOne({$and: [{userId: userId}, {commentId: id}]})
      
      const likesCount1 = await collection1.findOne({ "id": id })
      if(likesCount1 == null){
        return undefined
      }
      if(result1?.status == likeStatus){
        return likesCount1
      }
      const updateComment = {
        $set: {
          likesInfo: {
            "likesCount": likesCount1.likesInfo.likesCount,
            "dislikesCount": likesCount1.likesInfo.dislikesCount-1,
            "myStatus": "None"
          }
        }
      };
     

      const result = await collection1.findOneAndUpdate({ "id": id }, updateComment);
      
      if(result1){
        const updateStatus = {
          $set: {
            commentId: likesCount1.id,
            userId: userId,
            status: "None",
          }
        };
        const result2 = await collection9.findOneAndUpdate({$and: [{userId: userId}, {commentId: id}]}, updateStatus)
        if(!result2){
          return undefined
        }
      }else {
      const result2 = await collection9.insertOne({
        postId: likesCount1.id,
        userId: userId,
        status: "None",
        })
        if(!result2){
          return undefined
        }
      }
      if (result) {
        return result;
      } else {
        return undefined;
      }
    }
  };


  export const updateLikeStatusByIdPostMinusLikeCount = {
    async updatePostById(likeStatus: string, id: ObjectId,userId: ObjectId): Promise<collectionPostsType | undefined > {
      if (typeof likeStatus !== 'string' || !likeStatus.trim()) {
        return undefined;
      }
      const result1 = await collection9.findOne({$and: [{userId: userId}, {commentId: id}]})
      
      const likesCount1 = await collection1.findOne({ "id": id })
      if(likesCount1 == null){
        return undefined
      }
      if(result1?.status == likeStatus){
        return likesCount1
      }
      const updateComment = {
        $set: {
          likesInfo: {
            "likesCount": likesCount1.likesInfo.likesCount-1,
            "dislikesCount": likesCount1.likesInfo.dislikesCount,
            "myStatus": "None"
          }
        }
      };
     

      const result = await collection1.findOneAndUpdate({ "id": id }, updateComment);
      
      if(result1){
        const updateStatus = {
          $set: {
            commentId: likesCount1.id,
            userId: userId,
            status: "None",
          }
        };
        const result2 = await collection9.findOneAndUpdate({$and: [{userId: userId}, {commentId: id}]}, updateStatus)
        if(!result2){
          return undefined
        }
      }else {
      const result2 = await collection9.insertOne({
        postId: likesCount1.id,
        userId: userId,
        status: "None",
        })
        if(!result2){         
          return undefined
        }
      }
      if (result) {
        return result;
      } else {
        return undefined;
      }
    }
  };