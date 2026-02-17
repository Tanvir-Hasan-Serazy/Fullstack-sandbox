import { z } from "zod";

// export const getProductQuerySchema = z.object({
//   category: z.string().optional(),
//   brand: z.string().optional(),
//   minPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
//   maxPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
//   search: z.string().optional(),
//   sort: z
//     .enum(["price_asc", "price_desc", "rating_desc", "createdAt_desc"])
//     .default("createdAt_desc"),
//   page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
//   limit: z
//     .string()
//     .transform(Number)
//     .pipe(z.number().min(1).max(100))
//     .default("20"),
// });

// Query parameters validation
export const getProductQuerySchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),

  minPrice: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => {
      if (!val) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }),

  maxPrice: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => {
      if (!val) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }),

  search: z.string().optional(),

  sort: z
    .enum(["price_asc", "price_desc", "rating_desc", "createdAt_desc"])
    .catch("createdAt_desc"),

  page: z
    .string()
    .optional()
    .transform((val) => {
      const num = Number(val || "1");
      return isNaN(num) ? 1 : Math.max(1, num);
    }),

  limit: z
    .string()
    .optional()
    .transform((val) => {
      const num = Number(val || "20");
      return isNaN(num) ? 20 : Math.min(100, Math.max(1, num));
    }),
});

// Create product validation
export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z
    .string()
    .transform(Number)
    .pipe(z.number().positive("Price must be positive")),
  offer: z.string().transform(Number).pipe(z.number().min(0).optional()),
  rating: z
    .string()
    .transform(Number)
    .pipe(z.number().min(0).max(5).optional()),
  stock: z.string().transform(Number).pipe(z.number().optional()),
  brand: z.string().min(1, "Category is required"),
  category: z.string().min(1, "Category is required"),
});

//Upadte product validation
export const updateProductScheme = createProductSchema.partial();
