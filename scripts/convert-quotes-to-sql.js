// Script to convert Excel quotes to SQL INSERT statements
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.join(__dirname, '..', 'Citati.xls');
const outputPath = path.join(__dirname, '..', 'database', 'seed_quotes.sql');

try {
  console.log('Reading Excel file:', excelPath);

  // Read the Excel file
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log(`Total rows found: ${data.length}`);
  console.log('First 3 rows (sample):');
  data.slice(0, 3).forEach((row, i) => {
    console.log(`  ${i + 1}:`, row);
  });

  // Generate SQL INSERT statements
  let sql = `-- Seed data for motivational_quotes
-- Generated from Citati.xls
-- Total quotes: ${data.length}

BEGIN;

`;

  let validQuotes = 0;

  data.forEach((row, index) => {
    if (row && row.length >= 2 && row[0] && row[1]) {
      const quoteText = row[0].toString().trim();
      const author = row[1].toString().trim();

      if (quoteText && author) {
        // Escape single quotes for SQL
        const escapedQuote = quoteText.replace(/'/g, "''");
        const escapedAuthor = author.replace(/'/g, "''");

        sql += `INSERT INTO motivational_quotes (quote_text, author, is_active)
VALUES ('${escapedQuote}', '${escapedAuthor}', true);

`;
        validQuotes++;
      }
    }
  });

  sql += `COMMIT;

-- Summary: ${validQuotes} quotes inserted successfully
`;

  // Write to file
  fs.writeFileSync(outputPath, sql, 'utf8');

  console.log(`\n✓ Success!`);
  console.log(`  Valid quotes: ${validQuotes}`);
  console.log(`  Output file: ${outputPath}`);
  console.log(`\nYou can now run this SQL file to seed the database.`);

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
