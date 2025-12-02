import { NextFunction, Request, Response } from "express";
import ApiError from "../Error/error";
import { StatusCodes } from "http-status-codes";
import { jwtHelper } from "../helper/jwtHelper";

const auth = (...authRoles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        throw new ApiError("You are not logged in", StatusCodes.UNAUTHORIZED);
      }

      const verifyUser = jwtHelper.verifyToken(
        token,
        process.env.JWT_SECRET as string
      );
      req.user = verifyUser;
      if (authRoles.length && !authRoles.includes(verifyUser.role)) {
        throw new ApiError(
          "You are not authorized to access this route",
          StatusCodes.UNAUTHORIZED
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
