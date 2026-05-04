import { format, formatDistanceToNow } from 'date-fns';

export const formatDate    = (d) => format(new Date(d), 'MMM dd, yyyy');
export const formatDateTime= (d) => format(new Date(d), 'MMM dd, yyyy · h:mm a');
export const timeAgo       = (d) => formatDistanceToNow(new Date(d), { addSuffix: true });
export const dayName       = ()  => format(new Date(), 'EEEE');

export const PRIORITY_COLOR = {
  urgent: 'red', high: 'amber', medium: 'blue', low: 'teal',
};
export const STATUS_COLOR = {
  approved: 'green', pending: 'amber', rejected: 'red', returned: 'teal',
  open: 'red', 'in-progress': 'amber', resolved: 'green', closed: 'gray',
  lost: 'red', found: 'green',
};

export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export const MESS_DATA = {
  Monday:    { b:['Idli','Sambar','Medu Vada','Tea'],  l:['Dal Tadka','Jeera Rice','Roti','Aloo Gobi'],  s:['Samosa','Chai'],     d:['Paneer Butter Masala','Naan','Dal Makhani','Rice'] },
  Tuesday:   { b:['Poha','Bread Butter','Tea'],        l:['Rajma','Rice','Roti','Salad'],               s:['Pakora','Coffee'],    d:['Aloo Gobi','Dal Fry','Rice','Chapati'] },
  Wednesday: { b:['Paratha','Curd','Pickle','Tea'],    l:['Chole','Puri','Raita','Rice'],               s:['Fruit Chaat','Juice'],d:['Kadai Chicken','Dal','Rice','Roti'] },
  Thursday:  { b:['Upma','Chutney','Tea'],             l:['Mix Veg','Dal','Rice','Roti'],               s:['Pakora','Tea'],       d:['Egg Curry','Rice','Dal','Chapati'] },
  Friday:    { b:['Puri Bhaji','Chai'],                l:['Palak Paneer','Dal','Rice','Roti'],           s:['Maggi','Tea'],        d:['Mutton Curry','Rice','Dal','Naan'] },
  Saturday:  { b:['Chole Bhature','Lassi'],            l:['Special Biryani','Raita','Salad'],            s:['Jalebi','Chai'],      d:['Paneer Tikka Masala','Dal Makhani','Naan'] },
  Sunday:    { b:['Masala Dosa','Sambar','Chutney'],   l:['Special Thali','Rice','Roti','Dal','Dessert'],s:['Gulab Jamun','Tea'],  d:['Butter Chicken','Naan','Dal','Rice'] },
};

export const MEAL_META = {
  b: { label:'Breakfast', icon:'🌅', time:'7:00 – 9:00 AM' },
  l: { label:'Lunch',     icon:'☀️', time:'12:00 – 2:00 PM' },
  s: { label:'Snacks',    icon:'🌆', time:'5:00 – 6:00 PM' },
  d: { label:'Dinner',    icon:'🌙', time:'7:00 – 10:30 PM' },
};