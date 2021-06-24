import FileHandler from '../aux/fileHandler.js';
import StorylinePickerView from '../views/storylinePickerView.js';

const StorylinePickerController = (narrative) => {
	const storylinePickerView = StorylinePickerView();
	const fileHandler = FileHandler();

	function init() {
		storylinePickerView.changeStorylineEvent.addListener(changeStoryline);
	}

	async function changeStoryline(filename) {
		await narrative.changeStoryline(filename);
	}

	function run() {
		storylinePickerView.init(fileHandler.currFile(), fileHandler.filenames());
	}

	return {
		init,
		run,
	};
};

export default StorylinePickerController;
