import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import adminRoutes from "./routes/adminRoute.js";
import staffRoutes from "./routes/staffRoute.js"; // Fixed import name
import Admin from "./models/adminModel.js";
import assignProject from "./routes/assignProjectRoute.js"
import project from "./routes/projectRoute.js"
import bcrypt from "bcrypt";
import attendance from "./routes/attendanceRoutes.js";


dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: { origin: "*" }
});
app.set("io", io);

app.use(cors());
app.use(express.json());

// -----------------------
// MongoDB connection
// -----------------------
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // ✅ Create default admin if none exists
    const existingAdmin = await Admin.findOne({ email: "info@pixelmindsolutions.com" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Pixelmind@25", 10);
      const defaultAdmin = new Admin({
        adminName: "PMS",
        email: "info@pixelmindsolutions.com",
        password: hashedPassword
      });
      await defaultAdmin.save();
      console.log("✅ Default admin created: info@pixelmindsolutions.com / Pixelmind@25");
    }
  })
  .catch(err => console.error("Mongo Error:", err));

// -----------------------
// Routes
// -----------------------
app.use("/api", adminRoutes);
app.use("/api", staffRoutes); // Fixed variable name
app.use("/api", assignProject);
app.use("/api",project);
app.use("/api",attendance)

// -----------------------
// Socket.IO real-time events
// -----------------------
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// -----------------------
// Start server
// -----------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});