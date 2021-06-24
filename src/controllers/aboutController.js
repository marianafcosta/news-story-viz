import AboutView from '../views/aboutView.js';

const AboutController = () => {
	const aboutView = AboutView();

	function init() {
		aboutView.showAboutPageEvent.addListener(showAboutPage);
	}

	function showAboutPage(isVisible) {
		document.getElementById('about-container').style.display = isVisible
			? 'inherit'
			: 'none';
	}

	function run() {
		aboutView.init();
	}

	return {
		init,
		run,
	};
};

export default AboutController;
