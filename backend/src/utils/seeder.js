require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/User');
const { MessMenu } = require('../model/Mess');
const { Poll, Notification } = require('../model/index');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_management';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('🌱 Connected. Seeding...');

  // Clear existing data
  await Promise.all([User.deleteMany(), MessMenu.deleteMany(), Poll.deleteMany(), Notification.deleteMany()]);

  // Create Warden
  const warden = await User.create({
    name: 'Dr. Rajesh Sharma',
    email: 'warden@hostelhub.com',
    password: 'Warden@123',
    role: 'warden',
    isEmailVerified: true,
    phone: '9876543210',
  });

  // Create Students
  const students = await User.insertMany([
    { name: 'Aarav Singh', email: 'aarav@student.com', password: await bcrypt.hash('Student@123', 12), role: 'student', roomNumber: 'A-101', rollNumber: 'CS2021001', hostelBlock: 'A', course: 'B.Tech CS', year: 3, isEmailVerified: true, phone: '9000000001' },
    { name: 'Priya Patel', email: 'priya@student.com', password: await bcrypt.hash('Student@123', 12), role: 'student', roomNumber: 'B-205', rollNumber: 'EC2022002', hostelBlock: 'B', course: 'B.Tech EC', year: 2, isEmailVerified: true, phone: '9000000002' },
    { name: 'Rohit Kumar', email: 'rohit@student.com', password: await bcrypt.hash('Student@123', 12), role: 'student', roomNumber: 'A-112', rollNumber: 'ME2020003', hostelBlock: 'A', course: 'B.Tech ME', year: 4, isEmailVerified: true, phone: '9000000003' },
    { name: 'Ananya Gupta', email: 'ananya@student.com', password: await bcrypt.hash('Student@123', 12), role: 'student', roomNumber: 'C-301', rollNumber: 'CE2023004', hostelBlock: 'C', course: 'B.Tech CE', year: 1, isEmailVerified: true, phone: '9000000004' },
  ]);

  // Create Mess Menus
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const menuTemplates = [
    { breakfast: ['Idli Sambar','Vada','Chutney'], lunch: ['Dal Tadka','Jeera Rice','Roti','Sabzi'], snacks: ['Samosa','Tea'], dinner: ['Paneer Butter Masala','Naan','Dal Makhani','Rice'] },
    { breakfast: ['Poha','Boiled Eggs','Tea'], lunch: ['Rajma','Rice','Roti','Salad'], snacks: ['Bread Pakora','Coffee'], dinner: ['Aloo Gobi','Dal Fry','Rice','Chapati'] },
    { breakfast: ['Paratha','Curd','Pickle'], lunch: ['Chole','Puri','Rice','Raita'], snacks: ['Fruit Chaat','Juice'], dinner: ['Kadai Chicken','Dal','Rice','Roti'] },
    { breakfast: ['Upma','Coconut Chutney','Tea'], lunch: ['Mix Veg','Dal','Rice','Roti'], snacks: ['Pakora','Tea'], dinner: ['Egg Curry','Rice','Dal','Chapati'] },
    { breakfast: ['Puri Bhaji','Tea'], lunch: ['Palak Paneer','Dal','Rice','Roti'], snacks: ['Maggi','Tea'], dinner: ['Mutton Curry','Rice','Dal','Naan'] },
    { breakfast: ['Chole Bhature','Lassi'], lunch: ['Biryani','Raita','Salad'], snacks: ['Jalebi','Chai'], dinner: ['Paneer Tikka','Dal Makhani','Roti','Rice'] },
    { breakfast: ['Dosa','Sambar','Chutney'], lunch: ['Special Thali - Dal/Sabzi/Rice/Roti/Dessert'], snacks: ['Gulab Jamun','Tea'], dinner: ['Butter Chicken','Naan','Dal','Rice'] },
  ];

  for (let i = 0; i < 7; i++) {
    const t = menuTemplates[i];
    await MessMenu.create({
      day: days[i],
      createdBy: warden._id,
      isPublished: true,
      meals: {
        breakfast: { items: t.breakfast.map(n => ({ name: n, type: 'veg' })), time: { start: '7:00', end: '9:00' } },
        lunch: { items: t.lunch.map(n => ({ name: n, type: 'veg' })), time: { start: '12:00', end: '14:00' } },
        snacks: { items: t.snacks.map(n => ({ name: n, type: 'veg' })), time: { start: '17:00', end: '18:00' } },
        dinner: { items: t.dinner.map(n => ({ name: n, type: 'veg' })), time: { start: '19:00', end: '21:30' } },
      }
    });
  }

  // Create Sample Poll
  await Poll.create({
    createdBy: warden._id,
    question: 'Which cuisine should be added to the weekend special menu?',
    description: 'Your vote helps us improve the mess experience!',
    options: [
      { text: 'South Indian (Dosa, Uttapam)' },
      { text: 'Chinese (Noodles, Manchurian)' },
      { text: 'Continental (Pasta, Pizza)' },
      { text: 'Street Food (Pav Bhaji, Chaat)' },
    ],
    isActive: true,
    expiresAt: new Date(Date.now() + 7 * 86400000),
  });

  // Welcome Notification
  await Notification.create({
    title: '🎉 Welcome to HostelHub!',
    message: 'Your smart hostel management system is now live. Explore features like digital leave pass, mess feedback, marketplace, and more!',
    type: 'announcement',
    isGlobal: true,
    sender: warden._id,
    priority: 'high',
  });

  console.log('\n✅ Seeding complete!\n');
  console.log('──────────────────────────────');
  console.log('🔑 Demo Credentials:');
  console.log('  Warden:  warden@hostelhub.com  / Warden@123');
  console.log('  Student: aarav@student.com     / Student@123');
  console.log('──────────────────────────────\n');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });