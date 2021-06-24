import TimeSelectView from '../views/timeSelectView.js';
import { NarrativeEvents } from '../aux/consts.js';

const TimeSelectController = (narrative) => {
	const timeSelectView = TimeSelectView();

	function init() {
		timeSelectView.timeResetEvent.addListener(resetTimeframe);
		timeSelectView.hideScenesEvent.addListener(hideScenesOutsideTimeframe);
		timeSelectView.changeStartTimeEvent.addListener(changeStartTime);
		timeSelectView.changeEndTimeEvent.addListener(changeEndTime);
		timeSelectView.updateStorylineEvent.addListener(updateStoryline);

		narrative
			.getNarrativeEvent(NarrativeEvents.TIME_CHANGE_EVENT)
			.addListener(updateTimeSelectView);
	}

	function hideScenesOutsideTimeframe(startTime, endTime) {
		narrative.hideScenesOutsideTimeframe(startTime, endTime);
	}

	function resetTimeframe() {
		narrative.resetTimeframe();
	}

	function changeStartTime(st) {
		narrative.setStartTime(new Date(st));
	}

	function changeEndTime(et) {
		narrative.setEndTime(new Date(et));
	}

	function updateStoryline() {
		narrative.updateStorylineTimeframe();
	}

	function updateTimeSelectView(startTime, endTime) {
		timeSelectView.update(startTime, endTime);
	}

	function run() {
		timeSelectView.init(narrative.getStartTime(), narrative.getEndTime());
	}

	return {
		init,
		run,
	};
};

export default TimeSelectController;
