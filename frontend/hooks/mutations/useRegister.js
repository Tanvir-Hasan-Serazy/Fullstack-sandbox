"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { toast } from "sonner";

const registerUser = async ({ formData }) => {
  const { data } = await api.post("/auth/register", formData);
  return data.data;
};

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      // Uploading Toast
      if (formData.get("profilePhoto")) {
        toast.loading("Uploading profile photo...", { id: "upload" });
      }
      return await registerUser({ formData });
    },

    onSuccess: (data) => {
      const { user, token } = data;
      toast.dismiss("upload");
      localStorage.setItem("authToken", token);
      queryClient.setQueryData(["session"], user);
      toast.success("Registration successful! Redirecting to login page...'");
      router.push("/login");
    },

    onError: (error) => {
      error?.response?.data?.error ||
        error.message ||
        "Registration fialed. Please try again.";
    },
  });
};
