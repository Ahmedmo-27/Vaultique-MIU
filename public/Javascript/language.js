function switchLanguage(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    [1,2,3,4,5,6,7,8]
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    localStorage.setItem('language', lang);

    // لزيادة تاكيد ان القوائم المنسدله هيا الي اختارها العميل
    const lang1 = document.getElementById('language');
    const lang2 = document.getElementById('language2');
    if (lang1) lang1.value = lang;
    if (lang2) lang2.value = lang;
}


document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'en';
    switchLanguage(savedLang);

    const lang1 = document.getElementById('language');
    const lang2 = document.getElementById('language2');

    if (lang1) {
        lang1.value = savedLang;
        lang1.addEventListener('change', (e) => {
            switchLanguage(e.target.value);
            location.reload(); 
        });
    }

    if (lang2) {
        lang2.value = savedLang;
        lang2.addEventListener('change', (e) => {
            switchLanguage(e.target.value);
            location.reload(); 
        });
    }
});
