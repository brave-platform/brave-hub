const path = require('path');
const fs = require('fs');

module.exports = function seedBraveCatalogue({db}) {
  // Official UNIQUE BRAVE catalogue: admin-owned, live marketplace listings.
  // These are not test/demo orders. Inventory and prices are editable from Admin.
  const products = [('Samsung Galaxy A17 128GB', 'Phones & Tablets', 230000, 'Samsung', 'phone.svg'), ('iPhone 14 128GB', 'Phones & Tablets', 420000, 'Apple', 'phone.svg'), ('Tecno Camon 30', 'Phones & Tablets', 285000, 'Tecno', 'phone.svg'), ('Infinix Note 40', 'Phones & Tablets', 265000, 'Infinix', 'phone.svg'), ('Google Pixel 8a', 'Phones & Tablets', 395000, 'Google', 'phone.svg'), ('Redmi Note 13', 'Phones & Tablets', 225000, 'Xiaomi', 'phone.svg'), ('Oraimo FreePods 4', 'Electronics', 38000, 'Oraimo', 'headphones.svg'), ('JBL Tune 520BT', 'Electronics', 72000, 'JBL', 'headphones.svg'), ('Oraimo Power Bank 20000mAh', 'Electronics', 28500, 'Oraimo', 'powerbank.svg'), ('Anker PowerCore 20000mAh', 'Electronics', 45000, 'Anker', 'powerbank.svg'), ('Samsung 55-inch 4K Smart TV', 'Electronics', 680000, 'Samsung', 'speaker.svg'), ('Hisense 43-inch Smart TV', 'Electronics', 345000, 'Hisense', 'speaker.svg'), ('Binatone 18-inch Standing Fan', 'Home Appliances', 85000, 'Binatone', 'blender.svg'), ('Lontor Rechargeable Table Fan', 'Home Appliances', 12000, 'Lontor', 'blender.svg'), ('Nexus 1.5HP Air Conditioner', 'Home Appliances', 520000, 'Nexus', 'blender.svg'), ('Midea 200L Chest Freezer', 'Home Appliances', 430000, 'Midea', 'chair.svg'), ('Scanfrost 200L Refrigerator', 'Home Appliances', 610000, 'Scanfrost', 'chair.svg'), ('Binatone Blender 1.5L', 'Home Appliances', 42000, 'Binatone', 'blender.svg'), ('HP 15 Laptop 8GB/512GB', 'Computers & Laptops', 520000, 'HP', 'laptop.svg'), ('Lenovo IdeaPad 3', 'Computers & Laptops', 495000, 'Lenovo', 'laptop.svg'), ('Dell Latitude 5420', 'Computers & Laptops', 560000, 'Dell', 'laptop.svg'), ('Apple MacBook Air M2', 'Computers & Laptops', 1250000, 'Apple', 'laptop.svg'), ('HP Wireless Keyboard and Mouse', 'Computers & Laptops', 28000, 'HP', 'laptop.svg'), ('Lenovo 24-inch Monitor', 'Computers & Laptops', 155000, 'Lenovo', 'laptop.svg'), ('Nike Air Max Running Shoes', 'Fashion', 65000, 'Nike', 'sneakers.svg'), ('Adidas Court Sneakers', 'Fashion', 58000, 'Adidas', 'sneakers.svg'), ("Men's Senator Native Outfit", 'Fashion', 42000, 'BRAVE Fashion', 'shirt.svg'), ("Women's Ankara Dress", 'Fashion', 35000, 'BRAVE Fashion', 'shirt.svg'), ('Unisex Canvas Backpack', 'Fashion', 24000, 'BRAVE Fashion', 'bag.svg'), ("Men's Leather Belt", 'Fashion', 15000, 'BRAVE Fashion', 'bag.svg'), ("Women's Handbag", 'Fashion', 32000, 'BRAVE Fashion', 'bag.svg'), ('Classic Wrist Watch', 'Fashion', 28000, 'BRAVE Accessories', 'watch.svg'), ('Smart Fitness Watch', 'Electronics', 55000, 'BRAVE Accessories', 'watch.svg'), ('Non-stick Cookware Set 12pc', 'Home & Living', 78000, 'BRAVE Home', 'chair.svg'), ('Orthopedic Office Chair', 'Home & Living', 145000, 'BRAVE Home', 'chair.svg'), ('Modern 3-Seater Sofa', 'Home & Living', 390000, 'BRAVE Home', 'chair.svg'), ('6ft Wooden Study Desk', 'Home & Living', 125000, 'BRAVE Home', 'chair.svg'), ('Rechargeable LED Lantern', 'Home & Living', 18500, 'BRAVE Home', 'powerbank.svg'), ('Portable Bluetooth Speaker', 'Electronics', 52000, 'JBL', 'speaker.svg'), ('Electric Hair Clipper', 'Beauty & Personal Care', 24000, 'Wahl', 'bag.svg'), ('Hair Dryer 2000W', 'Beauty & Personal Care', 31000, 'BRAVE Beauty', 'bag.svg'), ('Makeup Brush Set 12pc', 'Beauty & Personal Care', 18000, 'BRAVE Beauty', 'bag.svg'), ('Electric Kettle 1.7L', 'Home Appliances', 27000, 'Binatone', 'blender.svg'), ('Air Fryer 5L', 'Home Appliances', 89000, 'BRAVE Home', 'blender.svg'), ('Microwave Oven 20L', 'Home Appliances', 125000, 'BRAVE Home', 'blender.svg'), ("Men's Polo Shirt", 'Fashion', 16000, 'BRAVE Fashion', 'shirt.svg'), ("Women's Casual Sneakers", 'Fashion', 42000, 'BRAVE Fashion', 'sneakers.svg'), ('Kids School Backpack', 'Fashion', 18000, 'BRAVE Fashion', 'bag.svg'), ('USB-C Fast Charger 33W', 'Electronics', 14500, 'BRAVE Electronics', 'powerbank.svg'), ('Bluetooth Smartwatch Pro', 'Electronics', 62000, 'BRAVE Electronics', 'watch.svg')];
  const services = [('Logo & Brand Identity Design', 'Creative & Digital', 35000), ('Business Flyer Design', 'Creative & Digital', 15000), ('Social Media Design Package', 'Creative & Digital', 30000), ('UI/UX Design', 'Creative & Digital', 75000), ('Website Design', 'Technology', 90000), ('Website Development', 'Technology', 180000), ('E-commerce Store Setup', 'Technology', 150000), ('Mobile App UI Design', 'Technology', 100000), ('Computer Software Installation', 'Technology', 15000), ('Laptop Repair & Diagnostics', 'Repairs', 25000), ('Phone Screen Replacement', 'Repairs', 35000), ('Phone Software Repair', 'Repairs', 15000), ('Home Electrical Repairs', 'Home Services', 20000), ('Plumbing Repairs', 'Home Services', 22000), ('Air Conditioner Servicing', 'Home Services', 30000), ('Home Deep Cleaning', 'Home Services', 25000), ('Office Cleaning', 'Home Services', 30000), ('Furniture Assembly', 'Home Services', 18000), ('Fashion Tailoring', 'Fashion', 30000), ('Clothing Alteration', 'Fashion', 12000), ('Native Wear Sewing', 'Fashion', 45000), ('Shoe Repair & Restoration', 'Fashion', 15000), ('Hair Styling', 'Beauty', 18000), ('Wig Installation', 'Beauty', 25000), ('Makeup Artist Service', 'Beauty', 25000), ('Barbering Service', 'Beauty', 10000), ('Nail Care & Manicure', 'Beauty', 12000), ('Portrait Photography', 'Media', 30000), ('Product Photography', 'Media', 35000), ('Event Photography', 'Media', 60000), ('Video Editing', 'Media', 35000), ('Event Videography', 'Media', 70000), ('Short Video/Reels Production', 'Media', 30000), ('Copywriting', 'Writing & Business', 18000), ('CV & Resume Writing', 'Writing & Business', 15000), ('Business Proposal Writing', 'Writing & Business', 25000), ('Social Media Management', 'Writing & Business', 50000), ('Digital Marketing Setup', 'Writing & Business', 60000), ('Accounting Bookkeeping Support', 'Finance & Business', 40000), ('Business Registration Assistance', 'Finance & Business', 35000), ('Private Mathematics Tutoring', 'Education', 12000), ('English Language Tutoring', 'Education', 12000), ('Computer Skills Training', 'Education', 15000), ('JAMB/WAEC Study Support', 'Education', 12000), ('Catering for Small Events', 'Food & Events', 50000), ('Birthday Cake & Dessert Service', 'Food & Events', 30000), ('Event Decoration', 'Food & Events', 75000), ('Delivery & Errand Service', 'Logistics', 10000), ('Moving & Relocation Assistance', 'Logistics', 45000), ('Laundry & Garment Care', 'Home Services', 15000)];
  const productImage = name => '/images/catalog/' + name;
  const serviceImage = name => '/images/catalog/' + name;
  const now = new Date().toISOString();

  const pIns = db.prepare(`INSERT OR IGNORE INTO products
    (public_id,owner_id,owner_name,owner_username,name,category,description,price,delivery_price,payment_method,
     image_data,video_data,featured,status,stock,quantity,sku,brand,condition,location,delivery_estimate,return_policy,tags,published_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  products.forEach((p,i) => {
    const [name,category,price,brand,img] = p;
    const pid = 'brave-catalog-product-' + String(i+1).padStart(3,'0');
    pIns.run(pid,'ADMIN','UNIQUE BRAVE','uniquebrave',name,category,
      `Official UNIQUE BRAVE catalogue listing for ${name}. Product details, availability and final price are managed by BRAVE Admin.`,
      price,0,'pay_on_delivery',productImage(img),'',i<8?'1':'0','active',20,20,'UB-'+String(i+1).padStart(4,'0'),brand,'new','Nigeria',
      '2–7 business days','Subject to UNIQUE BRAVE return policy',category.toLowerCase()+',unique brave',now);
  });

  const sIns = db.prepare(`INSERT OR IGNORE INTO services
    (public_id,owner_id,owner_name,owner_username,name,category,description,price,payment_method,image_data,video_data,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  services.forEach((s,i) => {
    const [name,category,price] = s;
    const sid = 'brave-catalog-service-' + String(i+1).padStart(3,'0');
    const imgs=['camera.svg','laptop.svg','shirt.svg','bag.svg','chair.svg','phone.svg'];
    sIns.run(sid,'ADMIN','UNIQUE BRAVE','uniquebrave',name,category,
      `Official UNIQUE BRAVE service listing for ${name}. Scope, availability, price and delivery terms are managed by BRAVE Admin.`,
      price,'pay_after_service',serviceImage(imgs[i%imgs.length]),'','active');
  });

  try {
    db.prepare(`UPDATE products SET owner_id='ADMIN',owner_name='UNIQUE BRAVE',owner_username='uniquebrave',
      description=REPLACE(description,'Demo listing price reference.','Official UNIQUE BRAVE catalogue listing.')
      WHERE owner_id='demo'`).run();
  } catch (_) {}

  try {
    db.prepare(`INSERT OR IGNORE INTO bank_settings(id,bank_name,account_name,account_number,instructions)
      VALUES(1,'OPay','ABIODUN OLAKUNLE OLASIMBO','6586959737','Use this account for UNIQUE BRAVE bank-transfer/part-payment plan and order instructions. Confirm the order reference before sending funds.')`).run();
  } catch (_) {}

  const plans = [
    ['basic','Basic',0,'monthly',JSON.stringify(['Marketplace access','Buy and sell products','Offer services','Public profile','Standard messaging','Basic Workshop tools','Basic records','Standard support'])],
    ['premium','Premium',2500,'monthly',JSON.stringify(['Everything in Basic','Featured seller/provider profile','Expanded Workshop business tools','Priority marketplace discovery','Advanced records and invoices','Business profile tools','Customer follow-up tools','Priority support'])],
    ['luxury','Luxury',7500,'monthly',JSON.stringify(['Everything in Premium','Advanced business Workshop suite','Enhanced listing visibility','Business analytics and activity reports','Priority advisor access','Advanced promotional tools','Expanded business records','Early access to new BRAVE tools'])]
  ];
  const planIns=db.prepare('INSERT OR IGNORE INTO plans(code,name,price,billing,features) VALUES(?,?,?,?,?)');
  for(const p of plans) planIns.run(...p);
};
