export default {
    Black: [0, 0, 0],
    Red: [255, 0, 0],
    Green: [0, 255, 0],
    Blue: [0, 0, 255],
    Cyan: [0, 255, 255],
    Yellow: [255, 255, 0],
    Magenta: [255, 0, 255],
    White: [255, 255, 255],

    GetGradientRGB: (value, gradient) => {
        if (typeof value != "number") return [0, 0, 0];
        if (value <= gradient[0]) return gradient[1];
        if (value >= gradient[gradient.length - 2]) return gradient[gradient.length - 1];

        var lowerColor = gradient[1];
        var i = 2;
        for (; i < gradient.length - 1; i += 2) {
            if (value < gradient[i]) break;
            lowerColor = gradient[i + 1];
        }
        var higherColor = gradient[i + 1];

        return lowerColor; // no gradient

        var ratio = (value - gradient[i - 2]) / (gradient[i] - gradient[i - 2]);
        return [
            lowerColor[0] * (1 - ratio) + (higherColor[0] * ratio),
            lowerColor[1] * (1 - ratio) + (higherColor[1] * ratio),
            lowerColor[2] * (1 - ratio) + (higherColor[2] * ratio),
        ];
    }
}