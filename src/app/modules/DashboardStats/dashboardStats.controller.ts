import { StatusCodes } from "http-status-codes";
import { prisma } from "../../shared/prisma";
import sendResponse from "../../shared/sendResponse";
import { dashboardService } from "./dashboardStats.service";
import { UserRole } from "@prisma/client";
import catchAsync from "../../shared/catchAsync";
import { Request, Response } from "express";

const getDashboardStatsSingle = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { email, role } = req.user;

    // Get user id (needed for HOST & USER dashboards)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return sendResponse(res, {
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "User not found",
        data: null,
      });
    }

    let result;

    // AUTO ROLE CONDITIONS
    if (role === UserRole.ADMIN) {
      result = await dashboardService.getAdminDashboardStats();
    } else if (role === UserRole.HOST) {
      result = await dashboardService.getHostDashboardStats(user.id);
    } else if (role === UserRole.USER) {
      result = await dashboardService.getUserDashboardStats(user.id);
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Dashboard statistics fetched successfully",
      role,
      data: result,
    });
  }
);

export const dashboardController = {
  getDashboardStatsSingle,
};
