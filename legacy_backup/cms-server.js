/**
 * ⚠️ SECURITY WARNING ⚠️
 * This file is for LOCAL DEVELOPMENT ONLY.
 */
require('dotenv').config(); // Load local environment variables
const http = require('http');
const fs = require('fs');
const path = require('path');
const { AuthorizationCode } = require('simple-oauth2');

let PORT = 50171;
const IGNORE = ['.git', 'node_modules', '_sidebar.md', '_navbar.md', '_coverpage.md', 'package.json', 'package-lock.json', 'yarn.lock', '.gitignore', 'cms-server.js', 'gen-sidebar.js', '.nojekyll', 'admin', 'assets', 'style.css'];

// --- SIDEBAR GENERATOR LOGIC (Omitted for brevity in this display, but kept in file) ---
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
    if (level === 0) sidebar += `* [Home](/#/) \n`;
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
                sidebar += generateSidebar(fullPath, level);
                continue;
            }
            const readmePath = path.join(fullPath, 'README.md');
            const hasReadme = fs.existsSync(readmePath);
            const title = hasReadme ? getTitle(readmePath, item.name) : item.name;
            const link = hasReadme ? `/#/${relativePath}/` : '';
            sidebar += `${indent}* [${title}](${link})\n`;
            sidebar += generateSidebar(fullPath, level + 1);
        } else if (item.name.endsWith('.md')) {
            if (item.name === 'README.md') continue;
            const title = getTitle(fullPath, item.name.replace('.md', ''));
            sidebar += `${indent}* [${title}](/#/${relativePath})\n`;
        }
    }
    return sidebar;
}

// --- OAUTH CLIENT SETUP ---
const oauthDetails = {
    client: {
        id: process.env.OAUTH_CLIENT_ID,
        secret: process.env.OAUTH_CLIENT_SECRET,
    },
    auth: {
        tokenHost: 'https://github.com',
        tokenPath: '/login/oauth/access_token',
        authorizePath: '/login/oauth/authorize',
    },
};

// --- SERVER LOGIC ---
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // LOCAL OAUTH: AUTH (Starts the flow)
    if (url.pathname === '/api/auth') {
        if (!process.env.OAUTH_CLIENT_ID) {
            res.writeHead(500);
            res.end("Error: OAUTH_CLIENT_ID not set in .env file");
            return;
        }
        const client = new AuthorizationCode(oauthDetails);
        const authorizationUri = client.authorizeURL({
            redirect_uri: `http://${req.headers.host}/api/callback`,
            scope: 'repo,user',
            state: Math.random().toString(36).substring(2),
        });
        res.writeHead(302, { Location: authorizationUri });
        res.end();
        return;
    }

    // LOCAL OAUTH: CALLBACK (Finishes the flow)
    if (url.pathname === '/api/callback') {
        const code = url.searchParams.get('code');
        console.log(`📡 Received Auth Code from GitHub: ${code ? 'YES' : 'NO'}`);

        const client = new AuthorizationCode(oauthDetails);
        try {
            console.log("🔄 Exchanging code for access token...");
            const accessToken = await client.getToken({
                code,
                redirect_uri: `http://${req.headers.host}/api/callback`,
            });
            const token = accessToken.token.access_token;
            const provider = 'github';
            console.log("✅ Token Exchange Successful! Sending token to admin panel.");

            const script = `
                <script>
                (function() {
                    const token = "` + token + `";
                    const provider = "` + provider + `";
                    const content = JSON.stringify({ token: token, provider: provider });
                    
                    if (window.opener && window.opener !== window) {
                        window.opener.postMessage("authorization:" + provider + ":success:" + content, "*");
                        console.log("✅ Handshake sent to Hook.");
                        setTimeout(function() { window.close(); }, 1000);
                    } else {
                        document.body.innerHTML = "<h1>✅ Local API Test Success!</h1><p>Token: " + token.substring(0, 10) + "...</p><p><b>Please use the Login button on http://localhost:50171/admin/</b></p>";
                    }
                })();
                </script>
                <div style="text-align: center; font-family: sans-serif; padding-top: 50px;">
                    <h1>🔗 Authentication Successful</h1>
                    <p>Redirecting you back to the admin panel...</p>
                    <button onclick="window.forceLogin()" style="padding: 10px 20px; background: #2ea44f; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
                        Click here if you are not redirected
                    </button>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">Token: ` + token.substring(0, 10) + `...</p>
                </div>
            `;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(script);
        } catch (error) {
            console.error('Local Access Token Error', error.message);
            res.writeHead(500);
            res.end('Authentication failed');
        }
        return;
    }

    // ORIGINAL SERVER LOGIC (Save, Create, Static files) follows...
    if (req.method === 'POST' && req.url === '/api/save') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const data = JSON.parse(body);
            const filePath = path.join(process.cwd(), data.path.startsWith('/') ? data.path.substring(1) : data.path);
            fs.writeFileSync(filePath, data.content);
            const sidebar = generateSidebar(process.cwd());
            fs.writeFileSync('_sidebar.md', sidebar);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/api/create') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const data = JSON.parse(body);
            const fileName = data.title.toLowerCase().replace(/ /g, '-') + '.md';
            const dirPath = path.join(process.cwd(), data.folder);
            const filePath = path.join(dirPath, fileName);
            if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
            fs.writeFileSync(filePath, `# ${data.title}\n\nStart writing here...`);
            const sidebar = generateSidebar(process.cwd());
            fs.writeFileSync('_sidebar.md', sidebar);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, path: filePath.replace(process.cwd(), '').replace(/\\/g, '/') }));
        });
        return;
    }

    let filePath = '.' + url.pathname;
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
        if (!url.pathname.endsWith('/')) {
            res.writeHead(301, { 'Location': url.pathname + '/' });
            res.end();
            return;
        }
        if (fs.existsSync(path.join(filePath, 'index.html'))) {
            filePath = path.join(filePath, 'index.html');
        }
    }
    if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.md')) {
        filePath += '.md';
    } else if (filePath === './') {
        filePath = './index.html';
    }

    const extname = path.extname(filePath).toLowerCase();
    let contentType = 'text/html';
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.md': contentType = 'text/markdown'; break;
        case '.yml': contentType = 'text/yaml'; break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(error.code == 'ENOENT' ? 404 : 500);
            res.end(error.code == 'ENOENT' ? 'Not found' : 'Server error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

function startServer(port) {
    server.listen(port, () => {
        console.log(`🚀 Local Dev Server with OAuth: http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') startServer(port + 1);
    });
}
startServer(PORT);
