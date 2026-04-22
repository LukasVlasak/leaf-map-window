export default class SearchBar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback(): void {
    }
}

customElements.define('leaf-search-bar', SearchBar);
