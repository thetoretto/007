require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const existingAdmin = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
    
    if (!existingAdmin) {
      const admin = new User({
        email: process.env.SUPER_ADMIN_EMAIL,
        password: await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10),
        isSuperAdmin: true
      });

      await admin.save();
      console.log('Super admin created successfully');
    } else {
      console.log('Super admin already exists');
    }
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
};

seedSuperAdmin();