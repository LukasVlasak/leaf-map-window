import DOMPurify from "dompurify";
import type MapLayer from "../../objects/MapLayer";
import type MapLayerGroup from "../../objects/MapLayerGroup";
import LeafSlider from "../components/Slider/LeafSlider";

interface LayerEntry {
    layer: MapLayer;
    layerDiv: HTMLDivElement;
    checkEl: HTMLDivElement;
}

export default class MapLayersView extends HTMLElement {
    private _mapLayersViewDiv: HTMLDivElement | undefined = undefined;

    private _onLayerToggleHandler: ((layer: MapLayer, active: boolean) => void) | undefined = undefined;
    private _onBaseLayerChangeHandler: ((layer: MapLayer, previous: MapLayer | undefined) => void) | undefined = undefined;
    private _onLayerOpacityChangeHandler: ((layer: MapLayer, opacity: number) => void) | undefined = undefined;

    constructor() {
        super();
    }

    connectedCallback(): void {
        this._mapLayersViewDiv = document.createElement('div');
        this.appendChild(this._mapLayersViewDiv);
    }

    renderMapLayersGroup(groups: MapLayerGroup[]) {
        for (const group of groups) {
            const sectionHead = document.createElement('div');
            sectionHead.className = 'panel-section-head';

            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'panel-section-title';
            sectionTitle.textContent = group.name;

            const sectionToggle = document.createElement('div');
            sectionToggle.className = 'panel-section-toggle';
            const sectionToggleIcon = document.createElement('i');
            sectionToggleIcon.className = 'fa fa-chevron-down';
            sectionToggle.appendChild(sectionToggleIcon);

            sectionHead.appendChild(sectionTitle);
            sectionHead.appendChild(sectionToggle);

            const groupBody = document.createElement('div');
            groupBody.className = 'panel-group-body';
            if (!group.defaultOpen) {
                sectionHead.classList.add('collapsed');
                groupBody.classList.add('collapsed');
            }

            sectionHead.addEventListener('click', () => {
                sectionHead.classList.toggle('collapsed');
                groupBody.classList.toggle('collapsed');
            });

            this._mapLayersViewDiv!.appendChild(sectionHead);
            this._mapLayersViewDiv!.appendChild(groupBody);

            const isBase = group.layerTypes === 'base';
            const entries: LayerEntry[] = [];

            for (const mapLayer of group.mapLayers) {
                const layerDiv = document.createElement('div');
                layerDiv.className = 'layer' + (mapLayer.active ? '' : ' hidden-layer');

                const head = document.createElement('div');
                head.className = 'layer-head';

                const check = document.createElement('div');
                check.className = 'layer-check' + (isBase ? ' radio' : '') + (mapLayer.active ? ' checked' : '');
                const checkIcon = document.createElement('i');
                checkIcon.className = isBase ? 'fa fa-circle' : 'fa fa-check';
                check.appendChild(checkIcon);

                const body = document.createElement('div');
                body.className = 'layer-body';
                const title = document.createElement('div');
                title.className = 'layer-title';
                title.textContent = mapLayer.name;
                body.appendChild(title);

                const toggle = document.createElement('button');
                toggle.className = 'layer-toggle';
                const toggleIcon = document.createElement('i');
                toggleIcon.className = 'fa fa-chevron-down';
                toggle.appendChild(toggleIcon);

                head.addEventListener('click', () => layerDiv.classList.toggle('expanded'));

                head.appendChild(check);
                head.appendChild(body);
                head.appendChild(toggle);

                const detail = document.createElement('div');
                detail.className = 'layer-detail';

                if (mapLayer.description) {
                    const desc = document.createElement('p');
                    desc.className = 'layer-desc';
                    desc.textContent = mapLayer.description;
                    detail.appendChild(desc);
                }

                if (mapLayer.additionalInfo) {
                    const info = document.createElement('div');
                    info.className = 'layer-info';
                    info.innerHTML = DOMPurify.sanitize(mapLayer.additionalInfo);
                    detail.appendChild(info);
                }

                if (!isBase) {
                    const opacityRow = document.createElement('div');
                    opacityRow.className = 'layer-detail-row';
                    const opacityLabel = document.createElement('span');
                    opacityLabel.className = 'layer-detail-label';
                    opacityLabel.textContent = 'Průhlednost';
                    const opacitySlider = new LeafSlider(0, 100, mapLayer.opacity * 100, '%');
                    opacitySlider.onChange((val) => this._onLayerOpacityChangeHandler!(mapLayer, val));
                    opacityRow.appendChild(opacityLabel);
                    opacityRow.appendChild(opacitySlider);
                    detail.appendChild(opacityRow);
                }

                const minZoomRow = document.createElement('div');
                minZoomRow.className = 'layer-detail-row';
                const minZoomLabel = document.createElement('span');
                minZoomLabel.className = 'layer-detail-label';
                minZoomLabel.textContent = 'Min zoom';
                const minZoomVal = document.createElement('span');
                minZoomVal.className = 'layer-detail-value';
                minZoomVal.textContent = mapLayer.minZoom.toString();
                minZoomRow.appendChild(minZoomLabel);
                minZoomRow.appendChild(minZoomVal);
                detail.appendChild(minZoomRow);

                const maxZoomRow = document.createElement('div');
                maxZoomRow.className = 'layer-detail-row';
                const maxZoomLabel = document.createElement('span');
                maxZoomLabel.className = 'layer-detail-label';
                maxZoomLabel.textContent = 'Max zoom';
                const maxZoomVal = document.createElement('span');
                maxZoomVal.className = 'layer-detail-value';
                maxZoomVal.textContent = mapLayer.maxZoom.toString();
                maxZoomRow.appendChild(maxZoomLabel);
                maxZoomRow.appendChild(maxZoomVal);
                detail.appendChild(maxZoomRow);

                if (mapLayer.attribution) {
                    const attr = document.createElement('p');
                    attr.className = 'layer-attribution';
                    if (mapLayer.attributionLink) {
                        const a = document.createElement('a');
                        a.href = mapLayer.attributionLink;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.textContent = `Zdroj: ${mapLayer.attribution}`;
                        attr.appendChild(a);
                    } else {
                        attr.textContent = `Zdroj: ${mapLayer.attribution}`;
                    }
                    detail.appendChild(attr);
                }

                layerDiv.appendChild(head);
                layerDiv.appendChild(detail);

                entries.push({ layer: mapLayer, layerDiv, checkEl: check });
                groupBody.appendChild(layerDiv);
            }

            for (const entry of entries) {
                this._addCheckListener(entry, entries, isBase);
            }
        }
    }

    private _addCheckListener(entry: LayerEntry, groupEntries: LayerEntry[], isBase: boolean) {
        entry.checkEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isBase) {
                const previous = groupEntries.find(e => e !== entry && e.checkEl.classList.contains('checked'))?.layer;
                for (const other of groupEntries) {
                    other.checkEl.classList.remove('checked');
                    other.layerDiv.classList.add('hidden-layer');
                }
                entry.checkEl.classList.add('checked');
                entry.layerDiv.classList.remove('hidden-layer');
                this._onBaseLayerChangeHandler!(entry.layer, previous);
            } else {
                const isActive = entry.checkEl.classList.toggle('checked');
                entry.layerDiv.classList.toggle('hidden-layer', !isActive);
                this._onLayerToggleHandler!(entry.layer, isActive);
            }
        });
    }

    onLayerToggle(handler: (layer: MapLayer, active: boolean) => void) {
        this._onLayerToggleHandler = handler;
    }

    onBaseLayerChange(handler: (layer: MapLayer, previous: MapLayer | undefined) => void) {
        this._onBaseLayerChangeHandler = handler;
    }

    onLayerOpacityChange(handler: (layer: MapLayer, opacity: number) => void) {
        this._onLayerOpacityChangeHandler = handler;
    }
}

customElements.define('leaf-map-layer-list', MapLayersView);
