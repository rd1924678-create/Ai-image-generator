import express from 'express';  
import { generateImage } from '../controller/gernerate.controller.js';


const genRouter = express.Router();


genRouter.post('/', generateImage)


export default genRouter;