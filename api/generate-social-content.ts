import type { Request, Response } from "express";
import { generateSocialContent, generateImage } from "../services/contentService";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, instructions, audience, platforms, media } = req.body;

  try {
    const result = await generateSocialContent(url, instructions, audience, platforms);
    
    // Generate images for Instagram posts
    if (result.instagramPosts) {
        for (const post of result.instagramPosts) {
            if (post.imagePrompt) {
                post.imageUrl = await generateImage(post.imagePrompt);
            }
        }
    }

    return res.json(result);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate content: " + err.message });
  }
}
