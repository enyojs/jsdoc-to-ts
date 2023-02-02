/**
 * Parser creation utilities
 *
 * @module parsers
 */
const {defaultTypeFilter} = require('./filters');
const {defaultTypeClassifier} = require('./classifiers');
const {getDefaultRenderers} = require('./renderers');

/**
 * Makes a parser that iterates over an array of supplied objects.
 *
 * @param {Object} config Configuration object
 * @param {Function} param.typeFilter A filter function
 * @param {Function} param.typeClassifier A type classification function
 * @param {Object} param.typeRenderers An object whose keys are classified types and whose
 *	values are functions for processing those types
 */
async function makeParser (
		{
			typeFilter = defaultTypeFilter,
			typeClassifier = defaultTypeClassifier,
			typeRenderers = getDefaultRenderers()
		} = {}
) {
	return async function parser ({section, root, log, typedefs = [], ...rest}) {
		if (!Array.isArray(section)) return [];

		return await Promise.all(section.filter(typeFilter).map(async item => {
			const type = await typeClassifier({section: item, parent: section, root, ...rest});
			if (!type || !typeRenderers[type]) {
				log.info(`Skipping unrecognized item ${item.name}`);
				return;
			}
			return await typeRenderers[type]({
				...rest,
				parent: section,
				root,
				renderer: async (args) => {
					return await parser({
						section,
						typedefs,
						...rest,
						// Indicates descendants should export defs vs only declare
						export: false,
						// Indicates descendants are instance members which can affect format
						instance: false,
						...args,
						log,
						root
					});
				},
				section: item,
				typedefs
			});
		}));
	};
}
exports.makeParser = makeParser;
