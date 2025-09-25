module.exports = (order) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: green;">Payment Successful 🎉</h2>
    <p>Hello <b>${order.userName}</b>,</p>
    <p>Your payment for <b>Order #${order._id}</b> was successful.</p>
    <p>Thank you for choosing <b>${order.companyName || "our service"}</b>!</p>
    <hr />
    <p style="font-size: 12px; color: gray;">This is an automated message, please do not reply.</p>
  </div>
`;
