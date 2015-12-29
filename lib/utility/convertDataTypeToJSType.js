/**
 * Converts SQL data types to their appropriate JavaScript type.
 * @param dataType
 * @returns {*}
 */
exports.convertDataTypeToJSType = function convertDataTypeToJSType(dataType) {
	switch (dataType) {
		case 'tinyint':
		case 'smallint':
		case 'mediumint':
		case 'bigint':
		case 'int':
		case 'integer':
		case 'float':
		case 'bit':
		case 'double':
		case 'binary':
		case 'year':
			return Number;
		case 'date':
		case 'datetime':
		case 'time':
			return Date;
		default:
			return String;
	}
};
