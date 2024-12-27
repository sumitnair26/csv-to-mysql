const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const inputDir = './csv_files'; // Directory containing CSV files
const outputDir = './sql_file_done'; // Directory for output SQL files

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Function to extract table name from the file name
function getTableName(fileName) {
  const baseName = path.basename(fileName, path.extname(fileName)); // Remove extension
  const lastUnderscoreIndex = baseName.lastIndexOf('_');
  return lastUnderscoreIndex === -1 ? baseName : baseName.substring(0, lastUnderscoreIndex);
}

function csvToSql(filePath, tableName) {
    return new Promise((resolve, reject) => {
      const columns = [];
      const rows = [];
      let columnTypes = null;
      let hasData = false; // Flag to check if any data exists
  
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headers) => {
          if (headers.length === 0) {
            console.warn(`No headers found in file: ${filePath}`);
            resolve(null); // No headers mean no table can be created
            return;
          }
          columns.push(...headers.map(header => `\`${header}\``));
          columnTypes = new Array(headers.length).fill(null);
        })
        .on('data', (data) => {
          hasData = true; // Mark that data exists
          const values = Object.values(data).map(value => 
            value !== undefined && value !== null
              ? `'${value.replace(/'/g, "''")}'` 
              : 'NULL'
          );
  
          if (values.length !== columns.length) {
            console.warn(`Column count mismatch in file: ${filePath}. Skipping row.`);
            return; // Skip this row
          }
  
          rows.push(`(${values.join(', ')})`);
        })
        .on('end', () => {
          if (!columns.length) {
            console.warn(`No headers found in file: ${filePath}`);
            resolve(null); // Skip files without headers
            return;
          }
  
          // Generate CREATE TABLE statement
          const columnsWithTypes = columns.map((col, idx) => `${col} ${columnTypes[idx] || 'VARCHAR(255)'}`);
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS \`${tableName}\` (
              ${columnsWithTypes.join(',\n')}
            );
          `;
  
          // If there is no data, return only CREATE TABLE script
          if (!hasData) {
            console.warn(`No data rows found in file: ${filePath}. Only CREATE TABLE will be generated.`);
            resolve(createTableSQL);
            return;
          }
  
          // Generate INSERT statements
          const insertSQL = `
            INSERT INTO \`${tableName}\` (${columns.join(', ')})
            VALUES 
            ${rows.join(',\n')};
          `;
  
          resolve(`${createTableSQL}\n\n${insertSQL}`);
        })
        .on('error', (err) => reject(err));
    });
  }

  async function processCsvFiles() {
    try {
      const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.csv'));
      for (const file of files) {
        console.log(`Processing: ${file}`);
        const filePath = path.join(inputDir, file);
        const tableName = getTableName(file);
        console.log(`Extracted table name: ${tableName}`);
  
        const sql = await csvToSql(filePath, tableName);
  
        if (!sql) {
          console.warn(`Skipping file: ${file} as it has no valid content.`);
          continue;
        }
  
        const outputFileName = `${tableName}.sql`;
        const outputPath = path.join(outputDir, outputFileName);
  
        // Write SQL to file
        fs.writeFileSync(outputPath, sql);
        console.log(`SQL written to: ${outputPath}`);
      }
      console.log('All files processed successfully.');
    } catch (err) {
      console.error('Error processing files:', err);
    }
  }

  processCsvFiles()