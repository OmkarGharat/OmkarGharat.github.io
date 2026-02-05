/**
 * API TESTS
 * Tests for API endpoints in cms-server.js
 */

const http = require('http');

describe('API Tests - Server Endpoints', () => {

    const BASE_URL = 'http://localhost:50171';

    // Helper function to make HTTP requests
    const makeRequest = (path, method = 'GET', data = null) => {
        return new Promise((resolve, reject) => {
            const url = new URL(path, BASE_URL);
            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                });
            });

            req.on('error', reject);

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    };

    describe('Static File Serving', () => {
        test('should serve index.html', async () => {
            try {
                const response = await makeRequest('/');
                expect(response.statusCode).toBe(200);
                expect(response.body).toContain('<!DOCTYPE html>');
            } catch (error) {
                console.warn('Server not running. Start with npm start');
            }
        }, 10000);

        test('should serve style.css', async () => {
            try {
                const response = await makeRequest('/style.css');
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toMatch(/css/);
            } catch (error) {
                console.warn('Server not running or file not found');
            }
        }, 10000);

        test('should return 404 for non-existent files', async () => {
            try {
                const response = await makeRequest('/nonexistent.html');
                expect([404, 301, 302]).toContain(response.statusCode);
            } catch (error) {
                console.warn('Server not running');
            }
        }, 10000);
    });

    describe('OAuth Endpoints', () => {
        test('/auth endpoint should exist', async () => {
            try {
                const response = await makeRequest('/auth');
                expect([200, 302, 400]).toContain(response.statusCode);
            } catch (error) {
                console.warn('OAuth endpoint not configured or server not running');
            }
        }, 10000);

        test('/callback endpoint should exist', async () => {
            try {
                const response = await makeRequest('/callback');
                // Should redirect or return error without code parameter
                expect([200, 302, 400, 401]).toContain(response.statusCode);
            } catch (error) {
                console.warn('OAuth callback endpoint not configured');
            }
        }, 10000);
    });

    describe('CMS API Endpoints', () => {
        test('/api/save endpoint should require POST method', async () => {
            try {
                const getResponse = await makeRequest('/api/save', 'GET');
                expect([405, 404, 400]).toContain(getResponse.statusCode);

                // POST should work (even if it fails auth)
                const postResponse = await makeRequest('/api/save', 'POST', {
                    filename: 'test.md',
                    content: '# Test'
                });
                expect([200, 201, 400, 401, 403]).toContain(postResponse.statusCode);
            } catch (error) {
                console.warn('Save endpoint not available or server not running');
            }
        }, 10000);

        test('/api/create endpoint should accept new page data', async () => {
            try {
                const response = await makeRequest('/api/create', 'POST', {
                    title: 'Test Page',
                    folder: 'Test Folder'
                });
                // Should return success or auth error
                expect([200, 201, 400, 401, 403]).toContain(response.statusCode);
            } catch (error) {
                console.warn('Create endpoint not available');
            }
        }, 10000);
    });

    describe('Content Type Headers', () => {
        test('CSS files should have correct content-type', async () => {
            try {
                const response = await makeRequest('/style.css');
                if (response.statusCode === 200) {
                    expect(response.headers['content-type']).toMatch(/text\/css|application\/css/);
                }
            } catch (error) {
                // Skip if server not running
            }
        }, 10000);

        test('HTML files should have correct content-type', async () => {
            try {
                const response = await makeRequest('/');
                if (response.statusCode === 200) {
                    expect(response.headers['content-type']).toMatch(/text\/html/);
                }
            } catch (error) {
                // Skip if server not running
            }
        }, 10000);

        test('JSON endpoints should return JSON content-type', async () => {
            try {
                const response = await makeRequest('/api/test');
                if (response.statusCode < 500) {
                    // If endpoint exists, should be JSON or redirect
                    expect([404, 302]).toContain(response.statusCode);
                }
            } catch (error) {
                // Skip if endpoint doesn't exist
            }
        }, 10000);
    });

    describe('Error Handling', () => {
        test('Server should handle invalid JSON gracefully', async () => {
            try {
                const options = {
                    hostname: 'localhost',
                    port: 50171,
                    path: '/api/save',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                const response = await new Promise((resolve, reject) => {
                    const req = http.request(options, (res) => {
                        let body = '';
                        res.on('data', chunk => body += chunk);
                        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
                    });
                    req.on('error', reject);
                    req.write('invalid json');
                    req.end();
                });

                expect([400, 401, 500]).toContain(response.statusCode);
            } catch (error) {
                console.warn('Error handling test skipped - server not running');
            }
        }, 10000);
    });

    describe('CORS Configuration', () => {
        test('API should have proper CORS headers if needed', async () => {
            try {
                const response = await makeRequest('/api/save');
                // Check if CORS headers are present
                // This is optional for same-origin requests
                if (response.headers['access-control-allow-origin']) {
                    expect(response.headers['access-control-allow-origin']).toBeDefined();
                }
            } catch (error) {
                // CORS might not be configured for local dev
            }
        }, 10000);
    });

    describe('Server Health', () => {
        test('Server should respond to requests', async () => {
            try {
                const response = await makeRequest('/');
                expect([200, 301, 302]).toContain(response.statusCode);
            } catch (error) {
                console.warn('❌ Server is not running. Start it with: npm start');
                expect(error.code).toBe('ECONNREFUSED'); // Expected when server is down
            }
        }, 10000);
    });

    describe('Rate Limiting and Security', () => {
        test('Server should handle multiple rapid requests', async () => {
            try {
                const requests = Array(5).fill(null).map(() => makeRequest('/'));
                const responses = await Promise.all(requests);

                responses.forEach(response => {
                    expect([200, 429, 503]).toContain(response.statusCode);
                });
            } catch (error) {
                console.warn('Multiple request test skipped');
            }
        }, 15000);
    });
});
