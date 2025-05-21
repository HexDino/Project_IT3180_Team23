const mongoose = require('mongoose')
const dotenv = require('dotenv')
const User = require('../models/userModel')

dotenv.config()

// Connect to database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bluemoon_apartment')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

const createTestUsers = async () => {
  try {
    // Clear existing users except admin
    await User.deleteMany({ username: { $ne: 'admin' } })
    
    const users = [
      {
        username: 'admin2',
        password: 'admin123',
        role: 'admin',
        fullName: 'Admin User 2',
        phone: '0912345678'
      },
      {
        username: 'manager1',
        password: 'manager123',
        role: 'manager',
        fullName: 'Hoang Van E',
        phone: '0898765432'
      },
      {
        username: 'staff1',
        password: 'staff123',
        role: 'staff',
        fullName: 'Pham Thi D',
        phone: '0912345678'
      },
      {
        username: 'staff2',
        password: 'staff123',
        role: 'staff',
        fullName: 'Nguyen Van F',
        phone: '0987654123'
      },
      {
        username: 'accountant1',
        password: 'account123',
        role: 'accountant',
        fullName: 'Tran Van G',
        phone: '0978563412'
      }
    ]

    // Create users
    for (const user of users) {
      const newUser = new User(user)
      await newUser.save()
      console.log(`Created user: ${user.username} with role: ${user.role}`)
    }

    console.log('Test users created successfully')
    process.exit()
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

createTestUsers() 