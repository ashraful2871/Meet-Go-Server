import multer from "multer";

import { v2 as cloudinary } from "cloudinary";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

const uploadToCloudinary = async (file: Express.Multer.File) => {
  cloudinary.config({
    cloud_name: "dohpypgmy",
    api_key: "158316413285745",
    api_secret: "fHH2v220NNMSBwzy_NYX-76bODE",
  });

  const uploadResult = await cloudinary.uploader
    .upload(file.path, {
      public_id: file.filename,
    })
    .catch((error) => {
      console.log(error);
      throw new Error("Cloudinary Upload Failed");
    });

  return uploadResult;
};

export const fileUploader = { upload, uploadToCloudinary };
