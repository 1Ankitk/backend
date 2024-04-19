const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    phoneNumber: {
      type: Number,
      unique: true,
    },
  },
  { timestamps: true }
);

const userSchemaSession = new mongoose.Schema(
  {
    username: { type: String, required: true },
    numberOfTimesLoggedIn: { type: Number },
    activity: { type: String },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const UserSession = mongoose.model("UserSession", userSchemaSession);

module.exports = { User, UserSession };
