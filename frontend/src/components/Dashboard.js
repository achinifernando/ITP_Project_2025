// src/components/Dashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css';

const BACKEND_URL = 'http://localhost:5001';

export default function Dashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [metrics, setMetrics] = useState({
    totalDeliveries: 0,
    todayDeliveries: 0,
    weekDeliveries: 0,
    ongoingDeliveries: 0,
    pendingDeliveries: 0,
    availableDrivers: 0,
    availableVehicles: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [deliveriesRes, driversRes, vehiclesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/deliveries`),
        axios.get(`${BACKEND_URL}/drivers`),
        axios.get(`${BACKEND_URL}/vehicles`)
      ]);

      setDeliveries(deliveriesRes.data);
      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);

      const totalDeliveries = deliveriesRes.data.length;
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayDeliveries = deliveriesRes.data.filter(d => 
        new Date(d.createdAt) >= todayStart
      ).length;

      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
      const weekDeliveries = deliveriesRes.data.filter(d => 
        new Date(d.createdAt) >= weekStart
      ).length;

      const ongoingDeliveries = deliveriesRes.data.filter(d => 
        d.status === 'Ongoing' || d.status === 'ongoing'
      ).length;

      const pendingDeliveries = deliveriesRes.data.filter(d => 
        d.status === 'Pending' || d.status === 'pending'
      ).length;
      
      const availableDrivers = driversRes.data.filter(d => d.isAvailable).length;
      const availableVehicles = vehiclesRes.data.filter(v => v.isAvailable).length;

      setMetrics({
        totalDeliveries,
        todayDeliveries,
        weekDeliveries,
        ongoingDeliveries,
        pendingDeliveries,
        availableDrivers,
        availableVehicles
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const pendingDeliveries = deliveries.filter(d => 
    d.status === 'Pending' || d.status === 'pending'
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <h2>Delivery Dashboard</h2>
        <div className="loading">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Delivery Dashboard</h2>
      
      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'tab-active' : ''}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'drivers' ? 'tab-active' : ''}
          onClick={() => handleTabChange('drivers')}
        >
          Drivers
        </button>
        <button 
          className={activeTab === 'vehicles' ? 'tab-active' : ''}
          onClick={() => handleTabChange('vehicles')}
        >
          Vehicles
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Summary Cards (KPIs) */}
          <div className="metrics-grid">
            <div className="metric-card metric-total">
              <h3>Total Deliveries</h3>
              <p className="metric-value">{metrics.totalDeliveries}</p>
            </div>
            
            <div className="metric-card metric-today">
              <h3>Today's Deliveries</h3>
              <p className="metric-value">{metrics.todayDeliveries}</p>
            </div>
            
            <div className="metric-card metric-week">
              <h3>This Week</h3>
              <p className="metric-value">{metrics.weekDeliveries}</p>
            </div>
            
            <div className="metric-card metric-pending">
              <h3>Pending Deliveries</h3>
              <p className="metric-value">{metrics.pendingDeliveries}</p>
            </div>
            
            <div className="metric-card metric-ongoing">
              <h3>Ongoing Deliveries</h3>
              <p className="metric-value">{metrics.ongoingDeliveries}</p>
            </div>
            
            <div className="metric-card metric-drivers">
              <h3>Available Drivers</h3>
              <p className="metric-value">{metrics.availableDrivers} / {drivers.length}</p>
            </div>
            
            <div className="metric-card metric-vehicles">
              <h3>Available Vehicles</h3>
              <p className="metric-value">{metrics.availableVehicles} / {vehicles.length}</p>
            </div>
          </div>

          {/* Pending Deliveries Table */}
          <div className="section">
            <h3>Pending Deliveries</h3>
            {pendingDeliveries.length > 0 ? (
              <div className="table-container">
                <table className="deliveries-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Address</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDeliveries.map(delivery => (
                      <tr key={delivery._id}>
                        <td>#{delivery.orderId}</td>
                        <td>{delivery.customerName}</td>
                        <td>{delivery.address}</td>
                        <td>{new Date(delivery.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status status-${delivery.status.toLowerCase()}`}>
                            {delivery.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No pending deliveries found</p>
            )}
          </div>
        </>
      )}

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <div className="section">
          <h3>Driver List</h3>
          {drivers.length > 0 ? (
            <div className="table-container">
              <table className="deliveries-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>License Number</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(driver => (
                    <tr key={driver._id}>
                      <td>{driver.name}</td>
                      <td>{driver.phone}</td>
                      <td>{driver.licenseNumber}</td>
                      <td>
                        <span className={`status ${driver.isAvailable ? 'status-available' : 'status-busy'}`}>
                          {driver.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No drivers found</p>
          )}
        </div>
      )}

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <div className="section">
          <h3>Vehicle List</h3>
          {vehicles.length > 0 ? (
            <div className="table-container">
              <table className="deliveries-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Plate Number</th>
                    <th>Capacity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(vehicle => (
                    <tr key={vehicle._id}>
                      <td>{vehicle.type}</td>
                      <td>{vehicle.vehicleNumber}</td>
                      <td>{vehicle.capacity}</td>
                      <td>
                        <span className={`status ${vehicle.isAvailable ? 'status-available' : 'status-busy'}`}>
                          {vehicle.isAvailable ? 'Available' : 'In Use'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No vehicles found</p>
          )}
        </div>
      )}
    </div>
  );
}