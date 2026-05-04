export default class LeafSlider extends HTMLElement {
    private _min: number;
    private _max: number;
    private _value: number;
    private _unit: string;
    private _input!: HTMLInputElement;
    private _valSpan!: HTMLSpanElement;
    private _onChangeHandler: ((value: number) => void) | undefined;

    constructor(min: number, max: number, value: number, unit: string = '') {
        super();
        this._min = min;
        this._max = max;
        this._value = value;
        this._unit = unit;
    }

    connectedCallback() {
        this.className = 'field-range-row';

        this._input = document.createElement('input');
        this._input.type = 'range';
        this._input.className = 'slider';
        this._input.min = String(this._min);
        this._input.max = String(this._max);
        this._input.value = String(this._value);

        this._valSpan = document.createElement('span');
        this._valSpan.className = 'slider-val';
        this._valSpan.textContent = this._value + this._unit;

        this._input.addEventListener('input', () => {
            this._valSpan.textContent = this._input.value + this._unit;
            this._onChangeHandler?.(parseInt(this._input.value));
        });

        this.appendChild(this._input);
        this.appendChild(this._valSpan);
    }

    getValue(): number {
        return Number(this._input.value);
    }

    onChange(handler: (value: number) => void) {
        this._onChangeHandler = handler;
    }
}

customElements.define('leaf-slider', LeafSlider);
