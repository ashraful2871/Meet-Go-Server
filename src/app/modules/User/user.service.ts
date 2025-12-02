import { UserRole, UserStatus, VerificationStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import ApiError from "../../Error/error";
import { StatusCodes } from "http-status-codes";

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

const updateHostVerificationStatus = async (
  id: string,
  status: VerificationStatus,
  rejectionReason?: string
) => {
  const isExistUser = await prisma.host.findFirstOrThrow({
    where: {
      id,
    },
  });

  if (!isExistUser) {
    throw new ApiError("Requested Host not found", StatusCodes.NOT_FOUND);
  }

  if (status === VerificationStatus.REJECTED && !rejectionReason) {
    throw new ApiError(
      "Rejection reason is required when status is REJECTED",
      StatusCodes.BAD_REQUEST
    );
  } else if (status === VerificationStatus.REJECTED && rejectionReason) {
    const updatedHostStatus = await prisma.host.update({
      where: {
        id,
      },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
        rejectionReason: rejectionReason,
      },
    });
    return updatedHostStatus;
  } else if (status === VerificationStatus.APPROVED) {
    const updatedHostStatus = await prisma.host.update({
      where: {
        id,
      },
      data: {
        verificationStatus: VerificationStatus.APPROVED,
        user: {
          update: {
            role: UserRole.HOST,
          },
        },
      },
    });

    return updatedHostStatus;
  }
};
export const userService = {
  requestHost,
  updateHostVerificationStatus,
};
