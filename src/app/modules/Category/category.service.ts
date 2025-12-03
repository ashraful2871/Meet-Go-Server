import { prisma } from "../../shared/prisma";

const createCategory = async (payload: { name: string }) => {
  const category = await prisma.eventCategory.create({
    data: payload,
  });

  return category;
};

const getAllCategories = async () => {
  const categories = await prisma.eventCategory.findMany({
    orderBy: { name: "asc" },
  });

  return categories;
};

export const categoryService = {
  createCategory,
  getAllCategories,
};
