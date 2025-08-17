# CSS Variable Checker - Gizlilik Politikası

**Son Güncelleme**: Ağustos 2025

## 📋 Genel Bakış

CSS Variable Checker, kullanıcı gizliliğini korumaya kararlıdır. Bu uzantı minimum veri toplama prensibiyle geliştirilmiştir.

## 🔒 Veri Toplama

### **NE TOPLANIYOR:**
- **HİÇBİR KİŞİSEL VERİ TOPLANMIYOR**
- **HİÇBİR KULLANICI VERİSİ SAKLANMIYOR**
- **HİÇBİR ANALİTİK VERİ GÖNDER MİYOR**

### **NE YAPILIYOR:**
- CSS değişkenleri sadece yerel olarak analiz edilir
- Tüm işlemler kullanıcının cihazında gerçekleşir
- Hiçbir veri internet üzerinden gönderilmez

## 🛡️ İzinler ve Gerekçeleri

### **activeTab İzni:**
- **Amaç**: Kullanıcının aktif olarak çalıştığı sekmedeki CSS kurallarını analiz etmek
- **Gerekçe**: CSS değişkenleri sadece DOM ve stylesheet'lere erişilerek tespit edilebilir
- **Kapsam**: Sadece kullanıcının "Sayfayı Tarayın" butonuna bastığı sayfa
- **Veri Erişimi**: Sayfa CSS kuralları ve computed styles (sadece okuma amaçlı)
- **Veri Saklama**: Hiçbir veri saklanmaz, sadece analiz için geçici kullanılır

### **tabs İzni:**
- **Amaç**: Aktif tab bilgisini almak ve content script ile iletişim kurmak
- **Gerekçe**: Popup'tan content script'e mesaj göndermek için tab ID gereklidir
- **Kapsam**: Sadece aktif tab (currentWindow: true, active: true)
- **Veri Erişimi**: Tab durumu kontrolü (complete/loading) ve mesajlaşma
- **Veri Saklama**: Tab bilgileri hiçbir yerde saklanmaz

### **scripting İzni:**
- **Amaç**: Content script'in dinamik olarak enjekte edilmesi
- **Gerekçe**: Bazı sayfalarda content script otomatik yüklenmeyebilir, manuel enjeksiyon gerekir
- **Kapsam**: Sadece uzantının çalışması için gerekli durumlarda
- **Veri Erişimi**: Script enjeksiyonu için minimal sistem erişimi
- **Veri Saklama**: Hiçbir kod veya veri saklanmaz

### **content_scripts (All URLs):**
- **Amaç**: Tüm web sayfalarında CSS analizi yapabilmek
- **Gerekçe**: Kullanıcı hangi sitede olursa olsun CSS değişkenlerini kontrol edebilmeli
- **Kapsam**: document_idle durumunda pasif yükleme
- **Veri Erişimi**: Sadece CSS kuralları ve DOM elementleri (okuma amaçlı)
- **Veri Saklama**: Hiçbir sayfa verisi saklanmaz veya gönderilmez

## 🔐 Veri Güvenliği

- ✅ Tüm işlemler offline
- ✅ Hiçbir sunucuya bağlantı yok  
- ✅ Üçüncü taraf servislere veri gönderilmiyor
- ✅ Yerel analiz, yerel sonuçlar

## 📊 Analitik

Bu uzantı **HİÇBİR ANALİTİK ARAÇ** kullanmaz:
- Google Analytics YOK
- Kullanım istatistikleri YOK
- Hata raporlama servisleri YOK

## 🔄 Veri Paylaşımı

**HİÇBİR VERİ PAYLAŞILMAZ** çünkü hiçbir veri toplanmaz.

## 🌐 Uzak Kod Kullanımı

**UZAK KOD KULLANILMIYOR:**
- ❌ Hiçbir CDN'den kod yüklenmez
- ❌ Harici JavaScript kütüphanesi yok
- ❌ API çağrısı yapılmaz
- ❌ İnternet bağlantısı gerektirmez
- ✅ Tüm kod uzantı paketi içinde yer alır
- ✅ %100 offline çalışır

## 📞 İletişim Bilgileri

Gizlilik konularında sorularınız için:
- **GitHub**: [Repository Issues](https://github.com/username/css-variable-checker/issues)
- **E-posta**: [sizin-email@domain.com]

## 🔄 Politika Güncellemeleri

Bu politika güncellendiğinde, uzantı güncelleme notlarında bildirilecektir.

---

**Özet**: CSS Variable Checker tamamen gizliliğe saygılı, offline çalışan bir araçtır. Verileriniz sadece sizin kontrolünüzdedir.
