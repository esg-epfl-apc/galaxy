<!DOCTYPE HTML>
<%
    import os

    root = h.url_for('', qualified=True)

    hdadict = trans.security.encode_dict_ids( hda.to_dict() )
    file_url = os.path.join(root, 'datasets', hdadict['id'], "display?to_ext="+hda.ext)

    app_root = root + '/static/plugins/visualizations/fits_graph_viewer/static/'
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    ${h.javascript_link( app_root + 'fits-reader.js' )}

    <script type="text/javascript" src="https://cdn.bokeh.org/bokeh/release/bokeh-3.3.4.min.js"></script>
    <script type="text/javascript" src="https://cdn.bokeh.org/bokeh/release/bokeh-gl-3.3.4.min.js"></script>
    <script type="text/javascript" src="https://cdn.bokeh.org/bokeh/release/bokeh-widgets-3.3.4.min.js"></script>
    <script type="text/javascript" src="https://cdn.bokeh.org/bokeh/release/bokeh-tables-3.3.4.min.js"></script>
    <script type="text/javascript" src="https://cdn.bokeh.org/bokeh/release/bokeh-mathjax-3.3.4.min.js"></script>
    <script type="text/javascript" src="https://cdn.bokeh.org/bokeh/release/bokeh-api-3.3.4.min.js"></script>
    <script type="text/javascript" src="https://d3js.org/d3.v7.min.js"></script>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        .container-graph-settings {
            display: grid;
            grid-template-columns: minmax(75%, auto) minmax(auto, 25%);
            grid-gap: 20px;
            padding: 20px;
        }

        .container-data {
            display: grid;
            grid-template-columns: 60% 40%;
            grid-gap: 20px;
            padding: 20px;
        }

        #column-file {
            padding: 20px;
            box-sizing: border-box;
        }

        #file-settings-button-container {
            margin: 20px;
        }

        #current-files-card {
            min-height: 100%;
        }

        #available-files-card {
            min-height: 100%;
        }

        .grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: auto auto auto;
            gap: 20px;
        }

        .full-width-column {
            grid-column: 1 / span 2;
        }

        .left-column, .right-column {
            padding: 10px;
        }

        .list-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .opt-group0 {
            background-color: lightgray;
        }

        #column-file select {
            margin: 10px;
        }

        #column-file button {
            margin: 1px;
        }

        #column-file input {
            margin: 10px;
            width: 50%;
        }

        #file-settings-container {
            width: 100%;
        }

        .column-graph {
            padding: 20px;
            box-sizing: border-box;
        }

        #visualization-component {
            position: sticky;
            top: 0;
        }

        .column-settings {
            padding: 20px;
            box-sizing: border-box;
            max-width: 100%;
        }

        .card {
            margin: 10px 0 10px 0;
        }

        .select-errorbar {
            margin: 2px 0 15px 0;
        }

        .form-checkbox {
            margin-top: 10px;
        }

        #select-axis-x-scale {
            margin-bottom: 10px;
        }

        #select-axis-y-scale {
            margin-bottom: 10px;
        }

        .axis-range-div {
            margin-top: 10px;
            margin-bottom: 10px;
        }

        .axis-range-div input {
            width: 100%;
        }

        #has-error-bars-checkbox {
            margin-bottom: 10px;
        }

        #add-y-range {
            margin-top: 10px;
        }

        .select-hdus {
            margin-bottom: 5px;
        }

        .file-data-container {
            max-height: 500px;
            overflow-y: auto;
        }

        #table-header-data {
            border-top: 1px solid lightgray;
            border-left: 1px solid lightgray;
            border-right: 1px solid lightgray;
        }

        #table-data {
            border-top: 1px solid lightgray;
            border-left: 1px solid lightgray;
            border-right: 1px solid lightgray;
        }

        #bokeh-settings {
            display: none;
        }

        #d3-settings {
            display: none;
        }

        #light-curve-settings {
            display: none;
        }

        #spectrum-settings {
            display: none;
        }

        #hdus-settings {
            display: none;
        }

        #button-generate {
            width: 100%;
        }

        .inner-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(50%, 1fr));
        }

    </style>
</head>
<body>
    <div id="jsvis-main">
        <div class="container">
            <div id="column-file">
                <file-component id="file-component">
                    <div class="grid-container">
                        <div class="full-width-column" style="grid-column: 1 / span 2;">
                            <div class="card">
                                <div class="card-header">Download</div>
                                <div class="card-body">
                                    <input type="file" id="file-input-local">
                                    <select id="select-file-type">
                                        <option value="fits">FITS</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="left-column">
                            <div id="available-files-card" class="card">
                                <div class="card-header">Available files</div>
                                <div class="card-body">
                                    <div id="available-files-list" class="list-group">

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="right-column">
                            <div id="current-files-card" class="card">
                                <div class="card-header">Current files</div>
                                <div class="card-body">
                                    <div id="current-files-list" class="list-group">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="file-settings-container" class="full-width-column">

                        </div>
                    </div>
                </file-component>
            </div>
        </div>
        <div class="container container-graph-settings">
            <div class="column-graph">
                <visualization-component id="visualization-component">
                    <div id="visualization-container"></div>
                </visualization-component>
            </div>
            <div class="column-settings">
                <settings-component id="settings-component">
                    <div id="settings-container" class="card">
                        <div class="card-header">
                            <h5 class="card-title">Settings</h5>
                        </div>
                        <div class="card-body">
                            <!-- LIBRARY SETTINGS -->
                            <div id="library-settings" class="card">
                                <div class="card-body">
                                    <h6 class="card-title">Library Selection</h6>
                                    <select id="select-library" class="form-select">
                                        <option value="d3">D3</option>
                                        <option value="bokeh">Bokeh</option>
                                    </select>
                                </div>
                            </div>
                            <!-- LIBRARY SPECIFIC SETTINGS -->
                            <div id="bokeh-settings" class="card">
                                <div class="card-body">
                                    <h6 class="card-title">Bokeh Settings</h6>
                                </div>
                            </div>
                            <div id="d3-settings" class="card">
                                <div class="card-body">
                                    <h6 class="card-title">D3 Settings</h6>
                                </div>
                            </div>
                            <!-- DATA TYPE SETTINGS -->
                            <div id="data-type-settings" class="card">
                                <div class="card-body">
                                    <h6 class="card-title">Data type selection</h6>
                                    <select id="select-data-type" class="form-select">
                                        <option selected>Generic</option>
                                        <option value="light-curve">Light Curve</option>
                                        <option value="spectrum">Spectrum</option>
                                    </select>
                                </div>
                            </div>
                            <!-- DATA TYPE SPECIFIC SETTINGS -->
                            <div id="light-curve-settings" class="card">
                                <div class="card-body">
                                    <h6 class="card-title">Light Curve Settings</h6>
                                </div>
                            </div>
                            <div id="spectrum-settings" class="card">
                                <div class="card-body">
                                    <h6 class="card-title">Spectrum Settings</h6>
                                </div>
                            </div>
                            <!-- HDUS SETTINGS -->
                            <div id="hdus-settings" class="card">
                                <div id="card-body-hdus" class="card-body">
                                    <h6 class="card-title">HDU Selection</h6>
                                    <select id="select-hdus" class="form-select">
                                        <option selected>HDUs</option>
                                    </select>
                                </div>
                            </div>
                            <!-- AXIS SETTINGS -->
                            <div id="axis-settings" class="card">
                                <div id="card-body-axis" class="card-body">
                                    <h6 class="card-title">Axis Settings</h6>

                                    <select id="select-axis-x" class="form-select select-axis">
                                        <option selected>X axis</option>
                                    </select>
                                    <select id="select-axis-x-scale" class="form-select select-axis-scale static-select">
                                        <option value="linear" selected>Linear</option>
                                        <option value="log" selected>Log</option>
                                    </select>

                                    <label for="has-x-range-checkbox">Add X Range:</label>
                                    <input type="checkbox" id="has-x-range-checkbox" class="form-checkbox" name="add-x-range">
                                    <div id="x-range-fields" class="axis-range-div" style="">
                                        <label for="x-lower-bound">X Lower Bound:</label>
                                        <input type="number" id="x-lower-bound" class="form-input" name="x-lower-bound">
                                        <label for="x-higher-bound">X Upper Bound:</label>
                                        <input type="number" id="x-higher-bound" class="form-input" name="x-higher-bound">
                                    </div>

                                    <select id="select-axis-y" class="form-select select-axis">
                                        <option selected>Y axis</option>
                                    </select>
                                    <select id="select-axis-y-scale" class="form-select select-axis-scale static-select">
                                        <option value="linear" selected>Linear</option>
                                        <option value="log" selected>Log</option>
                                    </select>

                                    <label for="has-y-range-checkbox">Add Y Range:</label>
                                    <input type="checkbox" id="has-y-range-checkbox" class="form-checkbox" name="add-y-range">
                                    <div id="y-range-fields" class="axis-range-div" style="">
                                        <label for="y-lower-bound">Y Lower Bound:</label>
                                        <input type="number" id="y-lower-bound" class="form-input" name="y-lower-bound">
                                        <label for="y-higher-bound">Y Upper Bound:</label>
                                        <input type="number" id="y-higher-bound" class="form-input" name="y-higher-bound">
                                    </div>

                                </div>
                            </div>
                            <!-- ERROR BARS SETTINGS -->
                            <div id="error-bars-settings" class="card">
                                <div id="card-body-error-bars" class="card-body">
                                    <h6 class="card-title">Error Bars</h6>
                                    <label for="has-error-bars-checkbox">Add Error Bars: </label>
                                    <input type="checkbox" id="has-error-bars-checkbox" class="form-checkbox" name="has-error-bars-checkbox">
                                    <select id="select-axis-x-error-bar" class="form-select select-axis-error-bars">
                                        <option value="none" selected>X axis error bars</option>
                                    </select>
                                    <select id="select-axis-y-error-bar" class="form-select select-axis-error-bars">
                                        <option value="none" selected>Y axis error bars</option>
                                    </select>
                                </div>
                            </div>
                            <!-- BINNING SETTINGS -->
                            <div id="binning-settings" class="card">
                                <div class="card-body">
                                    <h6 class="card-title">Binning Settings</h6>
                                </div>
                            </div>
                            <!-- ADDITIONAL DATASET SETTINGS -->
                            <div id="additional-dataset-settings" class="card">
                                <div id="card-body-dataset" class="card-body">
                                    <h6 class="card-title">Dataset Selection</h6>
                                </div>
                            </div>

                            <button id="button-generate" class="btn btn-primary">Generate</button>
                        </div>
                    </div>
                </settings-component>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    <script>
        let file_url = '${file_url}';
        console.log(file_url);
    </script>

    ${h.javascript_link( app_root + 'astrovis/astrovis.js' )}

</body>
</html>

<!--html>
    <head>
        ${h.stylesheet_link( app_root + 'style.css' )}
        ${h.javascript_link( app_root + 'dist/aladin-lite-galaxy/aladin.js' )}
    </head>
    <body>
        <div id="div_title"><span id="span_plugin_name">FITS aladin viewer</span> : <span id="span_file_name">${hda.name | h}</span></div>
        <div id="aladin-lite-div"></div>
        ${h.javascript_link( app_root + 'script.js' )}
    </body>
</html-->