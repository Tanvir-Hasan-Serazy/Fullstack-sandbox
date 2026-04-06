import { auth } from "../config/better-auth.js";
import { uploadImage } from "../services/image.service.js";
import { prisma } from "../prisma/client.js";

/**
 * Custom registration endpoint that handles profile photo upload
 * and then creates user via better-auth
 */
export const registerWithPhoto = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // console.log("=== Registration Request ===");
    // console.log("Body:", { name, email, password: "***" });
    // console.log(
    //   "File:",
    //   req.file
    //     ? {
    //         fieldname: req.file.fieldname,
    //         originalname: req.file.originalname,
    //         mimetype: req.file.mimetype,
    //         size: req.file.size,
    //       }
    //     : "No file uploaded",
    // );

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }

    let profilePhoto = null;
    let profilePhotoId = null;

    // Upload profile photo if provided
    if (req.file) {
      console.log("Starting image upload to Cloudinary...");
      try {
        const uploadResult = await uploadImage(
          req.file.buffer,
          "profile-photo",
        );
        profilePhoto = uploadResult.secure_url;
        profilePhotoId = uploadResult.public_id;
        console.log("Image uploaded successfully:", {
          profilePhoto,
          profilePhotoId,
        });
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          error: "Failed to upload profile photo",
        });
      }
    } else {
      console.log("No profile photo to upload");
    }

    // Create user with better-auth
    console.log("Creating user with better-auth...");
    const response = await auth.api.signUpEmail({
      body: {
        name: name,
        email: email,
        password: password,
      },
    });

    console.log("Better-auth response:", response);

    // Update user with profile photo info if uploaded
    if (profilePhoto && response.user) {
      console.log("Updating user with profile photo...");
      await prisma.user.update({
        where: { id: response.user.id },
        data: {
          profilePhoto: profilePhoto,
          profilePhotoId: profilePhotoId,
          role: "SELF",
        },
      });
      console.log("User updated with profile photo");
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        ...response,
        user: {
          ...response.user,
          profilePhoto,
          profilePhotoId,
        },
      },
    });
  } catch (error) {
    console.error("User registration error:", error);

    // Handle better-auth specific errors
    if (error.message?.includes("already exists")) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Failed to register user",
    });
  }
};
