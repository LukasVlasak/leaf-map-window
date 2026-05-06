import type MapObject from "../../objects/MapObject";
import LeafButton from "../components/Button/LeafButton";
import LeafInput from "../components/Input/LeafInput";
import LeafSlider from "../components/Slider/LeafSlider";
import Utils from "../../utils/Utils";

export const DEFAULT_EDIT_COLORS = [
    '#0d9488',
    '#0e7490',
    '#7c3aed',
    '#b45309',
    '#be123c',
    '#1f2937',
    '#15803d',
    '#1d4ed8'
];

interface ObjectDivs {
    objectDiv: HTMLDivElement;
    objectEditDiv: HTMLDivElement;
}

export default class MapObjectsView extends HTMLElement {
    private _objectListEmptyDiv: HTMLDivElement | undefined = undefined;

    private _objectList: HTMLDivElement | undefined = undefined;

    private _onObjectSelected: ((obj: MapObject) => void) | undefined = undefined;
    private _onObjectRemoved: ((obj: MapObject) => void) | undefined = undefined;
    private _onAllObjectsRemoved: (() => void) | undefined = undefined;
    private _onObjectDeselect: (() => void) | undefined = undefined;

    private _objectListItemsCount: number = 0;

    private _objectNameChangeHandler: ((obj: MapObject, name: string) => void) | undefined = undefined;
    private _objectDescriptionChangeHandler: ((obj: MapObject, description: string) => void) | undefined = undefined;
    private _objectColorChangeHandler: ((obj: MapObject, color: string) => void) | undefined = undefined;
    private _objectStrokeWidthChangeHandler: ((obj: MapObject, width: number) => void) | undefined = undefined;
    private _objectOpacityChangeHandler: ((obj: MapObject, opcaity: number) => void) | undefined = undefined;
    private _objectPopupChangeHandler: ((obj: MapObject, popup: string) => void) | undefined = undefined;
    private _objectCountChangeHandler: ((count: number) => void) | undefined = undefined;

    private _delAllDiv: HTMLDivElement | undefined = undefined;

    constructor() {
        super();
    }

    connectedCallback(): void {
        this._objectList = document.createElement('div');

        this._objectListEmptyDiv = document.createElement("div");
        this._objectListEmptyDiv.className = 'empty';
        this._objectListEmptyDiv.innerHTML = 'Zatím nejsou nakreslené<br/>žádné objekty.';

        this.appendChild(this._objectListEmptyDiv);

        this._delAllDiv = document.createElement("div");
        this._delAllDiv.className = 'del-all';
        const deleteAll = new LeafButton('', 'Smazat vše', undefined, true, false, 'Smazat vše');
        this._delAllDiv.style.display = 'none';
        deleteAll.addEventListener('click', () => this._onAllObjectsRemoved!());
        this._delAllDiv.appendChild(deleteAll);
        this._hideDelAllDiv();

        this.appendChild(this._objectList);
        this.appendChild(this._delAllDiv);
    }

    handleObjectAdded(obj: MapObject) {
        this._hideObjectListEmptyDiv();
        this._showDelAllDiv();
        this._objectListItemsCount++;
        this._updateObjectHeaderContent();

        const objectDiv = document.createElement("div");
        objectDiv.dataset.objectId = obj.ID;
        const objectEditDiv = document.createElement("div");
        objectEditDiv.dataset.objectEditId = obj.ID;
        objectEditDiv.style.display = 'none';

        objectDiv.className = 'obj';
        objectDiv.addEventListener('click', () => this._onObjectSelected!(obj));

        const objDot = document.createElement("div");
        if (obj.type === "canvas") {
            objDot.className = 'obj-dot-icon';
            const icon = document.createElement('i');
            icon.className = 'fa fa-object-group';
            objDot.appendChild(icon);
        } else {
            objDot.className = 'obj-dot';
            objDot.style.background = obj.color || 'white';
        }

        const objInfo = document.createElement("div");
        objInfo.className = 'obj-info';

        const objName = document.createElement("div");
        const objDesc = document.createElement("div");

        objName.className = 'obj-name';
        objName.textContent = obj.name;
        objDesc.className = 'obj-meta';
        objDesc.textContent = obj.description || '';

        objInfo.appendChild(objName);
        objInfo.appendChild(objDesc);

        const delButton = new LeafButton('', '', 'fa fa-trash', true);
        delButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this._onObjectRemoved!(obj);
        });

        objectDiv.appendChild(objDot);
        objectDiv.appendChild(objInfo);
        objectDiv.appendChild(delButton);

        objectEditDiv.className = 'obj-editor';

        const nameField = document.createElement("div");
        nameField.className = 'field';
        const nameLabel = document.createElement("label");
        nameLabel.className = 'field-label';
        nameLabel.textContent = 'Název';
        const nameInput = new LeafInput('name', 'Název', obj.name);
        nameInput.addEventListener('change', (e) => {
            objName.textContent = (e.target as HTMLInputElement).value;
            this._objectNameChangeHandler!(obj, (e.target as HTMLInputElement).value);
        });
        nameField.appendChild(nameLabel);
        nameField.appendChild(nameInput);
        objectEditDiv.appendChild(nameField);

        const descField = document.createElement("div");
        descField.className = 'field';
        const descLabel = document.createElement("label");
        descLabel.className = 'field-label';
        descLabel.textContent = 'Popis';
        const descTextarea = document.createElement("textarea");
        descTextarea.className = 'field-textarea';
        descTextarea.placeholder = 'Popis objektu…';
        descTextarea.rows = 3;
        descTextarea.value = obj.description || '';
        descTextarea.addEventListener('change', (e) => {
            objDesc.textContent = (e.target as HTMLInputElement).value;
            this._objectDescriptionChangeHandler!(obj, (e.target as HTMLInputElement).value);
        });
        descField.appendChild(descLabel);
        descField.appendChild(descTextarea);
        objectEditDiv.appendChild(descField);

        if (obj.distance) {
            const distanceDiv = document.createElement("div");
            distanceDiv.className = 'field';
            const distanceLabel = document.createElement("label");
            distanceLabel.className = 'field-label';
            distanceLabel.textContent = 'Vzdálenost';
            const distanceVal = document.createElement("span");
            distanceVal.className = 'text-val';
            distanceVal.textContent = Utils.formatDistance(obj.distance);

            distanceDiv.appendChild(distanceLabel);
            distanceDiv.appendChild(distanceVal);
            objectEditDiv.appendChild(distanceDiv);
        }

        if (obj.circuit) {
            const circuitDiv = document.createElement("div");
            circuitDiv.className = 'field';
            const circuitLabel = document.createElement("label");
            circuitLabel.className = 'field-label';
            circuitLabel.textContent = 'Obvod';
            const circuitVal = document.createElement("span");
            circuitVal.className = 'text-val';
            circuitVal.textContent = Utils.formatDistance(obj.circuit);

            circuitDiv.appendChild(circuitLabel);
            circuitDiv.appendChild(circuitVal);
            objectEditDiv.appendChild(circuitDiv);
        }

        if (obj.area) {
            const areaDiv = document.createElement("div");
            areaDiv.className = 'field';
            const areaLabel = document.createElement("label");
            areaLabel.className = 'field-label';
            areaLabel.textContent = 'Obsah';
            const areaVal = document.createElement("span");
            areaVal.className = 'text-val';
            areaVal.textContent = Utils.formatArea(obj.area);

            areaDiv.appendChild(areaLabel);
            areaDiv.appendChild(areaVal);
            objectEditDiv.appendChild(areaDiv);
        }

        const colorField = document.createElement("div");
        colorField.className = 'field';
        const colorLabel = document.createElement("label");
        colorLabel.className = 'field-label';
        colorLabel.textContent = 'Barva';
        const colorsDiv = document.createElement("div");
        colorsDiv.className = 'colors';
        DEFAULT_EDIT_COLORS.forEach(c => {
            const colorDiv = document.createElement("div");
            colorDiv.className = 'color' + (obj.color === c ? ' selected' : '');
            colorDiv.style.background = c;
            colorDiv.addEventListener('click', () => {
                colorsDiv.querySelectorAll('.color').forEach(el => el.classList.remove('selected'));
                colorDiv.classList.add('selected');

                if (obj.type !== "canvas") {
                    objDot.style.background = c;
                }

                this._objectColorChangeHandler!(obj, c);
            });
            colorsDiv.appendChild(colorDiv);
        });
        colorField.appendChild(colorLabel);
        colorField.appendChild(colorsDiv);
        objectEditDiv.appendChild(colorField);

        const strokeField = document.createElement("div");
        strokeField.className = 'field';
        const strokeLabel = document.createElement("label");
        strokeLabel.className = 'field-label';
        strokeLabel.textContent = 'Tloušťka čáry';
        const strokeSlider = new LeafSlider(1, 10, obj.strokeWidth ?? 2, ' px');
        strokeSlider.onChange((val) => this._objectStrokeWidthChangeHandler!(obj, val));
        strokeField.appendChild(strokeLabel);
        strokeField.appendChild(strokeSlider);
        objectEditDiv.appendChild(strokeField);

        const opacityField = document.createElement("div");
        opacityField.className = 'field';
        const opacityLabel = document.createElement("label");
        opacityLabel.className = 'field-label';
        opacityLabel.textContent = 'Viditelnost';
        const opacitySlider = new LeafSlider(0, 100, obj.opacity * 100, '%');
        opacitySlider.onChange((val) => this._objectOpacityChangeHandler!(obj, val));
        opacityField.appendChild(opacityLabel);
        opacityField.appendChild(opacitySlider);
        objectEditDiv.appendChild(opacityField);

        const popupField = document.createElement("div");
        popupField.className = 'field';
        const popupLabel = document.createElement("label");
        popupLabel.className = 'field-label';
        popupLabel.textContent = 'Popup';
        const popupInput = new LeafInput('popup', 'Text popupu…', obj.popup);
        popupInput.addEventListener('change', (e) => this._objectPopupChangeHandler!(obj, (e.target as HTMLInputElement).value));
        popupField.appendChild(popupLabel);
        popupField.appendChild(popupInput);
        objectEditDiv.appendChild(popupField);

        this._objectList!.appendChild(objectDiv);
        this._objectList!.appendChild(objectEditDiv);
    }

    handleObjectSelected(obj: MapObject) {
        const { objectDiv, objectEditDiv } = this._getObjectDivs(obj);
        const selected = objectDiv!.classList.contains('selected');
        this._unselectObjDivs();
        this._hideObjEditors();
        if (!selected) {
            objectDiv!.classList.add('selected');
            this.scrollTo({behavior: "smooth", top: objectDiv!.clientTop});
            this._showObjEditor(objectEditDiv!);
        }
    }

    handleObjectRemoved(object: MapObject) {
        const { objectDiv, objectEditDiv } = this._getObjectDivs(object);
        this._unselectObjDivs();

        objectDiv.remove();
        objectEditDiv.remove();

        this._objectListItemsCount--;
        this._updateObjectHeaderContent();
        if (this._objectListItemsCount === 0) {
            this._hideDelAllDiv();
            this._showObjectListEmptyDiv();
        }
    }

    handleAllObjectsRemoved() {
        this._removeObjDivs();
        this._objectListItemsCount = 0;
        this._updateObjectHeaderContent();
        this._hideDelAllDiv();
        this._showObjectListEmptyDiv();
    }

    handleObjectDeselected() {
        this._unselectObjDivs();
        this._hideObjEditors();
    }

    deselectObject() {
        this._onObjectDeselect!();
    }

    _getObjectDivs(object: MapObject): ObjectDivs {
        const objectDivOpt = this._objectList!.querySelector(`[data-object-id="${object.ID}"]`)!;
        const objectEditDivOpt = this._objectList!.querySelector(`[data-object-edit-id="${object.ID}"]`)!;
        if (!objectDivOpt || !objectEditDivOpt) {
            throw new Error("This object is not in the UI so it cannot be selected, id: " + object.ID);
        }

        return {
            objectDiv: objectDivOpt as HTMLDivElement,
            objectEditDiv: objectEditDivOpt as HTMLDivElement
        };
    }

    _showObjEditor(objEditDiv: HTMLDivElement) {
        objEditDiv.style.display = 'block';
    }

    _hideObjEditors() {
        this._objectList?.querySelectorAll('.obj-editor').forEach((el) => {
            (el as HTMLDivElement).style.display = 'none';
        });
    }

    onObjectSelected(handler: (obj: MapObject) => void) {
        this._onObjectSelected = handler;
    }

    onObjectRemoved(handler: (obj: MapObject) => void) {
        this._onObjectRemoved = handler;
    }

    onObjectRemoveAll(handler: () => void) {
        this._onAllObjectsRemoved = handler;
    }

    onObjectDeselect(handler: () => void) {
        this._onObjectDeselect = handler;
    }

    _updateObjectHeaderContent() {
        this._objectCountChangeHandler!(this._objectListItemsCount);
    }

    _hideObjectListEmptyDiv() {
        this._objectListEmptyDiv!.style.display = 'none';
    }

    _showObjectListEmptyDiv() {
        this._objectListEmptyDiv!.style.display = 'block';
    }

    _hideDelAllDiv() {
        this._delAllDiv!.style.display = 'none';
    }

    _showDelAllDiv() {
        this._delAllDiv!.style.display = 'flex';
    }

    _unselectObjDivs() {
        this._objectList?.querySelectorAll('.obj').forEach((el) => {
           el.classList.remove('selected');
        });
    }

    _removeObjDivs() {
        this._objectList?.querySelectorAll('.obj').forEach((el) => {
            el.remove();
        });
        this._objectList?.querySelectorAll('.obj-editor').forEach((el) => {
            el.remove();
        });
    }

    onObjectNameChange(handler: (obj: MapObject, name: string) => void) {
        this._objectNameChangeHandler = handler;
    }

    onObjectDescriptionChange(handler: (obj: MapObject, description: string) => void) {
        this._objectDescriptionChangeHandler = handler;
    }

    onObjectColorChange(handler: (obj: MapObject, color: string) => void) {
        this._objectColorChangeHandler = handler;
    }

    onObjectStrokeWidthChange(handler: (obj: MapObject, width: number) => void) {
        this._objectStrokeWidthChangeHandler = handler;
    }

    onObjectOpacityChange(handler: (obj: MapObject, opacity: number) => void) {
        this._objectOpacityChangeHandler = handler;
    }

    onObjectPopupChange(handler: (obj: MapObject, popup: string) => void) {
        this._objectPopupChangeHandler = handler;
    }

    onObjectCountChange(handler: (count: number) => void) {
        this._objectCountChangeHandler = handler;
    }
}

customElements.define('leaf-map-objects', MapObjectsView);
