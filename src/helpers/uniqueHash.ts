const crypto = require('crypto')

// Function to create a unique hash from an object
export function createUniqueHash(obj) {
  const hash = crypto.createHash('sha256') // You can use 'sha1', 'sha256', or another hash algorithm
  const objString = JSON.stringify(obj) // Convert the object to a string
  hash.update(objString) // Update the hash with the object's content
  return hash.digest('hex') // Get the hexadecimal representation of the hash
}
