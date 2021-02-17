module.exports = function arrayToCamelCaseString(key) {
	const [firstToken, ...remainingTokens] = getPathFromTemplateId(key);
	const capitalizedTokens = remainingTokens.map((token) => {
		return utils.toCap(token);
	});
	return [firstToken, ...capitalizedTokens].join('');
};
