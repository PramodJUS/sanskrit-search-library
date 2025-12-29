# Publishing Sanskrit Search Library

## Steps to Publish to npm

1. **Ensure you're logged in to npm:**
   ```bash
   npm login
   ```

2. **Update version (if needed):**
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

3. **Publish to npm:**
   ```bash
   npm publish
   ```

## Using in Your Projects

### Installation
```bash
npm install sanskrit-search
```

### Usage in Node.js or Modern JavaScript

```javascript
// Import the main class
const SanskritSearch = require('sanskrit-search');

// Create an instance
const searcher = new SanskritSearch();

// Search for text
const haystack = "अथातो ब्रह्मजिज्ञासा";
const needle = "ब्रह्म";
const results = searcher.search(haystack, needle);
console.log(results);
```

### Usage in Browser (via CDN)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Sanskrit Search Example</title>
</head>
<body>
    <!-- Include the library -->
    <script src="https://unpkg.com/sanskrit-search@latest/sanskrit-search.js"></script>
    <script src="https://unpkg.com/sanskrit-search@latest/sandhi-rules.js"></script>
    <script src="https://unpkg.com/sanskrit-search@latest/pratika.js"></script>

    <script>
        // Use the library
        const searcher = new SanskritSearch();
        const results = searcher.search("अथातो ब्रह्मजिज्ञासा", "ब्रह्म");
        console.log(results);
    </script>
</body>
</html>
```

## Features

- **Sandhi Splitting**: Automatically handles Sanskrit sandhi rules
- **Pratika Identification**: Identifies and extracts pratikas (quotations)
- **Flexible Matching**: Case-insensitive and diacritic-aware matching
- **Devanagari Support**: Native support for Devanagari script

## API Reference

### SanskritSearch

#### `search(haystack, needle)`
Search for a needle in a haystack, considering sandhi rules.

**Parameters:**
- `haystack` (string): The text to search in
- `needle` (string): The text to search for

**Returns:** Array of match objects with position and context information

### PratikaIdentifier

#### `identifyPratikas(text)`
Identify pratika graha patterns in Sanskrit text.

**Parameters:**
- `text` (string): Sanskrit text to analyze

**Returns:** Array of pratika objects with position and type information

## License

MIT
