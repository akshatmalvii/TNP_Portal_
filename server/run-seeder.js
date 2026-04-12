import seedMockData from "./utils/seedMockData.js";
seedMockData().then(() => {
    console.log("Mock data seeder completed.");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
