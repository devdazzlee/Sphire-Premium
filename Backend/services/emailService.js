import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: 'Backend/config.env' });

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'ahmedrazagithub@gmail.com',
    pass: process.env.EMAIL_PASS || 'qcej fapb rjem dxxa' // You'll need to set this
  }
});

// Email templates
const orderConfirmationTemplate = (order, user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Luxury Beauty</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
            .content { padding: 20px; }
            .order-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .total { font-weight: bold; font-size: 18px; color: #2c3e50; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Order Confirmed!</h1>
                <p>Thank you for your purchase, ${user.name}!</p>
            </div>
            
            <div class="content">
                <h2>Order Details</h2>
                <div class="order-details">
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Payment Method:</strong> Cash on Delivery</p>
                    <p><strong>Status:</strong> ${order.orderStatus}</p>
                </div>

                <h3>Items Ordered:</h3>
                ${order.items.map(item => `
                    <div class="item">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>PKR ${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}

                <div class="total">
                    <p>Total: PKR ${order.total.toFixed(2)}</p>
                </div>

                <h3>Shipping Address:</h3>
                <div class="order-details">
                    <p>${order.shippingAddress.street}</p>
                    <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
                    <p>${order.shippingAddress.country}</p>
                </div>

                <p>We'll send you another email when your order ships!</p>
            </div>
            
            <div class="footer">
                <p>Luxury Beauty Store</p>
                <p>Thank you for choosing us!</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const adminNotificationTemplate = (order, user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Order - Luxury Beauty Admin</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px; }
            .content { padding: 20px; }
            .order-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .total { font-weight: bold; font-size: 18px; color: #2c3e50; }
            .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 New Order Received!</h1>
                <p>Order #${order.orderNumber}</p>
            </div>
            
            <div class="content">
                <div class="urgent">
                    <strong>Action Required:</strong> Process this order and prepare for shipping.
                </div>

                <h2>Customer Information</h2>
                <div class="order-details">
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
                </div>

                <h2>Order Details</h2>
                <div class="order-details">
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Payment Method:</strong> Cash on Delivery</p>
                    <p><strong>Status:</strong> ${order.orderStatus}</p>
                </div>

                <h3>Items Ordered:</h3>
                ${order.items.map(item => `
                    <div class="item">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>PKR ${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}

                <div class="total">
                    <p>Total: PKR ${order.total.toFixed(2)}</p>
                </div>

                <h3>Shipping Address:</h3>
                <div class="order-details">
                    <p>${order.shippingAddress.street}</p>
                    <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
                    <p>${order.shippingAddress.country}</p>
                </div>

                <p><strong>Next Steps:</strong></p>
                <ul>
                    <li>Confirm the order in the admin dashboard</li>
                    <li>Prepare items for shipping</li>
                    <li>Update order status when shipped</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send order confirmation email to customer
export const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'ahmedrazagithub@gmail.com',
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: orderConfirmationTemplate(order, user)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send notification email to admin
export const sendAdminNotificationEmail = async (order, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'ahmedrazagithub@gmail.com',
      to: 'ahmedrazagithub@gmail.com',
      subject: `New Order Alert - ${order.orderNumber}`,
      html: adminNotificationTemplate(order, user)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return { success: false, error: error.message };
  }
};

// Send order status update email
export const sendOrderStatusUpdateEmail = async (order, user, newStatus) => {
  try {
    const statusMessages = {
      'confirmed': 'Your order has been confirmed and is being prepared for shipping.',
      'processing': 'Your order is being processed and will ship soon.',
      'shipped': 'Your order has been shipped! Track your package with the tracking number provided.',
      'delivered': 'Your order has been delivered! Thank you for your purchase.',
      'cancelled': 'Your order has been cancelled. If you have any questions, please contact us.'
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || 'ahmedrazagithub@gmail.com',
      to: user.email,
      subject: `Order Update - ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Order Update - Luxury Beauty</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
                .content { padding: 20px; }
                .status { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📦 Order Update</h1>
                </div>
                
                <div class="content">
                    <h2>Hello ${user.name},</h2>
                    
                    <div class="status">
                        <h3>Order Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</h3>
                        <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
                    </div>

                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
                    
                    <p>Thank you for choosing Luxury Beauty!</p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending order status update email:', error);
    return { success: false, error: error.message };
  }
};

// Newsletter welcome email template
const newsletterWelcomeTemplate = (email) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Welcome to Sphire Premium Newsletter</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .content h2 { color: #333; font-size: 22px; margin-bottom: 15px; }
            .content p { margin-bottom: 15px; line-height: 1.8; }
            .benefits { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .benefits ul { margin: 10px 0; padding-left: 20px; }
            .benefits li { margin: 8px 0; }
            .cta-button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .social-icons { margin: 20px 0; }
            .social-icons a { display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Sphire Premium!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for subscribing to our newsletter</p>
            </div>
            
            <div class="content">
                <h2>Hello Beauty Enthusiast! 💄</h2>
                
                <p>We're thrilled to have you join our exclusive community! You've just taken the first step towards staying updated with the latest in premium beauty and skincare.</p>
                
                <div class="benefits">
                    <h3 style="margin-top: 0;">What You'll Receive:</h3>
                    <ul>
                        <li>✨ Exclusive early access to new product launches</li>
                        <li>💰 Special subscriber-only discounts and promotions</li>
                        <li>📚 Expert beauty tips and skincare advice</li>
                        <li>🎁 Birthday surprises and seasonal offers</li>
                        <li>📦 First look at limited edition collections</li>
                    </ul>
                </div>

                <p>As a welcome gift, use code <strong style="background: #fff3cd; padding: 5px 10px; border-radius: 3px;">WELCOME10</strong> for 10% off your first order!</p>

                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="cta-button">Start Shopping</a>
                </div>

                <p style="margin-top: 30px;">Follow us on social media to stay connected:</p>
                <div class="social-icons">
                    <a href="#">Facebook</a> | 
                    <a href="#">Instagram</a> | 
                    <a href="#">Twitter</a>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Sphire Premium</strong></p>
                <p>Premium Beauty & Skincare</p>
                <p style="margin-top: 15px; font-size: 12px;">
                    Not interested anymore? <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe?email=${email}" style="color: #667eea;">Unsubscribe</a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Newsletter broadcast template
const newsletterBroadcastTemplate = (subject, content, htmlContent) => {
  return htmlContent || `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 40px 30px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${subject}</h1>
            </div>
            
            <div class="content">
                ${content}
            </div>
            
            <div class="footer">
                <p><strong>Sphire Premium</strong></p>
                <p>Premium Beauty & Skincare</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send newsletter welcome email
export const sendNewsletterWelcome = async (email) => {
  try {
    const mailOptions = {
      from: `Sphire Premium <${process.env.EMAIL_USER || 'ahmedrazagithub@gmail.com'}>`,
      to: email,
      subject: '🎉 Welcome to Sphire Premium Newsletter!',
      html: newsletterWelcomeTemplate(email)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Newsletter welcome email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending newsletter welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send bulk newsletter to subscribers
export const sendBulkNewsletter = async (emails, subject, content, htmlContent) => {
  try {
    const mailOptions = {
      from: `Sphire Premium <${process.env.EMAIL_USER || 'ahmedrazagithub@gmail.com'}>`,
      bcc: emails, // Use BCC to hide recipients from each other
      subject: subject,
      html: newsletterBroadcastTemplate(subject, content, htmlContent)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Bulk newsletter sent to ${emails.length} subscribers:`, result.messageId);
    return { success: true, messageId: result.messageId, recipientCount: emails.length };
  } catch (error) {
    console.error('Error sending bulk newsletter:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendOrderConfirmationEmail,
  sendAdminNotificationEmail,
  sendOrderStatusUpdateEmail,
  sendNewsletterWelcome,
  sendBulkNewsletter
};
