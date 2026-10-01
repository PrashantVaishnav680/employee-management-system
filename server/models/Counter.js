import mongoose from "mongoose";

// Generic atomic counter document — used for race-condition-free sequential ID generation.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model("Counter", counterSchema);
