import express, {Request, Response} from "express"
import { blogsRoutes } from "./routes/blogs";
import { postsRouter } from "./routes/posts";
import { dataRouter } from "./routes/clear_all_data";
import { postsForBlogsRoutes } from "./routes/postsForBlogs";
import { authRoutes, limiter } from "./routes/auth";
import { usersRoutes } from "./routes/users";
import { commentsRoutes } from "./routes/comments";
import { emailRouter } from "./send-mail";
import { rateLimit } from 'express-rate-limit'
import  cookieParser  from 'cookie-parser'
import { securityRoutes } from "./routes/security";


export const appStart = ()=> {
const app = express();

const parserMiddleware = express.json()


// app.use(limiter)
app.set('trust proxy', true)
app.use(cookieParser())
app.use(parserMiddleware)
app.use("/hometask_07/api/blogs", blogsRoutes)
app.use("/hometask_07/api", postsForBlogsRoutes)
app.use("/hometask_07/api/posts", postsRouter)
app.use("/hometask_07/api/testing/all-data", dataRouter)
app.use("/hometask_07/api/auth", authRoutes)
app.use("/hometask_07/api/users", usersRoutes)
app.use("/hometask_07/api/comments", commentsRoutes)
app.use("/hometask_07/api/email", emailRouter)
app.use("/hometask_07/api/security/devices", securityRoutes)
return app;
}