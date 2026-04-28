export default class MapStatusBarView extends HTMLElement {

    private _mouseLocationInfoValueEl: HTMLSpanElement | null = null;
    private _zoomInfoValueEl: HTMLSpanElement | null = null;
    private _scaleInfoValueEl: HTMLSpanElement | null = null;
    private _scaleInfoBorderValueEl: HTMLSpanElement | null = null;

    constructor() {
        super();
    }

    connectedCallback(): void {
        const infoBar = document.createElement("div");
        infoBar.className = 'info-bar';

        const mouseLocationInfo = document.createElement("div");
        mouseLocationInfo.className = 'info-item';
        const mouseLocationInfoLabel = document.createElement("span");
        mouseLocationInfoLabel.className = 'info-label';
        mouseLocationInfoLabel.textContent = 'Poloha';
        this._mouseLocationInfoValueEl = document.createElement("span");
        this._mouseLocationInfoValueEl.className = 'info-value';

        const zoomInfo = document.createElement("div");
        zoomInfo.className = 'info-item';
        const zoomInfoLabel = document.createElement("span");
        zoomInfoLabel.className = 'info-label';
        zoomInfoLabel.textContent = 'Zoom';
        this._zoomInfoValueEl = document.createElement("span");
        this._zoomInfoValueEl.className = 'info-value';

        const scaleInfo = document.createElement("div");
        scaleInfo.className = 'info-item';
        const scaleInfoLabel = document.createElement("span");
        scaleInfoLabel.className = 'info-label';
        scaleInfoLabel.textContent = 'Měřítko';
        this._scaleInfoValueEl = document.createElement("span");
        this._scaleInfoValueEl.className = 'info-value';
        this._scaleInfoBorderValueEl = document.createElement("span");
        this._scaleInfoBorderValueEl.className = 'scale-graphics';

        mouseLocationInfo.appendChild(mouseLocationInfoLabel);
        mouseLocationInfo.appendChild(this._mouseLocationInfoValueEl);

        zoomInfo.appendChild(zoomInfoLabel);
        zoomInfo.appendChild(this._zoomInfoValueEl);

        scaleInfo.appendChild(scaleInfoLabel);
        scaleInfo.appendChild(this._scaleInfoValueEl);
        scaleInfo.appendChild(this._scaleInfoBorderValueEl);

        infoBar.appendChild(mouseLocationInfo);
        infoBar.appendChild(this._createSeperator());
        infoBar.appendChild(zoomInfo);
        infoBar.appendChild(this._createSeperator());
        infoBar.appendChild(scaleInfo);

        this.appendChild(infoBar);
    }

    private _createSeperator(): HTMLDivElement {
        const seperator = document.createElement("div");
        seperator.className = 'info-sep';
        return seperator;
    }

    updateZoomBar(zoom: number) {
        this._zoomInfoValueEl!.textContent = zoom.toString();
    }

    updateMouseLocationBar(latLng: L.LatLng) {
        this._mouseLocationInfoValueEl!.textContent = latLng.lat.toFixed(4) + "° N, " + latLng.lng.toFixed(4) + "° E";
    }

    updateScaleBar(borderLength: number, label: string) {
        this._scaleInfoValueEl!.textContent = label;
        this._scaleInfoBorderValueEl!.style.width = borderLength.toString() + 'px';
    }
}

customElements.define('leaf-map-status-bar', MapStatusBarView);
