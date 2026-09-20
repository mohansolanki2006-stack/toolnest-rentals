"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, MapPin, Menu, X, Star, ArrowRight, ChevronLeft, CalendarDays, Clock, ShieldCheck, Wrench, CheckCircle2, Navigation, Phone, Mail, LocateFixed, UserRound, LogOut } from "lucide-react";

type Category = { name: string; slug: string; image: string; description: string; subs: string[] };
const categories: Category[] = [
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
type Tool = { name:string; brand:string; model:string; spec:string; price:number; deposit:number; shops:number; image:string };
const equipmentNames: Record<string,string[]> = {
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
function toolsFor(sub:string,category:Category):Tool[]{
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
const shops = shopLocations.map(([name,area,address,lat,lng],index)=>({
  name,area,address,lat,lng,
  distance:index===0?"0.8 km":`${Math.round(index*.9+1)} km`,
  rating:Number((4.5+(index%5)*.1).toFixed(1)),
  hours:index%3===0?"8:30 AM – 8:00 PM":index%3===1?"9:00 AM – 8:00 PM":"9:00 AM – 7:30 PM",
  price:0, // Location template only; attach tool pricing with quoteShop before display.
  deposit:0,
}));
function quoteShop(shop:(typeof shops)[number],tool:Tool){
  // Identical indicative base at each location until actual supplier quotes exist.
  return {...shop,price:tool.price,deposit:tool.deposit};
}
function PricingNote(){
  return <p className="mt-3 text-xs leading-5 text-slate-500">Budget rental and refundable deposit estimates, subject to shop confirmation and exact machine capacity. Actual supplier rates, especially for heavy equipment, may be higher. Daily rate assumes up to 8 operating hours. GST, transport, fuel, operator and consumables are extra where applicable; these are not included in the displayed total. Heavy/stationary machines require delivery or on-site arrangements.</p>;
}
type View = "home"|"subcategories"|"tools"|"detail"|"booking"|"confirmed"|"auth"|"dashboard";
// Keep the original day-number epoch so saved bookings retain their dates.
const RENTAL_EPOCH=Date.UTC(2026,8,1);
const DAY_MS=86400000;
const pickupSlots=["10:00 AM – 11:00 AM","11:00 AM – 12:00 PM","12:00 PM – 1:00 PM","2:00 PM – 3:00 PM","3:00 PM – 4:00 PM","4:00 PM – 5:00 PM"];
function getRentalCalendar(now:number){
  const india=new Date(now+330*60*1000);
  const year=india.getUTCFullYear(),month=india.getUTCMonth();
  const today=Math.floor((Date.UTC(year,month,india.getUTCDate())-RENTAL_EPOCH)/DAY_MS)+1;
  const months=Array.from({length:3},(_,i)=>{
    const first=new Date(Date.UTC(year,month+i,1));
    return {name:first.toLocaleDateString("en-GB",{month:"long",year:"numeric",timeZone:"UTC"}),
      days:new Date(Date.UTC(year,month+i+1,0)).getUTCDate(),
      offset:Math.floor((first.getTime()-RENTAL_EPOCH)/DAY_MS),
      weekday:(first.getUTCDay()+6)%7};
  });
  return {today,months,lastDay:months[2].offset+months[2].days};
}
// Stable sample availability: four reserved days per month for each tool/shop.
function isSampleBooked(day:number,toolName:string,shopName:string){
  const date=new Date(RENTAL_EPOCH+(day-1)*DAY_MS);
  const key=`${toolName}|${shopName}|${date.getUTCFullYear()}-${date.getUTCMonth()}`;
  const hash=Array.from(key).reduce((value,char)=>(value*31+char.charCodeAt(0))>>>0,0);
  return [5+hash%3,12+(hash>>>3)%3,20+(hash>>>6)%3,26+(hash>>>9)%3].includes(date.getUTCDate());
}
function isRentalDayBooked(day:number,toolName:string,shopName:string,bookings:Booking[]){
  return isSampleBooked(day,toolName,shopName)||bookings.some(b=>
    b.tool.name===toolName&&b.shop.name===shopName&&
    (b.status==="upcoming"||b.status==="active")&&day>=b.start&&day<=b.end);
}
function rentalRangeFree(start:number|null,end:number|null,isBooked:(day:number)=>boolean){
  if(start===null||end===null||end<start)return false;
  for(let day=start;day<=end;day++)if(isBooked(day))return false;
  return true;
}
function validRentalSelection(start:number|null,end:number|null,pickup:string,now:number){
  const calendar=getRentalCalendar(now);
  return start!==null&&end!==null&&start>=calendar.today&&end>=start&&end<=calendar.lastDay&&
    pickupSlots.includes(pickup)&&pickupTimestamp({start,pickup})>now;
}
function formatRentalDate(value:number|null){if(value===null)return "Select date";return new Date(Date.UTC(2026,8,value)).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"});}
type RentalStatus="upcoming"|"active"|"previous"|"cancelled";
type Booking={id:string;tool:Tool;shop:(typeof shops)[number];start:number;end:number;pickup:string;days:number;status:RentalStatus;demo?:boolean};
const dashboardTabs:[string,RentalStatus][]=[["Upcoming Rentals","upcoming"],["Active Rentals","active"],["Previous Rentals","previous"],["Cancelled Bookings","cancelled"]];

// Pickup times are Mumbai time, regardless of the visitor's device timezone.
function pickupTimestamp(booking:Pick<Booking,"start"|"pickup">){
  const match=booking.pickup.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if(!match)return NaN;
  const hour=Number(match[1])%12+(match[3].toUpperCase()==="PM"?12:0);
  return Date.UTC(2026,8,booking.start,hour,Number(match[2]))-330*60*1000;
}
function canCancelBooking(booking:Booking,now=Date.now()){
  return booking.status==="upcoming"&&now<pickupTimestamp(booking);
}
function extraDemoBookings():Booking[]{
  const indiaToday=new Date(Date.now()+330*60*1000);
  const today=Math.floor((Date.UTC(indiaToday.getUTCFullYear(),indiaToday.getUTCMonth(),indiaToday.getUTCDate())-Date.UTC(2026,8,1))/86400000)+1;
  return (["active","previous","cancelled"] as const).flatMap((status,index)=>[0,1].map(i=>{
    const start=today+(status==="active"?-1-i:status==="previous"?-12-i:5+i);
    const end=start+3;
    return {id:`TN-DEMO-V2-${status}-${i+1}`,tool:toolsFor("Drilling & Breaking",categories[0])[i],shop:shops[index*10+i],start,end,pickup:"10:00 AM – 11:00 AM",days:4,status,demo:true};
  })).map(booking=>({...booking,shop:quoteShop(booking.shop,booking.tool)}));
}

export default function Home() {
  const [view,setView]=useState<View>("home");
  const [selectedCategory,setSelectedCategory]=useState(categories[0]);
  const [selectedSub,setSelectedSub]=useState("Drilling & Breaking");
  const [selectedTool,setSelectedTool]=useState<Tool>(toolsFor("Drilling & Breaking",categories[0])[0]);
  const [selectedShop,setSelectedShop]=useState(quoteShop(shops[0],toolsFor("Drilling & Breaking",categories[0])[0]));
  const [startDay,setStartDay]=useState<number|null>(null);
  const [endDay,setEndDay]=useState<number|null>(null);
  const [pickup,setPickup]=useState("10:00 AM – 11:00 AM");
  const [calendarMonth,setCalendarMonth]=useState(0);
  const [search,setSearch]=useState("");
  const [menu,setMenu]=useState(false);
  const [shopView,setShopView]=useState<"list"|"map">("list");
  const [authMode,setAuthMode]=useState<"login"|"signup">("login");
  const [loggedIn,setLoggedIn]=useState(false);
  const [bookings,setBookings]=useState<Booking[]>([]);
  const [viewedBooking,setViewedBooking]=useState<Booking|null>(null);
  const [bookingNotice,setBookingNotice]=useState("");
  const [clock,setClock]=useState(0);
  useEffect(()=>{
    const update=()=>setClock(Date.now());
    const timer=window.setInterval(update,30000);
    window.addEventListener("focus",update);
    document.addEventListener("visibilitychange",update);
    update();
    return()=>{window.clearInterval(timer);window.removeEventListener("focus",update);document.removeEventListener("visibilitychange",update)};
  },[]);
  const calendar=getRentalCalendar(clock);
  const rentalMonths=calendar.months;
  const isBooked=(day:number)=>isRentalDayBooked(day,selectedTool.name,selectedShop.name,bookings);
  const bookingReady=clock>0&&validRentalSelection(startDay,endDay,pickup,clock)&&rentalRangeFree(startDay,endDay,isBooked);
  const [calendarError,setCalendarError]=useState("");
  useEffect(()=>{setCalendarMonth(0)},[rentalMonths[0].offset]);
  const [dashboardTab,setDashboardTab]=useState<RentalStatus>("upcoming");
  const pricedShops=useMemo(()=>shops.map(shop=>quoteShop(shop,selectedTool)),[selectedTool]);
  const currentTools=useMemo(()=>toolsFor(selectedSub,selectedCategory),[selectedSub,selectedCategory]);
  const days=startDay&&endDay?endDay-startDay+1:0;
  const filtered=useMemo(()=>categories.filter(c=>`${c.name} ${c.description} ${c.subs.join(" ")} ${c.subs.flatMap(sub=>equipmentNames[sub]??[]).join(" ")}`.toLowerCase().includes(search.toLowerCase())),[search]);
  const goHome=()=>{setView("home");scrollTo(0,0)};
  useEffect(()=>{
    setLoggedIn(localStorage.getItem("toolnest-demo-login")==="true");
    try{
      const saved=localStorage.getItem("toolnest-demo-bookings");
      if(saved){
        const existing:Booking[]=JSON.parse(saved);
        if(!Array.isArray(existing))throw new Error("Invalid bookings");
        const next=[...existing,...extraDemoBookings().filter(d=>!existing.some(b=>b.id===d.id))];
        setBookings(next);localStorage.setItem("toolnest-demo-bookings",JSON.stringify(next));return;
      }
    }catch{}
    const demo:Booking[]=[
      {id:"TN-DEMO-1",tool:toolsFor("Drilling & Breaking",categories[0])[0],shop:shops[0],start:18,end:21,pickup:"10:00 AM – 11:00 AM",days:4,status:"upcoming"},
      {id:"TN-DEMO-2",tool:toolsFor("Cutting & Sawing",categories[0])[0],shop:shops[12],start:28,end:33,pickup:"2:00 PM – 3:00 PM",days:6,status:"upcoming"},
      {id:"TN-DEMO-3",tool:toolsFor("Paint Sprayers",categories[7])[0],shop:shops[28],start:39,end:42,pickup:"11:00 AM – 12:00 PM",days:4,status:"upcoming"},
    ];
    const initial=[...demo.map(b=>({...b,shop:quoteShop(b.shop,b.tool)})),...extraDemoBookings()];setBookings(initial);localStorage.setItem("toolnest-demo-bookings",JSON.stringify(initial));
  },[]);
  const cancelBooking=(id:string)=>{
    const booking=bookings.find(b=>b.id===id);
    if(!booking||!canCancelBooking(booking)){setBookingNotice("This booking cannot be cancelled because its pickup time has passed.");return;}
    if(!window.confirm(`Cancel ${booking.tool.name} booking ${booking.id}?`))return;
    if(!canCancelBooking(booking)){setBookingNotice("Pickup time has passed. Cancellation is no longer available.");return;}
    const next=bookings.map(b=>b.id===id?{...b,status:"cancelled" as const}:b);
    try{localStorage.setItem("toolnest-demo-bookings",JSON.stringify(next));}
    catch{setBookingNotice("Could not save the cancellation. Please try again.");return;}
    setBookings(next);
    setBookingNotice("Booking cancelled. You can find it in Cancelled Bookings.");
  };
  const completeDemoLogin=()=>{localStorage.setItem("toolnest-demo-login","true");setLoggedIn(true);setView("dashboard");scrollTo(0,0)};
  const logout=()=>{localStorage.removeItem("toolnest-demo-login");setLoggedIn(false);setView("home");scrollTo(0,0)};
  const confirmBooking=()=>{
    if(!validRentalSelection(startDay,endDay,pickup,Date.now())||!rentalRangeFree(startDay,endDay,isBooked)){
      setClock(Date.now());setCalendarError("Choose an available date range without booked days and a pickup time that has not passed.");return;
    }
    if(startDay===null||endDay===null)return;
    setCalendarError("");
    const booking:Booking={id:`TN-MUM-${Date.now().toString().slice(-6)}`,tool:selectedTool,shop:selectedShop,start:startDay,end:endDay,pickup,days,status:"upcoming"};
    setBookings(current=>{const next=[booking,...current];localStorage.setItem("toolnest-demo-bookings",JSON.stringify(next));return next});
    setViewedBooking(booking);setDashboardTab("upcoming");setView("confirmed");scrollTo(0,0);
  };
  const getDirections=()=>{
    const mapsTab=window.open("about:blank","_blank");
    const openRoute=(origin?:string)=>{
      const destination=`${selectedShop.lat},${selectedShop.lng}`;
      const url=`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving${origin?`&origin=${encodeURIComponent(origin)}`:""}`;
      if(mapsTab)mapsTab.location.href=url;else window.location.href=url;
    };
    if(!navigator.geolocation){openRoute();return;}
    navigator.geolocation.getCurrentPosition(
      position=>openRoute(`${position.coords.latitude},${position.coords.longitude}`),
      ()=>openRoute(),
      {enableHighAccuracy:true,timeout:10000,maximumAge:60000}
    );
  };
  const nav=(id:string)=>{setMenu(false);if(view!=="home")setView("home");setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"}),30)};
  return <main className="min-h-screen bg-white text-slate-900">
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <button onClick={goHome} className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-blue-700"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white"><Wrench size={20}/></span>Toolnest</button>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex"><button onClick={goHome}>Home</button><button onClick={()=>nav("categories")}>Categories</button><button onClick={()=>nav("about")}>About</button><button onClick={()=>nav("how")}>How It Works</button><button onClick={()=>nav("contact")}>Contact</button></nav>
        <div className="hidden items-center gap-2 md:flex">{loggedIn?<><button onClick={()=>setView("dashboard")} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-blue-700"><UserRound size={18}/> My Dashboard</button><button onClick={logout} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600"><LogOut size={17}/> Logout</button></>:<button onClick={()=>setView("auth")} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-blue-700"><UserRound size={18}/> Login</button>}<button onClick={()=>nav("categories")} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">Find My Tool</button></div>
        <div className="flex items-center gap-2 md:hidden"><button aria-label={loggedIn?"Open dashboard":"Login"} onClick={()=>setView(loggedIn?"dashboard":"auth")} className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><UserRound size={20}/></button><button onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div>
      </div>
      {menu&&<div className="grid gap-1 border-t p-4 font-semibold md:hidden">{[["Home","home"],["Categories","categories"],["About","about"],["How It Works","how"],["Contact","contact"]].map(([label,id])=><button key={id} onClick={()=>id==="home"?goHome():nav(id)} className="rounded-lg px-3 py-3 text-left hover:bg-blue-50">{label}</button>)}<button onClick={()=>{setMenu(false);setView(loggedIn?"dashboard":"auth")}} className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-blue-700 hover:bg-blue-50"><UserRound size={18}/>{loggedIn?"My Dashboard":"Login"}</button>{loggedIn&&<button onClick={()=>{setMenu(false);logout()}} className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-red-600 hover:bg-red-50"><LogOut size={18}/>Logout</button>}</div>}
    </header>
    {view==="home"&&<>
      <section className="hero-grid overflow-hidden bg-slate-950 text-white"><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24"><div><span className="mb-5 inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200">Professional tools. Local pickup. Fair daily prices.</span><h1 className="text-5xl font-black leading-[1.03] tracking-tight sm:text-6xl">Borrow Tools.<br/><span className="text-blue-400">Build Together.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Rent professional equipment from trusted nearby shops without the cost of buying it for one project.</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={()=>nav("categories")} className="rounded-xl bg-blue-500 px-5 py-3.5 font-bold">Find My Tool</button><button onClick={()=>nav("categories")} className="rounded-xl border border-slate-600 px-5 py-3.5 font-bold">Browse Categories</button><button onClick={()=>nav("categories")} className="flex items-center gap-2 rounded-xl border border-slate-600 px-5 py-3.5 font-bold"><LocateFixed size={18}/> Find Near Me</button></div></div><div className="rounded-3xl border border-white/10 bg-white/8 p-5 shadow-2xl backdrop-blur"><div className="rounded-2xl bg-white p-5 text-slate-900"><p className="mb-3 font-bold">What tool do you need?</p><div className="flex items-center gap-3 rounded-xl border-2 border-blue-100 bg-slate-50 px-4"><Search className="text-blue-600"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try “wall drilling” or “Bosch”" className="h-14 min-w-0 flex-1 bg-transparent outline-none"/><button onClick={()=>nav("categories")} className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white">Search</button></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><Stat n="10" label="Categories"/><Stat n="50" label="Local shops"/><Stat n="₹200" label="Estimated from / day"/></div></div></div></div></section>
      <section id="categories" className="scroll-mt-24 py-18"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">EQUIPMENT DIRECTORY</p><h2 className="section-title">Browse by Category</h2><p className="mt-2 text-slate-600">Select a category to view professional tool options and local availability.</p></div><span className="text-sm font-semibold text-slate-500">{filtered.length} categories</span></div><div className="grid gap-7 md:grid-cols-2">{filtered.map(c=><button key={c.slug} onClick={()=>{setSelectedCategory(c);setView("subcategories");scrollTo(0,0)}} className="category-card group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="overflow-hidden"><img src={c.image} alt={c.name} className="h-[260px] w-full object-cover transition duration-300 group-hover:scale-[1.04]"/></div><div className="flex items-center justify-between gap-5 p-6"><div><h3 className="text-xl font-extrabold">{c.name}</h3><p className="mt-1.5 text-[15px] leading-6 text-slate-600">{c.description}</p></div><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700"><ArrowRight size={20}/></span></div></button>)}</div></div></section>
      <section id="about" className="scroll-mt-20 bg-slate-50 py-18"><div className="mx-auto max-w-7xl px-5 lg:px-8"><p className="eyebrow">OUR PURPOSE</p><h2 className="section-title">About Toolnest</h2><p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600">Toolnest is a local tool rental marketplace created to make professional tools more accessible and affordable. Instead of buying expensive equipment for one-time or short-term use, customers can browse tool categories, find nearby rental shops, check availability, and reserve tools online. Toolnest helps homeowners, workers, contractors, technicians and small businesses get the right equipment when they need it while reducing the cost of purchasing rarely used tools.</p><div className="mt-10 grid gap-5 md:grid-cols-3"><Feature icon={<CalendarDays/>} title="Affordable Daily Rentals" text="Pay only for the days you need."/><Feature icon={<MapPin/>} title="Nearby Tool Shops" text="Compare trusted local partners."/><Feature icon={<CheckCircle2/>} title="Easy Booking & Pickup" text="Reserve online and collect locally."/></div></div></section>
      <section id="how" className="scroll-mt-20 py-18"><div className="mx-auto max-w-7xl px-5 lg:px-8"><p className="eyebrow">SIMPLE LOCAL RENTAL</p><h2 className="section-title">How It Works</h2><div className="mt-10 grid gap-5 md:grid-cols-4">{[["01","Find a Tool","Browse professional equipment."],["02","Choose Nearby Shop","Compare distance, price and rating."],["03","Select Rental Dates","Choose available days and pickup time."],["04","Pick Up & Return","Collect locally and return after use."]].map(x=><div key={x[0]} className="rounded-2xl border border-slate-200 p-6"><span className="text-sm font-black text-blue-600">{x[0]}</span><h3 className="mt-5 text-lg font-extrabold">{x[1]}</h3><p className="mt-2 text-slate-600">{x[2]}</p></div>)}</div></div></section>
      <section id="contact" className="scroll-mt-20 bg-blue-700 py-18 text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="text-sm font-bold tracking-widest text-blue-200">CONTACT</p><h2 className="mt-3 text-4xl font-black">How can we help?</h2><p className="mt-4 max-w-md text-blue-100">Questions about a tool, shop or booking? Send us a message and our support team will help.</p><div className="mt-8 space-y-3 text-blue-100"><p className="flex items-center gap-3"><Mail size={18}/> support@toolnest.in</p><p className="flex items-center gap-3"><Phone size={18}/> +91 90000 00000</p></div></div><form onSubmit={e=>e.preventDefault()} className="grid gap-4 rounded-2xl bg-white p-6 text-slate-900 sm:grid-cols-2"><input className="field" placeholder="Name"/><input className="field" placeholder="Email"/><input className="field" placeholder="Phone"/><input className="field" placeholder="City"/><textarea className="field min-h-28 sm:col-span-2" placeholder="Message"/><button className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white sm:col-span-2">Submit Message</button></form></div></section>
    </>}
    {view==="subcategories"&&<PageShell title={selectedCategory.name} crumb="Categories" onBack={goHome} intro="Choose the type of work to see available professional equipment."><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{selectedCategory.subs.map((s,i)=><button key={s} onClick={()=>{setSelectedSub(s);setView("tools");scrollTo(0,0)}} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:border-blue-300 hover:shadow-lg"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 font-black text-blue-700">0{i+1}</span><h3 className="mt-8 text-xl font-extrabold">{s}</h3><p className="mt-2 text-slate-600">Professional equipment available from nearby Toolnest partners.</p><span className="mt-6 flex items-center gap-2 font-bold text-blue-700">Browse tools <ArrowRight size={17}/></span></button>)}</div></PageShell>}
    {view==="tools"&&<PageShell title={selectedSub} crumb={selectedCategory.name} onBack={()=>setView("subcategories")} intro="Compare tool-specific indicative daily rental prices and nearby locations."><PricingNote/><div className="grid gap-6 lg:grid-cols-3">{currentTools.map(t=><article key={t.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><img src={t.image} alt={t.name} className="h-52 w-full bg-white object-contain p-3"/><div className="p-5"><div className="flex items-center justify-between"><span className="text-sm font-bold text-blue-700">{t.brand}</span><span className="available">Available</span></div><h3 className="mt-3 text-xl font-extrabold leading-7">{t.name}</h3><p className="mt-2 text-sm text-slate-500">{t.spec}</p><div className="mt-5 flex items-end justify-between"><div><p className="text-2xl font-black">₹{t.price.toLocaleString("en-IN")}<span className="text-sm font-semibold text-slate-500">/day</span></p><p className="text-xs text-slate-500">₹{t.deposit.toLocaleString("en-IN")} refundable deposit</p></div><p className="text-sm font-semibold text-slate-600">{t.shops} shops</p></div><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={()=>{setSelectedTool(t);setSelectedShop(quoteShop(shops[0],t));setView("detail");scrollTo(0,0)}} className="rounded-xl border border-slate-300 px-3 py-3 font-bold">View Tool</button><button onClick={()=>{setSelectedTool(t);setSelectedShop(quoteShop(shops[0],t));setView("detail");scrollTo(0,0)}} className="rounded-xl bg-blue-600 px-3 py-3 font-bold text-white">Book Now</button></div></div></article>)}</div></PageShell>}
    {view==="detail"&&<PageShell title={selectedTool.name} crumb={selectedSub} onBack={()=>setView("tools")} intro="Select a nearby shop, then choose your rental dates."><PricingNote/><div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]"><div><img src={selectedTool.image} alt={selectedTool.name} className="h-[390px] w-full rounded-2xl border border-slate-200 bg-white object-contain p-4"/><div className="mt-5 grid grid-cols-3 gap-3"><Spec label="Brand" value={selectedTool.brand}/><Spec label="Model" value={selectedTool.model}/><Spec label="Category" value={selectedSub}/></div><div className="mt-6 rounded-2xl bg-blue-50 p-5"><p className="font-extrabold text-blue-900">Pickup from Shop</p><p className="mt-1 text-sm text-blue-800">Reserve online, then collect the verified tool from your selected local partner.</p></div></div><div><div className="mb-5 flex items-center justify-between"><div><h2 className="text-2xl font-black">Available Near You</h2><p className="text-slate-500">Bhayandar to Churchgate · 50 city and highway pickup points</p></div><div className="flex rounded-xl bg-slate-100 p-1 text-sm font-bold"><button onClick={()=>setShopView("list")} className={`rounded-lg px-4 py-2 ${shopView==="list"?"bg-white text-slate-900 shadow-sm":"text-slate-500"}`}>List</button><button onClick={()=>setShopView("map")} className={`rounded-lg px-4 py-2 ${shopView==="map"?"bg-white text-blue-700 shadow-sm":"text-slate-500"}`}>Map</button></div></div>{shopView==="map"&&<div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><InteractiveShopMap shopOptions={pricedShops} selectedShop={selectedShop} onSelect={setSelectedShop}/><div className="grid gap-2 border-t p-4 sm:grid-cols-3">{pricedShops.map(s=><button key={s.name} onClick={()=>setSelectedShop(s)} className={`rounded-xl border p-3 text-left ${selectedShop.name===s.name?"border-blue-500 bg-blue-50":"border-slate-200"}`}><span className="block font-extrabold">{s.name}</span><span className="mt-1 block text-xs text-slate-500">{s.area} · {s.distance}</span></button>)}</div></div>}<div className="space-y-4">{pricedShops.map(s=><button key={s.name} onClick={()=>{setSelectedShop(s);setStartDay(null);setEndDay(null);setCalendarMonth(0);setCalendarError("");setClock(Date.now());setView("booking");scrollTo(0,0)}} className="w-full rounded-2xl border border-slate-200 p-5 text-left hover:border-blue-400 hover:shadow-md"><div className="flex justify-between gap-4"><div><h3 className="text-lg font-extrabold">{s.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-600"><MapPin size={15}/>{s.area} · {s.distance}</p><p className="mt-1 text-xs text-slate-500">{s.hours}</p></div><span className="flex h-fit items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold"><Star size={14} className="fill-amber-400 text-amber-400"/>{s.rating}</span></div><div className="mt-5 flex items-end justify-between border-t pt-4"><div><span className="text-xl font-black">₹{s.price.toLocaleString("en-IN")}/day</span><p className="text-xs text-slate-500">₹{s.deposit.toLocaleString("en-IN")} refundable deposit</p></div><span className="rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white">Select Shop</span></div></button>)}</div></div></div></PageShell>}
    {view==="booking"&&<PageShell title="Choose your rental dates" crumb={selectedShop.name} onBack={()=>setView("detail")} intro="Choose dates in the current month or next two months. Past dates and elapsed pickup times are unavailable (Mumbai time)."><div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]"><section className="rounded-2xl border border-slate-200 p-5 sm:p-7"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">{rentalMonths[calendarMonth].name}</h2><p className="mt-1 text-sm text-slate-500">{endDay?"Rental range selected":"Click a start date, then click a return date"}</p></div><div className="flex gap-2"><button aria-label="Previous month" disabled={calendarMonth===0} onClick={()=>setCalendarMonth(m=>Math.max(0,m-1))} className="cal-nav disabled:opacity-30"><ChevronLeft size={18}/></button><button aria-label="Next month" disabled={calendarMonth===2} onClick={()=>setCalendarMonth(m=>Math.min(2,m+1))} className="cal-nav rotate-180 disabled:opacity-30"><ChevronLeft size={18}/></button></div></div><div className="mt-5 grid grid-cols-7 text-center text-xs font-bold text-slate-400">{["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d=><span key={d}>{d}</span>)}</div><div className="mt-3 grid grid-cols-7 gap-1">{Array.from({length:rentalMonths[calendarMonth].weekday},(_,i)=><span key={`blank-${i}`}/>)}{Array.from({length:rentalMonths[calendarMonth].days},(_,i)=>i+1).map(d=>{const absoluteDay=rentalMonths[calendarMonth].offset+d;const booked=absoluteDay>=calendar.today&&isBooked(absoluteDay);const unavailable=booked||absoluteDay<calendar.today||(absoluteDay===calendar.today&&pickupSlots.every(p=>pickupTimestamp({start:absoluteDay,pickup:p})<=clock));const selected=!!startDay&&absoluteDay>=startDay&&absoluteDay<=(endDay??startDay);return <button key={d} title={booked?"Already booked":unavailable?"Unavailable":formatRentalDate(absoluteDay)} aria-label={`${formatRentalDate(absoluteDay)}${booked?", booked":unavailable?", unavailable":", available"}`} style={booked?{backgroundColor:"#fef3c7",color:"#92400e",textDecoration:"none"}:undefined} disabled={unavailable} onClick={()=>{setCalendarError("");if(!startDay||endDay){setStartDay(absoluteDay);setEndDay(null)}else if(absoluteDay>=startDay){if(!rentalRangeFree(startDay,absoluteDay,isBooked)){setCalendarError("This range includes booked dates. Choose dates before or after the booked days.");return;}setEndDay(absoluteDay)}else{setStartDay(absoluteDay);setEndDay(null)}}} className={`calendar-day ${unavailable?"unavailable":""} ${selected?"selected":""}`}>{d}{booked&&<span className="block text-[9px] leading-3 font-semibold">Booked</span>}</button>})}</div><div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold"><Legend color="bg-emerald-100" label="Available"/><Legend color="bg-amber-100" label="Booked"/><Legend color="bg-slate-200" label="Unavailable"/><Legend color="bg-blue-600" label="Selected"/></div>{startDay&&endDay&&<div className="mt-8 border-t pt-7"><h3 className="flex items-center gap-2 text-lg font-black"><Clock size={20}/> Select Pickup Time</h3><p className="mt-1 text-sm text-slate-500">Choose a pickup slot after confirming your rental days.</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{pickupSlots.map(p=>{const elapsed=pickupTimestamp({start:startDay,pickup:p})<=clock;return <button disabled={elapsed} onClick={()=>{setPickup(p);setCalendarError("")}} key={p} className={`rounded-xl border px-3 py-3 text-sm font-bold ${elapsed?"cursor-not-allowed bg-slate-100 text-slate-400":pickup===p?"border-blue-600 bg-blue-600 text-white":"border-slate-200 hover:border-blue-400"}`}>{p}</button>})}</div></div>}</section><aside className="h-fit rounded-2xl bg-slate-950 p-6 text-white lg:sticky lg:top-24"><p className="text-sm font-bold text-blue-300">BOOKING SUMMARY — ESTIMATE</p><div className="mt-5 flex gap-4"><img src={selectedTool.image} alt="" className="h-20 w-20 rounded-xl bg-white object-contain p-1"/><div><h3 className="font-extrabold">{selectedTool.name}</h3><p className="mt-1 text-sm text-slate-400">{selectedShop.name} · {selectedShop.distance}</p></div></div><div className="mt-6 space-y-3 border-y border-white/15 py-5 text-sm"><Row k="Start date" v={formatRentalDate(startDay)}/><Row k="Return date" v={formatRentalDate(endDay)}/><Row k="Booking duration" v={days?`${days} days`:"—"}/><Row k="Price per day" v={`₹${selectedShop.price}`}/><Row k="Rental cost" v={`₹${(days*selectedShop.price).toLocaleString("en-IN")}`}/><Row k="Refundable deposit" v={`₹${selectedShop.deposit.toLocaleString("en-IN")}`}/><Row k="Pickup time" v={days?pickup:"After dates"}/></div><div className="flex items-center justify-between py-5"><span className="font-bold">Estimated total</span><span className="text-2xl font-black">₹{(days*selectedShop.price+selectedShop.deposit).toLocaleString("en-IN")}</span></div>{calendarError&&<p role="alert" className="mb-3 text-sm text-amber-300">{calendarError}</p>}{days>0&&!bookingReady&&<p className="mb-3 text-sm text-amber-300">Select a future pickup slot and valid dates to continue.</p>}<button disabled={!bookingReady} onClick={confirmBooking} className="w-full rounded-xl bg-blue-500 py-3.5 font-extrabold disabled:opacity-40">Confirm Booking</button><p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck size={15}/> Deposit is refundable after return</p><p className="mt-3 text-xs text-slate-400">Estimate excludes GST, transport, fuel, operator and consumables where applicable. Confirm the final quote with the shop.</p></aside></div></PageShell>}
    {view==="confirmed"&&<div className="mx-auto max-w-2xl px-5 py-20 text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={42}/></span><p className="mt-7 text-sm font-black tracking-widest text-blue-600">BOOKING {viewedBooking?.id??"DETAILS"}</p><h1 className="mt-3 text-4xl font-black">{viewedBooking?.status==="cancelled"?"Booking Cancelled":viewedBooking?.status==="previous"?"Rental Completed":viewedBooking?.status==="active"?"Rental Active":"Your Tool is Reserved!"}</h1><p className="mx-auto mt-4 max-w-lg text-slate-600">{viewedBooking?.status==="cancelled"?"This booking has been cancelled. No pickup is scheduled.":viewedBooking?.status==="previous"?"This rental has been completed.":viewedBooking?.status==="active"?`Your rental from ${selectedShop.name} is currently active.`:`Your tool is held at ${selectedShop.name}. Bring a valid photo ID when you collect it.`}</p><div className="mt-8 rounded-2xl border border-slate-200 p-6 text-left shadow-sm"><Row k="Tool" v={selectedTool.name}/><Row k="Shop" v={selectedShop.name}/><Row k="Address" v={selectedShop.address}/><Row k="Pickup" v={`${formatRentalDate(startDay)}, ${pickup}`}/><Row k="Rental amount" v={`₹${(days*selectedShop.price).toLocaleString("en-IN")}`}/></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={getDirections} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-3.5 font-bold"><Navigation size={18}/> Get Directions</button><button onClick={()=>setView("dashboard")} className="rounded-xl bg-blue-600 py-3.5 font-bold text-white">View My Booking</button></div></div>}
    {view==="auth"&&<PageShell title="Welcome to Toolnest" crumb="Home" onBack={goHome} intro="Log in or create a demo account to view your rentals."><div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"><div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button onClick={()=>setAuthMode("login")} className={`rounded-lg py-2.5 font-bold ${authMode==="login"?"bg-white text-blue-700 shadow-sm":"text-slate-500"}`}>Log In</button><button onClick={()=>setAuthMode("signup")} className={`rounded-lg py-2.5 font-bold ${authMode==="signup"?"bg-white text-blue-700 shadow-sm":"text-slate-500"}`}>Sign Up</button></div><form onSubmit={e=>{e.preventDefault();completeDemoLogin()}} className="mt-6 space-y-4">{authMode==="signup"&&<label className="block text-sm font-bold">Full name<input required className="field mt-2 w-full font-normal" placeholder="Mohan Solanki"/></label>}<label className="block text-sm font-bold">Email or mobile number<input required className="field mt-2 w-full font-normal" placeholder="name@example.com"/></label><label className="block text-sm font-bold">Password<input required type="password" className="field mt-2 w-full font-normal" placeholder="Enter password"/></label>{authMode==="signup"&&<label className="block text-sm font-bold">Confirm password<input required type="password" className="field mt-2 w-full font-normal" placeholder="Re-enter password"/></label>}<button className="w-full rounded-xl bg-blue-600 py-3.5 font-extrabold text-white">{authMode==="login"?"Log In to Dashboard":"Create Demo Account"}</button></form><button onClick={completeDemoLogin} className="mt-3 w-full rounded-xl border border-blue-200 py-3 font-bold text-blue-700">Continue with Demo Account</button><p className="mt-4 text-center text-xs text-slate-500">Demo mode only — no real account or password is saved.</p></div></PageShell>}
    {view==="dashboard"&&<PageShell title="My Toolnest" crumb="Customer dashboard" onBack={goHome} intro="Track all your upcoming, active and previous rentals.">{bookingNotice&&<p role="status" className="mb-4 rounded-xl bg-blue-50 p-4 text-blue-800">{bookingNotice}</p>}<div className="mb-7 flex gap-2 overflow-auto">{dashboardTabs.map(([label,status])=><button key={status} onClick={()=>setDashboardTab(status)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold ${dashboardTab===status?"bg-blue-600 text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{label}<span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">{bookings.filter(b=>b.status===status).length}</span></button>)}</div><div className="space-y-4">{bookings.filter(b=>b.status===dashboardTab).map(booking=><div key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><img src={booking.tool.image} className="h-28 w-36 rounded-xl bg-white object-contain p-2" alt={booking.tool.name}/><div className="flex-1"><span className="available">{booking.status==="upcoming"?"Reserved":booking.status.charAt(0).toUpperCase()+booking.status.slice(1)}</span><h3 className="mt-2 text-xl font-extrabold">{booking.tool.name}</h3><p className="mt-1 text-slate-500">{booking.shop.name} · {formatRentalDate(booking.start)} to {formatRentalDate(booking.end)}</p><p className="mt-1 text-sm text-slate-500">Pickup {booking.pickup} · {booking.days} days · Booking {booking.id}</p></div><div className="flex flex-wrap items-center gap-3">{booking.status==="upcoming"&&<button disabled={!canCancelBooking(booking,clock||Date.now())} title="Cancellation is available only before the pickup slot starts (Mumbai time)." onClick={()=>cancelBooking(booking.id)} className="rounded-xl border border-red-200 px-5 py-3 font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">{canCancelBooking(booking,clock||Date.now())?"Cancel Booking":"Pickup time passed"}</button>}<button onClick={()=>{setViewedBooking(booking);setSelectedTool(booking.tool);setSelectedShop(booking.shop);setStartDay(booking.start);setEndDay(booking.end);setPickup(booking.pickup);setView("confirmed");scrollTo(0,0)}} className="rounded-xl border border-slate-300 px-5 py-3 font-bold hover:border-blue-500 hover:text-blue-700">View Booking</button></div></div></div>)}{bookings.filter(b=>b.status===dashboardTab).length===0&&<div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center"><CalendarDays className="mx-auto text-slate-400"/><h3 className="mt-3 font-extrabold">No {dashboardTabs.find(x=>x[1]===dashboardTab)?.[0].toLowerCase()}</h3><p className="mt-1 text-sm text-slate-500">Bookings in this section will appear here.</p></div>}</div></PageShell>}
    <footer className="border-t border-slate-200 bg-white py-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 text-sm text-slate-500 sm:flex-row sm:items-center lg:px-8"><div className="space-y-1.5"><p className="font-semibold text-slate-800">Made by Mohan Solanki</p><p>Institute: Shree L.R Tiwari College of Engineering</p><p>Project: IDEA LAB</p></div><div className="space-y-1.5 sm:text-right"><p>© 2026 Toolnest. Professional tools, rented locally.</p><p>Book online · Pick up nearby · Return on time</p></div></div></footer>
  </main>
}
function InteractiveShopMap({shopOptions,selectedShop,onSelect}:{shopOptions:(typeof shops)[number][];selectedShop:(typeof shops)[number];onSelect:(shop:(typeof shops)[number])=>void}){
  const mapEl=useRef<HTMLDivElement|null>(null);
  const mapRef=useRef<any>(null);
  useEffect(()=>{
    let cancelled=false;
    const initialise=()=>{
      if(cancelled||!mapEl.current||mapRef.current)return;
      const L=(window as any).L;
      if(!L)return;
      const map=L.map(mapEl.current,{scrollWheelZoom:true,zoomControl:true});
      mapRef.current=map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
      const bounds:Array<[number,number]>=[];
      shopOptions.forEach((shop,index)=>{
        const point:[number,number]=[shop.lat,shop.lng];
        bounds.push(point);
        const icon=L.divIcon({className:"",html:`<span style="display:grid;place-items:center;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#ef4444;border:3px solid white;box-shadow:0 3px 10px rgba(15,23,42,.35);color:white"><b style="transform:rotate(45deg);font:700 11px system-ui">${index+1}</b></span>`,iconSize:[34,34],iconAnchor:[17,34],popupAnchor:[0,-30]});
        const marker=L.marker(point,{icon,title:shop.name}).addTo(map);
        marker.bindPopup(`<div style="min-width:230px;font-family:system-ui;color:#0f172a"><strong style="font-size:16px">${shop.name}</strong><div style="margin-top:6px;color:#475569">${shop.address}</div><div style="margin-top:8px"><b>${shop.distance}</b> · ⭐ ${shop.rating}</div><div style="margin-top:4px">${shop.hours}</div><div style="margin-top:9px;font-size:17px;font-weight:800;color:#1d4ed8">₹${shop.price.toLocaleString("en-IN")}/day</div><div style="font-size:12px;color:#64748b">₹${shop.deposit.toLocaleString("en-IN")} refundable deposit</div></div>`);
        marker.on("click",()=>onSelect(shop));
      });
      map.fitBounds(bounds,{padding:[28,28]});
    };
    if(!document.querySelector('link[data-toolnest-leaflet]')){
      const css=document.createElement("link");css.rel="stylesheet";css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";css.dataset.toolnestLeaflet="true";document.head.appendChild(css);
    }
    if((window as any).L)initialise();
    else {
      const existing=document.querySelector('script[data-toolnest-leaflet]') as HTMLScriptElement|null;
      if(existing)existing.addEventListener("load",initialise,{once:true});
      else {const script=document.createElement("script");script.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";script.dataset.toolnestLeaflet="true";script.onload=initialise;document.head.appendChild(script);}
    }
    return()=>{cancelled=true;if(mapRef.current){mapRef.current.remove();mapRef.current=null;}};
  },[onSelect,shopOptions]);
  return <div className="relative"><div ref={mapEl} className="h-[460px] w-full bg-slate-100" aria-label="Interactive map showing Toolnest shop locations from Bhayandar to Churchgate"/><div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg bg-white/95 px-3 py-2 text-xs font-bold shadow">50 clickable shop pins</div><div className="border-t bg-blue-50 px-4 py-3 text-sm text-blue-900"><b>Selected:</b> {selectedShop.name} · {selectedShop.area}</div></div>
}
function PageShell({title,crumb,onBack,intro,children}:{title:string;crumb:string;onBack:()=>void;intro:string;children:React.ReactNode}){return <section className="min-h-[75vh] bg-slate-50 py-12"><div className="mx-auto max-w-7xl px-5 lg:px-8"><button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-bold text-blue-700"><ChevronLeft size={18}/> Back to {crumb}</button><div className="mb-10"><p className="eyebrow">TOOLNEST RENTALS</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-lg text-slate-600">{intro}</p></div>{children}</div></section>}
function Stat({n,label}:{n:string;label:string}){return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xl font-black text-blue-700">{n}</p><p className="text-xs font-semibold text-slate-500">{label}</p></div>}
function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}){return <div className="rounded-2xl border border-slate-200 bg-white p-6"><span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">{icon}</span><h3 className="mt-5 text-lg font-extrabold">{title}</h3><p className="mt-2 text-slate-600">{text}</p></div>}
function Spec({label,value}:{label:string;value:string}){return <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-1 font-extrabold">{value}</p></div>}
function Legend({color,label}:{color:string;label:string}){return <span className="flex items-center gap-2"><i className={`h-3 w-3 rounded-sm ${color}`}/>{label}</span>}
function Row({k,v}:{k:string;v:string}){return <div className="flex items-start justify-between gap-6 py-1.5"><span className="text-slate-500">{k}</span><span className="text-right font-bold">{v}</span></div>}
