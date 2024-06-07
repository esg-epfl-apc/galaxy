import {SettingsContainer} from "../containers/SettingsContainer";
import {SettingsChangedEvent} from "../events/SettingsChangedEvent";
import {VisualizationGenerationEvent} from "../events/VisualizationGenerationEvent";
import {FileRegistry} from "../registries/FileRegistry";
import {WrapperContainer} from "../containers/WrapperContainer";

export class SettingsComponent extends HTMLElement {

    container_id;
    container

    static component_id = "settings_component";
    static container_id = "settings-component";

    static select_library_id = "select-library";

    static select_data_type_id = "select-data-type";

    static light_curve_settings_id = "light-curve-settings"
    static spectrum_settings_id = "spectrum-settings"

    static select_hdus_id = "select-hdus";

    static calculation_radio_class = "calculation-radio";

    static select_axis_x_id = "select-axis-x";
    static select_axis_y_id = "select-axis-y";

    static select_error_bar_x_id = "select-axis-x-error-bar";
    static select_error_bar_y_id = "select-axis-y-error-bar";

    static supported_data_types = ['generic', 'light-curve', 'spectrum'];

    fits_reader_wrapper = null;
    settings_object = null;

    constructor() {
        super();

        this.container_id = SettingsComponent.container_id;
        this._setContainer();

        this.settings_object = SettingsContainer.getSettingsContainer().getVisualizationSettingsObject();

        this.handleFITSLoadedEvent = this.handleFITSLoadedEvent.bind(this);
        this.handleConfigurationEvent = this.handleConfigurationEvent.bind(this);

        this.handleLibraryChangeEvent = this.handleLibraryChangeEvent.bind(this);
        this.handleDataTypeChangeEvent = this.handleDataTypeChangeEvent.bind(this);
        this.handleHDUsChangeEvent = this.handleHDUsChangeEvent.bind(this);
        this.handleGenerateEvent = this.handleGenerateEvent.bind(this);
        this.handleFileChangeEvent = this.handleFileChangeEvent.bind(this);

        this._setupExternalListeners();
        this._setupInnerListeners();

        this._setupInnerElementsListeners();
    }

    _setupExternalListeners() {
        this.addEventListener('fits-loaded', this.handleFITSLoadedEvent);
        this.addEventListener('configuration', this.handleConfigurationEvent);
        this.addEventListener('file-registry-change', this.handleFileChangeEvent);
    }

    _setupInnerListeners() {
        this.addEventListener('select-library-change', this.handleLibraryChangeEvent);
        this.addEventListener('select-data-type-change', this.handleDataTypeChangeEvent);
        this.addEventListener('select-hdus-change', this.handleHDUsChangeEvent);
        this.addEventListener('button-generate-click', this.handleGenerateEvent);
    }

    _setupInnerElementsListeners() {
        this._setSelectLibraryListener();
        this._setSelectDataTypeListener()
        this._setSelectHDUsListener();
        this._setGenerateButtonListener();
        this._setCalculationRadioListeners();
    }

    handleFITSLoadedEvent(event) {
        this.fits_reader_wrapper = event.detail['fits_reader_wrapper'];

        let hdus = this.fits_reader_wrapper.getHDUs();
        this._setSelectHDUs(hdus);

        if(this.fits_reader_wrapper.isHDUTabular(hdus[0].index)) {
            let hdu_columns_name = this.fits_reader_wrapper.getColumnsNameFromHDU(hdus[0].index);

            this._setSelectAxis(hdu_columns_name);
            this._setSelectErrorBars(hdu_columns_name);

        } else {
            this._resetSelectAxis();
            this._resetSelectErrorBars()
        }

    }

    handleConfigurationEvent(event) {
        let configuration_object = event.detail.configuration_object;

        this.updateSettings(configuration_object);
    }

    handleLibraryChangeEvent(event) {
        event.stopPropagation();

        this.updateSettingsObject();

        let settings_changed_event = new SettingsChangedEvent(this.settings_object);
        settings_changed_event.dispatch();
    }

    handleDataTypeChangeEvent(event) {
        event.stopPropagation();
        let data_type = event.detail.data_type;

        if(SettingsComponent.supported_data_types.includes(data_type)) {
            this.updateSettingsObject();

            switch(data_type) {

                case 'light-curve':
                    document.getElementById(SettingsComponent.light_curve_settings_id).style.display = 'block';
                    document.getElementById(SettingsComponent.spectrum_settings_id).style.display = 'none';
                    break;

                case 'spectrum':
                    document.getElementById(SettingsComponent.spectrum_settings_id).style.display = 'block';
                    document.getElementById(SettingsComponent.light_curve_settings_id).style.display = 'none';
                    break;

                default:
                    document.getElementById(SettingsComponent.spectrum_settings_id).style.display = 'none';
                    document.getElementById(SettingsComponent.light_curve_settings_id).style.display = 'none';
            }

        }

    }

    handleHDUsChangeEvent(event) {
        event.stopPropagation();
        let hdu_index = event.detail.hdu_index;

        if(this.fits_reader_wrapper.isHDUTabular(hdu_index)) {
            let hdu_columns_name = this.fits_reader_wrapper.getColumnsNameFromHDU(hdu_index);

            this._setSelectAxis(hdu_columns_name);
            this._setSelectErrorBars(hdu_columns_name);

        } else {
            this._resetSelectAxis();
            this._resetSelectErrorBars()
        }
    }

    handleGenerateEvent(event) {
        event.stopPropagation();

        this.settings_object.reset();

        this.updateSettingsObject();

        let visualization_generation_event = new VisualizationGenerationEvent(this.settings_object);
        visualization_generation_event.dispatch();

    }

    handleFileChangeEvent(event) {
        let current_file_list = FileRegistry.getCurrentFilesList();
        let columns = [];

        current_file_list.forEach((file) => {

            if(file.type === 'fits') {
                let fits_reader_wrapper = WrapperContainer.getFITSReaderWrapper();

                fits_reader_wrapper.setFile(file.file);
                let fits_columns = fits_reader_wrapper.getAllColumns();

                fits_columns.forEach((fits_column) => {
                    let column = {...fits_column, file_id: file.id};
                    columns.push(column);
                })

            } else if(file.type === 'csv') {

            }
        })

        let columns_by_file = columns.reduce((acc, column) => {
            if (!acc[column.file_id]) {
                acc[column.file_id] = [];
            }
            acc[column.file_id].push(column);
            return acc;
        }, {});

        let select_options = [];

        let i = 1;
        for (let file_id in columns_by_file) {
            if (columns_by_file.hasOwnProperty(file_id)) {
                let file = FileRegistry.getFileById(file_id);
                let file_name = file.file_name;

                let frw = WrapperContainer.getFITSReaderWrapper();
                frw.setFile(file.file);

                select_options.push(this._createFileColumnsOptionsGroup(columns_by_file[file_id], file_name, 'opt-group', frw));
            }
            i++;
        }

        this._setSelectGroupAxis(select_options);
        this._setSelectGroupErrorBars(select_options);
    }

    _setContainer() {
        this.container = document.getElementById(this.container_id)
    }

    _resetContainer() {
        this.container.innerHTML = "";
    }

    _setSelectHDUs(hdus) {
        this._resetSelectHDUs();

        let select = document.getElementById(SettingsComponent.select_hdus_id);

        let options = this._createHDUsOptions(hdus);

        options.forEach(function(option) {
            select.add(option);
        });
    }

    _resetSelectHDUs() {
        let select = document.getElementById(SettingsComponent.select_hdus_id);
        select.innerHTML = '';
    }

    _createHDUsOptions(HDUs) {
        let options = [];
        let option;

        HDUs.forEach(function(hdu, index) {
            option = document.createElement("option");

            if(index === 0) option.setAttribute('selected', 'true');

            option.value = hdu.index;
            option.text = hdu.name;

            options.push(option);
        })

        return options;
    }

    _createFileColumnsOptionsGroup(file_columns, group_name, group_class, fits_reader_wrapper) {

        let opt_group = document.createElement("optgroup");
        opt_group.label = group_name;
        opt_group.className += group_class;

        file_columns.forEach(column => {
            let option = document.createElement("option");

            let hdu_type = fits_reader_wrapper.getHeaderCardValueByNameFromHDU(column.hdu_index, 'XTENSION');
            let hdu_extname = fits_reader_wrapper.getHeaderCardValueByNameFromHDU(column.hdu_index, 'EXTNAME');
            let name = hdu_type+'-'+hdu_extname+' '+column.name;

            if(column.is_from_header) {
                name += '(HEADER)';
            }

            if(column.is_processed) {
                option.text = name;
                option.value = `${column.from_file}.${column.hdu_index}$${column.name}`;
            } else {
                option.text = name;
                option.value = `${column.file_id}.${column.hdu_index}$${column.name}`;
            }
            
            opt_group.appendChild(option);
        });

        return opt_group
    }

    _setSelectAxis(columns) {
        this._resetSelectAxis();

        let select_axis_x = document.getElementById(SettingsComponent.select_axis_x_id);
        let select_axis_y = document.getElementById(SettingsComponent.select_axis_y_id);

        let select_axis = [select_axis_x, select_axis_y];

        let options = this._createColumnsOptions(columns);

        options.forEach(function(option) {
            select_axis.forEach(function(select) {
                let cloned_option = option.cloneNode(true);
                select.add(cloned_option);
            })
        });
    }

    _setSelectGroupAxis(columns_optgroup) {
        this._resetSelectAxis();

        let select_axis_x = document.getElementById(SettingsComponent.select_axis_x_id);
        let select_axis_y = document.getElementById(SettingsComponent.select_axis_y_id);

        let select_axis = [select_axis_x, select_axis_y];

        columns_optgroup.forEach((column_optgroup) => {
            select_axis.forEach((select) => {
                let cloned_optgroup = column_optgroup.cloneNode(true);
                select.add(cloned_optgroup);
            })
        })

    }

    _resetSelectAxis() {
        let select_axis_x = document.getElementById(SettingsComponent.select_axis_x_id);
        let select_axis_y = document.getElementById(SettingsComponent.select_axis_y_id);

        select_axis_x.innerHTML = '';
        select_axis_y.innerHTML = '';
    }

    _setSelectErrorBars(columns) {
        this._resetSelectErrorBars();

        let select_error_bar_x = document.getElementById(SettingsComponent.select_error_bar_x_id);
        let select_error_bar_y = document.getElementById(SettingsComponent.select_error_bar_y_id);

        let select_error_bars = [select_error_bar_x, select_error_bar_y];

        let options = this._createColumnsOptions(columns);

        options.forEach(function(option) {
            select_error_bars.forEach(function(select) {
                let cloned_option = option.cloneNode(true);
                select.add(cloned_option);
            })
        });
    }

    _setSelectGroupErrorBars(columns_optgroup) {
        this._resetSelectErrorBars();

        let select_error_bar_x = document.getElementById(SettingsComponent.select_error_bar_x_id);
        let select_error_bar_y = document.getElementById(SettingsComponent.select_error_bar_y_id);

        let select_error_bars = [select_error_bar_x, select_error_bar_y];

        columns_optgroup.forEach((column_optgroup) => {
            select_error_bars.forEach((select) => {
                let cloned_optgroup = column_optgroup.cloneNode(true);
                select.add(cloned_optgroup);
            })
        })
    }

    _resetSelectErrorBars() {
        let select_error_bar_x = document.getElementById(SettingsComponent.select_error_bar_x_id);
        let select_error_bar_y = document.getElementById(SettingsComponent.select_error_bar_y_id);

        select_error_bar_x.innerHTML = '';
        select_error_bar_y.innerHTML = '';
    }

    _createColumnsOptions(columns) {
        let options = [];
        let option;

        columns.forEach(function(column) {

            option = document.createElement("option");

            option.value = column;
            option.text = column;

            options.push(option);
        })

        return options;
    }

    _setSelectLibraryListener() {
        let select_library = document.getElementById(SettingsComponent.select_library_id);

        select_library.addEventListener('change', (event) => {
            event.preventDefault();
            const custom_change_event = new CustomEvent('select-library-change', {
                bubbles: false,
                compose: false,
                cancelable: true,
                detail: {
                    library: select_library.value
                }
            });

            this.dispatchEvent(custom_change_event);
        });
    }

    _setSelectDataTypeListener() {
        let select_data_type = document.getElementById(SettingsComponent.select_data_type_id);

        select_data_type.addEventListener('change', (event) => {
            event.preventDefault();
            const custom_change_event = new CustomEvent('select-data-type-change', {
                bubbles: false,
                compose: false,
                cancelable: true,
                detail: {
                    data_type: select_data_type.value
                }
            });

            this.dispatchEvent(custom_change_event);
        });
    }

    _setSelectHDUsListener() {
        let select_hdus = document.getElementById(SettingsComponent.select_hdus_id);

        select_hdus.addEventListener('change', (event) => {
            event.preventDefault();
            const custom_change_event = new CustomEvent('select-hdus-change', {
                bubbles: false,
                compose: false,
                cancelable: true,
                detail: {
                    hdu_index: select_hdus.value
                }
            });

            this.dispatchEvent(custom_change_event);
        });
    }

    _setCalculationRadioListeners() {
        let radio_buttons = document.querySelectorAll('.' + SettingsComponent.calculation_radio_class);
        radio_buttons.forEach(radio_button => {
            radio_button.addEventListener('change', event => {

            });
        });
    }

    _setGenerateButtonListener() {
        let button_generate = document.getElementById('button-generate');

        button_generate.addEventListener('click', (event) => {
            event.preventDefault();
            const custom_change_event = new CustomEvent('button-generate-click', {
                bubbles: false,
                compose: false,
                cancelable: true,
                detail: {

                }
            });

            this.dispatchEvent(custom_change_event);
        });
    }

    updateSettings(configuration) {
        for (let [setting, values] of Object.entries(configuration)) {

            let setting_element = document.getElementById(setting);
            if (setting_element) {

                if (values.display === true) {
                    setting_element.style.display = 'block';
                } else {
                    setting_element.style.display = 'none';
                }
            } else {

            }
        }
    }

    updateSettingsObject() {
        let values = this._extractFormValues();

        let library = {};
        library.library = values['select-library'].value;
        this.settings_object.setLibrarySettings(library);

        let hdu = {};
        hdu['hdu_index'] = values['select-hdus'].value;
        this.settings_object.setHDUsSettings(hdu);

        let data_type = {};

        data_type.type = values['select-data-type'].value;
        this.settings_object.setDataTypeSettings(data_type);

        if(values['select-axis-x'] && values['select-axis-y']) {
            let axis = {};
            let scales = {};

            axis.x = values['select-axis-x'].value;
            axis.y = values['select-axis-y'].value;

            scales.x = values['select-axis-x-scale'].value;
            scales.y = values['select-axis-y-scale'].value;

            this.settings_object.setAxisSettings(axis);
            this.settings_object.setScalesSettings(scales);
        }

        if(values['has-error-bars-checkbox']) {
            if(values['has-error-bars-checkbox'].checked === true) {
                let error_bars = {};

                error_bars.x = values['select-axis-x-error-bar'].value;
                error_bars.y = values['select-axis-y-error-bar'].value;

                this.settings_object.setErrorBarsSettings(error_bars);
            }
        }

        if(values['has-x-range-checkbox'].checked === true || values['has-y-range-checkbox'].checked === true) {

            let ranges = {
                x: {},
                y: {}
            };

            if(values['has-x-range-checkbox'].checked === true) {
                ranges['x'].lower_bound = values['x-lower-bound'].value;
                ranges['x'].upper_bound = values['x-higher-bound'].value;
            } else {
                ranges['x'] = null;
            }

            if(values['has-y-range-checkbox'].checked === true) {
                ranges['y'].lower_bound = values['y-lower-bound'].value;
                ranges['y'].upper_bound = values['y-higher-bound'].value;
            } else {
                ranges['y'] = null;
            }

            this.settings_object.setRangesSettings(ranges);
        } else {
            this.settings_object.setRangesSettings(null);
        }

    }

    _extractFormValues() {

        let form_values = {};

        let selects = this.container.querySelectorAll('.form-select');

        selects.forEach(select => {
            let id = select.id;
            let classes = select.className.split(' ');
            let value = select.value;

            if(window.getComputedStyle(select, null).getPropertyValue("display") !== 'none' && value !== 'none') {
                form_values[id] = {classes, value};
            }
        });

        let checkboxes = this.container.querySelectorAll('.form-checkbox');

        checkboxes.forEach(checkbox => {

            let id = checkbox.id;
            let classes = checkbox.className.split(' ');
            let checked = checkbox.checked;

            form_values[id] = {classes, checked};
        });

        let inputs = this.container.querySelectorAll('.form-input');

        inputs.forEach(input => {
            let id = input.id;
            let classes = input.className.split(' ');
            let value = input.value;

            form_values[id] = {classes, value};
        })

        return form_values;
    }

}