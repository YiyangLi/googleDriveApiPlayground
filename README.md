# Google Drive Api Playground
Learn google drive api and oAuth via a node js app

# How to start
- Run `yarn install` or `npm install`
- Create a [Google Cloud Platform](https://developers.google.com/workspace/guides/create-project) project, enable the [Drive Api](https://console.cloud.google.com/marketplace/browse?q=drive)
- Create an [OAuth credentials](https://developers.google.com/workspace/guides/create-credentials)
- After you have the client-id and client-secret, copy them to [credentials.json](https://github.com/YiyangLi/googleDriveApiPlayground/blob/main/credentials.json), please mask `client-id` and `client-secret` before pushing your codes to git. 
- If it's for internal testing,  I don't recommend adding a project logo or a custom scope, it takes Google a few days to review your project. 
- You are not alone if you are lost, [the YouTube video](https://www.youtube.com/watch?v=1y0-IfRW114&t=261s) and [the sample](https://developers.google.com/drive/api/v3/quickstart/nodejs) onboard me. 
- Replace env.newOwner under the [package.json](https://github.com/YiyangLi/googleDriveApiPlayground/blob/main/package.json), if you want to test the ownership transfer feature. 
- Run `yarn start` to start the app.

# Features
- Display the folder structure.
- Given a file or folder name, transfer ownership of the file or folder (including all nestedfiles & folders) to ${pkg.env.newOwner} account while maintaining as much of the original folder structure. However, if a folder or a file has been shared, it's not allowed to be transferred. 
- Provide navigation capabilities to explore the folder structure.

# Todo
- Fix a bug, should store folder.shared state in the FileSystem.
- Convert js to typescript.
- Add lint for typescript.
- Add clone feature that navigates to a folder and upload files to that folder.
- Create a better state machine to take care of the command line interaction, which paves the roads for UI.
- Use [chalk](https://www.npmjs.com/package/chalk) to improve the command line.
- Explore the [Google Drive UI](https://developers.google.com/drive/api/v3/about-apps).
- Learn granular scopes, if any, on a single file.