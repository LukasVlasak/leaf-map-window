export default class LeftSidebarView extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback(): void {
    }
}

customElements.define('leaf-left-sidebar', LeftSidebarView);
