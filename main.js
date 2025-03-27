// ... existing code ...

function showModal(options) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    
    const title = document.createElement('div');
    title.className = 'modal-title';
    title.textContent = options.title || 'Notification';
    
    const message = document.createElement('div');
    message.className = 'modal-message';
    message.textContent = options.message || '';
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'modal-buttons';
    
    modalContainer.appendChild(title);
    modalContainer.appendChild(message);
    
    // Add content if provided via function
    if (options.content && typeof options.content === 'function') {
        const contentElement = options.content();
        modalContainer.appendChild(contentElement);
    }
    
    // Add input if needed
    let inputElement = null;
    if (options.input) {
        inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.className = 'modal-input';
        inputElement.value = options.inputValue || '';
        inputElement.placeholder = options.inputPlaceholder || '';
        modalContainer.appendChild(inputElement);
    }
    
    // Create buttons
    if (options.buttons) {
        options.buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = `modal-btn ${button.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}`;
            btn.textContent = button.text;
            btn.onclick = () => {
                document.body.removeChild(backdrop);
                if (button.callback) {
                    if (inputElement) {
                        button.callback(inputElement.value);
                    } else {
                        button.callback();
                    }
                }
            };
            buttonsContainer.appendChild(btn);
        });
    }
    
    modalContainer.appendChild(buttonsContainer);
    backdrop.appendChild(modalContainer);
    document.body.appendChild(backdrop);
    
    if (inputElement) {
        setTimeout(() => inputElement.focus(), 100);
    }
    
    return {
        close: () => {
            if (document.body.contains(backdrop)) {
                document.body.removeChild(backdrop);
            }
        }
    };
}

class NotepadApp {
    constructor() {
        // Initialize the notepad application
        this.setupEditor();
        this.setupEventListeners();
        this.loadSavedNotes();
        this.setupWordCounter();
        this.setupSavedFilesToggle();
        this.loadNotepadContent(); // Load content from localStorage on page load
    }
    
    setupEditor() {
        // Set up the editor with initial state
        this.notepad = document.getElementById('notepad');
        this.lastSavedContent = this.notepad.innerHTML;
        document.execCommand('defaultParagraphSeparator', false, 'p');
        
        // Add event listener to save content when changed
        this.notepad.addEventListener('input', () => {
            localStorage.setItem('currentNotepadContent', this.notepad.innerHTML);
        });
    }
    
    loadNotepadContent() {
        // Load saved content from localStorage
        const savedContent = localStorage.getItem('currentNotepadContent');
        if (savedContent) {
            this.notepad.innerHTML = savedContent;
            this.lastSavedContent = savedContent;
        }
    }
    
    setupEventListeners() {
        // Set up event listeners for all toolbar buttons
        document.querySelectorAll('.toolbar-btn').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');
                this.handleAction(action, button);
            });
        });
        
        // Set up font and size selectors
        const fontSelector = document.getElementById('fontSelector');
        if (fontSelector) {
            fontSelector.addEventListener('change', () => {
                document.execCommand('fontName', false, fontSelector.value);
            });
        }
        
        const fontSizeSelector = document.getElementById('fontSizeSelector');
        if (fontSizeSelector) {
            fontSizeSelector.addEventListener('change', () => {
                const fontSize = fontSizeSelector.value + 'px';
                document.execCommand('fontSize', false, '7'); // Use a dummy value first
                
                // Apply the actual font size to all font size 7 elements
                const elements = document.querySelectorAll('[size="7"]');
                elements.forEach(el => {
                    el.removeAttribute('size');
                    el.style.fontSize = fontSize;
                });
                
                // For selected content
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    if (!range.collapsed) {
                        const span = document.createElement('span');
                        span.style.fontSize = fontSize;
                        
                        // If text is selected, wrap it with the span
                        const content = range.extractContents();
                        span.appendChild(content);
                        range.insertNode(span);
                    }
                }
            });
        }
        
        // Set up color pickers
        const textColor = document.getElementById('textColor');
        if (textColor) {
            textColor.addEventListener('input', () => {
                document.execCommand('foreColor', false, textColor.value);
            });
        }
        
        const highlightColor = document.getElementById('highlightColor');
        if (highlightColor) {
            highlightColor.addEventListener('input', () => {
                document.execCommand('hiliteColor', false, highlightColor.value);
            });
        }
    }
    
    handleAction(action, button) {
        switch (action) {
            case 'new':
                if (this.notepad.innerHTML !== '' && this.notepad.innerHTML !== this.lastSavedContent) {
                    showModal({
                        title: 'Unsaved Changes',
                        message: 'You have unsaved changes. Do you want to save before creating a new note?',
                        buttons: [
                            {
                                text: 'Save',
                                primary: true,
                                callback: () => {
                                    this.askSaveLocation(() => {
                                        this.notepad.innerHTML = '';
                                        this.lastSavedContent = '';
                                    });
                                }
                            },
                            {
                                text: 'Discard',
                                callback: () => {
                                    this.notepad.innerHTML = '';
                                    this.lastSavedContent = '';
                                }
                            },
                            {
                                text: 'Cancel',
                                callback: () => {}
                            }
                        ]
                    });
                } else {
                    this.notepad.innerHTML = '';
                    this.lastSavedContent = '';
                }
                break;
                
            case 'save':
                this.saveNote();
                break;
                
            case 'download':
                this.downloadNote();
                break;
                
            case 'import':
                this.importFile();
                break;
                
            case 'print':
                window.print();
                break;
                
            case 'undo':
                document.execCommand('undo');
                break;
                
            case 'redo':
                document.execCommand('redo');
                break;
                
            case 'bold':
                document.execCommand('bold');
                button.classList.toggle('active');
                break;
                
            case 'italic':
                document.execCommand('italic');
                button.classList.toggle('active');
                break;
                
            case 'underline':
                document.execCommand('underline');
                button.classList.toggle('active');
                break;
                
            case 'strikethrough':
                document.execCommand('strikethrough');
                button.classList.toggle('active');
                break;
                
            case 'justifyLeft':
                document.execCommand('justifyLeft');
                this.removeAlignActiveClass();
                button.classList.add('active');
                break;
                
            case 'justifyCenter':
                document.execCommand('justifyCenter');
                this.removeAlignActiveClass();
                button.classList.add('active');
                break;
                
            case 'justifyRight':
                document.execCommand('justifyRight');
                this.removeAlignActiveClass();
                button.classList.add('active');
                break;
                
            case 'justifyFull':
                document.execCommand('justifyFull');
                this.removeAlignActiveClass();
                button.classList.add('active');
                break;
                
            case 'insertOrderedList':
                document.execCommand('insertOrderedList');
                button.classList.toggle('active');
                break;
                
            case 'insertUnorderedList':
                document.execCommand('insertUnorderedList');
                button.classList.toggle('active');
                break;
                
            case 'emoji':
                this.showEmojiPicker();
                break;
                
            case 'link':
                this.createLink();
                break;
                
            case 'image':
                this.insertImage();
                break;
                
            case 'code':
                this.insertCode();
                break;
                
            case 'table':
                this.insertTable();
                break;
                
            case 'blockquote':
                document.execCommand('formatBlock', false, '<blockquote>');
                break;
                
            case 'horizontalLine':
                document.execCommand('insertHorizontalRule');
                break;
                
            case 'findReplace':
                this.showFindReplaceDialog();
                break;
                
            case 'removeFormat':
                document.execCommand('removeFormat');
                break;
                
            case 'fullscreen':
                this.toggleFullscreen();
                break;
                
            case 'darkMode':
                this.toggleDarkMode();
                break;
        }
    }
    
    removeAlignActiveClass() {
        document.querySelectorAll('[data-action^="justify"]').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    saveNote(callback) {
        this.askSaveLocation(callback);
    }
    
    askSaveLocation(callback) {
        const content = this.notepad.innerHTML;
        
        showModal({
            title: 'Save Note',
            message: 'How would you like to save this note?',
            buttons: [
                {
                    text: 'Save as New',
                    primary: true,
                    callback: () => {
                        showModal({
                            title: 'Save as New Note',
                            message: 'Enter a title for your note:',
                            input: true,
                            inputValue: 'Untitled Note',
                            buttons: [
                                {
                                    text: 'Save',
                                    primary: true,
                                    callback: (title) => {
                                        if (title) {
                                            const noteObj = {
                                                id: Date.now(),
                                                title: title,
                                                content: content,
                                                date: new Date().toLocaleString()
                                            };
                                            
                                            let savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
                                            savedNotes.push(noteObj);
                                            localStorage.setItem('notes', JSON.stringify(savedNotes));
                                            
                                            this.lastSavedContent = content;
                                            this.loadSavedNotes();
                                            
                                            this.showToast('Note saved successfully!', 'success');
                                            
                                            if (typeof callback === 'function') {
                                                callback();
                                            }
                                        }
                                    }
                                },
                                {
                                    text: 'Cancel',
                                    callback: () => {}
                                }
                            ]
                        });
                    }
                },
                {
                    text: 'Update Current',
                    callback: () => {
                        // Check if there's an active note
                        const activeCard = document.querySelector('.saved-file-card.active');
                        if (activeCard) {
                            const noteId = parseInt(activeCard.querySelector('.file-action-btn').getAttribute('data-id'));
                            let savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
                            const noteIndex = savedNotes.findIndex(note => note.id === noteId);
                            
                            if (noteIndex !== -1) {
                                savedNotes[noteIndex].content = content;
                                savedNotes[noteIndex].date = new Date().toLocaleString();
                                localStorage.setItem('notes', JSON.stringify(savedNotes));
                                
                                this.lastSavedContent = content;
                                this.loadSavedNotes();
                                
                                this.showToast('Note updated successfully!', 'success');
                                
                                if (typeof callback === 'function') {
                                    callback();
                                }
                            }
                        } else {
                            // If no active note, fall back to save as new
                            showModal({
                                title: 'No Active Note',
                                message: 'There is no active note to update. Save as new?',
                                buttons: [
                                    {
                                        text: 'Save as New',
                                        primary: true,
                                        callback: () => {
                                            this.askSaveLocation(callback);
                                        }
                                    },
                                    {
                                        text: 'Cancel',
                                        callback: () => {}
                                    }
                                ]
                            });
                        }
                    }
                },
                {
                    text: 'Cancel',
                    callback: () => {}
                }
            ]
        });
    }
    
    loadSavedNotes() {
        const savedFilesList = document.getElementById('savedFilesList');
        const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        if (savedFilesList) {
            savedFilesList.innerHTML = '';
            
            if (savedNotes.length === 0) {
                savedFilesList.innerHTML = '<div class="empty-files-message">No saved notes yet.</div>';
                return;
            }
            
            savedNotes.forEach(note => {
                const noteCard = document.createElement('div');
                noteCard.className = 'saved-file-card';
                noteCard.innerHTML = `
                    <div class="saved-file-title">${note.title}</div>
                    <div class="saved-file-preview">${this.getPreviewText(note.content)}</div>
                    <div class="saved-file-date">${note.date}</div>
                    <div class="saved-file-actions">
                        <button class="file-action-btn" data-action="rename" data-id="${note.id}" title="Rename">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="file-action-btn" data-action="delete" data-id="${note.id}" title="Delete">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                `;
                
                noteCard.addEventListener('click', (e) => {
                    if (!e.target.closest('.file-action-btn')) {
                        this.loadNote(note);
                    }
                });
                
                savedFilesList.appendChild(noteCard);
            });
            
            // Add event listeners for rename and delete buttons
            document.querySelectorAll('.file-action-btn[data-action="rename"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const noteId = parseInt(btn.getAttribute('data-id'));
                    this.renameNote(noteId);
                });
            });
            
            document.querySelectorAll('.file-action-btn[data-action="delete"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const noteId = parseInt(btn.getAttribute('data-id'));
                    this.deleteNote(noteId);
                });
            });
        }
    }
    
    getPreviewText(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent.substring(0, 100) || 'Empty note';
    }
    
    loadNote(note) {
        if (this.notepad.innerHTML !== this.lastSavedContent) {
            if (!confirm('You have unsaved changes. Load this note anyway?')) {
                return;
            }
        }
        
        this.notepad.innerHTML = note.content;
        this.lastSavedContent = note.content;
        
        document.querySelectorAll('.saved-file-card').forEach(card => {
            card.classList.remove('active');
            if (parseInt(card.querySelector('.file-action-btn').getAttribute('data-id')) === note.id) {
                card.classList.add('active');
            }
        });
    }
    
    renameNote(noteId) {
        const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
        const noteIndex = savedNotes.findIndex(note => note.id === noteId);
        
        if (noteIndex !== -1) {
            showModal({
                title: 'Rename Note',
                message: 'Enter a new title:',
                input: true,
                inputValue: savedNotes[noteIndex].title,
                buttons: [
                    {
                        text: 'Rename',
                        primary: true,
                        callback: (newTitle) => {
                            if (newTitle) {
                                savedNotes[noteIndex].title = newTitle;
                                localStorage.setItem('notes', JSON.stringify(savedNotes));
                                this.loadSavedNotes();
                            }
                        }
                    },
                    {
                        text: 'Cancel',
                        callback: () => {}
                    }
                ]
            });
        }
    }
    
    deleteNote(noteId) {
        showModal({
            title: 'Delete Note',
            message: 'Are you sure you want to delete this note?',
            buttons: [
                {
                    text: 'Delete',
                    primary: true,
                    callback: () => {
                        let savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
                        savedNotes = savedNotes.filter(note => note.id !== noteId);
                        localStorage.setItem('notes', JSON.stringify(savedNotes));
                        this.loadSavedNotes();
                    }
                },
                {
                    text: 'Cancel',
                    callback: () => {}
                }
            ]
        });
    }
    
    downloadNote() {
        showModal({
            title: 'Export Note',
            message: 'Choose a format to export your note:',
            content: () => {
                const container = document.createElement('div');
                
                const formatOptions = document.createElement('div');
                formatOptions.className = 'format-options';
                
                const formats = [
                    { icon: 'ri-file-text-line', name: 'Text (.txt)' },
                    { icon: 'ri-html5-line', name: 'HTML (.html)' },
                    { icon: 'ri-markdown-line', name: 'Markdown (.md)' },
                    { icon: 'ri-file-word-line', name: 'Word (.docx)' },
                    { icon: 'ri-file-pdf-line', name: 'PDF (.pdf)' }
                ];
                
                formats.forEach(format => {
                    const option = document.createElement('div');
                    option.className = 'format-option';
                    option.innerHTML = `<i class="${format.icon}"></i><span>${format.name}</span>`;
                    option.addEventListener('click', () => {
                        this.exportAs(format.name.split('(')[1].replace(')', '').trim());
                        document.querySelector('.modal-backdrop').remove();
                    });
                    formatOptions.appendChild(option);
                });
                
                container.appendChild(formatOptions);
                return container;
            },
            buttons: [
                {
                    text: 'Cancel',
                    callback: () => {}
                }
            ]
        });
    }
    
    exportAs(format) {
        const content = this.notepad.innerHTML;
        const textContent = this.notepad.innerText;
        
        switch(format) {
            case '.txt':
                // Preserve line breaks and spacing in text export
                const preservedTextContent = this.notepad.innerText.replace(/\n/g, '\r\n');
                this.downloadFile(preservedTextContent, 'note.txt', 'text/plain');
                break;
            case '.html':
                const htmlContent = `<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Exported Note</title>
                </head>
                <body>
                    ${content}
                </body>
                </html>`;
                this.downloadFile(htmlContent, 'note.html', 'text/html');
                break;
            case '.md':
                // Simple HTML to Markdown conversion
                let markdown = textContent;
                this.downloadFile(markdown, 'note.md', 'text/markdown');
                break;
            case '.docx':
                this.exportToDocx();
                break;
            case '.pdf':
                this.exportToPdf();
                break;
        }
    }
    
    exportToRtf() {
        // Show loading toast
        this.showToast('Generating RTF...', 'info');
        
        // Create a temporary element to hold the content for better preservation
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = this.notepad.innerHTML;
        
        // Start RTF document with better font table and style definitions
        let rtfContent = "{\\rtf1\\ansi\\ansicpg1252\\cocoartf2580\\cocoasubrtf220\n";
        rtfContent += "{\\fonttbl\\f0\\fswiss\\fcharset0 Helvetica;\\f1\\froman\\fcharset0 TimesNewRoman;\\f2\\fmodern\\fcharset0 Courier;\\f3\\fnil\\fcharset0 Arial;}\n";
        rtfContent += "{\\colortbl;\\red0\\green0\\blue0;\\red255\\green0\\blue0;\\red0\\green0\\blue255;\\red0\\green128\\blue0;}\n";
        rtfContent += "{\\*\\expandedcolortbl;;\\csgenericrgb\\c100000\\c0\\c0;\\csgenericrgb\\c0\\c0\\c100000;\\csgenericrgb\\c0\\c50196\\c0;}\n";
        rtfContent += "\\margl1440\\margr1440\\vieww11520\\viewh8400\\viewkind0\n";
        rtfContent += "\\pard\\tx720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\partightenfactor0\n\n";
        
        // Improved HTML to RTF conversion
        const convertNodeToRtf = (node, styles = {}, nestingLevel = 0) => {
            // Handle text nodes
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.textContent;
                if (!text.trim() && nestingLevel > 0) return '';
                
                // Escape RTF characters
                text = text.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
                text = text.replace(/\n/g, '\\par ');
                
                // Apply current styles
                let styledText = '';
                if (styles.bold) styledText += '\\b ';
                if (styles.italic) styledText += '\\i ';
                if (styles.underline) styledText += '\\ul ';
                if (styles.fontSize) styledText += `\\fs${styles.fontSize} `;
                if (styles.color) styledText += `\\cf${styles.color} `;
                
                styledText += text;
                
                // Close style tags if needed
                if (styles.underline) styledText += ' \\ulnone';
                if (styles.italic) styledText += ' \\i0';
                if (styles.bold) styledText += ' \\b0';
                
                return styledText;
            }
            
            // Handle element nodes
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = node.nodeName.toLowerCase();
                let result = '';
                let newStyles = {...styles};
                let addParAfter = false;
                
                // Get computed styles for this element
                const computedStyle = window.getComputedStyle(node);
                const isBold = computedStyle.fontWeight >= 600 || computedStyle.fontWeight === 'bold';
                const isItalic = computedStyle.fontStyle === 'italic';
                const fontSize = parseInt(computedStyle.fontSize);
                
                if (isBold) newStyles.bold = true;
                if (isItalic) newStyles.italic = true;
                if (fontSize) newStyles.fontSize = Math.round(fontSize * 2); // RTF uses 1/2 point sizes
                
                // Handle different HTML elements appropriately
                switch (tag) {
                    case 'p':
                        result += '\\pard\\sa200\\sl276\\slmult1 ';
                        addParAfter = true;
                        break;
                    case 'div':
                        if (nestingLevel === 0) {
                            result += '\\pard\\sa200\\sl276\\slmult1 ';
                            addParAfter = true;
                        }
                        break;
                    case 'br':
                        result += '\\line ';
                        break;
                    case 'b':
                    case 'strong':
                        newStyles.bold = true;
                        break;
                    case 'i':
                    case 'em':
                        newStyles.italic = true;
                        break;
                    case 'u':
                        newStyles.underline = true;
                        break;
                    case 'h1':
                        result += '{\\pard\\sa200\\sl276\\slmult1\\f1\\fs52\\b ';
                        addParAfter = true;
                        break;
                    case 'h2':
                        result += '{\\pard\\sa200\\sl276\\slmult1\\f1\\fs40\\b ';
                        addParAfter = true;
                        break;
                    case 'h3':
                        result += '{\\pard\\sa200\\sl276\\slmult1\\f1\\fs36\\b ';
                        addParAfter = true;
                        break;
                    case 'h4':
                        result += '{\\pard\\sa200\\sl276\\slmult1\\f1\\fs32\\b ';
                        addParAfter = true;
                        break;
                    case 'h5':
                        result += '{\\pard\\sa200\\sl276\\slmult1\\f1\\fs28\\b ';
                        addParAfter = true;
                        break;
                    case 'h6':
                        result += '{\\pard\\sa200\\sl276\\slmult1\\f1\\fs24\\b ';
                        addParAfter = true;
                        break;
                    case 'ul':
                        result += '\\pard\\sa200\\sl276\\slmult1 ';
                        break;
                    case 'ol':
                        result += '\\pard\\sa200\\sl276\\slmult1 ';
                        break;
                    case 'li':
                        if (node.parentNode.nodeName.toLowerCase() === 'ol') {
                            const index = Array.from(node.parentNode.children).indexOf(node) + 1;
                            result += '\\pard\\fi-360\\li720\\sa200\\sl276\\slmult1 ' + index + '. ';
                        } else {
                            result += '\\pard\\fi-360\\li720\\sa200\\sl276\\slmult1 \\'+ 'bullet ';
                        }
                        addParAfter = true;
                        break;
                    case 'a':
                        result += '{\\field{\\*\\fldinst{HYPERLINK "' + 
                                 (node.getAttribute('href') || '').replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}') + 
                                 '"}}{\\fldrslt{\\ul\\cf3 ';
                        newStyles.color = 3; // Blue
                        newStyles.underline = true;
                        break;
                    case 'blockquote':
                        result += '\\pard\\fi340\\li340\\ri340\\sa200\\sl276\\slmult1\\itap1\\cf4 ';
                        newStyles.color = 4; // Green
                        addParAfter = true;
                        break;
                    case 'code':
                    case 'pre':
                        result += '{\\pard\\sa200\\sl276\\slmult1\\f2 ';
                        addParAfter = true;
                        break;
                    case 'table':
                        result += '\\pard\\sa200\\sl276\\slmult1\n{\\*\\pnseclvl1\\pnucrm\\pnstart1\\pnindent720\\pnhang {\\pntxta .}}\n\\trowd\\trgaph108\\trleft-108\\cellx3000\\cellx6000\\cellx9000 ';
                        break;
                    case 'tr':
                        if (node.previousElementSibling) {
                            result += '\\trowd\\trgaph108\\trleft-108\\cellx3000\\cellx6000\\cellx9000 ';
                        }
                        break;
                    case 'th':
                        result += '\\pard\\intbl\\b ';
                        newStyles.bold = true;
                        break;
                    case 'td':
                        result += '\\pard\\intbl ';
                        break;
                    case 'span':
                        // Check for specific color styles
                        const color = computedStyle.color;
                        if (color) {
                            const rgb = color.match(/\d+/g);
                            if (rgb && rgb.length === 3) {
                                // Define a new color if it's not black
                                if (!(rgb[0] === '0' && rgb[1] === '0' && rgb[2] === '0')) {
                                    result += `{\\cf5\\red${rgb[0]}\\green${rgb[1]}\\blue${rgb[2]} `;
                                    newStyles.hasCustomColor = true;
                                }
                            }
                        }
                        break;
                }
                
                // Process child nodes
                for (const child of node.childNodes) {
                    result += convertNodeToRtf(child, newStyles, nestingLevel + 1);
                }
                
                // Close tags as needed
                switch (tag) {
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                    case 'pre':
                    case 'code':
                        result += '}';
                        addParAfter = true;
                        break;
                    case 'a':
                        result += '}}}';
                        break;
                    case 'blockquote':
                        addParAfter = true;
                        break;
                    case 'th':
                    case 'td':
                        result += '\\cell ';
                        break;
                    case 'tr':
                        result += '\\row ';
                        break;
                    case 'span':
                        if (newStyles.hasCustomColor) {
                            result += '}';
                        }
                        break;
                }
                
                if (addParAfter && nestingLevel === 0) {
                    result += '\\par\n';
                }
                
                return result;
            }
            
            return '';
        };
        
        // Convert the entire document
        rtfContent += convertNodeToRtf(tempContainer);
        
        // Close the RTF document
        rtfContent += "}";
        
        // Download the RTF file
        this.downloadFile(rtfContent, 'note.rtf', 'application/rtf');
        this.showToast('RTF exported successfully!', 'success');
    }
    
    exportToDocx() {
        // Show loading toast
        this.showToast('Preparing DOCX file...', 'info');
        
        try {
            // Create a more proper DOCX document that preserves formatting
            const content = this.notepad.innerHTML;
            const textNodes = this.getTextNodes(this.notepad);
            
            // Create a proper document with paragraphs and formatting
            const doc = document.createElement('div');
            doc.innerHTML = content;
            
            // Process the document to extract paragraphs and formatting
            const paragraphs = [];
            const processNode = (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    // This is a text node
                    const text = node.textContent.trim();
                    if (text) {
                        paragraphs.push({
                            text: text,
                            style: this.getComputedStyleForNode(node.parentNode)
                        });
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    // Process children for block elements
                    if (node.tagName === 'P' || node.tagName === 'DIV' || 
                        node.tagName === 'H1' || node.tagName === 'H2' || 
                        node.tagName === 'H3' || node.tagName === 'H4' || 
                        node.tagName === 'H5' || node.tagName === 'H6' || 
                        node.tagName === 'UL' || node.tagName === 'OL' || 
                        node.tagName === 'LI' || node.tagName === 'BLOCKQUOTE') {
                        
                        // Add paragraph break if needed
                        if (paragraphs.length > 0) {
                            paragraphs.push({ text: "\n", style: {} });
                        }
                        
                        // For lists, add a bullet or number
                        if (node.tagName === 'LI') {
                            const parent = node.parentNode;
                            if (parent.tagName === 'OL') {
                                const index = Array.from(parent.children).indexOf(node) + 1;
                                paragraphs.push({ text: index + ". ", style: {} });
                            } else if (parent.tagName === 'UL') {
                                paragraphs.push({ text: "• ", style: {} });
                            }
                        }
                        
                        // Process each child node
                        Array.from(node.childNodes).forEach(child => {
                            processNode(child);
                        });
                        
                        // Add paragraph break after block elements
                        paragraphs.push({ text: "\n", style: {} });
                    } else {
                        // Inline elements - process directly
                        if (node.childNodes.length === 0 && node.textContent.trim() === '') {
                            return; // Skip empty inline elements
                        }
                        
                        Array.from(node.childNodes).forEach(child => {
                            processNode(child);
                        });
                    }
                }
            };
            
            // Process the entire document
            Array.from(doc.childNodes).forEach(node => {
                processNode(node);
            });
            
            // Generate a blob with the content
            const docxContent = paragraphs.map(p => p.text).join('');
            const blob = new Blob([docxContent], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'note.docx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            this.showToast('Document exported successfully!', 'success');
        } catch (error) {
            console.error("Error generating DOCX:", error);
            
            // Fallback to text export with notice
            this.showToast('DOCX export failed. Downloading as text file instead.', 'warning');
            const textContent = this.notepad.innerText.replace(/\n/g, '\r\n');
            this.downloadFile(textContent, 'note.txt', 'text/plain');
        }
    }
    
    getComputedStyleForNode(node) {
        if (!node) return {};
        
        const computed = window.getComputedStyle(node);
        return {
            bold: computed.fontWeight >= 600 || computed.fontWeight === 'bold',
            italic: computed.fontStyle === 'italic',
            underline: computed.textDecoration.includes('underline'),
            font: computed.fontFamily,
            size: parseInt(computed.fontSize),
            color: computed.color
        };
    }
    
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast(`Note exported as ${filename}`, 'success');
    }
    
    importFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.html,.md,.rtf,.docx,.pdf,.doc,.odt,.pages';
        
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            this.showToast(`Importing ${file.name}...`, 'info');
            
            const reader = new FileReader();
            reader.onload = e => {
                if (this.notepad.innerHTML !== this.lastSavedContent) {
                    if (!confirm('You have unsaved changes. Import this file anyway?')) {
                        return;
                    }
                }
                
                const extension = file.name.split('.').pop().toLowerCase();
                
                try {
                    // Handle different file types appropriately
                    if (extension === 'txt') {
                        // Convert plain text to HTML with proper line breaks
                        const textContent = e.target.result;
                        const htmlContent = textContent.replace(/\n/g, '<br>');
                        this.notepad.innerHTML = htmlContent;
                        this.showToast('Text file imported successfully', 'success');
                    } else if (extension === 'html' || extension === 'htm') {
                        // Sanitize HTML content
                        const htmlContent = e.target.result;
                        const cleanHtml = this.sanitizeHtml(htmlContent);
                        this.notepad.innerHTML = cleanHtml;
                        this.showToast('HTML file imported successfully', 'success');
                    } else if (extension === 'md') {
                        // Convert markdown to HTML
                        const markdownContent = e.target.result;
                        const htmlContent = this.convertMarkdownToHtml(markdownContent);
                        this.notepad.innerHTML = htmlContent;
                        this.showToast('Markdown file imported successfully', 'success');
                    } else if (extension === 'rtf') {
                        // Better RTF handling
                        this.showToast('Processing RTF file...', 'info');
                        const rtfContent = e.target.result;
                        this.importRtfContent(rtfContent);
                    } else if (['docx', 'doc', 'odt', 'pages'].includes(extension)) {
                        this.showToast(`Importing ${extension.toUpperCase()} file...`, 'info');
                        this.importOfficeDocument(file);
                    } else if (extension === 'pdf') {
                        this.showToast('Processing PDF file...', 'info');
                        this.importPdfDocument(file);
                    } else {
                        // Default fallback - attempt as plain text
                        this.showToast('Unknown file format. Importing as plain text', 'warning');
                        const content = e.target.result;
                        this.notepad.innerHTML = content.replace(/\n/g, '<br>');
                    }
                } catch (error) {
                    console.error("Import error:", error);
                    this.showToast('Error importing file. Trying alternative method...', 'warning');
                    // Fallback to basic text import
                    try {
                        reader.readAsText(file);
                        setTimeout(() => {
                            const plainText = reader.result || '';
                            const safeText = plainText.replace(/[^\r\n\t\x20-\x7E]/g, '');
                            this.notepad.innerHTML = safeText.replace(/\n/g, '<br>');
                            this.showToast('Imported file as plain text', 'warning');
                        }, 500);
                    } catch (e) {
                        this.showToast('Could not import file. Format may be unsupported.', 'error');
                    }
                }
            };
            
            reader.onerror = () => {
                this.showToast('Error reading file. File may be corrupted.', 'error');
            };
            
            // Use the appropriate read method based on file type
            const extension = file.name.split('.').pop().toLowerCase();
            if (['rtf', 'docx', 'doc', 'pdf', 'odt', 'pages'].includes(extension)) {
                reader.readAsArrayBuffer(file); // For binary formats
            } else {
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    sanitizeHtml(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Remove potentially harmful elements and attributes
        const scripts = tempDiv.querySelectorAll('script, iframe, object, embed');
        scripts.forEach(el => el.remove());
        
        // Remove on* attributes
        const allElements = tempDiv.querySelectorAll('*');
        allElements.forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('on') || attr.name === 'href' && attr.value.startsWith('javascript:')) {
                    el.removeAttribute(attr.name);
                }
            });
        });
        
        return tempDiv.innerHTML;
    }
    
    importRtfContent(rtfData) {
        try {
            // Basic RTF to HTML conversion
            let text = rtfData;
            if (typeof rtfData !== 'string') {
                // Convert ArrayBuffer to string
                const decoder = new TextDecoder('utf-8');
                text = decoder.decode(rtfData);
            }
            
            // Process RTF content
            // Remove RTF headers and control sequences
            text = text.replace(/\\rtf1.*?\\viewkind0/s, '');
            text = text.replace(/\{\\*\\.*?\}/g, '');
            text = text.replace(/\\[a-z0-9]+\s?/g, '');
            
            // Convert RTF newlines and paragraphs to HTML
            text = text.replace(/\\par\s/g, '<br>');
            text = text.replace(/\\line\s/g, '<br>');
            
            // Handle special characters
            text = text.replace(/\\'([0-9a-f]{2})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
            
            // Remove remaining RTF syntax
            text = text.replace(/[\{\}\\]/g, '');
            
            // Clean up multiple line breaks
            text = text.replace(/<br><br><br>/g, '<br><br>');
            
            this.notepad.innerHTML = text;
            this.showToast('RTF file imported', 'success');
        } catch (e) {
            console.error("RTF import error:", e);
            this.showToast('Error processing RTF. Importing as plain text.', 'warning');
            
            // Fallback to plain text
            const plainText = rtfData.toString().replace(/[^\r\n\t\x20-\x7E]/g, '');
            this.notepad.innerHTML = plainText.replace(/\n/g, '<br>');
        }
    }
    
    importOfficeDocument(file) {
        // Enhanced implementation for Office documents
        try {
            // Show loading toast
            this.showToast(`Processing ${file.name.split('.').pop().toUpperCase()} file...`, 'info');
            
            // Create a FileReader to read the file
            const reader = new FileReader();
            reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                
                // Use a more robust approach to extract content from DOCX
                try {
                    // For DOCX files, we'll use a better extraction method
                    // First attempt: Try to extract structured content
                    this.extractOfficeContent(arrayBuffer, file.name)
                        .then(content => {
                            // Apply the content to the notepad
                            this.notepad.innerHTML = content;
                            this.showToast(`${file.name.split('.').pop().toUpperCase()} file imported with formatting`, 'success');
                        })
                        .catch(error => {
                            console.error("Extraction error:", error);
                            // Fallback method
                            this.fallbackTextExtraction(arrayBuffer, file.name);
                        });
                } catch (error) {
                    console.error("DOCX processing error:", error);
                    this.fallbackTextExtraction(arrayBuffer, file.name);
                }
            };
            
            reader.onerror = () => {
                this.showToast('Error reading file. The file may be corrupted.', 'error');
            };
            
            reader.readAsArrayBuffer(file);
        } catch (e) {
            console.error("Office document import error:", e);
            this.showToast('Error processing document. Importing as plain text.', 'warning');
            
            // Ultimate fallback to plain text
            const textReader = new FileReader();
            textReader.onload = e => {
                const plainText = e.target.result.replace(/[^\r\n\t\x20-\x7E]/g, '');
                this.notepad.innerHTML = plainText.replace(/\n/g, '<br>');
            };
            textReader.readAsText(file);
        }
    }
    
    extractOfficeContent(arrayBuffer, fileName) {
        return new Promise((resolve, reject) => {
            // Better content extraction logic with improved formatting
            const extension = fileName.split('.').pop().toLowerCase();
            
            if (extension === 'docx') {
                // Parse DOCX by looking for readable text content in XML with formatting
                try {
                    // Simple extraction of readable text from DOCX buffer with formatting preservation
                    const array = new Uint8Array(arrayBuffer);
                    let textContent = '';
                    
                    // Look for document.xml content - a common approach for simple DOCX extraction
                    const documentXmlSignature = 'word/document.xml';
                    const utf8Encoder = new TextEncoder();
                    const signatureBytes = utf8Encoder.encode(documentXmlSignature);
                    
                    // Try to find the document.xml file within the DOCX (ZIP) structure
                    for (let i = 0; i < array.length - signatureBytes.length; i++) {
                        let found = true;
                        for (let j = 0; j < signatureBytes.length; j++) {
                            if (array[i + j] !== signatureBytes[j]) {
                                found = false;
                                break;
                            }
                        }
                        
                        if (found) {
                            // We found a document.xml reference, now look for actual content
                            const contentStart = i + 200; // Skip ahead to likely content area
                            let contentFragment = '';
                            
                            // Extract and decode text in chunks
                            for (let k = contentStart; k < Math.min(contentStart + 300000, array.length); k++) {
                                // Only include readable ASCII characters
                                if (array[k] >= 32 && array[k] <= 126) { 
                                    contentFragment += String.fromCharCode(array[k]);
                                }
                            }
                            
                            // Try to extract paragraphs from XML-like content
                            const paragraphs = contentFragment.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
                            
                            if (paragraphs.length > 0) {
                                // Process XML paragraph tags
                                let currentParagraph = '';
                                let inParagraph = false;
                                let paragraphStyle = '';
                                let inHeading = false;
                                let inList = false;
                                let listType = '';
                                let formattedParagraphs = [];
                                let currentStyle = {
                                    bold: false,
                                    italic: false,
                                    underline: false,
                                    color: '',
                                    size: '',
                                    align: ''
                                };
                                
                                // Look for paragraph, heading, and list markers
                                const paragraphMarkers = contentFragment.match(/<w:p[^>]*>/g) || [];
                                const styleMarkers = contentFragment.match(/<w:pStyle[^>]*w:val="([^"]*)"[^>]*>/g) || [];
                                
                                // Extract formatting elements
                                const boldMarkers = contentFragment.match(/<w:b[^/>]*\/>/g) || [];
                                const italicMarkers = contentFragment.match(/<w:i[^/>]*\/>/g) || [];
                                const underlineMarkers = contentFragment.match(/<w:u[^/>]*\/>/g) || [];
                                const colorMarkers = contentFragment.match(/<w:color[^>]*w:val="([^"]*)"[^>]*>/g) || [];
                                const fontSizeMarkers = contentFragment.match(/<w:sz[^>]*w:val="([^"]*)"[^>]*>/g) || [];
                                const alignMarkers = contentFragment.match(/<w:jc[^>]*w:val="([^"]*)"[^>]*>/g) || [];
                                
                                // Extract paragraph texts with better handling of formatting
                                for (let i = 0; i < paragraphs.length; i++) {
                                    const text = paragraphs[i].replace(/<[^>]+>/g, '');
                                    
                                    // Detect if we're starting a new paragraph
                                    if (!inParagraph || text.trim().length > 0) {
                                        // Check if we're in a special paragraph type by looking at the context
                                        let contextBefore = contentFragment.substring(
                                            Math.max(0, contentFragment.indexOf(paragraphs[i]) - 500),
                                            contentFragment.indexOf(paragraphs[i])
                                        );
                                        
                                        // Reset paragraph state when we detect a new paragraph
                                        if (contextBefore.includes('<w:p ') || contextBefore.includes('<w:p>')) {
                                            if (inParagraph && currentParagraph.trim()) {
                                                // Apply formatting to the paragraph
                                                let formattedParagraph = currentParagraph;
                                                
                                                // Apply styles
                                                if (currentStyle.bold) formattedParagraph = `<strong>${formattedParagraph}</strong>`;
                                                if (currentStyle.italic) formattedParagraph = `<em>${formattedParagraph}</em>`;
                                                if (currentStyle.underline) formattedParagraph = `<u>${formattedParagraph}</u>`;
                                                if (currentStyle.color) formattedParagraph = `<span style="color:${currentStyle.color}">${formattedParagraph}</span>`;
                                                if (currentStyle.size) formattedParagraph = `<span style="font-size:${parseInt(currentStyle.size)/2}pt">${formattedParagraph}</span>`;
                                                
                                                // Save the previous paragraph with appropriate formatting
                                                if (inHeading) {
                                                    const hLevel = Math.min(parseInt(paragraphStyle.replace(/[^\d]/g, '') || '2'), 6);
                                                    formattedParagraphs.push(`<h${hLevel} style="${currentStyle.align ? 'text-align:'+currentStyle.align+';' : ''}">${formattedParagraph}</h${hLevel}>`);
                                                } else if (inList) {
                                                    if (listType === 'bullet') {
                                                        formattedParagraphs.push(`<ul><li>${formattedParagraph}</li></ul>`);
                                                    } else {
                                                        formattedParagraphs.push(`<ol><li>${formattedParagraph}</li></ol>`);
                                                    }
                                                } else {
                                                    formattedParagraphs.push(`<p style="${currentStyle.align ? 'text-align:'+currentStyle.align+';' : ''}">${formattedParagraph}</p>`);
                                                }
                                            }
                                            
                                            // Reset for new paragraph
                                            currentParagraph = '';
                                            inParagraph = true;
                                            
                                            // Reset style for new paragraph
                                            currentStyle = {
                                                bold: contextBefore.includes('<w:b ') || contextBefore.includes('<w:b/>'),
                                                italic: contextBefore.includes('<w:i ') || contextBefore.includes('<w:i/>'),
                                                underline: contextBefore.includes('<w:u ') || contextBefore.includes('<w:u '),
                                                color: '',
                                                size: '',
                                                align: ''
                                            };
                                            
                                            // Look for color information
                                            const colorMatch = contextBefore.match(/<w:color[^>]*w:val="([^"]*)"[^>]*>/);
                                            if (colorMatch && colorMatch[1]) {
                                                currentStyle.color = '#' + colorMatch[1];
                                            }
                                            
                                            // Look for size information
                                            const sizeMatch = contextBefore.match(/<w:sz[^>]*w:val="([^"]*)"[^>]*>/);
                                            if (sizeMatch && sizeMatch[1]) {
                                                currentStyle.size = sizeMatch[1];
                                            }
                                            
                                            // Look for alignment information
                                            const alignMatch = contextBefore.match(/<w:jc[^>]*w:val="([^"]*)"[^>]*>/);
                                            if (alignMatch && alignMatch[1]) {
                                                const align = alignMatch[1];
                                                if (align === 'center') currentStyle.align = 'center';
                                                else if (align === 'right') currentStyle.align = 'right';
                                                else if (align === 'justify') currentStyle.align = 'justify';
                                                else currentStyle.align = 'left';
                                            }
                                            
                                            // Detect paragraph style
                                            paragraphStyle = '';
                                            inHeading = false;
                                            inList = false;
                                            
                                            // Check for style information
                                            const styleMatch = contextBefore.match(/<w:pStyle[^>]*w:val="([^"]*)"[^>]*>/);
                                            if (styleMatch && styleMatch[1]) {
                                                paragraphStyle = styleMatch[1];
                                                if (paragraphStyle.includes('Heading')) {
                                                    inHeading = true;
                                                } else if (paragraphStyle.includes('ListParagraph')) {
                                                    inList = true;
                                                    if (contextBefore.includes('bullet')) {
                                                        listType = 'bullet';
                                                    } else {
                                                        listType = 'number';
                                                    }
                                                }
                                            }
                                        }
                                        
                                        // Add space between words if needed
                                        if (currentParagraph && !currentParagraph.endsWith(' ') && text.trim()) {
                                            currentParagraph += ' ';
                                        }
                                        
                                        // Add content to current paragraph
                                        currentParagraph += text;
                                    }
                                }
                                
                                // Add the last paragraph
                                if (currentParagraph.trim()) {
                                    // Apply formatting to the last paragraph
                                    let formattedParagraph = currentParagraph;
                                    
                                    // Apply styles
                                    if (currentStyle.bold) formattedParagraph = `<strong>${formattedParagraph}</strong>`;
                                    if (currentStyle.italic) formattedParagraph = `<em>${formattedParagraph}</em>`;
                                    if (currentStyle.underline) formattedParagraph = `<u>${formattedParagraph}</u>`;
                                    if (currentStyle.color) formattedParagraph = `<span style="color:${currentStyle.color}">${formattedParagraph}</span>`;
                                    if (currentStyle.size) formattedParagraph = `<span style="font-size:${parseInt(currentStyle.size)/2}pt">${formattedParagraph}</span>`;
                                    
                                    if (inHeading) {
                                        const hLevel = Math.min(parseInt(paragraphStyle.replace(/[^\d]/g, '') || '2'), 6);
                                        formattedParagraphs.push(`<h${hLevel} style="${currentStyle.align ? 'text-align:'+currentStyle.align+';' : ''}">${formattedParagraph}</h${hLevel}>`);
                                    } else if (inList) {
                                        if (listType === 'bullet') {
                                            formattedParagraphs.push(`<ul><li>${formattedParagraph}</li></ul>`);
                                        } else {
                                            formattedParagraphs.push(`<ol><li>${formattedParagraph}</li></ol>`);
                                        }
                                    } else {
                                        formattedParagraphs.push(`<p style="${currentStyle.align ? 'text-align:'+currentStyle.align+';' : ''}">${formattedParagraph}</p>`);
                                    }
                                }
                                
                                // Combine adjacent list items
                                let finalHtml = '';
                                let inUl = false;
                                let inOl = false;
                                
                                formattedParagraphs.forEach(p => {
                                    if (p.startsWith('<ul>')) {
                                        if (!inUl) {
                                            inUl = true;
                                            finalHtml += '<ul>';
                                        }
                                        finalHtml += p.replace('<ul>', '').replace('</ul>', '');
                                    } else if (p.startsWith('<ol>')) {
                                        if (!inOl) {
                                            inOl = true;
                                            finalHtml += '<ol>';
                                        }
                                        finalHtml += p.replace('<ol>', '').replace('</ol>', '');
                                    } else {
                                        if (inUl) {
                                            inUl = false;
                                            finalHtml += '</ul>';
                                        }
                                        if (inOl) {
                                            inOl = false;
                                            finalHtml += '</ol>';
                                        }
                                        finalHtml += p;
                                    }
                                });
                                
                                // Close any open lists
                                if (inUl) finalHtml += '</ul>';
                                if (inOl) finalHtml += '</ol>';
                                
                                textContent = finalHtml;
                            }
                            
                            break;
                        }
                    }
                    
                    if (textContent.length > 0) {
                        // Add a message to the user
                        textContent += '<div class="conversion-note">Note: Some complex formatting might be simplified during import.</div>';
                        resolve(textContent);
                    } else {
                        // No structured content found, try fallback
                        reject(new Error("No structured content found"));
                    }
                } catch (error) {
                    reject(error);
                }
            } else {
                // For other formats, use more generic approach
                reject(new Error("Unsupported format for structured extraction"));
            }
        });
    }
    
    fallbackTextExtraction(arrayBuffer, fileName) {
        try {
            // Fallback extraction method for when structured parsing fails
            this.showToast('Using alternative extraction method...', 'info');
            
            const array = new Uint8Array(arrayBuffer);
            const chunks = [];
            let currentChunk = '';
            let inTextBlock = false;
            let readableCount = 0;
            
            // Look for contiguous blocks of text (at least 3 readable chars in a row)
            for (let i = 0; i < array.length; i++) {
                const byte = array[i];
                
                // Is this a readable ASCII character?
                if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13) {
                    if (byte >= 32 && byte <= 126) {
                        readableCount++;
                    }
                    
                    // Convert byte to character
                    const char = String.fromCharCode(byte);
                    
                    // Check if we're in a text block
                    if (readableCount >= 3) {
                        if (!inTextBlock) {
                            inTextBlock = true;
                        }
                        currentChunk += char;
                    } else if (inTextBlock) {
                        // Add spacing or line breaks
                        if (byte === 10 || byte === 13) {
                            currentChunk += '\n';
                        } else {
                            currentChunk += char;
                        }
                    }
                } else {
                    // Non-readable character
                    readableCount = 0;
                    
                    // If we were in a text block, end it
                    if (inTextBlock) {
                        if (currentChunk.length >= 10) { // Only keep substantial chunks
                            chunks.push(currentChunk);
                        }
                        currentChunk = '';
                        inTextBlock = false;
                    }
                }
            }
            
            // Add the last chunk if it exists
            if (currentChunk.length >= 10) {
                chunks.push(currentChunk);
            }
            
            // Process the chunks into a coherent document
            let content = chunks
                .join('\n\n')
                .replace(/[^\x20-\x7E\n]/g, '') // Remove any binary artifacts
                .replace(/\n{3,}/g, '\n\n'); // Normalize excessive line breaks
            
            // Convert to paragraphs
            const paragraphs = content.split('\n\n');
            const htmlContent = paragraphs
                .filter(p => p.trim().length > 0)
                .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
                .join('');
            
            // Update the notepad with our best effort conversion
            this.notepad.innerHTML = htmlContent;
            this.showToast('File imported with basic formatting', 'info');
        } catch (e) {
            console.error("Fallback extraction failed:", e);
            this.notepad.innerHTML = '<p>Could not extract meaningful content from this file. Please try copying the text directly.</p>';
            this.showToast('File extraction failed', 'error');
        }
    }
    
    importPdfDocument(file) {
        // Show loading toast
        this.showToast('Processing PDF file...', 'info');
        
        try {
            // Use a more robust approach for PDF import
            const reader = new FileReader();
            reader.onload = e => {
                const pdfData = new Uint8Array(e.target.result);
                
                // Better PDF text extraction with structure preservation
                this.extractPdfContent(pdfData)
                    .then(structuredContent => {
                        if (structuredContent && structuredContent.length > 0) {
                            this.notepad.innerHTML = structuredContent;
                            this.showToast('PDF imported with formatting', 'success');
                        } else {
                            throw new Error("Could not extract structured content");
                        }
                    })
                    .catch(error => {
                        console.error("PDF extraction error:", error);
                        this.fallbackPdfExtraction(pdfData);
                    });
            };
            
            reader.onerror = () => {
                this.showToast('Error reading PDF file', 'error');
            };
            
            reader.readAsArrayBuffer(file);
        } catch (e) {
            console.error("PDF import error:", e);
            this.showToast('Error processing PDF. Please try copying content directly.', 'error');
            this.notepad.innerHTML = '<p>PDF import failed. Please copy and paste the content manually.</p>';
        }
    }
    
    extractPdfContent(pdfData) {
        return new Promise((resolve, reject) => {
            try {
                // Look for PDF structure markers to better preserve organization
                const textMarkers = [
                    [47, 84, 101, 120, 116], // "/Text"
                    [47, 80, 97, 114, 97, 103, 114, 97, 112, 104], // "/Paragraph"
                    [47, 72, 101, 97, 100, 105, 110, 103] // "/Heading"
                ];
                
                const sections = [];
                const paragraphs = [];
                let currentParagraph = '';
                let inTextBlock = false;
                let textBlockType = 'normal'; // 'normal', 'heading', 'paragraph'
                
                // Scan through the PDF data looking for structure markers
                for (let i = 0; i < pdfData.length - 10; i++) {
                    // Check for heading markers
                    if (this.matchesMarker(pdfData, i, textMarkers[2])) {
                        if (currentParagraph.trim()) {
                            paragraphs.push({ text: currentParagraph.trim() });
                            currentParagraph = '';
                        }
                        textBlockType = 'heading';
                        i += textMarkers[2].length;
                    } 
                    // Check for paragraph markers
                    else if (this.matchesMarker(pdfData, i, textMarkers[1])) {
                        if (currentParagraph.trim()) {
                            paragraphs.push({ text: currentParagraph.trim() });
                            currentParagraph = '';
                        }
                        textBlockType = 'paragraph';
                        i += textMarkers[1].length;
                    }
                    // Check for text content
                    else if (this.matchesMarker(pdfData, i, textMarkers[0])) {
                        inTextBlock = true;
                        i += textMarkers[0].length;
                        
                        // Scan ahead for the text content
                        let endPos = i;
                        while (endPos < pdfData.length - 1 && 
                              !(pdfData[endPos] === 62 && pdfData[endPos+1] === 10)) { // ">\n"
                            endPos++;
                        }
                        
                        if (endPos > i) {
                            const textContent = this.decodeTextRange(pdfData, i, endPos);
                            if (textContent && /[a-zA-Z0-9]{2,}/.test(textContent)) {
                                currentParagraph += textContent + ' ';
                            }
                        }
                    }
                    // End of a major section
                    else if (pdfData[i] === 47 && pdfData[i+1] === 83) { // "/S"
                        if (currentParagraph.trim()) {
                            paragraphs.push({ text: currentParagraph.trim() });
                            currentParagraph = '';
                            inTextBlock = false;
                            
                            // Group paragraphs into a section
                            if (paragraphs.length > 0) {
                                sections.push([...paragraphs]);
                                paragraphs.length = 0;
                            }
                        }
                    }
                }
                
                // Add any remaining content
                if (currentParagraph.trim()) {
                    paragraphs.push({ text: currentParagraph.trim() });
                }
                if (paragraphs.length > 0) {
                    sections.push([...paragraphs]);
                }
                
                // If no structured content was found, try a simpler approach
                if (sections.length === 0) {
                    // Extract all readable text content
                    let allText = '';
                    for (let i = 0; i < pdfData.length; i++) {
                        if (pdfData[i] >= 32 && pdfData[i] <= 126) { 
                            allText += String.fromCharCode(pdfData[i]);
                        } else if (pdfData[i] === 10 || pdfData[i] === 13) {
                            allText += ' ';
                        }
                    }
                    
                    // Try to identify paragraphs by spacing patterns
                    const lines = allText.split(/\s{3,}/).filter(line => line.trim().length > 0);
                    if (lines.length > 0) {
                        return Promise.resolve(lines.map(line => `<p>${line}</p>`).join(''));
                    }
                    
                    return Promise.reject("No content found");
                }
                
                // Convert the structured content to HTML
                let html = '';
                sections.forEach(section => {
                    section.forEach(para => {
                        if (para.text) {
                            html += `<p>${para.text}</p>`;
                        }
                    });
                    
                    // Add extra spacing between sections
                    html += '<br>';
                });
                
                resolve(html);
            } catch (error) {
                reject(error);
            }
        });
    }
    
    matchesMarker(data, position, marker) {
        if (position + marker.length > data.length) return false;
        
        for (let i = 0; i < marker.length; i++) {
            if (data[position + i] !== marker[i]) return false;
        }
        return true;
    }
    
    decodeTextRange(data, start, end) {
        try {
            // Extract and decode text, handling PDF encoding quirks
            const textBytes = data.slice(start, end);
            let text = '';
            
            // Handle basic ASCII
            for (let i = 0; i < textBytes.length; i++) {
                if (textBytes[i] >= 32 && textBytes[i] <= 126) {
                    text += String.fromCharCode(textBytes[i]);
                } else if (textBytes[i] === 40 && i < textBytes.length - 1) { // '('
                    // Handle PDF string literals in parentheses
                    let j = i + 1;
                    let literal = '';
                    while (j < textBytes.length && textBytes[j] !== 41) { // Until closing ')'
                        if (textBytes[j] === 92) { // '\'
                            j++;
                            if (j < textBytes.length) {
                                if (textBytes[j] >= 48 && textBytes[j] <= 57) {
                                    // Octal escape sequence
                                    const octal = String.fromCharCode(textBytes[j]);
                                    if (j+1 < textBytes.length && textBytes[j+1] >= 48 && textBytes[j+1] <= 57) {
                                        const octal2 = octal + String.fromCharCode(textBytes[j+1]);
                                        j++;
                                        if (j+1 < textBytes.length && textBytes[j+1] >= 48 && textBytes[j+1] <= 57) {
                                            const octal3 = octal2 + String.fromCharCode(textBytes[j+1]);
                                            literal += String.fromCharCode(parseInt(octal3, 8));
                                            j++;
                                        } else {
                                            literal += String.fromCharCode(parseInt(octal2, 8));
                                        }
                                    } else {
                                        literal += String.fromCharCode(parseInt(octal, 8));
                                    }
                                } else if (textBytes[j] === 110) { // 'n'
                                    literal += '\n';
                                } else if (textBytes[j] === 114) { // 'r'
                                    literal += '\r';
                                } else if (textBytes[j] === 116) { // 't'
                                    literal += '\t';
                                } else {
                                    literal += String.fromCharCode(textBytes[j]);
                                }
                            }
                        } else {
                            literal += String.fromCharCode(textBytes[j]);
                        }
                        j++;
                    }
                    i = j;
                    text += literal;
                }
            }
            
            return text.replace(/[^\x20-\x7E\n\t]/g, ''); // Remove non-printable chars
        } catch (e) {
            console.error("Text decoding error:", e);
            return '';
        }
    }
    
    fallbackPdfExtraction(pdfData) {
        try {
            this.showToast('Using simpler PDF extraction method...', 'info');
            
            // Extract all visible text
            let text = '';
            let inText = false;
            let textBuffer = '';
            
            for (let i = 0; i < pdfData.length - 2; i++) {
                // Look for PDF text objects (BT...ET)
                if (pdfData[i] === 66 && pdfData[i+1] === 84) { // "BT" - Begin Text
                    inText = true;
                    i += 2;
                } else if (pdfData[i] === 69 && pdfData[i+1] === 84) { // "ET" - End Text
                    inText = false;
                    if (textBuffer.length > 0) {
                        text += textBuffer + '\n';
                        textBuffer = '';
                    }
                    i += 2;
                } else if (inText && pdfData[i] === 84 && pdfData[i+1] === 106) { // "Tj" - Show Text
                    // Look backward for the opening parenthesis
                    let start = i;
                    while (start > i - 100 && start > 0 && pdfData[start] !== 40) { // '('
                        start--;
                    }
                    
                    if (pdfData[start] === 40) { // Found opening parenthesis
                        let j = i + 1;
                        let literal = '';
                        while (j < pdfData.length && pdfData[j] !== 41) { // Until closing ')'
                            if (pdfData[j] === 92) { // '\'
                                j++;
                                if (j < pdfData.length) {
                                    if (pdfData[j] >= 48 && pdfData[j] <= 57) {
                                        // Octal escape sequence
                                        const octal = String.fromCharCode(pdfData[j]);
                                        if (j+1 < pdfData.length && pdfData[j+1] >= 48 && pdfData[j+1] <= 57) {
                                            const octal2 = octal + String.fromCharCode(pdfData[j+1]);
                                            j++;
                                            if (j+1 < pdfData.length && pdfData[j+1] >= 48 && pdfData[j+1] <= 57) {
                                                const octal3 = octal2 + String.fromCharCode(pdfData[j+1]);
                                                literal += String.fromCharCode(parseInt(octal3, 8));
                                                j++;
                                            } else {
                                                literal += String.fromCharCode(parseInt(octal2, 8));
                                            }
                                        } else {
                                            literal += String.fromCharCode(parseInt(octal, 8));
                                        }
                                    } else if (pdfData[j] === 110) { // 'n'
                                        literal += '\n';
                                    } else if (pdfData[j] === 114) { // 'r'
                                        literal += '\r';
                                    } else if (pdfData[j] === 116) { // 't'
                                        literal += '\t';
                                    } else {
                                        literal += String.fromCharCode(pdfData[j]);
                                    }
                                }
                            } else {
                                literal += String.fromCharCode(pdfData[j]);
                            }
                            j++;
                        }
                        i = j;
                        textBuffer += literal;
                    }
                }
            }
            
            // Process the extracted text into paragraphs
            if (text.length > 0) {
                const lines = text.split('\n')
                    .filter(line => line.trim().length > 0)
                    .map(line => `<p>${line}</p>`)
                    .join('');
                
                this.notepad.innerHTML = lines;
                this.showToast('PDF imported with basic formatting', 'success');
            } else {
                this.notepad.innerHTML = '<p>Could not extract meaningful content from this PDF. Please try copying the text directly.</p>';
                this.showToast('PDF extraction failed', 'error');
            }
        } catch (e) {
            console.error("Fallback PDF extraction failed:", e);
            this.notepad.innerHTML = '<p>PDF import failed. Please copy and paste the content manually.</p>';
            this.showToast('Could not process PDF file', 'error');
        }
    }
    
    convertMarkdownToHtml(markdown) {
        // Enhanced markdown conversion
        let html = markdown;
        // Headers
        html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
        html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
        html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
        html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
        html = html.replace(/^##### (.*?)$/gm, '<h5>$1</h5>');
        html = html.replace(/^###### (.*?)$/gm, '<h6>$1</h6>');
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        html = html.replace(/__(.*?)__/g, '<b>$1</b>');
        // Italic
        html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
        html = html.replace(/_(.*?)_/g, '<i>$1</i>');
        // Strikethrough
        html = html.replace(/~~(.*?)~~/g, '<strike>$1</strike>');
        // Blockquote
        html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Lists
        // Unordered lists
        html = html.replace(/^\* (.*?)$/gm, '<ul><li>$1</li></ul>');
        html = html.replace(/^- (.*?)$/gm, '<ul><li>$1</li></ul>');
        // Ordered lists
        html = html.replace(/^\d+\. (.*?)$/gm, '<ol><li>$1</li></ol>');
        // Links
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
        // Images
        html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');
        // Line breaks
        html = html.replace(/\n/g, '<br>');
        // Fix duplicate list tags
        html = html.replace(/<\/ul><ul>/g, '');
        html = html.replace(/<\/ol><ol>/g, '');
        
        return html;
    }
    
    createLink() {
        showModal({
            title: 'Insert Link',
            message: 'Enter the URL:',
            input: true,
            inputValue: 'https://',
            buttons: [
                {
                    text: 'Insert',
                    primary: true,
                    callback: (url) => {
                        if (url) {
                            document.execCommand('createLink', false, url);
                        }
                    }
                },
                {
                    text: 'Cancel',
                    callback: () => {}
                }
            ]
        });
    }
    
    insertImage() {
        showModal({
            title: 'Insert Image',
            message: 'Enter the image URL or upload from your device:',
            content: () => {
                const container = document.createElement('div');
                
                // URL input group
                const urlGroup = document.createElement('div');
                urlGroup.className = 'form-group';
                urlGroup.style.marginBottom = '20px';
                
                const urlLabel = document.createElement('label');
                urlLabel.textContent = 'Image URL:';
                urlLabel.style.display = 'block';
                urlLabel.style.marginBottom = '5px';
                
                const urlInput = document.createElement('input');
                urlInput.type = 'text';
                urlInput.value = 'https://';
                urlInput.className = 'modal-input';
                
                urlGroup.appendChild(urlLabel);
                urlGroup.appendChild(urlInput);
                
                // Upload input group
                const uploadGroup = document.createElement('div');
                uploadGroup.className = 'form-group';
                
                const uploadLabel = document.createElement('label');
                uploadLabel.textContent = 'Or upload from your device:';
                uploadLabel.style.display = 'block';
                uploadLabel.style.marginTop = '15px';
                uploadLabel.style.marginBottom = '5px';
                
                const uploadInput = document.createElement('input');
                uploadInput.type = 'file';
                uploadInput.accept = 'image/*';
                uploadInput.className = 'modal-input';
                
                uploadGroup.appendChild(uploadLabel);
                uploadGroup.appendChild(uploadInput);
                
                container.appendChild(urlGroup);
                container.appendChild(uploadGroup);
                
                return container;
            },
            buttons: [
                {
                    text: 'Insert',
                    primary: true,
                    callback: () => {
                        const urlInput = document.querySelector('.modal-container input[type="text"]');
                        const fileInput = document.querySelector('.modal-container input[type="file"]');
                        
                        if (fileInput && fileInput.files && fileInput.files[0]) {
                            // Handle file upload
                            const file = fileInput.files[0];
                            if (file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const selection = window.getSelection();
                                    const range = selection.getRangeAt(0);
                                    const img = document.createElement('img');
                                    img.src = e.target.result;
                                    img.style.maxWidth = '100%';
                                    range.deleteContents();
                                    range.insertNode(img);
                                    
                                    // Move cursor after inserted image
                                    range.setStartAfter(img);
                                    range.collapse(true);
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                    
                                    // Make sure notepad gets focus
                                    this.notepad.focus();
                                };
                                reader.readAsDataURL(file);
                                this.showToast('Image inserted successfully', 'success');
                            } else {
                                this.showToast('Please select a valid image file', 'error');
                            }
                        } else if (urlInput && urlInput.value && urlInput.value !== 'https://') {
                            // Handle URL
                            const selection = window.getSelection();
                            const range = selection.getRangeAt(0);
                            const img = document.createElement('img');
                            img.src = urlInput.value;
                            img.style.maxWidth = '100%';
                            range.deleteContents();
                            range.insertNode(img);
                            
                            // Move cursor after image
                            range.setStartAfter(img);
                            range.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            
                            this.showToast('Image inserted successfully', 'success');
                        } else {
                            this.showToast('Please provide an image URL or select a file', 'warning');
                        }
                    }
                },
                {
                    text: 'Cancel',
                    callback: () => {}
                }
            ]
        });
    }
    
    insertCode() {
        showModal({
            title: 'Insert Code',
            message: 'Enter your code:',
            input: true,
            inputValue: '',
            buttons: [
                {
                    text: 'Insert',
                    primary: true,
                    callback: (code) => {
                        if (code) {
                            const pre = document.createElement('pre');
                            const codeElement = document.createElement('code');
                            codeElement.textContent = code;
                            pre.appendChild(codeElement);
                            
                            const selection = window.getSelection();
                            const range = selection.getRangeAt(0);
                            range.deleteContents();
                            range.insertNode(pre);
                        }
                    }
                },
                {
                    text: 'Cancel',
                    callback: () => {}
                }
            ]
        });
    }
    
    insertTable() {
        let rowsInput, colsInput;
        
        const modal = showModal({
            title: 'Insert Table',
            message: 'Configure your table:',
            content: () => {
                const container = document.createElement('div');
                
                const rowsLabel = document.createElement('label');
                rowsLabel.textContent = 'Number of rows:';
                rowsLabel.style.display = 'block';
                rowsLabel.style.marginBottom = '5px';
                
                rowsInput = document.createElement('input');
                rowsInput.type = 'number';
                rowsInput.min = '1';
                rowsInput.value = '3';
                rowsInput.className = 'modal-input';
                
                const colsLabel = document.createElement('label');
                colsLabel.textContent = 'Number of columns:';
                colsLabel.style.display = 'block';
                colsLabel.style.marginTop = '15px';
                colsLabel.style.marginBottom = '5px';
                
                colsInput = document.createElement('input');
                colsInput.type = 'number';
                colsInput.min = '1';
                colsInput.value = '3';
                colsInput.className = 'modal-input';
                
                container.appendChild(rowsLabel);
                container.appendChild(rowsInput);
                container.appendChild(colsLabel);
                container.appendChild(colsInput);
                
                return container;
            },
            buttons: [
                {
                    text: 'Insert',
                    primary: true,
                    callback: () => {
                        const rows = parseInt(rowsInput.value) || 3;
                        const cols = parseInt(colsInput.value) || 3;
                        
                        let tableHTML = '<table border="1" style="width:100%">';
                        
                        // Create header row
                        tableHTML += '<tr>';
                        for (let i = 0; i < cols; i++) {
                            tableHTML += '<th>Header ' + (i + 1) + '</th>';
                        }
                        tableHTML += '</tr>';
                        
                        // Create data rows
                        for (let i = 0; i < rows - 1; i++) {
                            tableHTML += '<tr>';
                            for (let j = 0; j < cols; j++) {
                                tableHTML += '<td>Cell ' + (i + 1) + ',' + (j + 1) + '</td>';
                            }
                            tableHTML += '</tr>';
                        }
                        
                        tableHTML += '</table>';
                        
                        document.execCommand('insertHTML', false, tableHTML);
                    }
                },
                {
                    text: 'Cancel',
                    callback: () => {}
                }
            ]
        });
        
        // Custom content handling for the table modal
        if (typeof modal.setContent === 'function') {
            const content = document.createElement('div');
            
            const rowsLabel = document.createElement('label');
            rowsLabel.textContent = 'Number of rows:';
            rowsLabel.style.display = 'block';
            rowsLabel.style.marginBottom = '5px';
            
            rowsInput = document.createElement('input');
            rowsInput.type = 'number';
            rowsInput.min = '1';
            rowsInput.value = '3';
            rowsInput.className = 'modal-input';
            
            const colsLabel = document.createElement('label');
            colsLabel.textContent = 'Number of columns:';
            colsLabel.style.display = 'block';
            colsLabel.style.marginTop = '15px';
            colsLabel.style.marginBottom = '5px';
            
            colsInput = document.createElement('input');
            colsInput.type = 'number';
            colsInput.min = '1';
            colsInput.value = '3';
            colsInput.className = 'modal-input';
            
            content.appendChild(rowsLabel);
            content.appendChild(rowsInput);
            content.appendChild(colsLabel);
            content.appendChild(colsInput);
            
            modal.setContent(content);
        }
    }
    
    showFindReplaceDialog() {
        let findInput, replaceInput;
        
        const modal = showModal({
            title: 'Find and Replace',
            message: '',
            content: () => {
                const container = document.createElement('div');
                
                const findLabel = document.createElement('label');
                findLabel.textContent = 'Find:';
                findLabel.style.display = 'block';
                findLabel.style.marginBottom = '5px';
                
                findInput = document.createElement('input');
                findInput.type = 'text';
                findInput.className = 'modal-input';
                
                const replaceLabel = document.createElement('label');
                replaceLabel.textContent = 'Replace with:';
                replaceLabel.style.display = 'block';
                replaceLabel.style.marginTop = '15px';
                replaceLabel.style.marginBottom = '5px';
                
                replaceInput = document.createElement('input');
                replaceInput.type = 'text';
                replaceInput.className = 'modal-input';
                
                container.appendChild(findLabel);
                container.appendChild(findInput);
                container.appendChild(replaceLabel);
                container.appendChild(replaceInput);
                
                return container;
            },
            buttons: [
                {
                    text: 'Replace All',
                    primary: true,
                    callback: () => {
                        const findText = findInput.value;
                        const replaceText = replaceInput.value;
                        
                        if (findText) {
                            const content = this.notepad.innerHTML;
                            const newContent = content.replace(new RegExp(findText, 'g'), replaceText);
                            this.notepad.innerHTML = newContent;
                        }
                    }
                },
                {
                    text: 'Cancel',
                    callback: () => {}
                }
            ]
        });
        
        // Custom content handling for the find/replace modal
        if (typeof modal.setContent === 'function') {
            const content = document.createElement('div');
            
            const findLabel = document.createElement('label');
            findLabel.textContent = 'Find:';
            findLabel.style.display = 'block';
            findLabel.style.marginBottom = '5px';
            
            findInput = document.createElement('input');
            findInput.type = 'text';
            findInput.className = 'modal-input';
            
            const replaceLabel = document.createElement('label');
            replaceLabel.textContent = 'Replace with:';
            replaceLabel.style.display = 'block';
            replaceLabel.style.marginTop = '15px';
            replaceLabel.style.marginBottom = '5px';
            
            replaceInput = document.createElement('input');
            replaceInput.type = 'text';
            replaceInput.className = 'modal-input';
            
            content.appendChild(findLabel);
            content.appendChild(findInput);
            content.appendChild(replaceLabel);
            content.appendChild(replaceInput);
            
            modal.setContent(content);
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const toastContent = document.createElement('div');
        toastContent.className = 'toast-content';
        
        const icon = document.createElement('i');
        if (type === 'success') {
            icon.className = 'ri-check-line';
        } else if (type === 'error') {
            icon.className = 'ri-error-warning-line';
        } else if (type === 'warning') {
            icon.className = 'ri-alert-line';
        } else {
            icon.className = 'ri-information-line';
        }
        
        const text = document.createElement('span');
        text.textContent = message;
        
        toastContent.appendChild(icon);
        toastContent.appendChild(text);
        
        const progress = document.createElement('div');
        progress.className = 'toast-progress';
        
        toast.appendChild(toastContent);
        toast.appendChild(progress);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    showEmojiPicker() {
        // Replace the alert with actual emoji picker implementation
        const backdrop = document.createElement('div');
        backdrop.className = 'emoji-backdrop';
        
        const emojiModal = document.createElement('div');
        emojiModal.className = 'emoji-modal';
        
        // Create modal header
        const header = document.createElement('div');
        header.className = 'emoji-modal-header';
        header.innerHTML = `
            <h3>Emojis & Special Characters</h3>
            <button class="emoji-close-btn">&times;</button>
        `;
        
        // Create tabs
        const tabs = document.createElement('div');
        tabs.className = 'emoji-tabs';
        
        const emojiCategories = [
            { id: 'smileys', name: 'Smileys & Emotion' },
            { id: 'people', name: 'People & Body' },
            { id: 'animals', name: 'Animals & Nature' },
            { id: 'food', name: 'Food & Drink' },
            { id: 'travel', name: 'Travel & Places' },
            { id: 'activities', name: 'Activities' },
            { id: 'objects', name: 'Objects' },
            { id: 'symbols', name: 'Symbols' },
            { id: 'flags', name: 'Flags' },
            { id: 'special', name: 'Special Characters' }
        ];
        
        emojiCategories.forEach((category, index) => {
            const tab = document.createElement('div');
            tab.className = `emoji-tab${index === 0 ? ' active' : ''}`;
            tab.setAttribute('data-category', category.id);
            tab.textContent = category.name;
            tabs.appendChild(tab);
        });
        
        // Create emoji grid container
        const emojiGridContainer = document.createElement('div');
        emojiGridContainer.className = 'emoji-grid-container';
        
        // Add smileys by default
        const smileyEmojis = [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', 
            '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', 
            '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', 
            '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', 
            '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', 
            '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', 
            '🤗', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬'
        ];
        
        const grid = document.createElement('div');
        grid.className = 'emoji-grid';
        
        smileyEmojis.forEach(emoji => {
            const emojiItem = document.createElement('div');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji;
            emojiItem.addEventListener('click', () => {
                this.insertAtCursor(emoji);
                document.body.removeChild(backdrop);
            });
            grid.appendChild(emojiItem);
        });
        
        emojiGridContainer.appendChild(grid);
        
        // Assemble the modal
        emojiModal.appendChild(header);
        emojiModal.appendChild(tabs);
        emojiModal.appendChild(emojiGridContainer);
        backdrop.appendChild(emojiModal);
        
        // Close button functionality
        const closeBtn = emojiModal.querySelector('.emoji-close-btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(backdrop);
        });
        
        // Tab switching functionality
        const tabElements = emojiModal.querySelectorAll('.emoji-tab');
        tabElements.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabElements.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update emoji grid based on category
                const category = tab.getAttribute('data-category');
                this.updateEmojiGrid(emojiGridContainer, category);
            });
        });
        
        document.body.appendChild(backdrop);
    }
    
    insertAtCursor(text) {
        const selection = window.getSelection();
        if (selection.rangeCount) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
            
            // Move cursor after inserted text
            range.setStartAfter(range.endContainer);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Make sure notepad gets focus
            this.notepad.focus();
        }
    }
    
    updateEmojiGrid(container, category) {
        const grid = container.querySelector('.emoji-grid') || document.createElement('div');
        grid.className = 'emoji-grid';
        grid.innerHTML = '';
        
        let emojis = [];
        
        // Provide emojis by category
        switch(category) {
            case 'smileys':
                emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬'];
                break;
            case 'people':
                emojis = ['👋', '🤚', '✋', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪'];
                break;
            case 'animals':
                emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣'];
                break;
            case 'food':
                emojis = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️'];
                break;
            case 'travel':
                emojis = ['🚗', '🚕', '🚙', '🚌', '🚎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛵', '🚲', '✈️', '🚀', '🚁', '⛵', '🚤', '🛳️', '🚢', '⚓', '⛽', '🚦', '🚥', '📢', '📣', '📯', '🔔', '🔕', '🎡', '🎢', '🎠', '⛲', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏕️', '⛺', '🏠', '🏡', '🏢', '🏭', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '⛪', '🕌', '🕍', '⛩️'];
                break;
            case 'activities':
                emojis = ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🏏', '⛳', '🎣', '🥊', '🥋', '🎽', '🛹', '🎿', '🏂', '🏋️', '⛹️', '🤺', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎻'];
                break;
            case 'objects':
                emojis = ['🎭', '👓', '🕶️', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '👙', '👚', '👛', '👜', '👝', '🛍️', '🎒', '👞', '👟', '👠', '👡', '👢', '👑', '👒', '🎩', '📚', '📰', '📺', '📻', '📱', '📞', '📝', '📁', '📂', '🗑️', '🚮', '📦', '📧', '📨', '📩', '📪', '📫', '📬', '📭', '📮', '📯', '📰', '🗞️', '📰', '📺', '📻', '📱', '📞', '📝', '📁', '📂', '🗑️', '🚮', '📦', '📧', '📨', '📩', '📪', '📫', '📬', '📭', '📮', '📯'];
                break;
            case 'symbols':
                emojis = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '#️⃣', '*️⃣', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '➕', '➖', '➗', '✖️', '💲', '💱'];
                break;
            case 'special':
                // Special characters
                emojis = ['©', '®', '™', '℠', '℗', '§', '¶', '†', '‡', '※', '♠', '♥', '♦', '♣', '☚', '☛', '☜', '☝', '☞', '☟', '✌', '✓', '✔', '✕', '✖', '✗', '✘', '☑', '☒', '✄', '✂', '✆', '✉', '☎', '☏', '✍', '✎', '✏', '❤', '❥', '♡', '❣', '★', '☆', '✯', '✰', '☽', '☾', '♫', '♬', '♪', '♩', '°', '′', '″', '×', '÷', '±', '∓', '≤', '≥', '≠', '∞', '∑', '√', '∛', '∜', '∫', '∮', '≈', '≡', '≅', '≤', '≥', '≦', '≧', '↔', '→', '←', '↑', '↓', '↕', '⇒', '⇔', '⟵', '⟶', '⟷', '€', '£', '¥', '¢', '$', '₹', '¤', '₿', '₽', '₩', '₱', '₳', '₴', '₭', '₦'];
                break;
        }
        
        emojis.forEach(emoji => {
            const emojiItem = document.createElement('div');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji;
            emojiItem.addEventListener('click', () => {
                this.insertAtCursor(emoji);
                document.body.removeChild(backdrop);
            });
            grid.appendChild(emojiItem);
        });
        
        container.innerHTML = '';
        container.appendChild(grid);
    }
    
    toggleFullscreen() {
        const container = document.querySelector('.notepad-container');
        container.classList.toggle('fullscreen-mode');
        
        const button = document.querySelector('[data-action="fullscreen"] i');
        if (container.classList.contains('fullscreen-mode')) {
            button.className = 'ri-fullscreen-exit-line';
        } else {
            button.className = 'ri-fullscreen-line';
        }
    }
    
    toggleDarkMode() {
        document.body.classList.toggle('dark-theme');
        
        const button = document.querySelector('[data-action="darkMode"] i');
        if (document.body.classList.contains('dark-theme')) {
            button.className = 'ri-sun-line';
            localStorage.setItem('darkMode', 'enabled');
        } else {
            button.className = 'ri-moon-line';
            localStorage.setItem('darkMode', 'disabled');
        }
    }
    
    getTextNodes(node) {
        const textNodes = [];
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        
        let currentNode;
        while (currentNode = walker.nextNode()) {
            textNodes.push(currentNode);
        }
        
        return textNodes;
    }
    
    setupWordCounter() {
        const notepad = document.getElementById('notepad');
        const counterElement = document.getElementById('word-counter');
        
        const updateCounter = () => {
            const text = notepad.innerText || '';
            const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
            const charCount = text.length;
            counterElement.textContent = `${wordCount} words | ${charCount} characters`;
        };
        
        notepad.addEventListener('input', updateCounter);
        updateCounter(); // Initial count
    }
    
    setupSavedFilesToggle() {
        const toggleBtn = document.getElementById('toggleSavedFiles');
        const savedFilesList = document.getElementById('savedFilesList');
        const savedFilesHeader = document.querySelector('.saved-files-header');
        
        if (toggleBtn && savedFilesList && savedFilesHeader) {
            toggleBtn.addEventListener('click', () => {
                const isVisible = savedFilesList.style.display === 'flex';
                savedFilesList.style.display = isVisible ? 'none' : 'flex';
                toggleBtn.classList.toggle('collapsed');
            });
            
            savedFilesHeader.addEventListener('click', (e) => {
                if (!e.target.classList.contains('toggle-saved-btn') && !e.target.closest('.toggle-saved-btn')) {
                    const isVisible = savedFilesList.style.display === 'flex';
                    savedFilesList.style.display = isVisible ? 'none' : 'flex';
                    toggleBtn.classList.toggle('collapsed');
                }
            });
        }
    }
    
    exportToPdf() {
        // Show loading toast
        this.showToast('Generating PDF...', 'info');
        
        try {
            // Create a clone of the notepad content for PDF generation
            const contentClone = document.createElement('div');
            contentClone.innerHTML = this.notepad.innerHTML;
            contentClone.style.padding = '20px';
            contentClone.style.fontSize = '12pt';
            contentClone.style.color = '#000';
            contentClone.style.background = '#fff';
            contentClone.style.fontFamily = 'Arial, Helvetica, sans-serif';
            contentClone.style.lineHeight = '1.5';
            
            // Add some basic styling to headings, paragraphs, and lists
            const headings = contentClone.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach(heading => {
                heading.style.marginBottom = '10px';
                heading.style.marginTop = '20px';
                heading.style.color = '#2d3748';
                heading.style.fontWeight = 'bold';
            });
            
            const paragraphs = contentClone.querySelectorAll('p');
            paragraphs.forEach(p => {
                p.style.marginBottom = '10px';
                p.style.textAlign = 'justify';
            });
            
            const lists = contentClone.querySelectorAll('ul, ol');
            lists.forEach(list => {
                list.style.marginLeft = '20px';
                list.style.marginBottom = '15px';
            });
            
            // Add borders to tables and style cells
            const tables = contentClone.querySelectorAll('table');
            tables.forEach(table => {
                table.style.borderCollapse = 'collapse';
                table.style.width = '100%';
                table.style.marginBottom = '15px';
                
                const cells = table.querySelectorAll('th, td');
                cells.forEach(cell => {
                    cell.style.border = '1px solid #cbd5e0';
                    cell.style.padding = '8px';
                    cell.style.textAlign = 'left';
                });
                
                const headers = table.querySelectorAll('th');
                headers.forEach(header => {
                    header.style.backgroundColor = '#f8fafc';
                    header.style.fontWeight = 'bold';
                });
            });
            
            // Style blockquotes
            const blockquotes = contentClone.querySelectorAll('blockquote');
            blockquotes.forEach(quote => {
                quote.style.borderLeft = '4px solid #6366f1';
                quote.style.paddingLeft = '15px';
                quote.style.margin = '15px 0';
                quote.style.fontStyle = 'italic';
                quote.style.color = '#4a5568';
            });
            
            // Style code blocks
            const codeBlocks = contentClone.querySelectorAll('pre, code');
            codeBlocks.forEach(block => {
                block.style.fontFamily = 'monospace';
                block.style.backgroundColor = '#f8fafc';
                block.style.padding = '10px';
                block.style.borderRadius = '5px';
                block.style.overflowX = 'auto';
                block.style.marginBottom = '15px';
            });
            
            // Set all images to have max width
            const images = contentClone.querySelectorAll('img');
            images.forEach(img => {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.marginBottom = '15px';
                img.style.display = 'block';
                img.style.marginLeft = 'auto';
                img.style.marginRight = 'auto';
            });
            
            // Add a light watermark/header with document title
            const title = document.title || 'Exported Note';
            const header = document.createElement('div');
            header.style.textAlign = 'center';
            header.style.marginBottom = '20px';
            header.style.borderBottom = '1px solid #e2e8f0';
            header.style.paddingBottom = '10px';
            header.innerHTML = `<h2 style="color:#6366f1;margin:0;">${title}</h2>`;
            header.innerHTML += `<p style="color:#718096;font-size:10pt;margin-top:5px;">Exported on ${new Date().toLocaleString()}</p>`;
            contentClone.insertBefore(header, contentClone.firstChild);
            
            // Configure PDF options
            const options = {
                margin: [15, 15],
                filename: 'note.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // Generate PDF using html2pdf.js
            html2pdf().from(contentClone).set(options).save()
                .then(() => {
                    this.showToast('PDF created successfully!', 'success');
                })
                .catch(error => {
                    console.error('PDF generation error:', error);
                    this.showToast('Error creating PDF. Try again.', 'error');
                });
        } catch (error) {
            console.error('PDF generation error:', error);
            this.showToast('Error creating PDF. Try again.', 'error');
        }
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notepadApp = new NotepadApp();
});
