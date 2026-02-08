"use client";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, getNationalId } from "@/app/services/nationalId.service";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const page = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["nationalId"],
    queryFn: getNationalId,
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

  if (isLoading) {
    return <p>Fetching National Id's</p>;
  }

  if (error) {
    return <p>Error fething data... {error}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">List of National ID:</h1>
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
