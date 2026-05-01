export default class LeafButton extends HTMLButtonElement {
    private _tip: string | undefined;
    private _label: string | undefined;
    private _icon: string | undefined;
    private _active = false;

    constructor(tip?: string, label?: string, icon?: string) {
        super();
        this._tip = tip;
        this._label = label;
        this._icon = icon;
    }

    connectedCallback(): void {
        this.className = 'btn';
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
    }

    toggleActive() {
        this.classList.toggle("active");
        this._active = !this._active;
    }

    deactive() {
        this.classList.remove("active");
        this._active = false;
    }
}

customElements.define('leaf-button', LeafButton, { extends: 'button' });
