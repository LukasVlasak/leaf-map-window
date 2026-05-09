import * as L from "leaflet";
import type { LeafletMouseEvent } from "leaflet";
import RuianConnector from "../ruian/RuianConnector";
import RuianInfoView, { type RuianData } from "../view/RuianInfo/RuianInfoView";

export default class RuianInfoModel {
    private _map: L.Map;
    private _epsg5514: L.Proj.CRS;
    private _ruianConnector: RuianConnector;
    private _currentPopup: L.Popup | null = null;

    constructor(map: L.Map, epsg5514: L.Proj.CRS, ruianConnector: RuianConnector) {
        this._map = map;
        this._epsg5514 = epsg5514;
        this._ruianConnector = ruianConnector;
        this._map.on('click', this._onMapClick.bind(this));
    }

    private async _onMapClick(e: LeafletMouseEvent) {
        const latlng = this._epsg5514.project(e.latlng);

        const popup = L.popup({ className: 'ruian-popup-wrapper', maxWidth: 300 })
            .setLatLng(e.latlng)
            .setContent(RuianInfoView.renderLoading())
            .openOn(this._map);
        this._currentPopup = popup;

        const data = await this._getRUIANObjects(latlng.x, latlng.y);

        if (this._currentPopup === popup && popup.isOpen()) {
            popup.setContent(RuianInfoView.render(data));
        }
    }

    private async _getRUIANObjects(x: number, y: number): Promise<RuianData> {
        let land, municipality, district, region;
        let districtRes, regionRes;

        const [landRes, municipalityRes] = await Promise.all([
            this._ruianConnector.getLandByPoint(x, y),
            this._ruianConnector.getMunicipalityByPoint(x, y),
        ]);

        if (landRes) {
            land = landRes.features?.[0];
        }
        if (municipalityRes) {
            municipality = municipalityRes.features?.[0];
        }

        if (municipality) {
            const districtCode = municipality.properties.okres;
            if (districtCode) {
                districtRes = await this._ruianConnector.getDistrictByCode(districtCode);
            }
        } else {
            districtRes = await this._ruianConnector.getDistrictByPoint(x, y);
        }

        if (districtRes) {
            district = districtRes.features?.[0];
        }
        if (district) {
            const regionCode = district.properties.vusc;
            if (regionCode) {
                regionRes = await this._ruianConnector.getRegionByCode(regionCode);
            }
        } else {
            regionRes = await this._ruianConnector.getRegionByPoint(x, y);
        }

        if (regionRes) {
            region = regionRes.features?.[0];
        }

        return {
            land: land?.properties ?? null,
            municipality: municipality?.properties ?? null,
            district: district?.properties ?? null,
            region: region?.properties ?? null,
        };
    }
}
