# Bilgilendirme

## Genel Özet
Bu proje tek sayfa akışına sahip bir web sitesidir. İçerikler bölümler halinde aynı sayfada yer alır. Dil desteği Türkçe, İngilizce ve Arapça olarak çalışır. Mobil görünümde menü hamburger butonu ile açılır/kapanır.

## Dosya ve Klasör Yapısı
- index.html: Ana sayfa ve tüm bölümler.
- styles.css: Temel ve responsive stiller.
- styles.tailwind.css: Tailwind çıktısı (build ile üretilir).
- script.js: Dil değişimi, içerik görünürlüğü, blog render ve etkileşimler.
- yazilar/index.html: Blog yazıları sayfası.
- src/tailwind.css: Tailwind giriş dosyası.
- mobil/: Mobil görseller.
- pages/: Masaüstü sayfa görselleri.

## Dil Desteği
- Dil butonları .language-switcher içinde bulunur ve data-lang ile yönetilir.
- Seçilen dil localStorage içinde lang anahtarıyla saklanır.
- script.js içinde applyLanguage ile metinler güncellenir.
- TR/EN/AR içerikleri aynı sayfa üzerinde ayrı bloklar olarak bulunur.
- Görünürlük .ui-hidden sınıfı ile kontrol edilir.
- Arapça için html dir="rtl" ve lang="ar" atanır.

## Çalışma Şekli
- Navigasyon linkleri bölüm bazında anlık geçiş yapar.
- Hamburger menü mobilde menüyü açıp kapatır.
- Blog içeriği script.js üzerinden render edilir.
- Hero görselleri sayfalara göre değişir; mobilde mobil görseller kullanılır.

## Mobil Düzen
- Mobilde logo gizlenir.
- Dil seçici mobilde üstte ve erişilebilir konumda kalır.
- Mobil menü hamburger ile açılır ve menü arka planı şeffaftır.
- Mobilde içerikler ortalanır, yazılar kenarlardan boşluk alır.

## Blog Sayfası
- yazilar/index.html ayrı bir sayfadır.
- Blog kartları grid düzenindedir.
- Mobilde tek sütuna düşer ve konu filtresi footer alanında görünür.

## Komutlar
- Geliştirme: npm run dev
- Build: npm run build
- Statik sunucu: npm run serve
