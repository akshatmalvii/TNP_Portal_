import './utils/associations.js';
import Drive from './models/drive.js';
import Company from './models/company.js';
import DriveAllowedDepartment from './models/drive_allowed_department.js';
import DriveAllowedCourse from './models/drive_allowed_course.js';
import DriveEligibility from './models/drive_eligibility.js';

(async () => {
    try {
        const drives = await Drive.findAll({
            where: { drive_status: "Active", approval_status: "Approved" },
            include: [
              { model: Company, attributes: ["company_name"] },
              { model: DriveAllowedDepartment },
              { model: DriveAllowedCourse },
              { model: DriveEligibility }
            ]
        });
        if (drives.length > 0) {
            console.log(Object.keys(drives[0].get({ plain: true })));
            console.log(drives[0].get({ plain: true }).DriveAllowedDepartments);
        } else {
            console.log("No drives found");
        }
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
})();
