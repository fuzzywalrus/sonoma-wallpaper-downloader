const path = require('path'); // Make sure this line is at the very top
const fs = require('fs')
require('dotenv').config();
// console.log(`Environment Variables:`, process.env.APPLEID, `process.env.APPLEIDPASS`, process.env.APPLEIDPASS, `process.env.TEAMID`, process.env.TEAMID);

const { notarize } = require('@electron/notarize');

// taken from https://www.funtoimagine.com/blog/electron-mac-sign-and-notarize/

module.exports = async function (params) {
    if (process.platform !== 'darwin') {
    return
    }
    
        console.log('afterSign hook triggered', params)
    
        let appId = 'com.greggant.svd'
    
        let appPath = path.join(
            params.appOutDir,
            `${params.packager.appInfo.productFilename}.app`
        )
        if (!fs.existsSync(appPath)) {
            console.log('skip')
            return
        }
    
        console.log(
            `Notarizing ${appId} found at ${appPath} with Apple ID ${process.env.APPLEID}`
        )
    
        try {
            await notarize({
                appBundleId: appId,
                appPath: appPath,
                appleId: process.env.APPLEID,
                appleIdPassword: process.env.APPLEIDPASS,
                teamId: process.env.TEAMID
            })
        } catch (error) {
            console.error(error)
        }
    
        console.log(`Done notarizing ${appId}`)
    }