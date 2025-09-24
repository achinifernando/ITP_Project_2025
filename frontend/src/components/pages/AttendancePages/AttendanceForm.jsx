import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../CSS/AttendanceCSS/AttendanceForm.css";
import { API_PATHS, BASE_URL } from "../../../utils/apiPaths"; // Import BASE_URL

export default function AttendanceForm() {
  const [employeeId, setEmployeeId] = useState("");
  const [otp, setOtp] = useState("");
  const [action, setAction] = useState("time-in");
  const [step, setStep] = useState("enterId");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (step === "otpSent" && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && step === "otpSent") {
      setMessage("OTP expired. Please request a new OTP.");
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const sendOtp = async (selectedAction) => {
    if (!employeeId) return setMessage("Please enter Employee ID.");
    setMessage("Sending OTP...");
    try {
      const res = await axios.post(`${BASE_URL}${API_PATHS.ATTENDANCE.SEND_OTP}`, { 
        employeeId, 
        action: selectedAction 
      });
      setMessage(res.data.message);
      setAction(selectedAction);
      setStep("otpSent");
      setTimer(120);
      setOtp("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending OTP");
    }
  };

  const verifyOtp = async () => {
    if (!otp) return setMessage("Please enter OTP.");
    setMessage("Verifying OTP...");
    try {
      const res = await axios.post(`${BASE_URL}${API_PATHS.ATTENDANCE.VERIFY_OTP}`, { 
        employeeId, 
        otp, 
        action 
      });
      setMessage(res.data.message);
      setStep("done");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error verifying OTP");
    }
  };

  const resetFlow = () => {
    setEmployeeId("");
    setOtp("");
    setStep("enterId");
    setMessage("");
    setAction("time-in");
    setTimer(0);
  };

  return (
    <div className="attendance-form">
      <h2>Employee Attendance</h2>

      {step === "enterId" && (
        <>
          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
          <div className="btn-row">
            <button onClick={() => sendOtp("time-in")}>Send OTP for Time-In</button>
            <button onClick={() => sendOtp("time-out")}>Send OTP for Time-Out</button>
          </div>
        </>
      )}

      {step === "otpSent" && (
        <>
          <p className="muted">OTP sent for <strong>{action}</strong>. Expires in: {timer}s</p>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <div className="btn-row">
            <button onClick={verifyOtp}>Verify OTP</button>
            <button onClick={() => { setStep("enterId"); setMessage(""); setTimer(0); }}>Cancel</button>
          </div>
        </>
      )}

      {step === "done" && (
        <>
          <h3 className="success">✅ {message}</h3>
          <div className="btn-row">
            <button onClick={resetFlow}>New Action</button>
          </div>
        </>
      )}

      {message && step !== "done" && <p className="message">{message}</p>}
    </div>
  );
}