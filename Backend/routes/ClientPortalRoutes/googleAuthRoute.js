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
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Use service account credentials
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../../keys/service-account.json"),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });

// Use a consistent calendar ID
const CALENDAR_ID = process.env.ADMIN_EMAIL || "primary";

// ROUTES 

// Create a new booking
router.post("/create_event", async (req, res) => {
  try {
    const { clientName, clientEmail, description, date, time } = req.body;

    // Create Google Calendar event
    const startDate = new Date(`${date}T${time}:00`).toISOString();
    const endDate = new Date(new Date(`${date}T${time}:00`).getTime() + 30 * 60000).toISOString();

    const event = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `Meeting with ${clientName}`,
        description,
        start: { dateTime: startDate, timeZone: 'Asia/Colombo' },
        end: { dateTime: endDate, timeZone: 'Asia/Colombo' },
        attendees: [
          { email: clientEmail, displayName: clientName },
          { email: process.env.ADMIN_EMAIL }
        ],
        transparency: 'tentative', // Initially tentative
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
      status: "pending",
    });
    await booking.save();

    // Notify admin
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: "New Meeting Request",
        html: `
          <h3>New Meeting Request</h3>
          <p><strong>Client:</strong> ${clientName}</p>
          <p><strong>Email:</strong> ${clientEmail}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Calendar Event ID:</strong> ${event.data.id}</p>
        `,
      });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr.message);
    }

    res.json({ 
      message: "Booking created and admin notified", 
      booking,
      calendarEventId: event.data.id 
    });
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
      calendarId: CALENDAR_ID,
      timeMin: new Date(`${date}T00:00:00`).toISOString(),
      timeMax: new Date(`${date}T23:59:59`).toISOString(),
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

// Admin confirm/reject/complete
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body; // confirmed, rejected, or completed
    const booking = await Meeting.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    let calendarUpdate = { success: false, message: '' };

    // Handle Google Calendar updates
    if (booking.googleEventId) {
      try {
        if (status === "confirmed") {
          await calendar.events.patch({
            calendarId: CALENDAR_ID,
            eventId: booking.googleEventId,
            requestBody: { 
              status: "confirmed",
              transparency: "opaque", // blocks time on calendar
            },
          });
          calendarUpdate = { success: true, message: 'Calendar event confirmed' };
        } else if (status === "rejected") {
          await calendar.events.delete({
            calendarId: CALENDAR_ID,
            eventId: booking.googleEventId,
          });
          calendarUpdate = { success: true, message: 'Calendar event deleted' };
        } else if (status === "completed") {
          // For completed, we can keep the event but mark it differently
          await calendar.events.patch({
            calendarId: CALENDAR_ID,
            eventId: booking.googleEventId,
            requestBody: { 
              colorId: "10", // Green color for completed
              description: `[COMPLETED] ${booking.description}`
            },
          });
          calendarUpdate = { success: true, message: 'Calendar event marked as completed' };
        }
      } catch (calendarError) {
        console.error('Google Calendar update failed:', calendarError.message);
        calendarUpdate = { 
          success: false, 
          message: `Calendar update failed: ${calendarError.message}` 
        };
        // Don't fail the entire request - continue with database update
      }
    }

    // Update booking status in database
    booking.status = status;
    await booking.save();

    // Notify client
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: booking.clientEmail,
        subject: `Your meeting request has been ${status}`,
        html: `
          <h3>Meeting Update</h3>
          <p>Your meeting request has been <strong>${status}</strong>.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li><strong>Date:</strong> ${booking.date}</li>
            <li><strong>Time:</strong> ${booking.time}</li>
            <li><strong>Description:</strong> ${booking.description}</li>
          </ul>
          ${!calendarUpdate.success ? `<p><em>Note: Calendar sync had issues: ${calendarUpdate.message}</em></p>` : ''}
        `,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    res.json({ 
      message: `Booking ${status}`, 
      booking,
      calendarUpdate 
    });

  } catch (err) {
    console.error("Error updating booking:", err.message);
    res.status(500).json({ 
      error: "Failed to update booking",
      details: err.message 
    });
  }
});

// Debug endpoint to check calendar event status
router.get("/:id/calendar-status", async (req, res) => {
  try {
    const booking = await Meeting.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (!booking.googleEventId) {
      return res.json({ 
        exists: false, 
        message: "No Google Event ID associated with this booking" 
      });
    }

    const event = await calendar.events.get({
      calendarId: CALENDAR_ID,
      eventId: booking.googleEventId,
    });

    res.json({ 
      exists: true, 
      event: {
        id: event.data.id,
        summary: event.data.summary,
        status: event.data.status,
        start: event.data.start,
        end: event.data.end
      }
    });
  } catch (error) {
    if (error.code === 404) {
      res.json({ 
        exists: false, 
        message: "Event not found in Google Calendar" 
      });
    } else {
      res.status(500).json({ 
        error: "Error checking calendar status",
        details: error.message 
      });
    }
  }
});

module.exports = router;