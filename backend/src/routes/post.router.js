import express from 'express';

import { createPost, getPosts } from '../controller/post.controller.js';


const PostRouter = express.Router();

PostRouter.get('/get', getPosts);
PostRouter.post('/create', createPost);



export default PostRouter;