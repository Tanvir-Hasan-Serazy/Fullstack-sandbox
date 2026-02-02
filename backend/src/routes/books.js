import express from "express";
import { upload } from "../middleware/upload.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { prisma } from "../prisma/client.js";

const router = express.Router();

router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, stars, description } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No image file is provided" });
    }

    // Upload Buffer to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer);

    // Save to DB
    const books = await prisma.books.create({
      data: {
        title: title,
        stars: parseInt(stars),
        description: description,
        coverImageURL: uploadResult?.secure_url,
        cloudinaryPublicId: uploadResult?.public_id,
      },
    });

    res.status(201).json({
      sucess: true,
      books,
    });
  } catch (error) {
    console.error("Error uploading book:", error);
    res
      .status(500)
      .json({ error: "book tiles are unique, Failed to upload book" });
  }
});

router.get("/", async (req, res) => {
  try {
    const books = await prisma.books.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, books });
  } catch (error) {
    console.error("error fetching books", error);
    res.status(500).json({ error: "failed to get books" });
  }
});

export default router;
