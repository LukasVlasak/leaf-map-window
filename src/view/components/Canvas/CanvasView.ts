import CanvasButton from "../Button/CanvasButton";
import CanvasInput from "../Button/CanvasInput";
import LeafButton from "../Button/LeafButton";
import type {DrawType} from "../../../model/CanvasModel";


export default class CanvasView extends HTMLElement {
    private _drawCircle: CanvasButton | undefined = undefined;
    private _drawPolygon: CanvasButton | undefined = undefined;
    private _drawLine: CanvasButton | undefined = undefined;
    private _drawPolyline: CanvasButton | undefined = undefined;
    private _addText: CanvasButton | undefined = undefined;
    private _addPoint: CanvasButton | undefined = undefined;
    private _freeDraw: CanvasButton | undefined = undefined;

    private _changeStroke: CanvasInput | undefined = undefined;
    private _changeColor: CanvasInput | undefined = undefined;
    private _changeStrokeWidth: CanvasInput | undefined = undefined;
    private _deleteActiveElement: LeafButton | undefined = undefined;

    private _saveButton: LeafButton | undefined = undefined;

    private _closeButton: CanvasButton | undefined = undefined;

    constructor() {
        super();
    }

    connectedCallback(): void {
        this.className = 'canvas-container';
        this.style.display = 'none';

        const header = document.createElement("div");
        header.className = 'canvas-header';

        const title = document.createElement("h2");
        title.textContent = 'Canvas plátno';

        this._closeButton = new CanvasButton('Zavřít', 'Zavřít', 'fa fa-times');

        header.appendChild(title);
        header.appendChild(this._closeButton);
        this.appendChild(header);

        const controlSection = document.createElement("div");
        controlSection.className = 'control-section';

        const btnsSection = document.createElement("div");

        this._drawCircle = new CanvasButton('Kreslit kruh', 'Kreslit kruh', 'fa fa-circle');
        this._drawPolygon = new CanvasButton('Kreslit polygon', 'Kreslit polygon', 'fa fa-draw-polygon');
        this._drawLine = new CanvasButton('Kreslit linii', 'Kreslit linii', 'fa fa-minus');
        this._drawPolyline = new CanvasButton('Kreslit polylinie', 'Kreslit polylinie', 'fa fa-project-diagram');
        this._addText = new CanvasButton('Přidat text', 'Přidat text', 'fa fa-font');
        this._addPoint = new CanvasButton('Přidat bod', 'Přidat bod', 'fa fa-map-marker');
        this._freeDraw = new CanvasButton('Volné kreslení', 'Volné kreslení', 'fa fa-pencil');

        btnsSection.appendChild(this._drawCircle);
        btnsSection.appendChild(this._drawPolygon);
        btnsSection.appendChild(this._drawLine);
        btnsSection.appendChild(this._drawPolyline);
        btnsSection.appendChild(this._addText);
        btnsSection.appendChild(this._addPoint);
        btnsSection.appendChild(this._freeDraw);

        const editBtnsSection = document.createElement("div");

        this._changeStroke = new CanvasInput('color', 'Změnit barvu ohraničení');
        this._changeColor = new CanvasInput('color', 'Změnit barvu výplně');
        this._changeStrokeWidth = new CanvasInput('number', 'Změnit šířku ohraničení');
        this._deleteActiveElement = new LeafButton('Odstranit aktivní element', 'Odstranit aktivní element', 'fa fa-times', true);

        editBtnsSection.appendChild(this._changeStroke);
        editBtnsSection.appendChild(this._changeColor);
        editBtnsSection.appendChild(this._changeStrokeWidth);
        editBtnsSection.appendChild(this._deleteActiveElement);

        controlSection.appendChild(btnsSection);
        controlSection.appendChild(editBtnsSection);

        this.appendChild(controlSection);

        const canvasSection = document.createElement("div");
        canvasSection.className = 'canvas-section';

        const leftSidebar = document.createElement("div");
        leftSidebar.className = 'sidebar';

        const canvas = document.createElement('canvas');
        canvas.id = 'canvas';

        const rightSidebar = document.createElement("div");
        rightSidebar.className = 'sidebar';

        canvasSection.appendChild(leftSidebar);
        canvasSection.appendChild(canvas);
        canvasSection.appendChild(rightSidebar);

        this.appendChild(canvasSection);

        const footer = document.createElement("div");
        footer.className = 'canvas-footer';

        this._saveButton = new LeafButton('Uložit plátno', 'Uložit plátno', undefined, false, true, 'Uložit');
        footer.appendChild(this._saveButton);

        this.appendChild(footer);
    }

    setContainerDimensions(width: number, height: number, left: number, top: number) {
        this.style.width = width + 'px';
        this.style.height = height + 'px';
        this.style.left = left + 'px';
        this.style.top = top + 'px';
    }

    toggleControlButtonState(type: DrawType) {
        switch (type) {
            case "circle":
                this._drawCircle!.toggleActive();
                break;
            case "polygon":
                this._drawPolygon!.toggleActive();
                break;
            case "freedraw":
                this._freeDraw!.toggleActive();
                break;
            case "polyline":
                this._drawPolyline!.toggleActive();
                break;
            case "line":
                this._drawLine!.toggleActive();
                break;
            case "point":
                this._addPoint!.toggleActive();
                break;
            case "text":
                this._addText!.toggleActive();
                break;
        }
    }

    onDrawCircleClick(handler: () => void) {
        this._drawCircle!.addEventListener('click', handler);
    }

    onDrawPolygonClick(handler: () => void) {
        this._drawPolygon!.addEventListener('click', handler);
    }

    onDrawLineClick(handler: () => void) {
        this._drawLine!.addEventListener('click', handler);
    }

    onDrawPolylineClick(handler: () => void) {
        this._drawPolyline!.addEventListener('click', handler);
    }

    onAddTextClick(handler: () => void) {
        this._addText!.addEventListener('click', handler);
    }

    onAddPointClick(handler: () => void) {
        this._addPoint!.addEventListener('click', handler);
    }

    onFreeDrawClick(handler: () => void) {
        this._freeDraw!.addEventListener('click', handler);
    }

    onCloseButtonClick(handler: () => void) {
        this._closeButton!.addEventListener('click', handler);
    }

    onDeleteActiveElementClick(handler: () => void) {
        this._deleteActiveElement!.addEventListener('click', handler);
    }

    onChangeStroke(handler: () => void) {
        this._changeStroke!.addEventListener('change', handler);
    }

    onChangeColor(handler: () => void) {
        this._changeColor!.addEventListener('change', handler);
    }

    onChangeStrokeWidth(handler: () => void) {
        this._changeStrokeWidth!.addEventListener('change', handler);
    }

    onSaveButtonClick(handler: () => void) {
        this._saveButton!.addEventListener('click', handler);
    }

    show() {
        this.style.display = 'block';
    }

    hide() {
        this.style.display = 'none';
    }

    isHidden(): boolean {
        return this.style.display === 'none';
    }
}

customElements.define('leaf-canvas-container', CanvasView);
