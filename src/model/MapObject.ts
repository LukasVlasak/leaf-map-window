import L, {type LatLng, type LatLngBoundsExpression} from "leaflet";
import Utils from "../utils/Utils";

type LeafLayer = L.Polyline | L.Polygon | L.ImageOverlay;
type LeafObjType = "polygon" | "polyline" | "canvas";

export default class MapObject {
    private _ID: string;
    // @ts-ignore
    private _name: string;
    private _coordinates: LatLngBoundsExpression | LatLng[] | LatLng[][];
    private _layer: LeafLayer;
    private _type: LeafObjType;
    private _distance?: number = undefined;
    private _area?: number = undefined;
    private _circuit?: number = undefined;
    private _description?: string = undefined;
    private _color?: string = undefined;
    private _strokeWidth?: number = undefined;
    private _popup?: string = undefined;
    // 0 - 100
    private _opacity: number = 100;

    constructor(coordinates: LatLngBoundsExpression | LatLng[] | LatLng[][], layer: LeafLayer, type: LeafObjType, opacity?: number, name?: string, description?: string, color?: string, strokeWidth?: number, popup?: string) {
        this._ID = crypto.randomUUID();
        this._coordinates = coordinates;
        this._layer = layer;
        this._type = type;
        this._calculateMeasurement();
        if (name) {
            this.name = name;
        } else {
            this.name = type;
        }
        if (opacity) {
            this.opacity = opacity;
        }
        if (description) {
            this.description = description;
        }
        // color and strokeWidth of canvas is set as layer.getElement().style
        // getElement() is not present now - instead a default CSS class exists that set these props to the element (.default-canvas-class)
        if (color) {
            if (type !== "canvas") {
                this.color = color;
            } else {
                this._color = color;
            }
        }
        if (strokeWidth) {
            if (type !== "canvas") {
                this.strokeWidth = strokeWidth;
            } else {
                this._strokeWidth = strokeWidth;
            }
        }

        if (popup) {
            this.popup = popup;
        } else {
            this._setDefaultPopup();
        }
    }

    private _setDefaultPopup() {
        if (this._circuit && this._area) {
            this.popup = `<b>Obsah:</b> ${Utils.formatArea(this._area)}<br><b>Obvod:</b> ${Utils.formatDistance(this._circuit)}`;
        } else if (this._distance) {
            this.popup = `<b>Délka:</b> ${Utils.formatDistance(this._distance)}`;
        } else if (this._circuit) {
            this.popup = `<b>Obvod:</b> ${Utils.formatDistance(this._circuit)}`;
        }
    }

    private _calcPolylineDistance(coordinates: L.LatLng[]): number {
        let distance = 0;
        for (let i = 0; i < coordinates.length - 1; i++) {
            distance += coordinates[i]!.distanceTo(coordinates[i + 1]!);
        }
        return distance;
    }

    private _calculateMeasurement() {
        if (this.type === "polygon") {
            const outerRing = ((this.layer as L.Polygon).getLatLngs() as L.LatLng[][])[0]!;
            this.area = L.GeometryUtil.geodesicArea(
                outerRing.map(l => ({ lat: l.lat, lng: l.lng }))
            );
            this.circuit = this._calcPolylineDistance([...outerRing, outerRing[0]!]);
        } else if (this.type === "polyline") {
            const latlngs = (this.layer as L.Polyline).getLatLngs() as L.LatLng[];
            this.distance = this._calcPolylineDistance(latlngs);
        } else {
            const bounds = this.layer.getBounds();
            const outerRing = [bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthEast(), bounds.getSouthWest()];
            this.circuit = this._calcPolylineDistance([...outerRing, outerRing[0]!]);
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

    set distance(value: number) {
        this._distance = value;
    }

    set area(value: number) {
        this._area = value;
    }

    set circuit(value: number) {
        this._circuit = value;
    }

    get popup(): string | undefined {
        return this._popup;
    }

    set popup(value: string) {
        this._popup = value;
        if (value) {
            this._layer.bindPopup(value).openPopup();
        } else {
            this._layer.closePopup();
            this._layer.unbindPopup();
        }
    }


    get distance(): number | undefined {
        return this._distance;
    }

    get area(): number | undefined {
        return this._area;
    }

    get circuit(): number | undefined {
        return this._circuit;
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
        if (this.type === "canvas") {
            (this.layer.getElement() as HTMLDivElement).style.outline = this.strokeWidth + 'px solid ' + value;
        } else {
            this.layer.setStyle({color: value, fillColor: value});
        }
    }

    set strokeWidth(value: number) {
        this._strokeWidth = value;
        if (this.type !== "canvas") {
            this.layer.setStyle({weight: value});
        } else {
            (this.layer.getElement() as HTMLDivElement).style.outline = value + 'px solid ' + this.color;
        }
    }

    set opacity(value: number) {
        this._opacity = value / 100;
        this.layer.setStyle({opacity: this.opacity, fillOpacity: this.opacity});
    }
}