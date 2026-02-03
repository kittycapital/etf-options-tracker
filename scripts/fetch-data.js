// scripts/fetch-data.js
// Fetches options data from Yahoo Finance and saves to data/options.json

const fs = require('fs');
const path = require('path');

const ETF_SYMBOLS = ['IBIT', 'ETHA', 'FBTC', 'ARKB', 'BITB', 'GBTC'];

async function fetchOptionsData(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/options/${symbol}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.optionChain?.result?.[0]) {
      throw new Error('No options data');
    }
    
    const result = data.optionChain.result[0];
    
    // Get first 3 expiry dates
    const expiryDates = result.expirationDates?.slice(0, 3) || [];
    const allOptions = [];
    
    // Fetch data for each expiry
    for (const expiry of expiryDates) {
      const expiryUrl = `https://query1.finance.yahoo.com/v7/finance/options/${symbol}?date=${expiry}`;
      const expiryResponse = await fetch(expiryUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (expiryResponse.ok) {
        const expiryData = await expiryResponse.json();
        const expiryResult = expiryData.optionChain?.result?.[0];
        if (expiryResult?.options?.[0]) {
          allOptions.push({
            expirationDate: expiry,
            calls: expiryResult.options[0].calls || [],
            puts: expiryResult.options[0].puts || []
          });
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }
    
    return {
      symbol,
      quote: result.quote || {},
      expirationDates: expiryDates,
      options: allOptions,
      fetchedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error.message);
    return {
      symbol,
      error: error.message,
      fetchedAt: new Date().toISOString()
    };
  }
}

async function main() {
  console.log('Fetching options data...');
  console.log('Symbols:', ETF_SYMBOLS.join(', '));
  
  const allData = {};
  
  for (const symbol of ETF_SYMBOLS) {
    console.log(`Fetching ${symbol}...`);
    allData[symbol] = await fetchOptionsData(symbol);
    // Delay between symbols
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // Ensure data directory exists
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Save data
  const outputPath = path.join(dataDir, 'options.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    data: allData
  }, null, 2));
  
  console.log(`Data saved to ${outputPath}`);
  console.log('Done!');
}

main().catch(console.error);
