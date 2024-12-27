# CSV to MySQL Converter

This Node.js project converts multiple CSV files into MySQL-compatible SQL scripts. It generates `.sql` file containing `CREATE TABLE` and `INSERT` statements for all the CSV files in a specified directory.

## Features

- Converts CSV data into `CREATE TABLE` and `INSERT INTO` SQL statements.
- Supports multiple CSV files in a directory.
- Automatically detects table names based on CSV file names.
- Skips empty or invalid files.
- Outputs all SQL into a single combined `.sql` file.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sumitnair26/csv-to-mysql.git
   cd csv-to-mysql
   
2. Install dependencies:
	`npm install`

##Usage

1. Place your CSV files in the csv directory.

2. Run the script:

	`node convert.js`
	
	`node convert_in_single_file.js`
	
##Directory Structure

		csv-to-mysql/
		├── csv/            	  # Directory to store your input CSV files
		│   ├── file1.csv
		│   ├── file2.csv
		├── combined.sql          # Generated Single SQL script (output)
		├── convertCsvToSql.js    # Converts each CSV files to SQL and store seperate files to a folder 
		├── package.json          # Node.js dependencies and metadata
		└── README.md             # Project documentation




