import './config/db.js';
import Student from './models/student.js';

(async () => {
    try {
        const student = await Student.create({
            user_id: 17,
            email: 'student11@gmail.com'
        });
        console.log("Success:", student.toJSON());
    } catch(e) {
        console.error("Error creating student:", e);
    }
    process.exit(0);
})();
