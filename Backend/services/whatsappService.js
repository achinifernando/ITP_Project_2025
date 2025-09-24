// // services/whatsappService.js
// const { Client, LocalAuth } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');
// const fs = require('fs');
// const path = require('path');
// const { exec } = require('child_process');

// class WhatsAppService {
//   constructor() {
//     // Define the session path
//     this.sessionPath = path.join(__dirname, '../.wwebjs_auth');
//     this.isInitializing = false;
//     this.isConnected = false;
//     this.client = null;
    
//     this.initializeClient();
//   }

//   initializeClient() {
//     try {
//       this.client = new Client({
//         authStrategy: new LocalAuth({
//           clientId: "delivery-app-client",
//           dataPath: this.sessionPath
//         }),
//         puppeteer: {
//           headless: true,
//           args: [
//             '--no-sandbox', 
//             '--disable-setuid-sandbox',
//             '--disable-dev-shm-usage',
//             '--disable-accelerated-2d-canvas',
//             '--no-first-run',
//             '--no-zygote',
//             '--single-process',
//             '--disable-gpu',
//             '--no-default-browser-check',
//             '--disable-extensions',
//             '--disable-default-apps',
//             '--window-size=1280,720'
//           ],
//           timeout: 60000,
//           protocolTimeout: 60000
//         },
//         takeoverOnConflict: true,
//         takeoverTimeoutMs: 5000,
//         restartOnAuthFail: true
//       });

//       this.initializeEvents();
//     } catch (error) {
//       console.error('Error creating WhatsApp client:', error.message);
//     }
//   }

//   initializeEvents() {
//     if (!this.client) return;

//     this.client.on('qr', (qr) => {
//       console.log('QR RECEIVED: Scan this QR code with your WhatsApp app');
//       qrcode.generate(qr, { small: true });
//       this.saveQrToFile(qr);
//     });

//     this.client.on('ready', () => {
//       console.log('WhatsApp Client is ready!');
//       this.isInitializing = false;
//       this.isConnected = true;
//     });

//     this.client.on('authenticated', () => {
//       console.log('WhatsApp Client authenticated!');
//     });

//     this.client.on('auth_failure', (msg) => {
//       console.error('Authentication failed:', msg);
//       this.isInitializing = false;
//       this.isConnected = false;
//     });

//     this.client.on('disconnected', (reason) => {
//       console.log('Client was disconnected:', reason);
//       this.isInitializing = false;
//       this.isConnected = false;
//       this.cleanupLockedFiles();
      
//       // Auto-restart after disconnect
//       setTimeout(() => {
//         this.restartClient();
//       }, 5000);
//     });

//     this.client.on('loading_screen', (percent, message) => {
//       console.log(`Loading: ${percent}% - ${message}`);
//     });
//   }

//   // Save QR code to an HTML file for easier scanning
//   saveQrToFile(qr) {
//     try {
//       const htmlContent = `
// <!DOCTYPE html>
// <html>
// <head>
//     <title>WhatsApp QR Code</title>
//     <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
//     <style>
//         body { 
//             font-family: Arial, sans-serif; 
//             text-align: center; 
//             padding: 20px;
//             background-color: #f0f0f0;
//         }
//         .container { 
//             background: white; 
//             padding: 20px; 
//             border-radius: 10px; 
//             box-shadow: 0 2px 10px rgba(0,0,0,0.1);
//             max-width: 400px;
//             margin: 0 auto;
//         }
//         h2 { color: #25D366; }
//         #qrcode { margin: 20px 0; }
//         .instructions { 
//             text-align: left; 
//             margin-top: 20px;
//             background: #f9f9f9;
//             padding: 15px;
//             border-radius: 5px;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <h2>Scan WhatsApp QR Code</h2>
//         <div id="qrcode"></div>
//         <p>Scan this code with WhatsApp → Linked Devices</p>
        
//         <div class="instructions">
//             <h3>How to scan:</h3>
//             <ol>
//                 <li>Open WhatsApp on your phone</li>
//                 <li>Tap Menu → Linked devices</li>
//                 <li>Tap "Link a device"</li>
//                 <li>Point your camera at this code</li>
//             </ol>
//         </div>
//     </div>

//     <script>
//         // Generate QR code
//         QRCode.toCanvas(document.getElementById('qrcode'), '${qr}', {
//             width: 250,
//             margin: 1,
//             color: {
//                 dark: '#25D366',
//                 light: '#ffffff'
//             }
//         }, function(error) {
//             if (error) console.error(error);
//         });
//     </script>
// </body>
// </html>
//       `;

//       fs.writeFileSync(path.join(__dirname, '../whatsapp_qr.html'), htmlContent);
//       console.log('QR code also saved to: whatsapp_qr.html');
//     } catch (error) {
//       console.log('Error saving QR file:', error.message);
//     }
//   }

//   // Clean up locked files
//   cleanupLockedFiles() {
//     try {
//       // Kill any Chrome processes that might be lingering
//       if (process.platform === 'win32') {
//         exec('taskkill /f /im chrome.exe', () => {});
//         exec('taskkill /f /im chromedriver.exe', () => {});
//       } else {
//         exec('pkill -f chrome', () => {});
//         exec('pkill -f chromedriver', () => {});
//       }

//       // Try to remove locked files after a delay
//       setTimeout(() => {
//         try {
//           const chromeDebugLog = path.join(this.sessionPath, 'session-delivery-app-client', 'Default', 'chrome_debug.log');
//           if (fs.existsSync(chromeDebugLog)) {
//             fs.unlinkSync(chromeDebugLog);
//           }
//         } catch (e) {
//           // Ignore errors during cleanup
//         }
//       }, 1000);
//     } catch (error) {
//       console.log('Cleanup error:', error.message);
//     }
//   }

//   // Initialize the WhatsApp client
//   initialize() {
//     if (this.isInitializing) {
//       console.log('WhatsApp client is already initializing...');
//       return;
//     }
    
//     this.isInitializing = true;
//     this.cleanupLockedFiles();
    
//     setTimeout(() => {
//       try {
//         if (this.client) {
//           this.client.initialize().catch(error => {
//             console.error('Error during initialization:', error.message);
//             this.isInitializing = false;
            
//             // Try to restart on initialization error
//             setTimeout(() => {
//               this.restartClient();
//             }, 3000);
//           });
//         } else {
//           this.initializeClient();
//           this.client.initialize().catch(error => {
//             console.error('Error during initialization:', error.message);
//             this.isInitializing = false;
//           });
//         }
//       } catch (error) {
//         console.error('Error initializing WhatsApp client:', error.message);
//         this.isInitializing = false;
//       }
//     }, 1000);
//   }

//   // Restart client completely
//   async restartClient() {
//     console.log('Restarting WhatsApp client...');
    
//     try {
//       // Destroy current client if it exists
//       if (this.client) {
//         try {
//           await this.client.destroy();
//         } catch (destroyError) {
//           console.log('Error during client destruction:', destroyError.message);
//         }
//       }
      
//       // Clean up
//       this.cleanupLockedFiles();
      
//       // Wait a bit
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // Create new client
//       this.initializeClient();
      
//       // Initialize with delay
//       setTimeout(() => {
//         this.initialize();
//       }, 1000);
      
//       return { success: true, message: 'Client restarted' };
//     } catch (error) {
//       console.error('Error restarting client:', error.message);
//       return { success: false, error: error.message };
//     }
//   }

//   // Method to force a new QR code
//   async forceNewQR() {
//     if (this.isInitializing) {
//       return { success: false, error: 'Client is already initializing' };
//     }
    
//     console.log('Forcing new QR code generation...');
//     return await this.restartClient();
//   }

//   // Safe message sending with error handling
//   async sendMessage(phone, message) {
//     if (!this.isConnected || !this.client) {
//       return { 
//         success: false, 
//         error: 'WhatsApp client is not connected. Please check if QR code is scanned.' 
//       };
//     }

//     try {
//       const formattedPhone = this.formatPhoneNumber(phone);
      
//       // Check if the number is registered on WhatsApp
//       const isRegistered = await this.client.isRegisteredUser(formattedPhone);
      
//       if (!isRegistered) {
//         console.log(`Phone number ${phone} is not registered on WhatsApp`);
//         return { success: false, error: 'Phone number not registered on WhatsApp' };
//       }

//       // Send the message with timeout
//       const result = await Promise.race([
//         this.client.sendMessage(formattedPhone, message),
//         new Promise((_, reject) => 
//           setTimeout(() => reject(new Error('Message sending timeout')), 30000)
//         )
//       ]);
      
//       console.log(`WhatsApp message sent to ${phone}`);
//       return { success: true, messageId: result.id._serialized };
//     } catch (error) {
//       console.error('Error sending WhatsApp message:', error.message);
      
//       // If it's a protocol error, restart the client
//       if (error.message.includes('Protocol error') || error.message.includes('Execution context was destroyed')) {
//         console.log('Protocol error detected, restarting client...');
//         setTimeout(() => {
//           this.restartClient();
//         }, 2000);
//       }
      
//       return { success: false, error: error.message };
//     }
//   }

//   // Format phone number to WhatsApp format
//   formatPhoneNumber(phone) {
//     // Remove any non-digit characters
//     let cleaned = phone.replace(/\D/g, '');
    
//     // If number starts with 0, replace with country code (Sri Lanka: 94)
//     if (cleaned.startsWith('0')) {
//       cleaned = '94' + cleaned.substring(1);
//     }
    
//     // Add @c.us suffix for WhatsApp
//     return cleaned + '@c.us';
//   }

//   // Send delivery assignment message to driver
//   async sendAssignmentMessage(driverPhone, deliveryDetails) {
//     const message = `🚚 *New Delivery Assignment* 🚚

// You have been assigned to a new delivery:

// *Order ID:* ${deliveryDetails.orderId}
// *Customer:* ${deliveryDetails.customerName}
// *Address:* ${deliveryDetails.address}
// *Contact:* ${deliveryDetails.contactPhone}
// *Vehicle:* ${deliveryDetails.vehicleNumber}

// Please check the delivery app for more details and navigate to the pickup location.

// Thank you!`;

//     return await this.sendMessage(driverPhone, message);
//   }

//   // Send delivery status update
//   async sendStatusUpdate(driverPhone, orderId, status) {
//     const statusMessages = {
//       'Ongoing': `📦 Delivery #${orderId} is now ongoing. Please proceed to the destination.`,
//       'Completed': `✅ Delivery #${orderId} has been completed successfully. Thank you!`,
//       'Cancelled': `❌ Delivery #${orderId} has been cancelled. Please check the app for details.`
//     };

//     const message = statusMessages[status] || `ℹ️ Delivery #${orderId} status updated to: ${status}`;
//     return await this.sendMessage(driverPhone, message);
//   }

//   // Get connection status
//   getStatus() {
//     return {
//       isConnected: this.isConnected,
//       isInitializing: this.isInitializing,
//       hasClient: !!this.client
//     };
//   }
// }

// // Create a singleton instance
// const whatsappService = new WhatsAppService();
// module.exports = whatsappService;