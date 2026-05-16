import { Canvas, Circle, Rect, Line, Polyline, Text, PencilBrush, type FabricObject, type TPointerEventInfo } from "fabric";
import type CanvasView from "../view/components/Canvas/CanvasView";
import L, { LatLngBounds, type LatLngBoundsExpression } from "leaflet";
import MapObject from "../objects/MapObject";
import { DEFAULT_EDIT_COLORS } from "../view/MapObjects/MapObjectsView";
import type MapObjectsModel from "./MapObjectsModel";

const DEFAULT_CIRCLE_OPTIONS = {
    radius: 1,
    fill: '#1b11d9',
    stroke: '#000',
    strokeWidth: 3,
    originX: 'center' as const,
    originY: 'center' as const,
    data: { id: 'circle' }
}

const DEFAULT_POLYGON_OPTIONS = {
    width: 1,
    height: 1,
    fill: '#11d94d',
    stroke: '#000',
    strokeWidth: 3,
    data: { id: 'polygon' }
}

const DEFAULT_LINE_OPTIONS = {
    stroke: '#000',
    fill: null,
    strokeWidth: 3,
    data: { id: 'line' }
}

const DEFAULT_POLYLINE_OPTIONS = {
    stroke: '#000',
    fill: null,
    strokeWidth: 3,
    objectCaching: false,
    selectable: false,
    data: { id: 'polyline' }
}

const DEFAULT_POLYLINE_MARKER_OPTIONS = {
    width: 10,
    height: 10,
    fill: '#000',
    stroke: '#000',
    originX: 'center' as const,
    originY: 'center' as const,
    hoverCursor: 'pointer',
    selectable: false,
    data: { id: 'polylinePoint' }
}

const DEFAULT_POINT_OPTIONS = {
    radius: 5,
    fill: '#000',
    originX: 'center' as const,
    originY: 'center' as const,
    data: { id: 'point' }
}

const DEFAULT_TEXT_OPTIONS = {
    left: 50,
    top: 50,
    fill: "#000000",
    fontSize: 20,
    data: { id: 'text' }
}

export type DrawType = "circle" | "polygon" | "line" | "polyline" | "point" | "text" | "freedraw";

export default class CanvasModel {
    private _fabricCanvas: Canvas;

    private _mapObjectsModel: MapObjectsModel;
    private _canvasView: CanvasView;
    private _map: L.Map;

    private _drawingMode: DrawType | undefined = undefined;
    private _currDrawObject: FabricObject | undefined = undefined;

    private _timeStamp: Date | undefined = undefined;

    private _polyLinePoints: {x: number, y: number}[] = [];
    private _polyline: Polyline | undefined = undefined;
    private _polyLineTempLine: Line | undefined = undefined;
    private _polyLinePointMarkers: Rect[] = [];

    constructor(mapObjectsModel: MapObjectsModel, canvasView: CanvasView, map: L.Map) {
        this._fabricCanvas = new Canvas('canvas');
        this._fabricCanvas.freeDrawingBrush = new PencilBrush(this._fabricCanvas);

        this._mapObjectsModel = mapObjectsModel;
        this._canvasView = canvasView;
        this._map = map;

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

    bindOnCanvasSaveButton(handler: () => void) {
        this._canvasView.onSaveButtonClick(handler);
    }

    bindOnCanvasCloseButton(handler: () => void) {
        this._canvasView.onCloseButtonClick(handler);
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

    _onCanvasMouseDown(event: TPointerEventInfo) {
        if (!this._drawingMode || this._fabricCanvas.isDrawingMode || this._drawingMode === "text") return;

        const startX = event.viewportPoint.x;
        const startY = event.viewportPoint.y;

        switch (this._drawingMode) {
            case "circle":
                this._currDrawObject = new Circle({
                    left: startX,
                    top: startY,
                    ...DEFAULT_CIRCLE_OPTIONS
                });
                break;
            case "polygon":
                this._currDrawObject = new Rect({
                    left: startX,
                    top: startY,
                    ...DEFAULT_POLYGON_OPTIONS
                });
                break;
            case "line":
                this._currDrawObject = new Line([startX, startY, startX, startY], DEFAULT_LINE_OPTIONS);
                break;
            case "point":
                this._currDrawObject = new Circle({
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

    _onCanvasMouseMove(event: TPointerEventInfo) {
        if (this._fabricCanvas.isDrawingMode) return;

        const pointer = event.viewportPoint;

        if (this._drawingMode === 'polyline' && this._polyLineTempLine) {
            this._polyLineTempLine.set({ x2: pointer.x, y2: pointer.y });
            this._fabricCanvas.renderAll();
            return;
        }

        if (this._currDrawObject === undefined) return;

        if (this._currDrawObject instanceof Circle) {
            const radius = Math.sqrt(Math.pow(pointer.x - this._currDrawObject.left!, 2) + Math.pow(pointer.y - this._currDrawObject.top!, 2)) / 2;
            this._currDrawObject.set({ radius: radius });
        } else if (this._currDrawObject instanceof Rect) {
            this._currDrawObject.set({
                width: Math.abs(pointer.x - this._currDrawObject.left!),
                height: Math.abs(pointer.y - this._currDrawObject.top!)
            });
        } else if (this._currDrawObject instanceof Line) {
            this._currDrawObject.set({x2: pointer.x, y2: pointer.y});
        }

        this._fabricCanvas.renderAll();
    }

    _onCanvasMouseUp() {
        if (!this._currDrawObject || this._fabricCanvas.isDrawingMode) return;

        this._exitDrawingMode();
    }

    _handlePolyline(event: TPointerEventInfo, startX: number, startY: number) {
        if (this._polyLinePointMarkers.length > 1 && event.target === this._polyLinePointMarkers.at(-1)) {
            this._clearAndSavePolyline();
            return;
        }

        if (event.target && (event.target as any).data?.id === 'polylinePoint') return;

        const marker = new Rect({ left: startX, top: startY, ...DEFAULT_POLYLINE_MARKER_OPTIONS });
        this._polyLinePointMarkers.push(marker);
        this._fabricCanvas.add(marker);
        this._polyLinePoints.push({ x: startX, y: startY });

        if (!this._polyline) {
            this._polyline = new Polyline(this._polyLinePoints, DEFAULT_POLYLINE_OPTIONS);
            this._polyLineTempLine = new Line([startX, startY, startX, startY], {
                stroke: DEFAULT_POLYLINE_OPTIONS.stroke,
                strokeWidth: DEFAULT_POLYLINE_OPTIONS.strokeWidth,
                strokeDashArray: [5, 5],
                selectable: false,
            });
            this._fabricCanvas.add(this._polyLineTempLine);
            this._fabricCanvas.add(this._polyline);
        } else {
            this._polyline.points = this._polyLinePoints;
            this._polyLineTempLine!.set({ x1: startX, y1: startY });
        }

        this._fabricCanvas.renderAll();
    }

    _clearAndSavePolyline() {
        this._polyLinePointMarkers.forEach(m => this._fabricCanvas.remove(m));
        this._polyLinePointMarkers = [];
        this._fabricCanvas.remove(this._polyLineTempLine!);
        this._polyLineTempLine = undefined;

        this._polyline!.setCoords();

        this._polyline = undefined;
        this._polyLinePoints = [];

        this._exitDrawingMode();
    }

    _onCanvasPathCreated(e: { path: FabricObject }) {
        const path = e.path;
        (path as any).data = { id: 'path', timeStamp: this._timeStamp };
        this._canvasView.showPathButtons();
    }

    _onCancelPathClicked() {
        this._fabricCanvas.getObjects().forEach(o => {
            if ((o as any).data?.timeStamp === this._timeStamp) {
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

        if (activeObjs.length === 1) {
            const activeObj = activeObjs[0]!;
            this._canvasView.enableDeleteActiveElBtn();

            if ((activeObj as any).data?.id === 'text') {
                this._canvasView.getChangeStrokeWidhtInput().enable();
                this._canvasView.getChangeStrokeWidhtInput().setValue((activeObj as any).fontSize.toString());
            } else if (activeObj.strokeWidth && (activeObj as any).data?.id !== 'point') {
                this._canvasView.getChangeStrokeWidhtInput().enable();
                this._canvasView.getChangeStrokeWidhtInput().setValue(activeObj.strokeWidth!.toString());
            } else {
                this._canvasView.getChangeStrokeWidhtInput().disable();
            }

            if (activeObj.stroke) {
                this._canvasView.getChangeStrokeInput().enable();
                this._canvasView.getChangeStrokeInput().setValue(activeObj.stroke as string);
            } else {
                this._canvasView.getChangeStrokeInput().disable();
            }

            if (activeObj.fill) {
                this._canvasView.getChangeColorInput().enable();
                this._canvasView.getChangeColorInput().setValue(activeObj.fill as string);
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
        const activeObj = this._fabricCanvas.getActiveObject()!;
        // @ts-ignore
        const value = e.currentTarget.value;
        if (value) {
            if ((activeObj as any).data?.id === 'text' && prop === "strokeWidth") {
                (activeObj as any).set({'fontSize': parseInt(value)});
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
            const text = new Text(value, DEFAULT_TEXT_OPTIONS);
            this._fabricCanvas.add(text);
            this._canvasView.getTextInput().clear();
            this._updateSaveBtnState();
        }
    }

    _onDeleteActiveElement() {
        this._fabricCanvas.remove(this._fabricCanvas.getActiveObject()!);
        this._updateSaveBtnState();
    }

    _disableCanvasSelection() {
        this._fabricCanvas.discardActiveObject();
        this._fabricCanvas.getObjects().forEach((o) => {
            o.selectable = false;
        });
        this._fabricCanvas.renderAll();
    }

    _enableCanvasSelection() {
        this._fabricCanvas.getObjects().forEach((o) => {
            o.selectable = true;
        });
        this._fabricCanvas.renderAll();
    }

    /**
     * canvasContent is:
     * JSON.stringify({
     *      ...this._fabricCanvas.toJSON(),
     *      height: this._fabricCanvas.height,
     *      width: this._fabricCanvas.width,
     *      zoom: this._map.getZoom()
     * });
     */
    async loadCanvasContent(canvasContent: any, coordinates: L.LatLng[][]) {
        await this._fabricCanvas.loadFromJSON(canvasContent);
        this._fabricCanvas.setDimensions({ width: canvasContent.width, height: canvasContent.height });
        this._fabricCanvas.renderAll();

        this.onCanvasSave(coordinates);
        this.onCanvasClose();
    }

    onCanvasSave(predefinedCoords?: L.LatLng[][]) {
        const url = this._fabricCanvas.toDataURL({ format: 'png', multiplier: 1 });

        let coords;
        if (!predefinedCoords) {
            coords = this._getCanvasCoordinates();
        } else {
            coords = new LatLngBounds(predefinedCoords[0]!);
        }
        const img = new L.ImageOverlay(url, coords, {
            alt:  'Uložené canvas plátno',
            className: 'default-canvas-class',
            opacity: 1,
            interactive: true,
        });
        const canvasObj = new MapObject(coords, img, "canvas", img.options.opacity!, undefined, undefined, DEFAULT_EDIT_COLORS[5], 1);
        if (!predefinedCoords) {
            canvasObj.setDefaultPopup();
        }

        canvasObj.fabricCanvasContent = this._fabricCanvas.getObjects().length > 0 ? JSON.stringify({
            ...this._fabricCanvas.toJSON(),
            height: this._fabricCanvas.height,
            width: this._fabricCanvas.width,
            zoom: this._map.getZoom()
        }) : '';

        this._mapObjectsModel.addObject(canvasObj);
    }

    _getCanvasCoordinates(): LatLngBoundsExpression {
        const overlayRect = this._canvasView.getHTMLCanvas().getBoundingClientRect();
        const mapRect = this._map.getContainer().getBoundingClientRect();

        const overlayLeft = overlayRect.left - mapRect.left;
        const overlayTop = overlayRect.top - mapRect.top;
        const overlayRight = overlayLeft + overlayRect.width;
        const overlayBottom = overlayTop + overlayRect.height;

        const topLeft = this._map.containerPointToLatLng([overlayLeft, overlayTop]);
        const bottomRight = this._map.containerPointToLatLng([overlayRight, overlayBottom]);

        return new L.LatLngBounds(
            [topLeft.lat, topLeft.lng],
            [bottomRight.lat, bottomRight.lng]
        );
    }

    toggleCanvasVisibility(map: L.Map) {
        if (this._canvasView.isHidden()) {
            this._canvasView.show();
            const width = map.getSize().x - 300;
            const height = map.getSize().y - 200;
            this._canvasView.setContainerDimensions(width, height, 150, 100);

            // 15px is sidebar width
            // 97px is canvas-header height
            // 80px is control-section and canvas-footer height
            this._fabricCanvas.setDimensions({ width: width - 30, height: height - 97 - 80 - 80 });
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
