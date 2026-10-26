import express from "express";
import cors from "cors";
import compression from "compression";
import 'dotenv/config'
import connectDb from "./config/mongodb.js";
import userRouter from "./routes/userRoute.js";
import bookingRouter from "./routes/bookingRoute.js";
import blogRoutes from "./routes/blogRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";

//App config
const app = express();
const port = process.env.PORT || 4000;

//middlewares
app.use(compression()); // gzip JSON responses (product/blog lists are large)
app.use(express.json());
app.use(cors());

//api end points
app.use("/api/user" , userRouter);
app.use("/api/booking" , bookingRouter);
app.use("/api/blogs", blogRoutes);
app.use("/api/product" , productRoutes);
app.use("/api/payment" , orderRouter);
app.use("/api/news" , newsRoutes);

app.get("/" ,(req , res)=>{
    res.send("API working")
})

// Error handler: return the real reason as JSON (upload/Cloudinary/multer errors included)
app.use((err, req, res, next) => {
    console.error("ERROR:", req.method, req.originalUrl, err);
    res.status(err.status || err.statusCode || 500).json({
        success: false,
        message: err.message || "Server error",
        error: err.message || "Server error",
    });
});

const startServer = async () => {
    try {
        await connectDb();
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.warn("MongoDB connection failed. Starting server without database connection.");
    }

    app.listen(port , ()=>{
        console.log("server started on PORT:" + port)
    })
};

startServer();