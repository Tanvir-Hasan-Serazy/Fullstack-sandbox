import Express from "express";
import { upload } from "../middleware/upload.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinaryUpload.js";
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
    const data = await prisma.nationalID.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json(error);
    console.error(error, "Error fetching National IDs");
    res.status(500).json({ error: "Failed to get National IDs" });
  }
});

idRouter.get("/id/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await prisma.nationalID.findUnique({ where: { id } });
    if (!data) {
      res.status(400).json({ success: false, message: "Item not found" });
    }

    res.status(200).json({
      data: data,
      success: true,
    });
  } catch (error) {
    console.error("Error getting data", error);
    res.status(500).json({ success: false, message: "cannot get data" });
  }
});

idRouter.put("/id/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  try {
    const { name, age, address, gender, bloodGroup, height } = req.body;
    const existingUser = await prisma.nationalID.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "Id doesn't exist" });
    }
    if (age < 18) {
      return res.status(400).json({ error: "Age must be at least 18" });
    }

    const updateData = {
      name: name || existingUser.name,
      age: age ? parseInt(age) : existingUser.age,
      address: address || existingUser.address,
      gender: gender || existingUser.gender,
      bloodGroup: bloodGroup || existingUser.bloodGroup,
      height: height ? parseInt(height) : existingUser.height,
    };

    if (req.file) {
      // Deleting older image
      if (existingUser.cloudinaryPublicId) {
        await deleteFromCloudinary(existingUser.cloudinaryPublicId);
      }
      // Uploading new photo
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      console.log(updateData);
      updateData.imageURL = uploadResult.secure_url;
      updateData.cloudinaryPublicId = uploadResult.public_id;
    }

    const updateUser = await prisma.nationalID.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({ success: true, message: "Information Updated" });
  } catch (error) {
    console.error("Error updating Naional ID", error);
    res.status(500).json({ error: "Failed to update nationalID" });
  }
});

idRouter.delete("/id/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.nationalID.findUnique({
      where: { id },
    });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "National ID not found",
      });
    }

    if (item.cloudinaryPublicId) {
      await deleteFromCloudinary(item.cloudinaryPublicId);
    }

    await prisma.nationalID.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Id Deleted",
    });
  } catch (error) {
    console.error("Error Ocured while deleting", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default idRouter;
