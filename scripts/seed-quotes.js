// Script to seed quotes directly into Supabase
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedQuotes() {
  try {
    console.log('🚀 Starting quotes seeding process...\n');

    // Read the Excel file
    const excelPath = path.join(__dirname, '..', 'Citati.xls');
    console.log('📖 Reading Excel file:', excelPath);

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`✓ Found ${data.length} rows in Excel file\n`);

    // Prepare quotes for insertion
    const quotes = [];
    for (const row of data) {
      if (row && row.length >= 2 && row[0] && row[1]) {
        const quoteText = row[0].toString().trim();
        const author = row[1].toString().trim();

        if (quoteText && author) {
          quotes.push({
            quote_text: quoteText,
            author: author,
            is_active: true
          });
        }
      }
    }

    console.log(`✓ Prepared ${quotes.length} valid quotes for insertion\n`);

    // Insert in batches of 100 to avoid timeouts
    const batchSize = 100;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < quotes.length; i += batchSize) {
      const batch = quotes.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(quotes.length / batchSize);

      process.stdout.write(`📝 Inserting batch ${batchNumber}/${totalBatches} (${batch.length} quotes)... `);

      const { data, error } = await supabase
        .from('motivational_quotes')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error`);
        console.error('   ', error.message);
        errors += batch.length;
      } else {
        console.log(`✓ Success (${data.length} inserted)`);
        inserted += data.length;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log('✅ Seeding completed!');
    console.log(`   Total quotes: ${quotes.length}`);
    console.log(`   Successfully inserted: ${inserted}`);
    console.log(`   Errors: ${errors}`);
    console.log(`${'='.repeat(50)}\n`);

    // Verify the data
    const { count, error: countError } = await supabase
      .from('motivational_quotes')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`📊 Total quotes in database: ${count}\n`);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the seeding
seedQuotes();
