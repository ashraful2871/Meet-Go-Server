import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { categoryService } from "./category.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.createCategory(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.getAllCategories();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Categories fetched successfully",
    data: result,
  });
});

export const categoryController = {
  createCategory,
  getAllCategories,
};
