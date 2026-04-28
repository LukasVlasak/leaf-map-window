export default class MapLayersView extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback(): void {
    }
}

customElements.define('leaf-map-layers', MapLayersView);
