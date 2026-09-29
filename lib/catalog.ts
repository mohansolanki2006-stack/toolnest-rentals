export type Category = { name: string; slug: string; image: string; description: string; subs: string[] };
export const categories: Category[] = [
  { name:"Power Tools", slug:"power-tools", image:"https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=85", description:"Professional drilling, cutting, grinding and heavy-duty equipment.", subs:["Drilling & Breaking","Cutting & Sawing","Grinding & Sanding","Woodworking","Heavy-Duty Power Tools"] },
  { name:"Construction Equipment", slug:"construction", image:"https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=1200&q=85", description:"Heavy-duty equipment for concrete, compaction and active sites.", subs:["Concrete Equipment","Compaction Equipment","Cutting Equipment","Lifting Equipment","Site Equipment"] },
  { name:"Gardening & Outdoor", slug:"gardening", image:"/gardening-outdoor.jpg", description:"Powerful lawn, tree-cutting, spraying and digging equipment.", subs:["Lawn Equipment","Tree Cutting","Hedge & Garden Cutting","Spraying Equipment","Soil & Digging Equipment"] },
  { name:"Cleaning Equipment", slug:"cleaning", image:"https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85", description:"Industrial cleaning machines for demanding jobs and surfaces.", subs:["Pressure Washers","Industrial Vacuums","Floor Cleaning Machines","Floor Polishers"] },
  { name:"Welding & Fabrication", slug:"welding", image:"https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85", description:"Welding, cutting and fabrication equipment for professional work.", subs:["Welding Machines","Cutting Machines","Air Compressors","Fabrication Equipment"] },
  { name:"Electrical & Testing", slug:"electrical", image:"https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=85", description:"Professional diagnostic, cable-testing and laser instruments.", subs:["Electrical Testers","Cable Testing","Laser Measurement","Professional Measuring Equipment"] },
  { name:"Plumbing Equipment", slug:"plumbing", image:"https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=85", description:"Heavy-duty machines for pipes, drains and water movement.", subs:["Pipe Cutting","Drain Cleaning","Water Pumps","Pipe Threading","Professional Plumbing Machines"] },
  { name:"Painting & Surface", slug:"painting", image:"https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=85", description:"Sprayers, sanders and surface-preparation systems.", subs:["Paint Sprayers","Airless Spray Machines","Surface Sanders","Wall Sanders","Surface Preparation Equipment"] },
  { name:"Woodworking Equipment", slug:"woodworking", image:"https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=85", description:"Precision saws, planers and routers for serious woodworking.", subs:["Circular Saws","Mitre Saws","Table Saws","Planers","Routers","Professional Woodworking Machines"] },
  { name:"Other Professional Equipment", slug:"other", image:"https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1200&q=85", description:"Specialised equipment for occasional and demanding projects.", subs:["Heavy-Duty Ladders","Material Handling","Site Safety Equipment","Specialised Machines"] },
];
export type Tool = { name:string; brand:string; model:string; spec:string; price:number; deposit:number; shops:number; image:string };
export const equipmentNames: Record<string,string[]> = {
  "Drilling & Breaking":["Bosch Demolition Hammer","Makita Rotary Hammer","Hilti Core Drilling Machine","Bosch Cordless Drill Driver"], "Cutting & Sawing":["DeWalt Circular Saw","Makita Cut-Off Saw","Bosch Reciprocating Saw","Makita Jigsaw"], "Grinding & Sanding":["Bosch Angle Grinder","Makita Belt Sander","DeWalt Concrete Grinder"], "Woodworking":["Makita Electric Planer","Bosch Wood Router","DeWalt Biscuit Jointer"], "Heavy-Duty Power Tools":["Hilti Breaker TE 3000","Bosch Magnetic Drill","Makita Impact Wrench","DeWalt Cordless Impact Driver"],
  "Concrete Equipment":["Ajax Concrete Mixer","Wacker Concrete Vibrator","Hilti Concrete Scarifier","Walk-Behind Concrete Power Trowel"], "Compaction Equipment":["Wacker Plate Compactor","Honda Tamping Rammer","JCB Walk-Behind Roller"], "Cutting Equipment":["Husqvarna Concrete Cutter","Stihl Cut-Off Machine","Hilti Wall Saw","Electric Tile Cutting Machine"], "Lifting Equipment":["Hydraulic Material Lift","Electric Chain Hoist","Manual Pallet Stacker"], "Site Equipment":["Portable Site Generator","LED Site Light Tower","Industrial Dewatering Pump","Portable Electric Cement Mortar Mixer"],
  "Lawn Equipment":["Honda Petrol Lawn Mower","Bosch Electric Lawn Mower","Ride-On Lawn Tractor","Electric Lawn Scarifier"], "Tree Cutting":["Stihl Petrol Chainsaw","Husqvarna Pole Saw","Makita Electric Chainsaw","Garden Wood Chipper"], "Hedge & Garden Cutting":["Bosch Hedge Trimmer","Stihl Brush Cutter","Makita Grass Trimmer","Cordless Leaf Blower"], "Spraying Equipment":["Honda Power Sprayer","Kisan Battery Sprayer","Stihl Mist Blower"], "Soil & Digging Equipment":["Honda Earth Auger","Power Tiller Cultivator","Mini Trencher Machine"],
  "Pressure Washers":["Kärcher HD Pressure Washer","Bosch Professional Washer","Nilfisk Hot Water Washer","Pressure Washer Surface Cleaner"], "Industrial Vacuums":["Kärcher Wet & Dry Vacuum","Bosch Dust Extractor","Nilfisk Industrial Vacuum","Carpet Upholstery Extractor"], "Floor Cleaning Machines":["Kärcher Scrubber Dryer","Taski Auto Scrubber","Nilfisk Ride-On Sweeper","Professional Steam Cleaner"], "Floor Polishers":["Taski Single Disc Polisher","Kärcher Floor Polisher","Roots High-Speed Burnisher"],
  "Welding Machines":["Ador Inverter Welding Machine","ESAB MIG Welder","Rilon TIG Welding Machine","Portable Spot Welding Machine"], "Cutting Machines":["ESAB Plasma Cutter","Ador Gas Cutting Set","Rilon CNC Plasma Cutter"], "Air Compressors":["Elgi Portable Air Compressor","Ingersoll Rand Compressor","Chicago Pneumatic Compressor"], "Fabrication Equipment":["Hydraulic Pipe Bender","Magnetic Drill Press","Industrial Bench Grinder","Electric Sheet Metal Nibbler","Portable Metal Belt Linisher"],
  "Electrical Testers":["Fluke Digital Multimeter","Megger Insulation Tester","Kyoritsu Clamp Meter","Digital Phase Sequence Meter"], "Cable Testing":["Fluke Cable Analyzer","Megger Cable Fault Locator","Hioki Earth Tester","Network Cable Continuity Tester"], "Laser Measurement":["Bosch Laser Distance Meter","Leica Rotary Laser Level","Hilti Multi-Line Laser"], "Professional Measuring Equipment":["Total Station Survey Instrument","Digital Theodolite","Thermal Imaging Camera","Digital Concrete Moisture Meter"],
  "Pipe Cutting":["Ridgid Pipe Cutter","Bosch Pipe Saw","Orbital Pipe Cutting Machine","Cordless Plastic Pipe Shear"], "Drain Cleaning":["Ridgid Drain Cleaning Machine","Kärcher Sewer Jetting Machine","Electric Drain Snake"], "Water Pumps":["Kirloskar Dewatering Pump","Honda Petrol Water Pump","Submersible Sludge Pump"], "Pipe Threading":["Ridgid Pipe Threading Machine","Rothenberger Threader","Portable Pipe Grooving Machine"], "Professional Plumbing Machines":["Hydraulic Pipe Bender","Pipe Freezing Machine","Drain Inspection Camera","Manual Hydrostatic Pressure Test Pump","Hydraulic Pipe Crimping Tool"],
  "Paint Sprayers":["Bosch Professional Paint Sprayer","Wagner HVLP Sprayer","Graco Electric Sprayer","Electric Paint Mixing Drill"], "Airless Spray Machines":["Graco Airless Sprayer","Wagner Control Pro","Titan Impact Airless Sprayer"], "Surface Sanders":["Makita Orbital Sander","Bosch Belt Sander","Festool Random Orbit Sander"], "Wall Sanders":["Bosch Drywall Sander","Festool Planex Wall Sander","Makita Long-Reach Sander"], "Surface Preparation Equipment":["Concrete Shot Blaster","Floor Scarifier","Industrial Paint Stripper","Hot Air Heat Gun","Handheld Electric Wallpaper Steamer"],
  "Circular Saws":["DeWalt Circular Saw","Makita Track Saw","Bosch Plunge Saw"], "Mitre Saws":["Bosch Sliding Mitre Saw","DeWalt Compound Mitre Saw","Makita Dual-Bevel Mitre Saw"], "Table Saws":["DeWalt Jobsite Table Saw","Bosch Professional Table Saw","Makita Contractor Table Saw"], "Planers":["Makita Thickness Planer","DeWalt Portable Planer","Bosch Electric Hand Planer"], "Routers":["Bosch Plunge Router","Makita Trim Router","DeWalt Variable-Speed Router","Cordless Compact Palm Router"], "Professional Woodworking Machines":["Panel Saw Machine","Wood Spindle Moulder","Industrial Band Saw","Portable Oscillating Spindle Sander","Woodworking Biscuit Joiner"],
  "Heavy-Duty Ladders":["Industrial Extension Ladder","Aluminium Platform Ladder","Fibreglass Electrical Ladder"], "Material Handling":["Hydraulic Pallet Truck","Material Hoist","Heavy-Duty Hand Trolley","Furniture Moving Dolly Set"], "Site Safety Equipment":["Mobile Safety Barricade Set","Industrial Ventilation Blower","Portable Gas Detector","Portable Industrial Air Scrubber"], "Specialised Machines":["Thermal Fogging Machine","Industrial Tile Stripper","Pipe Inspection Camera","Manual Tile Cutter"]
};
const categoryBrands: Record<string,string[]> = {"power-tools":["Bosch","Makita","Hilti"],construction:["Wacker","Honda","JCB"],gardening:["Honda","Stihl","Husqvarna"],cleaning:["Kärcher","Nilfisk","Taski"],welding:["ESAB","Ador","Rilon"],electrical:["Fluke","Megger","Bosch"],plumbing:["Ridgid","Rothenberger","Kirloskar"],painting:["Graco","Wagner","Bosch"],woodworking:["DeWalt","Makita","Bosch"],other:["Genie","Kärcher","Ridgid"]};
function exactToolImage(name:string,index:number){ const host=["tse1","tse2","tse3"][index%3]; const query=encodeURIComponent(`${name} professional machine product`); return `https://${host}.mm.bing.net/th?q=${query}&w=900&h=600&c=7&rs=1&p=0`; }
// Budget presentation tariffs requested by the owner, not verified supplier quotes.
// Each tuple is [daily INR, refundable deposit INR].
// Reduced from the prior estimates; actual heavy-equipment hire may cost more.
// All prices and deposits require supplier confirmation.
const rentalTariffs:Record<string,[number,number][]>={
  "Drilling & Breaking": [
    [
      650,
      1000
    ],
    [
      400,
      500
    ],
    [
      1550,
      2000
    ],
    [
      300,
      500
    ]
  ],
  "Cutting & Sawing": [
    [
      400,
      500
    ],
    [
      700,
      1000
    ],
    [
      500,
      500
    ],
    [
      350,
      500
    ]
  ],
  "Grinding & Sanding": [
    [
      300,
      500
    ],
    [
      500,
      500
    ],
    [
      1250,
      1500
    ]
  ],
  "Woodworking": [
    [
      450,
      500
    ],
    [
      500,
      500
    ],
    [
      550,
      1000
    ]
  ],
  "Heavy-Duty Power Tools": [
    [
      1750,
      2000
    ],
    [
      1250,
      1500
    ],
    [
      500,
      500
    ],
    [
      400,
      1000
    ]
  ],
  "Concrete Equipment": [
    [
      3250,
      3500
    ],
    [
      550,
      1000
    ],
    [
      1750,
      2000
    ],
    [
      1500,
      2000
    ]
  ],
  "Compaction Equipment": [
    [
      1250,
      1500
    ],
    [
      1550,
      2000
    ],
    [
      2250,
      2500
    ]
  ],
  "Cutting Equipment": [
    [
      1750,
      2000
    ],
    [
      1250,
      1500
    ],
    [
      3000,
      3000
    ],
    [
      550,
      1000
    ]
  ],
  "Lifting Equipment": [
    [
      1750,
      2000
    ],
    [
      1050,
      1500
    ],
    [
      850,
      1000
    ]
  ],
  "Site Equipment": [
    [
      1250,
      1500
    ],
    [
      1950,
      2000
    ],
    [
      1250,
      1500
    ],
    [
      500,
      1000
    ]
  ],
  "Lawn Equipment": [
    [
      850,
      1000
    ],
    [
      550,
      1000
    ],
    [
      2250,
      2500
    ],
    [
      600,
      1000
    ]
  ],
  "Tree Cutting": [
    [
      800,
      1000
    ],
    [
      850,
      1000
    ],
    [
      500,
      500
    ],
    [
      1600,
      2000
    ]
  ],
  "Hedge & Garden Cutting": [
    [
      500,
      500
    ],
    [
      700,
      1000
    ],
    [
      450,
      500
    ],
    [
      350,
      500
    ]
  ],
  "Spraying Equipment": [
    [
      700,
      1000
    ],
    [
      200,
      500
    ],
    [
      850,
      1000
    ]
  ],
  "Soil & Digging Equipment": [
    [
      1050,
      1500
    ],
    [
      1550,
      2000
    ],
    [
      3250,
      3500
    ]
  ],
  "Pressure Washers": [
    [
      900,
      1000
    ],
    [
      700,
      1000
    ],
    [
      1750,
      2000
    ],
    [
      450,
      500
    ]
  ],
  "Industrial Vacuums": [
    [
      550,
      1000
    ],
    [
      700,
      1000
    ],
    [
      1250,
      1500
    ],
    [
      800,
      1000
    ]
  ],
  "Floor Cleaning Machines": [
    [
      1950,
      2000
    ],
    [
      1750,
      2000
    ],
    [
      3250,
      3500
    ],
    [
      650,
      1000
    ]
  ],
  "Floor Polishers": [
    [
      850,
      1000
    ],
    [
      1000,
      1000
    ],
    [
      1250,
      1500
    ]
  ],
  "Welding Machines": [
    [
      550,
      1000
    ],
    [
      1250,
      1500
    ],
    [
      1100,
      1500
    ],
    [
      800,
      1500
    ]
  ],
  "Cutting Machines": [
    [
      1550,
      2000
    ],
    [
      500,
      500
    ],
    [
      3500,
      3500
    ]
  ],
  "Air Compressors": [
    [
      850,
      1000
    ],
    [
      2250,
      2500
    ],
    [
      2000,
      2000
    ]
  ],
  "Fabrication Equipment": [
    [
      850,
      1000
    ],
    [
      1250,
      1500
    ],
    [
      350,
      500
    ],
    [
      450,
      1000
    ],
    [
      650,
      1000
    ]
  ],
  "Electrical Testers": [
    [
      350,
      500
    ],
    [
      850,
      1000
    ],
    [
      400,
      500
    ],
    [
      250,
      500
    ]
  ],
  "Cable Testing": [
    [
      2250,
      2500
    ],
    [
      3500,
      3500
    ],
    [
      1250,
      1500
    ],
    [
      200,
      500
    ]
  ],
  "Laser Measurement": [
    [
      300,
      500
    ],
    [
      1050,
      1500
    ],
    [
      800,
      1000
    ]
  ],
  "Professional Measuring Equipment": [
    [
      1750,
      2000
    ],
    [
      850,
      1000
    ],
    [
      2100,
      2500
    ],
    [
      350,
      500
    ]
  ],
  "Pipe Cutting": [
    [
      350,
      500
    ],
    [
      600,
      1000
    ],
    [
      2250,
      2500
    ],
    [
      300,
      500
    ]
  ],
  "Drain Cleaning": [
    [
      1250,
      1500
    ],
    [
      2250,
      2500
    ],
    [
      800,
      1000
    ]
  ],
  "Water Pumps": [
    [
      850,
      1000
    ],
    [
      900,
      1000
    ],
    [
      1250,
      1500
    ]
  ],
  "Pipe Threading": [
    [
      1550,
      2000
    ],
    [
      1400,
      1500
    ],
    [
      1950,
      2000
    ]
  ],
  "Professional Plumbing Machines": [
    [
      850,
      1000
    ],
    [
      2250,
      2500
    ],
    [
      1950,
      2000
    ],
    [
      450,
      1000
    ],
    [
      700,
      1000
    ]
  ],
  "Paint Sprayers": [
    [
      500,
      500
    ],
    [
      700,
      1000
    ],
    [
      1000,
      1000
    ],
    [
      300,
      500
    ]
  ],
  "Airless Spray Machines": [
    [
      1550,
      2000
    ],
    [
      1050,
      1500
    ],
    [
      1750,
      2000
    ]
  ],
  "Surface Sanders": [
    [
      350,
      500
    ],
    [
      500,
      500
    ],
    [
      700,
      1000
    ]
  ],
  "Wall Sanders": [
    [
      650,
      1000
    ],
    [
      1100,
      1500
    ],
    [
      800,
      1000
    ]
  ],
  "Surface Preparation Equipment": [
    [
      3500,
      3500
    ],
    [
      1750,
      2000
    ],
    [
      1550,
      2000
    ],
    [
      200,
      500
    ],
    [
      350,
      500
    ]
  ],
  "Circular Saws": [
    [
      400,
      500
    ],
    [
      800,
      1000
    ],
    [
      750,
      1000
    ]
  ],
  "Mitre Saws": [
    [
      750,
      1000
    ],
    [
      800,
      1000
    ],
    [
      900,
      1000
    ]
  ],
  "Table Saws": [
    [
      1050,
      1500
    ],
    [
      1100,
      1500
    ],
    [
      1250,
      1500
    ]
  ],
  "Planers": [
    [
      1250,
      1500
    ],
    [
      1100,
      1500
    ],
    [
      450,
      500
    ]
  ],
  "Routers": [
    [
      500,
      500
    ],
    [
      350,
      500
    ],
    [
      500,
      500
    ],
    [
      350,
      500
    ]
  ],
  "Professional Woodworking Machines": [
    [
      3250,
      3500
    ],
    [
      2250,
      2500
    ],
    [
      1750,
      2000
    ],
    [
      650,
      1000
    ],
    [
      450,
      1000
    ]
  ],
  "Heavy-Duty Ladders": [
    [
      400,
      500
    ],
    [
      500,
      500
    ],
    [
      600,
      1000
    ]
  ],
  "Material Handling": [
    [
      550,
      1000
    ],
    [
      1750,
      2000
    ],
    [
      200,
      500
    ],
    [
      250,
      500
    ]
  ],
  "Site Safety Equipment": [
    [
      500,
      500
    ],
    [
      800,
      1000
    ],
    [
      850,
      1000
    ],
    [
      1000,
      1500
    ]
  ],
  "Specialised Machines": [
    [
      850,
      1000
    ],
    [
      1550,
      2000
    ],
    [
      1950,
      2000
    ],
    [
      250,
      500
    ]
  ]
};
export function toolsFor(sub:string,category:Category):Tool[]{
  return (equipmentNames[sub]??[]).map((name,i)=>{
    const [price,deposit]=rentalTariffs[sub][i];
    return {name,brand:name.split(" ")[0]||categoryBrands[category.slug]?.[i]||"Professional",
      model:`TN-${category.slug.slice(0,3).toUpperCase()}-${101+i}`,
      spec:name==="Ajax Concrete Mixer"?"Self-loading mixer, approximately 2–2.5 m³; transport and operator arrangement required":
      `Professional-grade ${sub.toLowerCase()}${sub.toLowerCase().endsWith("equipment")?"":" equipment"}`,
      price,deposit,shops:50,image:exactToolImage(name,i)};
  });
}
const shopLocations:[string,string,string,number,number][] = [
  ["Toolnest Bhayandar Station","Bhayandar West","Station Road, Bhayandar West",19.3018,72.8517],
  ["Bhayandar Market Tools","Bhayandar West","B.P. Road, Bhayandar West",19.3074,72.8502],
  ["Golden Nest Equipment","Bhayandar East","Golden Nest Circle, Bhayandar East",19.3045,72.8652],
  ["Jesal Park Tool Hub","Bhayandar East","Jesal Park Road, Bhayandar East",19.3140,72.8661],
  ["Mira Road Rental Point","Mira Road East","Mira-Bhayandar Road, Mira Road East",19.2841,72.8713],
  ["Shanti Nagar Power Tools","Mira Road East","Shanti Nagar, Mira Road East",19.2808,72.8729],
  ["Kashimira Highway Tools","Kashimira","Western Express Highway, Kashimira",19.2800,72.8842],
  ["Dahisar Check Naka Rentals","Dahisar East","WEH Check Naka, Dahisar East",19.2670,72.8750],
  ["Dahisar Station Tool Centre","Dahisar West","L.T. Road, Dahisar West",19.2501,72.8592],
  ["Anand Nagar Equipment","Dahisar East","Anand Nagar, Dahisar East",19.2528,72.8728],
  ["Borivali IC Colony Tools","Borivali West","I.C. Colony Road, Borivali West",19.2470,72.8481],
  ["Borivali Station Rentals","Borivali West","S.V. Road, Borivali West",19.2307,72.8567],
  ["National Park Tool Point","Borivali East","WEH, National Park Junction",19.2290,72.8770],
  ["Kandivali Mahavir Nagar Tools","Kandivali West","Mahavir Nagar, Kandivali West",19.2117,72.8425],
  ["Kandivali Station Rentals","Kandivali West","S.V. Road, Kandivali West",19.2047,72.8518],
  ["Akurli Highway Power Tools","Kandivali East","Akurli Road, WEH Junction",19.2045,72.8777],
  ["Charkop Equipment Hub","Charkop","Charkop Market Road, Kandivali West",19.2140,72.8308],
  ["Malad Link Road Rentals","Malad West","Link Road, Malad West",19.1867,72.8484],
  ["Malad Station Tool Point","Malad West","S.V. Road, Malad West",19.1874,72.8480],
  ["Dindoshi Highway Tools","Malad East","WEH, Dindoshi Junction",19.1767,72.8732],
  ["Goregaon Motilal Nagar Tools","Goregaon West","M.G. Road, Goregaon West",19.1646,72.8444],
  ["Goregaon Station Rentals","Goregaon East","Station Road, Goregaon East",19.1663,72.8526],
  ["Aarey Highway Equipment","Goregaon East","WEH, Aarey Junction",19.1625,72.8710],
  ["Oshiwara Tool Market","Oshiwara","New Link Road, Oshiwara",19.1511,72.8330],
  ["Jogeshwari Highway Rentals","Jogeshwari East","WEH, Jogeshwari East",19.1365,72.8696],
  ["Jogeshwari West Tool Hub","Jogeshwari West","S.V. Road, Jogeshwari West",19.1360,72.8480],
  ["Andheri Lokhandwala Tools","Andheri West","Lokhandwala Complex, Andheri West",19.1432,72.8240],
  ["Andheri Station Rentals","Andheri West","S.V. Road, Andheri West",19.1197,72.8464],
  ["Andheri MIDC Equipment","Andheri East","MIDC Central Road, Andheri East",19.1197,72.8691],
  ["Chakala Highway Tool Point","Chakala","WEH, Chakala Junction",19.1115,72.8723],
  ["Vile Parle Market Tools","Vile Parle West","Bajaj Road, Vile Parle West",19.0990,72.8420],
  ["Vile Parle Highway Rentals","Vile Parle East","WEH, Vile Parle East",19.0974,72.8628],
  ["Santacruz Station Tools","Santacruz West","S.V. Road, Santacruz West",19.0811,72.8414],
  ["Vakola Highway Equipment","Santacruz East","WEH, Vakola Junction",19.0815,72.8657],
  ["Khar Tool Rental Point","Khar West","Linking Road, Khar West",19.0690,72.8357],
  ["Bandra Linking Road Tools","Bandra West","Linking Road, Bandra West",19.0596,72.8295],
  ["Bandra Highway Equipment","Bandra East","WEH, Kalanagar Junction",19.0551,72.8497],
  ["Mahim Tool Station","Mahim West","L.J. Road, Mahim West",19.0415,72.8415],
  ["Dharavi Industrial Tools","Dharavi","90 Feet Road, Dharavi",19.0435,72.8553],
  ["Dadar West Rentals","Dadar West","Senapati Bapat Marg, Dadar West",19.0178,72.8478],
  ["Dadar East Tool Centre","Dadar East","Dr Ambedkar Road, Dadar East",19.0182,72.8561],
  ["Prabhadevi Equipment Point","Prabhadevi","Gokhale Road, Prabhadevi",19.0135,72.8271],
  ["Worli Naka Tool Hub","Worli","Dr Annie Besant Road, Worli",18.9986,72.8174],
  ["Lower Parel Industrial Tools","Lower Parel","N.M. Joshi Marg, Lower Parel",18.9960,72.8306],
  ["Mahalaxmi Tool Rentals","Mahalaxmi","Dr E. Moses Road, Mahalaxmi",18.9821,72.8236],
  ["Tardeo Equipment Centre","Tardeo","Tardeo Road, Mumbai",18.9724,72.8146],
  ["Grant Road Tool Market","Grant Road","Lamington Road, Grant Road",18.9644,72.8159],
  ["Marine Lines Equipment","Marine Lines","Princess Street, Marine Lines",18.9449,72.8246],
  ["Fort Professional Tools","Fort","D.N. Road, Fort, Mumbai",18.9388,72.8354],
  ["Toolnest Churchgate Centre","Churchgate","Veer Nariman Road, Churchgate",18.9322,72.8264],
];
export const shops = shopLocations.map(([name,area,address,lat,lng],index)=>({
  name,area,address,lat,lng,
  distance:index===0?"0.8 km":`${Math.round(index*.9+1)} km`,
  rating:Number((4.5+(index%5)*.1).toFixed(1)),
  hours:index%3===0?"8:30 AM – 8:00 PM":index%3===1?"9:00 AM – 8:00 PM":"9:00 AM – 7:30 PM",
  price:0, // Location template only; attach tool pricing with quoteShop before display.
  deposit:0,
}));
export function quoteShop(shop:(typeof shops)[number],tool:Tool){
  // Identical indicative base at each location until actual supplier quotes exist.
  return {...shop,price:tool.price,deposit:tool.deposit};
}

export type Shop = (typeof shops)[number];
export const allTools = categories.flatMap(category => category.subs.flatMap(sub => toolsFor(sub, category)));
