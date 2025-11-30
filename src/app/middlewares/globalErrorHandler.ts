import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../generated/prisma/client";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  // ✅ Handle Prisma Known Request Errors (code-based)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2000") {
      message = "Value too long for a field.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2001") {
      message = "Record not found.";
      error = err.meta;
      statusCode = StatusCodes.NOT_FOUND;
    } else if (err.code === "P2002") {
      message = "Duplicate key error (unique constraint failed).";
      error = err.meta;
      statusCode = StatusCodes.CONFLICT;
    } else if (err.code === "P2003") {
      message = "Foreign key constraint failed.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2004") {
      message = "Constraint failed on the database.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2005") {
      message = "Invalid value stored in the database.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2006") {
      message = "Invalid data type for the field.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2007") {
      message = "Data validation error.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2008") {
      message = "Query parsing error.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2009") {
      message = "Query validation error.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2010") {
      message = "Raw query failed.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2011") {
      message = "Null constraint violation.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2012") {
      message = "Missing required field.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2013") {
      message = "Missing required argument in query.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2014") {
      message = "Invalid relation between records.";
      error = err.meta;
      statusCode = StatusCodes.CONFLICT;
    } else if (err.code === "P2015") {
      message = "Related record not found.";
      error = err.meta;
      statusCode = StatusCodes.NOT_FOUND;
    } else if (err.code === "P2016") {
      message = "Query interpretation error.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2017") {
      message = "Records in relation are not connected.";
      error = err.meta;
      statusCode = StatusCodes.CONFLICT;
    } else if (err.code === "P2018") {
      message = "Required connected records not found.";
      error = err.meta;
      statusCode = StatusCodes.NOT_FOUND;
    } else if (err.code === "P2019") {
      message = "Input value too large.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2020") {
      message = "Value out of range for the field.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2021") {
      message = "Table does not exist in the database.";
      error = err.meta;
      statusCode = StatusCodes.NOT_FOUND;
    } else if (err.code === "P2022") {
      message = "Column does not exist in the database.";
      error = err.meta;
      statusCode = StatusCodes.NOT_FOUND;
    } else if (err.code === "P2023") {
      message = "Inconsistent column data.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2024") {
      message = "Database timeout error.";
      error = err.meta;
      statusCode = StatusCodes.GATEWAY_TIMEOUT;
    } else if (err.code === "P2025") {
      message = "Record not found or already deleted.";
      error = err.meta;
      statusCode = StatusCodes.NOT_FOUND;
    } else if (err.code === "P2026") {
      message = "Operation not supported by the database.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2027") {
      message = "Multiple errors occurred on database operation.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2028") {
      message = "Transaction API error.";
      error = err.meta;
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    } else if (err.code === "P2029") {
      message = "Query validation failed.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2030") {
      message = "Database reached its limit.";
      error = err.meta;
      statusCode = StatusCodes.INSUFFICIENT_STORAGE;
    } else if (err.code === "P2031") {
      message = "Invalid database credentials.";
      error = err.meta;
      statusCode = StatusCodes.UNAUTHORIZED;
    } else if (err.code === "P2033") {
      message = "Number out of range for field type.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2034") {
      message = "Transaction failed due to conflict.";
      error = err.meta;
      statusCode = StatusCodes.CONFLICT;
    } else if (err.code === "P2035") {
      message = "Unsupported feature for the database version.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else if (err.code === "P2036") {
      message = "Database connection was closed unexpectedly.";
      error = err.meta;
      statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    } else if (err.code === "P2037") {
      message = "Too many connections to the database.";
      error = err.meta;
      statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    } else if (err.code === "P2038") {
      message = "Database I/O error.";
      error = err.meta;
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    } else if (err.code === "P2039") {
      message = "Transaction isolation level not supported.";
      error = err.meta;
      statusCode = StatusCodes.BAD_REQUEST;
    } else {
      message = "An unknown Prisma error occurred.";
      error = err.meta;
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    }
  }

  // ✅ Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    message = "Invalid Prisma query input. Please check your data.";
    error = err.message;
    statusCode = StatusCodes.BAD_REQUEST;
  }

  // ✅ Prisma Initialization Error
  if (err instanceof Prisma.PrismaClientInitializationError) {
    message =
      "Failed to initialize Prisma Client. Database may be unreachable.";
    error = err.message;
    statusCode = StatusCodes.SERVICE_UNAVAILABLE;
  }

  // ✅ Prisma Rust Panic Error
  if (err instanceof Prisma.PrismaClientRustPanicError) {
    message =
      "Prisma Client encountered a critical internal error (Rust panic).";
    error = err.message;
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }

  // ✅ Prisma Unknown Request Error
  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "An unknown Prisma request error occurred.";
    error = err.message;
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }

  res.status(statusCode).json({
    success,
    message,
    error,
  });
};
export default globalErrorHandler;
