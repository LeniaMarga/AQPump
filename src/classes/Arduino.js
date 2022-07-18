import GlobalState from "./GlobalState";
import axios from "axios";
import global from "../global.js";

class Arduino extends GlobalState {
    constructor(id, base) {
        super(id);
        this.base = base;
        
        this.room = null;
        this.sensor = null;
        this.value = 0;
        this.lastValue = 0;

        this.startColor = [0, 0, 0];
        this.endColor = [0, 0, 0];
        this.ledPattern = 0;
        this.ledDelay = 0;
        
        this.action = "";
        this.actionStatus = "";
        this.actionRemaining = 0;

        this.actionResolve = null;
        this.actionInterval = null;
        this.actionTimeout = null;
    }

    getValueDelta = () => this.value - this.lastValue;
    getValueSource = () => this.get("valueSource");
    setValueSource = (room, sensor) => {
        this.room = room;
        this.sensor = sensor;
        if (room && sensor)
            this.set("valueSource", room.key + "/" + sensor.key);
    }

    updateValueAsync = async (value, sensor) => {
        this.lastValue = this.value;
        this.value = value;
        this.invalidate();

        let delta = Math.abs(this.getValueDelta());
        if (delta === 0) return;

        let duration = delta * global.deltams;
        this.actionTimeoutTime = Date.now() + duration;

        return new Promise(async (resolve, reject) => {
            
            // we start the timeout first without waiting for the arduino to confirm command
            // otherwise if arduino does other stuff (like animates LED) before confirmation
            // the time for inflation/deflation would be increased by the time for other stuff
            let timeout = setTimeout(async () => {
                if (timeout === this.actionTimeout)
                await this.stopAsync();
                resolve();
            }, duration);
            
            this.actionTimeout = timeout;
            this.actionInterval = setInterval(this.onActionInterval, 100); // countdown display

            let color = (sensor ?? this.sensor).getSensorValueColor(this.value);
            if (this.value > this.lastValue)
                await this.inflateAsync(color);
            else
                await this.deflateAsync(color);
        });
    };

    stopAsync = (color) => this.executeWithColorAsync('/stop', color);
    inflateAsync = (color) => this.executeWithColorAsync('/inflate', color);
    deflateAsync = (color) => this.executeWithColorAsync('/deflate', color);

    setEndColor = (color) => {
        this.endColor = color;
        this.executeWithPatternAsync("", color);
        this.invalidate();
    }
    setEndR = r => {
        this.endColor[0] = r;
        this.setEndColor(this.endColor);
    }
    setEndG = g => {
        this.endColor[1] = g;
        this.setEndColor(this.endColor);
    }
    setEndB = b => {
        this.endColor[2] = b;
        this.setEndColor(this.endColor);
    }

    setStartColor = (color) => {
        this.endColor = color;
        this.executeWithPatternAsync("", undefined, color);
        this.invalidate();
    }
    setStartR = r => {
        this.startColor[0] = r;
        this.setPattern(this.startColor);
    }
    setStartG = g => {
        this.startColor[1] = g;
        this.setPattern(this.startColor);
    }
    setStartB = b => {
        this.startColor[2] = b;
        this.setPattern(this.startColor);
    }

    setPattern = ledPattern => {
        this.ledPattern = ledPattern;
        this.executeWithPatternAsync("", undefined, undefined, this.ledPattern);
        this.invalidate();
    }
    setDelay = ledDelay => {
        this.ledDelay = ledDelay;
        this.executeWithPatternAsync("", undefined, undefined, undefined, this.ledDelay);
        this.invalidate();
    }
    setColor = color => {
        this.ledPattern = 0;
        this.endColor = color;
        this.executeWithPatternAsync("", this.endColor, undefined, this.ledPattern);
        this.invalidate();
    }

    showPattern = () => {
        this.executeWithPatternAsync("", this.endColor, this.startColor, this.ledPattern, this.ledDelay);
        this.invalidate();    
    }
    
    executeWithColorAsync = (action, color) => {
        var pattern = undefined;
        if (color) pattern = 0;
        return this.executeWithPatternAsync(action, color, undefined, pattern);
    };
    executeWithPatternAsync = (action, endColor, startColor, pattern, delay) => {
        if (endColor !== undefined || startColor !== undefined || pattern !== undefined || delay !== undefined) action += "?";
        if (startColor !== undefined) action += "&R=" + Math.round(startColor[0]) + "&G=" + Math.round(startColor[1]) + "&B=" + Math.round(startColor[2]);
        if (endColor !== undefined) action += "&r=" + Math.round(endColor[0]) + "&g=" + Math.round(endColor[1]) + "&b=" + Math.round(endColor[2]);
        if (pattern !== undefined) action += "&p=" + pattern;
        if (delay !== undefined) action += "&d=" + delay;
        return this.executeAsync(action);
    };
    executeAsync = (action) => {
        return new Promise((resolve, reject) => {
            this.action = action;
            this.actionStatus = "...";
            this.invalidate();
            axios.get(this.base + action).then(res => {
                this.action = action;
                this.actionStatus = res.statusText;
                this.invalidate();
                resolve();
            }).catch(err => {
                this.action = action;
                this.actionStatus = err.message;
                this.invalidate();
                reject();
            });
        });
    };

    onActionInterval = () => {
        if (this.actionTimeout) {
            let remaining = this.actionTimeoutTime - Date.now();
            if (remaining <= 0) {
                remaining = 0;
                clearInterval(this.actionInterval);
            }
            this.actionRemaining = remaining;
            this.invalidate();
        }
    };
}

export default Arduino;