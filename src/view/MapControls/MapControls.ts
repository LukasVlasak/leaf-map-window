export default class MapControls extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback(): void {
    }
}

customElements.define('leaf-map-controls', MapControls);
