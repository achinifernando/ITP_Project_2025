// websocket.js
const WebSocket = require("ws");

// Store active WebSocket connections
const activeConnections = new Map();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ 
    server, 
    path: "/ws/tracking" 
  });

  // WebSocket Connection Handler
  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection established");

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data);
        handleWebSocketMessage(ws, message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        ws.send(JSON.stringify({ 
          type: "error", 
          message: "Invalid message format" 
        }));
      }
    });

    ws.on("close", () => {
      // Remove from active connections
      for (const [deliveryId, connections] of activeConnections.entries()) {
        const index = connections.indexOf(ws);
        if (index > -1) {
          connections.splice(index, 1);
          if (connections.length === 0) {
            activeConnections.delete(deliveryId);
          }
        }
      }
      console.log("WebSocket connection closed");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
}

// Handle WebSocket messages
function handleWebSocketMessage(ws, message) {
  const { type, deliveryId, location, driverId } = message;

  switch (type) {
    case "subscribe":
      subscribeToDelivery(ws, deliveryId);
      break;

    case "location_update":
      broadcastLocationUpdate(deliveryId, location, driverId);
      break;

    case "unsubscribe":
      unsubscribeFromDelivery(ws, deliveryId);
      break;

    default:
      ws.send(JSON.stringify({ 
        type: "error", 
        message: "Unknown message type" 
      }));
  }
}

// Subscribe to delivery tracking
function subscribeToDelivery(ws, deliveryId) {
  if (!activeConnections.has(deliveryId)) {
    activeConnections.set(deliveryId, []);
  }
  
  // Avoid duplicate subscriptions
  const connections = activeConnections.get(deliveryId);
  if (!connections.includes(ws)) {
    connections.push(ws);
  }
  
  // Send confirmation
  ws.send(JSON.stringify({
    type: "subscribed",
    deliveryId,
    message: `Now tracking delivery ${deliveryId}`
  }));

  console.log(`Client subscribed to delivery ${deliveryId}`);
}

// Unsubscribe from delivery tracking
function unsubscribeFromDelivery(ws, deliveryId) {
  const connections = activeConnections.get(deliveryId);
  if (connections) {
    const index = connections.indexOf(ws);
    if (index > -1) {
      connections.splice(index, 1);
      if (connections.length === 0) {
        activeConnections.delete(deliveryId);
      }
    }
  }

  ws.send(JSON.stringify({
    type: "unsubscribed",
    deliveryId,
    message: `Stopped tracking delivery ${deliveryId}`
  }));
}

// Broadcast location update to all subscribed clients
function broadcastLocationUpdate(deliveryId, location, driverId) {
  const connections = activeConnections.get(deliveryId);
  if (!connections) return;

  const message = JSON.stringify({
    type: "location_update",
    deliveryId,
    driverId,
    location,
    timestamp: new Date().toISOString()
  });

  // Clean up closed connections while broadcasting
  const activeConnectionsList = [];
  
  connections.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      activeConnectionsList.push(client);
    }
  });

  // Update the connections list
  if (activeConnectionsList.length > 0) {
    activeConnections.set(deliveryId, activeConnectionsList);
  } else {
    activeConnections.delete(deliveryId);
  }
}

// Get active connections (for monitoring/debugging)
function getActiveConnections() {
  const stats = {
    totalDeliveryRooms: activeConnections.size,
    deliverySubscriptions: {}
  };

  for (const [deliveryId, connections] of activeConnections.entries()) {
    stats.deliverySubscriptions[deliveryId] = connections.length;
  }

  return stats;
}

// Broadcast to specific delivery
function broadcastToDelivery(deliveryId, message) {
  const connections = activeConnections.get(deliveryId);
  if (!connections) return;

  const messageString = JSON.stringify({
    ...message,
    timestamp: new Date().toISOString()
  });

  const activeConnectionsList = [];
  
  connections.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
      activeConnectionsList.push(client);
    }
  });

  // Update connections
  if (activeConnectionsList.length > 0) {
    activeConnections.set(deliveryId, activeConnectionsList);
  } else {
    activeConnections.delete(deliveryId);
  }
}

module.exports = {
  setupWebSocket,
  broadcastLocationUpdate,
  broadcastToDelivery,
  getActiveConnections,
  activeConnections
};