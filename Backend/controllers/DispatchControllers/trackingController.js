// controllers/trackingController.js
const Tracking = require("../../models/DispatchModels/Tracking");
const gpsTracker = require("../../utils/gpsTracker");
const websocketServer = require("../../websocket");
const { simulateGPSUpdate } = require("../../utils/gpsTracker");

// Start tracking delivery
const startTrackingDelivery = async (req, res) => {
    try {
        const { deliveryId, driverId, vehicleId } = req.body;
        
        if (!deliveryId || !driverId) {
            return res.status(400).json({ 
                success: false, 
                message: "Delivery ID and Driver ID are required" 
            });
        }

        // Start GPS tracking
        const result = await gpsTracker.startTracking(deliveryId, driverId, vehicleId);
        
        if (result.success) {
            res.status(200).json({ 
                success: true,
                message: "Tracking started", 
                data: {
                    deliveryId,
                    driverId,
                    vehicleId,
                    trackingData: result.trackingData,
                    startedAt: new Date().toISOString()
                }
            });
        } else {
            res.status(400).json({ 
                success: false,
                message: result.error 
            });
        }
    } catch (err) {
        console.error("Error starting tracking:", err);
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
};

// Stop tracking delivery
const stopTrackingDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        
        if (!deliveryId) {
            return res.status(400).json({ 
                success: false, 
                message: "Delivery ID is required" 
            });
        }

        const result = await gpsTracker.stopTracking(deliveryId);
        
        if (result.success) {
            // Notify subscribers that tracking has stopped
            websocketServer.broadcastToDelivery(deliveryId, {
                type: "tracking_stopped",
                deliveryId,
                timestamp: new Date().toISOString()
            });
            
            res.status(200).json({ 
                success: true,
                message: "Tracking stopped" 
            });
        } else {
            res.status(404).json({ 
                success: false,
                message: result.error 
            });
        }
    } catch (err) {
        console.error("Error stopping tracking:", err);
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
};

// Add a new tracking update
const addTrackingUpdate = async (req, res) => {
    try {
        const { deliveryId, driverId, vehicleId, latitude, longitude, speed, status } = req.body;

        if (!deliveryId || !driverId || !latitude || !longitude) {
            return res.status(400).json({ 
                success: false,
                message: "Missing required fields: deliveryId, driverId, latitude, longitude" 
            });
        }

        const tracking = new Tracking({
            delivery: deliveryId,
            driver: driverId,
            vehicle: vehicleId,
            location: { latitude, longitude },
            speed: speed || 0,
            status: status || 'in_transit',
            updatedAt: new Date(),
        });

        await tracking.save();
        
        // Broadcast real-time update via WebSocket
        const locationData = {
            deliveryId,
            driverId,
            location: { lat: latitude, lng: longitude },
            speed,
            status,
            timestamp: new Date().toISOString()
        };
        
        websocketServer.broadcastLocationUpdate(deliveryId, locationData);
        
        res.status(201).json({ 
            success: true,
            message: "Tracking update added", 
            data: tracking 
        });
    } catch (err) {
        console.error("Error adding tracking update:", err);
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
};

// Get all tracking updates for a delivery
const getTrackingByDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        
        if (!deliveryId) {
            return res.status(400).json({ 
                success: false, 
                message: "Delivery ID is required" 
            });
        }

        const trackingUpdates = await Tracking.find({ delivery: deliveryId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: trackingUpdates,
            count: trackingUpdates.length
        });
    } catch (err) {
        console.error("Error fetching tracking updates:", err);
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
};

// Get the latest tracking update for a delivery
const getLatestTrackingByDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        
        if (!deliveryId) {
            return res.status(400).json({ 
                success: false, 
                message: "Delivery ID is required" 
            });
        }

        const latestTracking = await Tracking.findOne({ delivery: deliveryId })
            .sort({ createdAt: -1 });

        if (!latestTracking) {
            return res.status(404).json({ 
                success: false,
                message: "No tracking data found for this delivery" 
            });
        }

        res.json({
            success: true,
            data: latestTracking
        });
    } catch (err) {
        console.error("Error fetching latest tracking:", err);
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
};

// Start simulated tracking
const startSimulatedTracking = (req, res) => {
    try {
        const { deliveryId, driverId, vehicleId } = req.body;
        
        if (!deliveryId || !driverId) {
            return res.status(400).json({ 
                success: false, 
                message: "Delivery ID and Driver ID are required" 
            });
        }

        // Start GPS simulation
        simulateGPSUpdate(deliveryId, driverId, vehicleId);
        
        res.json({
            success: true,
            message: "Simulated tracking started",
            data: {
                deliveryId,
                driverId,
                vehicleId,
                startedAt: new Date().toISOString(),
                isSimulated: true
            }
        });
    } catch (error) {
        console.error("Error starting simulated tracking:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get tracking status
const getTrackingStatus = (req, res) => {
    try {
        const { deliveryId } = req.params;
        
        if (!deliveryId) {
            return res.status(400).json({ 
                success: false, 
                message: "Delivery ID is required" 
            });
        }

        const stats = websocketServer.getActiveConnections();
        const isBeingTracked = stats.deliverySubscriptions[deliveryId] > 0;
        
        res.json({
            success: true,
            data: {
                deliveryId,
                isBeingTracked,
                activeSubscribers: stats.deliverySubscriptions[deliveryId] || 0,
                totalConnections: stats.totalConnections,
                ...stats
            }
        });
    } catch (error) {
        console.error("Error getting tracking status:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
    try {
        const { deliveryId, status, driverId, notes } = req.body;
        
        if (!deliveryId || !status) {
            return res.status(400).json({ 
                success: false, 
                message: "Delivery ID and status are required" 
            });
        }

        // Update the latest tracking record with new status
        await Tracking.findOneAndUpdate(
            { delivery: deliveryId },
            { 
                status,
                notes,
                updatedAt: new Date()
            },
            { sort: { createdAt: -1 }, new: true }
        );

        // Broadcast status update via WebSocket
        websocketServer.broadcastToDelivery(deliveryId, {
            type: "status_update",
            deliveryId,
            driverId,
            status,
            notes,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            success: true,
            message: "Status updated successfully",
            data: {
                deliveryId,
                status,
                driverId,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("Error updating delivery status:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get tracking history with pagination
const getTrackingHistory = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        if (!deliveryId) {
            return res.status(400).json({ 
                success: false, 
                message: "Delivery ID is required" 
            });
        }

        const [trackingUpdates, totalCount] = await Promise.all([
            Tracking.find({ delivery: deliveryId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Tracking.countDocuments({ delivery: deliveryId })
        ]);

        res.json({
            success: true,
            data: trackingUpdates,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNext: page < Math.ceil(totalCount / limit),
                hasPrev: page > 1
            }
        });
    } catch (err) {
        console.error("Error fetching tracking history:", err);
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
};

module.exports = {
    startTrackingDelivery,
    stopTrackingDelivery,
    addTrackingUpdate,
    getTrackingByDelivery,
    getLatestTrackingByDelivery,
    startSimulatedTracking,
    getTrackingStatus,
    updateDeliveryStatus,
    getTrackingHistory
};