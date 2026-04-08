"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/mutations/useRegister";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import "react-phone-number-input/style.css";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z
  .object({
    image: z.any().optional(),
    name: z.string().min(3, {
      message: "Name must be at least 3 characters",
    }),
    email: z.email(),
    password: z.string().min(6, { message: "Password must be 6 character" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm Password should match the password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Page = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const register = useRegister();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.length > 0) {
        const file = acceptedFiles[0];

        //Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File too large");
        }

        // Set image and preview
        setImageFile(file);
        form.setValue("image", file);

        // Preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue("profilePhoto", undefined);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);

    if (imageFile) {
      formData.append("profilePhoto", imageFile);
    }

    register.mutate(formData, {
      onSuccess: () => {
        form.reset();
        setImageFile(null);
        setImagePreview(null);
      },
    });
  };

  const onError = (errors) => {
    console.log("VALIDATION ERRORS", errors);
  };

  return (
    <div className="max-w-lg px-4 mx-auto  py-10 lg:py-20 w-full">
      <h2 className="py-4 text-center font-bold text-3xl">Register Here</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-4"
        >
          {/* Image */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Photo</FormLabel>
                <FormControl>
                  {!imagePreview ? (
                    <div
                      {...getRootProps()}
                      className={cn(
                        "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors",
                        isDragActive
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50",
                      )}
                    >
                      <input {...getInputProps()} />
                      <Camera className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600 font-medium">
                        {isDragActive
                          ? "Drop image here"
                          : "Click or drag to upload"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        JPG, PNG, WEBP (max 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-md overflow-hidden border-2 border-slate-200">
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        width={400}
                        height={400}
                        className="w-full object-contain h-56"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input name="email" {...field} placeholder="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input name="password" {...field} placeholder="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    name="confirmPassword"
                    {...field}
                    placeholder="confirmPassword"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default Page;
