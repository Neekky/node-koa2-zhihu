const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, require: true },
  age: { type: Number, require: false, default: 0 },
});

module.exports = model("User", userSchema);
