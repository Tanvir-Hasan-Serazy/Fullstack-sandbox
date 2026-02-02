import { Book } from "lucide-react";
import Image from "next/image";

export const BookCard = () => {
  return (
    <div className="max-w-sm p-4 border border-accent rounded-md">
      {/* Image */}
      <div className="relative w-full max-w-44 h-44 mx-auto">
        <Image
          src={`https://placehold.co/250x350`}
          alt="Hotel thumbnail"
          fill
          className="rounded-md object-cover w-full h-full"
        />
        {/* Details */}
      </div>
      <div className="py-4">
        <div className="flex gap-2">
          <Book color="purple" />{" "}
          <p className="font-medium text-gray-700">Book</p>
        </div>

        <p className="text-xl font-semibold text-emerald-500">
          The Arabian Nights
        </p>
        <p className="text-red-600 font-medium">4 Stars</p>
        <p className="text-justify text-gray-900">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Harum quis
          vel quia voluptatem ipsum nobis sequi, in ullam tempore possimus id
          dolores, assumenda, voluptatibus vero sit beatae soluta. Quasi sit
          placeat id?
        </p>
      </div>
    </div>
  );
};
