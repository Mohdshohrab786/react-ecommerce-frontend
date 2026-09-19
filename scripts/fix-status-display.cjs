const fs = require('fs');
const file = 'D:/Ara Web/react-ecommerce/frontend/src/pages/OrderDetailsPage.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    /const actualStatus = order\?\.isDelivered \? 'Delivered' : \(order\?\.status \|\| 'Pending'\);/,
    "const actualStatus = ['Returned', 'Replacement Requested', 'Cancelled'].includes(order?.status) ? order.status : (order?.isDelivered ? 'Delivered' : (order?.status || 'Pending'));"
);

fs.writeFileSync(file, code);
console.log('Fixed OrderDetailsPage actualStatus');
