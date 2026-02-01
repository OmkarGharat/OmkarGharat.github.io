const fs = require('fs');
const path = require('path');

const IGNORE = ['.git', 'node_modules', '_sidebar.md', '_navbar.md', '_coverpage.md', 'package.json', 'package-lock.json', '.gitignore'];

function getTitle(filePath, defaultValue) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/^#\s+(.*)/m);
        return match ? match[1].trim() : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

function generateSidebar(dir, level = 0) {
    let sidebar = '';
    const items = fs.readdirSync(dir, { withFileTypes: true })
        .filter(item => !IGNORE.includes(item.name) && !item.name.startsWith('.'));

    // Sort: Folders first, then files
    items.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
    });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
        const indent = '  '.repeat(level);

        if (item.isDirectory()) {
            const readmePath = path.join(fullPath, 'README.md');
            const hasReadme = fs.existsSync(readmePath);
            const title = hasReadme ? getTitle(readmePath, item.name) : item.name;
            const link = hasReadme ? `/${relativePath}/` : '';
            
            sidebar += `${indent}* [${title}](${link})\n`;
            sidebar += generateSidebar(fullPath, level + 1);
        } else if (item.name.endsWith('.md')) {
            if (item.name === 'README.md' && level > 0) continue; // Skip READMEs inside folders (handled by folder logic)
            if (item.name === 'README.md' && level === 0) {
                sidebar = `* [Home](/) \n` + sidebar;
                continue;
            }
            
            const title = getTitle(fullPath, item.name.replace('.md', ''));
            sidebar += `${indent}* [${title}](/${relativePath})\n`;
        }
    }
    return sidebar;
}

try {
    console.log('🔄 Generating sidebar...');
    const sidebarContent = generateSidebar(process.cwd());
    fs.writeFileSync('_sidebar.md', sidebarContent);
    console.log('✅ _sidebar.md updated successfully!');
} catch (err) {
    console.error('❌ Error generating sidebar:', err);
}
