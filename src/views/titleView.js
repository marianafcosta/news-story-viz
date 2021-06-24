const TitleView = () => {
	function init() {}

	function update(title) {
		document.getElementById('viz-title').innerText = title;
	}

	return {
		init,
		update,
	};
};

export default TitleView;
