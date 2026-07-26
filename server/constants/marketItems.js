export const MARKET_ITEMS = [
  {
    id: "wheat-seed-40kg",
    name: "Certified Wheat Seed",
    category: "Seeds",
    unit: "40 kg bag",
    price: 2400,
    imageTone: "#b9924f",
    sourceNote: "Typical certified seed bag price"
  },
  {
    id: "paddy-seed-30kg",
    name: "Hybrid Paddy Seed",
    category: "Seeds",
    unit: "30 kg bag",
    price: 1850,
    imageTone: "#d6b05d",
    sourceNote: "Typical hybrid paddy seed bag price"
  },
  {
    id: "vegetable-seed-kit",
    name: "Vegetable Seed Kit",
    category: "Seeds",
    unit: "multi-crop pack",
    price: 650,
    imageTone: "#699b43",
    sourceNote: "Small farm vegetable starter kit"
  },
  {
    id: "neem-urea-45kg",
    name: "Neem Coated Urea",
    category: "Fertiliser",
    unit: "45 kg bag",
    price: 267,
    imageTone: "#e1e4dc",
    sourceNote: "Government-notified farmer MRP rounded to nearest rupee"
  },
  {
    id: "dap-50kg",
    name: "DAP Fertiliser",
    category: "Fertiliser",
    unit: "50 kg bag",
    price: 1350,
    imageTone: "#dad4c2",
    sourceNote: "Common subsidised farmer MRP"
  },
  {
    id: "npk-50kg",
    name: "NPK Fertiliser",
    category: "Fertiliser",
    unit: "50 kg bag",
    price: 1470,
    imageTone: "#c6d4b1",
    sourceNote: "Typical NPK retail benchmark"
  },
  {
    id: "battery-sprayer-16l",
    name: "Battery Sprayer",
    category: "Equipment",
    unit: "16 litre",
    price: 4599,
    imageTone: "#4d8d9f",
    sourceNote: "Indicative online retail price"
  },
  {
    id: "drip-kit-small",
    name: "Drip Irrigation Kit",
    category: "Equipment",
    unit: "starter kit",
    price: 7500,
    imageTone: "#5a91b0",
    sourceNote: "Small field starter kit"
  },
  {
    id: "tractor-45hp",
    name: "45 HP Tractor",
    category: "Tractor",
    unit: "ex-showroom estimate",
    price: 694000,
    imageTone: "#c9472d",
    sourceNote: "Indicative 45-47 HP tractor ex-showroom price"
  }
];

export function findMarketItem(itemId) {
  return MARKET_ITEMS.find((item) => item.id === itemId);
}
