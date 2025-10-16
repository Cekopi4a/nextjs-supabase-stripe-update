// Script to read Citati.csv with proper encoding
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

const csvPath = path.join(__dirname, '..', 'Citati.csv');

try {
  // Try reading with different encodings
  const encodings = ['utf8', 'win1251', 'cp1251', 'windows-1251', 'latin1'];

  for (const encoding of encodings) {
    console.log(`\n=== Trying encoding: ${encoding} ===`);
    try {
      let content;
      if (encoding.includes('1251') || encoding.includes('win')) {
        // Use iconv-lite for Windows-1251
        const buffer = fs.readFileSync(csvPath);
        content = iconv.decode(buffer, 'win1251');
      } else {
        content = fs.readFileSync(csvPath, encoding);
      }

      const lines = content.split('\n').slice(0, 5);
      lines.forEach((line, index) => {
        console.log(`${index + 1}: ${line.substring(0, 100)}`);
      });

      // Check if кирилица is readable
      if (content.includes('е') || content.includes('а') || content.includes('о')) {
        console.log('\n✓ This encoding looks good!');

        // Parse all lines
        const allLines = content.split('\n').filter(line => line.trim());
        console.log(`\nTotal quotes found: ${allLines.length}`);

        // Output first 3 properly
        console.log('\n=== First 3 quotes ===');
        allLines.slice(0, 3).forEach((line, i) => {
          const parts = line.split(',');
          const quote = parts[0]?.replace(/^"|"$/g, '').trim();
          const author = parts.slice(1).join(',').trim();
          console.log(`${i + 1}. Quote: ${quote}`);
          console.log(`   Author: ${author}\n`);
        });

        break;
      }
    } catch (err) {
      console.log(`Error with ${encoding}: ${err.message}`);
    }
  }
} catch (error) {
  console.error('Error:', error.message);
}
