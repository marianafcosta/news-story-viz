import Event from '../aux/event.js';
import { ScrollDirection } from '../aux/consts.js';
import { convertDate } from '../aux/convertDates.js';

const SceneInfoView = () => {
	const resetFocusEvent = Event();
	const scrollEvent = Event();

	function init() {
		document
			.getElementById('previous-button')
			.addEventListener('click', () =>
				scrollEvent.trigger(ScrollDirection.LEFT)
			);
		document
			.getElementById('next-button')
			.addEventListener('click', () =>
				scrollEvent.trigger(ScrollDirection.RIGHT)
			);
		document
			.getElementById('focus-button')
			.addEventListener('click', () => resetFocusEvent.trigger());
	}

	function update(title, date, description, location) {
		document.getElementById('event-date').innerHTML = date
			? `🕐${convertDate(new Date(date), true)}`
			: '';
		document.getElementById('event-location').innerHTML = location
			? `📍${location}`
			: '';
		document.getElementById('event-title').innerHTML = title
			? title
			: 'Selecione um evento';
		document.getElementById('event-info').innerHTML = description
			? description
			: 'Clique num evento ou no botão `Próximo evento` para consultar mais informação sobre um evento em particular';
	}

	return {
		init,
		update,
		resetFocusEvent,
		scrollEvent,
	};
};

export default SceneInfoView;
