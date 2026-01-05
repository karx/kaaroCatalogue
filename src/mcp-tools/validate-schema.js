
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(__dirname, '..', 'data', 'schema', 'catalog-schema.json');
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalogs', 'poets-index.json');

async function validateCatalog() {
    try {
        console.log('🔍 Loading schema and catalog...');
        const schemaContent = await fs.readFile(SCHEMA_PATH, 'utf-8');
        const catalogContent = await fs.readFile(CATALOG_PATH, 'utf-8');

        const schema = JSON.parse(schemaContent);
        const catalog = JSON.parse(catalogContent);

        const ajv = new Ajv({ allErrors: true });
        addFormats(ajv);

        console.log('🏗️  Compiling schema...');
        const validate = ajv.compile(schema);
        const validateCatalog = ajv.getSchema('#/definitions/Catalog');

        console.log('🧪 Validating catalog...');
        const valid = validateCatalog(catalog);

        if (valid) {
            console.log('✅ Catalog is valid!');
        } else {
            console.error('❌ Validation failed with errors:');
            validateCatalog.errors.forEach(err => {
                console.error(`   - ${err.instancePath} ${err.message}`);
            });
            process.exit(1);
        }

    } catch (error) {
        console.error('🚨 Error:', error.message);
        process.exit(1);
    }
}

validateCatalog();
