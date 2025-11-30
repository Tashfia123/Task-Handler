// Valid status and priority values for tasks
// These must match the database CHECK constraints

const VALID_STATUSES = ['To Do', 'In Progress', 'Completed'];
const VALID_PRIORITIES = ['High', 'Medium', 'Low'];

module.exports = {
  VALID_STATUSES,
  VALID_PRIORITIES
};

