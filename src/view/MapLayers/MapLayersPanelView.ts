import MapLayersView from "./MapLayersView";
import MapObjectsView from "../MapObjects/MapObjectsView";

export default class MapLayersPanelView extends HTMLElement {
    private _layersTabBtn: HTMLButtonElement | undefined = undefined;
    private _objectsTabBtn: HTMLButtonElement | undefined = undefined;

    private _mapLayersView: MapLayersView;
    private _mapObjectsView: MapObjectsView;

    constructor() {
        super();
        this._mapLayersView = new MapLayersView();
        this._mapObjectsView = new MapObjectsView();
    }

    connectedCallback(): void {
        this.className = 'side-panel';
        this.addEventListener('wheel', (e) => e.stopPropagation());
        this.addEventListener('mousedown', (e) => e.stopPropagation());
        this.addEventListener('dblclick', (e) => e.stopPropagation());
        this.addEventListener('touchstart', (e) => e.stopPropagation());
        this.addEventListener('click', (e) => e.stopPropagation());

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
        this._mapObjectsView.onObjectCountChange((count) => this._objectsTabBtn!.textContent = 'Objekty (' + count + ')');
        this._objectsTabBtn.textContent = 'Objekty (0)';

        tabs.appendChild(this._layersTabBtn);
        tabs.appendChild(this._objectsTabBtn);


        // body
        const body = document.createElement('div');
        body.className = 'panel-body';

        const layersPanel = document.createElement('div');
        layersPanel.appendChild(this._mapLayersView);

        const objectsPanel = document.createElement('div');
        objectsPanel.hidden = true;
        objectsPanel.appendChild(this._mapObjectsView);

        body.appendChild(layersPanel);
        body.appendChild(objectsPanel);

        this.appendChild(head);
        this.appendChild(tabs);
        this.appendChild(body);

        this._initListeners(layersPanel, objectsPanel);
    }

    get mapLayersView(): MapLayersView {
        return this._mapLayersView;
    }

    get mapObjectsView(): MapObjectsView {
        return this._mapObjectsView;
    }

    _initListeners(layersPanel: HTMLDivElement, objectsPanel: HTMLDivElement) {
        this._layersTabBtn!.addEventListener('click', () => {
            if (this.classList.contains('collapsed')) {
                this.classList.remove('collapsed');
            }
            this._layersTabBtn!.classList.add('active');
            this._objectsTabBtn!.classList.remove('active');
            layersPanel!.hidden = false;
            objectsPanel!.hidden = true;

            // deselect obj
            this._mapObjectsView.deselectObject();
        });

        this._objectsTabBtn!.addEventListener('click', () => {
            this._objectsTabBtn!.classList.add('active');
            this._layersTabBtn!.classList.remove('active');
            objectsPanel!.hidden = false;
            layersPanel!.hidden = true;
        });
    }
}

customElements.define('leaf-map-layers', MapLayersPanelView);
