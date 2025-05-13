const mongoose = require('mongoose');
const User = require('../models/Users');
require('dotenv').config({ path: '../.env' });

const Users = [
  {
    id: new mongoose.Types.ObjectId().toString(),
    Name: 'Ahmed Mostafa',
    username: 'Ahmed Mostafa',
    email: 'ahmedmostafa@gmail.com',
    password: '123456789',
    DOB: new Date('2004-03-02'),
    phone_number: '01229004551',
    language: 'English',
    Address: {
      city: 'Nasr City',
      street: '123 Main St',
      addressType: 'Home',
      state: 'Cairo',
      country: 'Egypt',
      postalCode: '11511'
    },
    Payment: {
      cardNumber: '4111111111111111',
      cardHolder: 'Ahmed Mostafa',
      expiryDate: '12/25',
      cvv: '123',
      paymentType: 'Credit Card'
    },
    role: 'admin'
  },
  {
    id: new mongoose.Types.ObjectId().toString(),
    Name: 'Fouad Khaled',
    username: 'Fouad Khaled',
    email: 'fouadkhaled@gmail.com',
    password: '123456789',
    DOB: new Date('2006-10-22'),
    phone_number: '1234567890',
    language: 'English',
    Address: {
      city: 'Nasr City',
      street: '456 Nile Ave',
      addressType: 'Work',
      state: 'Cairo',
      country: 'Egypt',
      postalCode: '11511'
    },
    Payment: {
      cardNumber: '5500000000000004',
      cardHolder: 'Fouad Khaled',
      expiryDate: '11/24',
      cvv: '456',
      paymentType: 'Debit Card'
    },
    role: 'user'
  },
  {
    id: new mongoose.Types.ObjectId().toString(),
    Name: 'Mohamed Wael',
    username: 'Mohamed Wael',
    email: 'mohamedwael@gmail.com',
    password: '123456789',
    DOB: new Date('2005-05-15'),
    phone_number: '01234567890',
    language: 'English',
    Address: {
      city: '10th of Ramadan',
      street: '789 King Rd',
      addressType: 'Other',
      state: 'Cairo',
      country: 'Egypt',
      postalCode: '11511'
    },
    Payment: {
      cardNumber: '340000000000009',
      cardHolder: 'Mohamed Wael',
      expiryDate: '01/27',
      cvv: '789',
      paymentType: 'Credit Card'
    },
    role: 'user'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('Existing users deleted');

    // Insert new users
    await User.insertMany(Users);
    console.log('Users seeded successfully');

    // Close the connection before exiting
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    // Try to close the connection even if there's an error
    try {
      await mongoose.connection.close();
    } catch (closeErr) {
      console.error('Error closing MongoDB connection:', closeErr);
    }
    process.exit(1);
  }
}

seedDatabase();