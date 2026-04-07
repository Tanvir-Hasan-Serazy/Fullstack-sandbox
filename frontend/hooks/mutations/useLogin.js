"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/app/services/api";

const loginUser = async (formData) => {
  try {
    const response = await api.post("/auth/sign-in/email", {
      email: formData.email,
      password: formData.password,
    });

    const data = response.data;

    // Storing token in localstorage
    if (data?.token) {
      localStorage.setItem("authToken", data?.token);
    }

    return data;
  } catch (error) {
    console.error("Failed to login", error);
    throw new Error(
      error?.response?.data?.message || error.message || "Login failed",
    );
  }
};

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log(data);
      if (data?.user) {
        queryClient.setQueryData(["session"], data?.user);
      }

      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        router.push("/");
      }, 500);
    },

    onError: (error) => {
      const errorMessage = error.message || "Login failed, please try again";
      toast.error(errorMessage);
    },
  });
};
