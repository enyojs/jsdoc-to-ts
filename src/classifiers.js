/**
 * Type classification functions
 *
 * @module classifiers
 */

const {hasHOCTag} = require('./utils');

function defaultTypeClassifier ({section}) {
	const kind = section.kind;

	// Check for HOC
	if (kind === 'constant' && hasHOCTag(section)) {
		return 'hoc';
	}

	return kind;
}
exports.defaultTypeClassifier = defaultTypeClassifier;