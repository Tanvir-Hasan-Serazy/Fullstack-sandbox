"use client";
import React from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, getNationalId } from "@/app/services/nationalId.service";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const page = () => {
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { data, isLoading, error } = useQuery({
    queryKey: ["nationalId", sortBy, sortOrder],
    queryFn: () => getNationalId({ sortBy, sortOrder }),
  });

  const mutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["nationalId"] });
    },
  });

  let users = data?.data;

  const handleDelete = (id) => {
    mutation.mutate(id);
  };

  const handleFilterChange = (value) => {
    if (value === "createdAt-asc") {
      setSortBy("createdAt");
      setSortOrder("asc");
    } else if (value === "createdAt-desc") {
      setSortBy("createdAt");
      setSortOrder("desc");
    } else if (value === "age-asc") {
      setSortBy("age");
      setSortOrder("asc");
    } else if (value === "age-desc") {
      setSortBy("age");
      setSortOrder("desc");
    }
  };

  if (isLoading) {
    return <p>Fetching National Id's</p>;
  }

  if (error) {
    return <p>Error fething data... {error}</p>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center max-w-xl">
        <h1 className="text-xl font-semibold">List of National ID:</h1>
        <div>
          <Select
            onValueChange={handleFilterChange}
            defaultValue="createdAt-desc"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="createdAt-asc">
                  Date (Oldest First)
                </SelectItem>
                <SelectItem value="createdAt-desc">
                  Date (Newest First)
                </SelectItem>
                <SelectItem value="age-desc">Age (High to low)</SelectItem>
                <SelectItem value="age-asc">Age (Low to high)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      {users?.map((user) => (
        <div
          className="p-4 m-4 border border-red-400 rounded-md max-w-xl flex justify-between items-center"
          key={user?.id}
        >
          <div className="w-60 flex items-center gap-4">
            <div className="relative h-15 w-12">
              <Image
                alt={user?.name || "User Image"}
                src={user?.imageURL || "/dummy.png"}
                fill
                sizes="100"
                className="absoulute rounded-md w-full h-auto"
              />
            </div>
            <p className="text-xl text-gray-700"> {user?.name}</p>
            <p className="text-xl text-gray-700"> {user?.age}</p>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              className="my-4 cursor-pointer bg-gray-800 px-2 py-1.5 text-white rounded-md "
              href={`/id/${user.id}`}
            >
              Details
            </Link>
            <Link
              className="my-4 cursor-pointer bg-blue-800 px-2 py-1.5 text-white rounded-md "
              href={`/id/${user.id}/edit`}
            >
              Edit
            </Link>
            <Button
              onClick={() => {
                handleDelete(user?.id);
              }}
              className="my-4 cursor-pointer"
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default page;
