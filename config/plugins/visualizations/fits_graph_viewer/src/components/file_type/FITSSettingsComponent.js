import {WrapperContainer} from "../../containers/WrapperContainer";
import {FileRegistry} from "../../registries/FileRegistry";
import {FileRegistryChangeEvent} from "../../events/FileRegistryChangeEvent";

export class FITSSettingsComponent extends HTMLElement {

    container_id = "fits-settings-container";
    select_hdu_id = "select-hdu-file";
    table_header_id = "table-header-data";
    table_data_id = "table-data";

    file = null;
    is_current = false;

    add_to_plot_btn_id = "add-to-plot";
    remove_from_plot_btn_id = "remove-from-plot";

    container = '<div id="fits-settings-container" class="full-width-column" style="grid-column: 1 / span 2;">' +
        '<div class="card">' +
        '<div class="card-body">' +
        '</div>' +
        '</div>' +
        '</div>';

    select_hdu_file = '<select id="select-hdu-file" class="form-select"></select>';

    inner_container = '<div class="inner-row"></div>';

    header_column = '<div class="left-column">' +
        '<div class="card-header">Header</div>' +
        '<div class="card-body">' +
        '<div id="header-hdu-file">' +
        '</div>' +
        '</div>';

    table_header = '<table id="table-header-data" class="table table-striped">' +
        '    <thead>' +
        '    <tr>' +
        '        <th scope="col">#</th>' +
        '        <th scope="col">Name</th>' +
        '        <th scope="col">Value</th>' +
        '        <th scope="col">Comment</th>' +
        '    </tr>' +
        '    </thead>' +
        '    <tbody class="table-group-divider">' +
        '    </tbody>' +
        '</table>'

    data_column = '<div class="right-column">' +
        '<div class="card-header">Data</div>' +
        '<div class="card-body">' +
        '   <div id="data-hdu-file">' +
        '   </div>' +
        '</div>';

    table_data = '<table id="table-data" class="table table-striped">' +
        '    <thead>' +
        '       <tr>' +
        '       </tr>' +
        '    </thead>' +
        '    <tbody class="table-group-divider">' +
        '    </tbody>' +
        '</table>'

    btn_save_settings = '<button class="btn btn-success" id="save-file-settings">Save changes</button>';
    btn_add_to_plot = '<button class="btn btn-primary" id="add-to-plot">Add to plot</button>;'
    btn_remove_from_plot = '<button class="btn btn-danger" id="remove-from-plot">Remove from plot</button>';

    constructor(file, is_current) {
        super();

        this.file = file;
        this.is_current = is_current;

        this.innerHTML = '<div class="full-width-column" style="grid-column: 1 / span 2;">\n' +
            '                            <div class="card">\n' +
            '                                <div class="card-header">File settings</div>\n' +
            '                                <div class="card-body">\n' +
            '                                    <select id="select-hdu-file" class="form-select">\n' +
            '\n' +
            '                                    </select>\n' +
            '\n' +
            '                                    <div class="inner-row">\n' +
            '                                        <div class="left-column">\n' +
            '                                            <div class="card">\n' +
            '                                                <div class="card-header">Header</div>\n' +
            '                                                <div class="card-body">\n' +
            '                                                    <div id="header-hdu-file" class="file-data-container">\n' +
            '                                                        <table id="table-header-data" class="table table-striped">\n' +
            '                                                            <thead>\n' +
            '                                                            <tr>\n' +
            '                                                                <th scope="col">#</th>\n' +
            '                                                                <th scope="col">Name</th>\n' +
            '                                                                <th scope="col">Value</th>\n' +
            '                                                                <th scope="col">Comment</th>\n' +
            '                                                            </tr>\n' +
            '                                                            </thead>\n' +
            '                                                            <tbody class="table-group-divider">\n' +
            '\n' +
            '                                                            </tbody>\n' +
            '                                                        </table>\n' +
            '                                                    </div>\n' +
            '                                                </div>\n' +
            '                                            </div>\n' +
            '                                        </div>\n' +
            '                                        <div class="right-column">\n' +
            '                                            <div class="card">\n' +
            '                                                <div class="card-header">Data</div>\n' +
            '                                                <div class="card-body">\n' +
            '                                                    <div id="data-hdu-file" class="file-data-container">\n' +
            '<table id="table-data" class="table table-striped">' +
                '    <thead>' +
                '       <tr>' +
                    '       </tr>' +
                '    </thead>' +
                '    <tbody class="table-group-divider">' +
                '    </tbody>' +
                '</table>'+
            '                                                    </div>\n' +
            '                                                </div>\n' +
            '                                            </div>\n' +
            '                                        </div>\n' +
            '                                    </div>\n' +
            '\n' +
            '                                    <!-- button class="btn btn-success" id="save-file-settings">Save changes</button -->\n' +
            '                                    <button class="btn btn-primary" id="add-to-plot">Add to plot</button>\n' +
            '                                    <button class="btn btn-danger" id="remove-from-plot">Remove from plot</button>\n' +
            '                                </div>\n' +
            '                            </div>\n' +
            '                        </div>'

    }

    setupComponent() {
        this.setHDUSelect();
        this.setupActionButtons();

        let select_hdu = document.getElementById(this.select_hdu_id);
        let hdu_index = select_hdu.value;

        this.setTables(hdu_index);

        this.setupInnerElementListeners();
    }

    setHDUSelect() {

        let select_hdu = document.getElementById(this.select_hdu_id);

        select_hdu.innerHTML = '';

        let frw = WrapperContainer.getFITSReaderWrapper();
        frw.setFile(this.file.file);

        let hdus = frw.getHDUs();

        let options = [];
        hdus.forEach((hdu) => {
            let option = document.createElement("option");

            option.value = hdu.index;
            option.text = hdu.name + ' ' + hdu.extname;

            options.push(option);
        })

        options.forEach((option) => {
            select_hdu.add(option);
        })

    }

    setupInnerElementListeners() {
        this.setHDUSelectListener();
    }

    setupActionButtons() {

        let add_to_plot_btn = document.getElementById(this.add_to_plot_btn_id);
        let remove_from_plot_btn  = document.getElementById(this.remove_from_plot_btn_id);

        if(this.is_current) {
            add_to_plot_btn.style.display = 'none';
            remove_from_plot_btn.style.display = 'initial';
        } else {
            add_to_plot_btn.style.display = 'initial';
            remove_from_plot_btn.style.display = 'none';
        }

        add_to_plot_btn.addEventListener('click', (event) => {
            FileRegistry.addToCurrentFiles(this.file);

            this.is_current = true;

            let frce = new FileRegistryChangeEvent();
            frce.dispatchToSubscribers();

            this.resetContainerForCurrentFile();

        });

        remove_from_plot_btn.addEventListener('click', (event) => {
            FileRegistry.removeFromCurrentFiles(this.file.id);

            this.is_current = false;

            let frce = new FileRegistryChangeEvent();
            frce.dispatchToSubscribers();

            this.resetContainerForCurrentFile();
        });
    }

    setTables(hdu_index) {
        this.resetTables();

        let table_header = document.getElementById(this.table_header_id);
        let table_data = document.getElementById(this.table_data_id);

        let frw = WrapperContainer.getFITSReaderWrapper();
        frw.setFile(this.file.file);

        let hdu_cards = frw.getHeaderCardsValueFromHDU(hdu_index)

        let tbody = table_header.querySelector('tbody');

        hdu_cards.forEach(card => {

            let row = tbody.insertRow();

            let index_cell = row.insertCell(0);
            let card_cell = row.insertCell(1);
            let name_cell = row.insertCell(2);
            let description_cell = row.insertCell(3);

            index_cell.textContent = card.index;
            card_cell.textContent = card.card_name;
            name_cell.textContent = card.value;
            description_cell.textContent = card.comment;
        });


        try {

            let hdu_columns_name = frw.getColumnsNameFromHDU(hdu_index);
            let hdu_data = frw.getColumnsJSONDataFromHDU(hdu_index)

            let header_row = table_data.tHead.insertRow();
            tbody = table_data.querySelector('tbody');

            hdu_columns_name.forEach((column) => {
                let header_cell = document.createElement('th');
                header_cell.textContent = column;
                header_row.appendChild(header_cell);
            });

            hdu_data.forEach(data_point => {

                const row = tbody.insertRow();
                for (let key in data_point) {
                    if (Object.hasOwnProperty.call(data_point, key)) {
                        let cell = row.insertCell();
                        cell.textContent = data_point[key];
                    }
                }
            });

        } catch(e) {
            console.log("DATA PARSING ERROR");
        }
    }

    resetTables() {
        let table_header = document.getElementById(this.table_header_id);
        let table_data = document.getElementById(this.table_data_id);

        let tbody = table_header.querySelector('tbody');
        tbody.innerHTML = '';

        tbody = table_data.querySelector('tbody');
        let thead = table_data.querySelector('thead');

        tbody.innerHTML = '';
        thead.innerHTML = '<tr></tr>';
    }

    setHDUSelectListener() {

        let select_element = document.getElementById(this.select_hdu_id);

        select_element.addEventListener('change', (event) => {
            this.setTables(event.target.value);
        });

    }

    resetContainerForCurrentFile() {
        this.setupComponent();
    }

}