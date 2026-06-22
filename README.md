# 🎨 HeyAI — AI Image Generator & Community Gallery

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-blue.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-v19.0.0-blue.svg)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/vite-v6.2.0-blue.svg)](https://vite.dev/)
[![TailwindCSS Version](https://img.shields.io/badge/tailwindcss-v4.0.17-blue.svg)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

HeyAI is a state-of-the-art MERN-stack web application that allows users to generate high-fidelity, custom-aspect-ratio images using advanced AI, customize art styles, fine-tune creativity parameters, and share their creations with a global community feed.

---

## ⚡ Features

### 🎨 Creative Studio (Frontend)
- **Flexible Canvas Ratios**: Generate images in **1:1** (Square), **16:9** (Landscape), or **9:16** (Portrait) aspect ratios.
- **Curated Art Styles**: Instantly apply predefined art styles (Photo, Cyberpunk, Anime, Fantasy, 3D Render, Watercolor) that inject precise visual prompt modifiers.
- **Imaginative CFG Scale**: Adjust a slider from 1 (highly imaginative) to 15 (extremely precise prompt matching).
- **AI Prompt Enhancer ("Surprise Me")**: Running low on ideas? Tap the "Surprise Me" button to let Puter's AI chat brainstorm a gorgeous, highly detailed prompt for you.
- **Client-Side Generation**: Leverages client-side serverless AI features using Puter.js (`gpt-image-2` model) for fast, free text-to-image synthesis.
- **Responsive Layout**: Designed with a futuristic dark glassmorphism theme that works beautifully on mobile, tablet, and desktop screens.

### 🖼️ Community Gallery (Backend & Feed)
- **Masonry Grid**: View user creations in a fluid, performance-optimized Pinterest-style masonry grid.
- **Advanced Filtering & Search**: Instant filter pills for styles, and live text search matching against prompt text or creator names.
- **Detailed Lightbox**: Click any card to trigger a blurred-overlay modal showcasing high-definition images, detailed creator credits, aspect ratio metadata, and prompt copy options.
- **Instant Downloader & Copy**: Download the HD source file directly to your local computer, or copy the exact generation prompt to your clipboard in a single click.
- **WebP Compression on Upload**: The server compresses images using **Sharp** into optimized WebP formats (80% quality) before saving, keeping MongoDB storage lightweight and image loads incredibly fast.

---

## 🏗️ Project Architecture

```txt
AI_IMAGE_GENERATOR/
├── backend/                  # Node.js/Express Server
│   ├── src/
│   │   ├── config/           # Database connections
│   │   ├── controller/       # Post & Image generation handlers
│   │   ├── middlewares/      # Authentication & general middlewares
│   │   ├── models/           # Mongoose schemas (MongoDB)
│   │   └── routes/           # API router endpoints
│   ├── .env.example          # Environment variables template
│   ├── index.js              # Server entry point
│   └── package.json
└── frontend/                 # React SPA (Vite + Tailwind v4)
    ├── src/
    │   ├── components/       # Shared UI components (Navbar)
    │   ├── pages/            # View Pages (Homepage, CreatePage)
    │   ├── App.jsx           # Main routing & layout
    │   ├── index.css         # Styling system & Tailwind rules
    │   └── main.jsx          # Frontend entry point
    ├── index.html
    └── package.json
```

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4 | Rapid-load single-page application with modern responsive layout. |
| **Routing** | React Router DOM v7 | Dynamic client-side routing. |
| **AI Integration**| Puter.js (`@heyputer/puter.js`) | Client-side SDK for prompt enhancement and serverless text-to-image. |
| **Backend** | Node.js, Express | RESTful API server. |
| **Database** | MongoDB, Mongoose | Schema validation and storage for user post metadata & compressed WebP image data. |
| **Optimization** | Sharp | Server-side image optimization and compression engine. |
| **API Client** | Axios | Network client handling REST transactions. |

---

## 🚀 Installation & Setup

Follow these instructions to run the application locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local MongoDB instance.
- An [OpenAI API Key](https://platform.openai.com/) (Optional - for backend image generation fallback router).
- A [Cloudinary Account](https://cloudinary.com/) (Optional - configuration ready).

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/rd1924678-create/Ai-image-generator.git
cd heyai-image-generator
```

---

### Step 2: Configure and Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment variable configuration file:
   - Create a file named `.env` in the root of the `backend` directory.
   - Populate it with the following configuration:
     ```env
     PORT=5555
     MONGODB_URI=your_mongodb_connection_string
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     OPENAI_API_KEY=your_openai_api_key
     ```
4. Start the backend development server (uses `nodemon`):
   ```bash
   npm run dev
   ```
   The backend will start running, by default on: `http://localhost:5555`.

---

### Step 3: Configure and Start the Frontend

1. Open a new terminal window, and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will boot up and print a local URL, typically: `http://localhost:5173`. Open this URL in your web browser.

---

## 📡 API Reference

### Community Posts

#### 1. Fetch All Posts
* **Endpoint:** `GET /api/post/get`
* **Description:** Retrieves all shared images, prompts, and creator credits stored in the database.
* **Response (200 OK):**
  ```json
  [
    {
      "_id": "64e03d4c...",
      "name": "Aria Nova",
      "prompt": "A hyper-realistic cyborg wolf standing on neon-lit Tokyo ruins...",
      "photo": "data:image/webp;base64,UklGR...",
      "createdAt": "2026-06-22T..."
    }
  ]
  ```

#### 2. Share a Creation
* **Endpoint:** `POST /api/post/create`
* **Description:** Accepts a base64 encoded photo, creator name, and prompt. Compresses the photo to WebP, and saves it in MongoDB.
* **Body:**
  ```json
  {
    "name": "Creator Name",
    "prompt": "Your full generation prompt",
    "photo": "data:image/png;base64,..."
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "_id": "64e03d4c...",
    "name": "Creator Name",
    "prompt": "Your full generation prompt",
    "photo": "data:image/webp;base64,...",
    "createdAt": "2026-06-22T..."
  }
  ```

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.
# Ai-image-generator
