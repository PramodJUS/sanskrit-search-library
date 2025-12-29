/**
 * Pratika Identifier - Standalone Module
 * Identifies and extracts Sanskrit pratika (quotation) patterns
 * 
 * A pratika (प्रतीक) is a quotation marker in Sanskrit, typically ending with इति
 * Example: "ब्रह्मेति" → stem: "ब्रह्म", pattern: "ेति"
 * 
 * NOTE: This module works ONLY with Devanagari input.
 * The calling code (bs.js) should handle transliteration:
 *   1. Convert input to Devanagari
 *   2. Call this module
 *   3. Convert result back to source script
 * 
 * @version 1.0.0
 * @license MIT
 */

class PratikaIdentifier {
    constructor() {
        // No patterns needed - using character-by-character analysis
    }

    /**
     * Identify if the given text contains a pratika pattern
     * @param {string} text - Text to analyze (MUST be in Devanagari)
     * @returns {Object|null} - Pratika information or null if not found
     */
    identifyPratika(text) {
        if (!text || typeof text !== 'string') {
            return null;
        }

        const trimmedText = text.trim().normalize('NFC');
        
        // CRITICAL: Only words ending with इति, िति, ीति, or ेति can be pratikas
        // इति = standalone iti (इ + त + ि)
        // िति = short i vowel mark + ति (like मिति, दिति, रिति)
        // ीति = long i vowel mark + ती (like words ending in ई)
        // ेति = e vowel mark + ति (like रामेति)
        // All other patterns (ुति, ूति, ोति, ौति, ैति, मति, etc.) are NOT pratikas
        if (!/[िीे]ति$/.test(trimmedText) && !/\s+इति$/.test(trimmedText) && !/^[^िीे]+इति$/.test(trimmedText)) {
            return {
                isPratika: false,
                originalText: trimmedText,
                stem: null,
                pattern: null,
                patternDescription: 'Only words ending with इति, िति, ीति, or ेति qualify as pratikas',
                itiEnding: null,
                confidence: 0
            };
        }

        // Space-separated इति can be a pratika IF the word ends with inherent अ (consonant)
        // Example: कृपालव इति → stem: कृपालव (valid pratika)
        // But NOT: ब्रह्मणे इति → not a pratika (ए is explicit vowel, no sandhi expected)
        if (/\s+इति$/.test(trimmedText)) {
            const wordBeforeIti = trimmedText.replace(/\s+इति$/, '').trim();
            
            // Check if word ends with consonant (inherent अ) or ends with vowel/visarga/anusvara
            // Consonant = no matra at end, not ending with ः ं ँ
            const endsWithVowelMark = /[ािीुूृॄॢॣेैोौ]$/.test(wordBeforeIti);
            const endsWithVisargaOrAnusvara = /[ःंँ]$/.test(wordBeforeIti);
            
            if (endsWithVowelMark || endsWithVisargaOrAnusvara) {
                // Ends with explicit vowel/visarga - NOT a pratika, just a quotation
                return {
                    isPratika: false,
                    originalText: trimmedText,
                    stem: null,
                    pattern: null,
                    patternDescription: 'Space-separated इति with explicit vowel/visarga is not a pratika',
                    itiEnding: null,
                    confidence: 0
                };
            } else {
                // Ends with consonant (inherent अ) - this IS a pratika
                return {
                    isPratika: true,
                    originalText: trimmedText,
                    stem: wordBeforeIti,
                    pattern: 'space-iti-inherent-a',
                    patternDescription: 'Space + इति after consonant (inherent अ sandhi)',
                    itiEnding: ' इति',
                    confidence: 75
                };
            }
        }

        // Remove इति (3 characters: इ + त + इ)
        let working = trimmedText.slice(0, -3);
        let pattern = '';
        let description = '';
        let confidence = 70;

        // Now analyze what's at the end and apply restoration rules
        // IMPORTANT: Check against the ORIGINAL trimmedText, not the working string
        
        // Check for multi-character endings first (most specific)
        if (trimmedText.endsWith('य्विति')) {
            // य्विति → वायु (YU sandhi)
            // य्विति = य + ् + व + ि + त + ि = 6 characters
            working = trimmedText.slice(0, -6) + 'यु';
            pattern = 'yaviti';
            description = 'YU (यु) + इति → य्विति sandhi';
            confidence = 85;
        }
        else if (trimmedText.endsWith('ाविति')) {
            // ाविति → हरौ (AU vowel)
            working = trimmedText.slice(0, -5) + 'ौ';
            pattern = 'aaviti';
            description = 'AU (ौ) + इति → ाविति sandhi';
            confidence = 85;
        }
        else if (trimmedText.endsWith('स्येति')) {
            // स्येति → ईश्वरस्य (genitive)
            working = trimmedText.slice(0, -4) + 'य';
            pattern = 'syeti';
            description = 'Genitive singular + इति';
            confidence = 90;
        }
        else if (trimmedText.endsWith('ायेति')) {
            // ायेति → dative
            working = trimmedText.slice(0, -5);
            pattern = 'aayeti';
            description = 'Dative singular + इति';
            confidence = 80;
        }
        else if (trimmedText.endsWith('भिरिति')) {
            // भिरिति → instrumental plural
            // Check if र should become ः
            const beforePattern = trimmedText.slice(0, -6);
            if (beforePattern && !beforePattern.endsWith('ृ') && !beforePattern.endsWith('ॄ')) {
                working = beforePattern + 'भिः';
                pattern = 'bhiriti-visarga';
                description = 'Instrumental plural (ः → र sandhi) + इति';
                confidence = 90;
            } else {
                working = trimmedText.slice(0, -6) + 'भिर';
                pattern = 'bhiriti';
                description = 'Instrumental plural + इति';
                confidence = 90;
            }
        }
        else if (trimmedText.endsWith('मिति')) {
            // मिति → म् (anusvara restoration)
            working = trimmedText.slice(0, -4) + 'म्';
            pattern = 'miti';
            description = 'Accusative singular (म्) + इति';
            confidence = 85;
        }
        else if (trimmedText.endsWith('दिति')) {
            // दिति → त् (sandhi reversal: त् + इ → द)
            working = trimmedText.slice(0, -4) + 'त्';
            pattern = 'diti';
            description = 'त् + इति → दिति sandhi';
            confidence = 85;
        }
        else if (trimmedText.endsWith('रिति')) {
            // रिति → check context
            const before = trimmedText.slice(-5, -4);
            if (before === 'ृ' || before === 'ॄ') {
                // R vowel - keep as is
                working = trimmedText.slice(0, -4);
                pattern = 'riti-rvowel';
                description = 'R vowel + इति';
                confidence = 80;
            } else {
                // Visarga sandhi: ः → र
                working = trimmedText.slice(0, -4) + 'ः';
                pattern = 'riti-visarga';
                description = 'Visarga (ः) + इति → रिति sandhi';
                confidence = 88;
            }
        }
        else if (trimmedText.endsWith('येभ्यरिति')) {
            // येभ्यरिति → dative/ablative plural
            working = trimmedText.slice(0, -8) + 'येभ्यः';
            pattern = 'yebhyariti';
            description = 'Dative/ablative plural + इति';
            confidence = 95;
        }
        else if (trimmedText.endsWith('ेभ्यरिति')) {
            // ेभ्यरिति → dative/ablative plural
            working = trimmedText.slice(0, -8) + 'ेभ्यः';
            pattern = 'ebhyariti';
            description = 'Dative/ablative plural + इति';
            confidence = 95;
        }
        else if (trimmedText.endsWith('भ्यामिति')) {
            // भ्यामिति → dual
            working = trimmedText.slice(0, -7);
            pattern = 'bhyaamiti';
            description = 'Dual instrumental/dative/ablative + इति';
            confidence = 95;
        }
        else if (trimmedText.endsWith('ानामिति')) {
            // ानामिति → genitive plural
            working = trimmedText.slice(0, -7);
            pattern = 'aanaamiti';
            description = 'Genitive plural + इति';
            confidence = 95;
        }
        else if (trimmedText.endsWith('णामिति')) {
            // णामिति → genitive plural feminine
            working = trimmedText.slice(0, -6);
            pattern = 'naamiti';
            description = 'Genitive plural feminine + इति';
            confidence = 95;
        }
        else if (trimmedText.endsWith('यामिति')) {
            // यामिति → locative feminine
            working = trimmedText.slice(0, -6);
            pattern = 'yaamiti';
            description = 'Locative feminine singular + इति';
            confidence = 95;
        }
        else if (trimmedText.endsWith('यारिति')) {
            // यारिति → genitive/ablative feminine (र → ः)
            working = trimmedText.slice(0, -5) + 'याः';
            pattern = 'yaarिति';
            description = 'Genitive/ablative feminine + इति';
            confidence = 90;
        }
        else if (trimmedText.endsWith('ेणेति')) {
            // ेणेति → instrumental singular
            working = trimmedText.slice(0, -4);
            pattern = 'eneti';
            description = 'Instrumental singular + इति';
            confidence = 90;
        }
        else if (trimmedText.endsWith('ोरिति')) {
            // ोरिति → dual genitive/locative (र → ः)
            working = trimmedText.slice(0, -5) + 'ोः';
            pattern = 'oriti';
            description = 'Dual genitive/locative + इति';
            confidence = 90;
        }
        else if (trimmedText.endsWith('ष्विति')) {
            // ष्विति → locative plural
            working = trimmedText.slice(0, -5);
            pattern = 'shviti';
            description = 'Locative plural + इति';
            confidence = 85;
        }
        else if (trimmedText.endsWith('स्विति')) {
            // स्विति → locative plural feminine
            working = trimmedText.slice(0, -5);
            pattern = 'sviti';
            description = 'Locative plural feminine + इति';
            confidence = 85;
        }
        else if (trimmedText.endsWith('ैरिति')) {
            // ैरिति → instrumental plural (र → ः)
            working = trimmedText.slice(0, -5) + 'ैः';
            pattern = 'airiti';
            description = 'Instrumental plural + इति';
            confidence = 85;
        }
        else if (trimmedText.endsWith('ानिति')) {
            // ानिति → accusative plural
            working = trimmedText.slice(0, -5);
            pattern = 'aaniti';
            description = 'Accusative plural + इति';
            confidence = 80;
        }
        else if (trimmedText.endsWith('ानीति')) {
            // ानीति → accusative plural (alternative form)
            working = trimmedText.slice(0, -6);
            pattern = 'aaneeiti';
            description = 'Accusative plural (ानि) + इति';
            confidence = 80;
        }
        // Now check simple 3-character patterns (vowel + इति)
        else if (trimmedText.endsWith('ोति')) {
            // ोति → O vowel or visarga sandhi (ः → ो before इ)
            // Check if there's visarga in original form
            const beforeO = trimmedText.slice(-4, -3);
            if (beforeO && /[कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह]/.test(beforeO)) {
                // Could be visarga: रामः + इति → रामोति
                working = trimmedText.slice(0, -3) + 'ः';
                pattern = 'oti-visarga';
                description = 'Visarga (ः) + इति → ोति sandhi';
                confidence = 70;
            } else {
                // Just O vowel
                working = trimmedText.slice(0, -3);
                pattern = 'oti';
                description = 'O vowel + इति';
                confidence = 65;
            }
        }
        else if (trimmedText.endsWith('ेति')) {
            // ेति → A vowel or stem  
            working = trimmedText.slice(0, -3);
            pattern = 'eti';
            description = 'A vowel or stem + इति';
            confidence = 65;
        }
        else if (trimmedText.endsWith('ीति')) {
            // ीति → I vowel
            working = trimmedText.slice(0, -3);
            pattern = 'eeti';
            description = 'I vowel + इति';
            confidence = 70;
        }
        else if (trimmedText.endsWith('ूति')) {
            // ूति → U vowel
            working = trimmedText.slice(0, -3);
            pattern = 'ooti';
            description = 'U vowel + इति';
            confidence = 70;
        }
        else if (trimmedText.endsWith('ैति')) {
            // ैति → E/AI vowel
            working = trimmedText.slice(0, -3);
            pattern = 'aiti';
            description = 'E/AI vowel + इति';
            confidence = 70;
        }
        else if (trimmedText.endsWith('ौति')) {
            // ौति → AU dual
            working = trimmedText.slice(0, -3);
            pattern = 'auti';
            description = 'AU dual + इति';
            confidence = 70;
        }
        else if (trimmedText.endsWith('लिति')) {
            // लिति → L vowel
            working = trimmedText.slice(0, -4);
            pattern = 'liti';
            description = 'L vowel + इति';
            confidence = 80;
        }
        else if (trimmedText.endsWith('विति')) {
            // विति → U vowel
            working = trimmedText.slice(0, -4);
            pattern = 'viti';
            description = 'U vowel + इति';
            confidence = 75;
        }
        else if (trimmedText.endsWith('येति')) {
            // येति → instrumental/dative
            working = trimmedText.slice(0, -4);
            pattern = 'yeti';
            description = 'Instrumental/dative singular + इति';
            confidence = 75;
        }
        else {
            // No specific pattern matched - just remove इति
            working = trimmedText.slice(0, -3);
            pattern = 'generic';
            description = 'Generic stem + इति';
            confidence = 60;
        }

        const stem = working.normalize('NFC');
        
        // Validation: Stem should be at least 2 characters to avoid false positives
        // Example: भूति would give stem "भ" (1 char) - likely not a pratika
        // But रामेति would give stem "राम" (3 chars) - valid pratika
        if (stem.length < 2) {
            return {
                isPratika: false,
                originalText: trimmedText,
                stem: null,
                pattern: null,
                patternDescription: 'Stem too short - likely a regular word, not a pratika',
                itiEnding: null,
                confidence: 0
            };
        }
        
        return {
            isPratika: true,
            originalText: trimmedText,
            stem: stem,
            pattern: pattern,
            patternDescription: description,
            itiEnding: trimmedText.slice(working.length),
            confidence: confidence
        };
    }

    /**
     * Check if text contains any pratika pattern (quick check)
     * @param {string} text - Text to check (in Devanagari)
     * @returns {boolean} - True if pratika pattern found
     */
    isPratika(text) {
        const result = this.identifyPratika(text);
        return result ? result.isPratika : false;
    }

    /**
     * Extract just the stem from pratika text
     * @param {string} text - Text with इति ending (in Devanagari)
     * @returns {string|null} - Stem word or null if not a pratika
     */
    extractPratikaStem(text) {
        const result = this.identifyPratika(text);
        return result && result.isPratika ? result.stem : null;
    }

    /**
     * Get all searchable forms from a pratika
     * Returns array of forms to search for (handles sandhi variations)
     * @param {string} text - Text with इति ending (in Devanagari)
     * @returns {Array|null} - Array of searchable forms or null if not a pratika
     */
    extractSearchableForms(text) {
        const result = this.identifyPratika(text);
        if (!result || !result.isPratika) {
            return null;
        }

        const forms = [result.stem];

        // For दिति pattern: त् ↔ द् sandhi
        // स्यात् + इति → स्यादिति (त् becomes द before इ)
        // धर्मात् + इति → धर्मादिति
        // So search for both the त् form AND द् form
        if (result.pattern === 'diti' && result.stem.endsWith('त्')) {
            const sandhiForm = result.stem.slice(0, -2) + 'द्'; // Replace त् with द्
            forms.push(sandhiForm);
        }

        // For भिरिति pattern: ः ↔ र् sandhi
        // सद्भिः + इति → सद्भिरिति (ः becomes र before इ)
        // Search for both सद्भिः and सद्भिर्
        if (result.pattern === 'bhiriti-visarga' && result.stem.endsWith('भिः')) {
            const sandhiForm = result.stem.slice(0, -1) + 'र्'; // Replace ः with र्
            forms.push(sandhiForm);
        } else if (result.pattern === 'bhiriti' && result.stem.endsWith('भिर')) {
            const visargaForm = result.stem.slice(0, -1) + 'ः'; // Replace र with ः
            forms.push(visargaForm);
        }

        // For रिति pattern: ः ↔ र् sandhi
        // हरिः + इति → हरिरिति (ः becomes र before इ)
        // Search for both हरिः and हरिर्
        if (result.pattern === 'riti-visarga' && result.stem.endsWith('ः')) {
            const sandhiForm = result.stem.slice(0, -1) + 'र्'; // Replace ः with र्
            forms.push(sandhiForm);
        }

        return forms;
    }

    /**
     * Get all possible pratika variations for a stem word
     * This is the reverse operation - given a stem, generate possible इति forms
     * @param {string} stem - Base word/stem (in Devanagari)
     * @returns {Array} - Array of possible pratika forms
     */
    generatePratikaVariations(stem) {
        const variations = [];
        
        // Add simple इति
        variations.push(stem + 'इति');
        
        // Check stem ending and add appropriate variations
        const lastChar = stem.slice(-1);
        const lastTwoChars = stem.slice(-2);
        
        // Vowel-based variations
        if (lastChar === 'म्') {
            variations.push(stem.slice(0, -2) + 'मिति'); // Remove म् and add मिति
        }
        if (lastChar === 'अ' || lastChar === 'आ' || lastTwoChars === 'अ' || !this.endsWithVowel(stem)) {
            variations.push(stem + 'ेति');
        }
        if (lastChar === 'इ' || lastChar === 'ई') {
            variations.push(stem + 'ीति');
        }
        if (lastChar === 'उ' || lastChar === 'ऊ') {
            variations.push(stem + 'वीति');
            variations.push(stem + 'विति');
        }
        if (lastChar === 'ए' || lastChar === 'ै') {
            variations.push(stem + 'ैति');
        }
        if (lastChar === 'ओ' || lastChar === 'औ') {
            variations.push(stem + 'ावीति');
            variations.push(stem + 'ाविति');
        }
        
        return [...new Set(variations)]; // Remove duplicates
    }

    /**
     * Check if text ends with a vowel
     * @private
     * @param {string} text - Text to check
     * @returns {boolean} - True if ends with vowel
     */
    endsWithVowel(text) {
        const vowels = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ॠ', 'ऌ', 'ॡ', 'ए', 'ऐ', 'ओ', 'औ', 
                        'ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'ॄ', 'ॢ', 'ॣ', 'े', 'ै', 'ो', 'ौ'];
        const lastChar = text.slice(-1);
        return vowels.includes(lastChar);
    }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PratikaIdentifier;
}
if (typeof window !== 'undefined') {
    window.PratikaIdentifier = PratikaIdentifier;
}
