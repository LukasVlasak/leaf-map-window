export default class MapLayersView extends HTMLElement {
    private _layersTabBtn: HTMLButtonElement | undefined = undefined;
    private _objectsTabBtn: HTMLButtonElement | undefined = undefined;
    
    private _baseLayerList: HTMLDivElement | undefined = undefined;
    private _overlayLayerList: HTMLDivElement | undefined = undefined;
    private _objectList: HTMLDivElement | undefined = undefined;

    constructor() {
        super();
    }

    connectedCallback(): void {
        this.className = 'side-panel';

        // header
        const head = document.createElement('div');
        head.className = 'panel-head';

        const title = document.createElement('div');
        title.className = 'panel-title';
        title.textContent = 'Vrstvy a objekty';

        const panelIcon = document.createElement('div');
        panelIcon.className = 'arrow';
        const arrowIcon = document.createElement('i');
        arrowIcon.className = 'fa fa-chevron-down';
        panelIcon.appendChild(arrowIcon);
        head.addEventListener('click', () => this.classList.toggle('collapsed'));

        head.appendChild(title);
        head.appendChild(panelIcon);


        // tabs
        const tabs = document.createElement('div');
        tabs.className = 'panel-tabs';
        tabs.setAttribute('role', 'tablist');

        this._layersTabBtn = document.createElement('button');
        this._layersTabBtn.className = 'panel-tab active';
        this._layersTabBtn.setAttribute('role', 'tab');
        this._layersTabBtn.textContent = 'Mapové vrstvy';

        this._objectsTabBtn = document.createElement('button');
        this._objectsTabBtn.className = 'panel-tab';
        this._objectsTabBtn.setAttribute('role', 'tab');
        this._objectsTabBtn.textContent = 'Objekty';

        tabs.appendChild(this._layersTabBtn);
        tabs.appendChild(this._objectsTabBtn);


        // body
        const body = document.createElement('div');
        body.className = 'panel-body';

        const layersPanel = document.createElement('div');

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

        layersPanel.appendChild(baseSectionHead);
        layersPanel.appendChild(this._baseLayerList);
        layersPanel.appendChild(overlaySectionHead);
        layersPanel.appendChild(this._overlayLayerList);

        const objectsPanel = document.createElement('div');
        objectsPanel.hidden = true;
        this._objectList = document.createElement('div');
        this._setObjectListToEmpty();

        objectsPanel.appendChild(this._objectList);

        body.appendChild(layersPanel);
        body.appendChild(objectsPanel);

        this.appendChild(head);
        this.appendChild(tabs);
        this.appendChild(body);

        this._initListeners(layersPanel, objectsPanel);
    }

    _setObjectListToEmpty() {
        this._objectList!.innerHTML = `
            <div class="empty">
                <div>Zatím nejsou nakreslené<br/>žádné objekty.</div>
            </div>
        `;
    }

    _initListeners(layersPanel: HTMLDivElement, objectsPanel: HTMLDivElement) {
        this._layersTabBtn!.addEventListener('click', () => {
            this._layersTabBtn!.classList.add('active');
            this._objectsTabBtn!.classList.remove('active');
            layersPanel!.hidden = false;
            objectsPanel!.hidden = true;
        });

        this._objectsTabBtn!.addEventListener('click', () => {
            this._objectsTabBtn!.classList.add('active');
            this._layersTabBtn!.classList.remove('active');
            objectsPanel!.hidden = false;
            layersPanel!.hidden = true;
        });
    }
}

customElements.define('leaf-map-layers', MapLayersView);
