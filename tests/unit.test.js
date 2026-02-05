/**
 * UNIT TESTS
 * Tests for individual units/functions in isolation
 */

const fs = require('fs');
const path = require('path');

describe('Unit Tests - Individual Components', () => {

    describe('File System Utilities', () => {
        test('should be able to read index.html', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const content = fs.readFileSync(indexPath, 'utf8');
            expect(typeof content).toBe('string');
            expect(content.length).toBeGreaterThan(0);
        });

        test('should be able to parse JSON from package.json', () => {
            const packagePath = path.join(__dirname, '../package.json');
            const content = fs.readFileSync(packagePath, 'utf8');
            const parsed = JSON.parse(content);
            expect(typeof parsed).toBe('object');
        });
    });

    describe('Content Parsing', () => {
        test('should correctly identify markdown files', () => {
            const testFilenames = [
                'test.md',
                'README.md',
                'test.txt',
                'test.html'
            ];

            const isMarkdown = (filename) => filename.endsWith('.md');

            expect(isMarkdown(testFilenames[0])).toBe(true);
            expect(isMarkdown(testFilenames[1])).toBe(true);
            expect(isMarkdown(testFilenames[2])).toBe(false);
            expect(isMarkdown(testFilenames[3])).toBe(false);
        });

        test('should extract title from markdown frontmatter format', () => {
            const sampleContent = `---
title: Test Blog Post
date: 2024-01-01
---

# Content here`;

            const extractTitle = (content) => {
                const match = content.match(/^---[\r\n]+.*?title:\s*(.+?)[\r\n]/m);
                return match ? match[1].trim() : null;
            };

            expect(extractTitle(sampleContent)).toBe('Test Blog Post');
        });

        test('should extract date from markdown frontmatter', () => {
            const sampleContent = `---
title: Test Post
date: 2024-01-01
---`;

            const extractDate = (content) => {
                const match = content.match(/^---[\r\n]+.*?date:\s*(.+?)[\r\n]/ms);
                return match ? match[1].trim() : null;
            };

            expect(extractDate(sampleContent)).toBe('2024-01-01');
        });
    });

    describe('Path Utilities', () => {
        test('should create valid slugs from titles', () => {
            const createSlug = (title) => {
                return title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            };

            expect(createSlug('Hello World')).toBe('hello-world');
            expect(createSlug('Test & Example!')).toBe('test-example');
            expect(createSlug('---Multiple---Dashes---')).toBe('multiple-dashes');
        });

        test('should sanitize file paths', () => {
            const sanitizePath = (filepath) => {
                return filepath.replace(/[<>:"|?*]/g, '');
            };

            expect(sanitizePath('test<file>.md')).toBe('testfile.md');
            expect(sanitizePath('path:with:colons')).toBe('pathwithcolons');
        });
    });

    describe('CSS Value Parsing', () => {
        test('should extract numerical values from CSS strings', () => {
            const extractNumber = (cssValue) => {
                const match = cssValue.match(/(\d+)px/);
                return match ? parseInt(match[1], 10) : null;
            };

            expect(extractNumber('150px')).toBe(150);
            expect(extractNumber('300px')).toBe(300);
            expect(extractNumber('auto')).toBe(null);
        });

        test('should validate color values', () => {
            const isValidHex = (color) => /^#[0-9A-Fa-f]{6}$/.test(color);

            expect(isValidHex('#ffffff')).toBe(true);
            expect(isValidHex('#000000')).toBe(true);
            expect(isValidHex('#gggggg')).toBe(false);
            expect(isValidHex('white')).toBe(false);
        });
    });

    describe('String Manipulation', () => {
        test('should trim whitespace correctly', () => {
            const testString = '  test string  ';
            expect(testString.trim()).toBe('test string');
        });

        test('should replace multiple spaces with single space', () => {
            const normalizeSpaces = (str) => str.replace(/\s+/g, ' ');
            expect(normalizeSpaces('test    string')).toBe('test string');
        });

        test('should capitalize first letter', () => {
            const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('world')).toBe('World');
        });
    });

    describe('Array Operations', () => {
        test('should filter markdown files from mixed array', () => {
            const files = ['test.md', 'style.css', 'README.md', 'script.js'];
            const mdFiles = files.filter(f => f.endsWith('.md'));
            expect(mdFiles).toEqual(['test.md', 'README.md']);
        });

        test('should sort files alphabetically', () => {
            const files = ['c.md', 'a.md', 'b.md'];
            expect(files.sort()).toEqual(['a.md', 'b.md', 'c.md']);
        });
    });

    describe('Date Utilities', () => {
        test('should validate ISO date format', () => {
            const isValidDate = (dateStr) => !isNaN(Date.parse(dateStr));

            expect(isValidDate('2024-01-01')).toBe(true);
            expect(isValidDate('2024-13-01')).toBe(false);
            expect(isValidDate('not-a-date')).toBe(false);
        });

        test('should format date correctly', () => {
            const formatDate = (date) => {
                const d = new Date(date);
                return d.toISOString().split('T')[0];
            };

            const testDate = new Date('2024-01-15');
            expect(formatDate(testDate)).toBe('2024-01-15');
        });
    });

    describe('URL Utilities', () => {
        test('should build proper URLs', () => {
            const buildUrl = (base, path) => {
                return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
            };

            expect(buildUrl('http://localhost:3000/', '/api/test')).toBe('http://localhost:3000/api/test');
            expect(buildUrl('http://localhost:3000', 'api/test')).toBe('http://localhost:3000/api/test');
        });
    });
});
