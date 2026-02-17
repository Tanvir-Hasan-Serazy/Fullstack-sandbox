import express from "express";
import { prisma } from "../prisma/client.js";
import {
  getProductQuerySchema,
  createProductSchema,
  updateProductScheme,
} from "../schemas/product.schema.js";
import { validate } from "../middleware/validateMiddlware.js";
import { upload } from "../middleware/upload.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

const productRouter = express.Router();

productRouter.get(
  "/products",
  validate(getProductQuerySchema, "query"),
  async (req, res) => {
    try {
      // Using req.validatedQuery instead of req.query
      const { category, minPrice, maxPrice, brand, search, sort, page, limit } =
        req.validatedQuery;

      const where = {};

      if (category) {
        where.category = category;
      }

      if (brand) {
        where.brand = brand;
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) {
          where.price.gte = minPrice;
        }
        if (maxPrice) {
          where.price.lte = maxPrice;
        }
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      // Pagination
      const skip = (page - 1) * limit;

      // Sorting
      const [sortField, sortOrder] = sort.split("_");

      // Query
      const [products, total] = await Promise.all([
        prisma.products.findMany({
          where,
          orderBy: { [sortField]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.products.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: products,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Route handler error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
);

productRouter.post(
  "/products",
  upload.single("image"),
  validate(createProductSchema, "body"),
  async (req, res) => {
    console.log(req.file);
    console.log(req.body);

    const cloudinaryReults = await uploadToCloudinary(req.file.buffer);
    console.log(cloudinaryReults);

    try {
      const product = await prisma.products.create({
        data: {
          ...req.body,
          imageURL: cloudinaryReults.secure_url,
          cloudinaryPublicId: cloudinaryReults.public_id,
        },
      });
      res.status(200).json({ success: true, product });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

export default productRouter;
