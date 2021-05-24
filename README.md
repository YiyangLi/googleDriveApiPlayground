# googleDriveApiPlayground
Learn google drive api and oAuth via a node js app

# How to start
- run `yarn install` or `npm install`
- create an [Google Cloud Platform](https://developers.google.com/workspace/guides/create-project) project, enable a [Drive Api](https://console.cloud.google.com/marketplace/browse?q=drive)
- Create an [OAuth credentials](https://developers.google.com/workspace/guides/create-credentials)
- After you have the client-id and client-secret, copy them to credentials.json, please do not check-in those confidential info to git. 
- If it's for internal testing/learning,  I don't recommend to upload a project logo or add a custom scope, it takes a few days for reviewing. 
- You are not alone if you are lost, [this YouTube video](https://www.youtube.com/watch?v=1y0-IfRW114&t=261s) and [the sample](https://developers.google.com/drive/api/v3/quickstart/nodejs) onboard me. 
- Replace env.newOwner under the [package.json](https://github.com/YiyangLi/googleDriveApiPlayground/blob/main/package.json), if you want to play with ownership transfer. 
- run `yarn start`

# Features
- Display the folder structure
- Given a file or folder name, transfer ownership of the file or folder (including all nestedfiles & folders) to ${pkg.env.newOwner} account while maintaining as much of the original folder structure. However, if a folder or a file has been shared, it's not allowed to be transferred. 
- Provide navigation capabilities to explore the folder structure

# Todo
- fix a bug, should store folder.shared state in the FileSystem
- convert js to typescript
- add lint for typescript
- add clone feature that navigates to a folder and upload files to that folder
- create a better state machine to take care of the command line interaction, which paves the roads for UI
- use [chalk](https://www.npmjs.com/package/chalk) to improve the command line. 
- explore the [Google Drive UI](https://developers.google.com/drive/api/v3/about-apps)
- learn granular scope on a single file