import Utils from "../../utils/Utils";

export default class SearchBarView extends HTMLElement {

    private _inputEl: HTMLInputElement | null = null;
    private _searchBtnEl: HTMLButtonElement | null = null;
    private _resultsEl: HTMLDivElement | null = null;
    private _onResultClick: ((id: number) => void) | null = null;

    constructor() {
        super();
    }

    connectedCallback(): void {
        const wrapper = document.createElement('div');
        wrapper.className = 'search';

        const inner = document.createElement('div');
        inner.className = 'search-inner';

        const logo = document.createElement('span');
        logo.className = 'search-logo';
        const mark = document.createElement('span');
        mark.className = 'mark';
        mark.innerHTML = '<i class="fa-solid fa-leaf"></i>';
        logo.appendChild(mark);
        logo.append('LeafMap');

        this._inputEl = document.createElement('input');
        this._inputEl.type = 'text';
        this._inputEl.placeholder = 'Hledat parcelu podle čísla';

        this._searchBtnEl = document.createElement('button');
        this._searchBtnEl.className = 'search-search-btn';
        this._searchBtnEl.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';

        inner.appendChild(logo);
        inner.appendChild(this._inputEl);
        inner.appendChild(this._searchBtnEl);

        this._resultsEl = document.createElement('div');
        this._resultsEl.className = 'search-results';
        this._resultsEl.style.display = 'none';

        wrapper.appendChild(inner);
        wrapper.appendChild(this._resultsEl);
        this.appendChild(wrapper);

        this._inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._searchBtnEl!.click();
        });

        this.addEventListener('click', (e) => e.stopPropagation());
        this.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    onSearchClickHandler(handler: (value: string) => void) {
        this._searchBtnEl!.addEventListener('click', () => {
            handler(this._inputEl!.value);
        });
    }

    onResultClickHandler(handler: (id: number) => void) {
        this._onResultClick = handler;
    }

    showResultLoader() {
        this._resultsEl!.innerHTML = '';
        const loader = document.createElement('div');
        loader.className = 'search-result-loader';
        loader.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Hledám…';
        this._resultsEl!.appendChild(loader);
        this._resultsEl!.style.display = 'block';
    }

    renderResults(features: any[]) {
        this._resultsEl!.innerHTML = '';

        if (features.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'search-result-empty';
            empty.textContent = 'Nic nebylo nalezeno.';
            this._resultsEl!.appendChild(empty);
            this._resultsEl!.style.display = 'block';
            return;
        }

        for (const feature of features) {
            const land = feature.properties;
            const landNumber = Utils.getLandNumber(land);

            const item = document.createElement('div');
            item.className = 'search-result-item';

            const badge = document.createElement('span');
            badge.className = 'search-result-badge';
            badge.textContent = 'Parcela';

            const info = document.createElement('div');
            info.className = 'search-result-info';

            const title = document.createElement('span');
            title.className = 'search-result-title';
            title.textContent = landNumber;

            const sub = document.createElement('span');
            sub.className = 'search-result-sub';
            sub.textContent = "Kat. území: " + land.katastralniuzemiNazev;


            info.appendChild(title);
            info.appendChild(sub);
            item.appendChild(badge);
            item.appendChild(info);
            item.addEventListener('click', () => this._onResultClick!(land.id));

            this._resultsEl!.appendChild(item);
        }

        this._resultsEl!.style.display = 'block';
    }

    clearResults() {
        this._resultsEl!.innerHTML = '';
        this._resultsEl!.style.display = 'none';
        this._inputEl!.value = '';
    }
}

customElements.define('leaf-search-bar', SearchBarView);
