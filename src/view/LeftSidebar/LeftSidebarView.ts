import LeafButton from "../components/Button/LeafButton";

export default class LeftSidebarView extends HTMLElement {
    private _polygonBtn: LeafButton | undefined = undefined;
    private _lineBtn: LeafButton | undefined = undefined;
    private _freedrawBtn: LeafButton | undefined = undefined;
    private _canvasBtn: LeafButton | undefined = undefined;
    private _measureBtn: LeafButton | undefined = undefined;
    private _importBtn: LeafButton | undefined = undefined;
    private _exportBtn: LeafButton | undefined = undefined;

    constructor() {
        super();
    }

    connectedCallback(): void {
        this.className = 'tools';
        this.setAttribute('role', 'toolbar');
        this.setAttribute('aria-label', 'Nástroje');

        const firstGroup = document.createElement('div');
        firstGroup.className = 'tool-group';

        this._polygonBtn = new LeafButton('Kreslit polygon', 'Kreslit polygon', 'fa fa-draw-polygon');
        this._lineBtn = new LeafButton('Kreslit polyline', 'Kreslit polyline', 'fa fa-bezier-curve');
        this._freedrawBtn = new LeafButton('Volné kreslení', 'Volné kreslení', 'fa fa-pencil');
        this._canvasBtn = new LeafButton('Canvas (plátno)', 'Canvas kreslení', 'fa fa-object-group');

        firstGroup.appendChild(this._polygonBtn);
        firstGroup.appendChild(this._lineBtn);
        firstGroup.appendChild(this._freedrawBtn);
        firstGroup.appendChild(this._canvasBtn);

        this.appendChild(firstGroup);

        const secondGroup = document.createElement('div');
        secondGroup.className = 'tool-group';

        this._measureBtn = new LeafButton('Měření vzdálenosti', 'Měření', 'fa fa-ruler');

        secondGroup.appendChild(this._measureBtn);
        this.appendChild(secondGroup);


        const thirdGroup = document.createElement('div');
        thirdGroup.className = 'tool-group';

        this._importBtn = new LeafButton('Import dat (GeoJSON, KML…)', 'Import', 'fa fa-download');
        this._exportBtn = new LeafButton('Export objektů', 'Export', 'fa fa-upload');

        thirdGroup.appendChild(this._importBtn);
        thirdGroup.appendChild(this._exportBtn);
        this.appendChild(thirdGroup);
    }

    onPolygonClick(handler: () => void) {
        this._polygonBtn!.addEventListener('click', handler);
    }
    onPolylineClick(handler: () => void) {
        this._lineBtn!.addEventListener('click', handler);
    }
    onFreedrawClick(handler: (e: MouseEvent) => void) {
        this._freedrawBtn!.addEventListener('click', handler);
    }
    onCanvasClick(handler: () => void) {
        this._canvasBtn!.addEventListener('click', handler);
    }
    onMeasureClick(handler: () => void) {
        this._measureBtn!.addEventListener('click', handler);
    }
    onImportClick(handler: () => void) {
        this._importBtn!.addEventListener('click', handler);
    }
    onExportClick(handler: () => void) {
        this._exportBtn!.addEventListener('click', handler);
    }

    toggleToolBtnState(type: "polygon" | "polyline" | "freedraw" | "measure" | "canvas") {
        switch (type) {
            case "polygon":
                this._polygonBtn!.toggleActive();
                break;
            case "polyline":
                this._lineBtn!.toggleActive();
                break;
            case "freedraw":
                this._freedrawBtn!.toggleActive();
                break;
            case "measure":
                this._measureBtn!.toggleActive();
                break;
            case "canvas":
                this._canvasBtn!.toggleActive();
                break;
        }
    }

    deactivateToolBtns(doNotDeactivate?: "polygon" | "polyline" | "freedraw" | "measure" | "canvas") {
        if (doNotDeactivate !== "polygon") {
            this._polygonBtn!.deactive();
        }
        if (doNotDeactivate !== "polyline") {
            this._lineBtn!.deactive();
        }
        if (doNotDeactivate !== "freedraw") {
            this._freedrawBtn!.deactive();
        }
        if (doNotDeactivate !== "canvas") {
            this._canvasBtn!.deactive();
        }
        if (doNotDeactivate !== "measure") {
            this._measureBtn!.deactive();
        }
    }
}

customElements.define('leaf-left-sidebar', LeftSidebarView);
