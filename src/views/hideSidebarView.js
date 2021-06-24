import Event from '../aux/event.js';

const HideSidebarView = () => {
	const hideSidebarEvent = Event();

	function init() {
		document
			.getElementById('hide-sidebar-button')
			.addEventListener('click', (event) => {
				const sidebar = document.getElementById('options-container');
				const isHidden = sidebar.style.display === 'none';
				hideSidebarEvent.trigger(!isHidden);
				document.getElementById('options-container').style.display = isHidden
					? 'block'
					: 'none';
				event.target.innerHTML = isHidden ? 'Hide sidebar' : 'Show sidebar';
			});
	}

	return {
		init,
		hideSidebarEvent,
	};
};

export default HideSidebarView;
