import {WrapperContainer} from "../containers/WrapperContainer";
import {FileRegistry} from "../registries/FileRegistry";
import {FileRegistryChangeEvent} from "../events/FileRegistryChangeEvent";
import {FITSSettingsComponent} from "./file_type/FITSSettingsComponent";

export class FileComponent extends HTMLElement {

    static component_id = "file_component";
    static select_file = "select-file";
    static input_file_url = "file-input-url";
    static input_file_local = "file-input-local";
    static input_file_type = "select-file-type";
    static load_button = "load-file";

    static available_files_list_id = 'available-files-list';
    static current_files_list_id = 'current-files-list';

    static file_settings_container_id = 'file-settings-container';

    static save_button_id = 'save-file-settings';
    static add_button_id = 'add-to-plot'
    static remove_button_id = 'remove-from-plot'

    container_id;
    container;

    fits_reader_wrapper = null;

    constructor(container_id) {
        super();
        this.container_id = container_id;
        this._setContainer();

        this.handleFITSLoadedEvent = this.handleFITSLoadedEvent.bind(this);
        this.handleSelectChangeEvent = this.handleSelectChangeEvent.bind(this);
        this.handleLoadFileEvent = this.handleLoadFileEvent.bind(this);
        this.handleFileLoadedEvent = this.handleFileLoadedEvent.bind(this);
        this.handleFileRegistryChangeEvent = this.handleFileRegistryChangeEvent.bind(this);

        this._setupExternalListeners();
        this._setupInnerListeners();

        this._setupInnerElementsListeners();
    }

    _setupExternalListeners() {
        this.addEventListener('fits-loaded', this.handleFITSLoadedEvent);
        this.addEventListener('file-loaded', this.handleFileLoadedEvent)
        this.addEventListener('file-registry-change', this.handleFileRegistryChangeEvent)
    }

    _setupInnerListeners() {
        this.addEventListener('select-change', this.handleSelectChangeEvent);
        this.addEventListener('load-file', this.handleLoadFileEvent);
    }

    _setupInnerElementsListeners() {
        this._setLoadLocalFileButtonListener();
        this._setFilesListsListeners();
    }

    _setLoadLocalFileButtonListener() {
        let file_input = document.getElementById(FileComponent.input_file_local);
        let type_input = document.getElementById(FileComponent.input_file_type);

        let file_type = type_input.value;

        file_input.addEventListener('change', function(event) {
            let file = event.target.files[0];

            if(file_type === 'fits') {
                file.arrayBuffer().then(arrayBuffer => {
                    let fits_reader_wrapper = WrapperContainer.getFITSReaderWrapper();

                    fits_reader_wrapper.initializeFromBuffer(arrayBuffer, file.name);

                }).catch(error => {
                    console.error('Error reading file as ArrayBuffer:', error);
                });
            } else if(file_type === 'csv') {
                let reader = new FileReader();
                reader.onload = function(event) {
                    let csv_file = event.target.result;
                };
            }

        });

    }

    _setFilesListsListeners() {
        let list_available = document.getElementById(FileComponent.available_files_list_id);
        let list_current = document.getElementById(FileComponent.current_files_list_id);

        let buttons_available = list_available.querySelectorAll("button");
        let buttons_current = list_current.querySelectorAll("button");

        let buttons = Array.from(buttons_available).concat(Array.from(buttons_current));

        buttons.forEach(button => {
            button.addEventListener("click", () => {

                button.classList.toggle("active");

                let aria_current = button.getAttribute("aria-current");
                if (aria_current && aria_current === "true") {
                    button.removeAttribute("aria-current");
                    this.clearFileSettingsPanel();
                } else {
                    button.setAttribute("aria-current", "true");

                    let file = FileRegistry.getFileById(button.getAttribute("data-id"));
                    this.setFileSettingsPanel(file);
                }

                let buttons_to_filter = Array.from(buttons);

                let filtered_buttons = buttons_to_filter.filter(list_button => list_button !== button);

                filtered_buttons.forEach(filtered_button => {
                    filtered_button.classList.remove('active');
                    filtered_button.removeAttribute('aria-current');
                })

            });
        });
    }

    _setFileSettingsButtonsListeners() {
        let save_button = document.getElementById(FileComponent.save_button_id);
        let add_button = document.getElementById(FileComponent.add_button_id);

        save_button.addEventListener('click', (event) => {

        });

        add_button.addEventListener('click', (event) => {
            let btn = event.target;
            let file_id = btn.getAttribute('data-id');

            let file = FileRegistry.getFileById(file_id);

            FileRegistry.addToCurrentFiles(file);

            this.updateCurrentFilesList();
            this.updateAvailableFilesList();

            let frce = new FileRegistryChangeEvent();
            frce.dispatchToSubscribers();
        });
    }

    handleFITSLoadedEvent(event) {
        this.fits_reader_wrapper = event.detail['fits_reader_wrapper'];
        let file_path = this.fits_reader_wrapper.getFilePath();

        this._addFileToSelect(file_path);
    }

    handleFileLoadedEvent(event) {
        FileRegistry.addToAvailableFiles(event.detail);

        this.updateAvailableFilesList();
        this._setFilesListsListeners();
    }

    handleFileRegistryChangeEvent(event) {
        this.updateAvailableFilesList();
        this.updateCurrentFilesList();

        this._setFilesListsListeners();
    }

    handleLoadFileEvent(event) {

    }

    updateFilesLists() {
        this.updateAvailableFilesList();
        this.updateCurrentFilesList();
    }

    updateAvailableFilesList() {
        let available_files_list_element = document.getElementById(FileComponent.available_files_list_id);

        available_files_list_element.innerHTML = '';

        let file_elements = this._createFileSelection('available');

        file_elements.forEach((file_element) => {
            available_files_list_element.appendChild(file_element);
        })
    }

    updateCurrentFilesList() {
        let current_files_list_element = document.getElementById(FileComponent.current_files_list_id);

        current_files_list_element.innerHTML = '';

        let file_elements = this._createFileSelection('current');

        file_elements.forEach((file_element) => {
            current_files_list_element.appendChild(file_element);
        })
    }

    clearFileSettingsPanel() {
        let file_settings_component_container = document.getElementById(FileComponent.file_settings_container_id);
        file_settings_component_container.innerHTML = '';
    }

    setFileSettingsPanel(file) {
        this.clearFileSettingsPanel();

        if(file.type === 'fits') {

            let is_current = FileRegistry.isFileCurrent(file.id);

            let file_settings_component = new FITSSettingsComponent(file, is_current);

            let file_settings_component_container = document.getElementById(FileComponent.file_settings_container_id);
            file_settings_component_container.appendChild(file_settings_component);

            file_settings_component.setupComponent();
        }

    }

    _addFileToSelect(file) {
        let file_option = this._createSelectOption(file);
        let select = document.getElementById(FileComponent.select_file);

        select.add(file_option);
    }

    _createFileSelection(list = 'available') {
        let files;

        if(list === 'available') {
            files = FileRegistry.getAvailableFilesList();
        } else {
            files = FileRegistry.getCurrentFilesList();
        }

        let selection_elements = [];

        let file_selection;
        files.forEach((available_file) => {
            let file_uid = available_file.id+'.'+available_file.file_name;

            file_selection = document.createElement("button");
            file_selection.setAttribute("type", "button");
            file_selection.setAttribute("class", "available-file-selection list-group-item list-group-item-action");
            file_selection.setAttribute("data-id", available_file.id);
            file_selection.textContent = file_uid;

            selection_elements.push(file_selection);
        })

        return selection_elements;
    }

    _createSelectOption(file_path) {
        let option = document.createElement("option");

        option.value = file_path;
        option.text = file_path;

        return option;
    }

    handleSelectChangeEvent(event) {
        event.stopPropagation();

    }

    _setContainer() {
        this.container = document.getElementById(this.container_id)
    }

    resetContainer() {
        this.container.innerHTML = "";
    }

}