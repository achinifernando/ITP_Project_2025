import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../CSS/clientbookingpage.css";
import axios from "axios";

export default function ClientBookingPage() {
const [date, setDate] = useState(new Date());
const [slots, setSlots] = useState([]);
const [selectedSlot, setSelectedSlot] = useState("");
const [formData, setFormData] = useState({ name: "", email: "", description: "" });
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [notification, setNotification] = useState({
  show: false,
  type: "success", // success | error
  message: "",
});

// Auto-hide notification after 3s
useEffect(() => {
  if (notification.show) {
    const timer = setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [notification]);

// Fetch slots for a selected date
const fetchSlots = async (selectedDate) => {
  setLoading(true);
  setError("");
  try {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    const res = await axios.get(`http://localhost:5000/googleAuth/available/${formattedDate}`);
    setSlots(res.data);
  } catch (err) {
    console.error("Error fetching slots:", err);
    setError("Failed to load available time slots. Please try again later.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchSlots(date);
}, [date]);

// Handle booking submission
const handleSubmit = async () => {
  if (!selectedSlot || !formData.name || !formData.email) {
    alert("Please fill all fields and select a slot!");
    return;
  }

  try {
    await axios.post("http://localhost:5000/googleAuth/create_event", {
      clientName: formData.name,
      clientEmail: formData.email,
      description: formData.description,
      date: date.toISOString().split("T")[0],
      time: selectedSlot,
    });

    setNotification({
      show: true,
      type: "success",
      message: "Meeting request submitted successfully! Please check your email",
    });

    // Reset form
    setFormData({ name: "", email: "", description: "" });
    setSelectedSlot("");

    // Refresh available slots automatically
    fetchSlots(date);

  } catch (err) {
    console.error("Booking error:", err);
    setNotification({
      show: true,
      type: "error",
      message: "Failed to book meeting. This slot might have been taken. Please refresh and try again.",
    });

    // Refresh slots in case the slot is now taken
    fetchSlots(date);
  }
};


  return (
    <>
    <div>
      <div className="client-booking-container">
        {/* Hero Section */}
        <div className="booking-hero">
          <h1>Book Your Lorry Body Consultation</h1>
          <p>Professional lorry body building services with expert consultation and custom solutions</p>
        </div>

        {/* Split Layout */}
        <div className="booking-content">
          {/* Calendar Section */}
          <div className="calendar-section">
            <h2 className="section-title">Select Consultation Date</h2>
            <Calendar onChange={setDate} value={date} />
          </div>

          {/* Slots Section */}
          <div className="slots-info-section">
            <div className="slots-header">
              <h3 className="section-title">Available Time Slots</h3>
            </div>
            <div className="slots-content">
              {error && <div className="error-message">{error}</div>}

              {loading ? (
                <div className="loading">Loading available slots...</div>
              ) : (
                <div className="slots-section">
                  {slots.length === 0 ? (
                    <div className="no-slots">
                      <p>No available consultation slots for this day.</p>
                      <p>Please select another date or contact us directly.</p>
                    </div>
                  ) : (
                    slots.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSlot(s)}
                        className={`slot-button ${selectedSlot === s ? "selected" : ""}`}
                      >
                        {s}
                      </button>
                    ))
                  )}
                </div>
              )}

              {selectedSlot && <div className="status-ribbon">Selected!</div>}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="form-section">
          <h3 className="section-title">Your Information</h3>
          <div className="form-grid">
            <input
              className="form-input"
              placeholder="Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              className="form-input"
              placeholder="Email Address *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              className="form-input"
              placeholder="Project Description (Lorry Type, Requirements, etc.)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button className="submit-button" onClick={handleSubmit}>
            Book Consultation
          </button>
        </div>
      </div>
    </div>
{/* Notification */}
      {notification.show && (
        <div
          className={`notification ${notification.type}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="notification__body">
            <h2 className="notification__header">
              {notification.type === "success" ? "Success" : "Error"}
            </h2>
            <p className="notification__text">{notification.message}</p>
          </div>
          <div className="notification__action">
            <button
              className="notification_button"
              onClick={() =>
                setNotification((prev) => ({ ...prev, show: false }))
              }
            >
              ✕
            </button>
          </div>
        </div>
      )}


</>
  );
}
