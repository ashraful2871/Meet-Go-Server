import { UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import ApiError from "../../Error/error";
import { StatusCodes } from "http-status-codes";
import { email } from "zod";

const requestHost = async (payload: any, user: any) => {
  const isExistUser = await prisma.user.findFirstOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!isExistUser) {
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);
  }

  const hostRequest = await prisma.host.create({
    data: {
      userId: isExistUser.id,
      email: isExistUser.email,
      ...payload,
    },
  });
  return hostRequest;
};
export const userService = {
  requestHost,
};
