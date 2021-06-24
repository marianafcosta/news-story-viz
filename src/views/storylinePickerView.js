import Event from '../aux/event.js';

const StorylinePickerView = () => {
	const changeStorylineEvent = Event();

	function init(initFile, filenames) {
		const select = document.getElementById('storyline-picker-select');
		select.addEventListener('change', (e) => {
			changeStorylineEvent.trigger(e.target.value);
		});
		let option;
		for (let filename of filenames) {
			option = document.createElement('option');
			option.value = filename;
			option.innerHTML = filename;
			initFile === filename
				? option.setAttribute('selected', '')
				: option.removeAttribute('selected');
			select.appendChild(option);
		}
	}

	return {
		init,
		changeStorylineEvent,
	};
};

export default StorylinePickerView;
