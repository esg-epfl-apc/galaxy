import {InvalidURLError} from "../errors/InvalidURLError";
import {HDUNotTabularError} from "../errors/HDUNotTabularError";
import {FileRegistry} from "../registries/FileRegistry";
import {StringUtils} from "../utils/StringUtils";
import {FileLoadedEvent} from "../events/FileLoadedEvent";

export class FITSReaderWrapper {

    file_path = null;
    file = null;

    static BINTABLE = 'BINTABLE';
    static TABLE = 'TABLE';

    constructor(file_path = null) {
        if(file_path) {
            if (FITSReaderWrapper.is_path_valid(file_path)) {
                this.file_path = file_path;
                this._getFile()
            } else {
                throw new InvalidURLError("Invalid file path : " + file_path);
            }
        }
    }

    initializeFromPath(file_path) {
        if(FITSReaderWrapper.is_path_valid(file_path)) {
            this.file_path = file_path;
            this._getFile()
        } else {
            throw new InvalidURLError("Invalid file path : " + file_path);
        }

    }

    initializeFromBuffer(array_buffer, file_name) {
        this.file_path = file_name;
        this._readFile(array_buffer);
    }

    _getFile() {

        return fetch(this.file_path)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error, status = ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then((buffer) => this._readFile(buffer));
    }

    _readFile(arrayBuffer) {
        try {
            this.file = window.FITSReader.parseFITS(arrayBuffer);

            this.sendFITSLoadedEvents();

        } catch(e) {
            console.log("Error initializing interface")
        }
    }

    getFilePath() {
        return this.file_path;
    }

    setFile(file) {
        this.file = file;
    }

    getHDU(hdu_index) {
        if(hdu_index >= 0 && hdu_index < this.file.hdus.length) {
            return this.file.hdus[hdu_index];
        } else {
            return null;
        }
    }

    getHDUs() {

        let HDUs = [];
        let hdu_object;
        let type;
        let extname = '';

        this.file.hdus.forEach(function(hdu, index) {

            if (hdu.header.primary === true) {
                type = "PRIMARY";
            } else {
                type = hdu.header.get('XTENSION');
                extname = hdu.header.get('EXTNAME');
            }

            hdu_object = {
                "name": type,
                "index": index,
                "extname": extname
            };

            HDUs.push(hdu_object);
        })

        return HDUs;
    }

    getTabularHDUs() {
        let tabular_hdus_index = [];

        this.file.hdus.forEach(function(hdu, index) {
            if (hdu.header.primary !== true) {
                if(hdu.header.get('XTENSION') === "TABLE" || hdu.header.get('XTENSION') === "BINTABLE") {
                    tabular_hdus_index.push(index);
                }
            }
        })

        return tabular_hdus_index;
    }

    getNumberOfColumnFromHDU(hdu_index) {
        let hdu = this.file.getHDU(hdu_index);

        let header = hdu.header;
        let data = hdu.data;

        let type = header.get('XTENSION');

        let column_number = null;

        if(type === FITSReaderWrapper.BINTABLE || type === FITSReaderWrapper.TABLE) {
            column_number = data.cols;
        } else {
            throw new HDUNotTabularError("Selected HDU is not tabular");
        }

        return column_number;
    }

    getColumnsNameFromHDU(hdu_index) {
        let hdu = this.file.getHDU(hdu_index);

        let header = hdu.header;
        let data = hdu.data;

        let type = hdu.header.get('XTENSION');

        let columns = [];
        let column_name;

        if(type === FITSReaderWrapper.BINTABLE || type === FITSReaderWrapper.TABLE) {
            data.columns.forEach(function (column) {
                column_name = column;

                columns.push(column_name);
            })
        } else {
            throw new HDUNotTabularError("Selected HDU is not tabular");
        }

        return columns;
    }

    getColumnsJSONDataFromHDU(hdu_index) {

        let hdu = this.file.getHDU(hdu_index);

        let header = hdu.header;
        let data = hdu.data;

        let type = hdu.header.get('XTENSION');

        let columns_data_json = [];
        let raw_columns_data_array = [];
        let column_data;

        if(type === FITSReaderWrapper.BINTABLE || type === FITSReaderWrapper.TABLE) {
            data.columns.forEach(function(column) {

                try {
                    data.getColumn(column, function (col) {
                        column_data = col;
                    })
                } catch(e) {

                }

                raw_columns_data_array[column] = column_data;
            })

            let column_names = Object.keys(raw_columns_data_array);

            for (let i = 0; i < raw_columns_data_array[column_names[0]].length; i++) {

                let column_json_data_object = {};

                column_names.forEach((column_name) => {
                    column_json_data_object[column_name] = raw_columns_data_array[column_name][i];
                });

                columns_data_json.push(column_json_data_object);
            }

        } else {
            throw new HDUNotTabularError("Selected HDU is not tabular");
        }

        return columns_data_json;
    }

    getColumnDataFromHDU(hdu_index, column_name) {
        let hdu = this.file.getHDU(hdu_index);

        let header = hdu.header;
        let data = hdu.data;

        let type = hdu.header.get('XTENSION');

        let col_data = [];
        if(type === FITSReaderWrapper.BINTABLE || type === FITSReaderWrapper.TABLE) {

            data.getColumn(column_name, function(col){
                if(col[0] === undefined) {
                    let header_col_data = hdu.header.get(column_name);
                    col = col.map(() => header_col_data);
                }

                col_data = col;
            })

        } else {
            throw new HDUNotTabularError("Selected HDU is not tabular");
        }

        return col_data;
    }

    getHeaderFromHDU(hdu_index) {
        let hdu = this.file.getHDU(hdu_index);
        let header = hdu.header;

        return header;
    }

    getDataFromHDU(hdu_index) {
        let hdu = this.file.getHDU(hdu_index);
        let data = hdu.data;

        return data;
    }

    getHeaderCardValueByNameFromHDU(hdu_index, card_name) {
        let hdu = this.file.getHDU(hdu_index);
        let header = hdu.header;

        let value = header.get(card_name);

        if(value === undefined) {
            value = '';
        }

        return value;
    }

    getHeaderCardsValueFromHDU(hdu_index) {
        let hdu = this.file.getHDU(hdu_index);

        const cards_array = [];

        Object.entries(hdu.header.cards).forEach(function(item) {
            let item_value_array = item[1];

            if(typeof item_value_array === 'object' && !Array.isArray(item_value_array)) {
                item_value_array['card_name'] = item[0];
                cards_array.push(item_value_array);
            }
        })

        let sorted_hdu_cards = cards_array.sort((a, b) => a.index - b.index);

        return sorted_hdu_cards;
    }

    isHDUTabular(hdu_index) {
        let hdu = this.file.getHDU(hdu_index);
        let header = hdu.header;

        let type = header.get('XTENSION');

        let is_tabular = false;

        if(type === FITSReaderWrapper.BINTABLE || type === FITSReaderWrapper.TABLE) {
            is_tabular = true;
        }

        return is_tabular;
    }

    _isHDUTabular(hdu) {
        let extension = hdu.header.get('XTENSION');
        return extension === FITSReaderWrapper.BINTABLE || extension === FITSReaderWrapper.TABLE;
    }

    getAllColumns() {
        let columns = [];

        this.file.hdus.forEach((hdu, index) => {

            if(this._isHDUTabular(hdu)) {
                let columns_name = this.getColumnsNameFromHDU(index);

                columns_name.forEach((column_name) => {
                    let column = {
                        name: column_name,
                        hdu_index: index,
                        is_from_header: false
                    }

                    columns.push(column);
                })

                if(hdu.header.get('TIMEDEL') !== null) {
                    let column = {
                        name: 'TIMEDEL',
                        hdu_index: index,
                        is_from_header: true
                    }

                    columns.push(column);
                }

                if(hdu.header.get('ANCRFILE') !== null) {
                    let ancrfile = FileRegistry.getFileByName(
                        StringUtils.cleanFileName(hdu.header.get('ANCRFILE'))
                    );

                    if(ancrfile !== undefined) {
                        let frw = new FITSReaderWrapper();
                        frw.setFile(ancrfile.file);
                    }

                }

                if(hdu.header.get('RESPFILE') !== null) {
                    let respfile = FileRegistry.getFileByName(
                        StringUtils.cleanFileName(hdu.header.get('RESPFILE'))
                    );

                    if(respfile !== undefined) {
                        let frw = new FITSReaderWrapper();

                        frw.setFile(respfile.file);

                        let hdus_index = frw.getTabularHDUs();

                        let has_e_min_max = false;
                        hdus_index.forEach((hdu_index) => {
                            let columns_name = frw.getColumnsNameFromHDU(hdu_index);
                            if (columns_name.includes("E_MIN") && columns_name.includes("E_MAX")) {
                                has_e_min_max = true;
                                let e_min_max_hdus_index = hdu_index;

                                let column = {
                                    name: 'E_HALF_WIDTH',
                                    hdu_index: hdu_index,
                                    is_from_header: false,
                                    is_processed: true,
                                    from_file: respfile.id
                                }

                                columns.push(column);

                                column = {
                                    name: 'E_MID',
                                    hdu_index: hdu_index,
                                    is_from_header: false,
                                    is_processed: true,
                                    from_file: respfile.id
                                }

                                columns.push(column);

                                column = {
                                    name: 'E_MID_LOG',
                                    hdu_index: hdu_index,
                                    is_from_header: false,
                                    is_processed: true,
                                    from_file: respfile.id
                                }

                                columns.push(column);

                            }
                        })

                    }
                }

            }
        })

        return columns;
    }

    sendFITSLoadedEvents() {
        let filele = new FileLoadedEvent({
            file_name: this.file_path,
            type: 'fits',
            file: this.file
        });

        filele.dispatchToSubscribers();
    }

    static is_path_valid(path) {
        let is_valid = false;

        if(FITSReaderWrapper._isPathValid(path) || FITSReaderWrapper._isURLValid(path)) {
            is_valid = true;
        }

        return is_valid;
    }

    static _isURLValid(url) {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
    }

    static _isPathValid(path) {
        const pathRegex = /^(\/[a-zA-Z0-9._-]+)+\/?$/;
        return pathRegex.test(path);
    }

}