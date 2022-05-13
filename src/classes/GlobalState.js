class GlobalState {
    constructor(id) {
        this.id = id;
        this.key = this.constructor.name + ":" + id;
        this.dispatchEvent = this.createEventDispatcher(this);
    }

    get = (key) => this[key];
    set = (key, value) => {
        this[key] = value;
        this.dispatchEvent("valueChanged", { sender: this, key: key, value: value });
        this.invalidate();
    }

    invalidate = () => window.app.forceUpdate();

    createEventDispatcher = (o) => {
        var L = o.__listeners = {};
        o.addEventListener = function (n, fn) { L[n] = L[n] || []; L[n].push(fn); };
        o.removeEventListener = function (n, fn) { var a = L[n]; for (var i = 0; i < a.length; i++) if (a[i] === fn) a.splice(i, 1); };
        return function () { var a = Array.prototype.slice.call(arguments); var l = L[a.shift()]; if (l) for (var i = 0; i < l.length; i++) l[i].apply(l[i], a) };
    }
}

export default GlobalState;