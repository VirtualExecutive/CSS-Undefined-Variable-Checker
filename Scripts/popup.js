// CSS Variable Checker - Popup Script

class PopupController {
    constructor() {
        this.scan_button = document.getElementById('scanButton');
        this.loading_section = document.getElementById('loadingSection');
        this.results_section = document.getElementById('resultsSection');
        this.no_issues_section = document.getElementById('noIssuesSection');
        this.undefined_results = document.getElementById('undefinedResults');
        this.export_button = document.getElementById('exportButton');
        this.clear_button = document.getElementById('clearButton');
        
        this.current_results = null;
        
        this.initEventListeners();
    }

    // Event listener'ları başlat
    initEventListeners() {
        this.scan_button.addEventListener('click', () => this.scanPage());
        this.export_button.addEventListener('click', () => this.exportReport());
        this.clear_button.addEventListener('click', () => this.clearResults());
    }

    // Sayfa tarama işlemi
    async scanPage() {
        try {
            this.showLoading();
            
            // Aktif tab'ı al
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('Aktif tab bulunamadı');
            }

            // Sayfanın yüklenip yüklenmediğini kontrol et
            if (tab.status !== 'complete') {
                throw new Error('Sayfa henüz yüklenmedi. Lütfen bekleyin ve tekrar deneyin.');
            }

            // Content script'in yüklenip yüklenmediğini kontrol et ve gerekirse enjekte et
            await this.ensureContentScriptLoaded(tab.id);

            // Content script'e mesaj gönder
            const response = await this.sendMessageWithRetry(tab.id, { action: 'scanPage' });
            
            if (response && response.success) {
                this.current_results = response.data;
                this.displayResults(response.data);
            } else {
                throw new Error(response?.error || 'Bilinmeyen hata');
            }
            
        } catch (error) {
            console.error('Tarama hatası:', error);
            this.showError('Tarama sırasında hata oluştu: ' + error.message);
        }
    }

    // Content script'in yüklendiğinden emin ol
    async ensureContentScriptLoaded(tab_id) {
        try {
            // Ping gönder - eğer content script yüklü değilse hata verir
            await chrome.tabs.sendMessage(tab_id, { action: 'ping' });
        } catch (error) {
            // Content script yüklü değil, enjekte et
            console.log('Content script enjekte ediliyor...');
            await chrome.scripting.executeScript({
                target: { tabId: tab_id },
                files: ['Scripts/contentScript.js']
            });
            
            // Kısa bir bekleme - script'in initialize olması için
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Retry mekanizması ile mesaj gönder
    async sendMessageWithRetry(tab_id, message, max_retries = 3) {
        for (let i = 0; i < max_retries; i++) {
            try {
                const response = await chrome.tabs.sendMessage(tab_id, message);
                return response;
            } catch (error) {
                console.log(`Mesaj gönderme denemesi ${i + 1}/${max_retries} başarısız:`, error);
                
                if (i === max_retries - 1) {
                    throw error;
                }
                
                // Kısa bekleme
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }

    // Loading durumunu göster
    showLoading() {
        this.hideAllSections();
        this.loading_section.classList.remove('hidden');
        this.scan_button.disabled = true;
    }

    // Sonuçları göster
    displayResults(results) {
        this.hideAllSections();
        
        if (results.error) {
            this.showError(results.error);
            return;
        }

        // İstatistikleri güncelle
        document.getElementById('totalElements').textContent = results.totalElements || 0;
        document.getElementById('totalVarUsage').textContent = results.totalVarUsage || 0;
        document.getElementById('undefinedCount').textContent = results.undefinedCount || 0;

        if (results.undefinedCount > 0) {
            this.displayUndefinedResults(results.undefinedResults);
            this.results_section.classList.remove('hidden');
        } else {
            this.no_issues_section.classList.remove('hidden');
        }

        this.scan_button.disabled = false;
    }

    // Tanımsız değişkenleri listele
    displayUndefinedResults(undefined_results) {
        this.undefined_results.innerHTML = '';

        if (!undefined_results || undefined_results.length === 0) {
            return;
        }

        // Benzersiz değişkenleri grupla
        const grouped_vars = {};
        undefined_results.forEach(result => {
            if (!grouped_vars[result.variable]) {
                grouped_vars[result.variable] = [];
            }
            grouped_vars[result.variable].push(result);
        });

        // Her grup için HTML oluştur
        Object.entries(grouped_vars).forEach(([variable, occurrences]) => {
            const item_element = document.createElement('div');
            item_element.className = 'undefined-item';
            
            const variable_element = document.createElement('div');
            variable_element.className = 'undefined-variable';
            variable_element.textContent = `${variable} (${occurrences.length} kullanım)`;
            
            const details_element = document.createElement('div');
            details_element.className = 'undefined-details';
            
            // İlk birkaç kullanımı göster
            const show_count = Math.min(3, occurrences.length);
            for (let i = 0; i < show_count; i++) {
                const occurrence = occurrences[i];
                const detail_span = document.createElement('span');
                detail_span.textContent = `${occurrence.element} → ${occurrence.property}`;
                details_element.appendChild(detail_span);
            }
            
            if (occurrences.length > show_count) {
                const more_span = document.createElement('span');
                more_span.textContent = `... ve ${occurrences.length - show_count} tane daha`;
                more_span.style.fontStyle = 'italic';
                details_element.appendChild(more_span);
            }
            
            item_element.appendChild(variable_element);
            item_element.appendChild(details_element);
            this.undefined_results.appendChild(item_element);
        });
    }

    // Rapor dışa aktar
    async exportReport() {
        if (!this.current_results) {
            this.showError('Dışa aktarılacak sonuç bulunamadı');
            return;
        }

        try {
            // Aktif tab'ı al
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Content script'in yüklendiğinden emin ol
            await this.ensureContentScriptLoaded(tab.id);
            
            // Content script'ten rapor oluştur
            const response = await this.sendMessageWithRetry(tab.id, { 
                action: 'generateReport', 
                data: this.current_results 
            });
            
            if (response && response.success) {
                this.downloadReport(response.report);
            } else {
                throw new Error(response?.error || 'Rapor oluşturulamadı');
            }
            
        } catch (error) {
            console.error('Rapor dışa aktarma hatası:', error);
            this.showError('Rapor dışa aktarılırken hata oluştu: ' + error.message);
        }
    }

    // Raporu dosya olarak indir
    downloadReport(report_content) {
        const blob = new Blob([report_content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `css-variable-report-${timestamp}.txt`;
        link.href = url;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    // Sonuçları temizle
    clearResults() {
        this.current_results = null;
        this.hideAllSections();
        this.scan_button.disabled = false;
    }

    // Hata göster
    showError(message) {
        this.hideAllSections();
        
        // Basit bir hata gösterimi
        const error_div = document.createElement('div');
        error_div.style.cssText = `
            padding: 20px;
            text-align: center;
            color: #ef4444;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            margin: 20px 0;
        `;
        error_div.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
            <div style="font-weight: 500; margin-bottom: 4px;">Hata</div>
            <div style="font-size: 14px;">${message}</div>
        `;
        
        // Varsa eski hata mesajını kaldır
        const existing_error = document.querySelector('.error-message');
        if (existing_error) {
            existing_error.remove();
        }
        
        error_div.className = 'error-message';
        this.loading_section.parentNode.insertBefore(error_div, this.loading_section);
        
        this.scan_button.disabled = false;
    }

    // Tüm section'ları gizle
    hideAllSections() {
        this.loading_section.classList.add('hidden');
        this.results_section.classList.add('hidden');
        this.no_issues_section.classList.add('hidden');
        
        // Hata mesajlarını da temizle
        const error_messages = document.querySelectorAll('.error-message');
        error_messages.forEach(el => el.remove());
    }
}

// Popup yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});
