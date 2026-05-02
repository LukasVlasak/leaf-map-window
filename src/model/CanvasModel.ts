import type ObjectStore from "../store/ObjectStore";
import {fabric} from "fabric";
import type CanvasView from "../view/components/Canvas/CanvasView";

export type DrawType = "circle" | "polygon" | "line" | "polyline" | "point" | "text" | "freedraw";

export default class CanvasModel {
    private _fabricCanvas;

    private _objectStore: ObjectStore;
    private _canvasView: CanvasView;

    private _drawingMode: DrawType | undefined = undefined;

    constructor(objectStore: ObjectStore, canvasView: CanvasView) {
        this._fabricCanvas = new fabric.Canvas('canvas');

        this._objectStore = objectStore;
        this._canvasView = canvasView;

        this.initListeners();
    }

    initListeners() {
        this._canvasView.onDrawCircleClick(() => {
            this._canvasView.toggleControlButtonState("circle");
            this._drawingMode = "circle";
        });
    }

    initCanvas() {

    }

    saveCanvas() {

    }

    toggleCanvasVisibility(map: L.Map) {
        if (this._canvasView.isHidden()) {
            this._canvasView.show();
            const width = map.getSize().x - 300;
            const height = map.getSize().y - 200;
            this._canvasView.setContainerDimensions(width, height, 150, 100);

            this._fabricCanvas.setWidth(width - 30); // 15px is sidebar width
            // 97px is canvas-header height
            // 80px is control-section and canvas-footer height
            this._fabricCanvas.setHeight(height - 97 - 80 - 80);
        } else {
            this.onCanvasClose();
        }
    }

    onCanvasClose() {
        this._canvasView.hide();
    }
}