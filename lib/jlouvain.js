// Import jLouvian
// ---------------
// [jLouvian](https://github.com/upphiminn/jLouvain) is a open source (MIT)
// javascript implementation of the Louvian method of
// [community detection](https://www.wikiwand.com/en/Louvain_Modularity).
// Graph clustering algorithm
// --------------------------
//
// Author: Corneliu S. (github.com/upphiminn)
//
// Lightly cleaned up and documented by Simon Elvery.
//
// This is a javascript implementation of the Louvain
// community detection algorithm (http://arxiv.org/abs/0803.0476)
// Based on https://bitbucket.org/taynaud/python-louvain/overview

function jLouvain() {
	// Constants
	let __PASS_MAX = -1;
	let __MIN = 0.0000001;

	// Local vars
	let original_graph_nodes;
	let original_graph_edges;
	let original_graph = {};
	let partition_init;

	// Helpers
	function make_set(array) {
		let set = {};
		array.forEach(function (d) {
			set[d] = true;
		});
		return Object.keys(set);
	}

	function obj_values(obj) {
		let vals = [];
		for (let key in obj) {
			if (obj.hasOwnProperty(key)) {
				vals.push(obj[key]);
			}
		}
		return vals;
	}

	function get_degree_for_node(graph, node) {
		let neighbours = graph._assoc_mat[node]
			? Object.keys(graph._assoc_mat[node])
			: [];
		let weight = 0;
		neighbours.forEach(function (neighbour) {
			let value = graph._assoc_mat[node][neighbour] || 1;
			if (node === neighbour) {
				value *= 2;
			}
			weight += value;
		});
		return weight;
	}

	function get_neighbours_of_node(graph, node) {
		if (typeof graph._assoc_mat[node] === 'undefined') {
			return [];
		}

		let neighbours = Object.keys(graph._assoc_mat[node]);
		return neighbours;
	}

	function get_edge_weight(graph, node1, node2) {
		return graph._assoc_mat[node1] ? graph._assoc_mat[node1][node2] : undefined;
	}

	function get_graph_size(graph) {
		let size = 0;
		graph.edges.forEach(function (edge) {
			size += edge.weight;
		});
		return size;
	}

	function add_edge_to_graph(graph, edge) {
		update_assoc_mat(graph, edge);

		let edge_index = graph.edges
			.map(function (d) {
				return d.source + '_' + d.target;
			})
			.indexOf(edge.source + '_' + edge.target);

		if (edge_index !== -1) {
			graph.edges[edge_index].weight = edge.weight;
		} else {
			graph.edges.push(edge);
		}
	}

	function make_assoc_mat(edge_list) {
		let mat = {};
		edge_list.forEach(function (edge) {
			mat[edge.source] = mat[edge.source] || {};
			mat[edge.source][edge.target] = edge.weight;
			mat[edge.target] = mat[edge.target] || {};
			mat[edge.target][edge.source] = edge.weight;
		});

		return mat;
	}

	function update_assoc_mat(graph, edge) {
		graph._assoc_mat[edge.source] = graph._assoc_mat[edge.source] || {};
		graph._assoc_mat[edge.source][edge.target] = edge.weight;
		graph._assoc_mat[edge.target] = graph._assoc_mat[edge.target] || {};
		graph._assoc_mat[edge.target][edge.source] = edge.weight;
	}

	function clone(obj) {
		if (obj === null || typeof obj !== 'object') {
			return obj;
		}

		let temp = obj.constructor();

		for (let key in obj) {
			temp[key] = clone(obj[key]);
		}
		return temp;
	}

	//Core-Algorithm Related
	function init_status(graph, status, part) {
		status['nodes_to_com'] = {};
		status['total_weight'] = 0;
		status['internals'] = {};
		status['degrees'] = {};
		status['gdegrees'] = {};
		status['loops'] = {};
		status['total_weight'] = get_graph_size(graph);

		if (typeof part === 'undefined') {
			graph.nodes.forEach(function (node, i) {
				status.nodes_to_com[node] = i;
				let deg = get_degree_for_node(graph, node);
				if (deg < 0) {
					throw 'Bad graph type, use positive weights!';
				}
				status.degrees[i] = deg;
				status.gdegrees[node] = deg;
				status.loops[node] = get_edge_weight(graph, node, node) || 0;
				status.internals[i] = status.loops[node];
			});
		} else {
			graph.nodes.forEach(function (node) {
				let com = part[node];
				status.nodes_to_com[node] = com;
				let deg = get_degree_for_node(graph, node);
				status.degrees[com] = (status.degrees[com] || 0) + deg;
				status.gdegrees[node] = deg;
				let inc = 0.0;

				let neighbours = get_neighbours_of_node(graph, node);
				neighbours.forEach(function (neighbour) {
					let weight = graph._assoc_mat[node][neighbour];
					if (weight <= 0) {
						throw 'Bad graph type, use positive weights';
					}

					if (part[neighbour] === com) {
						if (neighbour === node) {
							inc += weight;
						} else {
							inc += weight / 2.0;
						}
					}
				});
				status.internals[com] = (status.internals[com] || 0) + inc;
			});
		}
	}

	function __modularity(status) {
		let links = status.total_weight;
		let result = 0.0;
		let communities = make_set(obj_values(status.nodes_to_com));

		communities.forEach(function (com) {
			let in_degree = status.internals[com] || 0;
			let degree = status.degrees[com] || 0;
			if (links > 0) {
				result =
					result + in_degree / links - Math.pow(degree / (2.0 * links), 2);
			}
		});
		return result;
	}

	function __neighcom(node, graph, status) {
		// compute the communities in the neighb. of the node, with the graph given by
		// node_to_com

		let weights = {};
		let neighboorhood = get_neighbours_of_node(graph, node); //make iterable;

		neighboorhood.forEach(function (neighbour) {
			if (neighbour !== node) {
				let weight = graph._assoc_mat[node][neighbour] || 1;
				let neighbourcom = status.nodes_to_com[neighbour];
				weights[neighbourcom] = (weights[neighbourcom] || 0) + weight;
			}
		});

		return weights;
	}

	function __insert(node, com, weight, status) {
		//insert node into com and modify status
		status.nodes_to_com[node] = +com;
		status.degrees[com] =
			(status.degrees[com] || 0) + (status.gdegrees[node] || 0);
		status.internals[com] =
			(status.internals[com] || 0) + weight + (status.loops[node] || 0);
	}

	function __remove(node, com, weight, status) {
		//remove node from com and modify status
		status.degrees[com] =
			(status.degrees[com] || 0) - (status.gdegrees[node] || 0);
		status.internals[com] =
			(status.internals[com] || 0) - weight - (status.loops[node] || 0);
		status.nodes_to_com[node] = -1;
	}

	function __renumber(dict) {
		let count = 0;
		let ret = clone(dict); //deep copy :)
		let new_values = {};
		let dict_keys = Object.keys(dict);
		dict_keys.forEach(function (key) {
			let value = dict[key];
			let new_value =
				typeof new_values[value] === 'undefined' ? -1 : new_values[value];
			if (new_value === -1) {
				new_values[value] = count;
				new_value = count;
				count = count + 1;
			}
			ret[key] = new_value;
		});
		return ret;
	}

	function __one_level(graph, status) {
		//Compute one level of the Communities Dendogram.
		let modif = true,
			nb_pass_done = 0,
			cur_mod = __modularity(status),
			new_mod = cur_mod;

		while (modif && nb_pass_done !== __PASS_MAX) {
			cur_mod = new_mod;
			modif = false;
			nb_pass_done += 1;

			graph.nodes.forEach(eachNode);
			new_mod = __modularity(status);
			if (new_mod - cur_mod < __MIN) {
				break;
			}
		}

		function eachNode(node) {
			let com_node = status.nodes_to_com[node];
			let degc_totw =
				(status.gdegrees[node] || 0) / (status.total_weight * 2.0);
			let neigh_communities = __neighcom(node, graph, status);
			__remove(node, com_node, neigh_communities[com_node] || 0.0, status);
			let best_com = com_node;
			let best_increase = 0;
			let neigh_communities_entries = Object.keys(neigh_communities); //make iterable;

			neigh_communities_entries.forEach(function (com) {
				let incr =
					neigh_communities[com] - (status.degrees[com] || 0.0) * degc_totw;
				if (incr > best_increase) {
					best_increase = incr;
					best_com = com;
				}
			});

			__insert(node, best_com, neigh_communities[best_com] || 0, status);

			if (best_com !== com_node) {
				modif = true;
			}
		}
	}

	function induced_graph(partition, graph) {
		let ret = { nodes: [], edges: [], _assoc_mat: {} };
		let w_prec, weight;
		//add nodes from partition values
		let partition_values = obj_values(partition);
		ret.nodes = ret.nodes.concat(make_set(partition_values)); //make set
		graph.edges.forEach(function (edge) {
			weight = edge.weight || 1;
			let com1 = partition[edge.source];
			let com2 = partition[edge.target];
			w_prec = get_edge_weight(ret, com1, com2) || 0;
			let new_weight = w_prec + weight;
			add_edge_to_graph(ret, {
				source: com1,
				target: com2,
				weight: new_weight,
			});
		});
		return ret;
	}

	function partition_at_level(dendogram, level) {
		let partition = clone(dendogram[0]);
		for (let i = 1; i < level + 1; i++) {
			Object.keys(partition).forEach(eachKey);
		}
		return partition;

		function eachKey(key) {
			let node = key;
			let com = partition[key];
			partition[node] = dendogram[i][com];
		}
	}

	function generate_dendogram(graph, part_init) {
		if (graph.edges.length === 0) {
			let part = {};
			graph.nodes.forEach(function (node) {
				part[node] = node;
			});
			return part;
		}
		let status = {};

		init_status(original_graph, status, part_init);
		let mod = __modularity(status);
		let status_list = [];
		__one_level(original_graph, status);
		let new_mod = __modularity(status);
		let partition = __renumber(status.nodes_to_com);
		status_list.push(partition);
		mod = new_mod;
		let current_graph = induced_graph(partition, original_graph);
		init_status(current_graph, status);

		while (true) {
			__one_level(current_graph, status);
			new_mod = __modularity(status);
			if (new_mod - mod < __MIN) {
				break;
			}

			partition = __renumber(status.nodes_to_com);
			status_list.push(partition);

			mod = new_mod;
			current_graph = induced_graph(partition, current_graph);
			init_status(current_graph, status);
		}

		return status_list;
	}

	let core = function () {
		let dendogram = generate_dendogram(original_graph, partition_init);
		return partition_at_level(dendogram, dendogram.length - 1);
	};

	core.nodes = function (nds) {
		if (arguments.length > 0) {
			original_graph_nodes = nds;
		}
		return core;
	};

	core.edges = function (edgs) {
		if (typeof original_graph_nodes === 'undefined') {
			throw 'Please provide the graph nodes first!';
		}

		if (arguments.length > 0) {
			original_graph_edges = edgs;
			let assoc_mat = make_assoc_mat(edgs);
			original_graph = {
				nodes: original_graph_nodes,
				edges: original_graph_edges,
				_assoc_mat: assoc_mat,
			};
		}
		return core;
	};

	core.partition_init = function (prttn) {
		if (arguments.length > 0) {
			partition_init = prttn;
		}
		return core;
	};

	return core;
}

export { jLouvain };
