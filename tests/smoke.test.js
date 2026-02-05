/**
 * SMOKE TESTS
 * Quick tests to verify the basic functionality of the application
 * Should run first and fast to catch critical issues
 */

const fs = require('fs');
const path = require('path');

describe('Smoke Tests - Critical Functionality', () => {

    describe('File Existence Tests', () => {
        test('index.html should exist', () => {
            const indexPath = path.join(__dirname, '../index.html');
            expect(fs.existsSync(indexPath)).toBe(true);
        });

        test('style.css should exist', () => {
            const stylePath = path.join(__dirname, '../style.css');
            expect(fs.existsSync(stylePath)).toBe(true);
        });

        test('_sidebar.md should exist', () => {
            const sidebarPath = path.join(__dirname, '../_sidebar.md');
            expect(fs.existsSync(sidebarPath)).toBe(true);
        });

        test('README.md should exist', () => {
            const readmePath = path.join(__dirname, '../README.md');
            expect(fs.existsSync(readmePath)).toBe(true);
        });
    });

    describe('Configuration Files', () => {
        test('package.json should be valid JSON', () => {
            const packagePath = path.join(__dirname, '../package.json');
            const packageContent = fs.readFileSync(packagePath, 'utf8');
            expect(() => JSON.parse(packageContent)).not.toThrow();
        });

        test('package.json should have required fields', () => {
            const packagePath = path.join(__dirname, '../package.json');
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            expect(pkg.name).toBeDefined();
            expect(pkg.version).toBeDefined();
            expect(pkg.scripts).toBeDefined();
        });
    });

    describe('Server File Tests', () => {
        test('cms-server.js should exist', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            expect(fs.existsSync(serverPath)).toBe(true);
        });

        test('cms-server.js should be valid JavaScript', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const serverContent = fs.readFileSync(serverPath, 'utf8');
            expect(() => require(serverPath)).not.toThrow();
        });
    });

    describe('Content Structure', () => {
        test('blog directory should exist', () => {
            const blogPath = path.join(__dirname, '../blog');
            expect(fs.existsSync(blogPath)).toBe(true);
        });

        test('api directory should exist', () => {
            const apiPath = path.join(__dirname, '../api');
            expect(fs.existsSync(apiPath)).toBe(true);
        });
    });

    describe('HTML Structure Validation', () => {
        test('index.html should contain app div', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const indexContent = fs.readFileSync(indexPath, 'utf8');
            expect(indexContent).toContain('id="app"');
        });

        test('index.html should include Docsify script', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const indexContent = fs.readFileSync(indexPath, 'utf8');
            expect(indexContent).toContain('docsify');
        });

        test('index.html should have hamburger menu injection script', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const indexContent = fs.readFileSync(indexPath, 'utf8');
            expect(indexContent).toContain('mobile-nav-brand');
        });
    });

    describe('CSS Validation', () => {
        test('style.css should contain sidebar styles', () => {
            const stylePath = path.join(__dirname, '../style.css');
            const styleContent = fs.readFileSync(stylePath, 'utf8');
            expect(styleContent).toContain('.sidebar');
        });

        test('style.css should contain content styles', () => {
            const stylePath = path.join(__dirname, '../style.css');
            const styleContent = fs.readFileSync(stylePath, 'utf8');
            expect(styleContent).toContain('.content');
        });

        test('style.css should contain hamburger menu styles', () => {
            const stylePath = path.join(__dirname, '../style.css');
            const styleContent = fs.readFileSync(stylePath, 'utf8');
            expect(styleContent).toContain('#mobile-nav-brand');
        });
    });
});
