import express from 'express';
import bookingModel from '../models/bookingModels.js';
import validator from 'validator';
import { sendAdminNotification } from '../utils/sendEmail.js';

// Guest input goes into the admin email as HTML, so escape it.
const esc = (v) => validator.escape(String(v ?? ''));

const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id; // set by optionalAuth when logged in; undefined for guests
    const {
      plan,
      dateTime,
      city,
      location,
      bookingType,
      name,
      phone,
      email,
      message,
    } = req.body || {};

    // No login required, so name + phone are what let us contact the customer
    if (!name?.trim() || !phone?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name and phone are required" });
    }

    if (!bookingType) {
      return res
        .status(400)
        .json({ success: false, message: "bookingType is required" });
    }

    const newBooking = new bookingModel({
      userId: userId || undefined,
      bookingType,
      plan,
      dateTime: dateTime || undefined,
      city,
      location,
      name,
      phone,
      email,
      message,
    });

    await newBooking.save();

    // 📧 Notify admin about the new booking / enquiry (non-blocking)
    try {
      const label = bookingType === "contact" ? "Enquiry" : "Consultation Booking";
      await sendAdminNotification(
        `📅 New ${label} — ${name || "Customer"}`,
        `<h2>New ${label}</h2>
         <p><strong>Type:</strong> ${esc(bookingType)}</p>
         <p><strong>Customer:</strong> ${userId ? "Logged-in user" : "Guest"}</p>
         <p><strong>Name:</strong> ${esc(name) || "-"}</p>
         <p><strong>Phone:</strong> ${esc(phone) || "-"}</p>
         <p><strong>Email:</strong> ${esc(email) || "-"}</p>
         ${plan ? `<p><strong>Plan:</strong> ${esc(plan.title || JSON.stringify(plan))}</p>` : ""}
         ${dateTime ? `<p><strong>Preferred:</strong> ${esc(new Date(dateTime).toLocaleString())}</p>` : ""}
         ${city ? `<p><strong>City:</strong> ${esc(city)}</p>` : ""}
         ${location ? `<p><strong>Location:</strong> ${esc(location)}</p>` : ""}
         ${message ? `<p><strong>Message:</strong> ${esc(message)}</p>` : ""}
         <p><em>${new Date().toLocaleString()}</em></p>`
      );
    } catch (mailErr) {
      console.log("Admin booking email failed:", mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.find().populate();
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { createBooking  , getAllBookings };
