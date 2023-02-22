const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const answerSchema = new Schema(
  {
    __v: { type: Number, select: false },
    content: { type: String, required: true },
    answerer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      select: true,
    },
    questionId: { type: String, required: true },
    voteCount: { type: Number, required: true, default: 0 },
    liked_by: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      select: true,
    },
    liked_by_new: {
      type: [String],
      select: true,
    }
  },
  { timestamps: true }
);

module.exports = model("Answer", answerSchema);
