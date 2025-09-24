// src/components/PendingDeliveriesTable.js
import React from 'react';

const PendingDeliveriesTable = ({ deliveries, onAssign }) => {
  if (deliveries.length === 0) {
    return <p className="no-data">No pending deliveries found</p>;
  }

  return (
    <div className="table-container">
      <table className="deliveries-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Address</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map(delivery => (
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
              <td>
                <button 
                  className="btn btn-primary"
                  onClick={() => onAssign(delivery)}
                >
                  Assign
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingDeliveriesTable;