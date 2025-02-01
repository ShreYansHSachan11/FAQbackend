import express from "express";
// import faqRoutes from "./routes/faqRoutes.js";
// import adminRouter from "./admin/adminPanel.js";

const app = express();

app.use(express.json());

// API Routes
// app.use("/api", faqRoutes);

// Admin Panel
// app.use("/admin", adminRouter);


export { app };
