const fs = require('fs');
const readline = require('readline');
const { METADATA_READ_ONLY, FILE_MANAGE } = require('./utils/scopes');
const FileHelper = require('./utils/FileHelper');
const Client = require('./service/Client');

const fileHelper = new FileHelper();

let client;
// TODO: create a state machine for
//     1. switch a user/client
//     2. browse folders/files
//     3. transfer ownership of current folder and subfolder
// 
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question('Enter a new user name or the one you used before: ', user => {
  rl.close();
  // You may change the scopes if you are not comfortable with FILE_MANAGE
  // FILE_MANAGE is required for the "transfer" command
  // The authorize page on the google drive also allows a user to choose the right scope(s) granted to the app
  client = new Client(user, fileHelper.credential, () => browse(rl), METADATA_READ_ONLY, FILE_MANAGE);
});

function browse(rl) {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(`You are at "${client.path}". Type "list {PATH}" to change and browse folders/files,
    or type "list-all" to list ALL files/folders, including those under all sub-folders,
    or type "transfer" to transfer files/folders under the path recursively:   `, command => {
    rl.close();
    if (command === 'list-all') {
      console.log(client.fileSystem);
    } else if (command.startsWith('list ')) {
      const path = command.substring(5);
      console.log(path);
      console.log(client.ls(path));
    } else if (command === 'transfer') {
      client.transferOwnership();
    } else {
      console.log("invalid command, try again");
    }
    browse(rl);
  });
}

/*
Example output:
Type "list-all" or "list {PATH}" to browse folders/files, or type "transfer" to transfer files/folders recursively:   list /folder
/folder
{ id: '1i79Fc9E0_faIPJB6dLT9UtKlFZdqGH3r', content: [ 'folder' ] }
Type "list-all" or "list {PATH}" to browse folders/files, or type "transfer" to transfer files/folders recursively:   list //folder/folder
//folder/folder
undefined
Type "list-all" or "list {PATH}" to browse folders/files, or type "transfer" to transfer files/folders recursively:   list /folder/folder
/folder/folder
{
  id: '1M77jOZeCoOvSkfBFjjh27C956oPcssZi',
  content: [ 'file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', 'folder2' ]
}
Type "list-all" or "list {PATH}" to browse folders/files, or type "transfer" to transfer files/folders recursively:   list /folder/folder/file1.txt
/folder/folder/file1.txt
{
  id: '1MG5ozMlYy527BQAehYxd9p7khFv0JQ70',
  name: '/folder/folder/file1.txt',
  mimeType: 'text/plain'
}
*/