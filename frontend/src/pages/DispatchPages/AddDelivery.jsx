import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../CSS/DispatchCSS/AddDelivery.css";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icon for live location
const liveLocationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const API_URL = "http://localhost:5000/deliveries";

export default function AddDelivery() {
  const [form, setForm] = useState({
    customerName: "",
    houseNo: "",
    street: "",
    city: "",
    district: "",
    province: "",
    contactPhone: "",
    deliveryDate: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [customerCoords, setCustomerCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [route, setRoute] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  // Added missing state variables
  const [fieldErrors, setFieldErrors] = useState({});

  const mapRef = useRef();

  // Validation rules for each field
  const validationRules = {
    customerName: {
      required: true,
      pattern: /^[a-zA-Z\s]{2,50}$/,
      message: 'Customer name should contain only letters and spaces (2-50 characters)'
    },
    houseNo: {
      required: true,
      pattern: /^[a-zA-Z0-9/-\s]{1,20}$/, 
      message: 'House number should be alphanumeric (1-20 characters)'
    },
    street: {
      required: true,
      pattern: /^[a-zA-Z0-9\s.,-]{2,50}$/, 
      message: 'Street name should be valid (2-50 characters)'
    },
    city: {
      required: true,
      pattern: /^[a-zA-Z\s]{2,30}$/,
      message: 'City name should contain only letters (2-30 characters)'
    },
    district: {
      required: true,
      pattern: /^[a-zA-Z\s]{2,30}$/,
      message: 'District name should contain only letters (2-30 characters)'
    },
    province: {
      required: true,
      pattern: /^[a-zA-Z\s]{2,30}$/,
      message: 'Province name should contain only letters (2-30 characters)'
    },
    contactPhone: {
      required: true,
      pattern: /^[0-9]{10}$/,
      message: 'Phone number should be 10 digits'
    },
    deliveryDate: {
      required: true,
      validate: (value) => {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      message: 'Delivery date cannot be in the past'
    }
  };

  // Get user's initial location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          };
          setUserLocation(newLocation);
        },
        (error) => {
          setError("Enable location services to calculate distance.");
        }
      );
    } else {
      setError("Geolocation not supported.");
    }

    // Cleanup function to clear watch position when component unmounts
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Validate individual field
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return true;

    let isValid = true;
    let errorMessage = '';

    // Check required field
    if (rules.required && !value.trim()) {
      isValid = false;
      errorMessage = 'This field is required';
    }
    // Check pattern
    else if (rules.pattern && !rules.pattern.test(value)) {
      isValid = false;
      errorMessage = rules.message;
    }
    // Check custom validation function
    else if (rules.validate && !rules.validate(value)) {
      isValid = false;
      errorMessage = rules.message;
    }

    // Update field errors
    setFieldErrors(prev => ({
      ...prev,
      [name]: isValid ? '' : errorMessage
    }));

    return isValid;
  };

  // Validate all fields
  const validateAllFields = () => {
    const errors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const rules = validationRules[fieldName];
      const value = form[fieldName].trim();

      if (rules.required && !value) {
        errors[fieldName] = 'This field is required';
        isValid = false;
      } else if (rules.pattern && !rules.pattern.test(value)) {
        errors[fieldName] = rules.message;
        isValid = false;
      } else if (rules.validate && !rules.validate(value)) {
        errors[fieldName] = rules.message;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  // Handle form input changes with validation
  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle field blur (when user leaves the field)
  const handleBlur = e => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // Toggle live location tracking
  const toggleLiveLocation = () => {
    if (isTracking) {
      // Stop tracking
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setIsTracking(false);
    } else {
      // Start tracking
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = { 
              lat: position.coords.latitude, 
              lng: position.coords.longitude 
            };
            setUserLocation(newLocation);
            
            // Recalculate distance if customer location exists
            if (customerCoords) {
              const dist = calculateDistance(newLocation, customerCoords);
              setDistance(dist.toFixed(2));
              setRoute([newLocation, customerCoords]);
            }
          },
          (error) => {
            setError("Error tracking live location.");
            setIsTracking(false);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 5000, 
            maximumAge: 0 
          }
        );
        setWatchId(id);
        setIsTracking(true);
      }
    }
  };

  // Geocode address to get coordinates
  const geocodeAddress = async (address) => {
    try {
      const formattedAddress = address.replace(/\s+/g, '+');
      const response = await axiosInstance.get(`https://nominatim.openstreetmap.org/search`, {
        params: { 
          q: formattedAddress, 
          format: 'json', 
          limit: 1, 
          addressdetails: 1 
        }
      });
      
      if (response.data && response.data.length > 0) {
        return { 
          lat: parseFloat(response.data[0].lat), 
          lng: parseFloat(response.data[0].lon) 
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Calculate route and distance to customer address
  const calculateRoute = async () => {
    // First validate address fields
    const addressFields = ['houseNo', 'street', 'city', 'district', 'province'];
    let hasErrors = false;
    
    addressFields.forEach(field => {
      if (!validateField(field, form[field])) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setError("Please fix address errors before calculating distance.");
      return;
    }

    if (!userLocation) {
      setError("Please allow location access.");
      return;
    }

    const { houseNo, street, city, district, province } = form;
    if (!houseNo || !street || !city || !district || !province) {
      setError("Please enter complete address.");
      return;
    }

    setIsCalculating(true);
    setError('');

    try {
      // Try different address formats for better geocoding results
      const addressVariations = [
        `${houseNo} ${street}, ${city}, ${district}, ${province}`,
        `${street}, ${city}, ${district}, ${province}`,
        `${city}, ${district}, ${province}`
      ];

      let coords = null;
      for (let address of addressVariations) {
        coords = await geocodeAddress(address);
        if (coords) break;
      }

      if (coords) {
        setCustomerCoords(coords);
        const dist = calculateDistance(userLocation, coords);
        setDistance(dist.toFixed(2));
        setRoute([userLocation, coords]);
        setError('');
      } else {
        setError("Address not found. Try being more specific.");
      }
    } catch (error) {
      setError("Geocoding service error. Try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validate all fields before submission
    if (!validateAllFields()) {
      setError("Please fix all validation errors before submitting.");
      return;
    }

    try {
      // Use axiosInstance instead of axios for consistency with your project
      await axiosInstance.post(API_URL, { 
        ...form, 
        address: `${form.houseNo}, ${form.street}, ${form.city}, ${form.district}, ${form.province}`,
        distance: distance || 0
      });
      setMessage("Delivery added successfully!");
      // Reset form and state
      setForm({ 
        customerName: '', 
        houseNo: '', 
        street: '', 
        city: '', 
        district: '', 
        province: '', 
        contactPhone: '', 
        deliveryDate: '' 
      });
      setFieldErrors({});
      setDistance(null);
      setRoute(null);
      setCustomerCoords(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error adding delivery");
    }
  };

  // Clear form and reset state
  const handleClear = () => {
    setForm({ 
      customerName: '', 
      houseNo: '', 
      street: '', 
      city: '', 
      district: '', 
      province: '', 
      contactPhone: '', 
      deliveryDate: '' 
    });
    setMessage('');
    setError('');
    setFieldErrors({});
    setDistance(null);
    setRoute(null);
    setCustomerCoords(null);
  };


    /* ==============================
      UI Rendering
     - Form with live validation.
     - Buttons for calculating distance & tracking location.
     - Interactive Leaflet map showing user & customer locations.
  ================================= */
  return (
    <div className="add-delivery-container">
      <h2>Add New Delivery</h2>

      {/* Display messages and errors */}
      {message && <div className="message success-message">{message}</div>}
      {error && <div className="message error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Customer name input */}
        <div className="form-group">
          <label className="required-field">Customer Name</label>
          <input 
            type="text" 
            name="customerName" 
            value={form.customerName} 
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. sethmi disara" 
            className={fieldErrors.customerName ? 'error' : ''}
            required 
          />
          {fieldErrors.customerName && <span className="field-error">{fieldErrors.customerName}</span>}
        </div>

        {/* Address section */}
        <div className="address-section">
          <h3>Delivery Address</h3>
          
          <div className="form-group">
            <label className="required-field">House/Apartment Number</label>
            <input 
              type="text" 
              name="houseNo" 
              value={form.houseNo} 
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 123/A" 
              className={fieldErrors.houseNo ? 'error' : ''}
              required 
            />
            {fieldErrors.houseNo && <span className="field-error">{fieldErrors.houseNo}</span>}
          </div>

          <div className="form-group">
            <label className="required-field">Street</label>
            <input 
              type="text" 
              name="street" 
              value={form.street} 
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Main Street" 
              className={fieldErrors.street ? 'error' : ''}
              required 
            />
            {fieldErrors.street && <span className="field-error">{fieldErrors.street}</span>}
          </div>

          <div className="form-group">
            <label className="required-field">City</label>
            <input 
              type="text" 
              name="city" 
              value={form.city} 
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Colombo" 
              className={fieldErrors.city ? 'error' : ''}
              required 
            />
            {fieldErrors.city && <span className="field-error">{fieldErrors.city}</span>}
          </div>

          <div className="form-group">
            <label className="required-field">District</label>
            <input 
              type="text" 
              name="district" 
              value={form.district} 
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Colombo District" 
              className={fieldErrors.district ? 'error' : ''}
              required 
            />
            {fieldErrors.district && <span className="field-error">{fieldErrors.district}</span>}
          </div>

          <div className="form-group">
            <label className="required-field">Province</label>
            <input 
              type="text" 
              name="province" 
              value={form.province} 
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Western Province" 
              className={fieldErrors.province ? 'error' : ''}
              required 
            />
            {fieldErrors.province && <span className="field-error">{fieldErrors.province}</span>}
          </div>

          {/* Action buttons for distance calculation and live tracking */}
          <div className="button-group">
            <button type="button" onClick={calculateRoute} disabled={isCalculating} className="calculate-distance-btn">
              {isCalculating ? 'Calculating...' : 'Calculate Distance'}
            </button>
            <button type="button" onClick={toggleLiveLocation} className={`live-location-btn ${isTracking ? 'tracking' : ''}`}>
              {isTracking ? 'Stop Live Tracking' : 'Start Live Location'}
            </button>
          </div>
        </div>

        {/* Contact phone input */}
        <div className="form-group">
          <label className="required-field">Contact Phone</label>
          <input 
            type="tel" 
            name="contactPhone" 
            value={form.contactPhone} 
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 0771234567" 
            className={fieldErrors.contactPhone ? 'error' : ''}
            required 
          />
          {fieldErrors.contactPhone && <span className="field-error">{fieldErrors.contactPhone}</span>}
        </div>

        {/* Delivery date input */}
        <div className="form-group">
          <label className="required-field">Delivery Date</label>
          <input 
            type="date" 
            name="deliveryDate" 
            value={form.deliveryDate} 
            onChange={handleChange}
            onBlur={handleBlur}
            className={fieldErrors.deliveryDate ? 'error' : ''}
            required 
          />
          {fieldErrors.deliveryDate && <span className="field-error">{fieldErrors.deliveryDate}</span>}
        </div>

        {/* Display map and distance information when available */}
        {(userLocation || distance) && (
          <div className="distance-display">
            <h3>Delivery Information</h3>
            {distance && <p><strong>Estimated Distance:</strong> {distance} km</p>}
            {isTracking && <p><strong>Live Location:</strong> Active</p>}
            
            {/* Map container with markers and route */}
            {userLocation && (
              <div className="map-container">
                <MapContainer 
                  center={userLocation} 
                  zoom={13} 
                  style={{ height: '300px', width: '100%' }}
                  ref={mapRef}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Live location marker */}
                  <Marker position={userLocation} icon={liveLocationIcon}>
                    <Popup>
                      <strong>Your Live Location</strong><br />
                      Lat: {userLocation.lat.toFixed(6)}<br />
                      Lng: {userLocation.lng.toFixed(6)}
                    </Popup>
                  </Marker>
                  
                  {/* Customer location marker */}
                  {customerCoords && (
                    <Marker position={customerCoords}>
                      <Popup>Customer Location</Popup>
                    </Marker>
                  )}
                  
                  {/* Route line between locations */}
                  {route && <Polyline positions={route} color="blue" />}
                </MapContainer>
              </div>
            )}
          </div>
        )}

        {/* Form action buttons */}
        <div className="button-group">
          <button type="submit" className="submit-button">Create Delivery</button>
          <button type="button" onClick={handleClear} className="clear-button">Clear Form</button>
        </div>
      </form>
    </div>
  );
}