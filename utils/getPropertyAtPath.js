module.exports = function getPropertyAtPath(reference, path) {
	const [currentPath, ...remainingPath] = path;

	if (reference.hasOwnProperty(currentPath) === false) {
		const message = `Reference does not contain property ${currentPath}`;
		throw new Error(message);
	}

	return remainingPath.length ? getDataFromPath(reference[currentPath], remainingPath) : reference[currentPath];
};
