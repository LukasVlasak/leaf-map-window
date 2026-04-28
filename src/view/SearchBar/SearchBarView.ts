export default class SearchBarView extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback(): void {
    }
}

customElements.define('leaf-search-bar', SearchBarView);
