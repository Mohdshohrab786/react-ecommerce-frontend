const fs = require('fs');
const file = 'D:/Ara Web/react-ecommerce/frontend/src/components/admin/AdminHeader.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    /case 'return_request':/,
    "case 'replacement_request':\n                return (\n                    <div className=\"admin-notif-icon\" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.15)' }}>\n                        <RefreshCw size={18} />\n                    </div>\n                );\n            case 'return_request':"
);

fs.writeFileSync(file, code);
console.log('Fixed AdminHeader notification icons');
