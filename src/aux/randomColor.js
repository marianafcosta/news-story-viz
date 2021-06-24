const SATURATION = 0.8;
const VALUE = 0.75;

// NOTE: https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
// NOTE: https://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
// NOTE: https://math.stackexchange.com/questions/2670598/golden-ratio-mod-1-distribution

const hsvToRgb = (hue, sat, val) => {
	const c = val * sat;
	const hLine = hue / 60;
	const x = c * (1 - Math.abs((hLine % 2) - 1));
	let rgb;
	if (0 <= hLine && hLine <= 1) {
		rgb = [c, x, 0];
	} else if (1 < hLine && hLine <= 2) {
		rgb = [x, c, 0];
	} else if (2 < hLine && hLine <= 3) {
		rgb = [0, c, x];
	} else if (3 < hLine && hLine <= 4) {
		rgb = [0, x, c];
	} else if (4 < hLine && hLine <= 5) {
		rgb = [x, 0, c];
	} else if (5 < hLine && hLine <= 6) {
		rgb = [c, 0, x];
	}

	const m = val - c;
	rgb[0] += m;
	rgb[1] += m;
	rgb[2] += m;
	return `rgb(${rgb[0] * 255},${rgb[1] * 255},${rgb[2] * 255})`;
};

const randomColor = () => {
	const goldenRatioConjugate = 0.618033988749895;
	const hue = (Math.random() + goldenRatioConjugate) % 1;
	return hsvToRgb(hue * 360, SATURATION, VALUE);
};

export default randomColor;
