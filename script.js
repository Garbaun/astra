// Navigation System

// Tarayıcının önceki konumu ve hash’e göre otomatik kaydırmasını devre dışı bırak (Global Scope - Hemen Çalışmalı)
try {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    // Sayfa yüklendiği an en başa (Home) zorla
    window.scrollTo(0, 0);

    if (window.location.hash) {
        // Başlangıçta yanlış sayfaya (ör. #blog) atlamayı önlemek için hash’i temizle
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
} catch (_) {}

// Sayfa tamamen yüklendiğinde tekrar en başa al (Garanti çözüm)
window.addEventListener('load', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 10);
});

document.addEventListener('DOMContentLoaded', function() {
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

    const navLinks = document.querySelectorAll('.nav-link');
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
    
    // Başlangıç: nav sağda dikey sabit hizalı
    stackNavRight();
    
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
                blog: 'THE PULSE\nOF\nTHE DIGITAL',
                contact: 'TIME\nIS\nVALUABLE'
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
                { title: 'Content Marketing 2.0: Generative AI and the Art of Storytelling.', excerpt: 'Generative AI transforms content creation. Build effective, personalized and scalable content without losing the human touch.', img: 'blog/7.png', alt: 'Content Marketing 2.0', tags: ['strategy','design'], content: 'Generative AI accelerates ideation and production. Keep humans in the loop for strategy, voice, and ethics.\n\nCombine templates with original thinking and real expertise to build content that is useful, distinctive, and trustworthy.' },
                { title: 'Adaptive Content Systems: Building Consistency at Scale.', excerpt: 'Scale content without losing brand tone. Build modular systems and governance that keep teams aligned.', img: 'blog/8.png', alt: 'Adaptive Content Systems', tags: ['strategy','design'], content: 'Adaptive content needs systems. Build modular blocks, clear voice guidelines, and reusable patterns so teams move fast without drifting.\n\nDefine governance, QA checkpoints, and a living style guide. Consistency is not rigidity; it is a shared language.' },
                { title: 'Human-Centered Analytics: Turning Metrics into Meaning.', excerpt: 'Move beyond dashboards. Translate data into decisions with a human-centered analytics lens.', img: 'blog/9.png', alt: 'Human-Centered Analytics', tags: ['data','strategy'], content: 'Human-centered analytics starts with questions, not dashboards. Translate metrics into stories that clarify decisions and highlight real user impact.\n\nPair qualitative signals with quantitative trends, then prioritize actions that reduce friction and amplify value.' }
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
                home: 'Ana Sayfa',
                about: 'Hakkımızda',
                services: 'Hizmetler',
                vision: 'Vizyonumuz',
                blog: 'Blog',
                contact: 'İletişim'
            },
            slogan: 'GELECEĞE\nAÇILAN\nDİJİTAL EVREN',
            slogans: {
                about: 'SANATI,\nSTRATEJİYİ VE\nTEKNOLOJİYİ KODLUYORUZ',
                services: 'MARKANIZ İÇİN\nGELECEĞİN DİJİTAL\nKANVASI',
                vision: 'YARINI\nTASARLAYAN\nPERSPEKTİF',
                blog: 'DİJİTAL DÜNYANIN\nNABZI',
                contact: 'ZAMAN\nDEĞERLİDİR'
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
                { title: 'İçerik Pazarlaması 2.0: Yaratıcı Yapay Zeka ve Hikaye Anlatımı.', excerpt: 'Yaratıcı yapay zekâ içerik üretimini dönüştürüyor. İnsan dokunuşunu koruyarak etkili, kişiselleştirilmiş ve ölçeklenebilir içerikler üretin.', img: 'blog/7.png', alt: 'İçerik Pazarlaması 2.0', tags: ['strategy','design'], content: 'Yaratıcı YZ; fikir üretimi ve üretimi hızlandırır. Strateji, üslup ve etik için insanı döngüde tutun.\n\nŞablonları özgün düşünce ve gerçek uzmanlıkla birleştirerek faydalı, ayırt edici ve güvenilir içerikler üretin.' },
                { title: 'Uyarlanabilir İçerik Sistemleri: Ölçekte Tutarlılık.', excerpt: 'Marka tonunu koruyarak içerik üretimini ölçekleyin. Modüler yapı ve yönetişimle ekipleri hizalayın.', img: 'blog/8.png', alt: 'Uyarlanabilir İçerik Sistemleri', tags: ['strategy','design'], content: 'Uyarlanabilir içerik; modüler bloklar, net ses rehberi ve yeniden kullanılabilir desenlerle ölçeklenir. Böylece ekipler hızlanır ama marka tonu dağılmaz.\n\nYönetişim, kalite kontrol ve yaşayan bir stil rehberi kurun. Tutarlılık katılık değil, ortak dildir.' },
                { title: 'İnsan Odaklı Analitik: Metrikleri Anlama Dönüştürmek.', excerpt: 'Gösterge panellerinin ötesine geçin. Veriyi, kararları netleştiren içgörülere dönüştürün.', img: 'blog/9.png', alt: 'İnsan Odaklı Analitik', tags: ['data','strategy'], content: 'İnsan odaklı analitik, önce soruyla başlar. Metrikleri, kararları netleştiren hikâyelere dönüştürerek gerçek etkiyi görünür kılar.\n\nNitel içgörüyü nicel trendlerle eşleştirip sürtünmeyi azaltan aksiyonlara öncelik verin.' }
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
                contact: 'تواصل معنا'
            },
            slogan: 'الطريق للوصول\nإلى النجوم',
            slogans: {
                about: 'نحن نبرمج\nالفن',
                services: 'لوحات\nالمستقبل',
                vision: 'منظور\nالغد',
                blog: 'نبض\nالرقمية',
                contact: 'الوقت\nثمين'
            },
            blogTags: {
                all: 'الكل',
                strategy: 'استراتيجية',
                design: 'تصميم',
                data: 'بيانات'
            },
            blogReadMore: 'اقرأ المزيد',
            blogPosts: [
                { title: 'عصر محركات البحث بالذكاء الاصطناعي: مكان علامتك التجارية في الخوارزمية.', excerpt: 'تعيد Google SGE ومحركات البحث الأخرى المدعومة بالذكاء الاصطناعي تعريف البحث. تعرف على كيفية تميز علامتك التجارية لتصبح مرئية في عمق الخوارزميات.', img: 'blog/1.png', alt: 'AI Search Era', tags: ['strategy','data'], content: 'يغير البحث المدعوم بالذكاء الاصطناعي الاكتشاف. للتميز، تحتاج العلامات التجارية إلى صلة دلالية، وبيانات منظمة، ومحتوى موثوق يصوغ النية—وليس مجرد كلمات رئيسية.\n\nاستثمر في المخطط (schema)، وإشارات E-E-A-T، والصفحات السريعة التي يمكن الوصول إليها. تعامل مع الخوارزمية كجمهور ديناميكي: قس، وتكيف، وحسن الرسم البياني للمحتوى الخاص بك باستمرار.' },
                { title: 'الوجه المستقبلي للعلامة التجارية: تطور الهوية الرقمية.', excerpt: 'العلامة التجارية هي أكثر من مجرد شعار وشعار نصي. استكشف تطور الهوية الرقمية من الواقع الافتراضي إلى الذكاء الاصطناعي لتشكيل شخصية علامتك التجارية المستقبلية.', img: 'blog/2.png', alt: 'Futuristic Branding', tags: ['strategy','design'], content: 'تعيش الهوية الرقمية الآن عبر الشاشات، والعوالم، والسياقات. الاتساق يعني تصميم أنظمة—رموز، حركة، نبرة—تتوسع عبر الحقائق.\n\nالعلامات التجارية التي تتبنى الهوية المتكيفة تظل ذات مصداقية مع تحول التكنولوجيا، وتلتقي بالناس بإشارات مألوفة أينما كانوا.' },
                { title: 'فن البيانات: إلهام من تحليلات التسويق.', excerpt: 'البيانات الضخمة تغذي التسويق. اكتشف كيف نحول البيانات الخام إلى استراتيجيات ذات مغزى وقصص مقنعة—البيانات كشكل فني.', img: 'blog/3.png', alt: 'Data as Art', tags: ['data','strategy'], content: 'تصبح البيانات بصيرة عندما توضع في إطار هادف. اطرح أسئلة أفضل، وقلل الضوضاء، وتصور العلاقات للكشف عما يهم.\n\nمن الإسناد إلى تحليل المجموعات، الهدف واحد: جعل القرارات أوضح وأسرع للفرق والعملاء.' },
                { title: 'SEO المستدام: البقاء مرناً ضد تحولات الخوارزمية.', excerpt: 'تتغير خوارزميات SEO باستمرار. أمّن تصنيفاتك باستراتيجيات مرنة وتنبأ باتجاهات SEO المستقبلية.', img: 'blog/4.png', alt: 'Sustainable SEO', tags: ['strategy','data'], content: 'تكافئ تغييرات الخوارزمية المواقع التي تخدم المستخدمين بشكل جيد. ركز على جودة المحتوى، والعمق الموضوعي، والنظافة التقنية مثل Core Web Vitals.\n\nابنِ حركة مرور مرنة بمراكز دائمة الخضرة، وروابط داخلية، وتحسينات تحريرية مستمرة بدلاً من الحيل لمرة واحدة.' },
                { title: 'التسويق الجزئي والتجزئة الفائقة: تجربة رقمية مخصصة لكل عميل.', excerpt: 'انتهى عصر الحملات العامة. صمم رحلات مخصصة مع التسويق الجزئي المدعوم بالذكاء الاصطناعي لزيادة التحويلات.', img: 'blog/5.png', alt: 'Micromarketing', tags: ['strategy','data'], content: 'يطابق التسويق الجزئي اللحظات بالرسائل. ببيانات مصرح بها وذكاء اصطناعي، خصص العروض، والتوقيت، والإبداع لكل شريحة.\n\nاحترم الخصوصية، وأضف قيمة، وقس الارتفاع. عندما يبدو التخصيص مفيداً، يتبع التحويل بشكل طبيعي.' },
                { title: 'مستقبل التفاعل الرقمي: الميتافيرس والعلامات التجارية.', excerpt: 'يفتح الميتافيرس حدوداً جديدة. أنشئ تجارب للعلامة التجارية، وصمم منتجات رقمية واشترك مع مستهلكي الجيل القادم.', img: 'blog/6.png', alt: 'Metaverse and Brands', tags: ['strategy','design'], content: 'تتطلب الوسائط الجديدة سلوكيات جديدة. في المساحات الغامرة، صمم للحضور، والمجتمع، والإبداع المشترك بدلاً من الاستهلاك السلبي.\n\nالعلامات التجارية التي تجرب بمسؤولية ستتعلم أسرع وتكسب الثقة مع نضوج النظام البيئي.' },
                { title: 'تسويق المحتوى 2.0: الذكاء الاصطناعي التوليدي وفن سرد القصص.', excerpt: 'يحول الذكاء الاصطناعي التوليدي إنشاء المحتوى. ابنِ محتوى فعالاً، ومخصصاً وقابلاً للتوسع دون فقدان اللمسة البشرية.', img: 'blog/7.png', alt: 'Content Marketing 2.0', tags: ['strategy','design'], content: 'يسرع الذكاء الاصطناعي التوليدي التفكير والإنتاج. أبقِ البشر في الحلقة للاستراتيجية، والصوت، والأخلاق.\n\nاجمع بين القوالب والتفكير الأصلي والخبرة الحقيقية لبناء محتوى مفيد، ومميز، وجدير بالثقة.' },
                { title: 'أنظمة محتوى متكيفة: اتساق على نطاق واسع.', excerpt: 'وسّع إنتاج المحتوى دون فقدان نبرة العلامة. ابنِ أنظمة معيارية وحوكمة تحفظ الاتساق.', img: 'blog/8.png', alt: 'أنظمة محتوى متكيفة', tags: ['strategy','design'], content: 'تحتاج الأنظمة المتكيفة إلى وحدات محتوى قابلة لإعادة الاستخدام وإرشادات صوت واضحة حتى يعمل الفريق بسرعة دون فقدان النبرة.\n\nضع حوكمة ونقاط تدقيق جودة ودليلا أسلوبيا متجددا. الاتساق ليس جمودا بل لغة مشتركة.' },
                { title: 'تحليلات متمحورة حول الإنسان: تحويل المقاييس إلى معنى.', excerpt: 'تجاوز لوحات البيانات. حوّل الأرقام إلى قرارات واضحة من منظور إنساني.', img: 'blog/9.png', alt: 'تحليلات متمحورة حول الإنسان', tags: ['data','strategy'], content: 'التحليلات المتمحورة حول الإنسان تبدأ بالأسئلة لا باللوحات. حوّل الأرقام إلى قصص توضّح القرار وتكشف الأثر الحقيقي.\n\nادمج الإشارات النوعية مع الاتجاهات الكمية ثم ركز على الإجراءات التي تقلل الاحتكاك وتزيد القيمة.' }
            ],
            visionContent: null, // Static HTML used for AR
            tips: {
                label: 'نصيحة',
                tip1: {
                    heading: 'ركز على المستقبل',
                    items: [
                        'نصيحة 1: كل تحد يخفي فرصة. التحول الرقمي ليس مجرد عملية، بل بداية جديدة لعلامتك التجارية.',
                        'نصيحة 2: فكر بشكل كبير، وابدأ صغيراً. حتى المشاريع الأكثر طموحاً تبدأ بالخطوة الأولى.',
                        'نصيحة 3: لا تخف من ارتكاب الأخطاء؛ الرقمية هي فن التعلم المستمر والتكيف.'
                    ]
                },
                tip2: {
                    heading: 'تحدث بالبيانات، وتفاعل بالفن',
                    items: [
                        'نصيحة 1: لا تعرف جمهورك فقط، بل افهمهم. تحليلات البيانات هي خريطة رحلتهم الرقمية.',
                        'نصيحة 2: لا تلتزم بمنصة واحدة. اسرد قصة علامتك التجارية عبر القنوات الرقمية الأنسب بنهج شامل.',
                        'نصيحة 3: المحتوى هو الملك، لكن التفاعل هو الملكة. أنشئ محتوى قيماً، لكن لا تنس الحفاظ على حوار مستمر مع جمهورك.',
                        'نصيحة 4: اجعل اختبار A/B عادة. التسويق الرقمي هو عملية تجريب وتعلم مستمر.'
                    ]
                },
                tip3: {
                    heading: 'قل المزيد بأقل',
                    items: [
                        'نصيحة 1: انظر للبساطة كمصدر للقوة. التصميم الخالي من العناصر غير الضرورية يوصل الرسالة بوضوح أكبر.',
                        'نصيحة 2: المساحة البيضاء هي نفس التصميم. استخدم المساحة السلبية بفعالية لإضافة عمق وتركيز لصورك.',
                        'نصيحة 3: الطباعة هي صوت العلامة التجارية. يجب أن تعكس خيارات الخطوط هوية العلامة التجارية والرسالة التي تريد إيصالها بدقة.',
                        'نصيحة 4: استخدم لوحة الألوان الخاصة بك بشكل استراتيجي. أنشئ لغة بصرية مستقبلية وملفتة للنظر باستخدام قليل ودقيق للألوان.'
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
                    <div class="blog-card-date">${formatDate(p.__dateISO)}</div>
                    <h3 class="blog-card-title">${p.title}</h3>
                    <p class="blog-card-excerpt">${p.excerpt}</p>
                    <button class="read-more-btn" type="button">${dict.blogReadMore || 'Read More'}</button>
                </div>
            </article>
        `).join('');
        // Kart odak/klik animasyonu
        gallery.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('click', () => card.classList.add('pulse'));
            card.addEventListener('animationend', () => card.classList.remove('pulse'));
        });
        // Read More: modal aç
        gallery.querySelectorAll('.read-more-btn').forEach((btn, idx) => {
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
        overlay.querySelector('.read-modal-close').setAttribute('aria-label', dict.blogClose || (lang==='tr'?'Kapat':'Close'));
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

    function setupCalendarModal() {
        const modal = document.getElementById('calendarModal');
        if (!modal) return;
        const openButtons = document.querySelectorAll('[data-calendar-open]');
        const closeButtons = modal.querySelectorAll('[data-calendar-close]');
        const close = () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('calendar-modal-open');
        };
        const open = () => {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('calendar-modal-open');
        };
        openButtons.forEach(btn => btn.addEventListener('click', open));
        closeButtons.forEach(btn => btn.addEventListener('click', close));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });
    }

    function applyLanguage(lang, restart = false) {
        const dict = i18n[lang] || i18n.en;
        // Nav metinleri
        navLinks.forEach(link => {
            const key = link.getAttribute('data-page');
            if (dict.nav[key]) link.textContent = dict.nav[key];
        });
        // Slogan metinleri: sadece data-text güncelle, animasyonu tetikleme
        const homeSlogan = document.querySelector('#home .main-slogan');
        if (homeSlogan) {
            homeSlogan.setAttribute('data-text', dict.slogan);
            // Başlangıçta sloganın görünmemesini önlemek için gerçek metni yerleştir
            homeSlogan.textContent = dict.slogan;
        }
        const sectionKeys = ['about','services','vision','blog','contact'];
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

        // About içerik görünürlüğü (TR/EN/AR)
        try {
            const aboutTr = document.querySelector('#about .about-content');
            const aboutEn = document.querySelector('#about .about-content-en');
            const aboutAr = document.querySelector('#about .about-content-ar');
            
            if (aboutTr && aboutEn && aboutAr) {
                aboutTr.classList.add('ui-hidden');
                aboutEn.classList.add('ui-hidden');
                aboutAr.classList.add('ui-hidden');
                
                if (lang === 'en') aboutEn.classList.remove('ui-hidden');
                else if (lang === 'ar') aboutAr.classList.remove('ui-hidden');
                else aboutTr.classList.remove('ui-hidden');
            } else if (aboutTr && aboutEn) {
                if (lang === 'en') {
                    aboutEn.classList.remove('ui-hidden');
                    aboutTr.classList.add('ui-hidden');
                } else {
                    aboutTr.classList.remove('ui-hidden');
                    aboutEn.classList.add('ui-hidden');
                }
            }
        } catch (_) {}

        // Vision görünürlüğü (TR/EN/AR)
        try {
            const visionTr = document.querySelector('#vision .vision-content');
            const visionAr = document.querySelector('#vision .content-container.left-aligned.vision-content-ar') || 
                             document.querySelector('.vision-content-ar');
            
            if (visionTr && visionAr) {
                if (lang === 'ar') {
                    visionTr.classList.add('ui-hidden');
                    visionAr.classList.remove('ui-hidden');
                } else {
                    visionTr.classList.remove('ui-hidden');
                    visionAr.classList.add('ui-hidden');
                }
            }
        } catch (_) {}

        // Vision metinleri: gerçek DOM yapısına uyum (text-panel içinde)
        if (Array.isArray(dict.visionContent)) {
            const blocks = document.querySelectorAll('#vision .text-panel .split-block');
            blocks.forEach((block, idx) => {
                const item = dict.visionContent[idx];
                if (!item) return;
                const copyEl = block.querySelector('.section-copy');
                if (!copyEl) return;
                const paras = (item.paragraphs || []).map(p => `<p>${p}</p>`).join('');
                copyEl.innerHTML = `<h3 class="section-heading">${item.heading}</h3>${paras}`;
            });
            const closingEl = document.querySelector('#vision .text-panel .closing-line');
            if (closingEl) {
                if (lang === 'en') {
                    closingEl.textContent = 'Ad astra, per aspera. Our determination to overcome the challenges of the future and reach the stars illuminates our every step.';
                } else {
                    closingEl.innerHTML = ['Ad astra, per aspera.', 'Geleceğin zorluklarını aşarak yıldızlara ulaşma azmimiz,', 'her adımımızı aydınlatır .'].join('<br>');
                }
            }
        }

        // Services içerik görünürlüğü (TR/EN/AR)
        try {
            const servicesTr = document.querySelector('#services .services-content');
            const servicesEn = document.querySelector('#services .services-content-en');
            const servicesAr = document.querySelector('#services .services-content-ar');
            
            if (servicesTr && servicesEn && servicesAr) {
                servicesTr.classList.add('ui-hidden');
                servicesEn.classList.add('ui-hidden');
                servicesAr.classList.add('ui-hidden');

                if (lang === 'en') servicesEn.classList.remove('ui-hidden');
                else if (lang === 'ar') servicesAr.classList.remove('ui-hidden');
                else servicesTr.classList.remove('ui-hidden');
            } else if (servicesTr && servicesEn) {
                if (lang === 'en') {
                    servicesEn.classList.remove('ui-hidden');
                    servicesTr.classList.add('ui-hidden');
                } else {
                    servicesTr.classList.remove('ui-hidden');
                    servicesEn.classList.add('ui-hidden');
                }
            }
        } catch (_) {}

        // Contact içerik görünürlüğü (TR/EN/AR)
        try {
            const contactTr = document.querySelector('.contact-container');
            const contactEn = document.querySelector('.contact-container-en');
            const contactAr = document.querySelector('.contact-container-ar');

            if (contactTr && contactEn && contactAr) {
                contactTr.classList.add('ui-hidden');
                contactEn.classList.add('ui-hidden');
                contactAr.classList.add('ui-hidden');

                if (lang === 'en') contactEn.classList.remove('ui-hidden');
                else if (lang === 'ar') contactAr.classList.remove('ui-hidden');
                else contactTr.classList.remove('ui-hidden');
            }
        } catch (_) {}

        // HTML lang ve dir özniteliğini güncelle
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
                        const cleaned = text.replace(/^(Tip|İpucu)\s*\d+:\s*/i, '');
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
    setupCalendarModal();

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
            // Çapraz geçiş: önceki bölüm hero’sunu kısa süre tut
            if (prevSection) prevSection.classList.add('hero-hold');
            // Sonra yeni bölümü aktif hale getir
            sections.forEach(s => s.classList.toggle('hero-active', s.id === id));
            // Kısa gecikme sonra önceki tutmayı kaldır
            if (prevSection) setTimeout(() => { prevSection.classList.remove('hero-hold'); }, 300);
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
    activateNav('home', 'init');
    window.scrollTo(0, 0);
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
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
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
                        suppressUpwardModeUntil = 0;
                    });
                } else {
                    suppressUpwardModeUntil = Date.now() + 600 + 80;
                    startBlackFade(0.4, 600);
                    smoothScrollToElement(targetSection);
                    setTimeout(() => { suppressUpwardModeUntil = 0; }, 700);
                }
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

        // Sayfa açıldı: nav'ı sağda yığ ve animasyonu durdur
        setTimeout(() => {
            stackNavRight();
        }, 1600);
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
            const settleOnUserInput = () => {
                if (initialSettled) return;
                initialSettled = true;
            };
            window.addEventListener('wheel', settleOnUserInput, { passive: true, once: true });
            window.addEventListener('touchstart', settleOnUserInput, { passive: true, once: true });
            window.addEventListener('pointerdown', settleOnUserInput, { passive: true, once: true });
            window.addEventListener('keydown', settleOnUserInput, { passive: true, once: true });
            let bootUnlocked = false;
            const unlockBoot = () => { bootUnlocked = true; };
            window.addEventListener('wheel', unlockBoot, { passive: true, once: true });
            window.addEventListener('touchstart', unlockBoot, { passive: true, once: true });
            window.addEventListener('pointerdown', unlockBoot, { passive: true, once: true });
            window.addEventListener('keydown', unlockBoot, { passive: true, once: true });
            const bootLockUntil = Date.now() + 1200;
            const bootLockTick = () => {
                if (bootUnlocked) return;
                if (Date.now() > bootLockUntil) return;
                if ((window.scrollY || 0) > 0) window.scrollTo(0, 0);
                requestAnimationFrame(bootLockTick);
            };
            requestAnimationFrame(bootLockTick);
            // Eski initial-block artık kullanılmıyor; varsa kaldır
            document.body.classList.remove('initial-block');
            document.documentElement.classList.add('loaded');
            document.body.classList.add('loaded');
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
            const navContainer = document.querySelector('.nav-container');
            const logoEl = document.querySelector('.logo');
            const langEl = document.querySelector('.language-switcher');
            const panel = visibleSectionId ? document.querySelector(`#${visibleSectionId} .text-panel`) : null;

            // Basitleştirilmiş mantık: panel görünür olduğunda üst sabit UI'yi gizle
            // Ana sayfanın kahraman (hero) kısmında UI görünür kalsın, contact'ta da görünür
            if (!panel || visibleSectionId === 'home' || visibleSectionId === 'contact') {
                document.body.style.setProperty('--ui-opacity', '1');
                document.body.classList.remove('tips-active');
                // UI her zaman görünür ve tıklanabilir kalsın
                return;
            }

            const rect = panel.getBoundingClientRect();
            const vh = window.innerHeight;
            // Panel üst kenarı viewport içine girdiğinde (ör. alt %95), gizle
            const panelEntering = rect.top < (vh * 0.95) && rect.bottom > 0;
            // Kademeli, hafif fade; etkileşimi kapatma
            document.body.style.setProperty('--ui-opacity', panelEntering ? '0.92' : '1');
            document.body.classList.toggle('tips-active', !!panelEntering);
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
        const ENABLE = false;
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
                        prevSection.classList.add('hero-preview');

                        // Ekrana girer girmez önceki bölümün hero'sunu aktif et (kaydırma yok)
                        try { startBlackFade(0.35, 600); } catch (_) {}
                        triggered.add(key);
                        try { activateNav(pid, 'mini'); } catch (_) {}
                        // Aktivasyon sonrasında preview gereksiz olacağından kaldırmayı deneyin
                        setTimeout(() => { prevSection.classList.remove('hero-preview'); }, 300);
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
                            nextSection.classList.add('hero-preview');
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

            const rect = panel.getBoundingClientRect();
            const vh = window.innerHeight;
            // Panel görünmeye başladığında kararma başlasın; metne yaklaştıkça artan koyuluk
            const start = vh * 0.92; // kararma daha geç başlasın
            const end = vh * 0.35;   // maksimum koyuluk eşiklerini koru

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

// --- Mobile Hamburger Menu Logic ---
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger-menu');
    const navContainer = document.querySelector('.nav-container');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (hamburger && navContainer) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            navContainer.classList.toggle('mobile-active');
            
            // Menü açıldığında scroll'u engelle
            if (navContainer.classList.contains('mobile-active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Linklere tıklanınca menüyü kapat
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navContainer.classList.remove('mobile-active');
                document.body.style.overflow = '';
            });
        });
        
        // Menü dışına tıklanınca kapat
        document.addEventListener('click', function(e) {
            if (navContainer.classList.contains('mobile-active') && 
                !navContainer.contains(e.target) && 
                !hamburger.contains(e.target)) {
                
                hamburger.classList.remove('active');
                navContainer.classList.remove('mobile-active');
                document.body.style.overflow = '';
            }
        });
    }
});
