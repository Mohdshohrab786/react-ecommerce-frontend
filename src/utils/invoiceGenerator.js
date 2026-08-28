/**
 * Professional Invoice Generator & Printer for E-Commerce Orders
 * Opens a print-optimized window that allows 1-click Print or Save as PDF.
 */

export const generateInvoice = (order, settings) => {
    if (!order) return;

    const brandName = settings?.websiteName || 'Shahi Store';
    const storeEmail = settings?.contactEmail || 'support@shahistore.com';
    const storePhone = settings?.contactPhone || '+91 9876543210';
    const storeAddress = settings?.contactAddress || 'Main Market, India';
    const currency = settings?.currencySymbol || settings?.currency || '₹';

    const orderId = order.orderNumber || (order._id ? order._id.substring(0, 8).toUpperCase() : 'N/A');
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'N/A';

    const customerName = order.user?.name || order.shippingAddress?.name || 'Valued Customer';
    const customerEmail = order.user?.email || 'N/A';
    const customerPhone = order.shippingAddress?.phone || order.user?.phone || 'N/A';
    const address = order.shippingAddress?.address || 'N/A';
    const city = order.shippingAddress?.city || '';
    const postalCode = order.shippingAddress?.postalCode || '';
    const country = order.shippingAddress?.country || '';
    const state = order.shippingAddress?.state || '';

    const items = order.orderItems || [];
    const itemsSubtotal = (order.itemsPrice || items.reduce((acc, i) => acc + (i.price * i.qty), 0)).toFixed(2);
    const shippingPrice = (order.shippingPrice || 0).toFixed(2);
    const taxPrice = (order.taxPrice || 0).toFixed(2);
    const discount = (order.discountAmount || 0).toFixed(2);
    const grandTotal = (order.totalPrice || 0).toFixed(2);

    const isPaid = order.isPaid;
    const paymentStatus = isPaid ? 'PAID' : (order.paymentMethod === 'COD' ? 'CASH ON DELIVERY (PENDING)' : 'UNPAID');
    const paymentMethod = order.paymentMethod || 'Online Payment';

    const invoiceHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice #${orderId} - ${brandName}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            body {
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                background-color: #f8fafc;
                color: #1e293b;
                padding: 40px 20px;
                line-height: 1.5;
            }

            .invoice-card {
                max-width: 800px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
                border: 1px solid #e2e8f0;
                overflow: hidden;
            }

            .invoice-header {
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                color: #ffffff;
                padding: 36px 40px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }

            .brand-info h1 {
                font-size: 26px;
                font-weight: 800;
                letter-spacing: -0.5px;
                color: #ffffff;
                margin-bottom: 6px;
            }

            .brand-info p {
                font-size: 13px;
                color: #94a3b8;
                line-height: 1.4;
            }

            .invoice-meta {
                text-align: right;
            }

            .invoice-badge {
                display: inline-block;
                background: rgba(99, 102, 241, 0.2);
                color: #a5b4fc;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                padding: 4px 10px;
                border-radius: 6px;
                border: 1px solid rgba(99, 102, 241, 0.4);
                margin-bottom: 8px;
            }

            .invoice-meta h2 {
                font-size: 22px;
                font-weight: 800;
                color: #f8fafc;
                margin-bottom: 4px;
            }

            .invoice-meta p {
                font-size: 13px;
                color: #94a3b8;
            }

            .invoice-body {
                padding: 36px 40px;
            }

            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 28px;
                margin-bottom: 36px;
                padding-bottom: 28px;
                border-bottom: 1px solid #e2e8f0;
            }

            .info-box h3 {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                color: #64748b;
                margin-bottom: 10px;
                font-weight: 700;
            }

            .info-box p {
                font-size: 14px;
                color: #334155;
                margin-bottom: 4px;
            }

            .info-box strong {
                color: #0f172a;
            }

            .status-pill {
                display: inline-block;
                padding: 3px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
                margin-top: 6px;
                background: ${isPaid ? '#dcfce7' : '#fef3c7'};
                color: ${isPaid ? '#15803d' : '#b45309'};
            }

            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 28px;
            }

            .items-table th {
                background: #f8fafc;
                color: #475569;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.6px;
                font-weight: 700;
                text-align: left;
                padding: 12px 16px;
                border-top: 1px solid #e2e8f0;
                border-bottom: 1px solid #e2e8f0;
            }

            .items-table td {
                padding: 14px 16px;
                border-bottom: 1px solid #f1f5f9;
                font-size: 13.5px;
                color: #334155;
            }

            .items-table .text-right {
                text-align: right;
            }

            .items-table .text-center {
                text-align: center;
            }

            .totals-container {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 36px;
            }

            .totals-table {
                width: 280px;
            }

            .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
                font-size: 13.5px;
                color: #64748b;
            }

            .totals-row.grand-total {
                border-top: 2px solid #e2e8f0;
                margin-top: 8px;
                padding-top: 12px;
                font-size: 18px;
                font-weight: 800;
                color: #0f172a;
            }

            .invoice-footer {
                background: #f8fafc;
                padding: 24px 40px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: #64748b;
            }

            .print-btn-bar {
                max-width: 800px;
                margin: 0 auto 20px auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .btn-action {
                background: #4f46e5;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }

            .btn-action:hover {
                background: #4338ca;
            }

            @media print {
                body {
                    padding: 0;
                    background: #ffffff;
                }
                .print-btn-bar {
                    display: none !important;
                }
                .invoice-card {
                    box-shadow: none;
                    border: none;
                    max-width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <div class="print-btn-bar">
            <span style="font-weight: 600; color: #475569;">Invoice Preview for #${orderId}</span>
            <div>
                <button class="btn-action" onclick="window.print()">
                    🖨️ Print / Save as PDF
                </button>
            </div>
        </div>

        <div class="invoice-card">
            <!-- Header -->
            <div class="invoice-header">
                <div class="brand-info">
                    <h1>${brandName}</h1>
                    <p>${storeAddress}</p>
                    <p>Phone: ${storePhone} | Email: ${storeEmail}</p>
                </div>
                <div class="invoice-meta">
                    <span class="invoice-badge">Tax Invoice</span>
                    <h2>#${orderId}</h2>
                    <p>Date: ${orderDate}</p>
                </div>
            </div>

            <!-- Body -->
            <div class="invoice-body">
                <div class="info-grid">
                    <div class="info-box">
                        <h3>Customer / Billed To:</h3>
                        <p><strong>${customerName}</strong></p>
                        <p>${customerEmail}</p>
                        <p>Phone: ${customerPhone}</p>
                        <p>${address}</p>
                        <p>${city}${state ? `, ${state}` : ''} ${postalCode}</p>
                        <p>${country}</p>
                    </div>
                    <div class="info-box" style="text-align: right;">
                        <h3>Payment & Status:</h3>
                        <p>Payment Method: <strong>${paymentMethod}</strong></p>
                        <p>Order Status: <strong>${order.status || 'Processing'}</strong></p>
                        <div>
                            <span class="status-pill">${paymentStatus}</span>
                        </div>
                    </div>
                </div>

                <!-- Items Table -->
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 50%;">Item & Description</th>
                            <th class="text-center" style="width: 15%;">Qty</th>
                            <th class="text-right" style="width: 15%;">Unit Price</th>
                            <th class="text-right" style="width: 20%;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, idx) => `
                            <tr>
                                <td>
                                    <strong>${item.name}</strong>
                                </td>
                                <td class="text-center">${item.qty}</td>
                                <td class="text-right">${currency}${item.price?.toFixed(2)}</td>
                                <td class="text-right"><strong>${currency}${(item.qty * item.price)?.toFixed(2)}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <!-- Totals -->
                <div class="totals-container">
                    <div class="totals-table">
                        <div class="totals-row">
                            <span>Items Subtotal:</span>
                            <span>${currency}${itemsSubtotal}</span>
                        </div>
                        <div class="totals-row">
                            <span>Shipping Fee:</span>
                            <span>${currency}${shippingPrice}</span>
                        </div>
                        <div class="totals-row">
                            <span>Tax:</span>
                            <span>${currency}${taxPrice}</span>
                        </div>
                        ${Number(discount) > 0 ? `
                        <div class="totals-row" style="color: #16a34a; font-weight: 600;">
                            <span>Discount:</span>
                            <span>-${currency}${discount}</span>
                        </div>
                        ` : ''}
                        <div class="totals-row grand-total">
                            <span>Grand Total:</span>
                            <span style="color: #4f46e5;">${currency}${grandTotal}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="invoice-footer">
                <div>
                    <p>Thank you for your business with <strong>${brandName}</strong>!</p>
                    <p>For inquiries or support, contact us at ${storeEmail}</p>
                </div>
                <div style="text-align: right;">
                    <p>This is a computer generated invoice.</p>
                </div>
            </div>
        </div>

        <script>
            // Automatically prompt print dialog after loading
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 400);
            };
        </script>
    </body>
    </html>
    `;

    // Open clean print window
    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
    } else {
        alert('Please allow popups for this site to print/download invoices.');
    }
};
