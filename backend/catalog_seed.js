const path = require('path');
const fs = require('fs');

module.exports = function seedBraveCatalogue({db}) {
  // Official UNIQUE BRAVE catalogue: admin-owned, live marketplace listings.
  // These are not test/demo orders. Inventory and prices are editable from Admin.
  const products = [['Samsung Galaxy A17 128GB', 'Phones & Tablets', 230000, 'Samsung', 'phone.svg'], ['iPhone 14 128GB', 'Phones & Tablets', 420000, 'Apple', 'phone.svg'], ['Tecno Camon 30', 'Phones & Tablets', 285000, 'Tecno', 'phone.svg'], ['Infinix Note 40', 'Phones & Tablets', 265000, 'Infinix', 'phone.svg'], ['Google Pixel 8a', 'Phones & Tablets', 395000, 'Google', 'phone.svg'], ['Redmi Note 13', 'Phones & Tablets', 225000, 'Xiaomi', 'phone.svg'], ['Oraimo FreePods 4', 'Electronics', 38000, 'Oraimo', 'headphones.svg'], ['JBL Tune 520BT', 'Electronics', 72000, 'JBL', 'headphones.svg'], ['Oraimo Power Bank 20000mAh', 'Electronics', 28500, 'Oraimo', 'powerbank.svg'], ['Anker PowerCore 20000mAh', 'Electronics', 45000, 'Anker', 'powerbank.svg'], ['Samsung 55-inch 4K Smart TV', 'Electronics', 680000, 'Samsung', 'speaker.svg'], ['Hisense 43-inch Smart TV', 'Electronics', 345000, 'Hisense', 'speaker.svg'], ['Binatone 18-inch Standing Fan', 'Home Appliances', 85000, 'Binatone', 'blender.svg'], ['Lontor Rechargeable Table Fan', 'Home Appliances', 12000, 'Lontor', 'blender.svg'], ['Nexus 1.5HP Air Conditioner', 'Home Appliances', 520000, 'Nexus', 'blender.svg'], ['Midea 200L Chest Freezer', 'Home Appliances', 430000, 'Midea', 'chair.svg'], ['Scanfrost 200L Refrigerator', 'Home Appliances', 610000, 'Scanfrost', 'chair.svg'], ['Binatone Blender 1.5L', 'Home Appliances', 42000, 'Binatone', 'blender.svg'], ['HP 15 Laptop 8GB/512GB', 'Computers & Laptops', 520000, 'HP', 'laptop.svg'], ['Lenovo IdeaPad 3', 'Computers & Laptops', 495000, 'Lenovo', 'laptop.svg'], ['Dell Latitude 5420', 'Computers & Laptops', 560000, 'Dell', 'laptop.svg'], ['Apple MacBook Air M2', 'Computers & Laptops', 1250000, 'Apple', 'laptop.svg'], ['HP Wireless Keyboard and Mouse', 'Computers & Laptops', 28000, 'HP', 'laptop.svg'], ['Lenovo 24-inch Monitor', 'Computers & Laptops', 155000, 'Lenovo', 'laptop.svg'], ['Nike Air Max Running Shoes', 'Fashion', 65000, 'Nike', 'sneakers.svg'], ['Adidas Court Sneakers', 'Fashion', 58000, 'Adidas', 'sneakers.svg'], ["Men's Senator Native Outfit", 'Fashion', 42000, 'BRAVE Fashion', 'shirt.svg'], ["Women's Ankara Dress", 'Fashion', 35000, 'BRAVE Fashion', 'shirt.svg'], ['Unisex Canvas Backpack', 'Fashion', 24000, 'BRAVE Fashion', 'bag.svg'], ["Men's Leather Belt", 'Fashion', 15000, 'BRAVE Fashion', 'bag.svg'], ["Women's Handbag", 'Fashion', 32000, 'BRAVE Fashion', 'bag.svg'], ['Classic Wrist Watch', 'Fashion', 28000, 'BRAVE Accessories', 'watch.svg'], ['Smart Fitness Watch', 'Electronics', 55000, 'BRAVE Accessories', 'watch.svg'], ['Non-stick Cookware Set 12pc', 'Home & Living', 78000, 'BRAVE Home', 'chair.svg'], ['Orthopedic Office Chair', 'Home & Living', 145000, 'BRAVE Home', 'chair.svg'], ['Modern 3-Seater Sofa', 'Home & Living', 390000, 'BRAVE Home', 'chair.svg'], ['6ft Wooden Study Desk', 'Home & Living', 125000, 'BRAVE Home', 'chair.svg'], ['Rechargeable LED Lantern', 'Home & Living', 18500, 'BRAVE Home', 'powerbank.svg'], ['Portable Bluetooth Speaker', 'Electronics', 52000, 'JBL', 'speaker.svg'], ['Electric Hair Clipper', 'Beauty & Personal Care', 24000, 'Wahl', 'bag.svg'], ['Hair Dryer 2000W', 'Beauty & Personal Care', 31000, 'BRAVE Beauty', 'bag.svg'], ['Makeup Brush Set 12pc', 'Beauty & Personal Care', 18000, 'BRAVE Beauty', 'bag.svg'], ['Electric Kettle 1.7L', 'Home Appliances', 27000, 'Binatone', 'blender.svg'], ['Air Fryer 5L', 'Home Appliances', 89000, 'BRAVE Home', 'blender.svg'], ['Microwave Oven 20L', 'Home Appliances', 125000, 'BRAVE Home', 'blender.svg'], ["Men's Polo Shirt", 'Fashion', 16000, 'BRAVE Fashion', 'shirt.svg'], ["Women's Casual Sneakers", 'Fashion', 42000, 'BRAVE Fashion', 'sneakers.svg'], ['Kids School Backpack', 'Fashion', 18000, 'BRAVE Fashion', 'bag.svg'], ['USB-C Fast Charger 33W', 'Electronics', 14500, 'BRAVE Electronics', 'powerbank.svg'], ['Bluetooth Smartwatch Pro', 'Electronics', 62000, 'BRAVE Electronics', 'watch.svg']];
  const services = [['Logo & Brand Identity Design', 'Creative & Digital', 35000], ['Business Flyer Design', 'Creative & Digital', 15000], ['Social Media Design Package', 'Creative & Digital', 30000], ['UI/UX Design', 'Creative & Digital', 75000], ['Website Design', 'Technology', 90000], ['Website Development', 'Technology', 180000], ['E-commerce Store Setup', 'Technology', 150000], ['Mobile App UI Design', 'Technology', 100000], ['Computer Software Installation', 'Technology', 15000], ['Laptop Repair & Diagnostics', 'Repairs', 25000], ['Phone Screen Replacement', 'Repairs', 35000], ['Phone Software Repair', 'Repairs', 15000], ['Home Electrical Repairs', 'Home Services', 20000], ['Plumbing Repairs', 'Home Services', 22000], ['Air Conditioner Servicing', 'Home Services', 30000], ['Home Deep Cleaning', 'Home Services', 25000], ['Office Cleaning', 'Home Services', 30000], ['Furniture Assembly', 'Home Services', 18000], ['Fashion Tailoring', 'Fashion', 30000], ['Clothing Alteration', 'Fashion', 12000], ['Native Wear Sewing', 'Fashion', 45000], ['Shoe Repair & Restoration', 'Fashion', 15000], ['Hair Styling', 'Beauty', 18000], ['Wig Installation', 'Beauty', 25000], ['Makeup Artist Service', 'Beauty', 25000], ['Barbering Service', 'Beauty', 10000], ['Nail Care & Manicure', 'Beauty', 12000], ['Portrait Photography', 'Media', 30000], ['Product Photography', 'Media', 35000], ['Event Photography', 'Media', 60000], ['Video Editing', 'Media', 35000], ['Event Videography', 'Media', 70000], ['Short Video/Reels Production', 'Media', 30000], ['Copywriting', 'Writing & Business', 18000], ['CV & Resume Writing', 'Writing & Business', 15000], ['Business Proposal Writing', 'Writing & Business', 25000], ['Social Media Management', 'Writing & Business', 50000], ['Digital Marketing Setup', 'Writing & Business', 60000], ['Accounting Bookkeeping Support', 'Finance & Business', 40000], ['Business Registration Assistance', 'Finance & Business', 35000], ['Private Mathematics Tutoring', 'Education', 12000], ['English Language Tutoring', 'Education', 12000], ['Computer Skills Training', 'Education', 15000], ['JAMB/WAEC Study Support', 'Education', 12000], ['Catering for Small Events', 'Food & Events', 50000], ['Birthday Cake & Dessert Service', 'Food & Events', 30000], ['Event Decoration', 'Food & Events', 75000], ['Delivery & Errand Service', 'Logistics', 10000], ['Moving & Relocation Assistance', 'Logistics', 45000], ['Laundry & Garment Care', 'Home Services', 15000]];
  // Additional live catalogue: real-world product names with current Nigerian marketplace reference prices.
  // Images use photographic CDN URLs (not SVG/demo placeholders). Admin can replace every image from the Catalogue Manager.
  const photo = {
    phone:'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=900',
    smartphone:'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=900',
    laptop:'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=900',
    headphones:'https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?auto=compress&cs=tinysrgb&w=900',
    watch:'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=900',
    shoes:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=900',
    fashion:'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=900',
    handbag:'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=900',
    sofa:'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=900',
    chair:'https://images.pexels.com/photos/116910/pexels-photo-116910.jpeg?auto=compress&cs=tinysrgb&w=900',
    blender:'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=900',
    kettle:'https://images.pexels.com/photos/1447574/pexels-photo-1447574.jpeg?auto=compress&cs=tinysrgb&w=900',
    tv:'https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg?auto=compress&cs=tinysrgb&w=900',
    camera:'https://images.pexels.com/photos/9095/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=900',
    beauty:'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=900',
    perfume:'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=900',
    fridge:'https://images.pexels.com/photos/165539/pexels-photo-165539.jpeg?auto=compress&cs=tinysrgb&w=900',
    washer:'https://images.pexels.com/photos/5591665/pexels-photo-5591665.jpeg?auto=compress&cs=tinysrgb&w=900',
    office:'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=900',
    cleaning:'https://images.pexels.com/photos/4239037/pexels-photo-4239037.jpeg?auto=compress&cs=tinysrgb&w=900',
    coding:'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=900',
    design:'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=900',
    hair:'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=900',
    makeup:'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=900',
    photo:'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=900',
    education:'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=900',
    delivery:'https://images.pexels.com/photos/4393660/pexels-photo-4393660.jpeg?auto=compress&cs=tinysrgb&w=900'
  };
  const additionalProducts = [
    ['Xiaomi Redmi 14C 256GB','Phones & Tablets',149850,'Xiaomi','phone'],['Samsung Galaxy A26 5G 128GB','Phones & Tablets',339183,'Samsung','smartphone'],
    ['Poco M7 8GB/256GB','Phones & Tablets',258519,'Poco','phone'],['itel SUPER 26 Ultra 128GB','Phones & Tablets',259569,'itel','smartphone'],
    ['Oraimo Traveler 15 20000mAh Power Bank','Electronics',13493,'Oraimo','headphones'],['EASYPIE 20000mAh Power Bank','Electronics',6999,'EASYPIE','headphones'],
    ['Ace Elec 20000mAh Power Bank','Electronics',7100,'Ace Elec','headphones'],['Oraimo Wireless Earbuds','Electronics',16500,'Oraimo','headphones'],
    ['JBL Tune 510BT Wireless Headphones','Electronics',65000,'JBL','headphones'],['Samsung 50-inch 4K Smart TV','Electronics',289999,'Samsung','tv'],
    ['Royal 43-inch Google Smart TV','Electronics',209999,'Royal','tv'],['Hisense 55-inch 4K Smart TV','Electronics',522159,'Hisense','tv'],
    ['Midea 20L Microwave Oven','Home Appliances',81965,'Midea','blender'],['Saisho Sandwich Maker S-609','Home Appliances',11500,'Saisho','blender'],
    ['Silver Crest 8L Digital Air Fryer','Home Appliances',29990,'SILVER CREST','blender'],['Syinix 2.2L Electric Kettle','Home Appliances',6399,'Syinix','kettle'],
    ['Binatone 3L Electric Jug','Home Appliances',28999,'Binatone','kettle'],['Aeon 90L Chest Freezer','Home Appliances',169999,'Aeon','fridge'],
    ['Aeon 70L Double Door Fridge','Home Appliances',144380,'Aeon','fridge'],['Aeon 5kg Twin Tub Washing Machine','Home Appliances',119999,'Aeon','washer'],
    ['Hansen 18-inch Industrial Standing Fan','Home Appliances',16900,'Hansen','kettle'],['Hansen Electric Iron 1000W','Home Appliances',5959,'Hansen','kettle'],
    ['Skyrun 4-Burner Gas Cooker','Home Appliances',140990,'Skyrun','blender'],['Nexus 1HP Split Air Conditioner','Home Appliances',265596,'Nexus','blender'],
    ['HP 255 G9 Laptop','Computers & Laptops',485000,'HP','laptop'],['Lenovo ThinkPad T14','Computers & Laptops',620000,'Lenovo','laptop'],
    ['Dell Latitude 5420 Core i5','Computers & Laptops',560000,'Dell','laptop'],['HP 24-inch Full HD Monitor','Computers & Laptops',145000,'HP','laptop'],
    ['Logitech Wireless Keyboard and Mouse','Computers & Laptops',38000,'Logitech','laptop'],['TP-Link WiFi Router','Electronics',35000,'TP-Link','smartphone'],
    ['Nike Air Force 1 Style Sneakers','Fashion',65000,'Nike','shoes'],['Men Cotton Polo Shirt','Fashion',16000,'BRAVE Fashion','fashion'],
    ['Women Ankara Casual Dress','Fashion',35000,'BRAVE Fashion','fashion'],['Unisex Canvas Backpack','Fashion',24000,'BRAVE Fashion','handbag'],
    ['Women Leather Handbag','Fashion',32000,'BRAVE Fashion','handbag'],['Classic Quartz Wrist Watch','Fashion',28000,'BRAVE Accessories','watch'],
    ['Men Leather Belt','Fashion',15000,'BRAVE Accessories','fashion'],['Kids School Backpack','Fashion',18000,'BRAVE Kids','handbag'],
    ['Non-stick Cookware Set 12pc','Home & Living',78000,'BRAVE Home','sofa'],['Orthopedic Office Chair','Home & Living',145000,'BRAVE Home','chair'],
    ['Modern 3-Seater Sofa','Home & Living',390000,'BRAVE Home','sofa'],['6ft Study Desk','Home & Living',125000,'BRAVE Home','chair'],
    ['SILVER CREST 2L Industrial Blender','Home Appliances',20979,'SILVER CREST','blender'],['Hair Clipper Professional Kit','Beauty & Personal Care',3933,'Generic','beauty'],
    ['NIVEA Body Lotion 400ml Pack','Beauty & Personal Care',9865,'NIVEA','beauty'],['Eucerin Skin Care Lotion','Beauty & Personal Care',18500,'Eucerin','beauty'],
    ['Men Eau de Parfum 100ml','Beauty & Personal Care',22000,'BRAVE Beauty','perfume'],['Makeup Brush Set 12pc','Beauty & Personal Care',18000,'BRAVE Beauty','makeup'],
    ['Portable Rechargeable Mini Fan','Electronics',2880,'Generic','kettle'],['Blue Wave 500W Portable Power Station','Electronics',199000,'Blue Wave','smartphone'],
  ];
  const additionalServices = [
    ['Brand Logo Refresh','Creative & Digital',25000,'design'],['Instagram Business Page Setup','Creative & Digital',20000,'design'],['Professional Business Card Design','Creative & Digital',12000,'design'],['Pitch Deck Design','Creative & Digital',55000,'office'],['Product Catalogue Design','Creative & Digital',35000,'design'],
    ['WordPress Website Setup','Technology',85000,'coding'],['Business Website Maintenance','Technology',30000,'coding'],['Online Store Product Upload','Technology',25000,'coding'],['Domain & Hosting Setup','Technology',20000,'coding'],['Website Speed Optimisation','Technology',45000,'coding'],
    ['Android App Bug Fixing','Technology',50000,'coding'],['Laptop OS Installation','Repairs',12000,'laptop'],['Laptop Keyboard Replacement Labour','Repairs',15000,'laptop'],['Phone Battery Replacement Labour','Repairs',12000,'phone'],['Home CCTV Installation','Home Services',45000,'office'],
    ['Generator Servicing','Home Services',25000,'office'],['AC Installation Labour','Home Services',60000,'office'],['Move-in Deep Cleaning','Home Services',35000,'cleaning'],['Post-Construction Cleaning','Home Services',50000,'cleaning'],['Sofa & Carpet Cleaning','Home Services',30000,'cleaning'],
    ['Curtain Installation','Home Services',15000,'office'],['Custom Shirt Tailoring','Fashion',25000,'fashion'],['Corporate Wear Tailoring','Fashion',45000,'fashion'],['Wedding Outfit Tailoring','Fashion',75000,'fashion'],['Sneaker Cleaning','Fashion',10000,'shoes'],
    ['Natural Hair Styling','Beauty',18000,'hair'],['Braiding Service','Beauty',25000,'hair'],['Wig Revamp','Beauty',20000,'hair'],['Bridal Makeup','Beauty',45000,'makeup'],['Home Service Manicure','Beauty',15000,'makeup'],
    ['Corporate Headshots','Media',35000,'photo'],['Real Estate Photography','Media',50000,'photo'],['Product Video Shoot','Media',55000,'photo'],['YouTube Video Editing','Media',40000,'design'],['Social Media Reels Editing','Media',30000,'design'],
    ['Business Content Calendar','Writing & Business',25000,'office'],['LinkedIn Profile Writing','Writing & Business',18000,'office'],['Sales Copywriting Package','Writing & Business',30000,'design'],['Email Marketing Setup','Writing & Business',35000,'coding'],['Google Business Profile Setup','Writing & Business',25000,'office'],
    ['Basic Bookkeeping Setup','Finance & Business',30000,'office'],['SME Budget Preparation','Finance & Business',25000,'office'],['Tax Record Organisation','Finance & Business',30000,'office'],['Excel Spreadsheet Automation','Finance & Business',45000,'coding'],['Primary School Tutoring','Education',10000,'education'],
    ['Secondary School Maths Tutoring','Education',12000,'education'],['WAEC Exam Revision','Education',15000,'education'],['Computer Basics for Adults','Education',15000,'education'],['Small Event Catering','Food & Events',50000,'office'],['Local Delivery & Errand Service','Logistics',10000,'delivery']
  ];
  const additionalProductImage = key => photo[key] || photo.phone;
  const productImage = name => '/images/catalog/' + name;
  const serviceImage = name => '/images/catalog/' + name;
  const now = new Date().toISOString();

  const pIns = db.prepare(`INSERT OR IGNORE INTO products
    (public_id,owner_id,owner_name,owner_username,name,category,description,price,delivery_price,payment_method,
     image_data,video_data,featured,status,stock,quantity,sku,brand,condition,location,delivery_estimate,return_policy,tags,published_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  additionalProducts.forEach((p,i) => {
    const [name,category,price,brand,imgKey] = p;
    const n=i+51, pid='brave-catalog-product-'+String(n).padStart(3,'0');
    pIns.run(pid,'ADMIN','UNIQUE BRAVE','',name,category,
      `Official UNIQUE BRAVE catalogue listing. Marketplace reference price for Nigeria; final price, stock and media are controlled by BRAVE Admin.`,
      price,0,'pay_on_delivery',additionalProductImage(imgKey),'','0','active',20,20,'UB-'+String(n).padStart(4,'0'),brand,'new','Nigeria',
      '2–7 business days','Subject to UNIQUE BRAVE return policy',category.toLowerCase()+',marketplace,jumia-style,unique brave',now);
  });
  products.forEach((p,i) => {
    const [name,category,price,brand,img] = p;
    const pid = 'brave-catalog-product-' + String(i+1).padStart(3,'0');
    pIns.run(pid,'ADMIN','UNIQUE BRAVE','',name,category,
      `Official UNIQUE BRAVE catalogue listing for ${name}. Product details, availability and final price are managed by BRAVE Admin.`,
      price,0,'pay_on_delivery',productImage(img),'',i<8?'1':'0','active',20,20,'UB-'+String(i+1).padStart(4,'0'),brand,'new','Nigeria',
      '2–7 business days','Subject to UNIQUE BRAVE return policy',category.toLowerCase()+',unique brave',now);
  });

  const sIns = db.prepare(`INSERT OR IGNORE INTO services
    (public_id,owner_id,owner_name,owner_username,name,category,description,price,payment_method,image_data,video_data,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  additionalServices.forEach((s,i) => {
    const [name,category,price,imgKey]=s, n=i+51, sid='brave-catalog-service-'+String(n).padStart(3,'0');
    sIns.run(sid,'ADMIN','UNIQUE BRAVE','',name,category,
      `Official UNIQUE BRAVE service listing. Scope, availability, price and media are controlled by BRAVE Admin.`,
      price,'pay_after_service',photo[imgKey]||photo.office,'','active');
  });

  services.forEach((s,i) => {
    const [name,category,price] = s;
    const sid = 'brave-catalog-service-' + String(i+1).padStart(3,'0');
    const imgs=['camera.svg','laptop.svg','shirt.svg','bag.svg','chair.svg','phone.svg'];
    sIns.run(sid,'ADMIN','UNIQUE BRAVE','',name,category,
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
