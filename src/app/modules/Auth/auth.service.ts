import { Request } from "express";
import { fileUploader } from "../../helper/fileUploader";
import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { User } from "@prisma/client";
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

export const authServices = {
  userRegistration,
};
