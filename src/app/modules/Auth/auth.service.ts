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

export const authServices = {
  userRegistration,
  login,
};
