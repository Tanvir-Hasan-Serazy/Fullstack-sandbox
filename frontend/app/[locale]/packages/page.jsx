import { BookCard } from "@/components/ui/packages/BookCard";
import React from "react";

const page = () => {
  return (
    <>
      <p className="py-4 text-2xl font-semibold px-1">
        The List of books are below :
      </p>
      <BookCard />
    </>
  );
};

export default page;
