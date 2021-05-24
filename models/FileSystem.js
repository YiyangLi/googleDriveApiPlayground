/**
 * Define a file system that supports mkdir and addFile
 * Since I don't store the file content here, it's named as addFile instead of touch
 * 
 * Essentially, it's a key-value pair, where the key is the path of a folder or a file, 
 * and the value is an object, the value.id is the fileId, from [File](https://developers.google.com/drive/api/v3/reference/files)
 * 
 * If the value refers to a folder, value.content is a list of string, which refers to a list of sub-folders and files under the folder
 * If the value refers to a file, value has mimeType, shared, name
 * 
 * type FileSystem.map = { [fileId: string]: [value: folder || file] };
 * type file = {
 *  [id: string]: [fileId: string],
 *  [mimeType: string]: [type: string],
 *  [shared: string]: [isShared: boolean] // Whether the file has been shared. transferOwnership is not allowed
 * }
 * 
 * type folder = {
 *  [id: string]: [fileId: string],
 *  [content: string]: [filePaths: array]
 * }
 */
class FileSystem {

  // initialize the map, the root's fileId is nothinb but `"root"`
  constructor() {
    this.map = { '/': { id: 'root', content: [] } };
  }

  // return the value, either a folder or a file
  ls(path) {
    return this.map[path];
  };

  // create a folder, if the parent folder does not exist, create the parent folder, but with the child's id
  mkdir(path, id) {
    const tokens = this.#formatPath(path).substring(1).split('/');
    let current = '/';
    for (const token of tokens) {
      if (!token.length) {
        return null;
      }
      const next = this.#formatPath(`${current}/${token}`);
      if (!this.map[current].content.includes(token)) {
        this.map[current].content.push(token);
        this.map[next] = { id, content: [] };
      }
      current = next;
    }
  }

  // create a file, add the file to the parent folder's content, and to the map
  addFile(filePath, file) {
    filePath = this.#formatPath(filePath);
    if (this.map[filePath] === undefined) {
      const [folder, file] = this.#parse(filePath);
      this.map[folder].content.push(file);
    }
    this.map[filePath] = file;
  };

  // get all file paths under the path, including sub folders and files under the sub folders. 
  getFilePaths(path) {
    return Object.keys(this.map).filter(p => p.startsWith(path));
  }

  #formatPath(path) {
    return path.startsWith('//') ? path.substring(1) : path;
  }

  #parse(filePath) {
    const lastIndex = filePath.lastIndexOf('/');
    let folder = filePath.substring(0, lastIndex) || '/';
    let file = filePath.substring(lastIndex + 1, filePath.length);
    return [folder, file];
  }
}

module.exports = FileSystem;