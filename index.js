const { getLogger } = require('./error-tracker');

// Example usage
const logger = getLogger('app');
logger.info('Application started', { tag: 'startup' });
logger.info('User logged in', { tag: 'auth' });
logger.warn('Low disk space', { tag: 'system' });

// Simulate an uncaught exception
setTimeout(() => {
  throw new Error('Simulated uncaught exception for testing');
}, 2000);
