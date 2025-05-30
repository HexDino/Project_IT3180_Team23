const mongoose = require('mongoose');
const Household = require('../models/householdModel');
const Resident = require('../models/residentModel');
const Payment = require('../models/paymentModel');
const Fee = require('../models/feeModel');
const User = require('../models/userModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bluemoon_apartment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createMassiveTestData = async () => {
  try {
    console.log('🚀 Bắt đầu tạo dữ liệu test khổng lồ...');

    // Tạo 50 hộ gia đình mới
    console.log('📋 Tạo hộ gia đình...');
    const householdsToCreate = [];
    
    // Tạo 50 hộ gia đình từ tầng 1-10, mỗi tầng 5 căn hộ
    for (let floor = 1; floor <= 10; floor++) {
      for (let unit = 1; unit <= 5; unit++) {
        const apartmentNumber = `${String.fromCharCode(64 + floor)}${unit.toString().padStart(2, '0')}`;
        
        householdsToCreate.push({
          apartmentNumber: apartmentNumber,
          address: `Căn hộ ${apartmentNumber}, Chung cư BlueMoon, Quận ${Math.floor(Math.random() * 12) + 1}, TP.HCM`,
          note: `Hộ gia đình ${apartmentNumber} - Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`,
          active: true
        });
      }
    }

    // Xóa hộ gia đình cũ (trừ 3 hộ đầu tiên)
    await Household.deleteMany({ 
      apartmentNumber: { $not: { $in: ['A101', 'B202', 'C303'] } } 
    });

    const households = await Household.insertMany(householdsToCreate);
    console.log(`✅ Đã tạo ${households.length} hộ gia đình mới`);

    // Lấy tất cả hộ gia đình (bao gồm cũ và mới)
    const allHouseholds = await Household.find({ active: true });
    console.log(`📊 Tổng số hộ gia đình: ${allHouseholds.length}`);

    // Tạo cư dân cho mỗi hộ gia đình
    console.log('👥 Tạo cư dân...');
    const residentsToCreate = [];
    
    for (const household of allHouseholds) {
      // Mỗi hộ gia đình có 2-5 cư dân
      const numResidents = Math.floor(Math.random() * 4) + 2;
      const relationships = ['Chủ hộ', 'Vợ/Chồng', 'Con', 'Con', 'Cha/Mẹ'];
      
      for (let i = 0; i < numResidents; i++) {
        const isMale = Math.random() > 0.5;
        const age = Math.floor(Math.random() * 60) + 20;
        const names = isMale 
          ? ['Nguyễn Văn', 'Trần Văn', 'Lê Văn', 'Phạm Văn', 'Hoàng Văn', 'Huỳnh Văn', 'Phan Văn', 'Vũ Văn']
          : ['Nguyễn Thị', 'Trần Thị', 'Lê Thị', 'Phạm Thị', 'Hoàng Thị', 'Huỳnh Thị', 'Phan Thị', 'Vũ Thị'];
        const lastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Hải', 'Khoa', 'Long', 'Nam', 'Quang', 'Tuấn', 'Việt', 'Xuân'];
        
        const fullName = `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        
        residentsToCreate.push({
          household: household._id,
          fullName: fullName,
          dateOfBirth: new Date(new Date().getFullYear() - age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: isMale ? 'male' : 'female',
          nationalId: `${Math.floor(Math.random() * 900000000) + 100000000}${Math.floor(Math.random() * 100)}`,
          phone: `09${Math.floor(Math.random() * 90000000) + 10000000}`,
          email: `${fullName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '')}@email.com`,
          relationshipToOwner: relationships[i] || 'Khác',
          moveInDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          active: true
        });
      }
    }

    // Xóa cư dân cũ (trừ những cư dân của 3 hộ đầu tiên)
    const oldHouseholdIds = (await Household.find({ 
      apartmentNumber: { $in: ['A101', 'B202', 'C303'] } 
    })).map(h => h._id);
    
    await Resident.deleteMany({ 
      household: { $not: { $in: oldHouseholdIds } } 
    });

    const residents = await Resident.insertMany(residentsToCreate);
    console.log(`✅ Đã tạo ${residents.length} cư dân mới`);

    // Lấy tất cả cư dân
    const allResidents = await Resident.find({ active: true });
    console.log(`📊 Tổng số cư dân: ${allResidents.length}`);

    // Tạo thanh toán cho 6 tháng gần nhất
    console.log('💰 Tạo thanh toán...');
    const fees = await Fee.find({ active: true });
    const paymentsToCreate = [];

    // Tạo thanh toán cho 6 tháng gần nhất
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const paymentMonth = new Date();
      paymentMonth.setMonth(paymentMonth.getMonth() - monthOffset);
      
      console.log(`📅 Tạo thanh toán cho tháng ${paymentMonth.getMonth() + 1}/${paymentMonth.getFullYear()}`);
      
      // 80-95% hộ gia đình thanh toán mỗi tháng
      const payingHouseholds = allHouseholds
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(allHouseholds.length * (0.8 + Math.random() * 0.15)));
      
      for (const household of payingHouseholds) {
        // Mỗi hộ thanh toán 3-7 loại phí ngẫu nhiên
        const numPayments = Math.floor(Math.random() * 5) + 3;
        const selectedFees = fees.sort(() => 0.5 - Math.random()).slice(0, numPayments);
        
        for (const fee of selectedFees) {
          // Tạo ngày thanh toán ngẫu nhiên trong tháng
          const paymentDate = new Date(
            paymentMonth.getFullYear(), 
            paymentMonth.getMonth(), 
            Math.floor(Math.random() * 28) + 1
          );

          // Tạo số tiền với biến động ±30%
          const baseAmount = fee.amount || 500000;
          const variance = 0.7 + Math.random() * 0.6; // 0.7 - 1.3
          const amount = Math.floor((baseAmount * variance) / 10000) * 10000;

          // Tạo status cho thanh toán
          const status = Math.random() < 0.9 ? 'paid' : Math.random() < 0.5 ? 'pending' : 'overdue';

          paymentsToCreate.push({
            household: household._id,
            fee: fee._id,
            amount: amount,
            paymentDate: paymentDate,
            method: ['cash', 'bank_transfer', 'card', 'other'][Math.floor(Math.random() * 4)],
            status: status,
            note: `Thanh toán ${fee.name} tháng ${paymentMonth.getMonth() + 1}/${paymentMonth.getFullYear()}`
          });
        }
      }
    }

    // Xóa thanh toán cũ
    await Payment.deleteMany({});

    // Thêm thanh toán mới theo batch để tránh lỗi
    console.log(`💾 Đang lưu ${paymentsToCreate.length} thanh toán...`);
    
    const batchSize = 100;
    const totalPayments = [];
    
    for (let i = 0; i < paymentsToCreate.length; i += batchSize) {
      const batch = paymentsToCreate.slice(i, i + batchSize);
      try {
        const batchResult = await Payment.insertMany(batch, { ordered: false });
        totalPayments.push(...batchResult);
        console.log(`✅ Đã lưu batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(paymentsToCreate.length/batchSize)}`);
      } catch (error) {
        console.log(`⚠️ Một số thanh toán trong batch ${Math.floor(i/batchSize) + 1} bị trùng lặp, bỏ qua...`);
      }
    }

    console.log(`✅ Đã tạo ${totalPayments.length} thanh toán thành công`);

    // Thống kê cuối cùng
    console.log('\n📊 THỐNG KÊ TỔNG KẾT:');
    
    const finalHouseholdCount = await Household.countDocuments({ active: true });
    const finalResidentCount = await Resident.countDocuments({ active: true });
    const finalPaymentCount = await Payment.countDocuments({ status: 'paid' });
    const finalFeeCount = await Fee.countDocuments({ active: true });
    
    console.log(`🏠 Tổng số hộ gia đình: ${finalHouseholdCount}`);
    console.log(`👥 Tổng số cư dân: ${finalResidentCount}`);
    console.log(`💰 Tổng số thanh toán: ${finalPaymentCount}`);
    console.log(`📋 Tổng số loại phí: ${finalFeeCount}`);

    // Thống kê doanh thu tháng hiện tại
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    
    const currentMonthEnd = new Date();
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
    currentMonthEnd.setDate(0);
    currentMonthEnd.setHours(23, 59, 59, 999);

    const currentMonthPayments = await Payment.find({
      paymentDate: { $gte: currentMonthStart, $lte: currentMonthEnd },
      status: 'paid'
    });

    const currentMonthRevenue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    console.log(`💵 Doanh thu tháng hiện tại: ${currentMonthRevenue.toLocaleString()} VND`);
    console.log(`📈 Số thanh toán tháng hiện tại: ${currentMonthPayments.length}`);

    console.log('\n🎉 Hoàn thành tạo dữ liệu test khổng lồ!');

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Chạy script
createMassiveTestData(); 

// Create payments for each fee and household
const createPayments = async () => {
  console.log('Creating payments...');
  
  // Delete existing payments
  await Payment.deleteMany({});
  
  const fees = await Fee.find({});
  const households = await Household.find({});
  const collectors = await User.find({ role: { $in: ['admin', 'accountant'] } });
  
  let count = 0;
  const paymentPromises = [];
  
  // For each fee
  for (const fee of fees) {
    // Determine which households should have this fee based on probability
    const selectedHouseholds = households.filter(() => Math.random() < 0.8); // 80% of households get each fee
    
    // For each selected household
    for (const household of selectedHouseholds) {
      // Generate payment status (70% paid, 20% pending, 10% overdue)
      const statusRandom = Math.random();
      const status = statusRandom < 0.7 ? 'paid' : statusRandom < 0.9 ? 'pending' : 'overdue';
      
      // Generate payment date
      let paymentDate = null;
      if (status === 'paid') {
        // If paid, set a random payment date within the last year
        const daysAgo = Math.floor(Math.random() * 365);
        paymentDate = new Date();
        paymentDate.setDate(paymentDate.getDate() - daysAgo);
      }
      
      // Choose a random collector from admins/accountants
      const randomCollector = collectors[Math.floor(Math.random() * collectors.length)];
      
      // Generate random payment method
      const methods = ['cash', 'bank_transfer', 'card', 'other'];
      const method = methods[Math.floor(Math.random() * methods.length)];
      
      // Create payment object
      const paymentData = {
        fee: fee._id,
        household: household._id,
        amount: fee.amount,
        status,
        method,
        collector: randomCollector._id,
        note: `Test payment for ${fee.name}`
      };
      
      if (paymentDate) {
        paymentData.paymentDate = paymentDate;
      }
      
      const payment = new Payment(paymentData);
      paymentPromises.push(payment.save());
      count++;
    }
  }
  
  await Promise.all(paymentPromises);
  const finalPaymentCount = await Payment.countDocuments();
  console.log(`Created ${finalPaymentCount} payments`);
  
  return finalPaymentCount;
}; 