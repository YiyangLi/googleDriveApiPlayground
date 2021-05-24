/**
 * Credential includes clientId, clientSecret and redirectUri, 
 *  which are used to generate google.auth.OAuth2
 * 
 * {
 *   [clientSecret: string]: [clientSecret: string],
 *   [clientId: string]:     [clinetId: string],
 *   [redirectUri: string]:  [uri: string],
 * }
 */
class Credential {
  constructor(json) {
    const { client_secret, client_id, redirect_uris } = json;
    this.clientSecret = client_secret;
    this.clientId = client_id;
    this.redirectUri = redirect_uris[0];
  }
}

module.exports = Credential;