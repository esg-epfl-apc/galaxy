export class LightCurveProcessor {

    static header_cards = [
        'TIMEREF',
        'TIMEDEL',
        'MJDREF',
        'TSTART',
        'TSTOP',
        'TELAPSE',
        'E_MIN',
        'E_MAX',
        'E_UNIT']

    static columns_names = {
        time: 'TIME',
        timedel: 'TIMEDEL',
        rate: 'RATE',
        error: 'ERROR',
        fracexp: 'FRACEXP'
    }

    static binning_types = {
        'TIME_BASED': 'time_based',
        'EQUAL_COUNT': 'equal_count'
    }

    static bin_value_methods = [
        'mean',
        'weightedmean',
        'median',
        'wmedian',
        'stddev',
        'meddev',
        'kurtosis',
        'skewness',
        'max',
        'min',
        'sum'
    ]

    static min_columns_number = 2;
    static mandatory_columns = ['RATE'];
    static replacement_columns = ['TIMEDEL'];

    hdu;
    hdu_index = null;

    binning_type;
    method;

    fits_reader_wrapper;
    header_values = {};

    constructor(fits_reader_wrapper, hdu_index) {
        this.fits_reader_wrapper = fits_reader_wrapper;
        this.hdu_index = hdu_index;

        this._setHDU();
    }

    _setHDU() {
        this.hdu = this.fits_reader_wrapper.getHDU(this.hdu_index);
    }

    setHDU(hdu, hdu_index) {
        this.hdu = hdu;
        this.hdu_index = hdu_index;
    }

    processDataRawJSON(axis, error_bars = null) {
        //let raw_fits_data = this.hdu.data;
        let raw_fits_data = this.fits_reader_wrapper.getDataFromHDU(this.hdu_index);
        let data = {};

        let x;
        let y;

        let x_column = axis.x;
        let y_column = axis.y;

        raw_fits_data.getColumn(x_column, function(col){x = col});
        raw_fits_data.getColumn(y_column, function(col){y = col});

        data.x = x;
        data.y = y;

        if(error_bars) {

            let dy;

            let error_bar_x_column = error_bars.x;
            let error_bar_y_column = error_bars.y;

            raw_fits_data.getColumn(error_bar_y_column, function(col) {dy = col});

            data.dy = dy;
            //data.timedel = this.getTimedel(error_bar_x_column);
            //data.timedel = this.fits_reader_wrapper.getHeaderFromHDU(this.hdu_index).get("TIMEDEL");

            raw_fits_data.getColumn(error_bar_x_column, function(col) {data.timedel = col});

        }

        return data;
    }

    processDataJSON(axis, error_bars = null) {
        let raw_fits_data = this.hdu.data;
        let light_curve_data = {};

        if(!this._checkColumns()) {
            throw new Error("");
        }

        light_curve_data.main = this.fits_reader_wrapper.getColumnsJSONDataFromHDU(this.hdu_index);

        if(error_bars) {
            light_curve_data.error_bars = this._processErrorBarsDataJSON(error_bars, axis, light_curve_data.main);
        }

        return light_curve_data;
    }

    _processErrorBarsDataJSON(error_bars, axis, data) {
        let error_bar_x_values = [];
        let error_bar_y_values = [];

        let axis_x = axis.x;
        let axis_y = axis.y;

        let error_bar_x_column = error_bars.x;
        let error_bar_y_column = error_bars.y;

        data.forEach(function(datapoint){
            let error_bar_x = [
                {
                    bound: parseFloat(datapoint[axis_y]) - parseFloat(datapoint[error_bar_y_column]),
                    [axis_x]: parseFloat(datapoint[axis_x])
                },
                {
                    bound: parseFloat(datapoint[axis_y]) + parseFloat(datapoint[error_bar_y_column]),
                    [axis_x]: parseFloat(datapoint[axis_x])
                }
            ]

            let error_bar_y = [
                {
                    bound: parseFloat(datapoint[axis_x]) - parseFloat(datapoint[error_bar_x_column]),
                    [axis_y]: parseFloat(datapoint[axis_y])
                },
                {
                    bound: parseFloat(datapoint[axis_x]) + parseFloat(datapoint[error_bar_x_column]),
                    [axis_y]: parseFloat(datapoint[axis_y])
                }
            ]

            error_bar_x_values.push(error_bar_x);
            error_bar_y_values.push(error_bar_y);
        })

        return {x: error_bar_x_values, y: error_bar_y_values}
    }

    _checkColumns(required_nb_columns) {
        let is_checked = true;

        let columns_number = this.fits_reader_wrapper.getNumberOfColumnFromHDU(this.hdu_index)
        let columns_name = this.fits_reader_wrapper.getColumnsNameFromHDU(this.hdu_index)

        if(columns_number < required_nb_columns || !columns_name.includes(LightCurveProcessor.columns_names.rate)) {
            is_checked = false;
        }

        return is_checked;
    }

    getTimedel(error_bar_x = null) {
        let timedel;

        if(this.fits_reader_wrapper.getColumnsNameFromHDU(this.hdu_index).includes("TIMEDEL")) {
            data.getColumn(error_bar_x, function (col) {timedel = col});
        } else {
            let header = this.fits_reader_wrapper.getHeaderFromHDU(this.hdu_index);
            timedel = header.get("TIMEDEL");
        }

        return timedel;
    }

    _getValueFromHDUHeader() {
        let card_value;
        LightCurveProcessor.header_cards.forEach((card_name) => {
            card_value = null;

            card_value = this.fits_reader_wrapper.getHeaderCardValueByNameFromHDU(this.hdu_index, card_name)
            this.header_values[card_name] = card_value;
        })
    }

    setBinningType(binning_type) {
        this.binning_type = binning_type
    }

    setBinValueMethod(method) {
        this.method = method;
    }

    getBinsForMethod(rate_column, fracexp_column, bins, method) {
        let processed_bins = [];

        bins.forEach((bin) => {
            let times = [];
            let rates = [];
            let fracexps = [];

            bin.forEach(({ time, rate, fracexp }) => {
                times.push(time);
                rates.push(rate);
                fracexps.push(fracexp);
            });

            let bin_rate_max = Math.max(...rates);
            let bin_rate_min = Math.min(...rates);
            let bin_rate_mean = rates.reduce((total, value) => total + value, 0) / rates.length;
            let bin_rate_sum = rates.reduce((total, value) => total + value, 0);

        })

        return processed_bins;
    }

    getRateFracexpWeightedMeanBinnedData(rate_column, fracexp_column, bin_size) {
        let num_data_points = rate_column.length;
        let num_bins = Math.ceil(num_data_points / bin_size);

        let binned_rates = [];

        for (let i = 0; i < num_bins; i++) {
            let start_pos = i * bin_size;
            let end_pos = Math.min(start_pos + bin_size, rate_column.length);

            let weighted_sum = 0;
            let num_data_points_bin = 0;

            for(let j = start_pos; j < end_pos; j++) {
                weighted_sum += rate_column[j] * fracexp_column[j];
                num_data_points_bin++;
            }

            let bin_rate_value = weighted_sum / num_data_points_bin;
            binned_rates.push(bin_rate_value);
        }

        return binned_rates;
    }

    getMedianDate(dates) {
        let sorted_dates = dates.sort((a, b) => a - b);

        let median_index = Math.floor(sorted_dates.length / 2);

        if (sorted_dates.length % 2 !== 0) {
            return sorted_dates[median_index];
        } else {

        }
    }

    getDurationInSeconds(time_column) {
        let lowest_time = Math.min(...time_column);
        let highest_time = Math.max(...time_column);

        let duration_seconds = (highest_time - lowest_time) * 86400;

        return duration_seconds;
    }

}