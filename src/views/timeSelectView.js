import { convertDate } from '../aux/convertDates.js';
import Event from '../aux/event.js';

const TIMEFRAME_HIDE_ID = 'timeline-hide-scenes';
const TIMEFRAME_RESET_ID = 'timeline-reset';

const TimeSelectView = () => {
	const hideScenesEvent = Event();
	const timeResetEvent = Event();
	const changeStartTimeEvent = Event();
	const changeEndTimeEvent = Event();
	const updateStorylineEvent = Event();

	function init(startTime, endTime) {
		update(startTime, endTime);
		document.getElementById(TIMEFRAME_HIDE_ID).addEventListener('click', () => {
			hideScenesEvent.trigger();
		});
		document
			.getElementById('timeline-select-start')
			.addEventListener('change', (e) =>
				changeStartTimeEvent.trigger(e.target.value)
			);
		document
			.getElementById('timeline-select-end')
			.addEventListener('change', (e) =>
				changeEndTimeEvent.trigger(e.target.value)
			);
		document
			.getElementById(TIMEFRAME_RESET_ID)
			.addEventListener('click', () => timeResetEvent.trigger());
		document
			.getElementById('timeline-update')
			.addEventListener('click', () => updateStorylineEvent.trigger());
	}

	function update(startTime, endTime) {
		const timeStartSelect = document.getElementById('timeline-select-start');
		const timeEndSelect = document.getElementById('timeline-select-end');
		const updateStoryline = document.getElementById('timeline-update');

		if (!startTime || !endTime) {
			timeStartSelect.value = '';
			timeEndSelect.value = '';
			timeStartSelect.setAttribute('disabled', '');
			timeEndSelect.setAttribute('disabled', '');
			updateStoryline.setAttribute('disabled', '');
			document.getElementById(TIMEFRAME_HIDE_ID).setAttribute('disabled', '');
			document.getElementById(TIMEFRAME_RESET_ID).setAttribute('disabled', '');
			return;
		} else {
			document.getElementById(TIMEFRAME_HIDE_ID).removeAttribute('disabled');
			document.getElementById(TIMEFRAME_RESET_ID).removeAttribute('disabled');
			updateStoryline.removeAttribute('disabled');
			timeStartSelect.removeAttribute('disabled');
			timeEndSelect.removeAttribute('disabled');
		}

		timeStartSelect.value = convertDate(startTime);
		timeEndSelect.value = convertDate(endTime);
	}

	return {
		init,
		update,
		changeStartTimeEvent,
		changeEndTimeEvent,
		timeResetEvent,
		hideScenesEvent,
		updateStorylineEvent,
	};
};

export default TimeSelectView;
