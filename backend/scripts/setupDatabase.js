const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Household = require('../models/householdModel');
const Resident = require('../models/residentModel');
const Payment = require('../models/paymentModel');
const Fee = require('../models/feeModel');
const User = require('../models/userModel');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bluemoon_apartment')
  .then(async () => {
    console.log('🔌 Đã kết nối đến MongoDB');
    
    try {
      // Bước 1: Kiểm tra và xóa chỉ mục householdCode nếu tồn tại
      await fixHouseholdIndex();
      
      // Bước 2: Tạo người dùng admin nếu chưa có
      await createAdminUser();
      
      // Bước 3: Tạo dữ liệu mẫu
      await createMassiveTestData();
      
      console.log('\n✅ Hoàn thành quá trình thiết lập dữ liệu!');
    } catch (error) {
      console.error('❌ Lỗi trong quá trình thiết lập dữ liệu:', error);
    } finally {
      await mongoose.connection.close();
      console.log('🔌 Đã đóng kết nối MongoDB');
    }
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối đến MongoDB:', err);
    process.exit(1);
  });

// Hàm kiểm tra và xóa chỉ mục householdCode
async function fixHouseholdIndex() {
  console.log('\n🔍 Đang kiểm tra chỉ mục householdCode...');
  
  try {
    // Lấy collection households
    const db = mongoose.connection.db;
    
    // Kiểm tra xem collection households có tồn tại không
    const collections = await db.listCollections().toArray();
    const householdsExists = collections.some(col => col.name === 'households');
    
    if (householdsExists) {
      // Kiểm tra các chỉ mục hiện có
      const indexes = await db.collection('households').indexes();
      
      // Tìm chỉ mục householdCode
      const householdCodeIndex = indexes.find(index => 
        index.name === 'householdCode_1' || 
        (index.key && Object.keys(index.key).includes('householdCode'))
      );
      
      if (householdCodeIndex) {
        console.log('🗑️ Tìm thấy chỉ mục householdCode, đang xóa...');
        await db.command({
          dropIndexes: 'households',
          index: householdCodeIndex.name
        });
        console.log('✅ Đã xóa chỉ mục householdCode thành công!');
      } else {
        console.log('✅ Không tìm thấy chỉ mục householdCode, tiếp tục...');
      }
    } else {
      console.log('ℹ️ Collection households chưa tồn tại, bỏ qua bước này.');
    }
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra/xóa chỉ mục:', error);
  }
}

// Hàm tạo người dùng admin
async function createAdminUser() {
  console.log('\n👤 Đang kiểm tra người dùng admin...');
  
  try {
    // Kiểm tra xem đã có admin chưa
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('✅ Người dùng admin đã tồn tại:', adminExists.email);
      return;
    }
    
    // Tạo người dùng admin mới
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@bluemoon.com',
      password: 'admin123',
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('✅ Đã tạo người dùng admin mới:', adminUser.email);
    
    // Tạo thêm một số người dùng khác
    const users = [
      {
        name: 'Quản lý',
        email: 'manager@bluemoon.com',
        password: 'manager123',
        role: 'manager'
      },
      {
        name: 'Kế toán',
        email: 'accountant@bluemoon.com',
        password: 'accountant123',
        role: 'accountant'
      },
      {
        name: 'Nhân viên',
        email: 'staff@bluemoon.com',
        password: 'staff123',
        role: 'staff'
      }
    ];
    
    for (const user of users) {
      const userExists = await User.findOne({ email: user.email });
      if (!userExists) {
        const newUser = new User(user);
        await newUser.save();
        console.log(`✅ Đã tạo người dùng ${user.role}:`, user.email);
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi tạo người dùng admin:', error);
    throw error;
  }
}

// Hàm tạo dữ liệu mẫu
async function createMassiveTestData() {
  console.log('\n🚀 Bắt đầu tạo dữ liệu test...');

  try {
    // Tạo loại phí nếu chưa có
    await createFees();
    
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
          let paymentDate;
          
          // Nếu là tháng hiện tại, đảm bảo ngày thanh toán <= 6 (nếu tháng hiện tại là tháng 6)
          if (monthOffset === 0 && paymentMonth.getMonth() === 5) { // Tháng 6 (index 5)
            paymentDate = new Date(
              paymentMonth.getFullYear(), 
              paymentMonth.getMonth(), 
              Math.floor(Math.random() * 6) + 1 // Ngày 1-6
            );
          } else {
            paymentDate = new Date(
              paymentMonth.getFullYear(), 
              paymentMonth.getMonth(), 
              Math.floor(Math.random() * 28) + 1
            );
          }

          // Tạo số tiền với biến động ±30%
          const baseAmount = fee.amount || 500000;
          const variance = 0.7 + Math.random() * 0.6; // 0.7 - 1.3
          const amount = Math.floor((baseAmount * variance) / 10000) * 10000;

          // Tạo status cho thanh toán
          const status = Math.random() < 0.9 ? 'paid' : 'pending';
          
          // Nếu là tháng 6, không tạo thanh toán quá hạn
          const finalStatus = (monthOffset === 0 && paymentMonth.getMonth() === 5) ? 
            (Math.random() < 0.95 ? 'paid' : 'pending') : status;

          paymentsToCreate.push({
            household: household._id,
            fee: fee._id,
            amount: amount,
            paymentDate: paymentDate,
            method: ['cash', 'bank_transfer', 'card', 'other'][Math.floor(Math.random() * 4)],
            status: finalStatus,
            note: `Thanh toán ${fee.name} tháng ${paymentMonth.getMonth() + 1}/${paymentMonth.getFullYear()}`
          });
        }
      }
    }

    // Thêm dữ liệu thanh toán cụ thể cho tháng 6 đến ngày 6/6
    console.log('💰 Thêm dữ liệu thanh toán cụ thể cho tháng 6 đến ngày 6/6...');
    
    // Đảm bảo mọi hộ gia đình đều có thanh toán phí quản lý hàng tháng
    const managementFee = fees.find(fee => fee.name === 'Phí quản lý hàng tháng' || fee.feeCode === 'PHI001');
    
    if (managementFee) {
      for (const household of allHouseholds) {
        // Kiểm tra xem hộ gia đình đã có thanh toán phí quản lý tháng 6 chưa
        const existingPayment = paymentsToCreate.find(p => 
          p.household.toString() === household._id.toString() && 
          p.fee.toString() === managementFee._id.toString() &&
          p.paymentDate.getMonth() === 5 && // Tháng 6 (index 5)
          p.paymentDate.getFullYear() === new Date().getFullYear()
        );
        
        if (!existingPayment) {
          // Thêm thanh toán phí quản lý cho tháng 6
          paymentsToCreate.push({
            household: household._id,
            fee: managementFee._id,
            amount: managementFee.amount,
            paymentDate: new Date(new Date().getFullYear(), 5, Math.floor(Math.random() * 6) + 1), // Ngày 1-6 tháng 6
            method: ['cash', 'bank_transfer'][Math.floor(Math.random() * 2)],
            status: 'paid', // Chỉ có trạng thái đã thanh toán hoặc đang chờ
            note: `Thanh toán phí quản lý hàng tháng - Tháng 6/${new Date().getFullYear()}`
          });
        }
      }
    }
    
    // Thêm thanh toán phí gửi xe cho 30% hộ gia đình
    const parkingFees = fees.filter(fee => fee.feeType === 'parking');
    
    if (parkingFees.length > 0) {
      const parkingHouseholds = allHouseholds
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(allHouseholds.length * 0.3));
      
      for (const household of parkingHouseholds) {
        // Chọn ngẫu nhiên 1-2 loại phí gửi xe
        const numParkingFees = Math.min(parkingFees.length, Math.floor(Math.random() * 2) + 1);
        const selectedParkingFees = parkingFees.sort(() => 0.5 - Math.random()).slice(0, numParkingFees);
        
        for (const fee of selectedParkingFees) {
          paymentsToCreate.push({
            household: household._id,
            fee: fee._id,
            amount: fee.amount,
            paymentDate: new Date(new Date().getFullYear(), 5, Math.floor(Math.random() * 6) + 1), // Ngày 1-6 tháng 6
            method: 'cash',
            status: Math.random() < 0.95 ? 'paid' : 'pending', // 95% đã thanh toán, 5% đang chờ
            note: `Thanh toán ${fee.name} - Tháng 6/${new Date().getFullYear()}`
          });
        }
      }
    }
    
    // Thêm thanh toán phí đóng góp cho 15% hộ gia đình
    const contributionFees = fees.filter(fee => fee.feeType === 'contribution');
    
    if (contributionFees.length > 0) {
      const contributionHouseholds = allHouseholds
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(allHouseholds.length * 0.15));
      
      for (const household of contributionHouseholds) {
        for (const fee of contributionFees) {
          paymentsToCreate.push({
            household: household._id,
            fee: fee._id,
            amount: fee.amount,
            paymentDate: new Date(new Date().getFullYear(), 5, Math.floor(Math.random() * 6) + 1), // Ngày 1-6 tháng 6
            method: 'bank_transfer',
            status: Math.random() < 0.9 ? 'paid' : 'pending', // 90% đã thanh toán, 10% đang chờ
            note: `Thanh toán ${fee.name} - Tháng 6/${new Date().getFullYear()}`
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
    
    // Thống kê doanh thu tháng 6 đến ngày 6/6
    const june6Start = new Date(new Date().getFullYear(), 5, 1); // 1/6
    const june6End = new Date(new Date().getFullYear(), 5, 6, 23, 59, 59, 999); // 6/6
    
    const june6Payments = await Payment.find({
      paymentDate: { $gte: june6Start, $lte: june6End },
      status: 'paid'
    }).populate('fee').populate('household');
    
    const june6Revenue = june6Payments.reduce((sum, p) => sum + p.amount, 0);
    
    console.log('\n📊 THỐNG KÊ DOANH THU THÁNG 6 (đến ngày 6/6):');
    console.log(`💰 Tổng số thanh toán: ${june6Payments.length}`);
    console.log(`💵 Tổng doanh thu: ${june6Revenue.toLocaleString()} VND`);
    
    // Thống kê theo loại phí
    const revenueByFeeType = {};
    for (const payment of june6Payments) {
      const feeType = payment.fee.feeType;
      if (!revenueByFeeType[feeType]) {
        revenueByFeeType[feeType] = 0;
      }
      revenueByFeeType[feeType] += payment.amount;
    }
    
    console.log('\n--- Doanh thu theo loại phí ---');
    for (const [feeType, amount] of Object.entries(revenueByFeeType)) {
      let feeTypeName;
      switch(feeType) {
        case 'mandatory': feeTypeName = 'Phí bắt buộc'; break;
        case 'voluntary': feeTypeName = 'Phí tự nguyện'; break;
        case 'contribution': feeTypeName = 'Phí đóng góp'; break;
        case 'parking': feeTypeName = 'Phí gửi xe'; break;
        case 'utilities': feeTypeName = 'Phí tiện ích'; break;
        default: feeTypeName = feeType;
      }
      console.log(`${feeTypeName}: ${amount.toLocaleString()} VND`);
    }

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu:', error);
    throw error;
  }
}

// Hàm tạo các loại phí
async function createFees() {
  console.log('💲 Kiểm tra và tạo các loại phí...');
  
  try {
    // Kiểm tra xem đã có loại phí nào chưa
    const feeCount = await Fee.countDocuments();
    
    if (feeCount > 0) {
      console.log(`✅ Đã có ${feeCount} loại phí, bỏ qua bước này.`);
      return;
    }
    
    // Tạo các loại phí
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
    ];
    
    await Fee.insertMany(fees);
    console.log(`✅ Đã tạo ${fees.length} loại phí.`);
  } catch (error) {
    console.error('❌ Lỗi khi tạo loại phí:', error);
    throw error;
  }
} 