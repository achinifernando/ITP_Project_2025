module.exports = (order) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: red;">Payment Failed ❌</h2>
    <p>Hello <b>${order.userName}</b>,</p>
    <p>Unfortunately, your payment for <b>Order #${order._id}</b> was not successful.</p>
    <p>Please try again or contact our support team.</p>
    <hr />
    <p style="font-size: 12px; color: gray;">This is an automated message, please do not reply.</p>
  </div>
`;
