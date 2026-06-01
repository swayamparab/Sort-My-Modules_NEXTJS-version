import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
    },
  },
  { timestamps: true }
);

/* PREVENT DUPLICATE VOTES */

voteSchema.index(
  { user: 1, resource: 1 },
  { unique: true }
);

export const Vote =
  mongoose.models.Vote ||
  mongoose.model(
    "Vote",
    voteSchema
  );