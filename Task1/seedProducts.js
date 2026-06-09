const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://25wh5a0505_db_user:geetha27@ac-dwapf1c-shard-00-00.neyljct.mongodb.net:27017,ac-dwapf1c-shard-00-01.neyljct.mongodb.net:27017,ac-dwapf1c-shard-00-02.neyljct.mongodb.net:27017/?ssl=true&replicaSet=atlas-ynzcau-shard-0&authSource=admin&appName=Cluster0')
.then(async () => {

  await Product.deleteMany({});
  console.log('All old products deleted!');

  await Product.insertMany([
  {
    name: 'RCB Premium Jersey 2026',
    description: 'Official RCB premium jersey for IPL 2026',
    price: 999,
    image: '/images/Jersey-1.png',
    category: 'Jerseys',
    stock: 50
  },
  {
    name: 'RCB Fan Jersey 2026',
    description: 'Official RCB fan jersey for IPL 2026',
    price: 899,
    image: '/images/Jersey-2.png',
    category: 'Jerseys',
    stock: 45
  },

  {
    name: 'MRF Genius Grand Edition Bat',
    description: 'Professional cricket bat inspired by Virat Kohli',
    price: 1499,
    image: '/images/Bat-1.png',
    category: 'Bats',
    stock: 30
  },
  {
    name: 'SS Ton Reserve Edition Bat',
    description: 'Premium English willow cricket bat',
    price: 1999,
    image: '/images/Bat-2.png',
    category: 'Bats',
    stock: 25
  },
  {
    name: 'SG RSD Spark Cricket Bat',
    description: 'Official SG bat for all formats',
    price: 1299,
    image: '/images/Bat-3.png',
    category: 'Bats',
    stock: 35
  },

  {
    name: 'SG Tennis Ball',
    description: 'Official tennis cricket ball',
    price: 299,
    image: '/images/Ball-1.png',
    category: 'Balls',
    stock: 100
  },
  {
    name: 'SG White Cricket Ball',
    description: 'Official white cricket ball for ODI matches',
    price: 349,
    image: '/images/Ball-2.png',
    category: 'Balls',
    stock: 80
  },
  {
    name: 'SG Red Leather Ball',
    description: 'Premium red leather cricket ball',
    price: 399,
    image: '/images/Ball-3.png',
    category: 'Balls',
    stock: 60
  },

  {
    name: 'SG Litevate Batting Gloves',
    description: 'Professional batting gloves',
    price: 599,
    image: '/images/Glove-1.png',
    category: 'Gloves',
    stock: 40
  },
  {
    name: 'SS Professional Batting Gloves',
    description: 'Premium leather batting gloves',
    price: 799,
    image: '/images/Glove-2.png',
    category: 'Gloves',
    stock: 35
  },
  {
    name: 'Kookaburra Kahuna Gloves',
    description: 'Professional grade batting gloves',
    price: 699,
    image: '/images/Glove-3.png',
    category: 'Gloves',
    stock: 30
  },

  {
    name: 'SG Aeroshield Helmet',
    description: 'Safety helmet with steel grille',
    price: 1299,
    image: '/images/Helmet-1.png',
    category: 'Helmets',
    stock: 25
  },
  {
    name: 'Shrey Masterclass Air Helmet',
    description: 'Professional titanium grille helmet',
    price: 1799,
    image: '/images/Helmet-2.png',
    category: 'Helmets',
    stock: 20
  },
  {
    name: 'DSC Cricket Helmet',
    description: 'Lightweight ABS shell helmet',
    price: 999,
    image: '/images/Helmet-3.png',
    category: 'Helmets',
    stock: 30
  },

  {
    name: 'Adidas Howzat Cricket Shoes',
    description: 'Professional cricket shoes with spikes',
    price: 2499,
    image: '/images/Shoe-1.png',
    category: 'Footwear',
    stock: 20
  },
  {
    name: 'Puma 22YDS Cricket Shoes',
    description: 'Lightweight rubber sole cricket shoes',
    price: 1999,
    image: '/images/Shoe-2.png',
    category: 'Footwear',
    stock: 18
  },
  {
    name: 'Kookaburra Pro 2000 Cricket Shoes',
    description: 'Spike shoes for all pitch conditions',
    price: 2199,
    image: '/images/Shoe-3.png',
    category: 'Footwear',
    stock: 15
  }
]);

  console.log('New products inserted!');
  process.exit();

})
.catch((err) => {
  console.log('Error:', err);
  process.exit();
});