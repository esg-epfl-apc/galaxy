export class BokehGraph {

    container_id = null;
    container = null;

    static plt = Bokeh.Plotting;

    static scale_functions = {
        "linear": Bokeh.LinearScale,
        "log": Bokeh.LogScale
    }

    source = null;

    y_error_bar;
    x_error_bar;

    columns;
    data_table;

    static supported_tool_array = [
        "pan",
        "box_zoom",
        "wheel_zoom",
        "hover",
        "crosshair",
        "reset",
        "save",
        "lasso_select",
        "poly_select",
        "tap",
        "examine,",
        "undo",
        "redo"];

    static default_tool_array = [
        "pan",
        "box_zoom",
        "wheel_zoom",
        "hover",
        "crosshair",
        "reset",
        "save"];

    static default_tool_string = "pan,box_zoom,wheel_zoom,hover,crosshair,reset,save";

    tool_array = [];
    tool_string = "";

    has_data_table = false;

    constructor(container_id = '#visualization-container') {
        this.container_id = container_id;
        this._setContainer();
    }

    _setContainer() {
        this.container = document.getElementById(this.container_id);
    }

    initializeSettings(data, labels, scales, title, error_bars = null, custom_range = null) {
        this.setupSource(data);

        if(error_bars) {
            this.setupPlot(title, data['y_low'], data['y_up']);
        } else {
            if(custom_range) {
                let x_low = [];
                let x_up = [];

                let y_low = [];
                let y_up = [];

                if(custom_range.x !== null) {
                    custom_range.x.lower_bound !== null ? x_low.push(custom_range.x.lower_bound) : x_low = data['x'];
                    custom_range.x.upper_bound !== null ? x_up.push(custom_range.x.upper_bound) : x_up = data['x'];
                } else {
                    x_low = data['x'];
                    x_up = data['x'];
                }

                if(custom_range.y !== null) {
                    custom_range.y.lower_bound !== null ? y_low.push(custom_range.y.lower_bound) : y_low = data['y'];
                    custom_range.y.upper_bound !== null ? y_up.push(custom_range.y.upper_bound) : y_up = data['y'];
                } else {
                    y_low = data['y'];
                    y_up = data['y'];
                }

                this.setupPlot(title, y_low, y_up, x_low, x_up)
            } else {
                this.setupPlot(title, data['y'], data['y']);
            }

        }

        this.setupData();
        this.setupScales(scales);
        this.setupLabels(labels);

        if(error_bars) {
            this.setupErrorBars();
        }
    }

    initializeGraph() {

        if(this.has_data_table) {
            BokehGraph.plt.show(new Bokeh.Column({children: [p, data_table]}), "#graph-container");
        } else {
            BokehGraph.plt.show(this.plot, this.container_id);
        }
    }

    setupPlot(title, y_range_low, y_range_up, x_range_low = null, x_range_up= null) {

        if(x_range_low) {
            this.plot = BokehGraph.plt.figure({
                title: title,
                tools: BokehGraph.default_tool_string,
                width: 800,
                height: 600,
            });
        } else {
            this.plot = BokehGraph.plt.figure({
                title: title,
                tools: BokehGraph.default_tool_string,
                width: 800,
                height: 600,
            });
        }
    }

    setupSource(data_sources) {
        this.source = new Bokeh.ColumnDataSource({
            data: data_sources
        });
    }

    setupData() {
        const circles = this.plot.circle({ field: "x" }, { field: "y" }, {
            source: this.source,
            size: 4,
            fill_color: "navy",
            line_color: null,
        });
    }

    setupErrorBars() {
        this.y_error_bar = new Bokeh.Whisker({
            dimension: "height",
            source: this.source,
            base: {field: "x"},
            lower: {field: "y_low"},
            upper: {field: "y_up"},
            line_color: "navy",
            lower_head: null,
            upper_head: null,
        });

        this.x_error_bar = new Bokeh.Whisker({
            dimension: "width",
            source: this.source,
            base: {field: "y"},
            lower: {field: "x_low"},
            upper: {field: "x_up"},
            line_color: "navy",
            lower_head: null,
            upper_head: null,
        });

        this.plot.add_layout(this.y_error_bar);
        this.plot.add_layout(this.x_error_bar);
    }

    setupScales (scales) {
        if(scales) {
            this.plot.x_scale = new BokehGraph.scale_functions[scales.x]();
            this.plot.y_scale = new BokehGraph.scale_functions[scales.y]();
        }
    }

    setupLabels(labels) {
        this.plot.xaxis.axis_label = labels.x;
        this.plot.yaxis.axis_label = labels.y;
    }

    setupColumns(labels, columns) {
        this.columns = [
            new Bokeh.Tables.TableColumn({field: 'x', title: labels.x}),
            new Bokeh.Tables.TableColumn({field: 'y', title: labels.y})
        ]
    }

    setupDataTable() {
        this.data_table = new Bokeh.Tables.DataTable({
            source: this.source,
            columns: this.columns,
            width: 800,
        });
    }

    createToolArray(tool_array) {
        this.tool_array = tool_array;
    }

    addToolToToolArray(tool_name) {
        if (!this.tool_array.includes(tool_name) && BokehGraph.supported_tool_array.includes(tool_name)) {
            this.tool_array.push(tool_name);
        }
    }

    removeToolFromToolArray(tool_name) {
        this.tool_array = this.tool_array.filter(str => str !== tool_name);
    }

    setToolStringFromToolArray() {
        this.tool_string = this.tool_array.join(',');
    }

}