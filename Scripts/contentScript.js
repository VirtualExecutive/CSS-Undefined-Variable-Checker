// CSS Variable Checker - Content Script

class CSSVariableChecker {
    constructor() {
        this.is_scanning = false;
    }

    // Ana tarama fonksiyonu
    async checkAllElementsCSSVariables() {
        if (this.is_scanning) {
            return { error: 'Tarama zaten devam ediyor' };
        }

        this.is_scanning = true;
        
        try {
            console.log('🚀 CSS Variable Checker başlıyor...');
            
            const all_elements = document.querySelectorAll('*');
            console.log(`📋 Toplam ${all_elements.length} element kontrol edilecek`);
            
            let undefined_results = [];
            let total_var_usage = 0;
            let element_count = 0;
            
            // Root'ta tanımlı değişkenleri topla
            const root_style = getComputedStyle(document.documentElement);
            const defined_vars = new Set();
            
            for (let i = 0; i < root_style.length; i++) {
                const prop = root_style[i];
                if (prop.startsWith('--')) {
                    const value = root_style.getPropertyValue(prop);
                    if (value && value.trim() !== '') {
                        defined_vars.add(prop);
                    }
                }
            }
            
            // CSS kurallarını topla
            const css_rules = [];
            
            for (let i = 0; i < document.styleSheets.length; i++) {
                const sheet = document.styleSheets[i];
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    for (let j = 0; j < rules.length; j++) {
                        css_rules.push(rules[j]);
                    }
                } catch (e) {
                    console.log(`⚠️ CORS stylesheet atlandı: ${sheet.href}`);
                }
            }
            
            // Her elementi kontrol et
            for (const element of all_elements) {
                element_count++;
                
                const element_selector = this.getElementSelector(element);
                const affecting_rules = this.getAffectingRules(element, css_rules);
                
                // CSS değişken kullanımlarını kontrol et
                affecting_rules.forEach(rule => {
                    // CSS kuralını satır satır böl ve her property'yi ayrı ayrı kontrol et
                    const css_properties = this.extractCSSProperties(rule.cssText);
                    
                    css_properties.forEach(prop_obj => {
                        const var_usages = prop_obj.value.match(/var\(\s*--[^)]+\)/g);
                        
                        if (var_usages) {
                            total_var_usage += var_usages.length;
                            
                            var_usages.forEach(usage => {
                                const var_name = usage.match(/var\(\s*(--[\w-]+)/);
                                if (var_name) {
                                    const variable = var_name[1];
                                    
                                    // Değişken tanımlı mı kontrol et
                                    const root_value = root_style.getPropertyValue(variable);
                                    const element_value = getComputedStyle(element).getPropertyValue(variable);
                                    
                                    if (!root_value && !element_value) {
                                        // UNDEFINED bulundu!
                                        undefined_results.push({
                                            element: element_selector,
                                            selector: rule.selectorText,
                                            property: prop_obj.property,
                                            variable: variable,
                                            usage: usage,
                                            cssRule: rule.cssText
                                        });
                                    }
                                }
                            });
                        }
                    });
                });
            }
            
            // Sonuçları döndür
            const result = {
                totalElements: all_elements.length,
                totalVarUsage: total_var_usage,
                definedVars: defined_vars.size,
                undefinedCount: undefined_results.length,
                undefinedResults: undefined_results
            };
            
            console.log('✅ Tarama tamamlandı:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Tarama hatası:', error);
            return { error: error.message };
        } finally {
            this.is_scanning = false;
        }
    }

    // Element selector oluştur
    getElementSelector(element) {
        return element.tagName.toLowerCase() + 
            (element.id ? '#' + element.id : '') + 
            (element.className ? '.' + element.className.split(' ').join('.') : '');
    }

    // Elementi etkileyen CSS kurallarını bul
    getAffectingRules(element, css_rules) {
        const affecting_rules = [];
        
        css_rules.forEach(rule => {
            if (rule.selectorText) {
                try {
                    if (element.matches(rule.selectorText)) {
                        affecting_rules.push(rule);
                    }
                } catch (e) {
                    // selector match hatası, atla
                }
            }
        });
        
        return affecting_rules;
    }

    // CSS kuralından property-value çiftlerini ayıkla
    extractCSSProperties(css_text) {
        const properties = [];
        
        // CSS kuralından sadece declarations kısmını al
        const declarations_match = css_text.match(/\{([^}]+)\}/);
        if (!declarations_match) {
            return properties;
        }
        
        const declarations = declarations_match[1];
        
        // Her property:value çiftini ayır
        const property_strings = declarations.split(';').filter(prop => prop.trim());
        
        property_strings.forEach(prop_string => {
            const colon_index = prop_string.indexOf(':');
            if (colon_index > 0) {
                const property = prop_string.substring(0, colon_index).trim();
                const value = prop_string.substring(colon_index + 1).trim();
                
                if (property && value) {
                    properties.push({
                        property: property,
                        value: value
                    });
                }
            }
        });
        
        return properties;
    }

    // Rapor oluştur
    generateReport(results) {
        const report_lines = [
            '=== CSS VARIABLE CHECKER RAPORU ===',
            `Tarih: ${new Date().toLocaleString('tr-TR')}`,
            `URL: ${window.location.href}`,
            '',
            '=== ÖZET ===',
            `Toplam Element: ${results.totalElements}`,
            `CSS Değişken Kullanımı: ${results.totalVarUsage}`,
            `Tanımlı Değişkenler: ${results.definedVars}`,
            `Tanımsız Değişkenler: ${results.undefinedCount}`,
            ''
        ];

        if (results.undefinedResults && results.undefinedResults.length > 0) {
            report_lines.push('=== TANIMSIZ CSS DEĞİŞKENLERİ ===');
            
            results.undefinedResults.forEach((result, index) => {
                report_lines.push(`${index + 1}. ${result.variable}`);
                report_lines.push(`   Element: ${result.element}`);
                report_lines.push(`   Selector: ${result.selector}`);
                report_lines.push(`   Property: ${result.property}`);
                report_lines.push(`   Usage: ${result.usage}`);
                report_lines.push('');
            });
            
            // Özet
            const unique_vars = [...new Set(results.undefinedResults.map(r => r.variable))];
            report_lines.push('=== ÖZET LİSTE ===');
            unique_vars.forEach((variable, index) => {
                const count = results.undefinedResults.filter(r => r.variable === variable).length;
                report_lines.push(`${index + 1}. ${variable} (${count} yerde kullanılmış)`);
            });
        } else {
            report_lines.push('✅ Tüm CSS değişkenleri düzgün tanımlanmış!');
        }

        return report_lines.join('\n');
    }
}

// Global instance
const css_checker = new CSSVariableChecker();

// Popup'tan gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Ping mesajı - content script'in yüklendiğini doğrula
    if (request.action === 'ping') {
        sendResponse({ success: true, message: 'Content script yüklü ve hazır' });
        return true;
    }
    
    if (request.action === 'scanPage') {
        console.log('📨 Popup\'tan tarama isteği alındı');
        
        css_checker.checkAllElementsCSSVariables()
            .then(result => {
                console.log('📤 Sonuçlar popup\'a gönderiliyor:', result);
                sendResponse({ success: true, data: result });
            })
            .catch(error => {
                console.error('❌ Tarama hatası:', error);
                sendResponse({ success: false, error: error.message });
            });
        
        return true; // Asenkron response için
    }
    
    if (request.action === 'generateReport') {
        try {
            const report = css_checker.generateReport(request.data);
            sendResponse({ success: true, report: report });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }
});
