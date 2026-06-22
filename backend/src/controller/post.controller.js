import Post from "../models/postSchema.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';
import sharp from 'sharp';
dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({});
        return res.status(200).json(posts);
    } catch (error) {
       return res.status(500).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {
    const { name, prompt, photo } = req.body;
    try {
        // 1. Extract base64 data and convert to buffer
        const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: "Invalid image format." });
        }
        
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // 2. Compress using Sharp (convert to webp for better compression)
        const compressedBuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();
            
        // 3. Convert back to base64 data URI
        const compressedBase64 = `data:image/webp;base64,${compressedBuffer.toString('base64')}`;
        
        // 4. Save directly to MongoDB to bypass Cloudinary
        const newPost = await Post.create({
            name,
            prompt,
            photo: compressedBase64
        });
        return res.status(201).json(newPost);
    } catch (error) {
        console.error("Upload Error:", error);
        return res.status(500).json({ message: error.message });
    }
}   