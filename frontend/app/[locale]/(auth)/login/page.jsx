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
import { useLogin } from "@/hooks/mutations/useLogin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import "react-phone-number-input/style.css";
import { z } from "zod";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(6, { message: "Password must be 6 character" }),
});

const Page = () => {
  const login = useLogin();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data) => {
    login.mutate(data);
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
