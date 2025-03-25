// A simple function to generate unique IDs
// Compatible with nanoid but doesn't require the dependency
const nanoid = (size = 21) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < size; i++) {
    id += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return id;
};

module.exports = { nanoid }; 