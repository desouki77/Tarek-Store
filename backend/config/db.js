const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
        });
        console.log(`MongoDB Connected (db: ${mongoose.connection.name})`);
        try {
            const cols = await mongoose.connection.db.listCollections().toArray();
            const names = cols.map(c => c.name).sort();
            console.log(`MongoDB collections: ${names.join(', ') || '(none)'}`);

            const branchesCount = await mongoose.connection.db.collection('branches').countDocuments();
            const productsCount = await mongoose.connection.db.collection('products').countDocuments();
            console.log(`MongoDB counts: branches=${branchesCount}, products=${productsCount}`);
        } catch (e) {
            // Best-effort logging only
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);  // Stop the app if the connection fails
    }
};

module.exports = connectDB;
