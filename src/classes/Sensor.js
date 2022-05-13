import GlobalState from "./GlobalState";
import rgb from "../colors.js";

class Sensor extends GlobalState {
    constructor(id, scale) {
        super(id);
        this.historyKey = this.key + ":history";
        this.scale = scale;
    }

    getSensorValueColorCSS = (value) => {
        var color = this.getSensorValueColor(value);
        return "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",1)";
    }

    getSensorValueColor = (value) => {
        switch (this.id) {
            case 'co2': return rgb.GetGradientRGB(value, this.scale);
            case 'relative-humidity': return rgb.GetGradientRGB(value, this.scale);
            case 'temperature': return rgb.GetGradientRGB(value, this.scale);
            default: return rgb.Black;
        }
    }
}

export default Sensor;