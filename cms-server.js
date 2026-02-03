const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = 50171;
const IGNORE = ['.git', 'node_modules', '_sidebar.md', '_navbar.md', '_coverpage.md', 'package.json', 'package-lock.json', 'yarn.lock', '.gitignore', 'cms-server.js', 'gen-sidebar.js', '.nojekyll', 'admin', 'assets', 'style.css'];

// --- SIDEBAR GENERATOR LOGIC ---
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

    // Initial Home link only at top level
    if (level === 0) {
        sidebar += `* [Home](/) \n`;
    }

    const items = fs.readdirSync(dir, { withFileTypes: true })
        .filter(item => !IGNORE.includes(item.name) && !item.name.startsWith('.'));

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
            if (item.name === 'posts') {
                // Flatten 'posts' folder: Skip adding the folder item, 
                // but regenerate children at the CURRENT level (so they appear as siblings of 'posts' parent)
                sidebar += generateSidebar(fullPath, level);
                continue;
            }

            const readmePath = path.join(fullPath, 'README.md');
            const hasReadme = fs.existsSync(readmePath);
            const title = hasReadme ? getTitle(readmePath, item.name) : item.name;
            const link = hasReadme ? `/${relativePath}/` : '';
            sidebar += `${indent}* [${title}](${link})\n`;
            sidebar += generateSidebar(fullPath, level + 1);
        } else if (item.name.endsWith('.md')) {
            if (item.name === 'README.md') continue;

            const title = getTitle(fullPath, item.name.replace('.md', ''));
            sidebar += `${indent}* [${title}](/${relativePath})\n`;
        }
    }
    return sidebar;
}

// --- SERVER LOGIC ---
const server = http.createServer((req, res) => {
    // API: Save File
    if (req.method === 'POST' && req.url === '/api/save') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const data = JSON.parse(body);
            const filePath = path.join(process.cwd(), data.path.startsWith('/') ? data.path.substring(1) : data.path);

            console.log(`💾 Saving: ${filePath}`);
            fs.writeFileSync(filePath, data.content);

            // Refresh sidebar in case titles changed
            const sidebar = generateSidebar(process.cwd());
            fs.writeFileSync('_sidebar.md', sidebar);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        });
        return;
    }

    // API: Create File
    if (req.method === 'POST' && req.url === '/api/create') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const data = JSON.parse(body);
            const fileName = data.title.toLowerCase().replace(/ /g, '-') + '.md';
            const dirPath = path.join(process.cwd(), data.folder);
            const filePath = path.join(dirPath, fileName);

            if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

            const initialContent = `# ${data.title}\n\nStart writing here...`;
            fs.writeFileSync(filePath, initialContent);

            const sidebar = generateSidebar(process.cwd());
            fs.writeFileSync('_sidebar.md', sidebar);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, path: filePath.replace(process.cwd(), '').replace(/\\/g, '/') }));
        });
        return;
    }

    // Static File Serving
    let filePath = '.' + req.url;
    // Strip query strings
    const urlPath = req.url.split('?')[0];
    filePath = '.' + urlPath;

    // Handle Directory Indexing & Trailing Slahes
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
        // If directory access without trailing slash, redirect!
        // This fixes loading relative assets like config.yml
        if (!urlPath.endsWith('/')) {
            res.writeHead(301, { 'Location': urlPath + '/' });
            res.end();
            return;
        }

        if (fs.existsSync(path.join(filePath, 'index.html'))) {
            filePath = path.join(filePath, 'index.html');
        } else if (fs.existsSync(path.join(filePath, 'README.md'))) {
            filePath = path.join(filePath, 'README.md');
        }
    }

    // Auto-append .md if it's a docsify route (and file didn't exist)
    if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.md')) {
        filePath += '.md';
    } else if (filePath === './') {
        filePath = './index.html';
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.md': contentType = 'text/markdown'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
        case '.yml': contentType = 'text/yaml'; break; /* Add YAML support */
        case '.yaml': contentType = 'text/yaml'; break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Function to start server with port hunting
function startServer(port) {
    server.listen(port, () => {
        // Run Initial Sidebar Gen
        const sidebarContent = generateSidebar(process.cwd());
        fs.writeFileSync('_sidebar.md', sidebarContent);

        console.log(`
🚀 Digital Garden CMS is Live!
--------------------------------
🌍 Site: http://localhost:${port}
✍️  Write mode: Enabled (Local only)
        `);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️  Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('❌ Server error:', err);
        }
    });
}

startServer(PORT);
