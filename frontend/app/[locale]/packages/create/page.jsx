"use client";
import { useForm } from "react-hook-form";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { baseURL } from "@/lib/secrets";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters",
  }),
  stars: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      if (typeof val === "number") return val;
      const parsed = Number(val);
      return Number.isNaN(parsed) ? val : parsed;
    },
    z
      .number()
      .min(0, { message: "Rating must be at least 0" })
      .max(5, { message: "Rating must be at most 5" }),
  ),
  image: z.any().optional(),
});

const Page = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      stars: null,
      image: undefined,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("stars", data.stars);

      // Handle image file
      if (data.image && data.image.length > 0) {
        formData.append("coverImage", data.image[0]);
      }

      const res = await axios.post(`${baseURL}/api/books`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Review submitted successfully!");
      form.reset();
      router.push("/packages"); // or wherever you want to redirect
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error?.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto h-full mt-35 border border-gray-300 p-4 rounded-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Star */}
          <FormField
            control={form.control}
            name="stars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Star Rating</FormLabel>
                <FormControl>
                  <Input
                    max="5"
                    min="0"
                    type="number"
                    placeholder="0-5"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image */}
          <FormField
            control={form.control}
            name="image"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Upload Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onChange(e.target.files)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Page;
