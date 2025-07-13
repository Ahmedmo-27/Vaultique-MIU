// Chatbot functionality
class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.typingTimeout = null;
        
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.bindEvents();
        this.loadWelcomeMessage();
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <div class="chatbot-container">
                <button class="chatbot-button" id="chatbotButton">
                    <i class="fas fa-comments"></i>
                </button>
                
                <div class="chatbot-window" id="chatbotWindow">
                    <div class="chatbot-header">
                        <h3>${this.currentLanguage === 'ar' ? 'مساعد فولتيك' : 'Vaultique Assistant'}</h3>
                        <button class="close-btn" id="closeChatbot">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="chatbot-messages" id="chatbotMessages">
                        <div class="welcome-message">
                            <h4>${this.currentLanguage === 'ar' ? 'مرحباً بك في فولتيك!' : 'Welcome to Vaultique!'}</h4>
                            <p>${this.currentLanguage === 'ar' ? 'كيف يمكنني مساعدتك اليوم؟' : 'How can I help you today?'}</p>
                        </div>
                    </div>
                    <div class="chatbot-input">
                     <div class="typing-indicator" id="typingIndicator">
                            <div class="typing-dots">
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                            </div>
                    </div>
                        <input type="text" id="chatbotInput" placeholder="${this.currentLanguage === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...'}" maxlength="500">
                        <button id="sendMessage">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    bindEvents() {
        const chatbotButton = document.getElementById('chatbotButton');
        const closeChatbot = document.getElementById('closeChatbot');
        const sendMessage = document.getElementById('sendMessage');
        const chatbotInput = document.getElementById('chatbotInput');

        // Toggle chatbot
        chatbotButton.addEventListener('click', () => this.toggleChatbot());
        closeChatbot.addEventListener('click', () => this.closeChatbot());

        // Send message
        sendMessage.addEventListener('click', () => this.sendMessage());
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.chatbot-container')) {
                this.closeChatbot();
            }
        });
    }

    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }

    openChatbot() {
        const chatbotWindow = document.getElementById('chatbotWindow');
        chatbotWindow.classList.add('active');
        this.isOpen = true;
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('chatbotInput').focus();
        }, 300);
    }

    closeChatbot() {
        const chatbotWindow = document.getElementById('chatbotWindow');
        chatbotWindow.classList.remove('active');
        this.isOpen = false;
    }

    sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate bot response
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateBotResponse(message);
        }, 1000 + Math.random() * 2000);
    }

    generateBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        let response = '';

        // لوجيك ترحيب بدايه
        const greetingKeywordsEn = ["hello", "hi", "hey", "good morning", "good evening", "greetings"];
        const greetingKeywordsAr = ["مرحبا", "اهلا","أهلا", "السلام عليكم", "صباح الخير", "مساء الخير"];
        const hasGreetingEn = greetingKeywordsEn.some(word => message.includes(word));
        const hasGreetingAr = greetingKeywordsAr.some(word => message.includes(word));
        // لوجيك ترحيب نهايه

        // لوجيك وقت التسليم بدايه
        const timeKeywords = ["how", "what", "when", "long", "duration", "many", "days", "arrive", "reach", "take", "time", "wait", "expect", "soon"];
        const deliveryKeywords = ["delivery", "shipping", "order", "package"];
        const hasTimeWord = timeKeywords.some(word => message.includes(word));
        const hasDeliveryWord = deliveryKeywords.some(word => message.includes(word));
        const timeKeywordsAr = ["كم", "مدة", "المدة", "متى", "امتى", "هيجي", "يوصل", "تستغرق", "فترة", "أيام", "وقت"];
        const deliveryKeywordsAr = ["الشحن", "التوصيل", "الطلب", "المنتج", "التسليم"];
        const hasTimeWordAr = timeKeywordsAr.some(word => message.includes(word)); // true
        const hasDeliveryWordAr = deliveryKeywordsAr.some(word => message.includes(word)); // true
        // لوجيك وقت التسليم نهايه

        // لوجيك سعر التسليم بدايه
        const priceKeywords = ["how much", "price", "cost", "fee", "charge", "shipping price", "delivery price", "shipping cost", "delivery cost"];
        const priceKeywordsAr = ["سعر", "تكلفة", "رسوم", "ثمن", "كام", "بكام"];
        const shippingWords = ["shipping", "delivery"];
        const shippingWordsAr = ["الشحن", "التوصيل"];
        const hasPriceEn = priceKeywords.some(word => message.includes(word)) && shippingWords.some(word => message.includes(word));
        const hasPriceAr = priceKeywordsAr.some(word => message.includes(word)) && shippingWordsAr.some(word => message.includes(word));
        // لوجيك سعر التسليم نهايه
        
        // لوجيك مدة الضمان بدايه
        const warrantyKeywords = ["warranty", "guarantee"];
        const timeKeywordswar = ["duration", "how long", "time", "period"];
        const warrantyKeywordsAr = ["ضمان", "الضمان"];
        const timeKeywordsArwar = ["مدة", "فترة", "كم سنة", "كم المدة", "المدة"];
        const hasWarrantyEn = warrantyKeywords.some(word => message.includes(word)) && timeKeywordswar.some(word => message.includes(word));
        const hasWarrantyAr = warrantyKeywordsAr.some(word => message.includes(word)) && timeKeywordsArwar.some(word => message.includes(word));
        // لوجيك مدة الضمان نهايه

        // لوجيك المنتج اصلي بدايه
        const authenticityKeywords = ["authentic", "original", "real", "genuine", "fake"];
        const questionKeywords = ["is", "are", "do", "does", "product", "products"];
        const authenticityKeywordsAr = ["أصلي", "اصلية", "حقيقي", "حقيقية", "تقليد", "مزيف", "مضروب"];
        const questionKeywordsAr = ["هل", "المنتجات", "المنتج", "أصلي", "أصلية", "أصليه"];        
        const hasAuthEn = authenticityKeywords.some(word => message.includes(word)) && questionKeywords.some(word => message.includes(word));
        const hasAuthAr = authenticityKeywordsAr.some(word => message.includes(word)) && questionKeywordsAr.some(word => message.includes(word));
        // لوجيك المنتج اصلي نهايه

        // لوجيك ما خدماتكم بدايه
        const serviceKeywordsEn = ["services", "service", "offer", "provide", "what do you", "do you offer", "your services"];
        const businessKeywordsEn = ["do", "what", "you", "brand", "company"];
        const serviceKeywordsAr = ["الخدمات", "خدمات", "تقدم", "ما هي", "ايه هي", "بتقدموا"];
        const businessKeywordsAr = ["تقدمون", "اللي بتقدموه", "بتقدم", "بتشتغلوا", "بتوفروا"];
        const hasServicesEn = serviceKeywordsEn.some(word => message.includes(word)) && businessKeywordsEn.some(word => message.includes(word));
        const hasServicesAr = serviceKeywordsAr.some(word => message.includes(word)) || businessKeywordsAr.some(word => message.includes(word));
        // لوجيك ما خدماتكم نهايه

        // لوجيك الدعم بدايه
        const supportKeywords = ["contact", "support", "reach", "help", "how can I contact", "how do I contact", "customer service"];
        const supportKeywordsAr = ["الدعم", "التواصل", "خدمة العملاء", "اتواصل", "اكلم", "مساعدة", "اتصل", "اتحدث"];
        const hasSupportEn = supportKeywords.some(word => message.includes(word));
        const hasSupportAr = supportKeywordsAr.some(word => message.includes(word));        
        // لوجيك الدعم نهايه

        // لوجيك ساعات العمل بدايه
        const workingHoursKeywords = ["working hours", "business hours", "opening hours", "open", "close", "when are you open", "your schedule", "hours of operation"];
        const workingHoursKeywordsAr = ["ساعات العمل", "مواعيد", "مفتوحين", "بتقفلوا امتى", "الشغل", "الدوام", "وقت العمل"];
        const hasWorkingHoursEn = workingHoursKeywords.some(word => message.includes(word));
        const hasWorkingHoursAr = workingHoursKeywordsAr.some(word => message.includes(word));
        // لوجيك ساعات العمل نهايه

        // لوجيك  بدايه
        const QLKeywords = ["where", "what", "how"];
        const HLKeywords2 = ["location", "place", "branch" , "shop"];
        const haslocationEn = QLKeywords.some(word => message.includes(word));
        const haslocationEn2 = HLKeywords2.some(word => message.includes(word));
        const QLKeywordsar = ["ازاي", "كيف", "كيفية"];
        const HLKeywordsar2 = ["الوصول", "اللوكيشن", "الفرع" , "المكان" ,"مكان"];
        const haslocationAr = QLKeywordsar.some(word => message.includes(word));
        const haslocationAr2 = HLKeywordsar2.some(word => message.includes(word));
        // لوجيك  نهايه

        // لوجيك منتج بدايه
        const productInquiryKeywords = ["product", "watch", "item", "do you have", "can i see", "tell me about", "details", "interested in", "looking for", "specific", "buy", "order"];
        const productInquiryKeywordsAr = ["منتج", "ساعة", "الساعات", "هل يوجد", "عندكم", "هل متوفر", "ممكن أشوف", "ابغى", "أريد", "بكم", "بكام", "تفاصيل", "أطلب", "اطلب"];
        const hasProductInquiryEn = productInquiryKeywords.some(word => message.includes(word));
        const hasProductInquiryAr = productInquiryKeywordsAr.some(word => message.includes(word));        
        // لوجيك منتج نهايه

        // لوجيك توديع بدايه
        const endChatKeywordsEn = ["thank you", "thanks", "bye", "goodbye", "see you", "talk later", "that's all"];
        const hasEndChatEn = endChatKeywordsEn.some(word => message.includes(word)); // true
        const endChatKeywordsAr = ["شكراً", "شكرا", "سلام", "مع السلامة", "باي", "اشوفك", "خلصت", "تمام كده"];
        const hasEndChatAr = endChatKeywordsAr.some(word => message.includes(word));
        // لوجيك توديع نهايه


        // Simple keyword-based responses
        if (hasGreetingEn || hasGreetingAr) {
            response = this.currentLanguage === 'ar'
                ? "مرحباً بك! 👋<br>يسعدني مساعدتك. إذا كان لديك أي سؤال عن منتجاتنا أو خدماتنا، لا تتردد في طرحه."
                : "Hello and welcome! 👋<br>I'm happy to assist you. If you have any questions about our products or services, feel free to ask.";
        }
        else if (
            (hasTimeWord && hasDeliveryWord) ||
            (hasTimeWordAr && hasDeliveryWordAr) ||
            (message.includes('يوم') && message.includes('يوصل')) ||
            (message.includes('كم') && message.includes('مدة') && (message.includes('الشحن') || message.includes('التسليم')))
        ) {
            response = this.currentLanguage === 'ar' 
            ? "لديك خياران:<br>1. التوصيل العادي: يستغرق 5 أيام.<br>2. التوصيل السريع: يصل خلال يومين فقط" 
            : "You have two options:<br>1. Standard delivery: takes 5 days.<br>2. Express delivery: arrives within 2 days";        
        }
        else if (
            ((haslocationEn && haslocationEn2) || (haslocationAr && haslocationAr2))) {
            response = this.currentLanguage === 'ar' 
            ? "يمكنك الوصول الي الموقع من خلال هذا  <a target='_blank' style='color:blue' href='https://maps.app.goo.gl/biGZG8VET6SSquub8?g_st=aw'>الرابط</a>"
            : "You can access the location by clicking on this <a target='_blank' style='color:blue' href='https://maps.app.goo.gl/biGZG8VET6SSquub8?g_st=aw'>link</a>";        
        }
        else if (hasPriceEn || hasPriceAr) {
            response = this.currentLanguage === 'ar'
                ? "لديك خياران:<br>1. التوصيل العادي: 20 $.<br>2. التوصيل السريع: 40 $"
                : "You have two options:<br>1. Standard delivery: 20 $.<br>2. Express delivery: 40 $";
        }
        else if (hasEndChatEn || hasEndChatAr) {
            response = this.currentLanguage === 'ar'
                ? "شرفتنا! 😊<br>إذا احتجت أي مساعدة في أي وقت، لا تتردد في الرجوع إلينا. يومك سعيد!"
                : "It was a pleasure chatting with you! 😊<br>If you need anything else, feel free to reach out. Have a great day!";
        }
        else if (hasWarrantyEn || hasWarrantyAr) {
            response = this.currentLanguage === 'ar'
                ? "جميع ساعاتنا تأتي بضمان لمدة 5 سنوات"
                : "All our watches come with warranty for 5 years";
        }
        else if (hasAuthEn || hasAuthAr) {
            response = this.currentLanguage === 'ar'
                ? "جميع منتجاتنا أصلية 100% ومضمونة. نحن وكلاء معتمدون لجميع الماركات التي نحملها"
                : "All our products are 100% authentic and guaranteed. We are authorized dealers for all brands we carry";
        }
        else if (hasServicesEn || hasServicesAr) {
            response = this.currentLanguage === 'ar'
                ? "نحن علامة تجارية إلكترونية متخصصة في بيع الساعات الفاخرة نقدم تجربة تسوق سلسة عبر الإنترنت مع ضمان الأصالة وخدمة التوصيل."
                : "We are an e-commerce brand specialized in selling luxury watches. We offer a smooth online shopping experience with authenticity guarantee, delivery service";
        }
        else if (hasSupportEn || hasSupportAr) {
            response = this.currentLanguage === 'ar'
            ? "يمكنك التواصل معنا من خلال البيانات التالية:<br><strong>العنوان:</strong> 15 القاهرة الجديدة، القاهرة، مصر<br><strong>الهاتف:</strong> +20 109 123 4567<br><strong>البريد الإلكتروني:</strong> vaultique.watches@gmail.com"
            : "You can contact us through the following:<br><strong>Address:</strong> 15 New Cairo, Cairo, Egypt<br><strong>Phone:</strong> +20 109 123 4567<br><strong>Email:</strong> vaultique.watches@gmail.com";
        
        }
        else if (hasWorkingHoursEn || hasWorkingHoursAr) {
            response = this.currentLanguage === 'ar'
            ? "يمكنك التواصل معنا خلال ساعات العمل التالية:<br>الإثنين - الجمعة: 9:00 صباحًا - 6:00 مساءً<br>السبت: 10:00 صباحًا - 4:00 مساءً<br>الأحد: مغلق"
            : "You can reach us during the following business hours:<br>Monday - Friday: 9:00 AM - 6:00 PM<br>Saturday: 10:00 AM - 4:00 PM<br>Sunday: Closed";
        
        }
        else if (hasProductInquiryEn || hasProductInquiryAr) {
            response = this.currentLanguage === 'ar'
                ? 'يمكنك تصفح جميع المنتجات المتوفرة لدينا من خلال صفحة <strong>"تسوق الكل (Shop All)"</strong>، واستخدام الفلاتر للبحث عن الساعة المناسبة لك.<br>إذا كنت تبحث عن منتج معين، أخبرنا بمواصفاته وسنساعدك مباشرة.'
                : 'You can browse all available products through the <strong>"Shop All"</strong> page and use filters to find the perfect watch.<br>If you\'re looking for a specific item, let us know the details and we’ll assist you directly.';
        }
        else {
            response = this.currentLanguage === 'ar'
                ? "لم أتمكن من فهم سؤالك تمامًا، لكن يسعدني مساعدتك!<br>يمكنك سؤالي عن: الأسعار، الشحن، الضمان، المنتجات، أو أي استفسار آخر."
                : "I didn’t quite understand your message, but I’m here to help!<br>You can ask me about: prices, shipping, warranty, products, or any other question.";
        }

        this.addMessage(response, 'bot');
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        messageDiv.innerHTML  = text;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Store message
        this.messages.push({ text, sender, timestamp: new Date() });
    }

    showTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.classList.add('active');
        
        // Scroll to bottom to show typing indicator
        const messagesContainer = document.getElementById('chatbotMessages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.classList.remove('active');
    }

    loadWelcomeMessage() {
        // Welcome message is already in HTML
    }

    updateLanguage(language) {
        this.currentLanguage = language;
        
        // Update chatbot title
        const title = document.querySelector('.chatbot-header h3');
        title.textContent = language === 'ar' ? 'مساعد فولتيك' : 'Vaultique Assistant';
        
        // Update input placeholder
        const input = document.getElementById('chatbotInput');
        input.placeholder = language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...';
        
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new Chatbot();
    
    // Listen for language changes
    const languageSelects = document.querySelectorAll('#language');
    languageSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            if (window.chatbot) {
                window.chatbot.updateLanguage(e.target.value);
            }
        });
    });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Chatbot;
} 