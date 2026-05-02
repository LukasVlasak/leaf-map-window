export default class LeafInput extends HTMLInputElement {
    private _placeholder: string;
    private _id: string;

    constructor(id: string, placeholder = '') {
        super();
        this._placeholder = placeholder;
        this._id = id;
    }

    connectedCallback() {
        this.className = 'leaf-input';
        this.type = 'text';
        this.placeholder = this._placeholder;
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
