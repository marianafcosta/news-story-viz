import TitleView from '../views/titleView.js';
import { NarrativeEvents } from '../aux/consts.js';

const TitleController = (narrative) => {
	const titleView = TitleView();

	function init() {
		narrative
			.getNarrativeEvent(NarrativeEvents.CHANGE_EVENT)
			.addListener(updateTitle);
	}

	function updateTitle() {
		titleView.update(narrative.getStorylineTitle());
	}

	function run() {}

	return {
		init,
		run,
	};
};

export default TitleController;
