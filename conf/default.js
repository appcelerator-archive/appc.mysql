module.exports = {
	logs: './logs',
	quiet: false,
	logLevel: 'debug',
	apikey: '7OconkD1qE64SKasb3jt2MIgJZih5Th1',
	admin: {
		enabled: true,
		prefix: '/apibuilder'
	},
	session: {
		encryptionAlgorithm: 'aes256',
		encryptionKey: 'VDqTueB3Ab4vebhpAPlBn7ZmdsUu/lfVzJ3te1Vt5sU=',
		signatureAlgorithm: 'sha512-drop256',
		signatureKey: 'j0F7YqoUJRxLQUdOeEQ7cGhBAh/J+9rwdn/6jNfEcphIisRpMIJS8blKyOAmX42uX8Xo0f2jaURpgTUhY+vUBw==',
		secret: 'SCsOXXkFwNcJv8aWHNsTRCF4T/NmXJjy', // should be a large unguessable string
		duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
		activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
	},
	database: 'test',
	username: 'root',
	password: '',
	host: 'localhost'
};
