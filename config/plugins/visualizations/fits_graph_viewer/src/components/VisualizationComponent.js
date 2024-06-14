export class VisualizationComponent extends HTMLElement {

    container_id;
    container

    constructor(container_id) {
        super();

        this.container_id = container_id;
        this._setContainer();
    }

    _setContainer() {
        this.container = document.getElementById(this.container_id)
    }

    resetContainer() {
        this.container.innerHTML = "";
    }

}