/**
 * CSV Exporter Utility for Orders & E-Commerce Data
 * Generates UTF-8 encoded, Excel-friendly CSV files with complete item breakdown.
 */

export const exportOrdersToCSV = (ordersToExport, filenamePrefix = 'orders_export') => {
    if (!ordersToExport || ordersToExport.length === 0) {
        alert('No orders available to export.');
        return;
    }

    const headers = [
        'Order ID',
        'Order Date',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Shipping Address',
        'City',
        'State',
        'Postal Code',
        'Payment Method',
        'Payment Status',
        'Paid At',
        'Delivery Status',
        'Delivered At',
        'Items Ordered Summary',
        'Total Items Qty',
        'Items Subtotal',
        'Shipping Fee',
        'Discount Amount',
        'Grand Total'
    ];

    const escapeCSV = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };

    const rows = ordersToExport.map(order => {
        const orderId = order.orderNumber ? `#${order.orderNumber}` : `#${order._id.substring(0, 8).toUpperCase()}`;
        const orderDate = new Date(order.createdAt).toLocaleString('en-IN');
        const custName = order.user?.name || order.shippingAddress?.name || 'Customer';
        const custEmail = order.user?.email || 'N/A';
        const custPhone = order.shippingAddress?.phone || order.user?.phone || 'N/A';
        const address = order.shippingAddress?.address || 'N/A';
        const city = order.shippingAddress?.city || 'N/A';
        const state = order.shippingAddress?.state || 'N/A';
        const postalCode = order.shippingAddress?.postalCode || 'N/A';
        const paymentMethod = order.paymentMethod || 'Online';
        const paymentStatus = order.isPaid ? 'PAID' : 'UNPAID';
        const paidAt = order.paidAt ? new Date(order.paidAt).toLocaleString('en-IN') : 'N/A';
        const deliveryStatus = order.status || (order.isDelivered ? 'Delivered' : 'Pending');
        const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('en-IN') : 'N/A';

        // Format items summary
        const itemsStr = order.orderItems?.map(i => `${i.name} (x${i.qty} @ ${i.price})`).join('; ') || 'N/A';
        const totalQty = order.orderItems?.reduce((acc, i) => acc + (Number(i.qty) || 1), 0) || 0;
        const itemsPrice = order.itemsPrice || 0;
        const shippingPrice = order.shippingPrice || 0;
        const discountPrice = order.discountPrice || 0;
        const grandTotal = order.totalPrice || 0;

        return [
            escapeCSV(orderId),
            escapeCSV(orderDate),
            escapeCSV(custName),
            escapeCSV(custEmail),
            escapeCSV(custPhone),
            escapeCSV(address),
            escapeCSV(city),
            escapeCSV(state),
            escapeCSV(postalCode),
            escapeCSV(paymentMethod),
            escapeCSV(paymentStatus),
            escapeCSV(paidAt),
            escapeCSV(deliveryStatus),
            escapeCSV(deliveredAt),
            escapeCSV(itemsStr),
            totalQty,
            itemsPrice.toFixed(2),
            shippingPrice.toFixed(2),
            discountPrice.toFixed(2),
            grandTotal.toFixed(2)
        ].join(',');
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${filenamePrefix}_${timestamp}.csv`;

    // Add UTF-8 Byte Order Mark (BOM) so Excel opens UTF-8 characters cleanly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
