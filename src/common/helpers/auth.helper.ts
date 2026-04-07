import { IRequest } from "@/common/interfaces/request.interface";

export const getCurrentUser = (req: IRequest) => {
  if (!req.user) return "You are not authenticated";

  // The JWT Strategy should attach the decoded user payload here
  const { id } = req.user as { id: string };

  if (!id) return "Invalid token";

  return req.user;
};
