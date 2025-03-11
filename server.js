const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/api/xfi', async (req, res) => {
    try {
        const response = await fetch('https://pump.fun/coin/3ybxu6f8SV2sRcRpeoYHqUmQR3bBf1C8NiERZJHPpump');
        const text = await response.text();
        console.log('Pump.fun HTML (first 500 chars):', text.substring(0, 500));

        // Fiyat ve piyasa değerini HTML’den çıkar
        const priceMatch = text.match(/price[^>]*>\$([\d.]+)/i) || text.match(/data-price="([^"]+)"/i);
        const marketCapMatch = text.match(/market cap[^>]*>\$([\d.,]+)/i) || text.match(/data-market-cap="([^"]+)"/i);

        if (priceMatch && marketCapMatch) {
            const price = parseFloat(priceMatch[1].replace(/[^0-9.]/g, ''));
            const marketcap = parseFloat(marketCapMatch[1].replace(/[^0-9.]/g, ''));
            res.json({ price, marketcap });
        } else {
            res.status(404).json({ error: 'No price or market cap found in HTML' });
        }
    } catch (error) {
        console.error('Error fetching XFI data from Pump.fun:', error);
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy server running on port ${port}`));
