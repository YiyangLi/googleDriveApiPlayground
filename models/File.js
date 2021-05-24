/**
 * The class id defined but not used. 
 * [File](https://developers.google.com/drive/api/v3/reference/files) is good enough
 */
class File {
  constructor(name, id, permissions) {
    this.name = name;
    this.id = id;
    this.permissions = permissions || [];
  }

  addPermission(permission) {
    this.permissions.push(permission);
  }

  setPermissions(permissions) {
    this.permissions = permissions;
  }
}