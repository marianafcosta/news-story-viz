const Event = () => {
	let listeners = [];

	function addListener(listener) {
		listeners.push(listener);
	}

	function trigger(...params) {
		listeners.forEach((listener) => listener(...params));
	}

	return {
		addListener,
		trigger,
	};
};

export default Event;
