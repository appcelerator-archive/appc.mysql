/**
 * Warning: This method is being deprecated and should not be used in your implementation.
 * Finds a model instance using the primary key.
 */
exports.findOne = function () {
	var log = this.logger ? this.logger.warn.bind(this.logger) : console.warn;
	log('The findOne method of a model is deprecated and will be removed in an upcoming major release. Please use findById instead.');

	// Fallback to findByID
	this.findByID.apply(this, arguments);
};
