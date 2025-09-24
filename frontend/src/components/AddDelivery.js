import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AddDelivery.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for live location
const liveLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const API_URL = 'http://localhost:5001/deliveries';

export default function AddDelivery() {
  const [form, setForm] = useState({
    customerName: '', houseNo: '', street: '', city: '', district: '', province: '', contactPhone: '', deliveryDate: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [customerCoords, setCustomerCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [route, setRoute] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [watchId, setWatchId] = useState(null); // For tracking live location
  const [isTracking, setIsTracking] = useState(false); // Track if live location is active

  const mapRef = useRef();

  // Get user's initial location
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

    // Cleanup watch position when component unmounts
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Start/Stop live location tracking
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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const geocodeAddress = async (address) => {
    try {
      const formattedAddress = address.replace(/\s+/g, '+');
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: formattedAddress, format: 'json', limit: 1, addressdetails: 1 }
      });
      
      if (response.data && response.data.length > 0) {
        return { lat: parseFloat(response.data[0].lat), lng: parseFloat(response.data[0].lon) };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const calculateDistance = (coord1, coord2) => {
    const R = 6371;
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateRoute = async () => {
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

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!form.customerName || !form.houseNo || !form.street || !form.city || 
        !form.district || !form.province || !form.contactPhone || !form.deliveryDate) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      await axios.post(API_URL, { 
        ...form, 
        address: `${form.houseNo}, ${form.street}, ${form.city}, ${form.district}, ${form.province}`,
        distance: distance || 0
      });
      setMessage("Delivery added successfully!");
      setForm({ customerName: '', houseNo: '', street: '', city: '', district: '', province: '', contactPhone: '', deliveryDate: '' });
      setDistance(null);
      setRoute(null);
      setCustomerCoords(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error adding delivery");
    }
  };

  const handleClear = () => {
    setForm({ customerName: '', houseNo: '', street: '', city: '', district: '', province: '', contactPhone: '', deliveryDate: '' });
    setMessage('');
    setError('');
    setDistance(null);
    setRoute(null);
    setCustomerCoords(null);
  };

  return (
    <div className="add-delivery-container">
      <h2>Add New Delivery</h2>

      {message && <div className="message success-message">{message}</div>}
      {error && <div className="message error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="required-field">Customer Name</label>
          <input type="text" name="customerName" value={form.customerName} onChange={handleChange} required />
        </div>

        <div className="address-section">
          <h3>Delivery Address</h3>
          
          <div className="form-group">
            <label className="required-field">House/Apartment Number</label>
            <input type="text" name="houseNo" value={form.houseNo} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="required-field">Street</label>
            <input type="text" name="street" value={form.street} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="required-field">City</label>
            <input type="text" name="city" value={form.city} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="required-field">District</label>
            <input type="text" name="district" value={form.district} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="required-field">Province</label>
            <input type="text" name="province" value={form.province} onChange={handleChange} required />
          </div>

          <div className="button-group">
            <button type="button" onClick={calculateRoute} disabled={isCalculating} className="calculate-distance-btn">
              {isCalculating ? 'Calculating...' : 'Calculate Distance'}
            </button>
            <button type="button" onClick={toggleLiveLocation} className={`live-location-btn ${isTracking ? 'tracking' : ''}`}>
              {isTracking ? 'Stop Live Tracking' : 'Start Live Location'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="required-field">Contact Phone</label>
          <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label className="required-field">Delivery Date</label>
          <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} required />
        </div>

        {(userLocation || distance) && (
          <div className="distance-display">
            <h3>Delivery Information</h3>
            {distance && <p><strong>Estimated Distance:</strong> {distance} km</p>}
            {isTracking && <p><strong>Live Location:</strong> Active</p>}
            
            {userLocation && (
              <div className="map-container">
                <MapContainer 
                  center={userLocation} 
                  zoom={13} 
                  style={{ height: '300px', width: '100%' }}
                  ref={mapRef}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Live Location Marker */}
                  <Marker position={userLocation} icon={liveLocationIcon}>
                    <Popup>
                      <strong>Your Live Location</strong><br />
                      Lat: {userLocation.lat.toFixed(6)}<br />
                      Lng: {userLocation.lng.toFixed(6)}
                    </Popup>
                  </Marker>
                  
                  {/* Customer Location Marker */}
                  {customerCoords && (
                    <Marker position={customerCoords}>
                      <Popup>Customer Location</Popup>
                    </Marker>
                  )}
                  
                  {/* Route Line */}
                  {route && <Polyline positions={route} color="blue" />}
                </MapContainer>
              </div>
            )}
          </div>
        )}

        <div className="button-group">
          <button type="submit" className="submit-button">Create Delivery</button>
          <button type="button" onClick={handleClear} className="clear-button">Clear Form</button>
        </div>
      </form>
    </div>
  );
}