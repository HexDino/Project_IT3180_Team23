const mongoose = require('mongoose')
const dotenv = require('dotenv')
const User = require('../models/userModel')
const Household = require('../models/householdModel')
const Resident = require('../models/residentModel')
const Fee = require('../models/feeModel')
const Payment = require('../models/paymentModel')

dotenv.config()

// Connect to database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bluemoon_apartment')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

const createTestData = async () => {
  try {
    // Clear existing data
    await Household.deleteMany({})
    await Resident.deleteMany({})
    await Fee.deleteMany({})
    await Payment.deleteMany({})

    console.log('Existing data cleared')

    // Create households
    const households = [
      {
        apartmentNumber: 'A101',
        address: 'Tòa nhà A, tầng 1, căn 01',
        active: true
      },
      {
        apartmentNumber: 'B202',
        address: 'Tòa nhà B, tầng 2, căn 02',
        active: true
      },
      {
        apartmentNumber: 'C303',
        address: 'Tòa nhà C, tầng 3, căn 03',
        active: true
      }
    ]

    const createdHouseholds = []
    for (const household of households) {
      const newHousehold = new Household(household)
      const savedHousehold = await newHousehold.save()
      createdHouseholds.push(savedHousehold)
      console.log(`Created household: ${household.apartmentNumber}`)
    }

    // Create residents
    const residents = [
      {
        fullName: 'Nguyen Van A',
        dateOfBirth: new Date('1980-05-15'),
        gender: 'male',
        idCard: '123456789012',
        idCardDate: new Date('2015-01-10'),
        idCardPlace: 'Hà Nội',
        phone: '0123456789',
        household: createdHouseholds[0]._id,
        active: true
      },
      {
        fullName: 'Nguyen Thi X',
        dateOfBirth: new Date('1985-08-20'),
        gender: 'female',
        idCard: '123456789013',
        idCardDate: new Date('2015-01-15'),
        idCardPlace: 'Hà Nội',
        phone: '0123456780',
        household: createdHouseholds[0]._id,
        active: true
      },
      {
        fullName: 'Tran Thi B',
        dateOfBirth: new Date('1975-12-10'),
        gender: 'female',
        idCard: '123456789014',
        idCardDate: new Date('2016-05-20'),
        idCardPlace: 'Hà Nội',
        phone: '0987654321',
        household: createdHouseholds[1]._id,
        active: true
      },
      {
        fullName: 'Le Van C',
        dateOfBirth: new Date('1990-03-25'),
        gender: 'male',
        idCard: '123456789015',
        idCardDate: new Date('2017-07-15'),
        idCardPlace: 'Hà Nội',
        phone: '0369852147',
        household: createdHouseholds[2]._id,
        active: true
      }
    ]

    for (const resident of residents) {
      const newResident = new Resident(resident)
      await newResident.save()
      console.log(`Created resident: ${resident.fullName}`)
    }

    // Create fees
    const fees = [
      {
        feeCode: 'PHI001',
        name: 'Phí quản lý hàng tháng',
        amount: 500000,
        feeType: 'mandatory',
        description: 'Phí quản lý hàng tháng cho mỗi căn hộ',
        startDate: new Date('2023-01-01'),
        active: true
      },
      {
        feeCode: 'PHI002',
        name: 'Phí gửi xe ô tô',
        amount: 1200000,
        feeType: 'parking',
        description: 'Phí gửi xe ô tô hàng tháng',
        startDate: new Date('2023-01-01'),
        active: true
      },
      {
        feeCode: 'PHI003',
        name: 'Phí gửi xe máy',
        amount: 100000,
        feeType: 'parking',
        description: 'Phí gửi xe máy hàng tháng',
        startDate: new Date('2023-01-01'),
        active: true
      },
      {
        feeCode: 'PHI004',
        name: 'Phí sửa chữa công trình chung',
        amount: 200000,
        feeType: 'contribution',
        description: 'Phí đóng góp cho việc sửa chữa các công trình chung',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-12-31'),
        active: true
      }
    ]

    const createdFees = []
    for (const fee of fees) {
      const newFee = new Fee(fee)
      const savedFee = await newFee.save()
      createdFees.push(savedFee)
      console.log(`Created fee: ${fee.name}`)
    }

    // Create payments
    const payments = [
      {
        household: createdHouseholds[0]._id,
        fee: createdFees[0]._id,
        amount: 500000,
        paymentDate: new Date('2023-05-10'),
        payerName: 'Nguyen Van A',
        receiptNumber: 'PM230501001',
        note: 'Thanh toán phí quản lý tháng 5/2023'
      },
      {
        household: createdHouseholds[0]._id,
        fee: createdFees[2]._id,
        amount: 100000,
        paymentDate: new Date('2023-05-10'),
        payerName: 'Nguyen Van A',
        receiptNumber: 'PM230502001',
        note: 'Thanh toán phí gửi xe máy tháng 5/2023'
      },
      {
        household: createdHouseholds[1]._id,
        fee: createdFees[0]._id,
        amount: 500000,
        paymentDate: new Date('2023-05-15'),
        payerName: 'Tran Thi B',
        receiptNumber: 'PM230503001',
        note: 'Thanh toán phí quản lý tháng 5/2023'
      },
      {
        household: createdHouseholds[2]._id,
        fee: createdFees[0]._id,
        amount: 500000,
        paymentDate: new Date('2023-05-20'),
        payerName: 'Le Van C',
        receiptNumber: 'PM230504001',
        note: 'Thanh toán phí quản lý tháng 5/2023'
      },
      {
        household: createdHouseholds[2]._id,
        fee: createdFees[1]._id,
        amount: 1200000,
        paymentDate: new Date('2023-05-20'),
        payerName: 'Le Van C',
        receiptNumber: 'PM230505001',
        note: 'Thanh toán phí gửi xe ô tô tháng 5/2023'
      }
    ]

    for (const payment of payments) {
      const newPayment = new Payment(payment)
      await newPayment.save()
      console.log(`Created payment: ${payment.receiptNumber}`)
    }

    console.log('Test data created successfully')
    process.exit()
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

createTestData() 