import type ObjectStore from "../store/ObjectStore";
import {fabric} from "fabric";
import type CanvasView from "../view/components/Canvas/CanvasView";
import type {IEvent} from "fabric/fabric-impl";

const DEFAULT_CIRCLE_OPTIONS = {
    radius: 1,
    fill: '#1b11d9',
    stroke: '#000',
    strokeWidth: 3,
    originX: 'center',
    originY: 'center',
    id: 'circle'
}

const DEFAULT_POLYGON_OPTIONS = {
    width: 1,
    height: 1,
    fill: '#11d94d',
    stroke: '#000',
    strokeWidth: 3,
    id: 'polygon'
}

const DEFAULT_LINE_OPTIONS = {
    stroke: '#000',
    strokeWidth: 3,
    id: 'line'
}

const DEFAULT_POINT_OPTIONS = {
    radius: 5,
    fill: '#000',
    originX: 'center',
    originY: 'center',
    id: 'point'
}

export type DrawType = "circle" | "polygon" | "line" | "polyline" | "point" | "text" | "freedraw";

export default class CanvasModel {
    private _fabricCanvas;

    private _objectStore: ObjectStore;
    private _canvasView: CanvasView;

    private _drawingMode: DrawType | undefined = undefined;
    private _currDrawObject: undefined | fabric.Object = undefined;

    constructor(objectStore: ObjectStore, canvasView: CanvasView) {
        this._fabricCanvas = new fabric.Canvas('canvas');

        this._objectStore = objectStore;
        this._canvasView = canvasView;

        this.initListeners();
    }

    initListeners() {
        this._fabricCanvas.on('mouse:down', this._onCanvasMouseDown.bind(this));
        this._fabricCanvas.on('mouse:move', this._onCanvasMouseMove.bind(this));
        this._fabricCanvas.on('mouse:up', this._onCanvasMouseUp.bind(this));

        this._canvasView.onDrawCircleClick(() => {this._switchDrawingType("circle")});
        this._canvasView.onDrawPolygonClick(() => {this._switchDrawingType("polygon")});
        this._canvasView.onDrawLineClick(() => {this._switchDrawingType("line")});
        this._canvasView.onAddPointClick(() => {this._switchDrawingType("point")});
    }

    initCanvas() {

    }

    _switchDrawingType(type: DrawType) {
        this._canvasView.deactivateControlButtons(type);
        this._canvasView.toggleControlButtonState(type);
        this._drawingMode = type;
    }

    _onCanvasMouseDown(event: IEvent<MouseEvent>) {
        if (!this._drawingMode) return;

        const pointer = this._fabricCanvas.getPointer(event.e);
        const startX = pointer.x;
        const startY = pointer.y;

        switch (this._drawingMode) {
            case "circle":
                this._currDrawObject = new fabric.Circle({
                    left: startX,
                    top: startY,
                    ...DEFAULT_CIRCLE_OPTIONS
                });
                break;
            case "polygon":
                this._currDrawObject = new fabric.Rect({
                    left: startX,
                    top: startY,
                    ...DEFAULT_POLYGON_OPTIONS
                });
                break;
            case "line":
                this._currDrawObject = new fabric.Line([startX, startY, startX, startY], DEFAULT_LINE_OPTIONS);
                break;
            case "point":
                this._currDrawObject = new fabric.Circle({
                    ...DEFAULT_POINT_OPTIONS,
                    left: startX,
                    top: startY
                });
                break;
        }

        this._fabricCanvas.add(this._currDrawObject!);
        if (this._drawingMode === "point") this._onCanvasMouseUp();
    }

    _onCanvasMouseMove(event: IEvent<MouseEvent>) {
        if (this._currDrawObject === undefined) return;

        const pointer = this._fabricCanvas.getPointer(event.e);

        if (this._currDrawObject instanceof fabric.Circle) {
            const radius = Math.sqrt(Math.pow(pointer.x - this._currDrawObject.left!, 2) + Math.pow(pointer.y - this._currDrawObject.top!, 2)) / 2;
            this._currDrawObject.set({ radius: radius });
        } else if (this._currDrawObject instanceof fabric.Rect) {
            this._currDrawObject.set({
                width: Math.abs(pointer.x - this._currDrawObject.left!),
                height: Math.abs(pointer.y - this._currDrawObject.top!)
            });
        } else if (this._currDrawObject instanceof fabric.Line) {
            this._currDrawObject.set({x2: pointer.x, y2: pointer.y});
        }

        this._fabricCanvas.renderAll();
    }

    _onCanvasMouseUp() {
        if (!this._drawingMode) return;

        this._canvasView.deactivateControlButtons();
        this._drawingMode = undefined;
        this._currDrawObject = undefined;
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