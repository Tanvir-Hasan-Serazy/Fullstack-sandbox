import Express from "express";
import { upload } from "../middleware/upload.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { prisma } from "../prisma/client.js";

const idRouter = Express.Router();

idRouter.post("/id", upload.single("image"), async (req, res) => {
  try {
    const { name, age, address, gender, bloodGroup, height } = req.body;

    if (age < 18) {
      return res.status(400).json({ error: "Age must be at least 18" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No Image file provided" });
    }

    //Upload buffer to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer);

    // res.json({ name, age, address, gender, bloodGroup, height });
    //Save to DB
    const ids = await prisma.nationalID.create({
      data: {
        name: name,
        age: parseInt(age),
        address: address,
        gender: gender,
        bloodGroup: bloodGroup,
        height: parseInt(height),
        imageURL: uploadResult?.secure_url,
        cloudinaryPublicId: uploadResult?.public_id,
      },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error, "Error creating National ID");
    res.status(500).json(error, { error: "Failed to create National ID" });
  }
});

idRouter.get("/id", async (req, res) => {
  try {
    const ids = await prisma.nationalID.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(200).json({ success: true, ids });
  } catch (error) {
    console.error(error, "Error fetching National IDs");
    res.status(500).json({ error: "Failed to get National IDs" });
  }
});

export default idRouter;
