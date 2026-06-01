import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: String,

    subject: String,

    subjectKey: {
      type: String,
      required: true,
      index: true,
    },

    description: String,

    faculty: String,

    semester: String,

    branch: String,

    pdfUrl: String,

    fileId: {
      type: String,
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    views: {
      type: Number,
      default: 0,
    },

    votes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Resource =
  mongoose.models.Resource ||
  mongoose.model(
    "Resource",
    resourceSchema
  );