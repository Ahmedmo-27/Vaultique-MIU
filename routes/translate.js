const express = require('express');
const router = express.Router();
const { translateText } = require('../utils/translate');

/**
 * @route POST /api/translate
 * @desc Translate text using MyMemory Translation API
 * @access Public
 */
router.post('/', async (req, res) => {
    try {
        const { text, from = 'auto' } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }

        const result = await translateText(text, from, 'ar');
        
        if (result.success) {
            res.json({
                success: true,
                originalText: text,
                translatedText: result.translatedText,
                from: result.from,
                to: 'ar'
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Translation route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router; 