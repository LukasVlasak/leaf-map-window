export default class MapLayersView extends HTMLElement {
    private _baseLayerList: HTMLDivElement | undefined = undefined;
    private _overlayLayerList: HTMLDivElement | undefined = undefined;

    constructor() {
        super();
    }

    connectedCallback(): void {
        const baseSectionHead = document.createElement('div');
        baseSectionHead.className = 'panel-section-head';
        const baseSectionTitle = document.createElement('div');

        baseSectionTitle.className = 'panel-section-title';
        baseSectionTitle.textContent = 'Podkladové vrstvy';
        baseSectionHead.appendChild(baseSectionTitle);

        this._baseLayerList = document.createElement('div');
        const overlaySectionHead = document.createElement('div');
        overlaySectionHead.className = 'panel-section-head';

        const overlaySectionTitle = document.createElement('div');
        overlaySectionTitle.className = 'panel-section-title';
        overlaySectionTitle.textContent = 'Překryvné vrstvy';
        overlaySectionHead.appendChild(overlaySectionTitle);

        this._overlayLayerList = document.createElement('div');

        this.appendChild(baseSectionHead);
        this.appendChild(this._baseLayerList);
        this.appendChild(overlaySectionHead);
        this.appendChild(this._overlayLayerList);
    }
}

customElements.define('leaf-map-layer-list', MapLayersView);
