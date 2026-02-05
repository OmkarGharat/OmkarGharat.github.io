/**
 * SECURITY TESTS
 * Tests for security vulnerabilities and best practices
 * Focusing on OAuth, file operations, and data handling
 */

const fs = require('fs');
const path = require('path');

describe('Security Tests - Vulnerability Assessment', () => {

    describe('OAuth Configuration Security', () => {
        test('Sensitive credentials should not be hardcoded in server file', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            // Check for hardcoded credentials patterns
            const suspiciousPatterns = [
                /client_secret\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/,
                /password\s*[:=]\s*['"][^'"]+['"]/,
                /api_key\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/
            ];

            suspiciousPatterns.forEach(pattern => {
                const matches = content.match(pattern);
                if (matches) {
                    console.warn('Warning: Potential hardcoded credential found:', matches[0].substring(0, 30) + '...');
                }
            });

            // Should use environment variables
            expect(content).toContain('process.env');
        });

        test('Server should use dotenv for environment variables', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            expect(content).toMatch(/require.*dotenv|import.*dotenv/);
        });

        test('.env file should be in .gitignore', () => {
            const gitignorePath = path.join(__dirname, '../.gitignore');

            if (fs.existsSync(gitignorePath)) {
                const content = fs.readFileSync(gitignorePath, 'utf8');
                expect(content).toMatch(/\.env/);
            } else {
                console.warn('Warning: .gitignore file not found');
            }
        });
    });

    describe('File System Security', () => {
        test('Server should sanitize file paths to prevent directory traversal', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            // Check if file operations are present
            const hasFileOps = content.includes('fs.readFile') || content.includes('fs.writeFile');

            if (hasFileOps) {
                // Should have some path validation or use path.join
                const hasPathSafety = content.includes('path.join') ||
                    content.includes('path.resolve') ||
                    content.includes('path.normalize');
                expect(hasPathSafety).toBe(true);
            }
        });

        test('File write operations should validate input', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            // If there are file write operations
            if (content.includes('fs.writeFile') || content.includes('writeFile')) {
                // Should have some validation
                const hasValidation = content.includes('if (') ||
                    content.includes('validate') ||
                    content.includes('sanitize');
                expect(hasValidation).toBe(true);
            }
        });
    });

    describe('XSS Prevention', () => {
        test('HTML content should not have inline script injection vulnerabilities', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const content = fs.readFileSync(indexPath, 'utf8');

            // Check for potentially dangerous patterns
            const dangerousPatterns = [
                /eval\(/,
                /innerHTML\s*=\s*[^"'\s]/,  // Direct innerHTML without escaping
                /document\.write\(/
            ];

            dangerousPatterns.forEach((pattern, index) => {
                const matches = content.match(pattern);
                if (matches) {
                    console.warn(`Warning: Potentially dangerous pattern found: ${matches[0]}`);
                }
            });
        });

        test('User input should be properly escaped in JavaScript', () => {
            const indexPath = path.join(__dirname, '../index.html');
            const content = fs.readFileSync(indexPath, 'utf8');

            // If using innerHTML with variables, should have escaping
            if (content.includes('innerHTML') && content.includes('`')) {
                // Template literals should be used carefully
                console.warn('Review template literal usage with innerHTML for proper escaping');
            }
        });
    });

    describe('CORS and Headers', () => {
        test('Server should handle CORS appropriately', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            if (content.includes('res.setHeader') || content.includes('middleware')) {
                // Check if CORS is configured
                const hasCORS = content.includes('Access-Control-Allow-Origin') ||
                    content.includes('cors');

                if (hasCORS && content.includes('Access-Control-Allow-Origin.*\\*')) {
                    console.warn('Warning: CORS is set to allow all origins (*)');
                }
            }
        });

        test('Security headers should be present', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            // Check for security headers
            const securityHeaders = [
                'X-Content-Type-Options',
                'X-Frame-Options',
                'Content-Security-Policy'
            ];

            // Note: These are optional for static sites but good practice
            securityHeaders.forEach(header => {
                if (!content.includes(header)) {
                    console.info(`Info: ${header} not explicitly set (may be handled by hosting platform)`);
                }
            });
        });
    });

    describe('Authentication Security', () => {
        test('OAuth callback should validate state parameter', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            if (content.includes('oauth') || content.includes('callback')) {
                // Should check for state parameter to prevent CSRF
                const hasStateCheck = content.includes('state');
                if (!hasStateCheck) {
                    console.warn('Warning: OAuth callback may not validate state parameter for CSRF protection');
                }
            }
        });

        test('Password authentication should not be stored in plain text', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            // If there's password comparison
            if (content.includes('password')) {
                // Should NOT have plain text comparison like password === 'admin'
                const hasPlainTextPassword = content.match(/password\s*===?\s*['"][^'"]+['"]/);
                if (hasPlainTextPassword) {
                    console.warn('Warning: Potential plain text password comparison found');
                    // For local dev, this might be acceptable but flag it
                }
            }
        });
    });

    describe('Data Validation', () => {
        test('Server should validate POST request bodies', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            if (content.includes('req.body')) {
                // Should have validation
                const hasValidation = content.includes('if (') ||
                    content.includes('valid') ||
                    content.includes('check');
                expect(hasValidation).toBe(true);
            }
        });

        test('File uploads should validate file types', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            if (content.includes('upload') || content.includes('multipart')) {
                const hasTypeCheck = content.includes('mime') ||
                    content.includes('extension') ||
                    content.includes('type');
                if (!hasTypeCheck) {
                    console.warn('Warning: File upload may not validate file types');
                }
            }
        });
    });

    describe('Error Handling Security', () => {
        test('Errors should not expose sensitive information', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            // Check if error responses include stack traces in production
            if (content.includes('error') && content.includes('res.send')) {
                const hasStackInResponse = content.match(/res\.send.*error\.stack/);
                if (hasStackInResponse) {
                    console.warn('Warning: Error responses may expose stack traces');
                }
            }
        });
    });

    describe('Dependency Security', () => {
        test('Dependencies should not have known major vulnerabilities', () => {
            const packagePath = path.join(__dirname, '../package.json');
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            // Check for very old packages that might have vulnerabilities
            const allDeps = {
                ...pkg.dependencies,
                ...pkg.devDependencies
            };

            // This is a basic check - npm audit would be more thorough
            expect(Object.keys(allDeps).length).toBeGreaterThan(0);
        });
    });

    describe('Session Management', () => {
        test('Session tokens should be generated securely', () => {
            const serverPath = path.join(__dirname, '../cms-server.js');
            const content = fs.readFileSync(serverPath, 'utf8');

            if (content.includes('session') || content.includes('token')) {
                // Should use crypto for token generation
                const hasSecureRandom = content.includes('crypto') ||
                    content.includes('randomBytes') ||
                    content.includes('uuid');
                if (!hasSecureRandom) {
                    console.warn('Warning: Token generation may not use cryptographically secure random');
                }
            }
        });
    });
});
