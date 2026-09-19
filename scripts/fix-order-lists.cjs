const fs = require('fs');

// Fix MyOrdersPage.jsx
const myOrdersFile = 'D:/Ara Web/react-ecommerce/frontend/src/pages/MyOrdersPage.jsx';
let code = fs.readFileSync(myOrdersFile, 'utf8');

code = code.replace(
    /const actualStatus = order\.isDelivered \? 'Delivered' : \(order\.status \|\| 'Pending'\);/,
    "const actualStatus = ['Returned', 'Replacement Requested', 'Cancelled', 'Refunded', 'Replaced'].includes(order?.status) ? order.status : (order?.isDelivered ? 'Delivered' : (order?.status || 'Pending'));"
);

fs.writeFileSync(myOrdersFile, code);
console.log('MyOrdersPage.jsx fixed');

// Fix AdminOrderList.jsx
const adminOrderFile = 'D:/Ara Web/react-ecommerce/frontend/src/pages/admin/AdminOrderList.jsx';
if (fs.existsSync(adminOrderFile)) {
    let adminCode = fs.readFileSync(adminOrderFile, 'utf8');
    adminCode = adminCode.replace(
        /const actualStatus = order\.isDelivered \? 'Delivered' : \(order\.status \|\| 'Pending'\);/g,
        "const actualStatus = ['Returned', 'Replacement Requested', 'Cancelled', 'Refunded', 'Replaced'].includes(order?.status) ? order.status : (order?.isDelivered ? 'Delivered' : (order?.status || 'Pending'));"
    );
    fs.writeFileSync(adminOrderFile, adminCode);
    console.log('AdminOrderList.jsx fixed');
}
