export default class MapControlView extends HTMLElement {
    private _locateBtn: HTMLButtonElement | null = null;

    constructor() {
        super();
    }

    connectedCallback(): void {
        this.className = 'br-cluster';

        const locateStack = document.createElement('div');
        locateStack.className = 'control-stack';

        this._locateBtn = document.createElement('button');
        this._locateBtn.className = 'ctl-btn';
        this._locateBtn.setAttribute('aria-label', 'Sledovat mou polohu');
        this._locateBtn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i>`;

        locateStack.appendChild(this._locateBtn);
        this.appendChild(locateStack);

        this.addEventListener('click', (e) => e.stopPropagation());
    }

    onLocateBtnClick(handler: () => void): void {
        this._locateBtn!.addEventListener('click', handler);
    }

    updateLocateBtnState(active: boolean): void {
        this._locateBtn!.classList.toggle('active', active);
    }
}

customElements.define('leaf-map-controls', MapControlView);
