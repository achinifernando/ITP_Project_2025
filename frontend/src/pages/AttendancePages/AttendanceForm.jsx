import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../CSS/AttendanceCSS/AttendanceForm.css";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";

export default function AttendanceForm({ onAttendanceUpdate }) {
  const [employeeId, setEmployeeId] = useState("");
  const [otp, setOtp] = useState("");
  const [action, setAction] = useState("time-in");
  const [step, setStep] = useState("enterId");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval = null;
    if (step === "otpSent" && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && step === "otpSent") {
      setMessage("OTP expired. Please request a new OTP.");
      setStep("enterId");
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const sendOtp = async (selectedAction) => {
    if (!employeeId.trim()) {
      return setMessage("Please enter Employee ID.");
    }
    
    setIsLoading(true);
    setMessage("Sending OTP...");
    
    try {
      const res = await axios.post(`${BASE_URL}${API_PATHS.ATTENDANCE.SEND_OTP}`, { 
        employeeId: employeeId.trim(), 
        action: selectedAction 
      });
      
      setMessage(res.data.message);
      setAction(selectedAction);
      setStep("otpSent");
      setTimer(120); // 2 minutes
      setOtp("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      return setMessage("Please enter OTP.");
    }
    
    if (timer === 0) {
      return setMessage("OTP has expired. Please request a new one.");
    }
    
    if (otp.length !== 6) {
      return setMessage("Please enter a valid 6-digit OTP.");
    }
    
    setIsLoading(true);
    setMessage("Verifying OTP...");
    
    try {
      const res = await axios.post(`${BASE_URL}${API_PATHS.ATTENDANCE.VERIFY_OTP}`, { 
        employeeId: employeeId.trim(), 
        otp: otp.trim(), 
        action 
      });
      
      setMessage(res.data.message);
      setStep("done");
      
      // Notify parent component to refresh attendance data
      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error verifying OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setEmployeeId("");
    setOtp("");
    setStep("enterId");
    setMessage("");
    setAction("time-in");
    setTimer(0);
    setIsLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="attendance-form">
      <h2>Employee Attendance</h2>

      {step === "enterId" && (
        <>
          <div className="input-group">
            <label htmlFor="employeeId">Employee ID</label>
            <input
              id="employeeId"
              type="text"
              placeholder="Enter your Employee ID (e.g., 001)"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="btn-row">
            <button 
              onClick={() => sendOtp("time-in")} 
              disabled={isLoading || !employeeId.trim()}
              className={`btn-primary ${isLoading ? "loading" : ""}`}
            >
              {isLoading ? "Sending..." : "Time In"}
            </button>
            <button 
              onClick={() => sendOtp("time-out")} 
              disabled={isLoading || !employeeId.trim()}
              className={`btn-secondary ${isLoading ? "loading" : ""}`}
            >
              {isLoading ? "Sending..." : "Time Out"}
            </button>
          </div>
        </>
      )}

      {step === "otpSent" && (
        <>
          <div className="otp-info">
            <p>OTP sent for <strong>{action.replace('-', ' ')}</strong></p>
            <p className="timer">Expires in: {formatTime(timer)}</p>
          </div>
          
          <div className="input-group">
            <label htmlFor="otp">Enter OTP</label>
            <input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isLoading}
              maxLength="6"
            />
          </div>
          
          <div className="btn-row">
            <button 
              onClick={verifyOtp} 
              disabled={isLoading || !otp.trim() || otp.length !== 6}
              className={`btn-primary ${isLoading ? "loading" : ""}`}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
            <button 
              onClick={() => { setStep("enterId"); setMessage(""); setTimer(0); }} 
              disabled={isLoading}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {step === "done" && (
        <>
          <div className="success-message">
            <h3>✅ Success!</h3>
            <p>{message}</p>
          </div>
          <div className="btn-row">
            <button onClick={resetFlow} className="btn-primary">
              New Attendance Action
            </button>
          </div>
        </>
      )}

      {message && (
        <div className={`message ${step === 'done' ? 'success' : step === 'otpSent' ? 'info' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}