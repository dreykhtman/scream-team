const { db, Package, Site } = require('../');

async function seeder() {
    await db.sync({ force: true });
    let socialSites = await Site.bulkCreate([
        {
            url: 'http://www.instagram.com',
            goalHrs: 0,
            goalMins: 15,
            type: 'RED'
        },
        {
            url: 'http://www.facebook.com',
            goalHrs: 0,
            goalMins: 15,
            type: 'RED'
        },
        {
            url: 'http://www.twitter.com',
            goalHrs: 0,
            goalMins: 15,
            type: 'RED'
        },
        {
            url: 'http://www.reddit.com',
            goalHrs: 0,
            goalMins: 15,
            type: 'RED'
        }
    ], { returning: true })
    let socialPackage = await Package.create({
        name: 'Social Media Addiction'
    })

    for (let i = 0; i < socialSites.length; i++) {
        await socialPackage.addSite(socialSites[i])
    }

    await db.close();
}

seeder()
    .then(() => {
        console.log('seeding complete!');
    })
