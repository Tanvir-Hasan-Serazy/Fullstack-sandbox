"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/app/services/nationalId.service";
import Image from "next/image";
import { format } from "date-fns";

const page = () => {
  const params = useParams();
  const { id } = params;

  const { data, isLoading, error } = useQuery({
    queryFn: () => getUserById(id),
    queryKey: ["nationalId", id],
    enabled: !!id,
  });

  const user = data?.data;

  if (isLoading) {
    <div>Fetching Details....</div>;
  }
  if (error) {
    <div>Error Fetching Details....</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="w-full flex flex-col items-center gap-4 pb-10">
        <div className="relative h-60 w-full">
          <Image
            alt={user?.name || "User Image"}
            src={user?.imageURL || "/dummy.png"}
            fill
            loading="eager"
            sizes="100"
            className="absoulute rounded-md w-full h-auto"
          />
        </div>
      </div>
      <p className="text-2xl font-semibold text-gray-700"> {user?.name}</p>
      <p className="text-2xl font-semibold text-gray-700 my-4">
        Age: {user?.age}
      </p>
      <p className="text-2xl font-semibold text-gray-700 my-4">
        Address: {user?.address}
      </p>
      <p className="text-2xl font-semibold text-gray-700 my-4">
        Blood Group: {user?.bloodGroup}
      </p>
      <p className="text-2xl font-semibold text-gray-700 my-4">
        Gender : {user?.gender}
      </p>
      <p className="text-2xl font-semibold text-gray-700 my-4">
        Created At :{" "}
        {user?.createdAt
          ? format(new Date(user.createdAt), "Ppp")
          : "No date available"}
      </p>
    </div>
  );
};

export default page;
