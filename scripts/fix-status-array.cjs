const fs = require('fs');
const file = 'D:/Ara Web/react-ecommerce/frontend/src/pages/OrderDetailsPage.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    /const actualStatus = \['Returned', 'Replacement Requested', 'Cancelled'\]\.includes\(order\?\.status\)/,
    "const actualStatus = ['Returned', 'Replacement Requested', 'Cancelled', 'Refunded', 'Replaced'].includes(order?.status)"
);

fs.writeFileSync(file, code);
console.log('Fixed OrderDetailsPage actualStatus array');
