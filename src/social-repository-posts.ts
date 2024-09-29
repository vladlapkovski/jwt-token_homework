import { CommentLikes, CreateCommentsType, GetPostComment, collection, collection1, collection4, collection8, collectionPostsType } from './db';
import { ObjectId } from 'mongodb';


export const socialRepository = {
  async getPosts(): Promise<collectionPostsType[]> {
    const foundPosts = await collection1.find({}).toArray();
    const posts = foundPosts.map((post) => {
      const { _id, ...rest } = post;
      return rest;
    });
    return posts;
  },

  async createPost(
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
      blog = await collection.findOne(
        { _id: new ObjectId(blogId) },
        { projection: { name: 1 } }
      );
    } catch (error) {
      return undefined;
    }

    if (typeof blog !== "object" || !blog) {
      return undefined;
    }

    
    const BLOGNAME = (blog as { name: string }).name;
    const createdAt2 = new Date().toISOString();
    const objectId1 = new ObjectId();
    const result = await collection1.insertOne({
      title,
      shortDescription,
      content,
      blogId,
      blogName: BLOGNAME,
      createdAt: createdAt2,
      _id: objectId1,
      id: objectId1,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: [
          {
            addedAt: undefined,
            userId: undefined,
            login: undefined
          }
        ]
      }
    });

    return {
      id: result.insertedId,
      title,
      shortDescription,
      content,
      blogId,
      blogName: BLOGNAME,
      createdAt: createdAt2,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: [
          {
            addedAt: undefined,
            userId: undefined,
            login: undefined
          }
        ]
      }
    };
  }
};

export const getIDPost = {
  async getPost(): Promise<collectionPostsType[]> {
    const foundPosts = await collection1.find({}).toArray();
    const posts = foundPosts.map((post) => {
      const { _id, ...rest } = post;
      return rest;
    });
    return posts;
  }
};

export const deleteIDPost = {
  async deletePost(): Promise<void | collectionPostsType[]> {
    return collection1.find({}).toArray();
  }
};

export const updateIDPost = {
  async updatePost(
    id: ObjectId,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string
  ) {
    if (
      typeof title !== 'string' || !title.trim() ||
      typeof shortDescription !== 'string' || !shortDescription.trim() ||
      typeof content !== 'string' || !content.trim() ||
      typeof blogId !== 'string' || !blogId.trim()
    ) {
      return undefined;
    }

    let blog;
    try {
      blog = await collection.findOne(
        { _id: new ObjectId(blogId) },
        { projection: { name: 1 } }
      );
    } catch (error) {
      return undefined;
    }

    if (typeof blog !== "object" || !blog) {
      return undefined;
    }

    const BLOGNAME = (blog as { name: string }).name;
    const updatePostDocument = {
      $set: {
        title,
        shortDescription,
        content,
        blogId,
        blogName: BLOGNAME
      }
    };

    const result1 = await collection1.findOneAndUpdate({ _id: id }, updatePostDocument);

    if (result1) {
      const updatedPost = result1 as collectionPostsType;
      return {
        id: updatedPost.id.toString(),
        title: updatedPost.title,
        shortDescription: updatedPost.shortDescription,
        content: updatedPost.content,
        blogId: updatedPost.blogId,
        blogName: updatedPost.blogName
      };
    } else {
      return undefined;
    }
  }
};



export const CreateCommentsRepository = {
  async CreateComment(content: string, modifiedRest: any, postId: ObjectId): Promise<CreateCommentsType | undefined> {
  if (!content.trim()) {
    return undefined;
  }

  let post;
    try {
      post = await collection1.findOne({ _id: new ObjectId(postId) });
    } catch (error) {
      return undefined;
    }

    if (typeof post !== "object" || !post) {
      return undefined;
    }

  const createdAt1 = new Date().toISOString();
  const objectId = new ObjectId();
  const result = await collection4.insertOne({
    id: objectId,
    content,
    commentatorInfo: modifiedRest,
    createdAt: createdAt1,
    postId: postId.toString(),
    _id: objectId,
    likesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: "None"
    }
  });
  return {
    id: result.insertedId,
    content,
    commentatorInfo: modifiedRest,
    createdAt: createdAt1,
    likesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: "None"
    }
  };
}
}


export const GetCommentSocialRepository = {
  async getComments(): Promise<CreateCommentsType[]> {
    const foundComments = await collection4.find({}).toArray();
    const comments = foundComments.map((comment) => {
      const { _id, ...rest } = comment;
      return { ...rest, id: _id }; // Сохраняем id для дальнейшего использования
    });
    return comments;
  }
}

  export const GetCommentSocialRepository1 = {
    async getComments1(JWTtoken: ObjectId, postId: ObjectId): Promise<CommentLikes[]> {
      const foundComments = await collection4.find({}).toArray();
      const foundStatus = await collection8.find({}).toArray()
      const comments = foundComments.map((comment) => {
        const { _id, ...rest } = comment;
        return rest;
      });
      const statuses = foundStatus.filter((status) => {
        return comments.some((comment) => comment.commentId === status.commentId);
    }).map((filteredStatus) => {
        const { _id, ...ostatok } = filteredStatus;
        return ostatok;
    });
      return statuses
    }}



  export const updateIdComment = {
    async updateCommentById(content: string, id: ObjectId) {
      if (typeof content !== 'string' || !content.trim()) {
        return undefined;
      }
  
      const updateComment = {
        $set: {
          content
        }
      };
  
      const result = await collection4.findOneAndUpdate({ _id: id }, updateComment);
  
      if (result) {
        const updatedComment = result as CreateCommentsType;
        return {
          content: updatedComment.content
        };
      } else {
        return undefined;
      }
    }
  };




  export const updateLikeStatusByIdCommentPlusLikeCount = {
    async updateCommentById(likeStatus: string, id: ObjectId, userId: ObjectId): Promise<GetPostComment | undefined > {
      if (typeof likeStatus !== 'string' || !likeStatus.trim()) {
        return undefined;
      }
      const definiteUserLikeStatusForDefiniteComment = await collection8.findOne({$and: [{userId: userId}, {commentId: id}]})
      
      const findComment= await collection4.findOne({ "id": id })
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
      
      const resultForUpdateComment = await collection4.findOneAndUpdate({ "id": id }, updateComment);
      
      if(definiteUserLikeStatusForDefiniteComment){
        const updateStatus = {
          $set: { 
            status: "Like"
          }
        };
        const resultForUpdateDefinedUserLikeStatus = await collection8.findOneAndUpdate({$and: [{userId: userId}, {commentId: id}]}, updateStatus)
        if(!resultForUpdateDefinedUserLikeStatus ){
          return undefined
        }
      } else {
      const resultOfCreatingDefiniteUserLikeStatus = await collection8.insertOne({
        commentId: id,
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
  


  export const updateLikeStatusByIdCommentPlusDislikeCount = {
    async updateCommentById(likeStatus: string, id: ObjectId,userId: ObjectId): Promise<GetPostComment | undefined > {
      if (typeof likeStatus !== 'string' || !likeStatus.trim()) {
        return undefined;
      }
      const result1 = await collection8.findOne({$and: [{userId: userId}, {commentId: id}]})
      let updateComment = {}
      const likesCount1 = await collection4.findOne({ "id": id })
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
      
  
      const result = await collection4.findOneAndUpdate({ "id": id }, updateComment);
      
      if(result1){
        const updateStatus = {
          $set: {
            commentId: likesCount1.id,
            userId: userId,
            status: "Dislike",
          }
        };
        const result2 = await collection8.findOneAndUpdate({$and: [{userId: userId}, {commentId: id}]}, updateStatus)
        if(!result2){
          return undefined
        }
      }else {
      const result2 = await collection8.insertOne({
        commentId: likesCount1.id,
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


  export const updateLikeStatusByIdCommentMinusDislikeCount = {
    async updateCommentById(likeStatus: string, id: ObjectId,userId: ObjectId): Promise<GetPostComment | undefined > {
      if (typeof likeStatus !== 'string' || !likeStatus.trim()) {
        return undefined;
      }
      const result1 = await collection8.findOne({$and: [{userId: userId}, {commentId: id}]})
      
      const likesCount1 = await collection4.findOne({ "id": id })
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
     

      const result = await collection4.findOneAndUpdate({ "id": id }, updateComment);
      
      if(result1){
        const updateStatus = {
          $set: {
            commentId: likesCount1.id,
            userId: userId,
            status: "None",
          }
        };
        const result2 = await collection8.findOneAndUpdate({$and: [{userId: userId}, {commentId: id}]}, updateStatus)
        if(!result2){
          return undefined
        }
      }else {
      const result2 = await collection8.insertOne({
        commentId: likesCount1.id,
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


  export const updateLikeStatusByIdCommentMinusLikeCount = {
    async updateCommentById(likeStatus: string, id: ObjectId,userId: ObjectId): Promise<GetPostComment | undefined > {
      if (typeof likeStatus !== 'string' || !likeStatus.trim()) {
        return undefined;
      }
      const result1 = await collection8.findOne({$and: [{userId: userId}, {commentId: id}]})
      
      const likesCount1 = await collection4.findOne({ "id": id })
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
     

      const result = await collection4.findOneAndUpdate({ "id": id }, updateComment);
      
      if(result1){
        const updateStatus = {
          $set: {
            commentId: likesCount1.id,
            userId: userId,
            status: "None",
          }
        };
        const result2 = await collection8.findOneAndUpdate({$and: [{userId: userId}, {commentId: id}]}, updateStatus)
        if(!result2){
          return undefined
        }
      }else {
      const result2 = await collection8.insertOne({
        commentId: likesCount1.id,
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
  
  