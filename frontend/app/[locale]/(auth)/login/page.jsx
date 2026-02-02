"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import "react-phone-number-input/style.css";
import { Button } from "@/components/ui/button";
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

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(6, { message: "Password must be 6 character" }),
});

const Page = () => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    const { email, password } = data;
    try {
      const res = await axios.post(`${baseURL}/api/auth/login`, {
        email: email,
        password: password,
      });
      const accessToken = res.data.accessToken;
      if (!accessToken) {
        toast.error("No Token recieved");
        throw new Error("No token received");
      }
      localStorage.setItem("token", accessToken);
      router.push("/");
      form.reset();
      toast.success("Successfully Logged In");
    } catch (error) {
      toast.error("Invalid Email or password");
    }
  };

  const onError = (errors) => {
    console.log("VALIDATION ERRORS", errors);
  };

  return (
    <div className="max-w-lg px-4 mx-auto  py-10 lg:py-20 w-full">
      <h2 className="py-4 text-center font-bold text-3xl">Login Here</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-4"
        >
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
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default Page;
