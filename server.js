require("dotenv").config();
const cors = require("cors");
const connectDB = require("./db/connectDB");
const express = require("express");
const cloudinary = require("cloudinary").v2;
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
connectDB();
const app = express();
app.use(cors());
const port = process.env.PORT || 5000;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json({ limit: "50mb" })); // for json
app.use(express.urlencoded({ extended: true })); // for
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
