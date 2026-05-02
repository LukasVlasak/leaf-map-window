export default class CanvasInputButton extends HTMLInputElement {
    private _tip: string | undefined;
    private _inputType: 'color' | 'number';

    constructor(inputType: 'color' | 'number', tip?: string) {
        super();
        this._inputType = inputType;
        this._tip = tip;
    }

    connectedCallback(): void {
        this.type = this._inputType;
        this.className = 'canvas-input';

        if (this._tip) {
            this.setAttribute('aria-label', this._tip);
            this.title = this._tip;
        }
    }
}

customElements.define('canvas-input', CanvasInputButton, { extends: 'input' });
