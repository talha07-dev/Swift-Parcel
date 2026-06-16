const User = require('./models/User');
const { connectDB } = require('./config/db');

const createDemoUser = async () => {
    await connectDB();
    const { sequelize } = require('./config/db');
    await sequelize.sync({ force: true });
    try {
        const user = await User.create({
            name: 'Demo User',
            email: 'user@example.com',
            password: 'password123',
            phone: '1234567890',
            address: '123 Demo St',
            role: 'customer'
        });
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            phone: '0987654321',
            address: 'Admin Headquarters',
            role: 'admin'
        });
        const deliveryBoy = await User.create({
            name: 'John Driver',
            email: 'driver@example.com',
            password: 'password123',
            phone: '5550123',
            address: 'City Center',
            role: 'delivery-boy'
        });
        console.log('Demo users created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating demo users:', error.message);
        process.exit(1);
    }
};

createDemoUser();
