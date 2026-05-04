export default class LeafInput extends HTMLInputElement {
    private _placeholder: string;
    private _id: string;
    private _defaultValue: string | undefined = undefined;

    constructor(id: string, placeholder = '', defaultValue?: string) {
        super();
        this._placeholder = placeholder;
        this._id = id;
        if (defaultValue) {
            this._defaultValue = defaultValue;
        }
    }

    connectedCallback() {
        this.className = 'leaf-input';
        this.type = 'text';
        this.placeholder = this._placeholder;
        if (this._defaultValue) {
            this.value = this._defaultValue;
        }
        this.id = this._id;
    }

    getValue() {
        return this.value;
    }

    setValue(val: string) {
        this.value = val;
    }

    clear() {
        this.value = '';
    }

    hide() {
        this.style.display = 'none';
    }

    show() {
        this.style.display = 'inline-block';
    }
}

customElements.define('leaf-input', LeafInput, { extends: 'input' });
