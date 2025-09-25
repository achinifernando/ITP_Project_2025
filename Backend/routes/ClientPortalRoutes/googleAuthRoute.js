const express = require("express");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const Meeting = require("../../models/ClientPortalModels/meetingsModel");
const nodemailer = require("nodemailer");
const path = require("path");


dotenv.config();

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Use service account credentials
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../keys/service-account.json"),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });

//ROUTES 

// Create a new booking
router.post("/create_event", async (req, res) => {
  try {
    const { clientName, clientEmail, description, date, time } = req.body;

    // Create Google Calendar event
    const startDate = new Date(`${date}T${time}:00`).toISOString();
const endDate = new Date(new Date(`${date}T${time}:00`).getTime() + 30 * 60000).toISOString();


    const event = await calendar.events.insert({
  calendarId: process.env.ADMIN_EMAIL,
  requestBody: {
    summary: `Meeting with ${clientName}`,
    description,
    start: { dateTime: startDate },
    end: { dateTime: endDate },
  },
});


    // Save to DB
    const booking = new Meeting({
      clientName,
      clientEmail,
      description,
      date,
      time,
      googleEventId: event.data.id,
      status: "pending", // initial status in DB
    });
    await booking.save();

    // Notify admin
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: "New Meeting Request",
        text: `New meeting requested by ${clientName} on ${date} at ${time}.`,
      });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr.message);
    }

    res.json({ message: "Booking created and admin notified", booking });
  } catch (err) {
    console.error("Error creating booking:", err.message);
    res.status(500).json({ error: "Failed to create booking" });
  }
});



// Get all bookings (Admin)
router.get("/all_bookings", async (req, res) => {
  try {
    const bookings = await Meeting.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err.message);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Get available slots for a date (Client)
router.get("/available/:date", async (req, res) => {
  try {
    const { date } = req.params;

    // Fetch all events for the day
    const events = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date(`${date}T00:00:00Z`).toISOString(),
      timeMax: new Date(`${date}T23:59:59Z`).toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    // Business hours
    const businessStart = 9; // 9 AM
    const businessEnd = 17; // 5 PM
    const slotDuration = 30; // minutes

    // Generate all possible slots
    const allSlots = [];
    for (let hour = businessStart; hour < businessEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        allSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
      }
    }

    // Booked slots
    const bookedSlots = events.data.items
      .filter(event => event.status !== "cancelled")
      .map(event => {
        const startTime = new Date(event.start.dateTime || event.start.date);
        return startTime.toISOString().substring(11, 16); // "HH:MM"
      });

    // Filter available slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json(availableSlots);
  } catch (err) {
    console.error("Error fetching available slots:", err.message);
    res.status(500).json({ error: "Failed to fetch available slots" });
  }
});

// Admin confirm/reject
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body; // confirmed or rejected
    const booking = await Meeting.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (status === "confirmed") {
      await calendar.events.patch({
        calendarId: "primary",
        eventId: booking.googleEventId,
        requestBody: { 
          status: "confirmed",
          transparency: "opaque", // blocks time on calendar
        },
      });
    } else if (status === "rejected" ||status === "completed" ) {
      await calendar.events.delete({
        calendarId: "primary",
        eventId: booking.googleEventId,
      });
    }

    booking.status = status;
    await booking.save();

    // Notify client
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.clientEmail,
      subject: `Your meeting is ${status}`,
      text: `Your meeting on ${booking.date} at ${booking.time} is ${status}.`,
    });

    res.json({ message: `Booking ${status}`, booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


module.exports = router;
