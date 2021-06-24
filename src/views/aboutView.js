import Event from '../aux/event.js';

const AboutView = () => {
	const showAboutPageEvent = Event();

	function init() {
		document
			.getElementById('about-button')
			.addEventListener('click', () => showAboutPageEvent.trigger(true));

		document
			.getElementById('about-close')
			.addEventListener('click', () => showAboutPageEvent.trigger(false));
	}

	return {
		init,
		showAboutPageEvent,
	};
};

export default AboutView;
