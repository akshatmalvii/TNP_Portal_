import driveService from './services/driveService.js';
import './utils/associations.js';

(async () => {
    try {
        // user_id = 22 for student21@gmail.com
        const drives = await driveService.listOpenDrivesForStudent(22);
        console.log("Returned drives from standard method:");
        console.log(JSON.stringify(drives, null, 2));
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
})();
