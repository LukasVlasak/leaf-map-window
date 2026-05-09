export default class AttributionControlView extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback(): void {
        this.className = 'attr';
        this.innerHTML = `© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a> | <a href="https://leafletjs.com" target="_blank">Leaflet</a> | <a href="https://fontawesome.com" target="_blank">Font Awesome</a>`;
        this.addEventListener('click', (e) => e.stopPropagation());
    }
}

customElements.define('leaf-attribution-control', AttributionControlView);
