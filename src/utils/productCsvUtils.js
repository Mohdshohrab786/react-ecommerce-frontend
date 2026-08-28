/**
 * Product CSV Import & Export Utilities
 * Supports client-side CSV parsing, generation, and sample templates.
 */

// 1. Export Products to CSV
export const exportProductsToCSV = (products, filenamePrefix = 'shahi_store_products') => {
    if (!products || products.length === 0) {
        alert('No products available to export.');
        return;
    }

    const headers = [
        'Product Name',
        'SKU',
        'Category',
        'Brand',
        'Price (INR)',
        'Sale Price (INR)',
        'Discount (%)',
        'Stock Qty',
        'GST (%)',
        'Image URL',
        'Description',
        'Is Active',
        'Is Featured'
    ];

    const escapeCSV = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };

    const rows = products.map(p => {
        const catName = p.category && typeof p.category === 'object' ? p.category.name : (p.category || '');
        const brandName = p.brand && typeof p.brand === 'object' ? p.brand.name : (p.brand || '');
        const price = Number(p.price) || 0;
        const salePrice = Number(p.salePrice) || price;
        const discount = Number(p.discount) || 0;
        const stock = Number(p.countInStock) || 0;
        const gst = Number(p.gstPercentage) || 0;

        return [
            escapeCSV(p.name),
            escapeCSV(p.sku || ''),
            escapeCSV(catName),
            escapeCSV(brandName),
            price.toFixed(2),
            salePrice.toFixed(2),
            discount,
            stock,
            gst,
            escapeCSV(p.image || '/images/sample.jpg'),
            escapeCSV(p.description || ''),
            p.isActive !== false ? 'YES' : 'NO',
            p.isFeatured ? 'YES' : 'NO'
        ].join(',');
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${filenamePrefix}_${timestamp}.csv`;
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    downloadBlob(csvContent, filename);
};

// 2. Download Sample Product Import Template
export const downloadSampleProductTemplate = () => {
    const headers = [
        'Product Name',
        'SKU',
        'Category',
        'Brand',
        'Price',
        'Sale Price',
        'Discount',
        'Stock',
        'GST',
        'Image URL',
        'Description'
    ];

    const sampleRows = [
        [
            '"Classic Cotton Crewneck T-Shirt"',
            '"SKU-TSHIRT-001"',
            '"Clothing"',
            '"Shahi Collection"',
            '599.00',
            '499.00',
            '15',
            '50',
            '5',
            '"/images/sample.jpg"',
            '"Premium 100% breathable combed cotton t-shirt for everyday comfort."'
        ],
        [
            '"Wireless Bluetooth Earbuds Pro"',
            '"SKU-AUDIO-002"',
            '"Electronics"',
            '"AudioTech"',
            '1999.00',
            '1499.00',
            '25',
            '35',
            '18',
            '"/images/sample.jpg"',
            '"Active noise cancelling stereo earbuds with 30-hour battery life."'
        ],
        [
            '"Genuine Leather Wallet for Men"',
            '"SKU-ACC-003"',
            '"Accessories"',
            '"UrbanLeather"',
            '899.00',
            '749.00',
            '10',
            '20',
            '12',
            '"/images/sample.jpg"',
            '"Slim bifold RFID blocking real leather wallet with card slots."'
        ]
    ];

    const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\r\n');
    downloadBlob(csvContent, 'sample_product_import_template.csv');
};

// 3. Parse CSV String into Product Objects
export const parseProductCSV = (csvText) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
        throw new Error('CSV file must have a header row and at least one product row.');
    }

    // CSV line parser that handles quotes and commas
    const parseCSVLine = (text) => {
        const values = [];
        let curVal = '';
        let insideQuote = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"' && insideQuote && nextChar === '"') {
                curVal += '"';
                i++; // skip next quote
            } else if (char === '"') {
                insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
                values.push(curVal.trim());
                curVal = '';
            } else {
                curVal += char;
            }
        }
        values.push(curVal.trim());
        return values;
    };

    const headerLine = lines[0].replace(/^\uFEFF/, ''); // strip BOM
    const rawHeaders = parseCSVLine(headerLine).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    const products = [];

    for (let i = 1; i < lines.length; i++) {
        const rawValues = parseCSVLine(lines[i]);
        if (rawValues.length === 0 || (rawValues.length === 1 && !rawValues[0])) continue;

        const rowObj = {};
        rawHeaders.forEach((headerKey, idx) => {
            rowObj[headerKey] = rawValues[idx] || '';
        });

        // Map column variations
        const name = rowObj.productname || rowObj.name || rowObj.title || '';
        if (!name) continue; // skip invalid row

        const sku = rowObj.sku || rowObj.productsku || '';
        const category = rowObj.category || rowObj.categoryname || '';
        const brand = rowObj.brand || rowObj.brandname || '';
        const price = parseFloat(rowObj.price || rowObj.priceinr || 0) || 0;
        const salePrice = parseFloat(rowObj.saleprice || rowObj.salepriceinr || 0) || price;
        const discount = parseFloat(rowObj.discount || 0) || 0;
        const stock = parseInt(rowObj.stock || rowObj.stockqty || rowObj.countinstock || 0, 10) || 0;
        const gst = parseFloat(rowObj.gst || rowObj.gstpercentage || 0) || 0;
        const image = rowObj.imageurl || rowObj.image || '/images/sample.jpg';
        const description = rowObj.description || rowObj.desc || `${name} premium product`;

        products.push({
            name,
            sku,
            category,
            brand,
            price,
            salePrice,
            discount,
            countInStock: stock,
            gstPercentage: gst,
            image,
            description
        });
    }

    return products;
};

const downloadBlob = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
