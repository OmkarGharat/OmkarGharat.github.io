# Test Suite Documentation

## Overview
This test suite provides comprehensive testing for the Docsify-based blog including:
- ✅ **Smoke Tests** - Quick verification of critical functionality
- ✅ **Sanity Tests** - Core business logic validation
- ✅ **Unit Tests** - Individual component testing
- ✅ **Integration Tests** - Component interaction testing
- ✅ **Security Tests** - OAuth and vulnerability assessment
- ✅ **API Tests** - Server endpoint testing

## Setup

### Install Dependencies
```bash
npm install
```

This will install:
- `jest` - Testing framework
- `jest-allure` - Allure reporter for Jest
- `allure-commandline` - Allure report generator

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Smoke tests (fast, critical checks)
npm run test:smoke

# Sanity tests (core functionality)
npm run test:sanity

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Security tests
npm run test:security

# API tests (requires server to be running)
npm run test:api

# All tests with verbose output
npm run test:all
```

### Watch Mode (for development)
```bash
npm run test:watch
```

## Generating Test Reports

### Allure Reports

#### Generate and View Report
```bash
# Run tests and generate/open Allure report
npm run report
```

#### Manual Allure Commands
```bash
# Generate report
npm run allure:generate

# Open existing report
npm run allure:open

# Generate and serve in one command
npm run allure:serve
```

### Coverage Report
Coverage report is automatically generated when running `npm test`. 
Open `coverage/lcov-report/index.html` in your browser to view detailed coverage.

## Test Structure

```
tests/
├── setup.js           # Test environment configuration
├── smoke.test.js      # Smoke tests
├── sanity.test.js     # Sanity tests
├── unit.test.js       # Unit tests
├── integration.test.js # Integration tests
├── security.test.js   # Security tests
└── api.test.js        # API tests
```

## Test Categories Explained

### Smoke Tests
- Verify critical files exist
- Check basic configuration
- Validate HTML/CSS structure
- **Should always pass** - if these fail, something is seriously broken

### Sanity Tests
- Validate markdown content structure
- Check Docsify configuration
- Verify CSS transitions and positioning
- Test JavaScript functionality

### Unit Tests
- Test individual utility functions
- Validate data parsing
- Check string manipulation
- Test path utilities

### Integration Tests
- HTML + CSS integration
- JavaScript + DOM integration
- Server + File system integration
- Package dependencies

### Security Tests
- OAuth configuration security
- File system security
- XSS prevention
- CORS and headers
- Authentication security
- Data validation

### API Tests
- Static file serving
- OAuth endpoints
- CMS API endpoints
- Content type headers
- Error handling
- **Note:** Requires server to be running (`npm start`)

## Running API Tests

API tests require the server to be running. In one terminal:
```bash
npm start
```

In another terminal:
```bash
npm run test:api
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - uses: simple-elf/allure-report-action@master
        if: always()
        with:
          allure_results: allure-results
          allure_report: allure-report
```

## Troubleshooting

### Tests Failing

1. **Smoke tests failing** - Check that all critical files exist
2. **API tests failing** - Make sure server is running with `npm start`
3. **Security tests warnings** - Review code for potential vulnerabilities
4. **Integration tests failing** - Check that HTML, CSS, and JS are properly linked

### Allure Report Not Generating

1. Make sure tests have run at least once: `npm test`
2. Check that `allure-results` directory exists
3. Install Allure manually: `npm install -g allure-commandline`

### Coverage Not Generated

Run tests with coverage flag:
```bash
npm test -- --coverage
```

## Best Practices

1. **Run smoke tests first** - They're fast and catch critical issues
2. **Run API tests with server running** - Start server in separate terminal
3. **Check security test warnings** - Even if tests pass, review warnings
4. **Keep tests updated** - Add tests for new features
5. **Use watch mode during development** - `npm run test:watch`

## Writing New Tests

### Example Test Structure
```javascript
describe('Feature Name', () => {
  test('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = someFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Adding to Existing Test Files
Add new test cases to the appropriate file based on category:
- File/config checks → `smoke.test.js`
- Business logic → `sanity.test.js`
- Isolated functions → `unit.test.js`
- Component interactions → `integration.test.js`
- Security concerns → `security.test.js`
- Server endpoints → `api.test.js`

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Allure Framework](https://docs.qameta.io/allure/)
- [Testing Best Practices](https://testingjavascript.com/)
