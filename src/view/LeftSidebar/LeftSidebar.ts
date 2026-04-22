export default class LeftSidebar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback(): void {
    }
}

customElements.define('leaf-left-sidebar', LeftSidebar);
