export default class AttributionControl extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback(): void {
    }
}

customElements.define('leaf-attribution-control', AttributionControl);
