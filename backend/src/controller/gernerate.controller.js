import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateImage = async (req, res) => {
  const { prompt } = req.body;

  // Validate the prompt input
  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Log the prompt for debugging purposes
  console.log("Prompt received:", prompt);

  try {
    // Simplified request for debugging
    const response = await openai.images.generate({
      model: "dall-e-3",  // Make sure this is correct for your API version
      prompt: prompt.trim(),
      n: 1,
      size: "1024x1024", // Try adjusting this if needed
      response_format: "b64_json",
    });

    // Log the response from OpenAI
    console.log("Response from OpenAI:", response);

    const image = response.data[0]?.b64_json;

    if (!image) {
      return res.status(500).json({ error: "Image not returned from OpenAI" });
    }

    res.status(200).json({ photo: image });

  } catch (error) {
    // Log the full error for debugging
    console.error("🔥 Full OpenAI error:", JSON.stringify(error, null, 2));

    const errorMessage = error?.response?.data?.error?.message || error?.message || "Server Error";
    res.status(500).json({
      error: errorMessage,
    });
  }
};
