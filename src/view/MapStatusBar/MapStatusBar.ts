export default class MapStatusBar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback(): void {
    }
}

customElements.define('leaf-map-status-bar', MapStatusBar);
