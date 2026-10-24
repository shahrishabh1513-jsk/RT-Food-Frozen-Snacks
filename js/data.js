/* ============================================================
   HY FUN — shared data (products, recipes, export countries, coupons)
   Edit prices, coupons and GST here — every page updates automatically.
   ============================================================ */
const HF = window.HF = {};
HF.GST_RATE = 0.12;            // change to match your GST slab
HF.FREE_DELIVERY_ABOVE = 499;  // free delivery above this subtotal
HF.DELIVERY_FEE = 49;
HF.UPI_ID = 'hyfun@upi';       // used in the live payment QR
HF.HUB = { name: 'Hy Fun Dispatch Hub, Thaltej, Ahmedabad', lat: 23.0507, lng: 72.5113 };

/* ---------- Pack sizes (multiplier on the 500 g price) ---------- */
HF.SIZES = { '200g': 0.42, '500g': 1, '1kg': 1.9, '2.5kg': 4.5 };

/* ---------- Coupons ---------- */
HF.COUPONS = {
  WELCOMEHYFUN: { type: 'pct',  value: 10, max: 150, min: 0,    label: '10% off (max ₹150) — welcome offer' },
  FLAT100:      { type: 'flat', value: 100,           min: 699,  label: '₹100 off on orders above ₹699' },
  FRYDAY:       { type: 'pct',  value: 15, max: 200, min: 999,  label: '15% off (max ₹200) above ₹999' },
  CRISPY50:     { type: 'flat', value: 50,            min: 349,  label: '₹50 off on orders above ₹349' },
  FREESHIP:     { type: 'ship', value: 0,             min: 0,    label: 'Free delivery on any order' }
};

/* ---------- Categories ---------- */
HF.CATS = [
  { id: 'fries',  label: 'French Fries',        icon: '🍟', base: 149, photo: ['french_fries.png', 'Super Crispy Fries.png'], pos: 'center' },
  { id: 'potato', label: 'Potato Specialties',  icon: '🥔', base: 159, photo: ['bg1.png'],            pos: '70% 30%' },
  { id: 'veggie', label: 'Veggie Specialties',  icon: '🥦', base: 179, photo: ['bg1.png'],            pos: '90% 20%' },
  { id: 'indian', label: 'Indian Ethnic',       icon: '🫓', base: 169, photo: ['peck2.webp'],         pos: '55% 50%' },
  { id: 'baked',  label: 'Baked Snacks & Pies', icon: '🍕', base: 199, photo: ['Mexicano Puffets.png'], pos: 'center' },
  { id: 'beyond', label: 'Beyond Potato',       icon: '🥟', base: 189, photo: ['peck2.webp'],         pos: '20% 50%' }
];

/* ---------- Products: [category, name, icon, description, tag] ---------- */
const P = [
 ['fries','French Fries','🍟','The golden classic — fluffy inside, crisp outside.','Bestseller'],
 ['fries','XLF Fries','🍟','Extra-long cut for a restaurant-style bite.',''],
 ['fries','Crinkle Fries','🍟','Wavy ridges that trap more crunch and more sauce.',''],
 ['fries','Skin on Fries','🍟','Rustic skin-on cut with an earthy potato taste.',''],
 ['fries','Flavory Fries','🍟','Pre-seasoned fries — just fry and serve.','New'],
 ['fries','Super Crispy Fries','🍟','Extra coating that stays crunchy for longer.','Bestseller'],
 ['fries','Skin on Coated Fries','🍟','Skin-on potato with a light, crunchy coating.',''],
 ['fries','Rustic Fries','🍟','Thick-cut and hearty with a homestyle finish.',''],
 ['fries','Peri-Peri French Fries','🌶️','Fiery peri-peri seasoning in every fry.','Spicy'],
 ['fries','Cajun Fries','🍟','Smoky Cajun spice baked into the coating.','Spicy'],
 ['fries','Steak Fries','🍟','Thick wedge-style cut, soft inside and crisp outside.',''],
 ['potato','Potato Wedges','🥔','Skin-on wedges with a seasoned, crispy crust.',''],
 ['potato','Classic Wedges','🥔','Thick, hearty and endlessly satisfying.',''],
 ['potato','Spicy Wedges','🌶️','Classic wedges with a bold, spicy kick.','Spicy'],
 ['potato','Hash Brown Round','🟤','Golden round hash browns, crisp edge to edge.',''],
 ['potato','Hash Brown Mini Triangle','🔺','Bite-sized triangles — perfect for snacking.',''],
 ['potato','Hash Brown Triangle','🔺','Classic triangle cut with a crispy shell.','Bestseller'],
 ['potato','Hash Brown Patties','🥞','Thick, fluffy patties with a golden crust.',''],
 ['potato','Hash Brown Gems','💎','Crispy little potato gems made for sharing.',''],
 ['potato','Tater Shotz','🎯','Fun shot-sized tater bites for any occasion.','New'],
 ['potato','Spicy Hash Brown','🔥','Our classic hash brown turned up with real heat.','Spicy'],
 ['potato','Hash Brown Oval','🥚','Oval hash browns with a crisp golden finish.',''],
 ['potato','Classic Patty with Herbs & Chilli','🌿','Potato patty with herbs and a hint of chilli.',''],
 ['potato','Potatobets','🥔','Alphabet-style potato snack kids love.','Kids Fav'],
 ['potato','Chilli Garlic Poppers','🌶️','Crispy poppers packed with chilli-garlic punch.','Bestseller'],
 ['veggie','Jalapeño Cheesy Pops','🧀','Melty cheese and jalapeño in a crispy golden shell.','Bestseller'],
 ['veggie','Veggie Stix','🥕','Crunchy vegetable sticks — a side or a snack.',''],
 ['veggie','Crispy Veggie Bites','🥦','A medley of vegetables in a light crispy coating.',''],
 ['veggie','Kings Patty','👑','A generous, flavour-loaded vegetable patty.',''],
 ['veggie','Veg Burger Patty','🍔','Seasoned patty made for the perfect veg burger.',''],
 ['indian','Aloo Tikki','🫓','Desi classic — spiced potato, shallow-fried golden.','Bestseller'],
 ['indian','Sabudana Patty','🍘','Tapioca pearl patty with a soft, chewy bite.','Vrat Friendly'],
 ['indian','Mumbai Aloo Vada','🟠','Street-style spiced potato vada.',''],
 ['indian','Hara Bhara Kebab','🥬','Vibrant spinach and vegetable kebab.',''],
 ['baked','Margherita Pizza','🍕','Classic cheese and tomato on a crisp base.',''],
 ['baked','Veg Paradise Pizza','🍕','Garden vegetables with melty cheese.',''],
 ['baked','Tandoori Paneer Pizza','🍕','Smoky tandoori paneer with a desi twist.',''],
 ['baked','Garden Fresh Pizza','🍕','A colourful mix of fresh veggies on every slice.',''],
 ['baked','Cheese Onion Capsicum Pizza','🍕','Simple, satisfying cheese-onion-capsicum combo.',''],
 ['baked','Mexicano Puffets','🌮','Flaky puff pastry with a zesty Mexican filling.','New'],
 ['baked','Italiano Puffets','🍕','Golden puffs with a herby Italian-style filling.',''],
 ['baked','Schezwan Puffets','🌶️','Spicy Schezwan filling in a crispy puff.','Spicy'],
 ['baked','Apple Crumble Pie','🥧','Warm spiced apple under a buttery crumble.',''],
 ['baked','Apple Pie','🥧','Flaky crust and sweet apple filling.',''],
 ['baked','Mango Pie','🥭','Tropical mango baked into a golden pie.',''],
 ['baked','Pineapple Pie','🍍','Sweet-tangy pineapple in a crisp pastry shell.',''],
 ['beyond','Mozzarella Cheese Stix','🧀','Gooey mozzarella in a crunchy golden coating.','Bestseller'],
 ['beyond','Onion Rings','🧅','Crispy battered onion rings — a snack-time hero.',''],
 ['beyond','Spicy Paneer Patty','🧈','Soft paneer patty with a spicy kick.','Spicy'],
 ['beyond','Veg Manchurian Balls','🟢','Indo-Chinese style veg balls, crispy and tangy.',''],
 ['beyond','Momos – Mix Veg','🥟','Mixed-vegetable momos, ready to steam or fry.',''],
 ['beyond','Momos – Paneer','🥟','Soft dumplings with a spiced paneer filling.','']
];
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
HF.slug = slug;
const cnt = {};
HF.PRODUCTS = P.map((p, i) => {
  const n = cnt[p[0]] = (cnt[p[0]] ?? -1) + 1;   // index inside its category → varied crops of the shared category photo
  const cat = HF.CATS.find(c => c.id === p[0]);
  const base = cat.base + (p[1].length % 5) * 6;                 // deterministic price spread
  const sizes = p[0] === 'fries' ? ['200g','500g','1kg','2.5kg'] : ['200g','500g','1kg'];
  return { id: slug(p[1]), cat: p[0], name: p[1], icon: p[2], desc: p[3], tag: p[4], base, sizes,
           photo: cat.photo[n % cat.photo.length],
           pos: p[0] === 'fries' ? 'center' : `${15 + (n * 29) % 70}% ${25 + (n * 41) % 50}%`, zoom: p[0] === 'fries' ? 1 + (n % 3) * .1 : 1.25 + ((n * 7) % 5) / 10 };
});
HF.price = (prod, size) => Math.round(prod.base * HF.SIZES[size]);

/* ---------- Export destinations ---------- */
const R = {
 'North America':['USA:39,-98','Canada:56,-106','Dominican Republic:18.7,-70.2','British Virgin Islands:18.4,-64.6'],
 'South America':['Brazil:-14,-51'],
 'Africa':['South Africa:-29,24','Ethiopia:9,40','Kenya:0.2,37.9','Uganda:1.4,32.3','Rwanda:-1.9,29.9','Mauritius:-20.3,57.6','Seychelles:-4.7,55.5'],
 'Middle East':['Saudi Arabia:24,45','UAE:24,54','Oman:21,57','Kuwait:29.3,47.5','Qatar:25.3,51.2','Bahrain:26,50.5','Israel:31,35'],
 'East Asia':['Japan:36,138','South Korea:36.5,127.9','Taiwan:23.7,121','Hong Kong:22.3,114.2','Mongolia:46.9,103.8'],
 'South East Asia':['Indonesia:-2.5,118','Philippines:12.9,122.8','Vietnam:14,108','Thailand:15.9,101','Malaysia:4.2,102','Cambodia:12.6,104.9','Laos:18.2,103.9','Singapore:1.35,103.8','Brunei:4.5,114.7'],
 'Europe':['Kosovo:42.6,20.9','Réunion Island:-21.1,55.5'],
 'Indian Subcontinent':['India:21,78','Bangladesh:23.7,90.4','Nepal:28.4,84.1','Sri Lanka:7.9,80.8','Maldives:3.2,73.2','Myanmar:21.9,95.9'],
 'Oceania':['Australia:-25,134','Fiji:-17.7,178','New Zealand:-41,174','Papua New Guinea:-6.3,143.9','Vanuatu:-15.4,166.9']
};
HF.REGION_COLORS = { 'North America':'#ff5a36','South America':'#f5a700','Africa':'#2b2b2b','Middle East':'#1fa971','East Asia':'#2f7df6','South East Asia':'#8a4fff','Europe':'#e8590c','Indian Subcontinent':'#e91e8c','Oceania':'#0cb4c9' };
HF.COUNTRIES = [];
Object.entries(R).forEach(([region, list]) => list.forEach(s => {
  const [n, c] = s.split(':'); const [lat, lng] = c.split(',').map(Number);
  HF.COUNTRIES.push({ name: n, region, lat, lng });
}));

/* ---------- Recipes (video id, title, category, minutes, serves, HyFun product, ingredients ; steps) ---------- */
const RC = [
 ['N54zWpEUnSg','Arabic Burger','Burgers',20,2,'Veg Burger Patty','2 Hy Fun Veg Burger Patties;2 burger buns;3 tbsp garlic hummus;1 tomato, sliced;Lettuce leaves;Pickled onions;1 tsp sumac or paprika;1 tbsp olive oil','Shallow-fry or air-fry the patties straight from frozen for 8–10 min until golden.|Toast the buns lightly with a drop of olive oil.|Spread hummus on both bun halves.|Layer lettuce, patty, tomato and pickled onions; dust with sumac.|Close the burger and serve hot.'],
 ['cDzYFRCeQb4','Spicy Texan Burger','Burgers',25,2,'Veg Burger Patty','2 Hy Fun Veg Burger Patties;2 burger buns;2 cheese slices;2 tbsp smoky BBQ sauce;1 tsp chilli flakes;Jalapeño slices;Onion rings;Mayonnaise','Fry the patties for 8–10 min until crisp.|Mix BBQ sauce with chilli flakes and mayo.|Toast buns, spread the spicy sauce.|Stack patty, cheese, jalapeños and onion rings.|Melt cheese under a lid for 30 seconds and serve.'],
 ['DzuCZCKJP3Q','Three Cheese Messy Burger','Burgers',25,2,'Veg Burger Patty','2 Hy Fun Veg Burger Patties;2 buns;1 slice cheddar;1 slice processed cheese;2 tbsp mozzarella, grated;1 tbsp butter;Mustard & ketchup;Pickle slices','Fry the patties until golden and crisp.|Butter and toast the buns.|Top each patty with cheddar, processed cheese and mozzarella; cover until melted.|Add mustard, ketchup and pickles.|Assemble and enjoy — napkins required!'],
 ['aFqNA64UmBM','Sabudana Papdi Chaat','Chaat & Street',20,2,'Sabudana Patty','2 Hy Fun Sabudana Patties;8 papdi;1/2 cup whisked curd;2 tbsp green chutney;2 tbsp tamarind chutney;Pomegranate seeds;Sev & coriander;Chaat masala','Air-fry or shallow-fry the sabudana patties until crisp; crumble roughly.|Arrange papdi on a plate and top with crumbled patty.|Pour curd and both chutneys over.|Sprinkle chaat masala, pomegranate, sev and coriander.|Serve immediately so the papdi stays crunchy.'],
 ['HsRzhU3DX3A','Punjabi Burger','Burgers',25,2,'Aloo Tikki','2 Hy Fun Aloo Tikki;2 buns;1 tbsp butter;1 tsp pav bhaji masala;Mint chutney;Sliced onion;Tomato slices;Paneer slice (optional)','Crisp the Aloo Tikki on a hot tawa with a little butter.|Dust with pav bhaji masala.|Toast buns on the tawa and spread mint chutney.|Layer tikki, onion, tomato and paneer.|Press gently and serve hot.'],
 ['bgBBAJFAJDc','Value Burgers','Burgers',15,4,'Veg Burger Patty','4 Hy Fun Veg Burger Patties;4 small buns;Lettuce;1 onion, sliced;Ketchup;Mayonnaise;Processed cheese slices','Fry or bake the patties straight from frozen.|Warm the buns for one minute.|Spread ketchup and mayo.|Add lettuce, onion, cheese and patty.|Serve — a wallet-friendly crowd pleaser.'],
 ['lO_oxQ2ptME','Loaded Skin-on Coated Fries','Fries & Loaded',20,3,'Skin on Coated Fries','300 g Hy Fun Skin on Coated Fries;1/2 cup cheese sauce;2 tbsp jalapeños;1 tbsp spring onion, chopped;2 tbsp sour cream;1 tsp chilli flakes','Fry fries at 175 °C for 3–4 min until golden; drain.|Warm the cheese sauce.|Pile fries on a platter and pour cheese over.|Top with jalapeños, sour cream, spring onion and chilli flakes.|Serve right away.'],
 ['whXSa0n_sWA','Aloo Tikki Chaat','Chaat & Street',15,2,'Aloo Tikki','2 Hy Fun Aloo Tikki;1/2 cup curd;2 tbsp green chutney;2 tbsp sweet chutney;Boiled chickpeas (optional);Chopped onion & tomato;Chaat masala;Sev','Shallow-fry the tikkis until crisp on both sides.|Break them into a bowl and add chickpeas.|Pour whisked curd and chutneys on top.|Add onion, tomato and chaat masala.|Finish with sev and coriander.'],
 ['XSCR4n1u1-I','Tikki Pav with Sabudana Patty','Chaat & Street',20,2,'Sabudana Patty','2 Hy Fun Sabudana Patties;2 pav;1 tbsp butter;Green chutney;Sliced onion;Chaat masala','Crisp the sabudana patties on a tawa.|Slit and butter the pav; toast until golden.|Spread green chutney inside.|Place the patty with onion and chaat masala.|Serve hot with extra chutney.'],
 ['uyHBpAge8VE','Mini Pizza with Burger Patty','Snacks',20,2,'Veg Burger Patty','2 Hy Fun Burger Patties;2 pizza base mini rounds;4 tbsp pizza sauce;1/2 cup mozzarella;Oregano;Capsicum & olives','Pre-heat oven to 200 °C.|Spread sauce on each mini base.|Crumble or slice the patty on top; add capsicum and olives.|Cover with mozzarella and oregano.|Bake 8–10 min until the cheese bubbles.'],
 ['hhduaZ2aPCY','Crispy Aloo Tikki Burger','Burgers',20,2,'Aloo Tikki','2 Hy Fun Crispy Aloo Tikki;2 buns;Lettuce;Cheese slices;Tandoori mayo;Tomato & onion','Shallow-fry the tikkis until crunchy.|Toast the buns.|Spread tandoori mayo.|Layer lettuce, tikki, cheese, tomato and onion.|Serve warm.'],
 ['1Bd5xLUqQSA','Cheesy Alfredo Fries','Fries & Loaded',20,3,'French Fries','300 g Hy Fun French Fries;1 tbsp butter;1 tbsp flour;1 cup milk;1/2 cup cheese;2 garlic cloves;Oregano & chilli flakes','Fry the fries until golden and keep warm.|Melt butter, sauté garlic, stir in flour for 1 min.|Whisk in milk; simmer until it thickens, add cheese.|Pour the Alfredo over the fries.|Top with oregano and chilli flakes.'],
 ['_d8XQsQCMDs','Loaded French Fries','Fries & Loaded',15,3,'French Fries','300 g Hy Fun French Fries;Cheese sauce;Chopped tomato & onion;Jalapeños;Mayo drizzle;Peri-peri seasoning','Fry the fries until crisp.|Toss with peri-peri seasoning.|Pour on warm cheese sauce.|Scatter tomato, onion and jalapeños; drizzle mayo.|Eat immediately.'],
 ['y49r8K0FlIk','Farali Misal with Sabudana Patty','Chaat & Street',25,2,'Sabudana Patty','2 Hy Fun Sabudana Patties;1 cup boiled potato cubes;1 tbsp roasted peanuts, crushed;1 tsp cumin;1 green chilli;Rock salt;Lemon juice;Coriander','Crisp the patties and break into pieces.|Sauté cumin and chilli in ghee; add potato cubes and rock salt.|Add a splash of water for a light gravy and simmer 5 min.|Pour over the patty pieces.|Top with peanuts, lemon and coriander.'],
 ['Q1tdQzbqs_A','Tandoori Mayo Patty Wrap','Wraps & Sandwiches',20,2,'Veg Burger Patty','2 Hy Fun Burger Patties;2 rotis or tortillas;3 tbsp tandoori mayo;Shredded cabbage;Sliced onion;Mint chutney','Fry the patties and cut into strips.|Warm the rotis on a tawa.|Spread tandoori mayo and chutney.|Add cabbage, onion and patty strips.|Roll tightly and toast for 30 sec per side.'],
 ['dbHuCXg0fKg','Veggie Sandwich with Burger Patty','Wraps & Sandwiches',15,2,'Veg Burger Patty','2 Hy Fun Burger Patties;4 bread slices;Butter;Cucumber & tomato slices;Cheese slice;Green chutney','Fry the patties until crisp.|Butter and toast the bread.|Spread chutney and layer vegetables.|Add patty and cheese.|Close, cut diagonally and serve.'],
 ['LZ67tlLmTVU','French Fry Grilled Cheese','Wraps & Sandwiches',15,1,'French Fries','1 handful Hy Fun French Fries;2 bread slices;2 cheese slices;1 tbsp butter;Ketchup','Fry the fries until crisp.|Butter the bread and place cheese inside.|Add a layer of fries.|Grill in a pan 2 min per side until the cheese melts.|Serve with ketchup.'],
 ['VonSgEfDY60','Aloo Tikki Bao','Wraps & Sandwiches',25,2,'Aloo Tikki','2 Hy Fun Aloo Tikki;4 bao buns;Hoisin or sweet chilli sauce;Pickled cucumber;Spring onion;Sesame seeds','Steam bao buns for 5 min until soft.|Crisp the Aloo Tikki and halve.|Brush bao with hoisin.|Fill with tikki, cucumber and spring onion.|Sprinkle sesame and serve.'],
 ['9ORluDj_aJ0','Ragda Patties','Chaat & Street',30,3,'Aloo Tikki','4 Hy Fun Aloo Tikki;1 cup dried white peas, soaked;1 onion;1 tomato;1 tsp turmeric;1 tsp garam masala;Chutneys;Sev','Pressure-cook peas with turmeric and salt until soft.|Sauté onion and tomato with garam masala; add peas and mash lightly.|Crisp the tikkis on a tawa.|Place tikkis in a bowl and ladle ragda over.|Top with chutneys, onion and sev.'],
 ['G-3saDM--II','Kung Pao Poppers','Asian Fusion',25,2,'Chilli Garlic Poppers','200 g Hy Fun Chilli Garlic Poppers;1 capsicum;1/4 cup peanuts;2 tbsp soy sauce;1 tbsp vinegar;1 tbsp sugar;Dried red chillies;Garlic','Fry the poppers until crisp.|Stir-fry garlic, dried chillies and capsicum on high heat.|Add soy, vinegar and sugar; reduce for a minute.|Toss in poppers and peanuts.|Serve hot with rice.'],
 ['_mgvuHZHp0g','Stir-Fried Poppers with Veggies','Asian Fusion',20,2,'Chilli Garlic Poppers','200 g Hy Fun Chilli Garlic Poppers;1 carrot;1 capsicum;1 onion;2 tbsp soy sauce;1 tsp chilli sauce;Spring onion','Fry the poppers until golden.|Stir-fry sliced vegetables on high flame for 2 min.|Add sauces and toss.|Fold in poppers.|Garnish with spring onion.'],
 ['NOz5bjbc9IE','Schezwan Rice Bowl','Asian Fusion',25,2,'Chilli Garlic Poppers','150 g Hy Fun Chilli Garlic Poppers;2 cups cooked rice;3 tbsp Schezwan sauce;Mixed veggies;Spring onion;Soy sauce','Fry the poppers until crisp.|Stir-fry vegetables, add rice and Schezwan sauce.|Season with soy sauce and toss on high heat.|Top with poppers.|Garnish with spring onion.'],
 ['j5Vii9oYzM8','Cheesy Garlic Baked Poppers','Snacks',25,3,'Chilli Garlic Poppers','200 g Hy Fun Chilli Garlic Poppers;1 cup marinara or pizza sauce;1 cup mozzarella;1 tsp garlic powder;Oregano;Parsley','Pre-heat oven to 200 °C.|Spread sauce in a baking dish.|Arrange poppers over it, sprinkle garlic powder.|Cover with mozzarella and oregano.|Bake 12 min until bubbly; add parsley.'],
 ['C_VdpC53k-s','Sticky Sesame Poppers','Asian Fusion',20,2,'Chilli Garlic Poppers','200 g Hy Fun Chilli Garlic Poppers;2 tbsp honey;2 tbsp soy sauce;1 tbsp sweet chilli sauce;1 tbsp sesame seeds;Garlic','Fry the poppers until crisp.|Simmer honey, soy, chilli sauce and garlic for 2 min.|Toss poppers in the sticky glaze.|Sprinkle sesame seeds.|Serve warm.'],
 ['U-6onm1uezA','Jalapeño Cheese Popper Skewers','Snacks',15,3,'Jalapeño Cheesy Pops','200 g Hy Fun Jalapeño Cheesy Pops;Cherry tomatoes;Cubed capsicum;Cubed paneer;Wooden skewers;Chilli mayo','Fry or air-fry the pops until golden.|Thread pops alternately with paneer, capsicum and tomato.|Grill 2 min for light char.|Serve with chilli mayo.|Great party starter.'],
 ['Wohh8XOnnnE','Alfredo Spicy Noodles','Asian Fusion',25,2,'Jalapeño Cheesy Pops','150 g Hy Fun Jalapeño Cheesy Pops;200 g noodles;1 cup milk;1 tbsp butter;1/2 cup cheese;Chilli flakes;Garlic','Boil noodles; drain.|Make a quick white sauce with butter, garlic, milk and cheese.|Toss noodles in the sauce with chilli flakes.|Fry the pops until golden.|Top the noodles with pops.'],
 ['4SeSEVyu_Dw','Desi Sabudana Chaat','Chaat & Street',15,2,'Sabudana Patty','2 Hy Fun Sabudana Patties;Curd;Green & tamarind chutney;Chopped onion;Pomegranate;Roasted cumin;Sev','Crisp the patties and break them up.|Add curd and chutneys.|Scatter onion and pomegranate.|Dust with roasted cumin.|Top with sev and serve.'],
 ['YSs3E4anIKg','Veggie Stix Hot Dog','Wraps & Sandwiches',15,2,'Veggie Stix','4 Hy Fun Veggie Stix;2 hot dog buns;Mustard;Ketchup;Onion rings;Cheese sauce','Fry the Veggie Stix until crisp.|Warm the hot dog buns.|Add 2 stix per bun.|Top with cheese sauce, mustard, ketchup and onions.|Serve immediately.'],
 ['cTWcfU79bQ8','Crunchy Taco','Snacks',20,2,'Jalapeño Cheesy Pops','6 Hy Fun Jalapeño Cheesy Pops;4 taco shells;Shredded lettuce;Salsa;Sour cream;Grated cheese','Fry the pops until crisp and crush lightly.|Warm the taco shells.|Fill with lettuce and pops.|Add salsa, sour cream and cheese.|Serve right away.'],
 ['8VgYNMsL32E','Veggie Stix Burrito','Wraps & Sandwiches',25,2,'Veggie Stix','6 Hy Fun Veggie Stix;2 large tortillas;1 cup cooked rice;1/2 cup beans;Salsa;Cheese;Sour cream','Fry the stix until crisp.|Warm tortillas on a pan.|Layer rice, beans, stix, salsa and cheese.|Fold in the sides and roll tightly.|Toast seam-side down 1 min.'],
 ['sMWZFYKTQuE','Aloo Cheese Frankie','Wraps & Sandwiches',20,2,'Potatobets','100 g Hy Fun Potatobets;2 rotis;Cheese slice;Onion;Tomato ketchup;Chaat masala','Fry the Potatobets until golden and toss with chaat masala.|Warm the rotis on a tawa.|Spread ketchup, add cheese, onion and Potatobets.|Roll into a frankie.|Toast for a minute and serve.'],
 ['l3hieG2kXLI','Cheesy Veg Quesadilla','Snacks',20,2,'Jalapeño Cheesy Pops','6 Hy Fun Jalapeño Cheesy Pops;2 tortillas;1 cup mozzarella;Sweet corn;Capsicum;Butter','Fry the pops and slice in halves.|Sprinkle cheese on half a tortilla; add corn, capsicum and pops.|Fold and toast in butter until crisp.|Cut into wedges.|Serve with salsa.'],
 ['ZGqVyUoZ5dM','Kimchi Twist','Asian Fusion',20,2,'Veggie Stix','6 Hy Fun Veggie Stix;1/2 cup kimchi, chopped;2 tbsp gochujang;1 tsp honey;Spring onion;Sesame seeds','Fry the stix until crisp.|Warm gochujang with honey and kimchi.|Toss stix in the sauce.|Garnish with spring onion and sesame.|Serve hot.']
];
HF.RECIPES = RC.map(r => ({ id: r[0], title: r[1], cat: r[2], mins: r[3], serves: r[4], product: r[5],
  ingredients: r[6].split(';'), steps: r[7].split('|') }));
