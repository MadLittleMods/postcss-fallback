import objectAssign from 'object-assign';

import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

const defaults = {
	keyword: 'fallback'
};


let getValueFallbackBranchResults = function(value, opts) {
	// Start off with one branch
	let newValueList = [''];
	// We use this to make sure we actually did something
	let hasFallbackFunction = false;

	// Assemble the new values
	let parsedValue = valueParser(value);
	parsedValue.walk((topLevelValueNode) => {
		// If a fallback-function, make new value branches
		if(topLevelValueNode.type === 'function' && topLevelValueNode.value === opts.keyword) {
			hasFallbackFunction = true;

			// Crunch all the pieces into their appropriate args
			let argList = topLevelValueNode.nodes.reduce((prevResult, argNode) => {
				if(argNode.type === 'div' && argNode.value === ',') {
					prevResult.push('');
				}
				else {
					prevResult[prevResult.length - 1] = prevResult[prevResult.length - 1] + valueParser.stringify(argNode);
				}

				return prevResult
			}, ['']);
			//console.log(argList);

			// Make a branch for each arg,
			// default to an single empty arg
			newValueList = (argList.length ? argList : ['']).reduce((prevList, arg) => {
				let branch = newValueList.map((value) => {
					return value + arg;
				});

				return prevList.concat(branch);
			}, []);
		}
		// Otherwise just keep concatting the value pieces on
		else {
			newValueList = newValueList.map((value) => {
				return value + valueParser.stringify(topLevelValueNode);
			});
		}

		// Prevent walking recursively
		return false;
	}, false);

	return {
		hasFallbackFunction,
		branches: newValueList
	};
}

export default postcss.plugin('postcss-fallback', (options) => {
	let opts = objectAssign({}, defaults, options);

	let testReForFallbackFunction = (new RegExp(`(^|.*?\\s+)${opts.keyword}.*`));

	return function (css/*, result*/) {
		css.walkDecls((decl) => {
			// Fast regex test
			// before we start parsing to see if it actually has a function
			if(testReForFallbackFunction.test(decl.value)) {
				let valueBranchResults = getValueFallbackBranchResults(decl.value, opts);

				if(valueBranchResults.hasFallbackFunction) {
					// Expand out fallbacks
					valueBranchResults.branches.forEach((newValue) => {
						decl.cloneAfter({
							value: newValue
						});
					});
					// And then remove the old declaration
					decl.remove();
				}
			}
		});
	};
});
