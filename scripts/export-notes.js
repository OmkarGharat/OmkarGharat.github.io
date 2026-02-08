const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const contentDir = path.join(__dirname, '../content');
const outputDir = path.join(__dirname, '../exports');
const outputFile = path.join(outputDir, `notes-export-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`);

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Check for zip command availability
try {
    // Basic zip command: zip -r output.zip folder
    console.log(`Exporting content from ${contentDir} to ${outputFile}...`);
    // Note: 'zip' command logic varies by OS. Since we know user is on Windows, we might need Powershell Compress-Archive or a node library. 
    // Using a pure node approach with 'adm-zip' would be better but requires dependency.
    // For now, let's try using tar which is often available, or just suggest manual copy if simple script is needed.
    // Actually, asking user to install 'adm-zip' is better.
    // But since I cannot easily install deps without permission, I will use a simple file copy script for "backup" instead of zip for now, or use PowerShell command.

    // PowerShell command for zipping
    const psCommand = `Compress-Archive -Path "${contentDir}" -DestinationPath "${outputFile}" -Force`;
    execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });

    console.log(`Export complete: ${outputFile}`);
} catch (error) {
    console.error('Export failed:', error.message);
}
