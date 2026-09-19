const fs = require('fs');
const files = ['AdminWalletList.jsx', 'AdminRefundList.jsx', 'AdminReturnList.jsx'];
files.forEach(f => {
    const file = 'D:/Ara Web/react-ecommerce/frontend/src/pages/admin/' + f;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
    fs.writeFileSync(file, content);
});
console.log('Fixed syntax in Admin files');
