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
        this.color = [0, 0, 0];
        
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

    setColor = (color) => {
        this.color = color;
        this.executeWithColorAsync("", color);
        this.invalidate();
    }
    setR = r => {
        this.color[0] = r;
        this.setColor(this.color);
    }
    setG = g => {
        this.color[1] = g;
        this.setColor(this.color);
    }
    setB = b => {
        this.color[2] = b;
        this.setColor(this.color);
    }

    executeWithColorAsync = (action, color) => {
        if (color) action += "?r=" + Math.round(color[0]) + "&g=" + Math.round(color[1]) + "&b=" + Math.round(color[2]);
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