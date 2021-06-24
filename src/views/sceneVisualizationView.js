import Event from '../aux/event.js';
import { SCENE_WIDTH } from '../aux/consts.js';
import { createTransition } from '../aux/aux.js';
import { convertDate } from '../aux/convertDates.js';

const VisualizationView = () => {
	const changeActiveSceneEvent = Event();
	const dragSceneEvent = Event();

	const drag = d3
		.drag()
		.on('drag', (event, scene) => dragSceneEvent.trigger(scene.id, event.y));

	function init(scenes) {
		const t = createTransition();

		// Dotted date lines
		d3.select('svg[id=narrative-chart]')
			.selectAll('.dotted-lines')
			.data(scenes, (scene) => scene.id)
			.join((enter) =>
				enter
					.append('line')
					.attr('class', 'dotted-lines')
					.attr('stroke', '#B2B2B2')
					.attr('stroke-dasharray', 2)
			)
			.attr('x1', (scene) => scene.x + SCENE_WIDTH / 2)
			.attr('x2', (scene) => scene.x + SCENE_WIDTH / 2)
			.attr('y1', 0)
			.attr('y2', (scene) => scene.y)
			.style('opacity', (scene) => (scene.hidden ? 0.2 : 1));

		const mainScene = d3
			.select('svg[id=narrative-chart]')
			.selectAll('.scene')
			.data(scenes, (d) => d.id)
			.join((enter) => {
				const returnEnter = enter
					.append('g')
					.attr('class', 'scene')
					.call(drag)
					.on('click', (_, scene) => changeActiveSceneEvent.trigger(scene.id))
					.on('mouseenter', function (e, d) {
						const tooltip = d3.select('.tooltip');
						if (!d.hidden) {
							tooltip.transition().duration(200).style('opacity', 1);
							tooltip
								.select('.tooltip-date')
								.text(d.date ? `🕐${convertDate(new Date(d.date), true)}` : '');
							tooltip
								.select('.tooltip-text')
								.text(d.location ? `📍${d.location.where}` : '');
							tooltip
								.style('left', e.pageX + 'px')
								.style('top', e.pageY + 'px');
						}
					})
					.on('mouseleave', function (_) {
						const tooltip = d3.select('.tooltip');

						tooltip.transition().duration(500).style('opacity', 0);
					});

				returnEnter
					.append('rect')
					.attr('class', 'scene-location')
					.style('fill', (scene) =>
						scene.location ? scene.location.color : 'none'
					)
					.style('fill-opacity', 0)
					.attr('width', SCENE_WIDTH + 16)
					.attr('y', -8)
					.attr('x', -8)
					.attr('rx', 20)
					.attr('ry', 20);

				returnEnter
					.append('rect')
					.attr('class', 'scene-node')
					.style('fill', 'white') // TODO: Why do I need to repeat this here?
					.attr('width', SCENE_WIDTH)
					.attr('y', 0)
					.attr('x', 0)
					.attr('rx', 12)
					.attr('ry', 12);

				returnEnter
					.append('text')
					.attr('x', 0)
					.attr('y', -10)
					.attr('font-weight', 'bold')
					.text((scene) => scene.order + 1);

				return returnEnter;
			})
			.attr('transform', (scene) => {
				var x, y;
				x = Math.round(scene.x) + 0.5;
				y = Math.round(scene.y) + 0.5;
				return 'translate(' + [x, y] + ')';
			})
			.transition(t)
			.style('fill-opacity', (scene) => (scene.hidden ? 0.2 : 1));

		mainScene
			.select('.scene-location')
			.attr('height', (scene) => scene.height + 16)
			.style('fill-opacity', (scene) =>
				scene.hiddenLocation || scene.hidden ? 0 : 1
			);

		mainScene
			.select('.scene-node')
			.attr('height', (scene) => scene.height)
			.style('fill', (scene) =>
				scene.highlighted ? 'rgb(255, 252, 187)' : 'white'
			)
			.style('stroke', '#B2B2B2')
			.style('stroke-opacity', (scene) => {
				return scene.hidden ? 0.2 : 1;
			});
	}

	function scrollToScene(x, y, narrativeExtent) {
		const viewportWidth = window.innerWidth - 600; // NOTE: 600 is the width of the sidebar
		const viewportHeight = window.innerHeight - 250; // NOTE: 250 is the height of the scene info container
		let scrollBarWidth = narrativeExtent[0] / viewportWidth;
		let scrollBarHeight = narrativeExtent[1] / viewportHeight;
		let viz = document.getElementById('visualization');
		viz.scrollTo(x - scrollBarWidth - 500, y - scrollBarHeight - 200); // NOTE: A bit jank; the 500 and 250 are kind of magic numbers but it works
	}

	return {
		init,
		scrollToScene,
		changeActiveSceneEvent,
		dragSceneEvent,
	};
};

export default VisualizationView;
