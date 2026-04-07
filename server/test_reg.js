import './utils/associations.js';
import authService from './services/authService.js';

(async () => {
    try {
        const res = await authService.register({
            email: 'test_real_reg2@gmail.com',
            password: 'password123',
            confirmPassword: 'password123'
        });
        console.log("Success:", res);
    } catch(e) {
        console.error("Error creating student:", e);
    }
    process.exit(0);
})();
