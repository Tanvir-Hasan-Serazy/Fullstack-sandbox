# Agent Guide for Full-Stack Sandbox

This document provides coding agents with essential information about this Next.js/Express full-stack application.

## Project Structure

```
full-stack-sandbox/
├── frontend/          # Next.js 16 App Router with React 19
│   ├── app/          # App Router (routes organized by [locale])
│   ├── components/   # Reusable UI components (shadcn/ui)
│   └── lib/          # Utilities and shared code
└── backend/          # Express API with Prisma ORM
    ├── src/
    │   ├── routes/       # API route definitions
    │   ├── controller/   # Business logic
    │   ├── middleware/   # Express middleware
    │   ├── schemas/      # Zod validation schemas
    │   └── utils/        # Helper functions
    └── prisma/           # Database schema and migrations
```

## Build, Lint, and Test Commands

### Frontend (from `/frontend` directory)
```bash
# Development
npm run dev                    # Start Next.js dev server (port 3000)

# Build and production
npm run build                  # Build for production
npm run start                  # Start production server

# Linting
npm run lint                   # Run ESLint
npm run lint -- --fix          # Auto-fix ESLint issues

# Testing
# ⚠️ No tests configured yet
```

### Backend (from `/backend` directory)
```bash
# Development
npm run dev                    # Start with nodemon (hot reload)

# Database (Prisma)
npx prisma migrate dev         # Run migrations in development
npx prisma migrate deploy      # Run migrations in production
npx prisma generate            # Generate Prisma client
npx prisma studio              # Open Prisma Studio GUI

# Testing
# ⚠️ No tests configured yet
```

### Running a Single Test
**Not applicable** - no test framework is currently configured. If tests are added in the future, use:
- Jest: `npx jest path/to/test.test.js`
- Vitest: `npx vitest run path/to/test.spec.js`

## Code Style Guidelines

### Import Ordering

**Frontend:**
```javascript
// 1. React/Next.js core
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

// 3. UI components (use @/ alias)
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";

// 4. Services/utilities
import { getNationalId } from "@/app/services/nationalId.service";
import { baseURL } from "@/lib/secrets";

// 5. Styles
import "react-phone-number-input/style.css";
```

**Backend:**
```javascript
// 1. Node.js built-ins
import { Readable } from "stream";

// 2. Third-party libraries
import express from "express";
import { z } from "zod";

// 3. Local utilities/Prisma
import { prisma } from "../prisma/client.js";
import { upload } from "../middleware/upload.js";

// 4. Schemas/validators
import { getProductQuerySchema } from "../schemas/product.schema.js";
```

### Formatting

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Double quotes for strings
- **Semicolons**: Not required but accepted (project uses both)
- **Line length**: No strict limit, but keep readable
- **Trailing commas**: Not enforced

### TypeScript/Types

- **Frontend**: Uses JSDoc comments where needed (no TypeScript)
- **Backend**: Uses JSDoc with Prisma-generated types
- **Runtime validation**: Use Zod for all input validation
- **Path aliases**: Use `@/` prefix for absolute imports in frontend

### Naming Conventions

**Files:**
- Routes/pages: `page.jsx` (lowercase)
- Components: `BookCard.jsx` (PascalCase) or `button.jsx` (lowercase for shadcn/ui)
- Services: `nationalId.service.js` (camelCase + `.service.js`)
- Middleware: `validateMiddleware.js` (camelCase + `Middleware.js`)
- Schemas: `product.schema.js` (lowercase + `.schema.js`)
- Backend routes: `books.js` (lowercase, plural)

**Code:**
- Components: `PascalCase` (e.g., `BookCard`, `TansStackProvider`)
- Functions: `camelCase` (e.g., `getNationalId`, `handleDelete`, `onSubmit`)
- Variables: `camelCase` (e.g., `isLoading`, `sortBy`, `baseURL`)
- Constants: `camelCase` or `UPPER_SNAKE_CASE` (in .env files)
- API routes: `/api/resource` (lowercase, plural for collections)
- Database models: `PascalCase` singular (e.g., `Books`, `NationalID`, `Products`)

### Error Handling

**Backend - Consistent response format:**
```javascript
// Success
res.status(200).json({
  success: true,
  data: results,
  pagination: { page, limit, total, totalPages } // if paginated
});

// Error
res.status(400).json({
  success: false,
  error: "Error message"
});
```

**Backend - Common patterns:**
```javascript
try {
  // Validation
  if (!someCondition) {
    return res.status(400).json({ error: "Validation failed" });
  }
  
  // Not found
  const item = await prisma.model.findUnique({ where: { id } });
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  
  // Conflict
  if (duplicate) {
    return res.status(409).json({ error: "Already exists" });
  }
  
  // Unauthorized
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  // Success
  res.status(201).json({ success: true, data: result });
  
} catch (error) {
  console.error("Error description:", error);
  res.status(500).json({ error: "Failed to perform operation" });
}
```

**Frontend - React Query:**
```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ["resource", param],
  queryFn: () => getResource({ param }),
});

if (isLoading) return <p>Loading...</p>;
if (error) return <p>Error: {error.message}</p>;
```

**Frontend - Toast notifications (Sonner):**
```javascript
import { toast } from "sonner";

toast.success("Operation successful");
toast.error(error?.response?.data?.message || "Operation failed");
```

### Validation with Zod

**Backend - Query parameters (with transformations):**
```javascript
export const getQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.string().optional().or(z.literal("")).transform((val) => {
    if (!val) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  sort: z.enum(["price_asc", "createdAt_desc"]).catch("createdAt_desc"),
  page: z.string().optional().transform((val) => {
    const num = Number(val || "1");
    return isNaN(num) ? 1 : Math.max(1, num);
  }),
});
```

**Backend - Body validation:**
```javascript
export const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string().transform(Number).pipe(z.number().positive()),
});

export const updateSchema = createSchema.partial();
```

**Validation middleware usage:**
```javascript
import { validate } from "../middleware/validateMiddleware.js";

router.get("/items", validate(querySchema, "query"), async (req, res) => {
  const { category, minPrice } = req.validatedQuery;
  // Use validated data
});

router.post("/items", validate(createSchema), async (req, res) => {
  const data = req.body; // Already validated and transformed
  // Use validated data
});
```

**Frontend - Form validation:**
```javascript
const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  age: z.preprocess(
    (val) => {
      if (val === "" || val === undefined) return undefined;
      return typeof val === "number" ? val : Number(val);
    },
    z.number().min(18, { message: "Age must be at least 18" })
  ),
  gender: z.enum(["male", "female"], { message: "Gender is required" }),
});

const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: { name: "", age: null, gender: "" },
});
```

## Key Technologies and Patterns

### Frontend Stack
- **Framework**: Next.js 16 with App Router
- **React**: Version 19 with React Compiler enabled
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form + Zod
- **i18n**: next-intl (routes are `[locale]/path`)
- **Notifications**: Sonner (toast)
- **HTTP Client**: Axios

### Backend Stack
- **Framework**: Express 5
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schemas
- **File Upload**: Multer (memory storage)
- **File Storage**: Cloudinary
- **Auth**: better-auth (configured but not fully integrated)
- **Module System**: ES Modules (`"type": "module"`)

### Database (Prisma)
- **Models**: Books, NationalID, Products
- **Custom output**: Client generated in `src/generated/prisma/`
- **Naming**: Use `@@map()` to map model names to snake_case table names

### API Patterns
- **Base URL**: `/api/resource`
- **Service layer**: Centralized API calls in `app/services/*.service.js`
- **Middleware**: Validation, file upload, CORS enabled globally
- **File upload**: 10MB limit, images only, stored in Cloudinary
- **Pagination**: Supported on products endpoint with `page`, `limit` query params

## Important Notes for Agents

1. **Path aliases**: Always use `@/` for imports in frontend (e.g., `@/components/ui/button`)
2. **Internationalization**: All frontend routes are wrapped in `[locale]` (e.g., `/en/login`, `/es/login`)
3. **Route groups**: Auth routes use `(auth)` group - doesn't appear in URL
4. **Validation**: Always validate user input with Zod schemas on both frontend and backend
5. **Error responses**: Use consistent `{ success, error/data }` format in backend
6. **File cleanup**: When updating images, delete old Cloudinary images using public_id
7. **Prisma client**: Import from `../prisma/client.js`, not `@prisma/client`
8. **Environment variables**: Access via `process.env.VAR_NAME` (no dotenv in frontend)
9. **Known typo**: `validateMiddlware.js` is missing an 'e' (exists in codebase)
10. **No tests**: Testing infrastructure not yet implemented

## Common Tasks

**Add a new API endpoint:**
1. Create Zod schema in `backend/src/schemas/`
2. Define route in `backend/src/routes/`
3. Use `validate()` middleware for input validation
4. Access validated data via `req.validatedQuery` or `req.body`
5. Return consistent JSON response format

**Add a new page:**
1. Create `app/[locale]/your-route/page.jsx`
2. Export default function (can be named `page` or `Page`)
3. Use server components by default, add `"use client"` only when needed
4. Fetch data using React Query in client components or direct fetch in server components

**Add a new component:**
1. Create in `components/` (or `components/ui/` for reusable UI)
2. Use PascalCase for component name
3. Accept props with destructuring
4. Use Radix UI primitives for accessible components
5. Style with Tailwind classes using `cn()` utility for conditional classes
