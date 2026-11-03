/**
 * FitMaster AI – MySQL Dataset Ingestion Script
 * Ingests cleaned per-100g nutritional CSV records into the MySQL 'foods' table.
 */

const fs = require('fs');
const path = require('path');
let mysql;
try {
  mysql = require('mysql2/promise');
} catch {
  mysql = require(path.resolve(__dirname, '../../backend/node_modules/mysql2/promise'));
}
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch {
  require(path.resolve(__dirname, '../../backend/node_modules/dotenv')).config({ path: path.resolve(__dirname, '../../.env') });
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function importDataset() {
  const csvPath = path.resolve(__dirname, '../processed/cleaned_foods.csv');

  console.log('==========================================================');
  console.log('   FitMaster AI – MySQL Dataset Batch Ingestion Tool    ');
  console.log('==========================================================');
  console.log(`[Input] Processed CSV: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`[Error]: Processed dataset not found. Run python3 dataset/scripts/preprocess_dataset.py first.`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').filter((l) => l.trim().length > 0);

  if (lines.length <= 1) {
    console.error('[Error]: CSV file contains no data rows.');
    process.exit(1);
  }

  const header = parseCSVLine(lines[0]);
  console.log(`[Schema]: Detected columns: ${header.join(', ')}`);

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= 9) {
      records.push({
        food_name: values[0].replace(/^"|"$/g, ''),
        category: values[1].replace(/^"|"$/g, ''),
        calories_per_100g: parseFloat(values[2]) || 0,
        protein_per_100g: parseFloat(values[3]) || 0,
        carbs_per_100g: parseFloat(values[4]) || 0,
        fat_per_100g: parseFloat(values[5]) || 0,
        fibre_per_100g: parseFloat(values[6]) || 0,
        serving_size: values[7].replace(/^"|"$/g, '') || '100g',
        source: values[8].replace(/^"|"$/g, '') || 'USDA FoodData Central'
      });
    }
  }

  console.log(`[Parsed]: Successfully extracted ${records.length} food items.`);

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fitmaster_ai'
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`[MySQL]: Connected successfully to ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}.`);
  } catch (err) {
    console.error(`\n[Database Connection Failed]:`);
    console.error(`  Error Code   : ${err.code}`);
    console.error(`  Error Message: ${err.message}`);
    console.error(`\n[Resolution Instructions]:`);
    console.error(`  1. Make sure MySQL server is running.`);
    console.error(`  2. Set your MySQL credentials in the root .env file:`);
    console.error(`     DB_USER=root`);
    console.error(`     DB_PASSWORD=your_actual_password`);
    console.error(`  3. Ensure database schema is created: mysql -u root -p < database/schema.sql`);
    console.error(`  4. Re-run: node dataset/scripts/import_to_mysql.js\n`);
    process.exit(1);
  }

  try {
    console.log('[Import]: Ingesting records into `foods` table...');

    const insertSql = `
      INSERT INTO foods (food_name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g, serving_size, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let insertedCount = 0;
    for (const rec of records) {
      await connection.query(insertSql, [
        rec.food_name,
        rec.category,
        rec.calories_per_100g,
        rec.protein_per_100g,
        rec.carbs_per_100g,
        rec.fat_per_100g,
        rec.fibre_per_100g,
        rec.serving_size,
        rec.source
      ]);
      insertedCount++;
    }

    console.log(`[Success]: Successfully inserted ${insertedCount} food records into MySQL!`);

    // Verification check
    const [stats] = await connection.query(`
      SELECT category, COUNT(*) as count, 
             ROUND(AVG(calories_per_100g), 1) as avg_cal,
             ROUND(AVG(protein_per_100g), 1) as avg_protein
      FROM foods 
      GROUP BY category
      ORDER BY count DESC
    `);

    console.log('\n[MySQL Verified Category Distribution]:');
    for (const row of stats) {
      console.log(`  • ${row.category.padEnd(24)}: ${row.count} items (Avg: ${row.avg_cal} kcal, ${row.avg_protein}g P)`);
    }

    console.log('==========================================================');
    console.log('✓ MySQL Food Ingestion Pipeline Verified Successfully.');
    console.log('==========================================================');
  } catch (err) {
    console.error('[Import Error]:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  importDataset();
}

module.exports = { importDataset, parseCSVLine };
