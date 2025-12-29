# Sanskrit Search Library - Testing Guide

## Running Tests

Currently, the library includes browser-based tests. To run them:

1. Open `test/pratika-identifier-test.html` in a browser
2. Check the console for test results

## Adding Tests

### Recommended Testing Frameworks

For automated testing, consider adding:

**For Node.js:**
```bash
npm install --save-dev jest
```

**For Browser:**
```bash
npm install --save-dev mocha chai
```

## Test Coverage Areas

1. **Sandhi Splitting**
   - Vowel sandhi
   - Consonant sandhi
   - Visarga sandhi

2. **Search Functionality**
   - Exact matches
   - Sandhi-aware matches
   - Case sensitivity
   - Multi-document search

3. **Pratika Identification**
   - Direct quotations (इति)
   - Indirect references (ति)
   - Complex patterns

## Future: Continuous Integration

Consider setting up GitHub Actions for automated testing on every commit.
