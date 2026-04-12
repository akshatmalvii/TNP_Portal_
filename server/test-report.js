import reportService from "./services/reportService.js";
import Department from "./models/department.js";

async function test() {
  try {
    const dept = await Department.findOne({ where: { dept_code: "CSE" } });
    if (!dept) {
        console.error("Dept not found");
        process.exit(1);
    }
    const seasons = await reportService.getAvailableSeasons(dept.dept_id);
    console.log("Seasons:", seasons);
    if (seasons.length > 0) {
        const report = await reportService.getPlacementReport(dept.dept_id, seasons[0]);
        console.log("Report generated successfully for", seasons[0]);
        // console.log(JSON.stringify(report, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error("Report Test Error:", err);
    process.exit(1);
  }
}

test();
