const METADATA_READ_ONLY = 'https://www.googleapis.com/auth/drive.metadata.readonly'; 
const FILE_MANAGE = 'https://www.googleapis.com/auth/drive';

/**
 * Ideally, FILE_MANAGE (/auth/drive) is a very powerful scope. 
 * I prefer to use another scope called `/auth/drive.file`, however, I didn't support upload/creation in the client
 * 
 */
module.exports = {
    METADATA_READ_ONLY,
    FILE_MANAGE
}