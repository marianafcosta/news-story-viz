import TimelineView from '../views/timelineView.js';
import { NarrativeEvents } from '../aux/consts.js';

const TimelineController = (narrative) => {
	const timelineView = TimelineView();

	function init() {
		timelineView.dragDateEvent.addListener(changeScenePos);

		narrative
			.getNarrativeEvent(NarrativeEvents.CHANGE_EVENT)
			.addListener(updateTimelineView);
	}

	function changeScenePos(scene, xPos) {
		narrative.changeScenePos(scene, null, xPos);
	}

	function updateTimelineView() {
		timelineView.init(narrative);
	}

	function run() {
		timelineView.init(narrative);
	}

	function showDates() {
		timelineView.toggleDates();
	}

	return { init, run, showDates };
};

export default TimelineController;
