import { SCENE_WIDTH } from '../aux/consts.js';
import { createTransition } from '../aux/aux.js';
import { convertDate } from '../aux/convertDates.js';
import Event from '../aux/event.js';

const SVG_HEIGHT = 150;
const LEGEND_BUFFER = 75;

const TimelineView = () => {
	const dragDateEvent = Event();
	let shouldShowDates = false;
	let narrative;

	function init(_narrative) {
		narrative = _narrative || narrative;
		const scenes = narrative.scenes();
		const layoutSize = narrative.size()[0];

		const drag = d3
			.drag()
			.on('drag', (event, scene) => dragDateEvent.trigger(scene.id, event.x));

		const lineDimensions = {
			x1: scenes[0].x,
			x2: scenes[scenes.length - 1].x,
		};

		// SVG
		const svg = d3
			.select('div[id=timeline-div]')
			.style('height', `${SVG_HEIGHT}px`)
			.selectAll('svg[id=timeline]')
			.data([layoutSize])
			.join((enter) =>
				enter.append('svg').attr('id', 'timeline').attr('height', SVG_HEIGHT)
			)
			.attr('width', (size) => size + LEGEND_BUFFER);

		// Line
		svg
			.selectAll('line')
			.data([lineDimensions])
			.join((enter) => enter.append('line'))
			.attr('x1', (dim) => dim.x1 + SCENE_WIDTH / 2)
			.attr('x2', (dim) => dim.x2 + SCENE_WIDTH / 2)
			.attr('y1', SVG_HEIGHT - 4)
			.attr('y2', SVG_HEIGHT - 4)
			.attr('stroke', 'black');

		// Date points
		const datePoints = svg
			.selectAll('.date-group')
			.data(scenes, (scene) => scene.id)
			.join((enter) => {
				const group = enter.append('g').attr('class', 'date-group').call(drag);

				group
					.append('text')
					.attr('class', 'date-text')
					.attr('text-anchor', 'start')
					.attr('y', -8)
					.attr('x', 0)
					.attr('transform', 'rotate(-25)');

				group
					.append('circle')
					.style('fill', 'black')
					.attr('width', SCENE_WIDTH + 16)
					.attr('height', (d) => d.height + 16)
					.attr('y', 0)
					.attr('x', 0)
					.attr('r', 4);

				return group;
			})
			.attr(
				'transform',
				(scene) =>
					'translate(' + [scene.x + SCENE_WIDTH / 2, SVG_HEIGHT - 4] + ')'
			)
			.transition(createTransition())
			.style('opacity', (scene) =>
				narrative.shouldHideScene(scene.id) ? 0.2 : 1
			);

		datePoints.select('.date-text').text((scene) => {
			return scene.date && shouldShowDates
				? convertDate(new Date(scene.date), true)
				: scene.title;
		});
	}

	function toggleDates() {
		shouldShowDates = !shouldShowDates;
		init();
	}

	return {
		init,
		toggleDates,
		dragDateEvent,
	};
};

export default TimelineView;
