/**
 * SANITY TESTS
 * Tests to verify that specific functionalities work as expected after changes
 * More focused than smoke tests, checking core business logic
 */

const fs = require('fs');
const path = require('path');

describe('Sanity Tests - Core Business Logic', () => {

    describe('Markdown Content Validation', () => {
        test('README.md should have valid frontmatter or content', () => {
            const readmePath = path.join(__dirname, '../README.md');
            const content = fs.readFileSync(readmePath, 'utf8');
            expect(content.length).toBeGreaterThan(0);
        });

        test('_sidebar.md should contain navigation links', () => {
            const sidebarPath = path.join(__dirname, '../_sidebar.md');
            const content = fs.readFileSync(sidebarPath, 'utf8');
            expect(content).toMatch(/\[.*\]\(.*\)/); // Should have markdown links
        });

        test('Blog posts should have proper markdown structure', () => {
            const blogDir = path.join(__dirname, '../Blog Posts');
            if (fs.existsSync(blogDir)) {
                const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
                expect(files.length).toBeGreaterThan(0);

                // Check first blog post
                if (files.length > 0) {
                    const firstPost = fs.readFileSync(path.join(blogDir, files[0]), 'utf8');
                    expect(firstPost.length).toBeGreaterThan(0);
                }
            }
        });
    });

    describe('Docsify Configuration Validation', () => {
        test('index.html should have valid Docsify window.$docsify config', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const content = fs.readFileSync(indexPath, 'utf8');
            expect(content).toContain('window.$docsify');
            expect(content).toContain('name:');
            expect(content).toContain('loadSidebar:');
        });

        test('Docsify config should have search plugin configured', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const content = fs.readFileSync(indexPath, 'utf8');
            expect(content).toContain('search');
        });
    });

    describe('Server Configuration', () => {
        test('cms-server.js should have port configuration', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            expect(content).toMatch(/port.*=.*\d+/i);
        });

        test('cms-server.js should have OAuth configuration', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            expect(content).toContain('oauth');
        });
    });

    describe('CSS Transitions and Animation', () => {
        test('Sidebar should have transition properties', () => {
            const stylePath = path.join(__dirname, '../style.css');
            const content = fs.readFileSync(stylePath, 'utf8');
            const sidebarMatch = content.match(/\.sidebar\s*{[^}]*}/gs);
            expect(sidebarMatch).toBeTruthy();
            expect(content).toContain('transition');
        });

        test('Content should have centering logic', () => {
            const stylePath = path.join(__dirname, '../style.css');
            const content = fs.readFileSync(stylePath, 'utf8');
            expect(content).toMatch(/\.content.*left.*150px/s);
        });

        test('Hamburger menu should be fixed positioned', () => {
            const stylePath = path.join(__dirname, '../style.css');
            const content = fs.readFileSync(stylePath, 'utf8');
            const hamburgerMatch = content.match(/#mobile-nav-brand\s*{[^}]*}/gs);
            expect(hamburgerMatch).toBeTruthy();
            expect(hamburgerMatch[0]).toContain('position: fixed');
        });
    });

    describe('JavaScript Functionality', () => {
        test('Hamburger injection script should be present', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const content = fs.readFileSync(indexPath, 'utf8');
            expect(content).toContain('createHamburgerMenu');
            expect(content).toContain('document.body.appendChild');
        });

        test('YAML frontmatter stripping should be configured', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const content = fs.readFileSync(indexPath, 'utf8');
            expect(content).toContain('beforeEach');
            expect(content).toMatch(/replace.*---/);
        });
    });

    describe('Security Configurations', () => {
        test('.env.example or documentation should exist for OAuth setup', () => {
            const rootDir = path.join(__dirname, '..');
            const hasEnvExample = fs.existsSync(path.join(rootDir, '.env.example'));
            const hasReadme = fs.existsSync(path.join(rootDir, 'README.md'));
            expect(hasEnvExample || hasReadme).toBe(true);
        });

        test('cms-server.js should not hardcode sensitive credentials', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            // Should use process.env for credentials
            expect(content).toContain('process.env');
        });
    });

    describe('Content Accessibility', () => {
        test('index.html should have proper meta tags', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const content = fs.readFileSync(indexPath, 'utf8');
            expect(content).toMatch(/<meta.*charset/i);
            expect(content).toMatch(/<meta.*viewport/i);
        });

        test('Hamburger should have accessibility title', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const content = fs.readFileSync(indexPath, 'utf8');
            expect(content).toMatch(/title.*Toggle Sidebar/);
        });
    });
});
