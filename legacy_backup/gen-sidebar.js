const fs = require('fs');
const path = require('path');

// Global Ignore List
const IGNORE = [
    '.git', 'node_modules', 'vendor',
    '_sidebar.md', '_navbar.md', '_coverpage.md',
    'package.json', 'package-lock.json', '.gitignore',
    'gen-sidebar.js', 'cms-server.js', 'jest.config.js',
    'style.css', 'index.html', 'assets', 'api', 'tests', 'admin'
];

/**
 * Extracts the title from an MD file (first H1) or uses the filename
 */
function getTitle(filePath, defaultValue) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/^#\s+(.*)/m);
        return match ? match[1].trim() : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

/**
 * Recursively generates sidebar entries for a given directory
 * @param {string} rootDir - The absolute root of the repo (process.cwd())
 * @param {string} dirToScan - The absolute path to the directory being scanned
 * @param {number} level - Indentation level
 */
function generateSidebarForDir(rootDir, dirToScan, level = 0) {
    let sidebar = '';

    // Safety check
    if (!fs.existsSync(dirToScan)) return '';

    const items = fs.readdirSync(dirToScan, { withFileTypes: true })
        .filter(item => !IGNORE.includes(item.name) && !item.name.startsWith('.'));

    // Sort: Folders first, then Files
    items.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
    });

    for (const item of items) {
        const fullPath = path.join(dirToScan, item.name);

        // Calculate absolute path valid for the website (e.g., /blog/post1.md)
        // This ensures links work regardless of where the sidebar file is located
        const webPath = '/#/' + path.relative(rootDir, fullPath).replace(/\\/g, '/');
        const indent = '  '.repeat(level);

        if (item.isDirectory()) {
            const readmePath = path.join(fullPath, 'README.md');
            const hasReadme = fs.existsSync(readmePath);
            const title = hasReadme ? getTitle(readmePath, item.name) : item.name;
            const link = hasReadme ? `${webPath}/` : ''; // Link to folder root (README)

            sidebar += `${indent}* [${title}](${link})\n`;

            // Recurse
            sidebar += generateSidebarForDir(rootDir, fullPath, level + 1);

        } else if (item.name.endsWith('.md')) {
            // Skip READMEs as they are usually covered by the parent folder link
            if (item.name.toLowerCase() === 'readme.md') continue;

            const title = getTitle(fullPath, item.name.replace('.md', ''));
            sidebar += `${indent}* [${title}](${webPath})\n`;
        }
    }
    return sidebar;
}

// Configuration: Which sidebars to generate
const SECTIONS = [
    {
        type: 'root',
        path: '.',
        output: '_sidebar.md'
    },
    {
        type: 'content',
        path: 'blog',
        output: 'blog/_sidebar.md'
    },
    {
        type: 'content',
        path: 'guides',
        output: 'guides/_sidebar.md'
    },
    {
        type: 'content',
        path: 'projects',
        output: 'projects/_sidebar.md'
    }
];

// Main Execution
try {
    console.log('🚀 Starting Sidebar Generation...');

    SECTIONS.forEach(section => {
        const fullPath = path.join(process.cwd(), section.path);
        const outputFile = path.join(process.cwd(), section.output);
        let content = '';

        if (section.type === 'root') {
            // Static Root Hub Sidebar
            console.log(`Creating Root Hub Sidebar...`);
            content += `* [Home](/#/) \n`;
            content += `* [Blog](/#/blog/) \n`;
            content += `* [Guides](/#/guides/) \n`;
            content += `* [Projects](/#/projects/) \n`;
            content += `* [About Me](/#/about.md) \n`;
            content += `* [Security Policy](/#/SECURITY.md) \n`;
        } else {
            // Dynamic Content Sidebar
            console.log(`Scanning ${section.path}...`);
            // Add a "Back Link" or "Section Title" if desired
            // content += `* [🔙 **Main Menu**](/#/)\n`; 
            // content += `* **${section.path.toUpperCase()}**\n`;

            content += generateSidebarForDir(process.cwd(), fullPath);
        }

        fs.writeFileSync(outputFile, content);
        console.log(`✅ Generated: ${section.output}`);
    });

    console.log('✨ All Sidebars Updated Successfully!');

} catch (err) {
    console.error('❌ Error:', err);
}
