import LeafButton from "./LeafButton";

export default class CanvasButton extends LeafButton {
    constructor(tip?: string, label?: string, icon?: string) {
        super(tip, label, icon);
    }

    connectedCallback() {
        super.connectedCallback();

        this.classList.remove('btn');
        this.classList.add('canvas-btn');
    }
}

customElements.define('canvas-button', CanvasButton, { extends: 'button' });
