// src/components/GpsTracking.js
import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

// Google Maps container style
const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = { lat: 6.9271, lng: 79.8612 };

export default function GpsTracking() {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [vehicleLocation, setVehicleLocation] = useState(defaultCenter);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(null);

  // Replace with your actual Google Maps API key
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/deliveries`);
        setDeliveries(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching deliveries:", err);
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Filter ONLY ongoing deliveries for the dropdown (remove Assigned status)
  const ongoingDeliveries = deliveries.filter(delivery => 
    delivery.status === 'Ongoing' || delivery.status === 'ongoing' ||
    delivery.status === 'In Progress' || delivery.status === 'in progress'
  );

  const handleDeliverySelect = (deliveryId) => {
    const delivery = deliveries.find(d => d._id === deliveryId);
    setSelectedDelivery(delivery);
    
    // Simulate tracking - in a real app, this would come from a GPS device
    if (delivery) {
      const mockLocation = {
        lat: 6.9271 + (Math.random() - 0.5) * 0.1,
        lng: 79.8612 + (Math.random() - 0.5) * 0.1,
      };
      setVehicleLocation(mockLocation);
      
      // Start simulating movement for the selected delivery
      const interval = setInterval(() => {
        setVehicleLocation(prevLocation => ({
          lat: prevLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: prevLocation.lng + (Math.random() - 0.5) * 0.001,
        }));
      }, 3000);
      
      // Cleanup interval when component unmounts or delivery changes
      return () => clearInterval(interval);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Live GPS Tracking</h2>
        <p>Loading delivery data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: 'Arial, sans-serif' }}>
      <h2>Live GPS Tracking</h2>
      
      {loadError && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          Error loading Google Maps. Please check your API key.
        </div>
      )}
      
      {mapError && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          {mapError}
        </div>
      )}
      
      {deliveries.length > 0 ? (
        <>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="delivery-select" style={{ fontWeight: 'bold' }}>Select Delivery to Track: </label>
            <select
              id="delivery-select"
              value={selectedDelivery?._id || ""}
              onChange={(e) => handleDeliverySelect(e.target.value)}
              style={{ padding: "8px", marginLeft: "10px", borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">Choose a delivery</option>
              {ongoingDeliveries.length > 0 ? (
                ongoingDeliveries.map(delivery => (
                  <option key={delivery._id} value={delivery._id}>
                    #{delivery.orderId} - {delivery.customerName} ({delivery.status})
                  </option>
                ))
              ) : (
                <option value="" disabled>No ongoing deliveries available</option>
              )}
            </select>
          </div>

          {selectedDelivery ? (
            <>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3>Delivery Details</h3>
                <p><strong>Order ID:</strong> #{selectedDelivery.orderId}</p>
                <p><strong>Customer:</strong> {selectedDelivery.customerName}</p>
                <p><strong>Address:</strong> {selectedDelivery.address}</p>
                <p>
                  <strong>Status:</strong> 
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    backgroundColor: selectedDelivery.status === 'Completed' ? '#c6f6d5' : 
                                    selectedDelivery.status === 'Ongoing' ? '#fed7d7' : '#e9ecef',
                    color: selectedDelivery.status === 'Completed' ? '#22543d' : 
                          selectedDelivery.status === 'Ongoing' ? '#742a2a' : '#495057',
                    fontSize: '14px',
                    marginLeft: '10px'
                  }}>
                    {selectedDelivery.status}
                  </span>
                </p>
                {selectedDelivery.driver && (
                  <p>
                    <strong>Driver:</strong> {typeof selectedDelivery.driver === 'object' ? selectedDelivery.driver.name : 'Assigned'}
                  </p>
                )}
                {selectedDelivery.vehicle && (
                  <p>
                    <strong>Vehicle:</strong> {typeof selectedDelivery.vehicle === 'object' ? selectedDelivery.vehicle.vehicleNumber : 'Assigned'}
                  </p>
                )}
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '15px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <h3>Live Location</h3>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={vehicleLocation}
                    zoom={13}
                    onError={() => setMapError("Failed to load Google Maps. Please check your API key.")}
                  >
                    <Marker 
                      position={vehicleLocation} 
                      label={`Delivery #${selectedDelivery.orderId}`}
                    />
                  </GoogleMap>
                ) : (
                  <div style={{ 
                    height: '400px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px'
                  }}>
                    <p>Loading map...</p>
                  </div>
                )}
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#6c757d' }}>
                  <p>Latitude: {vehicleLocation.lat.toFixed(6)}, Longitude: {vehicleLocation.lng.toFixed(6)}</p>
                  <p><em>Note: This is simulated tracking data. In a real application, this would come from GPS devices.</em></p>
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              backgroundColor: '#e9ecef', 
              padding: '20px', 
              borderRadius: '8px', 
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {ongoingDeliveries.length > 0 ? (
                <p>Please select a delivery to track</p>
              ) : (
                <p>No ongoing deliveries available for tracking</p>
              )}
              <p><em>Only ongoing deliveries are shown in the dropdown</em></p>
            </div>
          )}
        </>
      ) : (
        <div style={{ 
          backgroundColor: '#e9ecef', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p>No deliveries found for tracking</p>
        </div>
      )}
    </div>
  );
}