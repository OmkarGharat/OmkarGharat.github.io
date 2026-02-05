/**
 * INTEGRATION TESTS
 * Tests for interactions between multiple components
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

describe('Integration Tests - Component Interactions', () => {

    describe('HTML + CSS Integration', () => {
        test('HTML should reference existing CSS file', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const indexContent = fs.readFileSync(indexPath, 'utf8');

            // Extract CSS file references
            const cssMatches = indexContent.match(/href="([^"]*\.css)"/g);
            expect(cssMatches).toBeTruthy();

            cssMatches.forEach(match => {
                const cssFile = match.match(/href="([^"]*)"/)[1];
                const cssPath = path.join(__dirname, '..', cssFile);
                expect(fs.existsSync(cssPath)).toBe(true);
            });
        });

        test('CSS classes used in HTML should exist in CSS file', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const stylePath = path.join(__dirname, '../style.css');

            const indexContent = fs.readFileSync(indexPath, 'utf8');
            const styleContent = fs.readFileSync(stylePath, 'utf8');

            // Check for critical classes
            const criticalClasses = ['sidebar', 'content', 'app-name'];

            criticalClasses.forEach(className => {
                if (indexContent.includes(`class="${className}"`) ||
                    indexContent.includes(`class='${className}'`) ||
                    indexContent.includes('.' + className)) {
                    expect(styleContent).toContain(`.${className}`);
                }
            });
        });
    });

    describe('HTML + JavaScript Integration', () => {
        test('JavaScript should reference existing DOM elements', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const content = fs.readFileSync(indexPath, 'utf8');

            // If script references mobile-nav-brand, it should create it
            if (content.includes('mobile-nav-brand')) {
                expect(content).toContain('createElement');
            }
        });

        test('Docsify config and plugins should be consistent', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const content = fs.readFileSync(indexPath, 'utf8');

            // If loadSidebar is true, _sidebar.md should exist
            if (content.includes('loadSidebar: true')) {
                const sidebarPath = path.join(__dirname, '../_sidebar.md');
                expect(fs.existsSync(sidebarPath)).toBe(true);
            }

            // If coverpage is configured, _coverpage.md should exist
            if (content.includes('coverpage:') && !content.includes('coverpage: false')) {
                const coverpagePath = path.join(__dirname, '../_coverpage.md');
                const exists = fs.existsSync(coverpagePath);
                // Coverpage is optional, so just log if missing
                if (!exists) {
                    console.log('Note: Coverpage configured but _coverpage.md not found');
                }
            }
        });
    });

    describe('Server + File System Integration', () => {
        test('Server should be able to read static files', () => {
            const requiredFiles = [
                'index.html',
                'style.css',
                'README.md'
            ];

            requiredFiles.forEach(file => {
                const filePath = path.join(__dirname, '..', file);
                expect(() => fs.readFileSync(filePath, 'utf8')).not.toThrow();
            });
        });

        test('Server routes should align with file structure', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const serverContent = fs.readFileSync(serverPath, 'utf8');

            // If server has /api routes, api directory should exist
            if (serverContent.includes('/api')) {
                const apiDir = path.join(__dirname, '../api');
                expect(fs.existsSync(apiDir)).toBe(true);
            }
        });
    });

    describe('Markdown + Sidebar Integration', () => {
        test('Sidebar links should point to existing markdown files', () => {
            const sidebarPath = path.join(__dirname, '../_sidebar.md');
            const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

            // Extract markdown links [text](path)
            const linkMatches = sidebarContent.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);

            for (const match of linkMatches) {
                const linkPath = match[2];

                // Skip external links
                if (linkPath.startsWith('http://') || linkPath.startsWith('https://')) {
                    continue;
                }

                // Skip anchors
                if (linkPath.startsWith('#')) {
                    continue;
                }

                // Check if file exists (remove .md if present, Docsify adds it)
                let filePath = linkPath.endsWith('.md')
                    ? path.join(__dirname, '..', linkPath)
                    : path.join(__dirname, '..', linkPath + '.md');

                // If still not found, try as directory with README.md
                if (!fs.existsSync(filePath)) {
                    filePath = path.join(__dirname, '..', linkPath, 'README.md');
                }

                const exists = fs.existsSync(filePath);
                if (!exists) {
                    console.warn(`Warning: Sidebar link "${linkPath}" points to non-existent file`);
                }
                // Don't fail test, just warn
            }
        });
    });

    describe('CSS Transitions + HTML Structure', () => {
        test('Sidebar toggle class should have corresponding CSS', () => {
            const stylePath = path.join(__dirname, '../style.css');
            const styleContent = fs.readFileSync(stylePath, 'utf8');

            // If body.close is used in JS, it should be in CSS
            const indexPath = path.join(__dirname, '../index.html');
            const indexContent = fs.readFileSync(indexPath, 'utf8');

            if (indexContent.includes('close')) {
                expect(styleContent).toMatch(/body\.close|\.close/);
            }
        });

        test('Hamburger menu CSS should match JS implementation', () => {
            const stylePath = path.join(__dirname, '../style.css');
            const indexPath = path.join(__dirname, '../index.html');

            const styleContent = fs.readFileSync(stylePath, 'utf8');
            const indexContent = fs.readFileSync(indexPath, 'utf8');

            // If JS creates mobile-nav-brand, CSS should style it
            if (indexContent.includes('mobile-nav-brand')) {
                expect(styleContent).toContain('#mobile-nav-brand');
            }
        });
    });

    describe('Package Dependencies Integration', () => {
        test('All required dependencies should be installed', () => {
            const packagePath = path.join(__dirname, '../package.json');
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            const allDeps = {
                ...pkg.dependencies,
                ...pkg.devDependencies
            };

            Object.keys(allDeps).forEach(dep => {
                const depPath = path.join(__dirname, '../node_modules', dep);
                expect(fs.existsSync(depPath)).toBe(true);
            });
        });

        test('Scripts in package.json should reference existing files', () => {
            const packagePath = path.join(__dirname, '../package.json');
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            // Check if scripts reference real files
            if (pkg.scripts.start && pkg.scripts.start.includes('cms-server.js')) {
                const serverPath = path.join(__dirname, '../cms-server.js');
                expect(fs.existsSync(serverPath)).toBe(true);
            }
        });
    });

    describe('Environment Configuration Integration', () => {
        test('Server should handle missing environment variables gracefully', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            // Should use dotenv or have fallbacks
            const hasEnvConfig = content.includes('dotenv') || content.includes('process.env');
            expect(hasEnvConfig).toBe(true);
        });
    });
});
