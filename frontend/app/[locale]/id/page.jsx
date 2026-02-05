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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { baseURL } from "@/lib/secrets";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters",
  }),
  age: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      if (typeof val === "number") return val;
      const parsed = Number(val);
      return Number.isNaN(parsed) ? val : parsed;
    },
    z.number().min(18, { message: "Age must be at least 18" }),
  ),
  address: z.string().min(1, { message: "Address is required" }),
  gender: z.enum(["male", "female"], {
    messageq: "Gender is required",
  }),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    messageq: "Blood Group is required",
  }),
  height: z.preprocess((val) => {
    if (val === "" || val === undefined || val === null) {
      return undefined;
    }
    if (typeof val === "number") {
      return val;
    }
    const parsed = Number(val);
    return Number.isNaN(parsed) ? val : parsed;
  }, z.number()),
  image: z.any(0, { message: "Image is required" }),
});

const page = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: null,
      address: "",
      gender: "",
      bloodGroup: "",
      height: "",
      image: undefined,
    },
  });

  const onSubmit = async (data) => {
    const { name, age, address, gender, bloodGroup, height, image } = data;
    try {
      setLoading(true);
      const res = await axios.post(
        `${baseURL}/api/id`,
        {
          name: name,
          age: age,
          address: address,
          gender: gender,
          bloodGroup: bloodGroup,
          height: height,
          image: image[0],
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (res?.status === 201) {
        toast.success("User Created");
        router.push("/");
        form.reset();
      }
    } catch (error) {
      if (error) {
        toast.error("User already exist");
      }
    }
  };

  const onError = (errors) => {
    console.log("VALIDATION ERRORS", errors);
  };

  return (
    <div className="max-w-lg px-4 mx-auto  py-10 lg:py-20 w-full">
      <h2 className="py-4 text-center font-semibold text-3xl">Register Here</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-4"
        >
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Blood Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age */}
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Age"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Blood Group */}

          <FormField
            control={form.control}
            name="bloodGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Group</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Blood Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Height */}
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="height"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
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
          <Button type="submit" className="w-full" disabled={loading}>
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default page;
