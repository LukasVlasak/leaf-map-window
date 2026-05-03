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
    // have to specify otherwise obj.get('fill') is not falsy
    fill: undefined,
    strokeWidth: 3,
    id: 'line'
}

const DEFAULT_POLYLINE_OPTIONS = {
    stroke: '#000',
    fill: undefined,
    strokeWidth: 3,
    objectCaching: false,
    selectable: false,
    id: 'polyline'
}

const DEFAULT_POLYLINE_MARKER_OPTIONS = {
    width: 10,
    height: 10,
    fill: '#000',
    stroke: '#000',
    originX: 'center',
    originY: 'center',
    hoverCursor: 'pointer',
    selectable: false,
    id: 'polylinePoint'
}

const DEFAULT_POINT_OPTIONS = {
    radius: 5,
    fill: '#000',
    originX: 'center',
    originY: 'center',
    id: 'point'
}

const DEFAULT_TEXT_OPTIONS = {
    left: 50,
    top: 50,
    fill: "#000000",
    fontSize: 20,
    id: 'text'
}

export type DrawType = "circle" | "polygon" | "line" | "polyline" | "point" | "text" | "freedraw";

export default class CanvasModel {
    private _fabricCanvas;

    private _objectStore: ObjectStore;
    private _canvasView: CanvasView;

    private _drawingMode: DrawType | undefined = undefined;
    private _currDrawObject: undefined | fabric.Object = undefined;

    // helper for deleting paths
    private _timeStamp: Date | undefined = undefined;

    private _polyLinePoints: {x: number, y: number}[] = [];
    private _polyline: fabric.Polyline | undefined = undefined;
    private _polyLineTempLine: fabric.Line | undefined = undefined;
    private _polyLinePointMarkers: fabric.Rect[] = [];

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

        this._fabricCanvas.on('path:created', this._onCanvasPathCreated.bind(this));

        this._fabricCanvas.on('selection:created', this._onCanvasSelectionUpdated.bind(this));
        this._fabricCanvas.on('selection:updated', this._onCanvasSelectionUpdated.bind(this));
        this._fabricCanvas.on('selection:cleared', this._onCanvasSelectionCleared.bind(this));

        this._canvasView.onCancelPathClick(this._onCancelPathClicked.bind(this));
        this._canvasView.onSavePathClick(this._onSavePathClicked.bind(this));

        this._canvasView.onSaveTextClick(this._onSaveTextClicked.bind(this));

        this._canvasView.onDeleteActiveElementClick(this._onDeleteActiveElement.bind(this));

        this._canvasView.onDrawCircleClick(() => {this._switchDrawingType("circle")});
        this._canvasView.onDrawPolygonClick(() => {this._switchDrawingType("polygon")});
        this._canvasView.onDrawLineClick(() => {this._switchDrawingType("line")});
        this._canvasView.onAddPointClick(() => {this._switchDrawingType("point")});
        this._canvasView.onFreeDrawClick(() => {this._switchDrawingType("freedraw")});
        this._canvasView.onAddTextClick(() => {this._switchDrawingType("text")});
        this._canvasView.onDrawPolylineClick(() => {this._switchDrawingType("polyline")});

        this._canvasView.onChangeColor((e) => this._editObjProp("fill", e));
        this._canvasView.onChangeStroke((e) => this._editObjProp("stroke", e));
        this._canvasView.onChangeStrokeWidth((e) => this._editObjProp("strokeWidth", e));
    }

    _switchDrawingType(type: DrawType) {
        const previousMode = this._drawingMode;
        this._canvasView.deactivateControlButtons(type);
        this._canvasView.toggleControlButtonState(type);

        if (previousMode === 'freedraw') this._onCancelPathClicked();

        if (previousMode === type) {
            this._exitDrawingMode();
            return;
        }

        this._cleanupCurrentMode();
        this._disableCanvasSelection();
        this._drawingMode = type;

        if (type === 'freedraw') {
            this._fabricCanvas.isDrawingMode = true;
            this._timeStamp = new Date();
        }
        if (type === 'text') {
            this._canvasView.getTextInput().show();
            this._canvasView.showSaveTextBtn();
        }
    }

    _cleanupCurrentMode() {
        if (this._drawingMode === 'freedraw') {
            this._fabricCanvas.isDrawingMode = false;
            this._canvasView.hidePathButtons();
        }
        if (this._drawingMode === 'text') {
            this._canvasView.getTextInput().hide();
            this._canvasView.getTextInput().clear();
            this._canvasView.hideSaveTextBtn();
        }
        if (this._drawingMode === 'polyline') {
            this._polyLinePointMarkers.forEach(m => this._fabricCanvas.remove(m));
            this._polyLinePointMarkers = [];
            if (this._polyLineTempLine) this._fabricCanvas.remove(this._polyLineTempLine);
            this._polyLineTempLine = undefined;
            if (this._polyline) this._fabricCanvas.remove(this._polyline);
            this._polyline = undefined;
            this._polyLinePoints = [];
        }
        this._drawingMode = undefined;
        this._currDrawObject = undefined;
    }

    _exitDrawingMode() {
        this._cleanupCurrentMode();
        this._enableCanvasSelection();
        this._canvasView.deactivateControlButtons();
        this._updateSaveBtnState();
    }

    _onCanvasMouseDown(event: IEvent<MouseEvent>) {
        if (!this._drawingMode || this._fabricCanvas.isDrawingMode || this._drawingMode === "text") return;

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
            case "polyline":
                this._handlePolyline(event, startX, startY);
                return;
        }

        this._fabricCanvas.add(this._currDrawObject!);
        if (this._drawingMode === "point") this._onCanvasMouseUp();
    }

    _onCanvasMouseMove(event: IEvent<MouseEvent>) {
        if (this._fabricCanvas.isDrawingMode) return;

        const pointer = this._fabricCanvas.getPointer(event.e);

        if (this._drawingMode === 'polyline' && this._polyLineTempLine) {
            this._polyLineTempLine.set({ x2: pointer.x, y2: pointer.y });
            this._fabricCanvas.renderAll();
            return;
        }

        if (this._currDrawObject === undefined) return;

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
        if (!this._currDrawObject || this._fabricCanvas.isDrawingMode) return;

        this._exitDrawingMode();
    }

    _handlePolyline(event: IEvent<MouseEvent>, startX: number, startY: number) {
        if (this._polyLinePointMarkers.length > 1 && event.target === this._polyLinePointMarkers.at(-1)) {
            this._clearAndSavePolyline();
            return;
        }

        if (event.target && (event.target as any).get('id') === 'polylinePoint') return;

        const marker = new fabric.Rect({ left: startX, top: startY, ...DEFAULT_POLYLINE_MARKER_OPTIONS });
        this._polyLinePointMarkers.push(marker);
        this._fabricCanvas.add(marker);
        this._polyLinePoints.push({ x: startX, y: startY });

        if (!this._polyline) {
            this._polyline = new fabric.Polyline(this._polyLinePoints, DEFAULT_POLYLINE_OPTIONS);
            this._polyLineTempLine = new fabric.Line([startX, startY, startX, startY], {
                stroke: DEFAULT_POLYLINE_OPTIONS.stroke,
                strokeWidth: DEFAULT_POLYLINE_OPTIONS.strokeWidth,
                strokeDashArray: [5, 5],
                selectable: false,
            });
            this._fabricCanvas.add(this._polyLineTempLine);
            this._fabricCanvas.add(this._polyline);
        } else {
            (this._polyline as any).points = this._polyLinePoints;
            // set start of dashed line - visible while mouse move
            this._polyLineTempLine!.set({ x1: startX, y1: startY });
        }

        this._fabricCanvas.renderAll();
    }

    _clearAndSavePolyline() {
        this._polyLinePointMarkers.forEach(m => this._fabricCanvas.remove(m));
        this._polyLinePointMarkers = [];
        this._fabricCanvas.remove(this._polyLineTempLine!);
        this._polyLineTempLine = undefined;

        // fix bounding
        (this._polyline as any)._setPositionDimensions({});
        this._polyline!.setCoords();

        this._polyline = undefined;
        this._polyLinePoints = [];

        this._exitDrawingMode();
    }

    _onCanvasPathCreated(e: IEvent<MouseEvent>) {
        // the object e has 'path' but IEvent type doesnt declare it
        const path = (e as any).path;
        path.set({id: 'path', timeStamp: this._timeStamp});
        this._canvasView.showPathButtons();
    }

    _onCancelPathClicked() {
        this._fabricCanvas.getObjects().forEach(o => {
            if (o.get('timeStamp' as any) === this._timeStamp) {
                this._fabricCanvas.remove(o);
            }
        });
        this._canvasView.hidePathButtons();

        this._fabricCanvas.renderAll();
    }

    _onSavePathClicked() {
        this._exitDrawingMode();
    }

    _onCanvasSelectionUpdated() {
        const activeObjs = this._fabricCanvas.getActiveObjects();

        // allow to select just 1 object
        if (activeObjs.length === 1) {
            const activeObj = activeObjs[0]!;
            this._canvasView.enableDeleteActiveElBtn();

            if (activeObj.get('id' as any) === 'text') {
                this._canvasView.getChangeStrokeWidhtInput().enable();
                this._canvasView.getChangeStrokeWidhtInput().setValue(activeObj.get("fontSize" as any));
            // point has to have strokeWidth otherwise not rendered, however changing strokeWidth is not applicable
            } else if (activeObj.get('strokeWidth') && activeObj.get('id' as any) !== 'point') {
                this._canvasView.getChangeStrokeWidhtInput().enable();
                this._canvasView.getChangeStrokeWidhtInput().setValue(activeObj.get("strokeWidth" as any));
            } else {
                this._canvasView.getChangeStrokeWidhtInput().disable();
            }

            if (activeObj.get('stroke')) {
                this._canvasView.getChangeStrokeInput().enable();
                this._canvasView.getChangeStrokeInput().setValue(activeObj.get('stroke')!);
            } else {
                this._canvasView.getChangeStrokeInput().disable();
            }

            if (activeObj.get('fill')) {
                this._canvasView.getChangeColorInput().enable();
                this._canvasView.getChangeColorInput().setValue(activeObj.get('fill') as any);
            } else {
                this._canvasView.getChangeColorInput().disable();
            }
        } else {
            this._onCanvasSelectionCleared();
        }
    }

    _onCanvasSelectionCleared() {
        this._canvasView.getChangeColorInput().disable();
        this._canvasView.getChangeStrokeInput().disable();
        this._canvasView.getChangeStrokeWidhtInput().disable();
        this._canvasView.disableDeleteActiveElBtn();
    }

    _editObjProp(prop: "fill" | "stroke" | "strokeWidth", e: Event) {
        // input is either disabled or ONE obj that supports this edit is selected
        const activeObj = this._fabricCanvas.getActiveObject()!;
        // @ts-ignore
        const value = e.currentTarget.value;
        if (value) {
            // text needs font size instead of strokeWidth
            if (activeObj.get('id' as any) === 'text' && prop === "strokeWidth") {
                // @ts-ignore
                activeObj.set({'fontSize': parseInt(value)});
            } else if (prop === "strokeWidth") {
                activeObj.set({strokeWidth: parseInt(value)});
            } else {
                activeObj.set({[prop]: value});
            }
            this._fabricCanvas.renderAll();
        }
    }

    _resetCanvas() {
        this._fabricCanvas.remove(...this._fabricCanvas.getObjects());
        this._exitDrawingMode();
    }

    _onSaveTextClicked() {
        if (this._canvasView.getTextInput().getValue()) {
            const value = this._canvasView.getTextInput().getValue();
            const text = new fabric.Text(value, DEFAULT_TEXT_OPTIONS);
            this._fabricCanvas.add(text);
            this._canvasView.getTextInput().clear();
            this._updateSaveBtnState();
        }
    }

    _onDeleteActiveElement() {
        // activeObject cannot be null bcs btn would be disabled if so
        this._fabricCanvas.remove(this._fabricCanvas.getActiveObject()!);
        this._updateSaveBtnState();
    }

    _disableCanvasSelection() {
        this._fabricCanvas.discardActiveObject();
        this._fabricCanvas.forEachObject((o) => {
            o.selectable = false;
        });
        this._fabricCanvas.renderAll();
    }

    _enableCanvasSelection() {
        this._fabricCanvas.forEachObject((o) => {
            o.selectable = true;
        });
        this._fabricCanvas.renderAll();
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
        this._resetCanvas();
    }

    _updateSaveBtnState() {
        if (this._fabricCanvas.getObjects().length > 0) {
            this._canvasView.enableSaveBtn();
        } else {
            this._canvasView.disableSaveBtn();
        }
    }
}