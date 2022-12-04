const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    __v: { type: Number, select: false },
    name: { type: String, required: true },
    age: { type: Number, required: false, default: 0 },
    password: { type: String, required: true, select: false },
    avatar_url: { type: String },
    gender: {
      type: String,
      enum: ["male", "female", "unknow"],
      default: "unknow",
      required: true,
    },
    headline: { type: String },
    locations: {
      type: [{ type: Schema.Types.ObjectId, ref: "Topics" }],
      select: false,
    },
    business: { type: Schema.Types.ObjectId, ref: "Topics", select: false },
    employments: {
      type: [
        {
          company: { type: Schema.Types.ObjectId, ref: "Topics" },
          job: { type: Schema.Types.ObjectId, ref: "Topics" },
        },
      ],
      select: false,
    },
    educations: {
      type: [
        {
          school: { type: Schema.Types.ObjectId, ref: "Topics" },
          major: { type: Schema.Types.ObjectId, ref: "Topics" },
          diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
          entrance_year: { type: Number },
          graduation_year: { type: Number },
        },
      ],
      select: false,
    },
    introduction: { type: String },
    following: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      select: false,
    },
    followingTopics: {
      type: [{ type: Schema.Types.ObjectId, ref: "Topics" }],
      select: false,
    },
    likingAnswers: {
      type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
      select: false,
    },
    disLikingAnswers: {
      type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
      select: false,
    },
    collectingAnswers: {
      type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
