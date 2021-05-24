const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { google } = require('googleapis');
const { METADATA_READ_ONLY, FILE_MANAGE } = require('../utils/scopes');
const { makeid } = require('../utils/util');
const FileSystem = require('../models/FileSystem');

// the mimeType of a google drive folder
const FOLDER = 'vnd.google-apps.folder';

class Client {
  #tokenPath
  #token
  #drive
  #pathState = '/'
  user
  oAuth2Client
  scopes

  /**
  * Create an OAuth2 client with the given credentials, and then execute the given callback function.
  * 
  * @param {string?} user the id or name of the user, used as the file name containing token, if missing, it will be randomly generated
  * @param {Credential} credentials The authorization client credentials.
  * @param {function} callback The callback after the preflightCheck is done
  * @param {String[]} scopes [OAuth scopes](https://developers.google.com/identity/protocols/oauth2/scopes#drive)
  */
  constructor(user, credential, callback, ...scopes) {
    if (!user) {
      user = makeid(5);
    }
    this.user = user;
    this.fileSystem = new FileSystem();
    console.log(`initializing client for ${user}`);
    this.oAuth2Client = new google.auth.OAuth2(credential);
    if (!scopes || !scopes.length) {
      scopes = [METADATA_READ_ONLY, FILE_MANAGE];
    }
    this.#tokenPath = path.join(`./tokens/${user}.json`);
    if (!fs.existsSync(this.#tokenPath)) {
      this.#getAccessToken(scopes, callback);
    } else {
      const tokenJson = JSON.parse(fs.readFileSync(this.#tokenPath));
      this.oAuth2Client.setCredentials(tokenJson);
      this.#token = tokenJson.access_token;
      this.preflightCheck(callback);
    }

    const pkg = fs.readFileSync(path.join('./package.json'));
    const env = JSON.parse(pkg).env;
    this.newOwner = env.newOwner;
  }

  /**
  * preflightCheck will confirm the scopes of the token and store the scopes. 
  * The scopes affects the capability of the client. 
  * FILE_MANAGE is required to transfer ownership
  * However, if the client only need to browse the file system, akk the folders/files tree, only METADATA_READ_ONLY is required
  * 
  * @param {function} callback The callback after the preflightCheck is done
  */
  preflightCheck(callback) {
    this.oAuth2Client.getTokenInfo(this.#token)
      .then(tokenInfo => {
        this.scopes = tokenInfo.scopes;
        console.log(`Token is still valid for ${this.user}, scopes: ${this.scopes}`);
        this.#drive = google.drive({ version: 'v3', auth: this.oAuth2Client });
        this.#listFilesRecursively();
        callback();
      })
      .catch(err => { 
        console.log(err);
        console.log('Please clean up ./tokens folder and try again.');
      });
  }

  /**
  * When ls is run, the state of path is changed, the read-only method returns the current path
  * The #pathState will be used in transferOwnership. 
  * The scopes affects the capability of the client. 
  * FILE_MANAGE is required to transfer ownership
  * However, if the client only need to browse the file system, akk the folders/files tree, only METADATA_READ_ONLY is required
  * 
  * @param {function} callback The callback after the preflightCheck is done
  */
  get path() {
    return this.#pathState;
  }

  /**
  * List direct children folders and files under the path
  * 
  * @param {string} path The path of the file system, for example, /usr or /usr/foo/bar
  */
  ls(path) {
    this.#pathState = path;
    return this.fileSystem.ls(path);
  }

  /**
  * List the whole file system, check the FileSystem.map for more details
  * 
  */
  lsAll() {
    return this.fileSystem.map;
  }

  /**
  * All files and folders under the #pathState will be transfered, including subfolders.
  * However, if a folder or a file has been shared, the api does not allow to transfer ownership.
  * 
  * Todo: Explore the clone feature to transfer a shared file/folder
  */
  transferOwnership() {
    if (!this.scopes.includes(FILE_MANAGE)) {
      console.log('Unable to transfer ownership due to the missing scopes granted to the web app');
      console.log(`It is required to have the ${FILE_MANAGE} permission`);
    }
    const permission = {
      'type': 'user',
      'role': 'owner',
      'emailAddress': this.newOwner,
    };
    console.log(`The new owner is: ${this.newOwner}`);
    for (const filePath of this.fileSystem.getFilePaths(this.#pathState)) {
      const file = this.fileSystem.ls(filePath)
      const fileId = file.id;
      const transferOwnership = true;
      if (!fileId || fileId === 'root') {
        console.log('invalid file id');
      } else if (file.shared === true) {
        console.log('unable to change ownership on a shared file, download, copy and upload are not supported yet. ');
      } else {
        this.#drive.permissions.create({
          fileId,
          transferOwnership,
          requestBody: permission,
        }, function (err, res) {
          if (err) {
            console.error(err);
          } else {
            console.log('Permission ID: ', res.id);
          }
        });      
      }
    }
  }

  /**
   * Authorize the oAuth2Client by the given scopes, and then execute the given callback function.
   * 
   * @param {String[]} scopes [OAuth scopes](https://developers.google.com/identity/protocols/oauth2/scopes#drive)
   * @param {function} callback The callback after the preflightCheck is done
   */
  #getAccessToken(scopes, callback) {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', code => {
      rl.close();
      this.oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        this.#token = token.access_token;
        this.oAuth2Client.setCredentials(token);
        fs.writeFileSync(this.#tokenPath, JSON.stringify(token));
        this.preflightCheck(callback);
      });
    });
  }

  /**
   * The wrapper for the recursive method retrievePageOfChildren, 
   * the wrap will kick off the initial call from the `"root"`.
   */
  #listFilesRecursively() {
    const initialOptions = {
      pageSize: 1000,
      q: `'root' in parents`,
      fields: 'nextPageToken, files(id, name, mimeType, shared)',
    };
    this.#retrievePageOfChildren(initialOptions, [], '');
  }

  /**
   * Recursively call itself until it reaches the folder without subfolders
   * At the same time, set the fileSystem using addFile(path, file), and mkdir(path, folderId)
   * 
   * @param {object} options options used to call [files.list](https://developers.google.com/drive/api/v3/reference/files/list)
   * @param {String[]} folders the names of all direct sub-folder
   * @param {String} currentPath the path of current folder, the root is an empty string `''`
   */
  #retrievePageOfChildren(options, folders, currentPath) {
    this.#drive.files.list(options, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const nextPageToken = res.data.nextPageToken;
      folders.push(...res.data.files.filter(f => f.mimeType.includes(FOLDER)));
      res.data.files.filter(f => !f.mimeType.includes(FOLDER))
                    .forEach(f => { 
                      f.name = `${currentPath}/${f.name}`;
                      this.fileSystem.addFile(f.name, f);
                    });
      if (nextPageToken) {
        options.nextPageToken = nextPageToken;
        this.#retrievePageOfChildren(nextPageToken, folders, currentPath);
      } else {
        if (folders.length) {
          for (const subFolder of folders) {
            const newPath = `${currentPath}/${subFolder.name}`;
            this.fileSystem.mkdir(newPath, subFolder.id);
            options.q = `'${subFolder.id}' in parents`;
            this.#retrievePageOfChildren(options, [], newPath);
          }
        } else {
          return;
        }
      }
    });
  }
}

module.exports = Client;