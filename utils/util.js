const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const LEN = CHARS.length;

// A util function used to generate a random id, if the name of user is not provided, I can use it to generate one. 
// The name is used as the file name under the token folder.  
function makeid(length) {
  const result = [];
  for (let i = 0; i < length; i++) {
    result.push(CHARS.charAt(Math.floor(Math.random() * LEN)));
  }
  return result.join('');
}

module.exports = {
  makeid
}