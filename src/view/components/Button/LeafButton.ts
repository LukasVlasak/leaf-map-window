export default class LeafButton extends HTMLButtonElement {
    private _tip: string | undefined;
    private _label: string | undefined;
    private _icon: string | undefined;
    private _active = false;
    private _deleteButton: boolean;
    private _saveButton: boolean;
    private _text: string | undefined;

    constructor(tip?: string, label?: string, icon?: string, deleteButton?: boolean, saveButton?: boolean, text?: string) {
        super();
        this._tip = tip;
        this._label = label;
        this._icon = icon;
        this._deleteButton = deleteButton ?? false;
        this._saveButton = saveButton ?? false;
        this._text = text;
    }

    connectedCallback(): void {
        this.className = 'btn';
        if (this._deleteButton) this.classList.add('btn-delete');
        if (this._saveButton) this.classList.add('btn-save');
        if (this._label) {
            this.setAttribute('aria-label', this._label);
        }

        if (this._tip) {
            this.dataset.tip = this._tip;
        }

        if (this._icon) {
            const iconEl = document.createElement('i');
            iconEl.className = this._icon;
            this.appendChild(iconEl);
        }

        if (this._text) {
            this.classList.add('text-button');
            this.textContent = this._text;
        }
    }

    toggleActive() {
        this.classList.toggle("active");
        this._active = !this._active;
    }

    deactive() {
        this.classList.remove("active");
        this._active = false;
    }

    disable() {
        this.disabled = true;
    }

    enable() {
        this.disabled = false;
    }
}

customElements.define('leaf-button', LeafButton, { extends: 'button' });
