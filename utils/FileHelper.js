const fs = require('fs');
const path = require('path');
const Credential = require('./Credential');

class FileHelper {
  #secret
  constructor() {
    this.tokenPath = path.join('./tokens');
    this.#ensureDirectoryExistence();
  }

  // read credentials.json, which includes client_id and client_secret. It's read-only
  get credential() {
    if (!this.#secret) {
      const content = fs.readFileSync(path.join('./credentials.json'));
      this.#secret = new Credential(JSON.parse(content).web);
    }
    return this.#secret;
  }

  // create the token folder used to store token for each user, user is the file name of the json under the folder
  #ensureDirectoryExistence() {
    if (fs.existsSync(this.tokenPath)) {
      return true;
    }
    fs.mkdirSync(this.tokenPath);
  }
}

module.exports = FileHelper;