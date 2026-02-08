const fs = require('fs');
const path = require('path');

const sourceDir = process.argv[2]; // User provides source folder path
const targetCollection = process.argv[3] || 'docs'; // 'docs' or 'blog'

if (!sourceDir) {
    console.log('Usage: node scripts/import-notes.js <source-folder-path> [collection]');
    process.exit(1);
}

const destDir = path.join(__dirname, '../content', targetCollection);

function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else if (entry.isFile() && entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Imported: ${entry.name}`);
        }
    }
}

try {
    console.log(`Importing notes from ${sourceDir} to ${destDir}...`);
    copyRecursive(sourceDir, destDir);
    console.log('Import complete.');
} catch (error) {
    console.error('Import failed:', error.message);
}
