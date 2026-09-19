const fs = require('fs');
const file = 'D:/Ara Web/react-ecommerce/frontend/src/pages/OrderDetailsPage.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    /\{\!loadingEligibility && \!returnData\?\.canReturn && returnData\?\.reason && actualStatus === 'Delivered' && \(/,
    "{!loadingEligibility && !returnData?.canReturn && returnData?.reason && (actualStatus === 'Delivered' || isCancelledOrReturned) && ("
);

fs.writeFileSync(file, code);
console.log('Fixed return reason display');
