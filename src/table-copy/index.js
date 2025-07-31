// TypingMind Table Copy Extension
(function() {
    'use strict';
    
    console.log('🔄 Table Copy Extension loaded!');
    
    // Function to convert table to TSV format (Tab-Separated Values)
    function tableToTSV(table) {
        const rows = [];
        
        // Get all rows (including header)
        const tableRows = table.querySelectorAll('tr');
        
        tableRows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const rowData = [];
            
            cells.forEach(cell => {
                // Get text content and clean it up
                let cellText = cell.textContent || cell.innerText || '';
                // Remove extra whitespace and newlines
                cellText = cellText.replace(/\s+/g, ' ').trim();
                // Escape tabs and newlines for TSV format
                cellText = cellText.replace(/\t/g, ' ').replace(/\n/g, ' ');
                rowData.push(cellText);
            });
            
            rows.push(rowData.join('\t'));
        });
        
        return rows.join('\n');
    }
    
    // Function to copy text to clipboard
    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const result = document.execCommand('copy');
                textArea.remove();
                return result;
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
            return false;
        }
    }
    
    // Function to show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Function to add copy button to table
    function addCopyButtonToTable(table) {
        // Check if button already exists
        if (table.querySelector('.table-copy-btn')) {
            return;
        }
        
        // Create copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'table-copy-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.style.cssText = `
            position: absolute !important;
            top: -40px !important;
            right: 0 !important;
            background: #2196F3 !important;
            color: white !important;
            border: none !important;
            padding: 8px 16px !important;
            border-radius: 6px !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3) !important;
            transition: all 0.2s ease !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
            z-index: 1000 !important;
            white-space: nowrap !important;
            min-width: auto !important;
            min-height: auto !important;
            height: auto !important;
            width: auto !important;
            line-height: normal !important;
            text-align: center !important;
            display: inline-block !important;
            box-sizing: border-box !important;
        `;

        
        // Add hover effects
        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.background = '#1976D2';
            copyBtn.style.transform = 'translateY(-1px)';
        });
        
        copyBtn.addEventListener('mouseleave', () => {
            copyBtn.style.background = '#2196F3';
            copyBtn.style.transform = 'translateY(0)';
        });
        
        // Add click handler
        copyBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const tsvData = tableToTSV(table);
            const success = await copyToClipboard(tsvData);
            
            if (success) {
                showNotification('✅ Table copied to clipboard!', 'success');
                copyBtn.innerHTML = '✅ Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '📋 Copy';
                }, 2000);
            } else {
                showNotification('❌ Failed to copy table', 'error');
            }
        });
        
        // Make table container relative positioned
        const tableContainer = table.closest('div') || table.parentElement;
        if (tableContainer) {
            tableContainer.style.position = 'relative';
            tableContainer.appendChild(copyBtn);
        }
    }
    
    // Function to scan for tables and add copy buttons
    function scanForTables() {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            // Only add to tables that appear to be markdown-rendered tables
            if (table.querySelector('th') || table.querySelector('thead')) {
                addCopyButtonToTable(table);
            }
        });
    }
    
    // Function to observe DOM changes for new tables
    function observeForNewTables() {
        const observer = new MutationObserver((mutations) => {
            let shouldScan = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if new node contains tables or is a table
                            if (node.tagName === 'TABLE' || node.querySelector('table')) {
                                shouldScan = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldScan) {
                // Delay scanning to allow content to fully render
                setTimeout(scanForTables, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        return observer;
    }
    
    // Initialize extension
    function init() {
        console.log('🔄 Initializing Table Copy Extension...');
        
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Initial scan for existing tables
        scanForTables();
        
        // Start observing for new tables
        observeForNewTables();
        
        console.log('✅ Table Copy Extension initialized successfully!');
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
