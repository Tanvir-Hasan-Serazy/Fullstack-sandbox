import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useSession = () => {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await api.get("/user/me");
      console.log(res)?.data?.user;
      return res?.data?.user;
    },
    staleTime: 5 * 60 * 60,
    retry: false,
    throwOnError: true,
  });
};
