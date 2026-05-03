import CanvasButton from "../Button/CanvasButton";
import CanvasInputButton from "../Button/CanvasInputButton";
import LeafButton from "../Button/LeafButton";
import type {DrawType} from "../../../model/CanvasModel";
import LeafInput from "../Input/LeafInput";


export default class CanvasView extends HTMLElement {
    private _drawCircle: CanvasButton | undefined = undefined;
    private _drawPolygon: CanvasButton | undefined = undefined;
    private _drawLine: CanvasButton | undefined = undefined;
    private _drawPolyline: CanvasButton | undefined = undefined;
    private _addText: CanvasButton | undefined = undefined;
    private _addPoint: CanvasButton | undefined = undefined;
    private _freeDraw: CanvasButton | undefined = undefined;

    private _changeStroke: CanvasInputButton | undefined = undefined;
    private _changeColor: CanvasInputButton | undefined = undefined;
    private _changeStrokeWidth: CanvasInputButton | undefined = undefined;
    private _deleteActiveElement: LeafButton | undefined = undefined;

    private _savePathButton: CanvasButton | undefined = undefined;
    private _cancelPathButton: CanvasButton | undefined = undefined;

    private _textInput: LeafInput | undefined = undefined;
    private _saveTextBtn: LeafButton | undefined = undefined;

    private _saveButton: LeafButton | undefined = undefined;

    private _closeButton: CanvasButton | undefined = undefined;

    private _htmlCanvas: HTMLCanvasElement | undefined = undefined;

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

        this._initDrag(header);

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
        this._savePathButton = new LeafButton('Uložit volné kreslení', 'Uložit volné kreslení', 'fa fa-check', false, true);
        this._savePathButton.style.marginRight = '5px';
        this._cancelPathButton = new LeafButton('Smazat aktuálně nakreslené linie', 'Smazat aktuálně nakreslené linie', 'fa fa-times', true);
        this._textInput = new LeafInput('canvasText', 'Váš text');
        this._textInput.style.marginRight = '5px';
        this._saveTextBtn = new LeafButton('Uložit text', 'Uložit text', 'fa fa-check', false, true);

        this._savePathButton!.hide();
        this._cancelPathButton!.hide();
        this._textInput!.hide();
        this._saveTextBtn!.hide();

        btnsSection.appendChild(this._drawCircle);
        btnsSection.appendChild(this._drawPolygon);
        btnsSection.appendChild(this._drawLine);
        btnsSection.appendChild(this._drawPolyline);
        btnsSection.appendChild(this._addText);
        btnsSection.appendChild(this._addPoint);
        btnsSection.appendChild(this._freeDraw);
        btnsSection.appendChild(this._savePathButton);
        btnsSection.appendChild(this._cancelPathButton);
        btnsSection.appendChild(this._textInput);
        btnsSection.appendChild(this._saveTextBtn);

        const editBtnsSection = document.createElement("div");

        this._changeStroke = new CanvasInputButton('color', 'Změnit barvu ohraničení');
        this._changeColor = new CanvasInputButton('color', 'Změnit barvu výplně');
        this._changeStrokeWidth = new CanvasInputButton('number', 'Změnit šířku ohraničení');
        this._changeStrokeWidth.min = "1";
        this._deleteActiveElement = new LeafButton('Odstranit aktivní element', 'Odstranit aktivní element', 'fa fa-times', true);

        this._changeStroke.disable();
        this._changeColor.disable();
        this._changeStrokeWidth.disable();
        this._deleteActiveElement.disable();

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

        this._htmlCanvas = document.createElement('canvas');
        this._htmlCanvas.id = 'canvas';

        const rightSidebar = document.createElement("div");
        rightSidebar.className = 'sidebar';

        canvasSection.appendChild(leftSidebar);
        canvasSection.appendChild(this._htmlCanvas);
        canvasSection.appendChild(rightSidebar);

        this.appendChild(canvasSection);

        const footer = document.createElement("div");
        footer.className = 'canvas-footer';

        this._saveButton = new LeafButton('Uložit plátno', 'Uložit plátno', undefined, false, true, 'Uložit');
        this._saveButton.disable();
        footer.appendChild(this._saveButton);

        this.appendChild(footer);
    }

    private _initDrag(handle: HTMLElement): void {
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        const onMouseMove = (e: MouseEvent) => {
            const left = startLeft + (e.clientX - startX);

            // 10 for some padding
            if (left >= 10 && left + parseInt(this.style.width) < window.innerWidth - 10) {
                this.style.left = left + 'px';   
            }

            const top = startTop + (e.clientY - startY);
            if (top >= 10 && top + parseInt(this.style.height) < window.innerHeight - 10) {
                this.style.top = top + 'px';
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.userSelect = '';
        };

        handle.addEventListener('mousedown', (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest('button')) return;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(this.style.left) || 0;
            startTop = parseInt(this.style.top) || 0;
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
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

    deactivateControlButtons(doNotDeactivate?: DrawType) {
        if (doNotDeactivate !== "circle") {
            this._drawCircle!.deactive();
        }
        if (doNotDeactivate !== "polygon") {
            this._drawPolygon!.deactive();
        }
        if (doNotDeactivate !== "line") {
            this._drawLine!.deactive();
        }
        if (doNotDeactivate !== "polyline") {
            this._drawPolyline!.deactive();
        }
        if (doNotDeactivate !== "text") {
            this._addText!.deactive();
        }
        if (doNotDeactivate !== "point") {
            this._addPoint!.deactive();
        }
        if (doNotDeactivate !== "freedraw") {
            this._freeDraw!.deactive();
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

    onChangeStroke(handler: (e: Event) => void) {
        this._changeStroke!.addEventListener('input', handler);
    }

    onChangeColor(handler: (e: Event) => void) {
        this._changeColor!.addEventListener('input', handler);
    }

    onChangeStrokeWidth(handler: (e: Event) => void) {
        this._changeStrokeWidth!.addEventListener('input', handler);
    }

    onSaveButtonClick(handler: () => void) {
        this._saveButton!.addEventListener('click', handler);
    }

    onSavePathClick(handler: () => void) {
        this._savePathButton!.addEventListener('click', handler);
    }

    onCancelPathClick(handler: () => void) {
        this._cancelPathButton!.addEventListener('click', handler);
    }

    onSaveTextClick(handler: () => void) {
        this._saveTextBtn!.addEventListener('click', handler);
    }

    showPathButtons() {
        this._cancelPathButton!.show();
        this._savePathButton!.show();
    }

    hidePathButtons() {
        this._cancelPathButton!.hide();
        this._savePathButton!.hide();
    }

    getTextInput(): LeafInput {
        return this._textInput!;
    }

    hideSaveTextBtn() {
        this._saveTextBtn!.hide();
    }

    showSaveTextBtn() {
        this._saveTextBtn!.show();
    }

    disableSaveBtn() {
        this._saveButton!.disable();
    }

    enableSaveBtn() {
        this._saveButton!.enable();
    }

    disableDeleteActiveElBtn() {
        this._deleteActiveElement!.disable();
    }

    enableDeleteActiveElBtn() {
        this._deleteActiveElement!.enable();
    }

    getChangeStrokeInput() {
        return this._changeStroke!;
    }

    getChangeColorInput() {
        return this._changeColor!;
    }

    getChangeStrokeWidhtInput() {
        return this._changeStrokeWidth!;
    }

    getHTMLCanvas() {
        return this._htmlCanvas!;
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
