// Language switching functionality
function setLanguage(lang) {
    // Update HTML lang and dir attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Update active language in selector
    document.querySelectorAll('.language-selector a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-lang') === lang) {
            link.classList.add('active');
        }
    });

    // Store original English text for elements that need translation
    document.querySelectorAll('[data-translate]').forEach(element => {
        if (!element.hasAttribute('data-original-text')) {
            element.setAttribute('data-original-text', element.textContent);
        }
    });

    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        } else if (lang === 'en') {
            // Reset to original English text if available
            const originalText = element.getAttribute('data-original-text');
            if (originalText) {
                element.textContent = originalText;
            }
        }
    });

    // Update placeholders for search inputs
    document.querySelectorAll('input[type="search"]').forEach(input => {
        if (!input.hasAttribute('data-original-placeholder')) {
            input.setAttribute('data-original-placeholder', input.placeholder);
        }
        input.placeholder = translations[lang].search;
    });

    // Update navigation text content
    document.querySelectorAll('.navigation a p').forEach(element => {
        if (!element.hasAttribute('data-original-text')) {
            element.setAttribute('data-original-text', element.textContent);
        }
        const text = element.getAttribute('data-original-text');
        Object.entries(translations.en).forEach(([key, value]) => {
            if (value === text && translations[lang][key]) {
                element.textContent = translations[lang][key];
            } else if (lang === 'en') {
                element.textContent = text;
            }
        });
    });

    // Update main content text
    const mainTextElements = {
        '.main-text h1': 'signatureInTime',
        '.main-text .button': 'takeQuiz',
        '.hero .content h1': 'newModel',
        '.hero .content p': 'purityPrecision',
        '.collection .content h2': 'newPartner',
        '.collection .content p': 'mathieuVanderPoel',
        '.collection .content .subtitle': 'tripleThreat',
        '.topic .content h2, .speak .content h2, .talk .content h2': 'coHeads',
        '.topic .content p, .speak .content p, .talk .content p': 'topOfTop',
        '.topic .content .subtitle, .speak .content .subtitle, .talk .content .subtitle': 'firstPlace'
    };

    Object.entries(mainTextElements).forEach(([selector, key]) => {
        document.querySelectorAll(selector).forEach(element => {
            if (!element.hasAttribute('data-original-text')) {
                element.setAttribute('data-original-text', element.textContent);
            }
            if (translations[lang][key]) {
                element.textContent = translations[lang][key];
            } else if (lang === 'en') {
                element.textContent = element.getAttribute('data-original-text');
            }
        });
    });

    // Update dropdown content
    document.querySelectorAll('.dropdown-content a').forEach(element => {
        if (!element.hasAttribute('data-original-text')) {
            element.setAttribute('data-original-text', element.textContent);
        }
        const text = element.getAttribute('data-original-text');
        Object.entries(translations.en).forEach(([key, value]) => {
            if (value === text && translations[lang][key]) {
                element.textContent = translations[lang][key];
            } else if (lang === 'en') {
                element.textContent = text;
            }
        });
    });

    // Store selected language in localStorage
    localStorage.setItem('selectedLanguage', lang);
    
   
}

// Initialize language selector
document.addEventListener('DOMContentLoaded', () => {
    // Add click event listeners to language selector buttons
    document.querySelectorAll('.language-selector a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            setLanguage(lang);
        });
    });

    // Load saved language preference or default to English
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setLanguage(savedLanguage);
}); 