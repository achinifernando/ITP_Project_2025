import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../../CSS/ClientPortalCSS/checkout.css";

function CheckoutPage() {
  const { id, type } = useParams(); // type = "order" or "service"
  const [item, setItem] = useState(null);
  const [file, setFile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [loading, setLoading] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: "success", // success | error
    message: "",
  });

  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(
        () => setNotification({ ...notification, show: false }),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch details of order or service
  useEffect(() => {
    const fetchData = async () => {
      try {
        const url =
          type === "order"
            ? `http://localhost:5000/orders/order/${id}`
            : `http://localhost:5000/serviceRequest/service/${id}`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setItem(res.data);
        setAmount(res.data.totalPrice || ""); // fallback amount if available
      } catch (err) {
        console.error("Error fetching details:", err);
      }
    };

    fetchData();
  }, [id, type]);

  // Amount validation function
  const validateAmount = (value) => {
    if (!value) {
      return "Amount is required";
    }

    // Check if it's a valid number
    if (isNaN(value) || value === "") {
      return "Please enter a valid number";
    }

    // Convert to number
    const numValue = parseFloat(value);

    // Check if positive
    if (numValue <= 0) {
      return "Amount must be greater than 0";
    }

    // Check decimal places using regex
    const decimalRegex = /^\d+(\.\d{1,2})?$/;
    if (!decimalRegex.test(value)) {
      return "Amount can have maximum 2 decimal places";
    }

    // Check if within reasonable range (optional)
    if (numValue > 10000000) { // 10 million
      return "Amount seems too large. Please verify.";
    }

    return ""; // No error
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    
    // Allow empty input during typing
    if (value === "") {
      setAmount("");
      setAmountError("");
      return;
    }

    // Basic validation - only allow numbers and one decimal point
    const validNumberRegex = /^-?\d*\.?\d*$/;
    if (!validNumberRegex.test(value)) {
      return; // Don't update if invalid characters
    }

    setAmount(value);
    
    // Validate only when user has finished typing a complete number
    if (value.includes('.') || value.length > 0) {
      const error = validateAmount(value);
      setAmountError(error);
    }
  };

  const handleAmountBlur = (e) => {
    const value = e.target.value;
    
    if (value) {
      // Format to 2 decimal places
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const formattedValue = numValue.toFixed(2);
        setAmount(formattedValue);
        
        // Validate formatted value
        const error = validateAmount(formattedValue);
        setAmountError(error);
      }
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate amount before submission
    const amountValidationError = validateAmount(amount);
    if (amountValidationError) {
      setAmountError(amountValidationError);
      setNotification({
        show: true,
        type: "error",
        message: amountValidationError,
      });
      return;
    }

    if (!file) {
      setNotification({
        show: true,
        type: "error",
        message: "Please select a receipt file",
      });
      return;
    }

    const formData = new FormData();
    formData.append("receipt", file);
    formData.append("paymentMethod", paymentMethod);
    formData.append("amount", amount);

    try {
      setLoading(true);
      await axios.post(
        `http://localhost:5000/client-payments/${type}/${id}/payment`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setNotification({
        show: true,
        type: "success",
        message: `Payment uploaded successfully for ${type}`,
      });
    } catch (error) {
      console.error(error);
      setNotification({
        show: true,
        type: "error",
        message:
          error.response?.data?.message || "Error processing payment",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!item) return <p>Loading {type} details...</p>;

  return (
    <>
      <div className="payment-upload">
        <h3>Upload Payment Receipt</h3>

        {/* Bank Payment Details */}
        <div className="bank-details">
          <h3>Bank Payment Details</h3>
          <p><strong>Bank Name:</strong> People's Bank</p>
          <p><strong>Account No:</strong> 1234567890</p>
          <p><strong>Account Name:</strong> Nimal Engineering Works</p>
          <p><strong>Branch:</strong> Gampaha</p>
        </div>

        <div className="payment-details">
          <h4>{type === "order" ? "Order Details" : "Service Details"}</h4>
          <p><strong>ID:</strong> {item._id}</p>
          {item.totalPrice && <p><strong>Total Price:</strong> Rs. {item.totalPrice}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Payment Method:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online Payment</option>
            </select>
          </div>

          <div className="form-group">
            <label>Receipt File (Image/PDF):</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              required
            />
          </div>
          
          {/* Display the uploaded file */}
          {file && (
            <div className="file-preview">
              {file.type.includes("image") ? (
                <img src={URL.createObjectURL(file)} alt="Receipt Preview" width="200" />
              ) : (
                <p>{file.name}</p>
              )}
            </div>
          )}

          <div className={`form-group ${amountError ? 'error' : ''}`}>
            <label>Amount (Rs.):</label>
            <input
              type="text" // Using text to have more control over input
              value={amount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              placeholder="0.00"
              required
              className={amountError ? 'error-input' : ''}
            />
            {amountError && (
              <div className="error-message">{amountError}</div>
            )}
            <div className="input-hint">Maximum 2 decimal places allowed</div>
          </div>

          <button type="submit" disabled={loading || amountError}>
            {loading ? "Uploading..." : "Upload Payment Receipt"}
          </button>
        </form>
      </div>

      {/* Notification UI */}
      {notification.show && (
        <div className={`notification ${notification.type}`} role="alert">
          <div className="notification__body">
            <h2>{notification.type === "success" ? "Success" : "Error"}</h2>
            <p>{notification.message}</p>
          </div>
          <button
            className="notification_button"
            onClick={() => setNotification({ ...notification, show: false })}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

export default CheckoutPage;