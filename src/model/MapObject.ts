import {type LatLng, type LatLngBoundsExpression, tooltip} from "leaflet";

type LeafLayer = L.Polyline | L.Polygon | L.ImageOverlay;
type LeafObjType = "polygon" | "polyline" | "canvas";

export default class MapObject {
    private _ID: string;
    private _name: string;
    private _coordinates: LatLngBoundsExpression | LatLng[] | LatLng[][];
    private _layer: LeafLayer;
    private _type: LeafObjType;
    private _description?: string = undefined;
    private _color?: string = undefined;
    private _strokeWidth?: number = undefined;
    private _tooltip?: string = undefined;
    private _isTooltipOnHover: boolean = false;
    private _opacity: number = 0.8;

    constructor(coordinates: LatLngBoundsExpression | LatLng[] | LatLng[][], layer: LeafLayer, type: LeafObjType, opacity?: number, name?: string, description?: string, color?: string, strokeWidth?: number, tooltip?: string) {
        this._ID = crypto.randomUUID();
        this._coordinates = coordinates;
        this._layer = layer;
        this._type = type;
        if (name) {
            this._name = name;
        } else {
            this._name = type;
        }
        if (opacity) {
            this._opacity = opacity;
        }
        if (description) {
            this._description = description;
        }
        if (color) {
            this._color = color;
        }
        if (strokeWidth) {
            this._strokeWidth = strokeWidth;
        }
        if (tooltip) {
            this._tooltip = tooltip;
        }
    }


    get ID(): string {
        return this._ID;
    }

    get name(): string {
        return this._name;
    }

    get coordinates(): LatLngBoundsExpression | LatLng[] | LatLng[][] {
        return this._coordinates;
    }

    get layer(): LeafLayer {
        return this._layer;
    }

    get type(): LeafObjType {
        return this._type;
    }

    get description(): string | undefined {
        return this._description;
    }

    get color(): string | undefined {
        return this._color;
    }

    get strokeWidth(): number | undefined {
        return this._strokeWidth;
    }

    get tooltip(): string | undefined {
        return this._tooltip;
    }

    get isTooltipOnHover(): boolean {
        return this._isTooltipOnHover;
    }

    get opacity(): number {
        return this._opacity;
    }

    set name(value: string) {
        this._name = value;
    }

    set description(value: string) {
        this._description = value;
    }

    set color(value: string) {
        this._color = value;
    }

    set strokeWidth(value: number) {
        this._strokeWidth = value;
    }

    set tooltip(value: string) {
        this._tooltip = value;
    }

    set isTooltipOnHover(value: boolean) {
        this._isTooltipOnHover = value;
    }

    set opacity(value: number) {
        this._opacity = value;
    }
}