// Mobil cihaz uyumluluk kontrolü ve hata ayıklama
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

(function() {
    // iOS Safari için özel console.log
    if (window.isMobile) {
        console.log('Mobile device detected:', navigator.userAgent);
        
        // Hata yakalama için global handler
        window.addEventListener('error', function(e) {
            console.error('Mobile JavaScript Error:', e.message, e.filename, e.lineno);
        });
    }
})();

// Navigation System
document.addEventListener('DOMContentLoaded', function() {
    // Mobil cihazlar için özel başlatma
    if (window.isMobile) {
        console.log('Mobile initialization started');
        
        // Farklı zamanlarda deneme yap - daha agresif yaklaşım
        const tryToShowSlogans = function(attempt = 1) {
            console.log('Mobile slogans attempt:', attempt);
            
            const slogans = document.querySelectorAll('.main-slogan, .section-slogan');
            let visibleCount = 0;
            
            slogans.forEach(function(slogan, index) {
                if (slogan) {
                    // Tüm olası gizleme stillerini temizle - daha agresif
                    slogan.style.cssText = 'opacity: 1 !important; visibility: visible !important; display: block !important; position: relative !important; z-index: 9999 !important; -webkit-transform: translateZ(0) !important; transform: translateZ(0) !important; -webkit-backface-visibility: hidden !important; backface-visibility: hidden !important; color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;';
                    
                    // CSS class'larından gelen stilleri geçersiz kıl
                    slogan.style.setProperty('opacity', '1', 'important');
                    slogan.style.setProperty('visibility', 'visible', 'important');
                    slogan.style.setProperty('display', 'block', 'important');
                    slogan.style.setProperty('color', '#ffffff', 'important');
                    slogan.style.setProperty('-webkit-text-fill-color', '#ffffff', 'important');
                    
                    // Metin içeriğini garanti altına al
                    if (!slogan.textContent.trim()) {
                        const dataText = slogan.getAttribute('data-text');
                        if (dataText) {
                            slogan.textContent = dataText;
                            console.log('Set text for slogan', index, ':', dataText);
                        }
                    } else {
                        console.log('Slogan', index, 'already has text:', slogan.textContent.trim());
                        visibleCount++;
                    }
                    
                    // Klas listesini kontrol et
                    console.log('Slogan', index, 'classes:', slogan.className);
                    console.log('Slogan', index, 'computed style:', window.getComputedStyle(slogan).opacity);
                }
            });
            
            console.log('Visible slogans:', visibleCount, '/', slogans.length);
            
            // Eğer henüz görünür değilse, tekrar dene
            if (visibleCount < slogans.length && attempt < 10) {
                setTimeout(function() {
                    tryToShowSlogans(attempt + 1);
                }, 500 * attempt); // Daha sık dene
            } else {
                console.log('Mobile slogans visibility ensured after', attempt, 'attempts');
            }
        };
        
        // Daha agresif zamanlama
        tryToShowSlogans(1);
        setTimeout(function() { tryToShowSlogans(2); }, 500);
        setTimeout(function() { tryToShowSlogans(3); }, 1000);
        setTimeout(function() { tryToShowSlogans(4); }, 2000);
        setTimeout(function() { tryToShowSlogans(5); }, 3000);
        setTimeout(function() { tryToShowSlogans(6); }, 5000);
        
        // Sayfa tamamen yüklendiğinde bir kez daha dene
        window.addEventListener('load', function() {
            console.log('Window load event - trying slogans again');
            tryToShowSlogans(7);
        });
        
        // iOS Safari için özel: touch event'inde de dene
        document.addEventListener('touchstart', function() {
            console.log('Touch start - trying slogans');
            tryToShowSlogans(8);
        }, { once: true });
        
        // Scroll event'inde de dene
        window.addEventListener('scroll', function() {
            console.log('Scroll event - trying slogans');
            tryToShowSlogans(9);
        }, { once: true });
    }
    // Aktivasyon modu: 'mini_logo' olduğunda yalnızca mini-logo/nav/init kaynaklı aktivasyon yapılır
    let activationMode = 'mini_logo';
const activateNav = (id, source = 'scroll') => {
        // Mini logo modunda bile scroll kaynaklı aktivasyonlara izin ver:
        // doğal kaydırmada aktif hero/slogan senkronize olsun.
        if (activationMode === 'mini_logo') {
            if (!(source === 'mini' || source === 'nav' || source === 'init' || source === 'scroll')) return;
        }
        setActiveNav(id);
    };
    // Tarayıcının önceki konumu ve hash’e göre otomatik kaydırmasını devre dışı bırak
    try {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        // Sayfa yenilendiğinde en başa (Home) zorla
        window.scrollTo(0, 0);
        
        if (window.location.hash) {
            // Başlangıçta yanlış sayfaya (ör. #blog) atlamayı önlemek için hash’i temizle
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    } catch (_) {}
const navLinks = document.querySelectorAll('.nav-link');
// HTML'deki özgün (desktop) nav metinlerini yakala; TR masaüstünde bunlar kullanılacak
const originalNavTexts = {};
navLinks.forEach(link => {
    const key = link.getAttribute('data-page');
    originalNavTexts[key] = link.textContent;
});
    const sections = document.querySelectorAll('.page-section');
    const logoLink = document.querySelector('.logo-link');
    const navContainer = document.querySelector('.nav-container');
    const langButtons = document.querySelectorAll('.lang-btn');
    // Programatik kaydırmada yukarı modunu geçici kapatma (text-panel gizleme bug’ını önler)
    let suppressUpwardModeUntil = 0;
    // Global siyah şeffaf overlay
    const blackOverlay = document.createElement('div');
    blackOverlay.className = 'black-fade-overlay';
    document.body.appendChild(blackOverlay);
    let blackFadeLock = false;
    function startBlackFade(from = 0.45, duration = 600) {
        if (!blackOverlay) return;
        if (blackFadeLock) return;
        blackFadeLock = true;
        blackOverlay.style.transition = `opacity ${duration}ms ease-in-out`;
        blackOverlay.style.opacity = from;
        // Reflow
        void blackOverlay.offsetHeight;
        blackOverlay.style.opacity = '0';
        const done = () => {
            blackFadeLock = false;
            blackOverlay.removeEventListener('transitionend', done);
        };
        blackOverlay.addEventListener('transitionend', done);
    }
    // Intro sıralaması aktif mi?
    let introActive = true;
    let initialSettled = false; // İlk yükleme tamamlanana kadar aktif takibi beklet
    
    // Başlangıç: nav sağda dikey sabit hizalı (sadece masaüstü)
    if (!window.isMobile) {
        stackNavRight();
    }
    
    // Handle logo click: anlık şekilde home'a git
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                const homeSection = document.getElementById('home');
                if (homeSection) {
                    suppressUpwardModeUntil = Date.now() + 1200 + 80;
                    startBlackFade(0.5, 1200);
                    smoothScrollToElement(homeSection, 1200, () => {
                        try { setActiveNav('home'); } catch (_) {}
                        try { history.replaceState(null, '', '#home'); } catch (_) {}
                        suppressUpwardModeUntil = 0;
                    });
                }
            } catch (_) {}
        });
    }
    
    // Random positioning for navigation links
    function randomizeNavPositions() {
        if (!navContainer || navContainer.classList.contains('stacked')) return;
        navLinks.forEach((link, index) => {
            const randomTop = Math.random() * (window.innerHeight - 200) + 100;
            const randomLeft = Math.random() * (window.innerWidth - 300) + 150;

            link.style.top = randomTop + 'px';
            link.style.left = randomLeft + 'px';

            const scale = 0.8 + Math.random() * 0.4;
            link.style.transform = `scale(${scale})`;

            link.style.animationDelay = `${Math.random() * 2}s`;
        });
    }
    
    // Sabit nav konumu; rastgele konumlandırma devre dışı
    
    // --- Language / i18n ---
    const i18n = {
        en: {
            nav: {
                home: 'Home',
                about: 'About',
                services: 'Services',
                vision: 'Vision',
                blog: 'Blog',
                contact: 'Contact'
            },
            slogan: 'THE WAY\nTO REACH\nTHE STARS',
            slogans: {
                about: 'WE\nCODE\nART',
                services: 'CANVASES\nOF\nTHE FUTURE',
                vision: 'PERSPECTIVE\nOF\nTOMORROW',
                blog: 'THE PULSE\nOF\nTHE DIGITAL'
            },
            blogTags: {
                all: 'All',
                strategy: 'Strategy',
                design: 'Design',
                data: 'Data'
            },
            blogReadMore: 'Read More',
            blogPosts: [
                { title: "The Era of AI Search Engines: Your Brand's Place in the Algorithm.", excerpt: 'Google SGE and other AI-powered search engines are redefining search. Learn how your brand can stand out and become visible deep within algorithms.', img: 'blog/1.png', alt: 'AI Search Era', tags: ['strategy','data'], content: 'AI-powered search changes discovery. To stand out, brands need semantic relevance, structured data, and authoritative content that models intent—not just keywords.\n\nInvest in schema, E-E-A-T signals, and fast, accessible pages. Treat the algorithm as a dynamic audience: measure, adapt, and keep improving your content graph.' },
                { title: 'The Futuristic Face of Branding: The Evolution of Digital Identity.', excerpt: 'Branding is more than a logo and a tagline. Explore the evolution of digital identity from VR to AI to shape your brand’s future persona.', img: 'blog/2.png', alt: 'Futuristic Branding', tags: ['strategy','design'], content: 'Digital identity now lives across screens, worlds, and contexts. Consistency means designing systems—tokens, motion, tone—that scale across realities.\n\nBrands that embrace adaptive identity stay credible as technology shifts, meeting people with familiar cues wherever they are.' },
                { title: 'The Art of Data: Inspiration from Marketing Analytics.', excerpt: 'Big data fuels marketing. Discover how we turn raw data into meaningful strategies and compelling stories—data as an art form.', img: 'blog/3.png', alt: 'Data as Art', tags: ['data','strategy'], content: 'Data becomes insight when framed with purpose. Ask better questions, reduce noise, and visualize relationships to reveal what matters.\n\nFrom attribution to cohort analysis, the aim is the same: make decisions clearer and faster for teams and customers.' },
                { title: 'Sustainable SEO: Remaining Resilient Against Algorithm Shifts.', excerpt: 'SEO algorithms constantly change. Secure your rankings with resilient strategies and predict future SEO trends.', img: 'blog/4.png', alt: 'Sustainable SEO', tags: ['strategy','data'], content: 'Algorithm changes reward sites that serve users well. Focus on content quality, topical depth, and technical hygiene like Core Web Vitals.\n\nBuild resilient traffic with evergreen hubs, internal linking, and ongoing editorial improvements rather than one-off hacks.' },
                { title: 'Micromarketing and Hyper-Segmentation: A Custom Digital Experience for Every Customer.', excerpt: 'The era of generic campaigns is over. Design tailored journeys with AI-powered micromarketing to boost conversions.', img: 'blog/5.png', alt: 'Micromarketing', tags: ['strategy','data'], content: 'Micromarketing matches moments to messages. With permissioned data and AI, tailor offers, timing, and creative to each segment.\n\nRespect privacy, add value, and measure uplift. When personalization feels helpful, conversion follows naturally.' },
                { title: 'The Future of Digital Interaction: The Metaverse and Brands.', excerpt: 'The Metaverse opens a new frontier. Create brand experiences, design digital products and engage next-gen consumers.', img: 'blog/6.png', alt: 'Metaverse and Brands', tags: ['strategy','design'], content: 'New mediums demand new behaviors. In immersive spaces, design for presence, community, and co-creation rather than passive consumption.\n\nBrands that experiment responsibly will learn faster and earn trust as the ecosystem matures.' },
                { title: 'Content Marketing 2.0: Generative AI and the Art of Storytelling.', excerpt: 'Generative AI transforms content creation. Build effective, personalized and scalable content without losing the human touch.', img: 'blog/7.png', alt: 'Content Marketing 2.0', tags: ['strategy','design'], content: 'Generative AI accelerates ideation and production. Keep humans in the loop for strategy, voice, and ethics.\n\nCombine templates with original thinking and real expertise to build content that is useful, distinctive, and trustworthy.' }
            ],
            visionContent: [
                {
                    heading: 'Architects of the Digital Universe: Infinite Potential',
                    paragraphs: [
                        'We operate with a mindset that builds not just for today, but for tomorrow. At Adastra, we are pioneers and architects for brands within the constantly evolving frontiers of the digital universe. Humanity has always looked to the stars, but we are realigning digital stars for brands.',
                        '"Man completes himself only in the future; we guide brands towards this completed state."'
                    ]
                },
                {
                    heading: 'Charting the Star Map: Leading with AI',
                    paragraphs: [
                        'Our goal is to chart each brand\'s unique "star map" in the digital realm and propel them to uncharted peaks. For us, success lies not merely in metrics, but in the impact we create and the innovation we champion.',
                        'To achieve this goal, we proactively monitor technological advancements and AI-powered analytical tools, leading the industry in this domain. We ensure our personnel and executives receive continuous, mandatory training on the most current and futuristic tools in digital marketing.',
                        '"The essence of everything is its striving to preserve itself; our striving is to immortalize the brand\'s essence in the digital."'
                    ]
                },
                {
                    heading: 'Artists of the Algorithm: A Form of Expression',
                    paragraphs: [
                        'We believe that digital marketing is not merely a technical process, but also a creative form of expression. In the future, we aim to push the boundaries of algorithms, enabling brands to shine like works of art in the digital space. Art and science are an inseparable whole at Adastra.'
                    ]
                },
                {
                    heading: 'Continuous Evolution: The Philosophy of Adaptation',
                    paragraphs: [
                        'As technology and trends rapidly change, so do we; however, our core philosophy remains constant: to be pioneers, to inspire, and to exceed expectations. We constantly re-program our strategies and methodologies to ensure brands remain a perpetually regenerating force in the digital.'
                    ]
                },
                {
                    heading: 'Our Source of Inspiration: The Zeal for Leadership',
                    paragraphs: [
                        'Every day, we are in pursuit of a new idea, a new technology, and a new story. Our vision is to ensure brands do not merely exist digitally, but become leaders who define the future.'
                    ]
                }
            ],
            tips: {
                label: 'Hint',
                tip1: {
                    heading: 'Focus on the Future.',
                    items: [
                        "Tip 1: Every challenge hides an opportunity. Digital transformation is not just a process, it's a new beginning for your brand.",
                        "Tip 2: Think big, start small. Even the most ambitious projects begin with the first step.",
                        "Tip 3: Don't be afraid to make mistakes; digital is the art of continuous learning and adaptation."
                    ]
                },
                tip2: {
                    heading: 'Speak with Data, Engage with Art.',
                    items: [
                        "Tip 1: Don't just know your target audience, understand them. Data analytics is the map of their digital journey.",
                        "Tip 2: Don't stick to a single platform. Tell your brand's story across the most suitable digital channels with a holistic approach.",
                        "Tip 3: Content is king, but engagement is queen. Create valuable content, but don't forget to maintain continuous dialogue with your audience.",
                        "Tip 4: Make A/B testing a habit. Digital marketing is a process of continuous experimentation and learning."
                    ]
                },
                tip3: {
                    heading: 'Say More with Less.',
                    items: [
                        "Tip 1: See simplicity as a source of power. A design free of unnecessary elements communicates the message more clearly.",
                        "Tip 2: Whitespace is the breath of design. Effectively use negative space to add depth and focus to your visuals.",
                        "Tip 3: Typography is the voice of the brand. Your font choices should accurately reflect the brand's identity and the message it wants to convey.",
                        "Tip 4: Use your color palette strategically. Create a futuristic and striking visual language with a sparse and precise use of colors."
                    ]
                }
            }
        },
        tr: {
            nav: {
                home: 'Ev',
                about: 'Bizler',
                services: 'İşimiz',
                vision: 'Vizyon',
                blog: 'Blog',
                contact: 'İletişim'
            },
            slogan: 'YILDIZLARA\nULAŞMANIN\nYOLU',
            slogans: {
                about: 'SANATI\nKODLUYORUZ',
                services: 'GELECEĞİN\nKANVASLARI',
                vision: 'YARININ\nPERSPEKTİFİ\nİÇİN',
                blog: 'DİJİTALİN\nNABZI'
            },
            blogTags: {
                all: 'Tümü',
                strategy: 'Strateji',
                design: 'Tasarım',
                data: 'Veri'
            },
            blogReadMore: 'Devamını oku',
            blogPosts: [
                { title: 'Yapay Zeka Arama Motorları Çağı: Markanızın Algoritmadaki Yeri.', excerpt: 'Google SGE ve diğer yapay zeka destekli arama motorları aramayı yeniden tanımlıyor. Markanızın bu düzende nasıl öne çıkacağını ve algoritmaların derinliklerinde nasıl görünür olacağını keşfedin.', img: 'blog/1.png', alt: 'YZ Arama Çağı', tags: ['strategy','data'], content: 'YZ destekli arama; keşfi kökten değiştiriyor. Öne çıkmak için anahtar kelimelerden çok niyeti modelleyen anlamsal içerik, yapılandırılmış veri ve otorite gerekir.\n\nŞemaya yatırım yapın, E-E-A-T sinyallerini güçlendirin ve erişilebilir, hızlı sayfalar üretin. Algoritmayı dinamik bir izleyici gibi görün: ölç, uyumlan ve içerik grafini sürekli geliştir.' },
                { title: "Branding'in Fütüristik Yüzü: Dijital Kimliğin Evrimi.", excerpt: 'Artık marka olmak sadece logo ve slogandan ibaret değil. Dijital kimliğin VR’dan yapay zekâya uzanan evrimiyle geleceğin marka personasını şekillendirin.', img: 'blog/2.png', alt: 'Fütüristik Branding', tags: ['strategy','design'], content: 'Dijital kimlik; ekranlar, dünyalar ve bağlamlar arasında yaşıyor. Tutarlılık; gerçeklikler arası ölçeklenen tasarım sistemleri—tokenlar, hareket, üslup—ile sağlanır.\n\nUyarlanabilir kimliği benimseyen markalar teknoloji değişse de inandırıcılıklarını korur; insanların olduğu her yerde tanıdık ipuçlarıyla buluşur.' },
                { title: 'Data Sanatı: Pazarlama Analizlerinden Gelen İlham.', excerpt: 'Büyük veri, pazarlamanın hammaddesi. Ham veriyi anlamlı stratejilere ve etkileyici hikayelere nasıl dönüştürdüğümüzü keşfedin—veriyi sanat eserine çeviriyoruz.', img: 'blog/3.png', alt: 'Data Sanatı', tags: ['data','strategy'], content: 'Veri; amaçla çerçevelendiğinde içgörüye dönüşür. Daha iyi sorular sorun, gürültüyü azaltın ve ilişkileri görselleştirerek önemli olanı ortaya çıkarın.\n\nAtıf analizinden kohortlara kadar amaç aynı: ekiplerin ve müşterilerin daha net ve hızlı karar vermesini sağlamak.' },
                { title: 'Sürdürülebilir SEO: Algoritma Değişikliklerine Karşı Esnek Kalmak.', excerpt: 'SEO algoritmaları sürekli güncelleniyor. Sıralamaları kalıcı kılmak için esnek stratejiler ve geleceğin SEO trendlerini öngörme yaklaşımlarını inceleyin.', img: 'blog/4.png', alt: 'Sürdürülebilir SEO', tags: ['strategy','data'], content: 'Algoritma güncellemeleri; kullanıcıya iyi hizmet veren siteleri ödüllendirir. İçerik kalitesine, konu derinliğine ve Core Web Vitals gibi teknik hijyene odaklanın.\n\nEvergreen içerik merkezleri, dahili bağlantılar ve sürekli editoryal iyileştirmelerle dayanıklı trafik oluşturun.' },
                { title: 'Mikropazarlama ve Hiper-Segmentasyon: Her Müşteriye Özel Bir Dijital Deneyim.', excerpt: 'Genel kampanyaların devri bitti. Yapay zekâ destekli mikropazarlama ile her müşteriye özel yolculuk tasarlayarak dönüşümleri artırın.', img: 'blog/5.png', alt: 'Mikropazarlama', tags: ['strategy','data'], content: 'Mikropazarlama; anları mesajlarla eşleştirir. İzinli veri ve YZ ile teklifleri, zamanlamayı ve kreatifi her segmente göre uyarlayın.\n\nGizliliğe saygı duyun, değer katın ve gerçek etkiyi ölçün. Kişiselleştirme yardımcı hissettirdiğinde dönüşüm doğal olarak gelir.' },
                { title: 'Dijital Etkileşimin Geleceği: Metaverse ve Markalar.', excerpt: 'Metaverse, markalar için yeni bir alan. Sanal dünyada deneyimler yaratın, dijital ürünler tasarlayın ve yeni nesil tüketicilerle etkileşime geçin.', img: 'blog/6.png', alt: 'Metaverse ve Markalar', tags: ['strategy','design'], content: 'Yeni ortamlar; yeni davranışlar ister. İmmersif alanlarda tasarım; varlık hissi, topluluk ve birlikte üretim üzerine kurulmalıdır—pasif tüketim değil.\n\nEkosistem olgunlaşırken sorumlu deney yapan markalar daha hızlı öğrenir ve güven kazanır.' },
                { title: 'İçerik Pazarlaması 2.0: Yaratıcı Yapay Zeka ve Hikaye Anlatımı.', excerpt: 'Yaratıcı yapay zekâ içerik üretimini dönüştürüyor. İnsan dokunuşunu koruyarak etkili, kişiselleştirilmiş ve ölçeklenebilir içerikler üretin.', img: 'blog/7.png', alt: 'İçerik Pazarlaması 2.0', tags: ['strategy','design'], content: 'Yaratıcı YZ; fikir üretimi ve üretimi hızlandırır. Strateji, üslup ve etik için insanı döngüde tutun.\n\nŞablonları özgün düşünce ve gerçek uzmanlıkla birleştirerek faydalı, ayırt edici ve güvenilir içerikler üretin.' }
            ],
            visionContent: [
                {
                    heading: 'Dijital Evrenin Mimarları: Sonsuz Potansiyel',
                    paragraphs: [
                        'Biz, sadece bugünü değil, yarını inşa eden bir zihniyetle çalışırız. Adastra olarak, dijital evrenin sürekli evrilen sınırlarında, markalar için birer kaşif ve mimarız. İnsanlık, her zaman yıldızlara bakmış, ancak biz dijital yıldızları markalar için yeniden hizalıyoruz.',
                        '“İnsan, kendini ancak gelecekte tamamlar; biz, markaların bu tamamlanmış haline yol gösteriyoruz.”'
                    ]
                },
                {
                    heading: 'Yıldız Haritası Çıkarmak: Yapay Zeka ile Öncülük',
                    paragraphs: [
                        'Amacımız, her markanın dijitaldeki benzersiz "yıldız haritasını" çıkarmak ve onları henüz keşfedilmemiş zirvelere taşımaktır. Bizim için başarı, sadece metriklerde değil, yarattığımız etki ve öncülük ettiğimiz inovasyonda yatar.',
                        'Bu hedefe ulaşmak için, teknolojik gelişmeleri ve yapay zeka destekli analizleri proaktif olarak takip ediyor, bu alanda sektöre öncülük ediyoruz. Personelimizin ve yöneticilerimizin, dijital pazarlamanın en güncel ve fütüristik araçları hakkında sürekli ve zorunlu eğitimler almasını sağlıyoruz.',
                        '“Her şeyin özü, kendini koruma çabasındadır; markanın özünü dijitalde ölümsüzleştirmek bizim çabamızdır.”'
                    ]
                },
                {
                    heading: 'Algoritmanın Sanatçıları: İfade Biçimi',
                    paragraphs: [
                        'Dijital pazarlamanın yalnızca teknik bir süreç değil, aynı zamanda yaratıcı bir ifade biçimi olduğuna inanıyoruz. Gelecekte, algoritmaların sınırlarını zorlayarak, markaların dijitalde birer sanat eseri gibi parlamasını sağlamayı hedefliyoruz. Sanat ve bilim, Adastra\'da ayrılmaz bir bütündür.'
                    ]
                },
                {
                    heading: 'Sürekli Evrim: Adaptasyonun Felsefesi',
                    paragraphs: [
                        'Teknoloji ve trendler hızla değiştikçe, biz de değişiriz; ancak temel felsefemiz sabittir: öncü olmak, ilham vermek ve beklentilerin ötesine geçmek. Markaların dijitalde sürekli yenilenen bir güç olmasını sağlamak için, stratejilerimizi ve metodolojimizi sürekli yeniden programlarız.'
                    ]
                },
                {
                    heading: 'İlham Kaynağımız: Liderlik Azmi',
                    paragraphs: [
                        'Her gün, yeni bir fikrin, yeni bir teknolojinin ve yeni bir hikayenin peşindeyiz. Vizyonumuz, markaların dijitalde sadece var olmalarını değil, geleceği tanımlayan liderler olmalarını sağlamaktır.'
                    ]
                }
            ],
            tips: {
                label: 'İpucu',
                tip1: {
                    heading: 'Geleceğe Odaklan',
                    items: [
                        'İpucu 1: Her zorlukta bir fırsat gizlidir. Dijital dönüşüm, sadece bir süreç değil, markanız için yeni bir başlangıçtır.',
                        'İpucu 2: Büyük düşün, küçük başla. En iddialı projeler bile, ilk adımı atmakla başlar.',
                        'İpucu 3: Hata yapmaktan korkma; dijital, sürekli öğrenme ve adapte olma sanatıdır.'
                    ]
                },
                tip2: {
                    heading: 'Veriyle Konuş, Sanatla Etkile',
                    items: [
                        'İpucu 1: Hedef kitleni sadece tanıma, anla. Veri analizleri, onların dijital yolculuklarının haritasıdır.',
                        'İpucu 2: Tek bir platforma bağlı kalma. Markanın hikayesini, en uygun dijital kanallarda, bütünsel bir yaklaşımla anlat.',
                        'İpucu 3: İçerik kraldır, ancak etkileşim kraliçedir. Değer yaratan içerikler üret, ancak kitlenle sürekli diyalog kurmayı unutma.',
                        'İpucu 4: A/B testlerini bir alışkanlık haline getir. Dijital pazarlama, sürekli deneme ve öğrenme sürecidir.'
                    ]
                },
                tip3: {
                    heading: 'Azda Çok Şey Anlat',
                    items: [
                        'İpucu 1: Sadeliği gücün kaynağı olarak gör. Gereksiz elementlerden arınmış bir tasarım, mesajı daha net iletir.',
                        'İpucu 2: Boşluk, tasarımın nefesidir. Negatif alanı etkili kullanarak görsellerine derinlik ve odak kat.',
                        'İpucu 3: Tipografi, markanın sesidir. Font seçimlerin, markanın kimliğini ve vermek istediği mesajı doğru yansıtmalı.',
                        'İpucu 4: Renk paletini stratejik kullan. Az ve öz renklerle, fütüristik ve çarpıcı bir görsel dil yarat.'
                    ]
                }
            }
        },
        ar: {
            nav: {
                home: 'الرئيسية',
                about: 'من نحن',
                services: 'خدماتنا',
                vision: 'رؤيتنا',
                blog: 'المدونة',
                contact: 'اتصل بنا'
            },
            slogan: 'الطريق\nللوصول\nإلى النجوم',
            slogans: {
                about: 'نحن\nنبرمج\nالفن',
                services: 'لوحات\nالمستقبل',
                vision: 'منظور\nالغد',
                blog: 'نبض\nالرقمية'
            },
            blogTags: {
                all: 'الكل',
                strategy: 'استراتيجية',
                design: 'تصميم',
                data: 'بيانات'
            },
            blogReadMore: 'اقرأ المزيد',
            blogPosts: [
                { title: 'عصر محركات البحث بالذكاء الاصطناعي: مكان علامتك التجارية في الخوارزمية.', excerpt: 'يعيد Google SGE ومحركات البحث الأخرى التي تعمل بالذكاء الاصطناعي تعريف البحث. تعرف على كيفية تميز علامتك التجارية وتصبح مرئية في عمق الخوارزميات.', img: 'blog/1.png', alt: 'عصر البحث بالذكاء الاصطناعي', tags: ['strategy','data'], content: 'يغير البحث المدعوم بالذكاء الاصطناعي الاكتشاف جذريًا. للتميز، تحتاج العلامات التجارية إلى ملاءمة دلالية، وبيانات منظمة، ومحتوى موثوق يمثل النية - ليس فقط الكلمات الرئيسية.\n\nاستثمر في المخطط، وإشارات E-E-A-T، والصفحات السريعة ويمكن الوصول إليها. تعامل مع الخوارزمية كجمهور ديناميكي: قم بالقياس والتكيف وتحسين الرسم البياني للمحتوى الخاص بك باستمرار.' }
            ],
            visionContent: [
                {
                    heading: 'مهندسو الكون الرقمي: إمكانات لا نهائية',
                    paragraphs: [
                        'نحن لا نعمل فقط بعقلية بناء اليوم، بل نبني الغد. بصفتنا Adastra، نحن مستكشفون ومهندسون للعلامات التجارية في الحدود المتطورة باستمرار للكون الرقمي. لطالما نظرت البشرية إلى النجوم، لكننا نعيد تنظيم النجوم الرقمية للعلامات التجارية.',
                        '“الإنسان يكمل نفسه فقط في المستقبل؛ ونحن نرشد العلامات التجارية إلى هذا الكمال.”'
                    ]
                },
                {
                    heading: 'رسم خريطة النجوم: القيادة بالذكاء الاصطناعي',
                    paragraphs: [
                        'هدفنا هو رسم "خريطة النجوم" الفريدة لكل علامة تجارية في العالم الرقمي ودفعها إلى قمم غير مستكشفة. بالنسبة لنا، لا يكمن النجاح في المقاييس فحسب، بل في التأثير الذي نخلقه والابتكار الذي ندافع عنه.',
                        'لتحقيق هذا الهدف، نراقب بشكل استباقي التقدم التكنولوجي وأدوات التحليل المدعومة بالذكاء الاصطناعي، ونقود الصناعة في هذا المجال. نضمن حصول موظفينا والمديرين التنفيذيين لدينا على تدريب مستمر وإلزامي حول أحدث الأدوات المستقبلية في التسويق الرقمي.',
                        '“جوهر كل شيء هو سعيه للحفاظ على نفسه؛ سعينا هو تخليد جوهر العلامة التجارية في العالم الرقمي.”'
                    ]
                },
                {
                    heading: 'فنانو الخوارزميات: شكل من أشكال التعبير',
                    paragraphs: [
                        'نحن نؤمن بأن التسويق الرقمي ليس مجرد عملية تقنية، بل هو أيضًا شكل إبداعي من أشكال التعبير. في المستقبل، نهدف إلى دفع حدود الخوارزميات، وتمكين العلامات التجارية من التألق مثل الأعمال الفنية في الفضاء الرقمي. الفن والعلم كل لا يتجزأ في Adastra.'
                    ]
                },
                {
                    heading: 'التطور المستمر: فلسفة التكيف',
                    paragraphs: [
                        'مع تغير التكنولوجيا والاتجاهات بسرعة، نتغير نحن أيضًا؛ ومع ذلك، تظل فلسفتنا الأساسية ثابتة: أن نكون روادًا، ونلهم، ونتجاوز التوقعات. نعيد برمجة استراتيجياتنا ومنهجياتنا باستمرار لضمان بقاء العلامات التجارية قوة متجددة باستمرار في العالم الرقمي.'
                    ]
                },
                {
                    heading: 'مصدر إلهامنا: الشغف بالقيادة',
                    paragraphs: [
                        'كل يوم، نحن في سعي وراء فكرة جديدة، وتقنية جديدة، وقصة جديدة. رؤيتنا هي ضمان ألا تتواجد العلامات التجارية رقميًا فحسب، بل أن تصبح قادة يحددون المستقبل.'
                    ]
                }
            ],
            tips: {
                label: 'تلميح',
                tip1: {
                    heading: 'التركيز على المستقبل.',
                    items: [
                        "تلميح 1: كل تحد يخفي فرصة. التحول الرقمي ليس مجرد عملية، بل هو بداية جديدة لعلامتك التجارية.",
                        "تلميح 2: فكر بشكل كبير، وابدأ صغيرًا. حتى أكثر المشاريع طموحًا تبدأ بالخطوة الأولى.",
                        "تلميح 3: لا تخف من ارتكاب الأخطاء؛ الرقمية هي فن التعلم المستمر والتكيف."
                    ]
                },
                tip2: {
                    heading: 'تحدث بالبيانات، وتفاعل بالفن.',
                    items: [
                        "تلميح 1: لا تعرف جمهورك المستهدف فحسب، بل افهمهم. تحليلات البيانات هي خريطة رحلتهم الرقمية.",
                        "تلميح 2: لا تلتزم بمنصة واحدة. اسرد قصة علامتك التجارية عبر القنوات الرقمية الأكثر ملاءمة بنهج شامل.",
                        "تلميح 3: المحتوى هو الملك، لكن التفاعل هو الملكة. أنشئ محتوى قيمًا، لكن لا تنس الحفاظ على حوار مستمر مع جمهورك.",
                        "تلميح 4: اجعل اختبار A/B عادة. التسويق الرقمي هو عملية تجريب وتعلم مستمرة."
                    ]
                },
                tip3: {
                    heading: 'قل المزيد بأقل.',
                    items: [
                        "تلميح 1: انظر إلى البساطة كمصدر للقوة. التصميم الخالي من العناصر غير الضرورية يوصل الرسالة بشكل أوضح.",
                        "تلميح 2: المساحة البيضاء هي نَفَس التصميم. استخدم المساحة السلبية بفعالية لإضافة عمق وتركيز لصورك.",
                        "تلميح 3: الطباعة هي صوت العلامة التجارية. يجب أن تعكس اختيارات الخطوط الخاصة بك هوية العلامة التجارية والرسالة التي تريد نقلها بدقة.",
                        "تلميح 4: استخدم لوحة الألوان الخاصة بك بشكل استراتيجي. أنشئ لغة بصرية مستقبلية ومذهلة باستخدام قليل ودقيق للألوان."
                    ]
                }
            }
        }
    };

    function setActiveLangButton(lang) {
        langButtons.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-lang') === lang));
    }

    // --- Blog: Dinamik render ve filtre (DOM yüklendikten sonra kapsamda) ---
    const state = { blogFilter: 'all' };
    function renderBlogFilter(lang) {
        const dict = i18n[lang] || i18n.en;
        const container = document.querySelector('#blog .blog-container');
        if (!container) return;
        let bar = container.querySelector('.blog-filter');
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'blog-filter';
            container.insertBefore(bar, container.querySelector('.section-divider')?.nextSibling || container.firstChild);
        }
        const labels = dict.blogTags;
        bar.innerHTML = [
            { key: 'all', label: labels.all },
            { key: 'strategy', label: labels.strategy },
            { key: 'design', label: labels.design },
            { key: 'data', label: labels.data }
        ].map(btn => `<button class="filter-btn${state.blogFilter===btn.key?' active':''}" data-filter="${btn.key}" aria-pressed="${state.blogFilter===btn.key}">${btn.label}</button>`).join('');
        bar.querySelectorAll('.filter-btn').forEach(b => {
            b.addEventListener('click', () => {
                state.blogFilter = b.getAttribute('data-filter');
                renderBlogFilter(lang);
                renderBlogGallery(lang);
            });
        });
    }
    function renderBlogGallery(lang) {
        const dict = i18n[lang] || i18n.en;
        const posts = Array.isArray(dict.blogPosts) ? dict.blogPosts : [];
        const gallery = document.querySelector('#blog .blog-gallery');
        if (!gallery) return;
        // Rastgele tarihleri (son 2 yıl) üret ve localStorage'da kalıcı tut
        const storageKey = `blogDates:v1:${lang}`;
        let map = {};
        try { map = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (_) { map = {}; }
        const now = Date.now();
        const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;
        posts.forEach(p => {
            const key = p.title;
            if (!map[key]) {
                const rnd = Math.random();
                const d = new Date(now - Math.floor(rnd * twoYears));
                map[key] = d.toISOString();
            }
        });
        try { localStorage.setItem(storageKey, JSON.stringify(map)); } catch (_) {}

        // Yardımcı: tarihi biçimle
        function formatDate(iso) {
            const d = new Date(iso);
            if (lang === 'tr') {
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const yyyy = d.getFullYear();
                return `${dd}.${mm}.${yyyy}`;
            }
            if (lang === 'ar') {
                return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' });
            }
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        const withDates = posts.map(p => ({ ...p, __dateISO: map[p.title], __date: new Date(map[p.title]) }));
        // Filtre ve sıralama: eskiden yeniye doğru
        const activeTag = state.blogFilter;
        const filtered = activeTag==='all' ? withDates : withDates.filter(p => (p.tags||[]).includes(activeTag));
        filtered.sort((a,b) => a.__date - b.__date);

        gallery.innerHTML = filtered.map(p => `
            <article class="blog-card" tabindex="0" data-tags="${(p.tags||[]).join(',')}">
                <img class="blog-thumb" src="${p.img}" alt="${p.alt||p.title}">
                <div class="blog-meta">
                    <h3 class="blog-card-title">${p.title}</h3>
                    <p class="blog-card-excerpt">${p.excerpt}</p>
                    <div class="blog-card-footer">
                        <span class="blog-card-date">${formatDate(p.__dateISO)}</span>
                        <div class="blog-hashtags">
                            ${(p.tags||[]).map(tag => `<span class="blog-hashtag">#${tag}</span>`).join('')}
                        </div>
                        <button class="blog-listen-btn" type="button" aria-label="Dinle">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                                <path d="M4 12a8 8 0 0116 0"/>
                                <rect x="3" y="12" width="4" height="7" rx="2"/>
                                <rect x="17" y="12" width="4" height="7" rx="2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');
        // Kart odak/klik animasyonu
        gallery.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('click', () => card.classList.add('pulse'));
            card.addEventListener('animationend', () => card.classList.remove('pulse'));
        });
        // Read More: modal aç
        gallery.querySelectorAll('.blog-listen-btn').forEach((btn, idx) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const post = filtered[idx];
                if (post) openReadModal(post, lang);
            });
        });
    }

    // --- Read Modal Helpers ---
    function ensureReadModal() {
        let overlay = document.querySelector('.read-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'read-modal-overlay';
            overlay.innerHTML = `
                <div class="read-modal" role="dialog" aria-modal="true" aria-labelledby="readModalTitle" tabindex="-1">
                    <button class="read-modal-close" type="button" aria-label="Close">×</button>
                    <div class="read-modal-header"><h3 id="readModalTitle"></h3></div>
                    <div class="read-modal-content"></div>
                </div>
            `;
            document.body.appendChild(overlay);
            // Close on overlay click
            overlay.addEventListener('click', (ev) => {
                if (ev.target.classList.contains('read-modal-overlay')) closeReadModal();
            });
            // Close on button
            overlay.querySelector('.read-modal-close').addEventListener('click', closeReadModal);
            // Close on Escape
            document.addEventListener('keydown', (ev) => {
                if (ev.key === 'Escape') closeReadModal();
            });
        }
        return overlay;
    }

    function openReadModal(post, lang) {
        const overlay = ensureReadModal();
        const dict = i18n[lang] || i18n.en;
        overlay.querySelector('#readModalTitle').textContent = post.title;
        const contentHTML = String(post.content || post.excerpt || '')
            .split('\n\n')
            .map(p => `<p>${p}</p>`)
            .join('');
        overlay.querySelector('.read-modal-content').innerHTML = contentHTML;
        overlay.querySelector('.read-modal-close').setAttribute('aria-label', dict.blogClose || (lang==='tr'?'Kapat':(lang==='ar'?'إغلاق':'Close')));
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
        const modal = overlay.querySelector('.read-modal');
        modal.focus();
    }

    function closeReadModal() {
        const overlay = document.querySelector('.read-modal-overlay');
        if (!overlay) return;
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    let currentLang = null;
    // Yardımcı: Viewport'a göre nav metinlerini güncelle
    // İstek: TR dilinde 16:9 (geniş ekran) sürümde masaüstü metinleri kullan,
    // mobilde ise kısaltmaları göster.
    function updateNavLabelsForViewport(lang) {
        const dict = i18n[lang] || i18n.en;
        const aspect = Math.max(1, (window.innerWidth || 1)) / Math.max(1, (window.innerHeight || 1));
        const isWide = (typeof window.matchMedia === 'function' && window.matchMedia('(min-aspect-ratio: 16/9)').matches)
            || aspect >= (16/9 - 0.01);
        const useDesktopTRTexts = (lang === 'tr') && isWide;

        navLinks.forEach(link => {
            const key = link.getAttribute('data-page');
            // Dış bağlantılar (ör. Blog /yazilar/) data-page taşımayabilir; atla
            if (!key) return;
            if (useDesktopTRTexts) {
                // 16:9 masaüstünde TR için HTML’deki özgün metinleri koru
                const original = originalNavTexts[key];
                const fallback = dict.nav && dict.nav[key];
                if (original) link.textContent = original;
                else if (fallback) link.textContent = fallback;
            } else {
                if (dict.nav && dict.nav[key]) {
                    link.textContent = dict.nav[key];
                }
            }
        });
    }

    function applyLanguage(lang, restart = false) {
        const dict = i18n[lang] || i18n.en;
        currentLang = lang;
        // Nav metinleri: istek gereği yalnızca mobilde TR kısaltmalarını uygula; EN her yerde
        updateNavLabelsForViewport(lang);
        // Slogan metinleri: sadece data-text güncelle, animasyonu tetikleme
        const homeSlogan = document.querySelector('#home .main-slogan');
        if (homeSlogan) {
            homeSlogan.setAttribute('data-text', dict.slogan);
            // Başlangıçta sloganın görünmemesini önlemek için gerçek metni yerleştir
            homeSlogan.textContent = dict.slogan;
            // Mobil cihazlar için ek görünürlük garantisi
            if (isMobile) {
                homeSlogan.style.opacity = '1';
                homeSlogan.style.visibility = 'visible';
                homeSlogan.style.display = 'block';
                // iOS Safari için ek garanti: z-index ve position
                homeSlogan.style.position = 'relative';
                homeSlogan.style.zIndex = '9999';
            }
        }
        const sectionKeys = ['about','services','vision','blog'];
        sectionKeys.forEach(key => {
            const el = document.querySelector(`#${key} .section-slogan`);
            if (!el) return;
            const text = dict.slogans && dict.slogans[key];
            if (text) {
                el.setAttribute('data-text', text);
                // Pseudo‑element kullanılmasa bile metin görünsün
                el.textContent = text;
            }
        });

        // Blog içeriğini ve filtreyi güncelle
        try {
            renderBlogFilter(lang);
            renderBlogGallery(lang);
        } catch (_) {}

        // About içerik görünürlüğü (TR/EN/DE/AR)
        try {
            const aboutTr = document.querySelector('#about .about-content');
            const aboutEn = document.querySelector('#about .about-content-en');
            const aboutAr = document.querySelector('#about .about-content-ar');
            
            [aboutTr, aboutEn, aboutAr].forEach(el => el && el.classList.add('ui-hidden'));
            
            if (lang === 'en' && aboutEn) {
                aboutEn.classList.remove('ui-hidden');
            } else if (lang === 'ar' && aboutAr) {
                aboutAr.classList.remove('ui-hidden');
            } else if (aboutTr) {
                aboutTr.classList.remove('ui-hidden');
            }
        } catch (_) {}

        // Vision içerik görünürlüğü (TR/EN/AR)
        try {
            const visionTr = document.querySelector('#vision .vision-content');
            const visionEn = document.querySelector('#vision .vision-content-en');
            const visionAr = document.querySelector('#vision .vision-content-ar');
            
            [visionTr, visionEn, visionAr].forEach(el => el && el.classList.add('ui-hidden'));
            
            if (lang === 'en' && visionEn) {
                visionEn.classList.remove('ui-hidden');
            } else if (lang === 'ar' && visionAr) {
                visionAr.classList.remove('ui-hidden');
            } else if (visionTr) {
                visionTr.classList.remove('ui-hidden');
            }
        } catch (_) {}

        // Contact içerik görünürlüğü (TR/EN/AR)
        try {
            const contactTr = document.querySelector('#contact .contact-container');
            const contactEn = document.querySelector('#contact .contact-container-en');
            const contactAr = document.querySelector('#contact .contact-container-ar');
            
            [contactTr, contactEn, contactAr].forEach(el => el && el.classList.add('ui-hidden'));
            
            if (lang === 'en' && contactEn) {
                contactEn.classList.remove('ui-hidden');
            } else if (lang === 'ar' && contactAr) {
                contactAr.classList.remove('ui-hidden');
            } else if (contactTr) {
                contactTr.classList.remove('ui-hidden');
            }
        } catch (_) {}

        // Services içerik görünürlüğü (TR/EN/DE/AR)
        try {
            const servicesTr = document.querySelector('#services .services-content');
            const servicesEn = document.querySelector('#services .services-content-en');
            const servicesAr = document.querySelector('#services .services-content-ar');

            [servicesTr, servicesEn, servicesAr].forEach(el => el && el.classList.add('ui-hidden'));
            
            if (lang === 'en' && servicesEn) {
                servicesEn.classList.remove('ui-hidden');
            } else if (lang === 'ar' && servicesAr) {
                servicesAr.classList.remove('ui-hidden');
            } else if (servicesTr) {
                servicesTr.classList.remove('ui-hidden');
            }
        } catch (_) {}

        // Home içerik görünürlüğü (TR/EN/AR)
        try {
            const homeTr = document.querySelector('#home .home-content');
            const homeEn = document.querySelector('#home .home-content-en');
            const homeAr = document.querySelector('#home .home-content-ar');

            [homeTr, homeEn, homeAr].forEach(el => el && el.classList.add('ui-hidden'));
            
            if (lang === 'en' && homeEn) {
                homeEn.classList.remove('ui-hidden');
            } else if (lang === 'ar' && homeAr) {
                homeAr.classList.remove('ui-hidden');
            } else if (homeTr) {
                homeTr.classList.remove('ui-hidden');
            }
        } catch (_) {}

        // HTML lang ve dir özniteliklerini güncelle
        try { 
            document.documentElement.setAttribute('lang', lang);
            document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        } catch (_) {}

        // Tips içerikleri
        if (dict.tips) {
            const label = dict.tips.label || 'Tip';
            function sanitizeHeading(text) {
                if (!text) return '';
                return text.trim().replace(/[\s\.!?]+$/u, '');
            }
            function setTip(selector, tip) {
                const itemEl = document.querySelector(selector);
                if (!itemEl || !tip) return;
                const headingEl = itemEl.querySelector('.tip-heading');
                const listEl = itemEl.querySelector('.tip-list');
                if (headingEl && tip.heading) headingEl.textContent = sanitizeHeading(tip.heading);
                if (listEl && Array.isArray(tip.items)) {
                    listEl.innerHTML = tip.items.map((text, idx) => {
                        const cleaned = text.replace(/^(Tip|İpucu|Tipp)\s*\d+:\s*/i, '');
                        return `<li><strong>${label} ${idx+1}:</strong> ${cleaned}</li>`;
                    }).join('');
                }
            }
            setTip('.tip-item.tip-1', dict.tips.tip1);
            setTip('.tip-item.tip-2', dict.tips.tip2);
            setTip('.tip-item.tip-3', dict.tips.tip3);
        }
        // Contact abonelik alanı kaldırıldı
        localStorage.setItem('lang', lang);
        setActiveLangButton(lang);
        // İstenen davranış: dil değişince sayfa kendini tazelesin
        if (restart) {
            try { window.location.reload(); }
            catch (_) { window.location.href = window.location.href; }
            return;
        }
    }

    const savedLang = localStorage.getItem('lang') || 'en';
    applyLanguage(savedLang, false);

    // Viewport değiştiğinde nav etiketlerini yeniden değerlendir
    let rafNav = null;
    window.addEventListener('resize', () => {
        if (rafNav) return;
        rafNav = requestAnimationFrame(() => {
            rafNav = null;
            const langNow = currentLang || (localStorage.getItem('lang') || savedLang);
            updateNavLabelsForViewport(langNow);
        });
    });

    // Blog: Yükleme sonrası güvenlik ağı – galeri boşsa yeniden çiz
    try {
        const galleryEl = document.querySelector('#blog .blog-gallery');
        const containerEl = document.querySelector('#blog .blog-container');
        const langNow = localStorage.getItem('lang') || savedLang;
        if (containerEl) { renderBlogFilter(langNow); }
        if (galleryEl && !galleryEl.children.length) { renderBlogGallery(langNow); }
    } catch (_) {}

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            applyLanguage(lang, true);
        });
    });

    // Nav tıklamada anlık şekilde bölüme git ve aktif/görünür durumları yönet
    const logo = document.querySelector('.logo');
    let currentActiveId = null;
    function setActiveNav(id) {
        const idChanged = currentActiveId !== id;
        const prevSection = idChanged && currentActiveId ? document.getElementById(currentActiveId) : null;
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-page') === id);
        });
        if (logo) {
            if (id === 'contact') logo.classList.add('hidden');
            else logo.classList.remove('hidden');
        }
        // Aktif bölümü body data attribute üzerinde tut
        document.body.dataset.activeSection = id;
        // Hero görünürlüğünü senkronize et: yalnızca aktif bölümün hero görseli görünür
        try {
            // Önce tüm önizlemeleri temizle
            sections.forEach(s => s.classList.remove('hero-preview'));
            // Çapraz geçiş kapalı: hero-hold eklenmez (şeffaflaşma/çakışma önlenir)
            // Sonra yeni bölümü aktif hale getir
            sections.forEach(s => s.classList.toggle('hero-active', s.id === id));
            // Önceki tutma sınıfı kullanılmıyor
        } catch (_) {}
        // Slogan görünürlüğünü senkronize et: yalnızca aktif bölümde görünür olsun
        try {
            sections.forEach(s => s.classList.toggle('slogan-active', s.id === id));
        } catch (_) {}
        // Aynı bölüm tekrar bildirildiğinde animasyonları yeniden tetikleme: ERKEN DÖN
        if (!idChanged) {
            return;
        }
        // Slogan animasyonunu yalnızca bölüm değiştiğinde tetikle
        try {
            const slogan = document.querySelector(`#${id} .section-slogan`) || (id === 'home' ? document.querySelector('#home .main-slogan') : null);
            if (slogan) {
                slogan.innerHTML = '';
                typewriterEffect(slogan);
            }
        } catch (_) {}
        // Görünür bölüme geçildiğinde ilgili animasyonları tetikle
        const sectionEl = document.getElementById(id);
        if (sectionEl) {
            try { triggerSectionAnimations(sectionEl); } catch (_) {}
        }
        currentActiveId = id;
    }
    // İlk yüklemede ana sayfa aktif
    window.scrollTo(0, 0);
    activateNav('home', 'init');

    // Aktif bölümde hero’yu sabitleyen sınıfı senkronize et
    (function syncFixedHeroWithActiveSection() {
        const EXCLUDE = new Set(['contact']);
        function apply(id) {
            document.querySelectorAll('.page-section.fixed-hero-active').forEach(el => el.classList.remove('fixed-hero-active'));
            if (!id || EXCLUDE.has(id)) return;
            const section = document.getElementById(id);
            if (section) section.classList.add('fixed-hero-active');
        }
        // İlk durum
        apply(document.body.dataset.activeSection || 'home');
        // Aktiflik değiştiğinde güncelle
        const obs = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.attributeName === 'data-active-section') {
                    apply(document.body.dataset.activeSection);
                    break;
                }
            }
        });
        obs.observe(document.body, { attributes: true, attributeFilter: ['data-active-section'] });
        // Nav tıklamalarında da güvence altına al
        navLinks.forEach(link => link.addEventListener('click', () => apply(link.getAttribute('data-page'))));
    })();

    // Global yumuşak kaydırma: öncelikle element.scrollIntoView kullan
    function smoothScrollToElement(el, duration = 800, onDone = null) {
        if (!el) return;
        // Varsayılan sürede native davranışı kullan, özel sürede manuel easing uygula
        if (duration === 800) {
            try {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            } catch (_) {}
        }
        // Fallback: pencere düzeyi animasyon (destek yoksa)
        const startY = window.scrollY || window.pageYOffset || 0;
        const targetY = startY + el.getBoundingClientRect().top;
        const start = performance.now();
        const ease = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        function step(now) {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            const y = startY + (targetY - startY) * ease(t);
            window.scrollTo(0, y);
            if (t < 1) requestAnimationFrame(step);
            else if (typeof onDone === 'function') {
                try { onDone(); } catch (_) {}
            }
        }
        requestAnimationFrame(step);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetPage = this.getAttribute('data-page');
            // data-page yoksa (ör. Blog: /yazilar/ gibi dış/ayrı sayfa), varsayılan gezinmeye izin ver
            if (!targetPage) {
                return; // tarayıcı kendi yönlendirmesini yapsın
            }
            e.preventDefault();
            const targetSection = document.getElementById(targetPage);
            if (targetSection) {
                // Bölümü hemen aktif et: hero görünür ve sabit ayarlar doğru uygulanır
                try { activateNav(targetPage, 'nav'); } catch (_) {}
                const isHome = targetPage === 'home';
                if (isHome) {
                    suppressUpwardModeUntil = Date.now() + 1200 + 80;
                    startBlackFade(0.5, 1200);
                    smoothScrollToElement(targetSection, 1200, () => {
                        try { setActiveNav('home'); } catch (_) {}
                        try { history.replaceState(null, '', `#${targetPage}`); } catch (_) {}
                        suppressUpwardModeUntil = 0;
                    });
                } else {
                    suppressUpwardModeUntil = Date.now() + 600 + 80;
                    startBlackFade(0.4, 600);
                    smoothScrollToElement(targetSection);
                    setTimeout(() => { suppressUpwardModeUntil = 0; }, 700);
                }
            }
            // URL hash’i güncelle: geri/ileri tuşlarında tutarlı davranış
            if (targetPage !== 'home') {
                try { history.replaceState(null, '', `#${targetPage}`); } catch (_) {}
            }
        });
    });

    // Aktif bölüm takibi mevcut enableActiveTracking ile yönetiliyor (aşağıda).

    // Bölüm gözlemcisi kaldırıldı; aktif durum tıklama ile yönetilir
    
    // Trigger animations based on section
    function triggerSectionAnimations(section) {
        const sectionId = section.id;
        
        switch(sectionId) {
            case 'home':
                animateHomeSection();
                break;
            case 'about':
                animateAboutSection();
                break;
            case 'services':
                animateServicesSection();
                break;
            case 'vision':
                animateVisionSection();
                break;
            case 'blog':
                animateBlogSection();
                break;
            case 'contact':
                animateContactSection();
                break;
        }
    }
    
    // Home section animations
    function animateHomeSection() {
        const slogan = document.querySelector('#home .main-slogan');
        const heroImage = document.querySelector('#home .hero-image');
        // Reset and prepare typing
        if (slogan) {
            slogan.style.animation = 'none';
            slogan.style.opacity = '1';
        }

        // Trigger reflow
        if (slogan) slogan.offsetHeight;

        // Görsel doğrudan yüklensin: animasyon yok
        if (heroImage) {
            heroImage.style.animation = 'none';
        }

        // Sloganın yazım animasyonu setActiveNav içinde tetikleniyor; burada çağırmıyoruz

        // Sayfa açıldı: nav'ı sağda yığ ve animasyonu durdur (sadece masaüstü)
        if (!window.isMobile) {
            setTimeout(() => {
                stackNavRight();
            }, 1600);
        }
    }
    
    // About section animations
    function animateAboutSection() {
        const slogan = document.querySelector('#about .section-slogan');
        if (slogan) {
            slogan.style.animation = 'none';
            slogan.style.opacity = '1';
            // Yazım animasyonu setActiveNav tarafından tetiklenir
        }
    }
    
    // Services section animations
    function animateServicesSection() {
        const slogan = document.querySelector('#services .section-slogan');
        if (slogan) {
            slogan.style.animation = 'none';
            slogan.style.opacity = '1';
            // Yazım animasyonu setActiveNav tarafından tetiklenir
        }
    }
    
    // Vision section animations
    function animateVisionSection() {
        const slogan = document.querySelector('#vision .section-slogan');
        if (slogan) {
            slogan.style.animation = 'none';
            slogan.style.opacity = '1';
            // Yazım animasyonu setActiveNav tarafından tetiklenir
        }
    }
    
    // Blog section animations
    function animateBlogSection() {
        const slogan = document.querySelector('#blog .section-slogan');
        if (slogan) {
            slogan.style.animation = 'none';
            slogan.style.opacity = '1';
            // Yazım animasyonu setActiveNav tarafından tetiklenir
        }
    }
    
    // Contact section animations
    function animateContactSection() {
        const slogan = document.querySelector('#contact .section-slogan');
        const qrContainer = document.querySelector('#contact .qr-container');
        // Bölümde animasyon kullanılmıyor
        if (slogan) slogan.style.animation = 'none';
        if (qrContainer) qrContainer.style.animation = 'none';
    }
    
    // Typewriter effect function
    function typewriterEffect(element) {
        const text = element.getAttribute('data-text') || '';
        // Önce varsa bekleyen zamanlayıcıyı temizle
        if (element._typewriterTimer) {
            clearTimeout(element._typewriterTimer);
            element._typewriterTimer = null;
        }
        element.innerHTML = '';

        let i = 0;
        const speed = 100; // typing speed in milliseconds

        function typeWriter() {
            if (i < text.length) {
                const ch = text.charAt(i);
                const next = text.charAt(i + 1);
                if (ch === '\n') {
                    element.innerHTML += '<br>';
                    i += 1;
                } else if (ch === '\\' && next === 'n') {
                    // '\n' kaçış dizilerini gerçek satır sonu olarak işle
                    element.innerHTML += '<br>';
                    i += 2;
                } else {
                    element.innerHTML += ch;
                    i += 1;
                }
                element._typewriterTimer = setTimeout(typeWriter, speed);
            } else {
                element._typewriterTimer = null;
            }
        }

        typeWriter();
    }
    
    // İlk animasyonlar setActiveNav ile tetiklenir; ekstra zamanlayıcı yok

    // Eş zamanlı kaydırma hareketi kaldırıldı: sadece slogan animasyonlu
    
    // Add floating animation to navigation links
    // Yüzen animasyon devre dışı; nav sabit

    function stopNavAnimations() {
        navLinks.forEach(link => {
            link.style.animation = 'none';
            link.style.animationDelay = '';
        });
    }

    function stackNavRight() {
        if (!navContainer) return;
        if (navContainer.classList.contains('stacked')) return;

        stopNavAnimations();
        navContainer.classList.add('stacked');

        navLinks.forEach(link => {
            link.style.top = '';
            link.style.left = '';
            link.style.right = '';
            link.style.bottom = '';
            link.style.transform = '';
        });
    }
    
    // QR Code pulse animation CSS
    const qrPulseCSS = `
        @keyframes qrPulse {
            0%, 100% { 
                transform: scale(1);
                box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
            }
            50% { 
                transform: scale(1.05);
                box-shadow: 0 0 50px rgba(0, 212, 255, 0.6);
            }
        }
    `;
    
    const qrStyle = document.createElement('style');
    qrStyle.textContent = qrPulseCSS;
    document.head.appendChild(qrStyle);
    
    // Parallax effect for background images
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.page-section[data-background]:not([data-background="none"])');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    const enableParallax = false;
    if (enableParallax) {
        window.addEventListener('scroll', requestTick);
    }
    
    // Mouse movement effect disabled: nav links remain static unless hovered

    // Mouse wheel snapping: AÇIK. Tekerlek çevirmede tek adımda bölüm değiştir.
    (function enableWheelSnap() {
        const ENABLE_WHEEL_SNAP = false;
        if (!ENABLE_WHEEL_SNAP) return;
        const order = ['home', 'about', 'services', 'vision', 'blog', 'contact'];
        let snapping = false;
        let lastSnapTime = 0;
        const snapCooldown = 350; // ms

        function currentSectionIndex() {
            return order.findIndex(id => {
                const el = document.getElementById(id);
                if (!el) return false;
                const rect = el.getBoundingClientRect();
                const mid = window.innerHeight * 0.5;
                return rect.top <= mid && rect.bottom >= mid;
            });
        }

        function snapTo(index) {
            const now = Date.now();
            if (snapping || (now - lastSnapTime) < snapCooldown) return;
            const id = order[Math.max(0, Math.min(order.length - 1, index))];
            const el = document.getElementById(id);
            if (!el) return;
            snapping = true;
            lastSnapTime = now;
            smoothScrollToElement(el);
            // Aktif bölümü güncelle ve iletişimde logoyu gizle
            try { setActiveNav(id); } catch (_) {}
            setTimeout(() => { snapping = false; }, snapCooldown);
        }

        window.addEventListener('wheel', function(e) {
            // Her teker hareketinde tek adım snap: doğal scroll'u durdur
            const absDelta = Math.abs(e.deltaY);
            if (absDelta < 5) return; // çok küçük hareketleri görmezden gel

            const idx = currentSectionIndex();
            if (idx === -1) return;

            e.preventDefault();
            if (e.deltaY > 0 && idx < order.length - 1) {
                snapTo(idx + 1);
            } else if (e.deltaY < 0 && idx > 0) {
                snapTo(idx - 1);
            }
        }, { passive: false });
    })();

    // About sonunda otomatik geçiş: DEVRE DIŞI
    (function enableAboutAutoAdvance() {
        const ENABLE = false;
        if (!ENABLE) return;
        const aboutEl = document.getElementById('about');
        const servicesEl = document.getElementById('services');
        if (!aboutEl || !servicesEl) return;

        let rafId = null;
        let lastY = window.scrollY || 0;
        let aboutAdvanced = false;
        let lastAdvanceTime = 0;
        const cooldown = 400; // ms

        function tick() {
            rafId = null;
            const now = Date.now();
            const currentY = window.scrollY || 0;
            const goingDown = currentY > lastY;
            lastY = currentY;

            const rect = aboutEl.getBoundingClientRect();
            const threshold = 16; // px

            // Yukarı çıkarken yeniden tetiklenebilir hale getir
            if (!goingDown && rect.top >= 0) {
                aboutAdvanced = false;
            }

            if (goingDown && !aboutAdvanced && (now - lastAdvanceTime) > cooldown) {
                const atBottom = rect.bottom <= window.innerHeight + threshold;
                if (atBottom) {
                    aboutAdvanced = true;
                    lastAdvanceTime = now;
                    smoothScrollToElement(servicesEl);
                    try { setActiveNav('services'); } catch (_) {}
                }
            }
        }

        window.addEventListener('scroll', () => {
            if (rafId) return;
            rafId = requestAnimationFrame(tick);
        }, { passive: true });
    })();

    // Hizmetler sonunda otomatik geçiş: DEVRE DIŞI
    (function enableServicesAutoAdvance() {
        const ENABLE = false;
        if (!ENABLE) return;
        const servicesEl = document.getElementById('services');
        const visionEl = document.getElementById('vision');
        if (!servicesEl || !visionEl) return;

        let rafId = null;
        let lastY = window.scrollY || 0;
        let servicesAdvanced = false;
        let lastAdvanceTime = 0;
        const cooldown = 400; // ms

        function tick() {
            rafId = null;
            const now = Date.now();
            const currentY = window.scrollY || 0;
            const goingDown = currentY > lastY;
            lastY = currentY;

            const rect = servicesEl.getBoundingClientRect();
            const threshold = 72; // px (biraz erken yakala)

            // Yukarı çıkarken yeniden tetiklenebilir hale getir
            if (!goingDown && rect.top >= 0) {
                servicesAdvanced = false;
            }

            if (goingDown && !servicesAdvanced && (now - lastAdvanceTime) > cooldown) {
                const atBottom = rect.bottom <= window.innerHeight + threshold;
                if (atBottom) {
                    servicesAdvanced = true;
                    lastAdvanceTime = now;
                    smoothScrollToElement(visionEl);
                    try { setActiveNav('vision'); } catch (_) {}
                }
            }
        }

        window.addEventListener('scroll', () => {
            if (rafId) return;
            rafId = requestAnimationFrame(tick);
        }, { passive: true });

        // Teker hareketinde erken tetikleme KAPALI: doğal scroll ve CSS scroll-snap kullanılır
        const ENABLE_WHEEL_ASSIST = false;
        if (ENABLE_WHEEL_ASSIST) {
            window.addEventListener('wheel', (ev) => {
                if (ev.deltaY <= 0) return; // sadece aşağı
                const now = Date.now();
                const rect = servicesEl.getBoundingClientRect();
                const wheelThreshold = 72; // px
                const predictedBottom = rect.bottom - ev.deltaY;
                const atBottom = rect.bottom <= window.innerHeight + wheelThreshold;
                const willCross = predictedBottom <= window.innerHeight + wheelThreshold;
                if (!servicesAdvanced && (now - lastAdvanceTime) > cooldown && (atBottom || willCross)) {
                    // preventDefault KULLANMA: doğal kaydırma korunsun
                    servicesAdvanced = true;
                    lastAdvanceTime = now;
                    smoothScrollToElement(visionEl);
                    try { setActiveNav('vision'); } catch (_) {}
                }
            }, { passive: true });
        }
    })();

    // Home sonunda otomatik geçiş: DEVRE DIŞI
    (function enableHomeAutoAdvance() {
        const ENABLE = false;
        if (!ENABLE) return;
        const homeEl = document.getElementById('home');
        const aboutEl = document.getElementById('about');
        if (!homeEl || !aboutEl) return;

        let rafId = null;
        let lastY = window.scrollY || 0;
        let homeAdvanced = false;
        let lastAdvanceTime = 0;
        const cooldown = 400; // ms

        function tick() {
            rafId = null;
            const now = Date.now();
            const currentY = window.scrollY || 0;
            const goingDown = currentY > lastY;
            lastY = currentY;

            const rect = homeEl.getBoundingClientRect();
            const threshold = 16; // px; alt sınırı biraz erken yakala

            // Yukarı çıkarken yeniden tetiklenebilir hale getir
            if (!goingDown && rect.top >= 0) {
                homeAdvanced = false;
            }

            if (goingDown && !homeAdvanced && (now - lastAdvanceTime) > cooldown) {
                const atBottom = rect.bottom <= window.innerHeight + threshold;
                if (atBottom) {
                    homeAdvanced = true;
                    lastAdvanceTime = now;
                    smoothScrollToElement(aboutEl);
                    try { setActiveNav('about'); } catch (_) {}
                }
            }
        }

        window.addEventListener('scroll', () => {
            if (rafId) return;
            rafId = requestAnimationFrame(tick);
        }, { passive: true });
    })();

    // About'tan Home'a otomatik dönüş: DEVRE DIŞI
    (function enableHomeAutoReturn() {
        const ENABLE = false;
        if (!ENABLE) return;
        const homeEl = document.getElementById('home');
        const aboutEl = document.getElementById('about');
        if (!homeEl || !aboutEl) return;

        let rafId = null;
        let lastY = window.scrollY || 0;
        let lastSnapTime = 0;
        const cooldown = 400; // ms

        function tick() {
            rafId = null;
            const now = Date.now();
            const currentY = window.scrollY || 0;
            const goingUp = currentY < lastY;
            lastY = currentY;

            if (!goingUp) return;

            // About bölümünün tam tepesindeyken (neredeyse 0) yukarı hamlede Home'a dön
            const aboutRect = aboutEl.getBoundingClientRect();
            const aboutThreshold = 4; // px; sadece tam tepe sınırında Home'a geç
            if (Math.abs(aboutRect.top) <= aboutThreshold && (now - lastSnapTime) > cooldown) {
                lastSnapTime = now;
                requestAnimationFrame(() => {
                    smoothScrollToElement(homeEl);
                    try { setActiveNav('home'); } catch (_) {}
                });
                return;
            }

            // Ek güvenlik: Home zaten görünür ve tepeye yakınsa hizala
            const homeRect = homeEl.getBoundingClientRect();
            const homeThreshold = 24;
            if (Math.abs(homeRect.top) <= homeThreshold && (now - lastSnapTime) > cooldown) {
                lastSnapTime = now;
                requestAnimationFrame(() => {
                    smoothScrollToElement(homeEl);
                    try { setActiveNav('home'); } catch (_) {}
                });
            }
        }

        window.addEventListener('scroll', () => {
            if (rafId) return;
            rafId = requestAnimationFrame(tick);
        }, { passive: true });

        // Sınırda yukarı teker hareketini yakalayıp anında dön: KAPALI
        const ENABLE_HOME_WHEEL_RETURN = false;
        if (ENABLE_HOME_WHEEL_RETURN) {
            window.addEventListener('wheel', (ev) => {
                if (ev.deltaY >= 0) return; // sadece yukarı
                const rect = aboutEl.getBoundingClientRect();
                if (Math.abs(rect.top) <= 2) {
                    // preventDefault kullanmadan hizala: doğal kaydırma korunur
                    smoothScrollToElement(homeEl);
                    try { setActiveNav('home'); } catch (_) {}
                }
            }, { passive: true });
        }
    })();

    // About içinde başa erken dön: DEVRE DIŞI
    (function enableAboutReturnToTop() {
        const ENABLE = false;
        if (!ENABLE) return;
        const aboutEl = document.getElementById('about');
        if (!aboutEl) return;

        let rafId = null;
        let lastY = window.scrollY || 0;
        let lastSnapTime = 0;
        const cooldown = 400; // ms

        function tick() {
            rafId = null;
            const now = Date.now();
            const currentY = window.scrollY || 0;
            const goingUp = currentY < lastY;
            lastY = currentY;

            if (!goingUp) return;

            // Yalnızca About aktifken çalışsın
            const active = document.body.dataset.activeSection;
            if (active !== 'about') return;

            const rect = aboutEl.getBoundingClientRect();
            const nearTopRange = 120; // px; tepeye yaklaşınca About başına hizala

            if (rect.top < 0 && Math.abs(rect.top) <= nearTopRange && (now - lastSnapTime) > cooldown) {
                lastSnapTime = now;
                requestAnimationFrame(() => {
                    smoothScrollToElement(aboutEl);
                    try { setActiveNav('about'); } catch (_) {}
                });
            }
        }

        window.addEventListener('scroll', () => {
            if (rafId) return;
            rafId = requestAnimationFrame(tick);
        }, { passive: true });
    })();

    // Viewport bazlı aktif bölüm takibi: doğal kaydırmada da logoyu doğru yönet
    (function enableActiveTracking() {
        // Varsayılan takip açık kalsın; IntersectionObserver ile güçlendireceğiz
        const order = ['home', 'about', 'services', 'vision', 'blog', 'contact'];
        let rafId = null;
        let lastId = null;

        function currentId() {
            const mid = window.innerHeight * 0.5;
            for (const id of order) {
                const el = document.getElementById(id);
                if (!el) continue;
                const rect = el.getBoundingClientRect();
                if (rect.top <= mid && rect.bottom >= mid) return id;
            }
            return null;
        }

        function update() {
            rafId = null;
            // İlk yükleme yerleşene kadar aktifliği otomatik değiştirme
            if (!initialSettled) return;
            // Tepeye çok yaklaştıysak Home'u güvenceye al
            const y = window.scrollY || 0;
            if (y <= 5) {
                try { activateNav('home', 'scroll'); } catch (_) {}
                lastId = 'home';
                return;
            }
            const id = currentId();
            if (id && id !== lastId) {
                try { activateNav(id, 'scroll'); } catch (_) {}
                lastId = id;
            }
        }

        window.addEventListener('scroll', () => {
            if (rafId) return;
            rafId = requestAnimationFrame(update);
        }, { passive: true });

        // İlk durum: yükleme tamamlandıktan sonra çalıştırılacak
    })();

    // IntersectionObserver ile güvenilir aktif bölüm takibi ve hizalama
    (function enableIntersectionActiveTracking() {
        const ENABLE = false;
        if (!ENABLE) return;
        const order = ['home', 'about', 'services', 'vision', 'blog', 'contact'];
        const sections = order.map(id => document.getElementById(id)).filter(Boolean);
        if (!sections.length) return;

        let activeId = null;

        const observer = new IntersectionObserver((entries) => {
            // En yüksek görünürlük oranına sahip bölümü seç
            let best = { id: null, ratio: 0 };
            for (const e of entries) {
                const id = e.target.id;
                const ratio = e.intersectionRatio || 0;
                if (ratio > best.ratio) best = { id, ratio };
            }
            if (best.id && best.id !== activeId) {
                activeId = best.id;
                try { activateNav(activeId, 'scroll'); } catch (_) {}
            }
        }, { threshold: [0.55, 0.7, 0.85, 1] });

        sections.forEach(s => observer.observe(s));

        // İlk durumda görünür bölümü belirle ve aktif et
        const initial = sections.find(s => {
            const r = s.getBoundingClientRect();
            const mid = window.innerHeight * 0.5;
            return r.top <= mid && r.bottom >= mid;
        }) || sections[0];
        if (initial) {
            try { activateNav(initial.id, 'init'); } catch (_) {}
        }
    })();

    // Scroll bitişinde üst başa hizalama: tek seferlik, doğal hissi korur
    (function enableScrollEndAlign() {
        const ENABLE = false;
        if (!ENABLE) return;
        const order = ['home', 'about', 'services', 'vision', 'blog', 'contact'];
        const NON_UPWARD_SECTIONS = new Set(['home','about','services','vision','blog']); // sloganlı/resimli sayfalar
        let timer = null;
        let aligning = false;
        let lastScrollY = window.scrollY || 0;
        let lastMoveAt = Date.now();
        let direction = null; // 'down' | 'up'
        const idleDelay = 450; // ms: tekerlek durduktan sonra bekleme (daha sakin)
        const topThreshold = 80; // px: tepeye oldukça yakınsa hizalama yapma
        const minMove = 140; // px: son hizalamadan beri yeterli hareket olmalı

        function currentIndex() {
            const mid = window.innerHeight * 0.5;
            return order.findIndex(id => {
                const el = document.getElementById(id);
                if (!el) return false;
                const rect = el.getBoundingClientRect();
                return rect.top <= mid && rect.bottom >= mid;
            });
        }

        function alignIfIdle() {
            timer = null;
            if (aligning) return;
            const now = Date.now();
            const movedEnough = Math.abs((window.scrollY || 0) - lastScrollY) >= minMove;
            if (!movedEnough) return; // mikroskobik hareketlerde hizalama yok

            const idx = currentIndex();
            if (idx === -1) return;

            let targetIdx = idx;
            if (direction === 'down' && idx < order.length - 1) {
                targetIdx = idx + 1;
            } else if (direction === 'up' && idx > 0) {
                // Sloganlı/resimli sayfalarda yukarı yön otomatik hizalamayı kapat
                const currentId = order[idx];
                if (NON_UPWARD_SECTIONS.has(currentId)) return;
                targetIdx = idx - 1;
            } else {
                return;
            }

            const id = order[targetIdx];
            const el = document.getElementById(id);
            if (!el) return;

            // Histerezis: hedef bölüm zaten görünür ise hizalama yapma
            const rect = el.getBoundingClientRect();
            const visibleMid = rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5;
            if (visibleMid && Math.abs(rect.top) <= topThreshold) return;

            aligning = true;
            smoothScrollToElement(el);
            try { setActiveNav(id); } catch (_) {}
            setTimeout(() => { aligning = false; }, 650);
        }

        function schedule() {
            if (timer) clearTimeout(timer);
            timer = setTimeout(alignIfIdle, idleDelay);
        }

        window.addEventListener('wheel', (e) => {
            direction = (e.deltaY || 0) > 0 ? 'down' : 'up';
            lastMoveAt = Date.now();
            lastScrollY = window.scrollY || 0;
            schedule();
        }, { passive: true });
        window.addEventListener('scroll', () => {
            lastMoveAt = Date.now();
            lastScrollY = window.scrollY || 0;
            schedule();
        }, { passive: true });
    })();

    // Panel scroll sırasında bir sonraki hero görselini preload et (iletişim hariç)
    (function enableHeroPreloadOnPanelScroll() {
        const order = ['home','about','services','vision','blog'];
        const preloaded = new Set();
        for (const id of order) {
            const panelRoot = document.querySelector(`#${id} .text-panel`);
            if (!panelRoot) continue;
            const nextIdx = order.indexOf(id) + 1;
            const nextId = nextIdx < order.length ? order[nextIdx] : null;
            if (!nextId) continue;
            const nextHero = document.querySelector(`#${nextId} .hero-image`);
            if (!nextHero) continue;

            const key = `${id}->${nextId}`;
            const obs = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    if (__dir !== 'down') continue;
                    if (preloaded.has(key)) continue;
                    // preload
                    const tmp = new Image();
                    tmp.decoding = 'async';
                    tmp.src = nextHero.src;
                    preloaded.add(key);
                }
            }, { root: null, threshold: 0, rootMargin: '70% 0% 0% 0%' });
            obs.observe(panelRoot);
        }
    })();

    // Keyboard navigation (viewport-based)
    document.addEventListener('keydown', function(e) {
        const order = ['home', 'about', 'services', 'vision', 'blog', 'contact'];
        const currentIndex = order.findIndex(id => {
            const el = document.getElementById(id);
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            return rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5;
        });
        if (e.key === 'ArrowRight' && currentIndex !== -1 && currentIndex < order.length - 1) {
            const nextId = order[currentIndex + 1];
            smoothScrollToElement(document.getElementById(nextId));
            try { setActiveNav(nextId); } catch (_) {}
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            const prevId = order[currentIndex - 1];
            smoothScrollToElement(document.getElementById(prevId));
            try { setActiveNav(prevId); } catch (_) {}
        }
    });
    
    // Yükleme fade'ini kaldır: doğrudan başlangıç durumunu yerleştir
    (function initWithoutLoadFade() {
        try {
            // Başlangıçta Home'u güvenceye al ve sayfanın en üstüne konumlan
            const homeEl = document.getElementById('home');
            if (homeEl && typeof setActiveNav === 'function') {
                setActiveNav('home');
            }
            // Scroll pozisyonunu kesinlikle en üste al
            try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (_) { window.scrollTo(0, 0); }
            // Aktif takibi çok kısa bir gecikme sonrası devreye al
            setTimeout(() => { initialSettled = true; }, 60);
            // Eski initial-block artık kullanılmıyor; varsa kaldır
            document.body.classList.remove('initial-block');
        } catch (_) {}
    })();

    // Nav, logo ve dil butonlarını yumuşak şekilde kademeli gizle/göster
    (function enableSoftFadeUI() {
        const navContainer = document.querySelector('.nav-container');
        const logoEl = document.querySelector('.logo');
        const langEl = document.querySelector('.language-switcher');
        if (!navContainer || !logoEl || !langEl) return;

        let rafId = null;

        function computeFade() {
            rafId = null;
            // Görünürdeki bölümü doğrudan viewport orta çizgisine göre bul
            const order = ['home', 'about', 'services', 'vision', 'blog', 'contact'];
            const mid = window.innerHeight * 0.5;
            let visibleSectionId = null;
            for (const id of order) {
                const el = document.getElementById(id);
                if (!el) continue;
                const r = el.getBoundingClientRect();
                if (r.top <= mid && r.bottom >= mid) { visibleSectionId = id; break; }
            }
            const panel = visibleSectionId ? document.querySelector(`#${visibleSectionId} .text-panel`) : null;

            // Home ve Contact’ta her zaman görünür.
            if (!panel || visibleSectionId === 'home' || visibleSectionId === 'contact') {
                if (logoEl) { logoEl.style.opacity = '1'; logoEl.style.pointerEvents = 'auto'; }
                if (langEl) { langEl.style.opacity = '1'; langEl.style.pointerEvents = 'auto'; }
                // Nav her zaman görünür kalsın
                document.body.style.setProperty('--ui-opacity', '1');
                document.body.classList.remove('tips-active');
                return;
            }

            const rect = panel.getBoundingClientRect();
            const vh = window.innerHeight;
            // Panel üst kenarı viewport içine girdiğinde, üst UI’yi tamamen gizle
            const panelEntering = rect.top < (vh * 0.95) && rect.bottom > 0;
            if (logoEl) { logoEl.style.opacity = panelEntering ? '0' : '1'; logoEl.style.pointerEvents = panelEntering ? 'none' : 'auto'; }
            if (langEl) { langEl.style.opacity = panelEntering ? '0' : '1'; langEl.style.pointerEvents = panelEntering ? 'none' : 'auto'; }
            // Nav opacity’sini değiştirme: sabit kalsın
            document.body.style.setProperty('--ui-opacity', '1');
            document.body.classList.remove('tips-active');
        }

        window.addEventListener('scroll', () => {
            if (!rafId) rafId = requestAnimationFrame(computeFade);
        }, { passive: true });
        window.addEventListener('resize', () => {
            if (!rafId) rafId = requestAnimationFrame(computeFade);
        });
        computeFade();

        // Aktif bölüm değişikliklerinde fade hesaplamasını tetikle
        const observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.attributeName === 'data-active-section') {
                    if (!rafId) rafId = requestAnimationFrame(computeFade);
                    break;
                }
            }
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['data-active-section'] });
    })();

    // Alt sayfa üst/alt enine çizgiye mini logo yerleştir
    (function injectMiniLogos() {
        const order = ['home', 'about', 'services', 'vision', 'blog', 'contact'];
        for (const id of order) {
            const panelRoot = document.querySelector(`#${id} .text-panel`);
            if (!panelRoot) continue;
            // İçerik konteyneri varsa içine yerleştir; yoksa panel kökünü kullan
            const container = panelRoot.querySelector(':scope > .content-container') || panelRoot;
            // Divider'ları panel kökünde ara: blog'un alt divider'ı container dışında
            const allDividers = panelRoot.querySelectorAll('.section-divider');
            const first = allDividers.length ? allDividers[0] : null;
            const last = allDividers.length ? allDividers[allDividers.length - 1] : null;

            // Sayfa özel slotları varsa (ör. home-mini-top, about-mini-top) onları kullan
            const topSlot = panelRoot.querySelector(`:scope > .full-bleed-center.${id}-mini-top`);
            const bottomSlot = panelRoot.querySelector(`:scope > .full-bleed-center.${id}-mini-bottom`);

            // Mevcutsa tekrar ekleme
            if (!panelRoot.querySelector('.mini-logo-top')) {
                const topLogo = document.createElement('img');
                topLogo.src = 'a-logo.png';
                topLogo.alt = 'Adastra';
                topLogo.className = 'mini-logo mini-logo-top';
                if (topSlot) {
                    topSlot.appendChild(topLogo);
                } else {
                    const topWrap = document.createElement('div');
                    topWrap.className = 'full-bleed-center';
                    topWrap.appendChild(topLogo);
                    // Dil bloklarından bağımsız çalışması için panel köküne yerleştir
                    panelRoot.insertBefore(topWrap, panelRoot.firstChild);
                }
            }

            if (!panelRoot.querySelector('.mini-logo-bottom')) {
                const bottomLogo = document.createElement('img');
                bottomLogo.src = 'a-logo.png';
                bottomLogo.alt = 'Adastra';
                bottomLogo.className = 'mini-logo mini-logo-bottom';
                if (bottomSlot) {
                    bottomSlot.appendChild(bottomLogo);
                } else {
                    const bottomWrap = document.createElement('div');
                    bottomWrap.className = 'full-bleed-center';
                    bottomWrap.appendChild(bottomLogo);
                    // Daha erken görünmesi için panel içindeki divider'ların ortasına yakın yerleştir
                    if (allDividers && allDividers.length >= 2) {
                        const mid = allDividers[Math.floor(allDividers.length / 2)];
                        mid.parentNode.insertBefore(bottomWrap, mid.nextSibling);
                    } else if (last) {
                        last.parentNode.insertBefore(bottomWrap, last.nextSibling);
                    } else if (first) {
                        first.parentNode.insertBefore(bottomWrap, first.nextSibling);
                    } else {
                        // Bölücü yoksa panelin sonuna değil, çocukların ~%70'inden sonra yerleştir
                        const children = panelRoot.children;
                        const idx = Math.max(0, Math.floor(children.length * 0.7));
                        const ref = children[idx];
                        if (ref) {
                            panelRoot.insertBefore(bottomWrap, ref);
                        } else {
                            panelRoot.appendChild(bottomWrap);
                        }
                    }
                }
            }
        }
    })();

    // Scroll yönünü takip et (mini logo ve divider tetikleri için)
    let __lastY = window.scrollY;
    let __dir = 'down';
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        __dir = y > __lastY ? 'down' : (y < __lastY ? 'up' : __dir);
        __lastY = y;
    }, { passive: true });

    // Yukarı yönde metin panellerini gizle, sadece hero görsellerini göster
    (function enableUpwardOnlyHeroes() {
        let rafId = null;
        function applyMode() {
            rafId = null;
            const suppressed = suppressUpwardModeUntil && (Date.now() < suppressUpwardModeUntil);
            const modeUp = (__dir === 'up') && !suppressed;
            if (suppressed) {
                document.body.classList.remove('upward-mode');
            } else {
                document.body.classList.toggle('upward-mode', modeUp);
            }
        }
        window.addEventListener('scroll', () => {
            if (rafId) return;
            rafId = requestAnimationFrame(applyMode);
        }, { passive: true });
        // İlk durumda aşağı kabul et
        applyMode();
    })();

    // Alt çizgi görünür olduğunda bir alt sayfanın başına otomatik geçiş
    (function enableBottomDividerAdvance() {
        const ENABLE = false;
        if (!ENABLE) return;
        const order = ['home', 'about', 'services', 'vision', 'blog', 'contact'];
        const triggered = new Set();
        const observers = [];

        function nextOf(id) {
            const idx = order.indexOf(id);
            if (idx === -1 || idx >= order.length - 1) return null;
            return order[idx + 1];
        }

        for (const id of order) {
            if (id === 'contact') continue; // iletişimde otomatik geçiş yok
            const panelRoot = document.querySelector(`#${id} .text-panel`);
            if (!panelRoot) continue;
            // Divider'ları panel kökünde ara (container dışı olanlar için)
            const dividers = panelRoot.querySelectorAll('.section-divider');
            if (!dividers.length) continue;
            const last = dividers[dividers.length - 1];

            const obs = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting && __dir === 'down') {
                        const nid = nextOf(id);
                        if (!nid) return;
                        if (triggered.has(id)) return;
                        triggered.add(id);
                        const el = document.getElementById(nid);
                        if (!el) return;
                        // Daha yumuşak geçiş
                        smoothScrollToElement(el);
                        try { setActiveNav(nid); } catch (_) {}
                    } else if (!entry.isIntersecting) {
                        // Görünürlükten çıktığında yeniden tetiklenebilir olsun
                        triggered.delete(id);
                    }
                }
            }, { root: null, threshold: 0.15 });

            obs.observe(last);
            observers.push(obs);
        }
    })();

    // Mini logo görünürlüğüne bağlı yönlü otomatik geçiş (üst: önceki, alt: sonraki)
    (function enableMiniLogoAdvance() {
        const ENABLE = true;
        if (!ENABLE) return;
        const order = ['home', 'about', 'services', 'vision', 'blog', 'contact'];
        const observers = [];
        const triggered = new Set();

        function prevOf(id) {
            const idx = order.indexOf(id);
            if (idx <= 0) return null;
            return order[idx - 1];
        }
        function nextOf(id) {
            const idx = order.indexOf(id);
            if (idx === -1 || idx >= order.length - 1) return null;
            return order[idx + 1];
        }

        for (const id of order) {
            const panelRoot = document.querySelector(`#${id} .text-panel`);
            if (!panelRoot) continue;
            const topLogo = panelRoot.querySelector('.mini-logo-top');
            const bottomLogo = panelRoot.querySelector('.mini-logo-bottom');
            const preloadedByBottomEdge = new Set();

            // Üst logo için özel gözlemci: yukarı yönde görünür olur olmaz önceki hero'yu aktif et
            if (topLogo) {
                const obsTop = new IntersectionObserver((entries) => {
                    for (const entry of entries) {
                        const pid = prevOf(id);
                        const prevSection = pid ? document.getElementById(pid) : null;
                        if (!entry.isIntersecting) {
                            triggered.delete(`${id}:top`);
                            if (prevSection) prevSection.classList.remove('hero-preview');
                            continue;
                        }
                        if (__dir !== 'up') continue;
                        if (!pid || !prevSection) continue;
                        const key = `${id}:top`;
                        if (triggered.has(key)) continue;

                        // Önceki bölümün görselini yarı opak önizleme olarak göster
                        const prevHeroImg = prevSection.querySelector('.hero-fill img.hero-image');
                        if (prevHeroImg) {
                            const tmp = new Image();
                            tmp.decoding = 'async';
                            tmp.src = prevHeroImg.src;
                        }
                        // Preview efekti kapalı: yalnızca görsel preload edilir

                        // Ekrana girer girmez önceki bölümün hero'sunu aktif et (kaydırma yok)
                        try { startBlackFade(0.35, 600); } catch (_) {}
                        triggered.add(key);
                        try { activateNav(pid, 'mini'); } catch (_) {}
                        // Aktivasyon sonrasında preview gereksiz olacağından kaldırmayı deneyin
                        // Preview eklenmedi; kaldırma gereksiz
                    }
                }, { root: null, threshold: 0, rootMargin: '0% 0% 40% 0%' });
                observers.push(obsTop);
                obsTop.observe(topLogo);

                // Aşağı yönde: üst mini logo ekranın tamamen dışına çıktığında (yukarı)
                // ilgili bölümün hero’sunu efektsiz aç
                const obsTopDown = new IntersectionObserver((entries) => {
                    for (const entry of entries) {
                        const key = `${id}:top-down`;
                        const bottom = entry.boundingClientRect.bottom;
                        // Logo görünürken tetikleme yapılmaz; görünürlükten çıkınca kontrol et
                        if (entry.isIntersecting) { triggered.delete(key); continue; }
                        if (__dir !== 'down') { triggered.delete(key); continue; }
                        if (triggered.has(key)) continue;
                        // Tamamen ekranın üstünde: bottom <= 0
                        if (bottom <= 0) {
                            triggered.add(key);
                            const sec = document.getElementById(id);
                            if (sec) {
                                sec.classList.add('hero-no-effect');
                                try { activateNav(id, 'mini'); } catch (_) {}
                                setTimeout(() => { sec.classList.remove('hero-no-effect'); }, 300);
                            }
                        }
                    }
                }, { root: null, threshold: 0 });
                observers.push(obsTopDown);
                obsTopDown.observe(topLogo);

                // Aşağı yönde: üst mini logo üstten çıksa bile otomatik ileri aktivasyon kaldırıldı
            }

            // Alt mini-logo yaklaşırken: bir SONRAKİ bölüm hero görselini erken preload et
            if (bottomLogo) {
                const obsBottomPreload = new IntersectionObserver((entries) => {
                    for (const entry of entries) {
                        const key = `${id}:preload-bottom-edge`;
                        const nid = nextOf(id);
                        const nextSection = nid ? document.getElementById(nid) : null;
                        if (!entry.isIntersecting) {
                            preloadedByBottomEdge.delete(key);
                            if (nextSection) nextSection.classList.remove('hero-preview');
                            continue;
                        }
                        if (__dir !== 'down') continue;
                        if (!nid || !nextSection) continue;
                        const nextHeroImg = nextSection.querySelector('.hero-fill img.hero-image');
                        if (nextHeroImg) {
                            // Görseli önceden yükle ve hero’yu önizleme olarak görünür yap
                            const tmp = new Image();
                            tmp.decoding = 'async';
                            tmp.src = nextHeroImg.src;
                            // Preview efekti kapalı: yalnızca görsel preload edilir
                            preloadedByBottomEdge.add(key);
                        }
                    }
                }, { root: null, threshold: 0, rootMargin: '0% 0% 120% 0%' });
                observers.push(obsBottomPreload);
                obsBottomPreload.observe(bottomLogo);
            }
        }
    })();
    
    // Hero görsellerini scroll ile kademeli koyultma
    (function enableHeroDarkenOnScroll() {
        let rafId = null;
        // Bölüm sırası: aktif ve bir sonraki bölümü kolay bulmak için
        const order = ['home','about','services','vision','blog','contact'];
        const MAX_DARK_PER_SECTION = {
            home: 0.45,
            about: 0.18,
            services: 0.20,
            vision: 0.18,
            blog: 0.16,
            contact: 0.0
        };

        function computeDarkness() {
            rafId = null;
            const active = document.body.dataset.activeSection;
            if (!active) return;

            const section = document.getElementById(active);
            if (!section) return;
            const hero = section.querySelector('.hero-fill');
            const panel = section.querySelector('.text-panel');
            if (!hero || !panel) return;

            // İlk yüklemede scroll başlamadan kararma olmasın
            const scrollTop = (window.scrollY || window.pageYOffset || 0);
            if (scrollTop < 5) {
                hero.style.setProperty('--hero-darkness', '0');
                return;
            }

            const rect = panel.getBoundingClientRect();
            const vh = window.innerHeight;
            // Panel görünmeye başladığında kararma başlasın; metne yaklaştıkça artan koyuluk
            const start = vh * 1.0; // kararma daha da geç başlasın (panel neredeyse görünürken)
            const end = vh * 0.45;   // maksimum koyuluk için eşik biraz yukarıda

            let t = 1; // 1 → hiç koyu değil
            if (rect.top < start && rect.bottom > 0) {
                t = Math.min(Math.max((rect.top - end) / (start - end), 0), 1);
            } else {
                t = 1;
            }

            const maxDark = MAX_DARK_PER_SECTION[active] ?? 0.18; // bölüm bazlı kararma üst sınırı
            const darkness = (1 - t) * maxDark;
            hero.style.setProperty('--hero-darkness', darkness.toFixed(3));

            // Aşağı geçişlerde ton farkını kaldırmak için: bir sonraki bölüm önizlemesi varsa
            // onun karanlığını aktif bölümün karanlığıyla senkronize et.
            const idx = order.indexOf(active);
            if (idx !== -1 && idx < order.length - 1) {
                const nextId = order[idx + 1];
                const nextSection = document.getElementById(nextId);
                if (nextSection && nextSection.classList.contains('hero-preview')) {
                    const nextHero = nextSection.querySelector('.hero-fill');
                    if (nextHero) {
                        nextHero.style.setProperty('--hero-darkness', darkness.toFixed(3));
                    }
                }
            }
        }

        window.addEventListener('scroll', () => {
            if (!rafId) rafId = requestAnimationFrame(computeDarkness);
        }, { passive: true });
        window.addEventListener('resize', () => {
            if (!rafId) rafId = requestAnimationFrame(computeDarkness);
        });
        // İlk durum
        computeDarkness();
    })();

    // Yaklaşan bölümün hero parlaklığını mini-logo üst konumuna göre kontrol et
    (function enableUpcomingHeroBrightnessControl() {
        const order = ['home','about','services','vision','blog','contact'];
        let rafId = null;
        const preloadedOnTop = new Set();
        const activatedOnTop = new Set();
        function tick() {
            rafId = null;
            const active = document.body.dataset.activeSection;
            if (!active) return;
            const idx = order.indexOf(active);
            if (idx === -1 || idx >= order.length - 1) return;
            const nextId = order[idx + 1];
            const nextSection = document.getElementById(nextId);
            if (!nextSection) return;
            const heroNext = nextSection.querySelector('.hero-fill');
            const nextHeroImg = nextSection.querySelector('.hero-fill img.hero-image');
            const topLogo = nextSection.querySelector('.mini-logo-top');
            if (!heroNext || !topLogo) return;
            const top = topLogo.getBoundingClientRect().top;
            const vh = window.innerHeight;
            const triggerTop = vh * 0.5; // ekranın yarısı: daha erken aktivasyon
            // Üst mini logo ekran başına gelene kadar (top > 0) bir sonraki hero tam parlak
            if (top > triggerTop) {
                heroNext.style.setProperty('--hero-darkness', '0');
                // Üst sınırdan ayrıldığında yeniden aktive edilebilir olması için işareti kaldır
                activatedOnTop.delete(nextId);
            } else {
                // Kontrolü kaldır: bölüm aktif olduğunda kendi kararma mantığı devreye girsin
                heroNext.style.removeProperty('--hero-darkness');
                // Üst mini logo üst sınıra ulaştığında hero görselini preload et
                if (nextHeroImg && !preloadedOnTop.has(nextId)) {
                    const tmp = new Image();
                    tmp.decoding = 'async';
                    tmp.src = nextHeroImg.src;
                    preloadedOnTop.add(nextId);
                }
                // Aktivasyonu aşağı yönde öne çekmeyelim; yalnızca preload yap
            }
        }
        window.addEventListener('scroll', () => {
            if (!rafId) rafId = requestAnimationFrame(tick);
        }, { passive: true });
        window.addEventListener('resize', () => {
            if (!rafId) rafId = requestAnimationFrame(tick);
        });
        tick();
    })();
});
