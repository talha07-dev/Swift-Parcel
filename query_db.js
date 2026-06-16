const { connectDB, sequelize } = require('./config/db');
const User = require('./models/User');
const Parcel = require('./models/Parcel');

async function queryDB() {
    await connectDB();
    try {
        console.log('--- USERS ---');
        const users = await User.findAll();
        users.forEach(u => {
            console.log(`ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
        });

        console.log('\n--- PARCELS ---');
        const parcels = await Parcel.findAll({
            include: [
                { model: User, as: 'sender', attributes: ['name'] },
                { model: User, as: 'assignee', attributes: ['name'] }
            ]
        });
        parcels.forEach(p => {
            console.log(`ID: ${p.id} | TrackID: ${p.trackingNumber} | Status: ${p.status} | Sender: ${p.sender?.name} | AssignedTo: ${p.assignedTo} | AssigneeName: ${p.assignee?.name}`);
        });
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit(0);
}

queryDB();
