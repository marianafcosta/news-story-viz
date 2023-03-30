import { jLouvain } from './jlouvain.js';
import { wrangle } from '../src/aux/aux.js';
import {
  SCENE_WIDTH,
  DEFAULT_HEIGHT,
  GROUP_MARGIN,
  PATH_SPACE,
  LABEL_SIZE,
} from '../src/aux/consts.js';
import FileHandler from '../src/aux/fileHandler.js';

// Narrative Charts
// ================
//
// `narrative()`
//
// The constructor takes no arguements. All relevant object properties should
// be set using the setter functions.

function Narrative() {
  let narrative,
    scenes,
    characters,
    introductions,
    links,
    size,
    orientation,
    pathSpace,
    scale,
    labelSize,
    labelPosition,
    groupMargin,
    scenePadding,
    groups,
    //NOTE: Added by Mariana
    originalFile,
    wrangledFile,
    locations,
    wrangledNarrative,
    fileId,
    fileHandler,
    undefinedDates;

  undefinedDates = false;
  size = [1, 1];
  scale = 1;
  pathSpace = 10;
  labelSize = [100, 15];
  labelPosition = 'right';
  scenePadding = [0, 0, 0, 0];
  groupMargin = 0;
  orientation = 'horizontal';

  // Public functions (the API)
  // ==========================
  // The narrative object which is returned and exposes the public API.
  narrative = {};

  // Initialize narrative
  // ------
  //
  // `narrative.init([array])`
  //
  // Parses JSON file with narrative and wrangles the data into the necessary format
  narrative.init = async function () {
    fileHandler = FileHandler();
    originalFile = await fileHandler.file('capitolRiot.json');
    fileId = fileHandler.currFile();
    wrangledFile = wrangle(originalFile);
    wrangledNarrative = wrangledFile.scenes;
    locations = wrangledFile.locations;
    setupNarrative();
  };

  // Storyline ID
  // ------
  //
  narrative.getStorylineId = function () {
    return fileId;
  };

  // Storyline title
  // ------
  //
  narrative.getStorylineTitle = function () {
    return wrangledFile.title;
  };

  // Scenes
  // ------
  //
  // `narrative.scenes([array])`
  //
  // Set or get the scenes array. If an array is passed, sets the narrative's
  // scenes to the passed array, else returns the scenes array.
  narrative.scenes = function (_) {
    if (!arguments.length) {
      return scenes;
    }
    scenes = _;
    return narrative;
  };

  // Characters
  // ----------
  //
  // `narrative.characters([array])`
  //
  // Set or get the characters array. If an array is passed, sets the
  // narrative's characters array, otherwise returns the characters array.
  narrative.characters = function (_) {
    if (!arguments.length) {
      return characters;
    }
    characters = _;
    return narrative;
  };

  // Size
  // ----
  //
  // `narrative.size([array])`
  //
  // Set or get the size of the layout. A two element array `[width,height]`. Note
  // that this is considered a guide for the layout algorithm.
  // See `narrative.extent()` for getting the final size of the layout.
  narrative.size = function (_) {
    if (!arguments.length) {
      return size;
    }
    size = _;
    return narrative;
  };

  // Orientation
  // -----------
  //
  // `narrative.orientation([orientation])`
  //
  // *Incomplete:* Only the default (horizontal) option is fully supported.
  //
  // Set the orientation to use for the layout. The choices are `'horizontal'` (default)
  // or `'vertical'`. In a horizontal orientation 'time' runs from left to right
  // and in vertical, top to bottom.
  narrative.orientation = function (_) {
    if (!arguments.length) {
      return orientation;
    }
    orientation = _;
    return narrative;
  };

  // Extent
  // ------
  //
  // `narrative.extent()`
  //
  // Get the extent of the space used by the layout. This is useful for adjusting
  // the size of the containing element after the layout has been calculated.
  //
  // Despite being able to set the size (see `narrative.size()`), it's not always
  // possible to contain the chart in the available space. This function will
  // provide a `[width,height]` array of the layout extent *after* the layout has
  // run.
  narrative.extent = function () {
    return scenes.concat(introductions).reduce(
      // NOTE: max->accumulator, d->current value
      function (max, d) {
        let bounds = d.bounds();
        if (bounds[1][1] > max[1]) {
          max[1] = bounds[1][1];
        }
        if (bounds[1][0] > max[0]) {
          max[0] = bounds[1][0];
        }
        return max;
      },
      [0, 0] // NOTE: Initial value
    );
  };

  // Path space
  // ----------
  //
  // `narrative.pathSpace([number])`
  //
  // Set or get the space available to each character's path.
  narrative.pathSpace = function (_) {
    if (!arguments.length) {
      return pathSpace;
    }
    pathSpace = _;
    return narrative;
  };

  // Group margin
  // ------------
  //
  // `narrative.groupMargin([margin])`
  //
  // The characters are divided into groups based on the strength of their relationships
  // (i.e. co-appearances in scenes). These groups are then arranged in a way designed
  // to reduce congestion in the centre of the chart. To give the layout a more open
  // feel, a group margin can be set.
  narrative.groupMargin = function (_) {
    if (!arguments.length) {
      return groupMargin;
    }
    groupMargin = _;
    return narrative;
  };

  // Scene padding
  // -------------
  //
  // `narrative.scenePadding([array])`
  //
  // By default scenes have a height equal to `character height × character count`
  // and a width of zero. You may want to allow for extra space around scenes so
  // collisions with labels can be avoided. To set a padding pass an array of values
  // matching the CSS padding argument order `[top, right, bottom, left]`.
  narrative.scenePadding = function (_) {
    if (!arguments.length) {
      return scenePadding;
    }
    scenePadding = _;
    return narrative;
  };

  // Label size
  // ----------
  //
  // `narrative.labelSize([array])`
  //
  // Set or get the default space to allocate in the layout for character labels.
  // Must be a two element array `[width,height]`. Label sizes specific to each
  // character which will override these defaults can be set by defining `height`
  // and `width` properties on individual character objects.
  narrative.labelSize = function (_) {
    if (!arguments.length) {
      return labelSize;
    }
    labelSize = _;
    return narrative;
  };

  // Label position
  // --------------
  //
  // `narrative.labelPosition([string])`
  //
  // Set or get the default label position for character labels. Valid options are
  // `above`, `below`, `left`, `right`. This can be overridden by setting defining
  // a `labelPosition` property on individual character objects.
  narrative.labelPosition = function (_) {
    if (!arguments.length) {
      return labelPosition;
    }
    labelPosition = _;
    return narrative;
  };

  // Links
  // -----
  //
  // `narrative.links()`
  //
  // Returns an array of links. Each link is consecutive appearances for a given
  // character. Links are an object with `source` and `target` properties which
  // are both appearance objects.
  narrative.links = function () {
    return links;
  };

  // Link
  // ----
  //
  // `narrative.link()`
  //
  // Returns a function for generating path strings for links.
  // Links are objects with `source` and `target` properties which each contain
  // an `x` and `y` property. In the context of the narrative chart these are
  // either character apperance or introduction nodes.
  narrative.link = function () {
    let curvature = 0.5;

    // ### Link path
    //
    // `link([object])`
    //
    // This function should be used to set the `path` attribute of links when
    // displaying the narrative chart. It accepts an object and returns a path
    // string linking the two.
    function link(d) {
      let x0, x1, y0, y1, cx0, cy0, cx1, cy1, ci;

      // Set path end positions.
      x0 = d.source.scene ? d.source.scene.x + d.source.x : d.source.x;
      y0 = d.source.scene ? d.source.scene.y + d.source.y : d.source.y;
      x1 = d.target.scene ? d.target.scene.x + d.target.x : d.target.x;
      y1 = d.target.scene ? d.target.scene.y + d.target.y : d.target.y;

      // Set control points.
      if (orientation === 'vertical') {
        ci = d3.interpolateNumber(y0, y1);
        cx0 = x0;
        cy0 = ci(curvature);
        cx1 = x1;
        cy1 = ci(1 - curvature);
      } else {
        ci = d3.interpolateNumber(x0, x1);
        cx0 = ci(curvature);
        cy0 = y0;
        cx1 = ci(1 - curvature);
        cy1 = y1;
      }

      return (
        'M' +
        x0 +
        ',' +
        y0 +
        'C' +
        cx0 +
        ',' +
        cy0 +
        ' ' +
        cx1 +
        ',' +
        cy1 +
        ' ' +
        x1 +
        ',' +
        y1
      );
    }

    // ### Curvature
    //
    // `link.curvature([number])`
    //
    // Set or get the curvature which should be used to generate links. Should be
    // in the range zero to one.
    link.curvature = function (_) {
      if (!arguments.length) {
        return curvature;
      }
      curvature = _;
      return link;
    };

    return link;
  };

  // Introductions
  // -------------
  //
  // `narrative.introductions()`
  //
  // Get an array of character introductions for plotting on the graph. Introductions
  // are nodes (usually with labels) displayed before the first scene in which each
  // character appears.
  narrative.introductions = function () {
    return introductions;
  };

  // Introductions
  // -------------
  //
  // `narrative.introductions()`
  //
  // Gets the introduction with the specified id
  narrative.introduction = function (id) {
    return introductions.find((intro) => intro.id === id);
  };

  // Get the scene locations
  // -----
  //
  // NOTE: We're purposefully only updating the Y position.
  narrative.locations = function () {
    return locations;
  };

  // Get scene
  // -------------
  //
  // `narrative.scene(id)`
  //
  // Returns the scene with the corresponding ID, or undefined if it doesn't
  // exist.
  narrative.scene = function (id) {
    return scenes.find((currScene) => currScene.id === id);
  };

  // Get scene by index
  // -------------
  //
  // `narrative.sceneByIndex(id)`
  //
  // Returns the scene with the corresponding ID, or undefined if it doesn't
  // exist.
  narrative.sceneByIndex = function (index) {
    return scenes[index];
  };

  // Get scene by index
  // -------------
  //
  // `narrative.sceneIndex(id)`
  //
  // Returns the index of the scene with the corresponding ID
  narrative.sceneIndex = function (id) {
    return scenes.findIndex((scene) => scene.id === id);
  };

  // Get character
  // -------------
  //
  // `narrative.character(id)`
  //
  // Returns the character with the specified ID, or undefined if it doesn't
  // exist.
  narrative.character = function (id) {
    return characters.find((currChar) => currChar.id === id);
  };

  // Undefined dates
  // -------------
  //
  // `narrative.undefinedDates()`
  //
  // Determines whether or not the original JSON had scenes without any specified dates.
  narrative.undefinedDates = function () {
    return undefinedDates;
  };

  // Update the storyline to include only the selected characters
  // -----
  //
  narrative.updateStorylineCharacters = function () {
    let newCharacters = getNewCharacters(true);
    let newStoryline = {
      characters: newCharacters,
      scenes: getNewScenes(newCharacters.map((char) => char.id)),
      filename: fileId,
    };

    updateStorylineAux(newStoryline);
  };

  // Update the storyline to include only the selected scenes
  // -----
  //
  narrative.updateStorylineScenes = function () {
    let newCharacters = getNewCharacters(false);
    let newStoryline = {
      characters: newCharacters,
      scenes: getNewScenes(
        newCharacters.map((char) => char.id),
        true
      ),
      filename: fileId,
    };

    updateStorylineAux(newStoryline);
  };

  narrative.updateStorylineTimeframe = function (startTime, endTime) {
    let newCharacters = getNewCharacters(false);
    let newStoryline = {
      characters: newCharacters,
      scenes: getNewScenes(
        newCharacters.map((char) => char.id),
        false,
        true,
        startTime,
        endTime
      ),
      filename: fileId,
    };

    updateStorylineAux(newStoryline);
  };

  // Reset storyline to the one in the original JSON
  // -----
  //
  narrative.resetStoryline = function () {
    updateStorylineAux(originalFile);
  };

  // Change the storyline according to the user selection
  // -----
  //
  narrative.changeStoryline = async function (filename) {
    originalFile = await fileHandler.file(filename);
    fileId = fileHandler.currFile();
    updateStorylineAux(originalFile);
  };

  // Update the placement of the nodes in the visualization. If `isProportional`
  // is set to true, then the scenes will be placed according to their timestamps.
  // Otherwise, they will be placed uniformly
  // -----
  //
  narrative.changeScenePlacement = function (isProportional) {
    isProportional && !undefinedDates
      ? computeSceneTimingProportional()
      : computeSceneTiming();
    computeAppearancePositions();
    computeScenePositions(isProportional);
    createIntroductionNodes();
    computeIntroductionPositions();
    createLinks();
  };

  // Layout
  // ------
  //
  // `narrative.layout()`
  //
  // Compute the narrative layout. This should be called after all options and
  // data have been set and before attempting to use the layout's output for
  // display purposes.
  narrative.layout = function () {
    computeSceneCharacters();
    computeCharacterGroups();
    setSceneGroups();
    computeGroupAppearances();
    sortGroups();
    computeGroupPositions();
    computeCharacterGroupPositions();
    sortGroupAppearances();
    computeSceneTiming();
    computeAppearancePositions();
    computeAppearanceIds();
    computeScenePositions();
    createIntroductionNodes();
    computeIntroductionPositions();
    createLinks();
    return narrative;
  };

  // Return the public API.
  return narrative;

  // Private functions
  // =================

  // Calculate the width of the character label and setup the layout
  // ------
  //
  function setupNarrative() {
    const width = wrangledNarrative.length * SCENE_WIDTH * 4 + LABEL_SIZE[0];
    let svgInit = d3
      .select('#visualization')
      .append('svg')
      .attr('id', 'visualization-init');

    // Calculate the actual width of every character label.
    wrangledNarrative.forEach(function (scene) {
      scene.characters.forEach(function (character) {
        character.width =
          svgInit
            .append('text')
            .attr('opacity', 0)
            .attr('class', 'temp')
            .text(character.name)
            .node()
            .getComputedTextLength() + 10;
      });
    });

    // Remove all the temporary labels.
    svgInit.selectAll('text.temp').remove();
    svgInit.remove();

    // NOTE: Order the scenes according to date
    orderScenes(wrangledNarrative);

    narrative
      .scenes(wrangledNarrative)
      .size([width, DEFAULT_HEIGHT])
      .pathSpace(PATH_SPACE) // NOTE: Space between links
      .groupMargin(GROUP_MARGIN) // NOTE: Doesn't really seem to make a difference
      .labelSize(LABEL_SIZE)
      .scenePadding([2, SCENE_WIDTH / 2, 2, SCENE_WIDTH / 2])
      .labelPosition('left')
      .layout();
  }

  // Auxiliary function for the storyline update features
  // -----
  //
  function updateStorylineAux(newStoryline) {
    wrangledFile = wrangle(newStoryline);
    wrangledNarrative = wrangledFile.scenes;
    locations = wrangledFile.locations;
    setupNarrative();
  }

  // Auxiliary function that returns the array of scenes that should be
  // included in the updated storyline, according to the type of update
  // (whether it should keep the selected characters, the selected scenes,
  // or the scenes within the current timeframe);
  // -----
  //
  function getNewScenes(
    newCharacters,
    onlySelectedScenes,
    onlyWithinTimeframe,
    startTime,
    endTime
  ) {
    let newScenes = [];
    let shouldIncludeScene = true;

    scenes.forEach((rawScene) => {
      let { id, title, date, description, location } = rawScene;
      const charsInScene = newCharacters.filter((rawChar) =>
        rawScene.characters.find((charInScene) => charInScene.id === rawChar)
      );

      if (onlySelectedScenes) {
        shouldIncludeScene = rawScene.highlighted;
      } else if (onlyWithinTimeframe) {
        const sceneDate = new Date(rawScene.date);
        shouldIncludeScene = sceneDate >= startTime && sceneDate <= endTime;
      }

      charsInScene.length > 0 &&
        shouldIncludeScene &&
        newScenes.push({
          id,
          title,
          date,
          description,
          location,
          characters: charsInScene,
        });
    });

    return newScenes;
  }

  // Auxiliary function that returns the array of characters that should be
  // included in the updated storyline, according to the type of update
  // (whether it should keep the selected characters, the selected scenes,
  // or the scenes within the current timeframe);
  // -----
  //
  function getNewCharacters(onlySelectedCharacters) {
    let newCharacters = [];
    let currActiveChars = [];

    // NOTE: Include only the characters highlighted by the user
    if (onlySelectedCharacters) {
      // NOTE: Build array of active char ID's
      characters.forEach((char) => {
        if (char.highlighted) {
          currActiveChars.push(char.id);
        }
      });

      if (currActiveChars.length <= 0) {
        return newCharacters; // NOTE: No characteres selected, do nothing
      }

      // NOTE: Get the characters that are still present in the new storyline
      characters.forEach((rawChar) => {
        if (currActiveChars.includes(rawChar.id)) {
          const { id, name, affiliation, synonyms } = rawChar;
          newCharacters.push({
            id,
            name,
            affiliation,
            synonyms,
          });
        }
      });
    } else {
      newCharacters = characters.map(({ id, name, affiliation, synonyms }) => ({
        id,
        name,
        affiliation,
        synonyms,
      }));
    }

    return newCharacters;
  }

  // Initial data wrangling
  // ----------------------
  //
  // Populate the scenes with characters from the characters array.
  // This method also cleanses the data to exclude characters which appear only once
  // and scenes with fewer than two characters.
  function computeSceneCharacters() {
    let appearances, finished;

    // Create a map of scenes to characters (i.e. appearances).
    appearances = [];
    scenes.forEach(function (scene) {
      scene.characters.forEach(function (character) {
        // If the character isn't an object assume it's an index from the characters array.
        character =
          typeof character === 'object' ? character : characters[character];

        // Note forced character positions and sizes.
        character._x = character.x || false;
        character._y = character.y || false;
        character._width = character.width || false;
        character._height = character.height || false;

        // Add this appearance to the map.
        appearances.push({ character: character, scene: scene });

        // Setup some properties on the character and scene that we'll need later.
        scene.appearances = [];
        scene.bounds = getSceneBounds;
        character.appearances = [];
      });

      // note forces scene positions.
      scene._x = scene.x || false;
      scene._y = scene.y || false;
    });

    // Recursively filter appearances so we ultimately only include characters
    // with more than a single appearance and scenes with more than a single
    // character.
    while (!finished) {
      finished = true;
      appearances = appearances.filter(filterAppearances);
    }

    // Filter appearances.
    //
    // TODO: this could probably be more efficient (maybe with an index https://gist.github.com/AshKyd/adc7fb024787bd543fc5)
    // NOTE: This is not necessary if we want to include single-character scenes and single-scene characters
    function filterAppearances(appearance) {
      let counts, keep;

      counts = appearances.reduce(
        function (c, a) {
          if (appearance.character === a.character) {
            c[0]++;
          }

          if (appearance.scene === a.scene) {
            c[1]++;
          }

          return c;
        },
        [0, 0] // [number of characters, number of scenes]
      );

      keep = counts[0] >= 1 && counts[1] >= 1; // NOTE: Remove the '=' to exclude single-character scenes and single-scene characters
      finished = finished && keep;

      return keep;
    }

    // Re-construct `characters` and `scenes` arrays with filtered appearances.
    characters = [];
    scenes = [];
    appearances.forEach(function (appearance) {
      // Cross reference scenes and characters based on appearances.
      appearance.scene.appearances.push(appearance); // NOTE: The recursivity is confusing me
      appearance.character.appearances.push(appearance);

      if (characters.indexOf(appearance.character) === -1) {
        characters.push(appearance.character);
      }

      if (scenes.indexOf(appearance.scene) === -1) {
        scenes.push(appearance.scene);
      }
    });
  }

  // Character clustering
  // --------------------
  //
  // Cluster characters based on their co-occurence in scenes
  function computeCharacterGroups() {
    let nodes, edges, clusters, partitioner, groupsMap, initGroups;

    // An array of character indexes.
    nodes = characters.map(function (d, i) {
      return i;
    });

    // NOTE: Don't really understand what this is doing, initGroups just gets initialized to an empty object
    initGroups = characters.reduce(function (g, d, i) {
      if (d.initialgroup) {
        g[i] = +d.initialgroup;
      }
      return g;
    }, {});

    // Calculate the edges based on a character's involvement in scenes.
    // NOTE: Links between each pair of characters in a scene
    edges = [];
    scenes.forEach(function (scene) {
      edges = edges.concat(sceneEdges(scene.appearances));
    });

    // Consolidate edges into a unique set of relationships with a weighting
    // based on how often they appear together.
    // NOTE: How often two characters appear together?
    edges = edges.reduce(function (result, edge) {
      let resultEdge;

      resultEdge = result.filter(function (resultEdge) {
        return (
          (resultEdge.target === edge[0] || resultEdge.target === edge[1]) &&
          (resultEdge.source === edge[0] || resultEdge.source === edge[1])
        );
      })[0] || { source: edge[0], target: edge[1], weight: 0 };

      resultEdge.weight++;

      if (resultEdge.weight === 1) {
        result.push(resultEdge);
      }

      return result;
    }, []);

    // Generate the groups.
    partitioner = jLouvain().nodes(nodes).edges(edges);

    if (initGroups) {
      partitioner.partition_init(initGroups);
    }
    clusters = partitioner();

    // Put all characters in groups with bi-directional reference.
    groups = [];
    groupsMap = {};
    characters.forEach(function (character, i) {
      let groupId, group;
      groupId = clusters[i];
      group = groupsMap[groupId];
      if (!group) {
        group = { id: groupId, characters: [] };
        groups.push(group);
        groupsMap[groupId] = group;
      }
      group.characters.push(character);
      character.group = group;
    });

    // Creates a single link between each pair of characters in a scene.
    function sceneEdges(list) {
      let i, j, matrix;
      matrix = [];
      for (i = list.length; i--; ) {
        for (j = i; j--; ) {
          matrix.push([
            characters.indexOf(list[i].character),
            characters.indexOf(list[j].character),
          ]);
        }
      }
      return matrix;
    }
  }

  // Group scenes
  // ------------
  //
  // Each scene is assigned to a group based on the median character group for
  // characters appearing in that scene.
  // *Note:* "median" here is a mistake, it should be mode.
  function setSceneGroups() {
    scenes.forEach(function (scene) {
      let groupCounts, groupCountsMap, medianGroup;

      groupCounts = [];
      groupCountsMap = {};
      scene.appearances.forEach(function (appearance) {
        let count, index;

        index = groups.indexOf(appearance.character.group);
        count = groupCountsMap[index];

        if (!count) {
          count = { groupIndex: index, count: 0 };
          groupCountsMap[index] = count;
          groupCounts.push(count);
        }
        count.count++;
      });

      groupCounts.sort(function (a, b) {
        return a.count - b.count;
      });

      medianGroup = groups[groupCounts.pop().groupIndex];
      // While we're here record how many scenes this group is the modal group for.
      medianGroup.medianCount = medianGroup.medianCount || 0;
      medianGroup.medianCount++;
      scene.group = medianGroup;
    });
  }

  // Group appearances
  // -----------------
  //
  // Assign unique set of characters to each group based on appearances in
  // scenes belonging to that group.
  function computeGroupAppearances() {
    scenes.forEach(function (scene) {
      let characters;
      characters = scene.appearances.map(function (a) {
        return a.character;
      });
      scene.group.appearances = scene.group.appearances || [];
      scene.group.appearances = scene.group.appearances.concat(
        characters.filter(function (character) {
          return scene.group.appearances.indexOf(character) === -1;
        })
      );
    });
  }

  // Sort groups
  // -----------
  //
  // Sort the array of groups so groups which are most often the median are at
  // the extremes of the array. The centre most group should be the group which
  // is least often the median group of a scene.
  function sortGroups() {
    let alt, sortedGroups, group, i;

    // First sort by the group's medianCount property (the number of times the
    // group is the median group in a scene).
    groups.sort(function (a, b) {
      return b.medianCount - a.medianCount;
    });

    // Specify order property and shuffle out groups into an ordered array.
    // NOTE: I think the Louvain method is just detecting one group (at least for the Star Wars example)
    sortedGroups = [];
    i = 0;
    while (groups.length) {
      group = alt ? groups.pop() : groups.shift();
      group.order = i;
      i++;
      sortedGroups.push(group);
      alt = !alt;
    }

    groups = sortedGroups;
  }

  // Group positions
  // ---------------
  //
  // Compute the actual min and max y-positions of each group.
  function computeGroupPositions() {
    let max;
    max = 0;
    groups.forEach(function (group) {
      group.min = max;
      group.max = max =
        characterGroupHeight(group.appearances.length) + group.min;
      max += groupMargin;
    });
  }

  // Character group positions
  // -------------------------
  //
  // Compute the position of each character within its group.
  function computeCharacterGroupPositions() {
    characters.forEach(function (character) {
      let sum, count;
      sum = count = 0;
      character.appearances.forEach(function (appearance) {
        count++;
        sum += groups.indexOf(appearance.scene.group);
      });
      character.averageScenePosition = sum / count;
    });

    groups.forEach(function (group) {
      group.characters.sort(function (a, b) {
        let diff;
        // Average scene position.
        diff = a.averageScenePosition - b.averageScenePosition;
        if (diff !== 0) {
          return diff;
        }

        return characters.indexOf(a) - characters.indexOf(b);
      });
    });
  }

  // Sort group appearances
  // ----------------------
  //
  // Group appearances (`group.appearances`) is an array
  // of all characters which appear in scenes assigned to this group.
  function sortGroupAppearances() {
    groups.forEach(function (group) {
      group.appearances.sort(function (a, b) {
        let diff;

        // Try simple group order.
        diff = a.group.order - b.group.order;
        if (diff !== 0) {
          return diff;
        }

        // Average scene position.
        diff = a.averageScenePosition - b.averageScenePosition;
        if (diff !== 0) {
          return diff;
        }

        // Array position.
        return characters.indexOf(a) - characters.indexOf(b);
      });
    });
  }

  // Scene timing
  // ------------
  //
  // Compute the scene timing.
  //
  // TODO: support dates
  function computeSceneTiming() {
    let duration = 1;
    scenes.forEach(function (scene) {
      scene.start = duration;
      scene.duration = 1;
      duration += scene.duration;
    });

    scale =
      (orientation === 'vertical'
        ? size[1] - labelSize[1]
        : size[0] - labelSize[0]) / duration;
  }

  // Scene timing
  // ------------
  //
  // Compute the scene timing.
  //
  // TODO: This relies on the ordering of the scenes in their array
  function computeSceneTimingProportional() {
    const startTime = new Date(scenes[0].date);
    const endTime = new Date(scenes[scenes.length - 1].date);
    const timeRange = Math.abs(endTime - startTime);

    const startViz = labelSize[0] + SCENE_WIDTH;
    const endViz = narrative.extent()[0] - SCENE_WIDTH;
    const vizRange = endViz - startViz;

    const k =
      (startViz - endViz) /
      (Math.log10(startTime.getTime()) - Math.log10(endTime.getTime()));

    const c = startViz - k * Math.log10(startTime.getTime());

    let currTime, posTime, posViz;

    scenes.forEach(function (scene) {
      currTime = new Date(scene.date);

      posTime = ((currTime - startTime) * 100) / timeRange;
      posViz = (posTime * vizRange) / 100 + startViz;

      scene.start = k * Math.log10(currTime.getTime()) + c;
    });

    scale =
      (orientation === 'vertical'
        ? size[1] - labelSize[1]
        : size[0] - labelSize[0]) / scenes.length;
  }

  // Scene overlap
  // -------------------
  //
  // If a scene overlaps with the next, then move all scenes after the scene by a set amount
  // TODO: Only works in an horizontal orientation
  function checkOverlappingScenes() {
    // determine what the largest overlap is
    let maxOverlap = 0;
    let distBetweenScenes;
    for (let index = 0; index < scenes.length - 1; index++) {
      distBetweenScenes = Math.abs(scenes[index + 1].x - scenes[index].x);
      if (
        distBetweenScenes < scenes[index].width &&
        distBetweenScenes > maxOverlap
      ) {
        maxOverlap = distBetweenScenes;
      }
      // if (distBetweenScenes < scenes[index].width) {
      // 	moveOverlappingScenes(
      // 		index + 1,
      // 		scenes[index].width - distBetweenScenes
      // 	);
      // }
    }

    // find the smallest multiplier that removes that overlap
    const overlapFactor = (maxOverlap + 10) / (SCENE_WIDTH / 2);
    const multiplier = 1 + overlapFactor;
    // update the x coordinate of all scenes to reflect the scale
    scenes.forEach((scene) => (scene.x *= multiplier));
  }

  // Move overlaps
  // -------------------
  //
  // Move every scene from the `startIndex` onwards by a fixed amount
  function moveOverlappingScenes(startIndex, dist) {
    for (let index = startIndex; index < scenes.length; index++) {
      scenes[index].x += dist;
    }
  }

  // Scene order
  // -------------------
  //
  // Orders the scenes according to their timestamp
  function orderScenes(unorderedScenes) {
    // NOTE: If any of the dates are undefined, then use the relative ordering of the file
    undefinedDates = unorderedScenes.find((scene) => !scene.date);
    if (!undefinedDates) {
      unorderedScenes.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      unorderedScenes.forEach((scene) => (scene.date = null));
    }
  }

  // Character positions
  // -------------------
  //
  // Compute the position of characters within a scene.
  function computeAppearancePositions() {
    scenes.forEach(function (scene) {
      scene.appearances.sort(function (a, b) {
        let diff;

        // Try simple group order.
        diff = a.character.group.order - b.character.group.order;
        if (diff !== 0) {
          return diff;
        }

        // For characters in the same group use average scene position.
        diff =
          a.character.averageScenePosition - b.character.averageScenePosition;
        if (diff !== 0) {
          return diff;
        }

        // All else failing use main characters array order to keep things consistent.
        return (
          characters.indexOf(a.character) - characters.indexOf(b.character)
        );
      });

      scene.appearances.forEach(function (appearance, i) {
        if (orientation === 'vertical') {
          appearance.y = scenePadding[0];
          appearance.x = characterPosition(i) + scenePadding[3];
        } else {
          appearance.y = characterPosition(i) + scenePadding[0];
          appearance.x = scenePadding[3];
        }
      });
    });
  }

  function computeAppearanceIds() {
    scenes.forEach((scene, sceneIdx) => {
      scene.appearances.forEach(
        (app, appIdx) =>
          (app.id = `${scene.filename}-appearance-${sceneIdx}-${appIdx}`)
      );
    });
  }

  // Position scenes
  // ---------------
  //
  // Compute the actual x and y positions for each scene.
  function computeScenePositions(isProportional) {
    const yBuffer = 20; // TODO: Make this uniform throughout the application
    scenes.forEach(function (scene) {
      let sum, avg, appearances;

      scene.height =
        characterGroupHeight(scene.appearances.length) +
        scenePadding[0] +
        scenePadding[2];
      scene.width = scenePadding[1] + scenePadding[3];

      appearances = scene.appearances.filter(function (appearance) {
        return appearance.character.group !== scene.group;
      });

      if (!appearances.length) {
        appearances = scene.appearances;
      }

      sum = appearances.reduce(function (total, appearance) {
        return (total +=
          characterPosition(
            scene.group.appearances.indexOf(appearance.character)
          ) + scene.group.min);
      }, 0);

      avg = sum / appearances.length;

      if (orientation === 'vertical') {
        scene.x =
          scene._x || Math.max(0, Math.min(size[0], avg - scene.width / 2));
        scene.y =
          scene._y ||
          Math.max(0, Math.min(size[1], scale * scene.start + labelSize[1]));
      } else {
        scene.x =
          scene._x ||
          (isProportional
            ? Math.max(0, Math.min(size[0], scene.start))
            : Math.max(
                0,
                Math.min(size[0], scale * scene.start + labelSize[0])
              ));
        scene.y =
          scene._y ||
          Math.max(yBuffer, Math.min(size[1], avg - scene.height / 2));
      }
    });
    if (isProportional) {
      // checkOverlappingScenes(); // TODO: This causes the visualization to overflow in certain scenarios
    }
  }

  // Introduction nodes
  // ------------------
  //
  // Create a collection of character 'introduction' nodes. These are nodes which
  // are displayed before the first appearance of each character.
  function createIntroductionNodes() {
    let appearances;

    appearances = characters.map(function (character) {
      return character.appearances[0];
    });

    introductions = [];
    appearances.forEach(function (appearance) {
      let introduction, x, y;

      // Create the introduction object.
      introduction = {
        id: `intro-${appearance.character.id}`,
        character: appearance.character,
        bounds: getLabelBounds,
      };

      // Set the default position.
      if (orientation === 'vertical') {
        x = appearance.scene.x + appearance.x;
        y = appearance.scene.y - 0.5 * scale;

        // Move x-axis position to the dedicated label space if it makes sense.
        // if (x-labelSize[0] < labelSize[0]) {
        // 	x = labelSize[0];
        // }
      } else {
        x = appearance.scene.x - 0.5 * scale;
        y = appearance.scene.y + appearance.y;

        // Move x-axis position to the dedicated label space if it makes sense.
        if (x - labelSize[0] < labelSize[0]) {
          x = labelSize[0];
        }
      }

      if (orientation === 'vertical') {
        introduction.x =
          appearance.character._x ||
          Math.max(
            0 + labelSize[0] / 2,
            Math.min(size[0] - labelSize[0] / 2, x)
          );
        introduction.y =
          appearance.character._y ||
          Math.max(0, Math.min(size[1] - labelSize[1], y));
      } else {
        introduction.x =
          appearance.character._x ||
          Math.max(0, Math.min(size[0] - labelSize[0], x));
        introduction.y =
          appearance.character._y ||
          Math.max(
            0 + labelSize[1] / 2,
            Math.min(size[1] - labelSize[1] / 2, y)
          );
      }

      introduction.width = appearance.character._width || labelSize[0];
      introduction.height = appearance.character._height || labelSize[1];
      appearance.character.introduction = introduction;

      introductions.push(introduction);
    });
  }

  // Introduction positions
  // ----------------------
  //
  // Layout the introduction nodes so that wherever possible they don't overlap
  // scenes or each other.
  function computeIntroductionPositions() {
    let collidables, intros;

    // Get a list of things introductions can collide with.
    collidables = introductions.concat(scenes);

    // Use a copy of the introductions array so we can sort it without changing
    // the main array's order.
    intros = introductions.slice();
    console.log(intros);

    // Sort by y-axis position top to bottom.
    intros.sort(function (a, b) {
      return a.y - b.y;
    });

    // Attempt to resolve collisions.
    intros.forEach(
      orientation === 'vertical'
        ? resolveCollisionsVertical
        : resolveCollisionsHorizontal
    );

    // Resolve collisions with horizontal layout.
    function resolveCollisionsHorizontal(introduction) {
      let moveOptions,
        collisionBounds,
        introBounds,
        move,
        _y,
        collisions,
        movable;

      // Get the full list of items this introduction collides with
      collisions = collidesWith(introduction);

      // No need to continue if there are no collisions.
      if (!collisions) {
        return;
      }

      // Move colliding items out of the way if possible.
      movable = collisions.filter(function (collision) {
        return collision.character;
      });
      movable.forEach(moveCollision);

      // Now only consider immovables (i.e. scene nodes).
      collisions = collisions.filter(function (collision) {
        return !collision.character;
      });

      // No need to continue if there are no collisions.
      if (!collisions) {
        return;
      }

      // Get a bounding box for all remaining colliding nodes.
      collisionBounds = bBox(collisions);
      introBounds = introduction.bounds();

      // Record the original y-axis position so we can revert if a move is a failure.
      _y = introduction.y;

      // Calculate the two move options (up or down).
      moveOptions = [
        collisionBounds[1][1] - introBounds[0][1],
        collisionBounds[0][1] - introBounds[1][1],
      ];

      // Sort by absolute distance. Try the smallest move first.
      moveOptions.sort(function (a, b) {
        return Math.abs(a) - Math.abs(b);
      });

      // Try the move options in turn.
      while ((move = moveOptions.shift())) {
        introduction.y += move;
        collisions = collidesWith(introduction);

        if (collisions) {
          if (move > 0 && collisions.every(isMovable)) {
            collisions.forEach(moveCollision);
            break;
          } else {
            introduction.y = _y;
          }
        } else {
          break;
        }
      }

      // Move the colliding nodes.
      function moveCollision(collision) {
        collision.y += introduction.bounds()[1][1] - collision.bounds()[0][1];
      }
    }

    // Resolve collisions with vertical layout.
    function resolveCollisionsVertical(introduction) {
      let moveOptions,
        collisionBounds,
        introBounds,
        move,
        _y,
        collisions,
        movable;

      // Get the full list of items this introduction collides with
      collisions = collidesWith(introduction);

      // No need to continue if there are no collisions.
      if (!collisions) {
        return;
      }

      // Move colliding items out of the way if possible.
      movable = collisions.filter(function (collision) {
        return collision.character;
      });
      movable.forEach(moveCollision);

      // Now only consider immovables (i.e. scene nodes).
      collisions = collisions.filter(function (collision) {
        return !collision.character;
      });

      // No need to continue if there are no collisions.
      if (!collisions) {
        return;
      }

      // Get a bounding box for all remaining colliding nodes.
      collisionBounds = bBox(collisions);
      introBounds = introduction.bounds();

      // Record the original y-axis position so we can revert if a move is a failure.
      _y = introduction.y;

      // Calculate the two move options (up or down).
      moveOptions = [
        collisionBounds[1][1] - introBounds[0][1],
        collisionBounds[0][1] - introBounds[1][1],
      ];

      // Sort by absolute distance. Try the smallest move first.
      moveOptions.sort(function (a, b) {
        return Math.abs(a) - Math.abs(b);
      });

      // Try the move options in turn.
      while ((move = moveOptions.shift())) {
        introduction.y += move;
        collisions = collidesWith(introduction);

        if (collisions) {
          if (move > 0 && collisions.every(isMovable)) {
            collisions.forEach(moveCollision);
            break;
          } else {
            introduction.y = _y;
          }
        } else {
          break;
        }
      }

      // Move the colliding nodes.
      function moveCollision(collision) {
        collision.y += introduction.bounds()[1][1] - collision.bounds()[0][1];
      }
    }

    // Is the supplied node movable?
    function isMovable(collision) {
      return collision.character;
    }

    // Create a bounding box around a collection of nodes.
    function bBox(arr) {
      let x0, x1, y0, y1;
      x0 = d3.min(arr, function (d) {
        return d.bounds()[0][0];
      });
      x1 = d3.max(arr, function (d) {
        return d.bounds()[1][0];
      });
      y0 = d3.min(arr, function (d) {
        return d.bounds()[0][1];
      });
      y1 = d3.max(arr, function (d) {
        return d.bounds()[1][1];
      });
      return [
        [x0, y0],
        [x1, y1],
      ];
    }

    // Gets a list of all other nodes that this introduction collides with.
    function collidesWith(introduction) {
      let i, ii, collisions;
      collisions = [];
      for (i = 0, ii = collidables.length; i < ii; i++) {
        if (
          introduction !== collidables[i] &&
          collides(introduction.bounds(), collidables[i].bounds())
        ) {
          collisions.push(collidables[i]);
        }
      }
      return collisions.length ? collisions : false;
    }

    // Check for overlap between two bounding boxes.
    function collides(a, b) {
      return !(
        // Verticals.
        (
          a[1][0] <= b[0][0] ||
          b[1][0] <= a[0][0] ||
          // Horizontals.
          a[1][1] <= b[0][1] ||
          b[1][1] <= a[0][1]
        )
      );
    }
  }

  // Links
  // -----
  //
  // Create a collection of links between appearances.
  function createLinks() {
    links = [];

    characters.forEach(function (character) {
      let i;

      // Links to intro nodes.
      links.push({
        id: `${character.filename}-link-${i}`,
        character: character,
        source: character.introduction,
        target: character.appearances[0],
      });

      // Standard appearance links.
      for (i = 1; i < character.appearances.length; i++) {
        links.push({
          id: `${character.filename}-link-${i}`,
          character: character,
          source: character.appearances[i - 1],
          target: character.appearances[i],
        });
      }
    });
  }

  // Utility functions
  // =================
  //
  // Get the actual y-axis position of a character with the given (zero based) index.
  function characterPosition(index) {
    return index * pathSpace + pathSpace / 2;
  }

  // Get the actual height of a group based on a character count.
  function characterGroupHeight(count) {
    return characterPosition(count) - pathSpace / 2;
  }

  // Scene bounds
  // ------------
  //
  // This is attached to all scene objects as `scene.bound` and returns the bounds
  // for the scene node.
  function getSceneBounds() {
    return [
      [this.x, this.y],
      [this.x + this.width, this.y + this.height],
    ];
  }

  // Label bounds
  // ------------
  //
  // This is attached to all character objects as `character.bounds` and returns
  // the bounds of the character's introduction label.
  function getLabelBounds() {
    switch (labelPosition) {
      case 'left':
        return [
          [this.x - this.width, this.y - this.height / 2],
          [this.x, this.y + this.height / 2],
        ];
      case 'above':
        return [
          [this.x - this.width / 2, this.y - this.height],
          [this.x + this.width / 2, this.y],
        ];
      case 'right':
        return [
          [this.x, this.y - this.height / 2],
          [this.x + this.width, this.y + this.height / 2],
        ];
      case 'below':
        return [
          [this.x - this.width / 2, this.y],
          [this.x + this.width / 2, this.y + this.height],
        ];
    }
  }
}

export default Narrative;
