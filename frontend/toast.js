class Toast {
    constructor() {
        this.toastElement = null;
        this.autoCloseTimeout = null;
    }

    show(message, type = 'info') {
        if (this.toastElement) {
            this.toastElement.remove();
            clearTimeout(this.autoCloseTimeout);
        }

        this.toastElement = document.createElement('div');
        this.toastElement.className = `toast toast-${type}`;
        
        const icon = document.createElement('i');
        icon.className = this.getIconClass(type);
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;

        this.toastElement.appendChild(icon);
        this.toastElement.appendChild(messageSpan);
        document.body.appendChild(this.toastElement);

        // Force reflow
        this.toastElement.offsetHeight;

        requestAnimationFrame(() => {
            this.toastElement.classList.add('show');
        });

        this.autoCloseTimeout = setTimeout(() => {
            this.hide();
        }, 3000);
    }

    hide() {
        if (!this.toastElement) return;

        this.toastElement.classList.remove('show');
        setTimeout(() => {
            this.toastElement.remove();
            this.toastElement = null;
        }, 300);
    }

    getIconClass(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

const toast = new Toast();
