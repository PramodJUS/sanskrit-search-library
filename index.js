/**
 * Sanskrit Search Library - Main Entry Point
 * @module sanskrit-search
 */

// Import dependencies
const SanskritSandhiRules = require('./sandhi-rules.js');
const PratikaIdentifier = require('./pratika.js');
const SanskritSearch = require('./sanskrit-search.js');

// Export all classes
module.exports = {
    SanskritSearch,
    SanskritSandhiRules,
    PratikaIdentifier
};

// Also export default for ES6 import compatibility
module.exports.default = SanskritSearch;
