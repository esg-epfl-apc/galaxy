import {ConfigurationEvent} from "../events/ConfigurationEvent";
import {DataProcessorContainer} from "../containers/DataProcessorContainer";
import {VisualizationContainer} from "../containers/VisualizationContainer";
import {WrapperContainer} from "../containers/WrapperContainer";
import {SettingsConfiguration} from "../settings/SettingsConfiguration";

export class BokehWrapper {

    static container_id = 'visualization-container';

    static library = 'bokeh';

    static title = {
        'light-curve': 'Light curve',
        'spectrum': 'spectrum'
    }

    static specific_settings = {
        'bokeh-settings': {
            display: true,
            'bokeh-options': {
                tools: {
                    display: false
                }
            }
        }
    };

    container = null;

    configuration_object = null;

    constructor() {
        this._setContainer();
        this._setupListeners();
    }

    _setContainer() {
        this.container = document.getElementById(BokehWrapper.container_id);
    }

    _resetContainer() {
        this.container.innerHTML = "";
    }

    _setupListeners() {
        document.addEventListener('settings-changed', this.handleSettingsChangedEvent.bind(this));
        document.addEventListener('visualization-generation', this.handleVisualizationGenerationEvent.bind(this));
    }

    handleSettingsChangedEvent(event) {
        let settings_object = event.detail.settings_object;

        let library_settings = settings_object.getLibrarySettings();

        if(library_settings.library === BokehWrapper.library) {
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

        if(library_settings.library === BokehWrapper.library) {

            this._resetContainer();

            let dataset_settings = {};

            let axis = this.settings_object.getAxisSettings();
            let axis_settings = [];

            for(let axis_column in axis) {
                let axis_column_object = this._getColumnSettings(axis[axis_column]);
                axis_column_object = {...axis_column_object, ...{axis: axis_column}}

                axis_settings.push(axis_column_object);
            }

            dataset_settings.axis = axis_settings;
            dataset_settings.data_type = this.settings_object.getDataTypeSettings();

            let error_bars = this.settings_object.getErrorBarsSettings();
            let has_error_bars = false;

            if(error_bars !== null) {

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

            let data_type = this.settings_object.getDataTypeSettings();
            let hdu = this.settings_object.getHDUsSettings();

            let scales = this.settings_object.getScalesSettings();


            axis = {x: processed_data.axis[0].column_name, y: processed_data.axis[1].column_name};
            let labels = axis;

            processed_data.axis[0].data = processed_data.axis[0].data.map(value => isNaN(value) ? 0 : value);
            processed_data.axis[1].data = processed_data.axis[1].data.map(value => isNaN(value) ? 0 : value);


            let data = {x: processed_data.axis[0].data, y: processed_data.axis[1].data};

            if(error_bars) {
                error_bars = {x: processed_data.error_bars[0].column_name, y: processed_data.error_bars[1].column_name};

                processed_data.error_bars[0].data = processed_data.error_bars[0].data.map(value => !isFinite(value) ? 0 : value);
                processed_data.error_bars[1].data = processed_data.error_bars[1].data.map(value => !isFinite(value) ? 0 : value);

                data.dx = processed_data.error_bars[0].data.map(value => isNaN(value) ? 0 : value);
                data.dy = processed_data.error_bars[1].data.map(value => isNaN(value) ? 0 : value);

                data = this._processErrorBarData(data);

                has_error_bars = true;
            }

            let ranges = this.settings_object.getRangesSettings();
            let has_custom_range = false;
            let custom_range_data = null;

            if(ranges != null) {

                if(has_error_bars) {
                    custom_range_data = dpp.processDataForRangeBokeh(ranges, data, true);
                } else {
                    custom_range_data = dpp.processDataForRangeBokeh(ranges, data);
                }

                data = custom_range_data;
            }

            let visualization = VisualizationContainer.getBokehVisualization();

            visualization.initializeSettings(data, labels, scales, BokehWrapper.title['data_type'], error_bars, ranges);

            visualization.initializeGraph();
        }
    }

    getProcessedData(data_type, hdu_index, axis, error_bars) {
        let data = null;

        let dpc = DataProcessorContainer.getDataProcessorContainer();
        let data_processor;

        let frw = WrapperContainer.getFITSReaderWrapper();

        if(data_type === 'light-curve') {
            data_processor = dpc.getLightCurveProcessor(frw, hdu_index);
        } else if(data_type === 'spectrum') {
            data_processor = dpc.getSpectrumProcessor(frw, hdu_index);
        }

        data = data_processor.processDataRawJSON(axis, error_bars);

        if(error_bars) {
            data = this._processErrorBarData(data);
        }

        return data;
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

    _processErrorBarData(data) {

        let y_low = [], y_up = [], x_low = [], x_up = [];

        for (let i in data.dy) {
            y_low[i] = data.y[i] - data.dy[i];
            y_up[i] = data.y[i] + data.dy[i];
            x_low[i] = data.x[i] - data.dx[i] / 2;
            x_up[i] = data.x[i] + data.dx[i] / 2;
        }

        data.y_low = y_low;
        data.y_up = y_up;
        data.x_low = x_low;
        data.x_up = x_up;

        delete data.dy;
        delete data.dx;

        return data;
    }

    createConfigurationObject() {
        this.configuration_object = SettingsConfiguration.getConfigurationObject(BokehWrapper.specific_settings);
    }

}