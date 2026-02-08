'use server';

import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

export async function exportContent() {
    try {
        const zip = new AdmZip();
        const contentDir = path.join(process.cwd(), 'content');
        const outputDir = path.join(process.cwd(), 'public', 'exports');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `backup-${timestamp}.zip`;
        const outputPath = path.join(outputDir, fileName);

        // Ensure export dir exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Add content folder to zip
        zip.addLocalFolder(contentDir);

        // Write zip to disk
        zip.writeZip(outputPath);

        return { success: true, url: `/exports/${fileName}` };
    } catch (error) {
        console.error('Export failed:', error);
        return { success: false, message: 'Export failed' };
    }
}

export async function importContent(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'replace' or 'merge' (default merge) or collection name? 
        // Actually user wants to import notes. 
        // Strategy: unzip to content folder. 

        if (!file) {
            return { success: false, message: 'No file provided' };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const zip = new AdmZip(buffer);
        const targetDir = path.join(process.cwd(), 'content');

        // Extract all
        zip.extractAllTo(targetDir, true); // overwrite = true

        return { success: true, message: 'Content imported successfully' };
    } catch (error) {
        console.error('Import failed:', error);
        return { success: false, message: 'Import failed' };
    }
}
