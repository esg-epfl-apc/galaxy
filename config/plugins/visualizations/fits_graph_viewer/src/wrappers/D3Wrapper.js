import {ConfigurationEvent} from "../events/ConfigurationEvent";
import {DataProcessorContainer} from "../containers/DataProcessorContainer";
import {VisualizationContainer} from "../containers/VisualizationContainer";
import {SettingsConfiguration} from "../settings/SettingsConfiguration";

export class D3Wrapper {

    static library = "d3";
    static container_id = "visualization-container";

    static specific_settings = {
        'd3-settings': {
            display: true,
            'd3-options': {
                'has_line': true,
                display: false
            }
        }
    };

    container;
    container_id;

    settings_object;
    configuration_object = null;

    constructor(container_id = D3Wrapper.container_id) {
        this._setupListeners();

        this.container_id = container_id;
        this._setContainer();
    }

    _setupListeners() {
        document.addEventListener('settings-changed', this.handleSettingsChangedEvent.bind(this));
        document.addEventListener('visualization-generation', this.handleVisualizationGenerationEvent.bind(this));
    }

    handleSettingsChangedEvent(event) {
        let settings_object = event.detail.settings_object;

        let library_settings = settings_object.getLibrarySettings();

        if(library_settings.library === D3Wrapper.library) {
            this.createConfigurationObject();

            if(this.configuration_object !== null) {
                let configuration_event = new ConfigurationEvent(this.configuration_object);
                configuration_event.dispatchToSubscribers();
            }
        }

    }

    handleVisualizationGenerationEvent(event) {
        this.settings_object = event.detail.settings_object;

        let library_settings = this.settings_object.getLibrarySettings();

        if(library_settings.library === D3Wrapper.library) {

            this.resetContainer();

            let dataset_settings = {};

            let data_type = this.settings_object.getDataTypeSettings();
            let axis = this.settings_object.getAxisSettings();
            let scales = this.settings_object.getScalesSettings();
            let error_bars = this.settings_object.getErrorBarsSettings();
            let ranges = this.settings_object.getRangesSettings();

            let has_error_bars = false;

            dataset_settings.data_type = data_type;

            let axis_settings = [];
            for(let axis_column in axis) {
                let axis_column_object = this._getColumnSettings(axis[axis_column]);
                axis_column_object = {...axis_column_object, ...{axis: axis_column}}

                axis_settings.push(axis_column_object);
            }

            dataset_settings.axis = axis_settings;

            if(error_bars !== null) {
                has_error_bars = true;

                let error_bars_settings = [];
                for(let axis_column in error_bars) {
                    let axis_column_object = this._getColumnSettings(error_bars[axis_column]);
                    axis_column_object = {...axis_column_object, ...{axis: axis_column}}

                    error_bars_settings.push(axis_column_object);
                }

                dataset_settings.error_bars = error_bars_settings;
            }

            let dpp = DataProcessorContainer.getDataProcessorContainer().getDataPreProcessor();

            let processed_data = dpp.getProcessedDataset(dataset_settings);
            let processed_json_data = dpp.datasetToJSONData(processed_data);

            axis = {x: processed_data.axis[0].column_name, y: processed_data.axis[1].column_name};

            if(has_error_bars) {
                error_bars = {x: processed_data.error_bars[0].column_name, y: processed_data.error_bars[1].column_name};
                error_bars = dpp.processErrorBarDataJSON(processed_json_data, axis, error_bars)
            }

            if(ranges != null) {
                let custom_range_data = null;

                if(has_error_bars) {
                    custom_range_data = dpp.processDataForRange(ranges, processed_json_data, error_bars);
                    processed_json_data = custom_range_data.data;
                    error_bars = custom_range_data.error_bars;
                } else {
                    custom_range_data = dpp.processDataForRange(ranges, processed_json_data);
                    processed_json_data = custom_range_data.data;
                }
            }

            let visualization = VisualizationContainer.getD3Visualization();

            visualization.initializeSettings(processed_json_data, axis, scales, error_bars, false, null);
            visualization.initializeGraph();
        }

    }

    _setContainer() {
        this.container = document.getElementById(this.container_id)
    }

    resetContainer() {
        this.container.innerHTML = "";
    }

    createConfigurationObject() {
        this.configuration_object = SettingsConfiguration.getConfigurationObject(D3Wrapper.specific_settings);
    }

    _getColumnSettings(column_settings) {
        let settings = column_settings.split('$');

        let column_location = settings[0].split('.');
        let column_name = settings[1] || '';

        let file_id = column_location[0];
        let hdu_index = column_location.length > 1 ? column_location[1] : '';

        return {
            file_id: file_id,
            hdu_index: hdu_index,
            column_name: column_name
        };
    }

}