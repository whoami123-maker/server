const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/api/xfi', async (req, res) => {
    try {
        // Pump.fun'dan piyasa değerini çek
        const pumpResponse = await fetch('https://pump.fun/coin/3ybxu6f8SV2sRcRpeoYHqUmQR3bBf1C8NiERZJHPpump');
        const text = await pumpResponse.text();
        console.log('Full Pump.fun HTML (first 2000 chars):', text.substring(0, 2000));

        // Piyasa değerini çıkar
        const marketCapMatch = text.match(/<span[^>]*class="flex-shrink-0"[^>]*>\$[^\d]*<span[^>]*>([\d,]+)<\/span>/i);
        let marketcap = 0;
        if (marketCapMatch) {
            marketcap = parseFloat(marketCapMatch[1].replace(/,/g, '')); // Virgülü kaldır
            console.log('Extracted Market Cap:', marketcap);
        } else {
            console.log('No market cap found in HTML. Full text checked:', text.substring(0, 2000));
        }

        // Birdeye API'den fiyatı çek
        const birdeyeResponse = await fetch('https://public-api.birdeye.so/public/price?address=3ybxu6f8SV2sRcRpeoYHqUmQR3bBf1C8NiERZJHPpump', {
            headers: { 'X-API-KEY': 'your-api-key' } // Buraya API anahtarını koy
        });
        const birdeyeData = await birdeyeResponse.json();
        let price = 0;
        if (birdeyeData.data && birdeyeData.data.value) {
            price = birdeyeData.data.value;
            console.log('Extracted Price from Birdeye:', price);
        } else {
            console.log('No price data found in Birdeye response:', birdeyeData);
        }

        // Veri yoksa hata döndür
        if (marketcap === 0 && price === 0) {
            res.status(404).json({ error: 'No price or market cap found' });
        } else {
            res.json({ price, marketcap });
        }
    } catch (error) {
        console.error('Error fetching XFI data:', error);
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Proxy server running on port ${port}`));
