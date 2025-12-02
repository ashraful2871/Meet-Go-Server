import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { UserStatus } from "@prisma/client";
import ApiError from "../../Error/error";
import { StatusCodes } from "http-status-codes";
import { jwtHelper } from "../../helper/jwtHelper";
import config from "../../../config";
import { Secret } from "jsonwebtoken";

//user registration service
const userRegistration = async (payload: any) => {
  if (!payload) {
    throw new Error("Payload is required");
  }
  const { password } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  payload.password = hashedPassword;

  const result = await prisma.user.create({
    data: payload,
  });

  return result;
};

//login service
const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!isCorrectPassword) {
    throw new ApiError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  const accessToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

//change password service

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userData) {
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);
  }

  const isCorrectPassword = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );
  if (!isCorrectPassword) {
    throw new ApiError("Old password is incorrect", StatusCodes.UNAUTHORIZED);
  }

  const hashedNewPassword = await bcrypt.hash(payload.newPassword, 10);

  await prisma.user.update({
    where: {
      email: user.email,
    },
    data: {
      password: hashedNewPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully",
  };
};

const getMe = async (session: any) => {
  const accessToken = session.accessToken;

  const decodedToken = jwtHelper.verifyToken(
    accessToken,
    config.jwt.jwt_secret as Secret
  );

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedToken.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      status: true,
      needPasswordChange: true,
      phoneNumber: true,
      address: true,
      profilePicture: true,
      bio: true,
      dateOfBirth: true,
      gender: true,
      hobbies: true,
      interests: true,
      IsVerified: true,
      createdAt: true,
      updatedAt: true,

      // Admin Profile (if exists)
      admin: {
        select: {
          id: true,
          email: true,
          name: true,
          profilePhoto: true,
          phoneNumber: true,
          address: true,
          city: true,
          country: true,
          canManageUsers: true,
          canManageHosts: true,
          canManageEvents: true,
          canManagePayments: true,
          canVerifyHosts: true,
          canSuspendAccounts: true,
          lastLoginAt: true,
          lastActiveAt: true,
          loginCount: true,
          adminNotes: true,
          status: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        },
      },

      // Host Profile (if exists)
      host: {
        select: {
          id: true,
          email: true,
          name: true,
          profilePhoto: true,
          contactNumber: true,
          bio: true,
          experience: true,
          specialties: true,
          rating: true,
          reviewCount: true,
          websiteUrl: true,
          facebookUrl: true,
          instagramUrl: true,
          linkedinUrl: true,
          city: true,
          country: true,
          address: true,
          isVerified: true,
          identityDocument: true,
          verificationStatus: true,
          preferredCommunication: true,
          payoutMethod: true,
          payoutAccount: true,
          maxEventLimit: true,
          totalEventsHosted: true,
          totalParticipants: true,
          totalEarnings: true,
          lastActiveAt: true,
          isDeleted: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
  return userData;
};

export const authServices = {
  userRegistration,
  login,
  changePassword,
  getMe,
};
