var dbManager = require('../../util/db-manager');
const appUtil = require('../../util/app-util');
_seeder = {};

_seeder.execute = async function () {

    try {
        await dbManager.executeNonQuery(`ALTER TABLE meeting
        ADD meeting_type TEXT, meeting_days ARRAY;`, []);    
    } catch(error) {
        logger.info('Migration Error | Add Meeting Type Column', error);
    }

    await dbManager.executeNonQuery('INSERT INTO spike_migrations (migration_id,timestamp) VALUES (?,?)', ['2020_12_10_1_add_meeting_type_in_meeting.js', new Date().valueOf().toString()]);

}

module.exports = _seeder;