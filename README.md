# Adastra Reklam Ajansı - Futuristic Web Experience

Tamamen karanlık temalı, fütüristik ve deneyim odaklı bir web sitesi arayüzü. Site, her sayfa geçişinde tam ekran görsel deneyimi sunar ve tüm metin/navigasyon elementleri animasyonludur.

## Özellikler

### 🎨 Tasarım Özellikleri
- **Karanlık Tema**: Siyah ve koyu gri tonları hâkim
- **Neon Mavi Aksanlar**: Uçuk neon mavi (#00d4ff) etkileşim renkleri
- **Minimalist Logo**: Sol üst köşede sabit neon mavi "Adastra" logosu
- **Tam Ekran Görsel Deneyimi**: Her sayfada farklı animasyonlu arka planlar

### 🚀 Animasyonlar ve Efektler
- **Glitch Efekti**: Ana sayfa sloganında dijital glitch animasyonu
- **Typewriter Efekti**: Sloganların yazım animasyonu
- **Rastgele Navigasyon**: Linklerin rastgele konumlanması ve büyüme/küçülme animasyonları
- **Parallax Efekti**: Arka planlarda hareket efekti
- **Yüzen Animasyonlar**: Navigasyon elementlerinin sürekli hareketi

### 📱 Sayfalar

1. **Ana Sayfa (The Shock)**
   - Soyut uzay/yıldız teması
   - "Yıldızlara Ulaşan Algoritmalar" sloganı
   - Dijital çizgi animasyonları

2. **Hakkımızda (The Manifesto)**
   - Loş ışıklı ofis/stüdyo arka planı
   - "Biz Sanatı Kodluyoruz" sloganı
   - Felsefi manifesto içeriği

3. **Hizmetlerimiz (The Impact)**
   - Gece vakti billboard görseli
   - "Geleceğin Kanvasları" sloganı
   - 3 sütun hizmet listesi

4. **Vizyon/Deney (The Future)**
   - Modern rezidans penceresinden görünüm
   - "Yarının Perspektifi" sloganı
   - Gelecek vizyonu içeriği

5. **Blog (The Library)**
   - Sade, içerik odaklı tasarım
   - 6-7 yazı başlığı ve özet
   - Tipografi odaklı minimal arayüz

6. **İletişim (The Nexus Point)**
   - Gökdelenlerin yükseldiği şehir manzarası
   - "Geleceği Konuşalım" sloganı
   - Neon mavi QR kod

### 🎯 Teknik Detaylar

- **Responsive Design**: Tüm cihazlarda mükemmel görünüm
- **Modern CSS**: Grid, Flexbox, CSS Animations
- **Vanilla JavaScript**: Harici kütüphane bağımlılığı yok
- **Google Fonts**: Orbitron ve Rajdhani font aileleri
- **CSS Variables**: Kolay tema değişikliği için

### 🎮 Kontroller
- **Fare Hareketi**: Navigasyon linklerinin hareket etmesi
- **Klavye**: Sağ/sol ok tuşlarıyla sayfa geçişi
- **Tıklama**: Rastgele konumlanmış navigasyon linkleri

### 🌟 Özel Efektler
- **Glitch Animasyonu**: Dijital bozulma efekti
- **Typewriter Efekti**: Yazım animasyonu
- **Parallax Scrolling**: Derinlik hissi
- **Neon Glow**: Neon mavi ışık efektleri
- **Blur Efektleri**: Sanatsal bulanıklık
- **QR Code**: İletişim için zarif QR kod tasarımı

## Kurulum

1. Tüm dosyaları bir klasöre indirin
2. `index.html` dosyasını bir web tarayıcısında açın
3. Navigasyon linklerine tıklayarak deneyimi keşfedin

## Dosya Yapısı

```
adastra-web/
├── index.html      # Ana HTML dosyası
├── styles.css      # Ana CSS dosyası
├── backgrounds.css # Arka plan efektleri
├── script.js       # JavaScript animasyonlar
├── .nojekyll       # GitHub Pages için Jekyll devre dışı
├── call.html       # Kısa yol: QR sayfasına yönlendirme
├── call/           # Klasör tabanlı kısa yol
│   └── index.html  # QR sayfasına yönlendirme (GitHub Pages uyumlu)
├── pages/
│   ├── qr.html     # QR iletişim sayfası (canonical içerik)
│   └── adastra.vcf # vCard (kişiyi rehbere ekle)
└── README.md       # Proje dökümantasyonu
```

## Site Yapısı ve Mimarisi

- Ana bileşenler: `index.html` içindeki her bölüm `.page-section` olarak yapılandırılır.
- Görsel katman: Her bölümde tam ekran `.hero-image` arka planı kullanılır.
- Metin katman: İçerik ve başlıklar `.text-panel` içinde yer alır.
- Navigasyon: Logo ve menü linkleri bölüm atlamalarını tetikler.
- Geçiş durumları (CSS sınıfları):
  - `hero-active`: Aktif bölümün görseli (üstte, görünür).
  - `hero-preview`: Sıradaki bölüm görselinin önizlemesi.
  - `hero-hold`: Eski görseli kısa süre tutarak cross-fade etkisi sağlar.
  - `black-fade-overlay`: Geçişlerde yumuşak siyahlık efekti için global overlay.
- Davranışlar (JS):
  - `activateNav` ve `setActiveNav`: Bölüm aktivasyon ve sınıf geçişlerini yönetir.
  - `smoothScrollToElement`: Programatik yumuşak kaydırmayı gerçekleştirir.
  - `suppressUpwardModeUntil`: Programatik scroll sırasında `upward-mode`’u geçici olarak devre dışı bırakır.

### Bölümler
- Ana Sayfa (`Home`)
- Hakkımızda (`About`)
- Hizmetlerimiz (`Services`)
- Vizyonumuz (`Vision`)
- Blog (`Blog`)
- İletişim (`Contact`)

Varlıklar ve görseller `root` ile `pages/` klasöründe PNG olarak bulunur ve ilgili bölümlerde tam ekran arka plan olarak kullanılır.

## Yerel Çalıştırma

- Herhangi bir statik sunucu ile çalışır. Örnek: `python -m http.server 5500`
- Tarayıcıda `http://localhost:5500/` adresini açarak deneyimi görüntüleyin.

## Yayınlama (Deploy)

- Statik hosting (ör. paylaşımlı host, Netlify, Vercel, GitHub Pages) ile doğrudan yayımlanabilir.
- Tüm dosyaları tek bir kök dizinde barındırın; giriş noktası `index.html`.
- Asset yolları görece (relative) olduğundan dizin yapısını koruyun.
- GitHub Pages için kökte `.nojekyll` dosyası mevcuttur; Jekyll işleme devre dışı bırakılır.
- GitHub Pages yapılandırması: Settings → Pages → Source: Deploy from branch, Branch: `main`, Folder: `/ (root)`.

### QR Sayfası (İletişim Kısayolu)
- Sayfa: `pages/qr.html`
- Kısa bağlantılar (GitHub Pages):
  - `https://garbaun.github.io/astra/call.html` (stabil ve önerilen)
  - `https://garbaun.github.io/astra/call/` (klasör tabanlı; `call/index.html`)
  - Doğrudan: `https://garbaun.github.io/astra/pages/qr.html`
- Üretim hedef URL: `https://adastrabcv.com/call` (DNS ve SSL sonrasında)
- Özellikler:
  - Logo 120x120 px, başlık alanında merkezlenmiş
  - “Adastra BCV Dijital mimari ve yaratıcı algoritmalar” metni kaldırıldı
  - Alt bilgi metni merkezde: `Adastra BCV® - 10.11.2025`
  - “Haritada aç” bağlantıları, “Ara” ve “WhatsApp” butonları
  - vCard: `pages/adastra.vcf`

## Commit Politikası

- Bu aşamadan sonra ek commit yapılmayacak; site son hâline getirildikten sonra host’a deploy edilecektir.

## Tarayıcı Uyumluluğu

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Notlar

- Görsel içerikler placeholder olarak tasarlanmıştır
- Telifsiz görsellerle değiştirilebilir
- Gerçek QR kod ile değiştirilmelidir
- Animasyonlar performans için optimize edilmiştir

---

**Adastra Reklam Ajansı** - Geleceğin reklamcılığını şekillendiriyoruz.

## Değişiklik Günlüğü

### 2025-11-10
- `pages/qr.html`: QR iletişim sayfası oluşturuldu ve sadeleştirildi.
  - Logo büyütüldü ve ortalandı (120x120 px).
  - Başlık ve açıklama metni kaldırıldı; tipografi sadeleştirildi.
  - Footer metni güncellendi ve ortalandı: `Adastra BCV® - 10.11.2025`.
- Kısayollar eklendi:
  - `call.html` (tek dosya) ve `call/index.html` (klasör)
  - Her ikisi de `pages/qr.html` sayfasına yönlendirir.
- `.nojekyll` eklendi: GitHub Pages’in dosyaları olduğu gibi yayınlaması sağlandı.
- `robots.txt` ve `sitemap.xml` güncellendi/eklendi (yayın uyumluluğu).

### 2025-11-09
- Blog (EN) sloganı güncellendi: `THE PULSE OF THE DIGITAL`.
- Blog kartlarında “Devamını oku / Read More” tıklandığında merkezde modal okuma alanı açılır.
  - Yumuşak koyu arka plan, okunaklı `Inter` fontu, rahat satır aralığı.
  - Escape tuşu, arka plan tıklaması veya `×` butonu ile kapanır.
- `script.js`:
  - `renderBlogGallery` içinde Read More olayları modalı açacak şekilde bağlandı.
  - EN/TR `blogPosts` öğelerine tam metin için `content` alanı eklendi.
  - Modal yardımcıları (`ensureReadModal`, `openReadModal`, `closeReadModal`) eklendi.
- `styles.css`:
  - `.read-modal-overlay`, `.read-modal`, `.read-modal-close` stilleri ile modal tasarımı eklendi.
