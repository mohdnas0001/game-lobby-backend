// src/config/db.js
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env');
}
module.exports = {
  url: process.env.MONGODB_URI
};