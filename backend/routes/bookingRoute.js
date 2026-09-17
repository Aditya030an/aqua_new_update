import express from "express";
import bookingModel from "../models/bookingModels.js";
import authUser from "../middleware/auth.js";
import optionalAuth from "../middleware/optionalAuth.js";
import isAdmin from "../middleware/isAdmin.js";
import {
  createBooking,
  getAllBookings,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();
// Route to create a new booking (guests allowed; logged-in users get linked)
bookingRouter.post("/createBooking", optionalAuth, createBooking);

// Route to get all bookings (admin only)
bookingRouter.get("/getAllBookings" , authUser, isAdmin, getAllBookings);

export default bookingRouter;
