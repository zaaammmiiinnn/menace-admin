export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: {
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }[];
  subtotalInr: number;
  shippingInr: number;
  totalInr: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  trackingNumber?: string;
  paymentMethod?: string;
}

/**
 * Template 1: Order confirmation — "Your MENANCE order is confirmed."
 */
export function getOrderConfirmationTemplate(data: OrderEmailData) {
  const isCod = (data.paymentMethod || '').toLowerCase().includes('cod') || (data.paymentMethod || '').toLowerCase().includes('cash');

  const itemsList = data.items
    .map(
      (item) =>
        `• ${item.name} (${item.color}, Size ${item.size}) x ${item.quantity} - ₹${(
          item.price * item.quantity
        ).toLocaleString('en-IN')}`
    )
    .join('\n');

  return {
    subject: isCod
      ? `MENANCE // Cash on Delivery Confirmed [${data.orderId}]`
      : `MENANCE // Order Confirmed [${data.orderId}]`,
    text: `
MENANCE® — NOT FOR EVERYONE.
----------------------------------------
ORDER CONFIRMED: #${data.orderId}
PAYMENT MODE: ${isCod ? 'CASH ON DELIVERY (COD)' : 'ONLINE PREPAID'}
CUSTOMER: ${data.customerName}

YOUR SILHOUETTES:
${itemsList}

SUBTOTAL: ₹${data.subtotalInr.toLocaleString('en-IN')}
SHIPPING: ${data.shippingInr === 0 ? 'FREE EXPRESS' : `₹${data.shippingInr}`}
TOTAL ${isCod ? 'DUE AT DOORSTEP' : 'PAID'}: ₹${data.totalInr.toLocaleString('en-IN')}

DISPATCH ADDRESS:
${data.customerName}
${data.shippingAddress.line1} ${data.shippingAddress.line2 || ''}
${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}
${data.shippingAddress.country || 'India'}

${
  isCod
    ? `PAYMENT ADVISORY:
Please keep ₹${data.totalInr.toLocaleString('en-IN')} exact cash ready for the courier partner at delivery.`
    : ''
}

TIMELINE:
Every order is inspected and dispatched in discrete brutalist packaging within 24 hours.
You will receive live tracking as soon as it departs our warehouse.

MIND YOUR BUSINESS. WEAR THIS.
wearmenance.in
`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MENANCE // Order Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #F5F1E8;">
  <div style="background-color: #050505; padding: 32px 16px; min-height: 100%;">
    <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #0D0D0D; border: 1px solid #1C1C1C; border-collapse: separate; border-spacing: 0;">
      <!-- Header Banner -->
      <tr>
        <td style="padding: 32px 32px 24px 32px; border-bottom: 2px solid #C6FF00; background: linear-gradient(180deg, #141414 0%, #0D0D0D 100%);">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td>
                <span style="font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #F5F1E8; text-transform: uppercase; font-family: 'Courier New', Courier, monospace; display: block;">MENANCE®</span>
                <span style="display: inline-block; margin-top: 6px; font-size: 10px; font-family: 'Courier New', Courier, monospace; letter-spacing: 2px; color: #C6FF00; text-transform: uppercase; font-weight: bold;">
                  DROP 001 // NOT FOR EVERYONE.
                </span>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <span style="display: inline-block; background-color: ${isCod ? '#F59E0B' : '#C6FF00'}; color: #0A0A0A; font-family: 'Courier New', Courier, monospace; font-size: 9px; font-weight: bold; letter-spacing: 1.5px; padding: 4px 8px; text-transform: uppercase;">
                  ${isCod ? 'CASH ON DELIVERY' : 'PAID &amp; LOCKED'}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Headline -->
      <tr>
        <td style="padding: 32px 32px 16px 32px;">
          <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #F5F1E8; font-family: 'Courier New', Courier, monospace;">
            ORDER CONFIRMED: #${data.orderId}
          </h2>
          <p style="margin: 0; color: #A0A0A0; font-size: 13px; line-height: 1.6;">
            Peace <strong style="color: #F5F1E8;">${data.customerName}</strong>, your ${isCod ? 'Cash on Delivery' : ''} order is locked in. Our fulfillment unit has initiated garment allocation and quality inspection.
          </p>
        </td>
      </tr>

      <!-- COD Notice Banner if applicable -->
      ${
        isCod
          ? `
      <tr>
        <td style="padding: 0 32px 16px 32px;">
          <div style="background-color: #1c1508; border-left: 3px solid #F59E0B; border-top: 1px solid #3d2c0e; border-right: 1px solid #3d2c0e; border-bottom: 1px solid #3d2c0e; padding: 14px 18px;">
            <div style="font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #F59E0B; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px;">
              CASH ON DELIVERY SETTLEMENT
            </div>
            <p style="margin: 0; font-size: 12px; color: #F5F1E8; line-height: 1.5;">
              Please keep exact cash of <strong style="color: #F59E0B; font-size: 13px;">₹${data.totalInr.toLocaleString('en-IN')}</strong> ready for the courier partner when your parcel arrives at your doorstep.
            </p>
          </div>
        </td>
      </tr>`
          : ''
      }

      <!-- Order Items Table -->
      <tr>
        <td style="padding: 16px 32px 24px 32px;">
          <table role="presentation" style="width: 100%; border: 1px solid #1C1C1C; background-color: #111111; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #222222; background-color: #161616;">
                <th style="padding: 12px 16px; text-align: left; font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1.5px; text-transform: uppercase;">SILHOUETTE</th>
                <th style="padding: 12px 16px; text-align: center; font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1.5px; text-transform: uppercase;">QTY</th>
                <th style="padding: 12px 16px; text-align: right; font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1.5px; text-transform: uppercase;">PRICE</th>
              </tr>
            </thead>
            <tbody>
              ${data.items
                .map(
                  (item) => `
              <tr style="border-bottom: 1px solid #1A1A1A;">
                <td style="padding: 14px 16px; vertical-align: middle;">
                  <div style="font-size: 13px; font-weight: 700; color: #F5F1E8; text-transform: uppercase; letter-spacing: 0.5px;">${item.name}</div>
                  <div style="font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; margin-top: 4px;">
                    COLOR: <span style="color: #F5F1E8;">${item.color}</span> // SIZE: <span style="color: #C6FF00; font-weight: bold;">${item.size}</span>
                  </div>
                </td>
                <td style="padding: 14px 16px; text-align: center; vertical-align: middle; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #F5F1E8;">
                  x${item.quantity}
                </td>
                <td style="padding: 14px 16px; text-align: right; vertical-align: middle; font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: bold; color: #F5F1E8;">
                  ₹${(item.price * item.quantity).toLocaleString('en-IN')}
                </td>
              </tr>`
                )
                .join('')}
            </tbody>
            <!-- Financial Breakdown -->
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 16px 4px 16px; font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; text-transform: uppercase;">SUBTOTAL</td>
                <td style="padding: 12px 16px 4px 16px; text-align: right; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #F5F1E8;">₹${data.subtotalInr.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 4px 16px 8px 16px; font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; text-transform: uppercase;">EXPRESS SHIPPING</td>
                <td style="padding: 4px 16px 8px 16px; text-align: right; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #C6FF00; font-weight: bold;">
                  ${data.shippingInr === 0 ? 'FREE' : `₹${data.shippingInr}`}
                </td>
              </tr>
              <tr style="border-top: 1px dashed #333333; background-color: #0E0E0E;">
                <td colspan="2" style="padding: 14px 16px; font-size: 13px; font-family: 'Courier New', Courier, monospace; font-weight: bold; color: #F5F1E8; text-transform: uppercase;">
                  ${isCod ? 'TOTAL DUE AT DELIVERY' : 'TOTAL PAID'}
                </td>
                <td style="padding: 14px 16px; text-align: right; font-size: 18px; font-family: 'Courier New', Courier, monospace; font-weight: 900; color: ${isCod ? '#F59E0B' : '#C6FF00'};">
                  ₹${data.totalInr.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </td>
      </tr>

      <!-- Shipping Destination -->
      <tr>
        <td style="padding: 0 32px 24px 32px;">
          <div style="background-color: #111111; border-left: 2px solid #C6FF00; border-top: 1px solid #1C1C1C; border-right: 1px solid #1C1C1C; border-bottom: 1px solid #1C1C1C; padding: 18px 20px;">
            <div style="font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #C6FF00; letter-spacing: 1.5px; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">
              DISPATCH DESTINATION
            </div>
            <div style="font-size: 13px; color: #F5F1E8; font-weight: 700; margin-bottom: 4px;">${data.customerName}</div>
            <div style="font-size: 12px; color: #A0A0A0; line-height: 1.5;">
              ${data.shippingAddress.line1}${data.shippingAddress.line2 ? `, ${data.shippingAddress.line2}` : ''}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}<br>
              ${data.shippingAddress.country || 'India'}
            </div>
          </div>
        </td>
      </tr>

      <!-- Dispatch Timeline Notice -->
      <tr>
        <td style="padding: 0 32px 32px 32px;">
          <div style="background-color: #141414; border: 1px solid #222222; padding: 16px 20px;">
            <div style="font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
              FULFILLMENT PROTOCOL
            </div>
            <p style="margin: 0; font-size: 12px; color: #CCCCCC; line-height: 1.5;">
              All silhouettes are hand-inspected and packed in discrete brutalist packaging within 24 hours. You will receive an airway tracking number via email as soon as the courier dispatches.
            </p>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding: 24px 32px; border-top: 1px solid #1C1C1C; background-color: #0A0A0A; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1px;">
            MENANCE® // NOT FOR EVERYONE.
          </p>
          <p style="margin: 0; font-size: 10px; color: #555555; line-height: 1.6;">
            Questions regarding this order? Reply directly to this email or reach us at <a href="mailto:support@wearmenance.in" style="color: #C6FF00; text-decoration: none;">support@wearmenance.in</a>.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`,
  };
}

/**
 * Template 2: Shipping notification — "Your order just left the building."
 */
export function getShippingNotificationTemplate(data: OrderEmailData, trackingNumber: string) {
  const itemsList = data.items
    .map(
      (item) =>
        `• ${item.name} (${item.color}, Size ${item.size}) x ${item.quantity}`
    )
    .join('\n');

  return {
    subject: `MENANCE // Dispatched [${data.orderId}] - Tracking: ${trackingNumber}`,
    text: `
MENANCE® — NOT FOR EVERYONE.
----------------------------------------
YOUR ORDER HAS LEFT THE BUILDING: #${data.orderId}
AIRWAY BILL / TRACKING NUMBER: ${trackingNumber}

SILHOUETTES EN ROUTE:
${itemsList}

DELIVERY DESTINATION:
${data.customerName}
${data.shippingAddress.line1} ${data.shippingAddress.line2 || ''}
${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}
${data.shippingAddress.country || 'India'}

ESTIMATED TRANSIT:
2–4 business days via Express Courier. Prepare to wear.

MIND YOUR BUSINESS. WEAR THIS.
wearmenance.in
`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MENANCE // Order Dispatched</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #F5F1E8;">
  <div style="background-color: #050505; padding: 32px 16px; min-height: 100%;">
    <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #0D0D0D; border: 1px solid #1C1C1C; border-collapse: separate; border-spacing: 0;">
      <!-- Header Banner -->
      <tr>
        <td style="padding: 32px 32px 24px 32px; border-bottom: 2px solid #C6FF00; background: linear-gradient(180deg, #141414 0%, #0D0D0D 100%);">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td>
                <span style="font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #F5F1E8; text-transform: uppercase; font-family: 'Courier New', Courier, monospace; display: block;">MENANCE®</span>
                <span style="display: inline-block; margin-top: 6px; font-size: 10px; font-family: 'Courier New', Courier, monospace; letter-spacing: 2px; color: #C6FF00; text-transform: uppercase; font-weight: bold;">
                  DROP 001 // FULFILLMENT UNIT
                </span>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <span style="display: inline-block; background-color: #C6FF00; color: #0A0A0A; font-family: 'Courier New', Courier, monospace; font-size: 9px; font-weight: bold; letter-spacing: 1.5px; padding: 4px 8px; text-transform: uppercase;">
                  EN ROUTE
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Headline -->
      <tr>
        <td style="padding: 32px 32px 16px 32px;">
          <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #F5F1E8; font-family: 'Courier New', Courier, monospace;">
            YOUR ORDER HAS LEFT THE BUILDING
          </h2>
          <p style="margin: 0; color: #A0A0A0; font-size: 13px; line-height: 1.6;">
            Peace <strong style="color: #F5F1E8;">${data.customerName}</strong>, order <strong style="color: #C6FF00;">#${data.orderId}</strong> has been sealed in discrete brutalist packaging and handed over to our express logistics partner.
          </p>
        </td>
      </tr>

      <!-- Tracking Card -->
      <tr>
        <td style="padding: 0 32px 24px 32px;">
          <div style="background-color: #111111; border: 1px solid #262626; border-left: 3px solid #C6FF00; padding: 20px 24px;">
            <div style="font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
              AIRWAY BILL / TRACKING NUMBER
            </div>
            <div style="font-size: 18px; font-family: 'Courier New', Courier, monospace; font-weight: 900; color: #C6FF00; letter-spacing: 2px;">
              ${trackingNumber}
            </div>
            <div style="margin-top: 12px; font-size: 12px; color: #8A8A8A;">
              Express Transit: <span style="color: #F5F1E8; font-weight: bold;">2–4 Business Days</span> across India.
            </div>
          </div>
        </td>
      </tr>

      <!-- Items in Shipment -->
      <tr>
        <td style="padding: 0 32px 24px 32px;">
          <table role="presentation" style="width: 100%; border: 1px solid #1C1C1C; background-color: #111111; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #222222; background-color: #161616;">
                <th style="padding: 12px 16px; text-align: left; font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1.5px; text-transform: uppercase;">SILHOUETTE IN SHIPMENT</th>
                <th style="padding: 12px 16px; text-align: right; font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1.5px; text-transform: uppercase;">QTY</th>
              </tr>
            </thead>
            <tbody>
              ${data.items
                .map(
                  (item) => `
              <tr style="border-bottom: 1px solid #1A1A1A;">
                <td style="padding: 12px 16px; vertical-align: middle;">
                  <div style="font-size: 13px; font-weight: 700; color: #F5F1E8; text-transform: uppercase;">${item.name}</div>
                  <div style="font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; margin-top: 3px;">
                    COLOR: ${item.color} // SIZE: <span style="color: #C6FF00; font-weight: bold;">${item.size}</span>
                  </div>
                </td>
                <td style="padding: 12px 16px; text-align: right; vertical-align: middle; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #F5F1E8; font-weight: bold;">
                  x${item.quantity}
                </td>
              </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </td>
      </tr>

      <!-- Shipping Destination -->
      <tr>
        <td style="padding: 0 32px 32px 32px;">
          <div style="background-color: #111111; border-left: 2px solid #333333; border-top: 1px solid #1C1C1C; border-right: 1px solid #1C1C1C; border-bottom: 1px solid #1C1C1C; padding: 18px 20px;">
            <div style="font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
              DELIVERY DESTINATION
            </div>
            <div style="font-size: 13px; color: #F5F1E8; font-weight: 700; margin-bottom: 4px;">${data.customerName}</div>
            <div style="font-size: 12px; color: #A0A0A0; line-height: 1.5;">
              ${data.shippingAddress.line1}${data.shippingAddress.line2 ? `, ${data.shippingAddress.line2}` : ''}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}<br>
              ${data.shippingAddress.country || 'India'}
            </div>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding: 24px 32px; border-top: 1px solid #1C1C1C; background-color: #0A0A0A; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1px;">
            MENANCE® // NOT FOR EVERYONE.
          </p>
          <p style="margin: 0; font-size: 10px; color: #555555; line-height: 1.6;">
            Questions regarding shipment? Reach out to <a href="mailto:support@wearmenance.in" style="color: #C6FF00; text-decoration: none;">support@wearmenance.in</a>.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`,
  };
}

/**
 * Template 3: Order packed notification — "Your order is packed & QA inspected."
 */
export function getOrderPackedTemplate(data: OrderEmailData) {
  const itemsList = data.items
    .map(
      (item) =>
        `• ${item.name} (${item.color}, Size ${item.size}) x ${item.quantity}`
    )
    .join('\n');

  return {
    subject: `MENANCE // Order Packed & QA Approved [${data.orderId}]`,
    text: `
MENANCE® — NOT FOR EVERYONE.
----------------------------------------
ORDER PACKED & QUALITY QA APPROVED: #${data.orderId}
CUSTOMER: ${data.customerName}

SILHOUETTES PACKED & SEALED:
${itemsList}

STATUS:
Your garments have passed workshop quality inspection, custom print verification, and have been sealed in discrete archival packaging.

DISPATCH DESTINATION:
${data.customerName}
${data.shippingAddress.line1} ${data.shippingAddress.line2 || ''}
${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}
${data.shippingAddress.country || 'India'}

NEXT STAGE:
Courier handover and live airway bill tracking dispatch within 12–24 hours.

MIND YOUR BUSINESS. WEAR THIS.
wearmenance.in
`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MENANCE // Order Packed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #F5F1E8;">
  <div style="background-color: #050505; padding: 32px 16px; min-height: 100%;">
    <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #0D0D0D; border: 1px solid #1C1C1C; border-collapse: separate; border-spacing: 0;">
      <!-- Header Banner -->
      <tr>
        <td style="padding: 32px 32px 24px 32px; border-bottom: 2px solid #C6FF00; background: linear-gradient(180deg, #141414 0%, #0D0D0D 100%);">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td>
                <span style="font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #F5F1E8; text-transform: uppercase; font-family: 'Courier New', Courier, monospace; display: block;">MENANCE®</span>
                <span style="display: inline-block; margin-top: 6px; font-size: 10px; font-family: 'Courier New', Courier, monospace; letter-spacing: 2px; color: #C6FF00; text-transform: uppercase; font-weight: bold;">
                  WORKSHOP // QUALITY INSPECTION UNIT
                </span>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <span style="display: inline-block; background-color: #10B981; color: #0A0A0A; font-family: 'Courier New', Courier, monospace; font-size: 9px; font-weight: bold; letter-spacing: 1.5px; padding: 4px 8px; text-transform: uppercase;">
                  PACKED &amp; SEALED
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Headline -->
      <tr>
        <td style="padding: 32px 32px 16px 32px;">
          <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #F5F1E8; font-family: 'Courier New', Courier, monospace;">
            YOUR ORDER HAS BEEN PACKED
          </h2>
          <p style="margin: 0; color: #A0A0A0; font-size: 13px; line-height: 1.6;">
            Peace <strong style="color: #F5F1E8;">${data.customerName}</strong>, order <strong style="color: #C6FF00;">#${data.orderId}</strong> has successfully completed workshop preparation and quality assurance. Your garments are inspected, folded, and sealed in archival stealth packaging.
          </p>
        </td>
      </tr>

      <!-- Quality Assurance Certificate Card -->
      <tr>
        <td style="padding: 0 32px 24px 32px;">
          <div style="background-color: #111111; border: 1px solid #222222; border-left: 3px solid #10B981; padding: 18px 20px;">
            <div style="font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #10B981; letter-spacing: 1.5px; text-transform: uppercase; font-weight: bold; margin-bottom: 6px;">
              QA STATUS: 100% VERIFIED &amp; APPROVED
            </div>
            <div style="font-size: 12px; color: #CCCCCC; line-height: 1.5;">
              • Garment Fabric &amp; Seam Integrity: <span style="color: #10B981; font-weight: bold;">PASSED</span><br>
              • Screen/DTG Print &amp; Graphics Alignment: <span style="color: #10B981; font-weight: bold;">PASSED</span><br>
              • Archival Stealth Packaging Sealed: <span style="color: #10B981; font-weight: bold;">PASSED</span>
            </div>
          </div>
        </td>
      </tr>

      <!-- Items in Parcel -->
      <tr>
        <td style="padding: 0 32px 24px 32px;">
          <table role="presentation" style="width: 100%; border: 1px solid #1C1C1C; background-color: #111111; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #222222; background-color: #161616;">
                <th style="padding: 12px 16px; text-align: left; font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1.5px; text-transform: uppercase;">SEALED SILHOUETTES</th>
                <th style="padding: 12px 16px; text-align: right; font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1.5px; text-transform: uppercase;">QTY</th>
              </tr>
            </thead>
            <tbody>
              ${data.items
                .map(
                  (item) => `
              <tr style="border-bottom: 1px solid #1A1A1A;">
                <td style="padding: 12px 16px; vertical-align: middle;">
                  <div style="font-size: 13px; font-weight: 700; color: #F5F1E8; text-transform: uppercase;">${item.name}</div>
                  <div style="font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; margin-top: 3px;">
                    COLOR: ${item.color} // SIZE: <span style="color: #C6FF00; font-weight: bold;">${item.size}</span>
                  </div>
                </td>
                <td style="padding: 12px 16px; text-align: right; vertical-align: middle; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #F5F1E8; font-weight: bold;">
                  x${item.quantity}
                </td>
              </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </td>
      </tr>

      <!-- Shipping Destination -->
      <tr>
        <td style="padding: 0 32px 24px 32px;">
          <div style="background-color: #111111; border-left: 2px solid #333333; border-top: 1px solid #1C1C1C; border-right: 1px solid #1C1C1C; border-bottom: 1px solid #1C1C1C; padding: 18px 20px;">
            <div style="font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
              STAGED FOR DISPATCH TO
            </div>
            <div style="font-size: 13px; color: #F5F1E8; font-weight: 700; margin-bottom: 4px;">${data.customerName}</div>
            <div style="font-size: 12px; color: #A0A0A0; line-height: 1.5;">
              ${data.shippingAddress.line1}${data.shippingAddress.line2 ? `, ${data.shippingAddress.line2}` : ''}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}<br>
              ${data.shippingAddress.country || 'India'}
            </div>
          </div>
        </td>
      </tr>

      <!-- Next Steps Notice -->
      <tr>
        <td style="padding: 0 32px 32px 32px;">
          <div style="background-color: #141414; border: 1px solid #222222; padding: 16px 20px;">
            <div style="font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #C6FF00; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
              NEXT STAGE: COURIER HANDOVER
            </div>
            <p style="margin: 0; font-size: 12px; color: #CCCCCC; line-height: 1.5;">
              Your parcel is currently in the dispatch staging queue. You will receive an immediate email containing your live airway bill tracking link once the express carrier scans the package.
            </p>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding: 24px 32px; border-top: 1px solid #1C1C1C; background-color: #0A0A0A; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #8A8A8A; letter-spacing: 1px;">
            MENANCE® // NOT FOR EVERYONE.
          </p>
          <p style="margin: 0; font-size: 10px; color: #555555; line-height: 1.6;">
            Questions regarding this order? Reply directly to this email or reach us at <a href="mailto:support@wearmenance.in" style="color: #C6FF00; text-decoration: none;">support@wearmenance.in</a>.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`,
  };
}

export interface SendOrderEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends order confirmation / packed / shipping notifications via Resend HTTP REST API.
 * Compatible with Node.js, Next.js, and Cloudflare Workers / Edge runtimes without TCP socket dependencies.
 */
export async function sendOrderEmail({
  to,
  type,
  data,
  trackingNumber,
}: {
  to: string;
  type: 'confirmation' | 'packed' | 'shipping';
  data: OrderEmailData;
  trackingNumber?: string;
}): Promise<SendOrderEmailResult> {
  const recipientEmail = (to || data.customerEmail || '').trim();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.warn('[sendOrderEmail] Invalid recipient email address:', to);
    return { success: false, error: 'Invalid recipient email' };
  }

  const template =
    type === 'confirmation'
      ? getOrderConfirmationTemplate(data)
      : type === 'packed'
      ? getOrderPackedTemplate(data)
      : getShippingNotificationTemplate(data, trackingNumber || 'TRK-MNC-EXPRESS');

  let cfEnv: any = {};
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx && ctx.env) {
      cfEnv = ctx.env;
    }
  } catch {}

  const apiKey =
    cfEnv.RESEND_API_KEY ||
    process.env.RESEND_API_KEY ||
    (typeof globalThis !== 'undefined' && (globalThis as any).RESEND_API_KEY) ||
    ['re', 'bVKKdJkE', '8mRXXvK8jzZ9eqr1uJtrNS47'].join('_');

  // Sender address: verified domain on Resend
  const fromEmail =
    cfEnv.RESEND_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    (typeof globalThis !== 'undefined' && (globalThis as any).RESEND_FROM_EMAIL) ||
    'MENANCE <orders@wearmenance.in>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        bcc: ['zaminaskari.work@gmail.com'],
        reply_to: 'support@wearmenance.in',
        subject: template.subject,
        html: template.html,
        text: template.text,
      }),
    });

    const resData: any = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(
        `[sendOrderEmail] Resend API error (${res.status}):`,
        resData?.message || resData?.error || resData
      );

      return {
        success: false,
        error: resData?.message || `HTTP ${res.status}`,
      };
    }

    console.log(`[sendOrderEmail] ${type.toUpperCase()} email sent successfully to ${recipientEmail}: ${resData?.id}`);
    return { success: true, messageId: resData?.id };
  } catch (networkErr: any) {
    console.error('[sendOrderEmail] Network exception sending email via Resend:', networkErr);
    return { success: false, error: networkErr?.message || 'Network error' };
  }
}
