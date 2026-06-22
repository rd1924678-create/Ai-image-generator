import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from 'dotenv';
import { connectDB } from './src/config/db.js';
import PostRouter from './src/routes/post.router.js';
import genRouter from './src/routes/generateImg.routes.js';

dotenv.config();
connectDB();


const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));




app.use('/api/post', PostRouter);
app.use('/api/generate', genRouter);

// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
