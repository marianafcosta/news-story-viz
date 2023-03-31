import randomColor from './randomColor.js';

const Location = (where, color) => {
  return {
    where,
    color,
  };
};

const wrangle = (data) => {
  let locations = new Map();
  let currentLocation;
  let charactersMap = {};

  const formattedScenes = data.scenes.map(function (scene, i) {
    const locationKey =
      typeof scene.location === 'object'
        ? scene.location.where
        : scene.location;
    currentLocation = locations.get(locationKey);
    if (!currentLocation && scene.location) {
      currentLocation =
        typeof scene.location === 'object'
          ? scene.location
          : Location(scene.location, randomColor());
      locations.set(locationKey, currentLocation);
    }
    scene.id = `${data.filename}-scene-${i}`;
    return {
      characters: scene.characters
        .map(function (id) {
          return characterById(id);
        })
        // NOTE: Is this filter necessary?
        .filter(function (d) {
          return d;
        }),
      date: scene.date,
      title: scene.title,
      description: scene.description,
      location: currentLocation,
      highlighted: false,
      hidden: false,
      id: scene.id,
      order: i,
      filename: data.filename,
    };
  });

  // Helper to get characters by ID from the raw data
  function characterById(id) {
    const characterToAddRaw = data.characters.find(function (character) {
      return character.id === id;
    });
    charactersMap = charactersMap || {};
    charactersMap[id] = charactersMap[id] || {
      id: characterToAddRaw.id,
      name: characterToAddRaw.name,
      affiliation: characterToAddRaw.affiliation,
      synonyms: characterToAddRaw.synonyms
        ? [...characterToAddRaw.synonyms]
        : undefined,
      hidden: false,
      filename: data.filename,
      highlighted: false,
      color: randomColor(),
    };
    return charactersMap[id];
  }

  return {
    title: data.title || 'News Viz',
    scenes: formattedScenes,
    locations,
  };
};

// NOTE: https://jsfiddle.net/klesun/zg4qbwd8/42/
const svgToPdf = (svgArray) => {
  let prevHeight = 0;
  let width, height;

  const totalWidth = svgArray.reduce(
    (max, curr) =>
      max < parseInt(curr.getAttribute('width'))
        ? parseInt(curr.getAttribute('width'))
        : max,
    0
  );
  const totalHeight = svgArray.reduce(
    (acc, curr) => acc + parseInt(curr.getAttribute('height')),
    0
  );

  const doc = new window.PDFDocument({
    size: [totalWidth, totalHeight],
  });
  const chunks = [];
  doc.pipe({
    // writable stream implementation
    write: (chunk) => chunks.push(chunk),
    end: () => {
      const pdfBlob = new Blob(chunks, {
        type: 'application/octet-stream',
      });
      var blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl);
    },
    // readable stream stub iplementation
    on: (event, action) => {},
    once: (...args) => {},
    emit: (...args) => {},
  });

  for (let svg of svgArray) {
    width = parseInt(svg.getAttribute('width'));
    height = parseInt(svg.getAttribute('height'));

    window.SVGtoPDF(doc, svg, 0, prevHeight === 0 ? prevHeight : prevHeight, {
      width: parseInt(width),
      height: parseInt(height),
      useCSS: true,
      assumePt: true,
    });

    prevHeight = height;
  }

  doc.end();
};

const createTransition = (duration, ease) => {
  return d3
    .transition()
    .duration(duration || 300)
    .ease(ease || d3.easeLinear);
};

export { wrangle, svgToPdf, Location, createTransition };
