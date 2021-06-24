import udpatePageTitle from './updatePageTitle.js';

let _currFile;

const FileHandler = () => {
	const fnames = [
		'carnationRevolution.json',
		'formattedOgExample.json',
		'littleRedRidingHood.json',
		't2s.json',
		'capitolRiot.json',
	];

	async function file(filename) {
		udpatePageTitle(filename);
		const response = await fetch(
			`/news-story-viz/assets/narratives/${filename}`
		);
		_currFile = filename;
		const data = await response.json();
		data.filename = filename;
		return data;
	}

	function filenames() {
		return fnames;
	}

	function currFile() {
		return _currFile;
	}

	return {
		file,
		filenames,
		currFile,
	};
};

export default FileHandler;
