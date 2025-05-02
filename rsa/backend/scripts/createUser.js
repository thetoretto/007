const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const minimist = require('minimist');
const User = require('../models/User');
require('dotenv').config();

// Added phoneNumber parameter handling
// Main async wrapper added
const main = async () => {
  try {
    // Argument destructuring fixed
    const argv = require('minimist')(process.argv.slice(2), {
    string: ['firstname', 'lastname', 'email', 'phoneNumber', 'password', 'role']
  });
    const { 
      firstname: firstName, 
      lastname: lastName, 
      email, 
      password, 
      role, 
      phoneNumber 
    } = argv;

    // Validate required fields
    if (!firstName || !lastName || !password || !role || (!email && !phoneNumber)) {
      throw new Error('Missing required arguments. Usage: --firstname=... --lastname=... --password=... --role=... --email=... (or --phoneNumber=...)');
    }

    // Database connection added before operations
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check for existing user
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phoneNumber }]
    });
    
    if (existingUser) {
      throw new Error(`User with ${email ? 'email' : 'phone number'} already exists`);
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      firstName,
      lastName,
      password: hashedPassword,
      role,
      emailVerified: true
    });

    await user.save();
    console.log(`User ${email || phoneNumber} created successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

main();