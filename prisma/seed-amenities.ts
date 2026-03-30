// prisma/seed-amenities.ts
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const amenities = [
  { name: "Washer/Dryer", category: "Appliances" },
  { name: "Washer/Dryer Hookup", category: "Appliances" },
  { name: "Dishwasher", category: "Appliances" },
  { name: "Refrigerator", category: "Appliances" },
  { name: "Microwave", category: "Appliances" },
  { name: "Garbage Disposal", category: "Appliances" },
  { name: "Balcony", category: "Outdoor" },
  { name: "Patio", category: "Outdoor" },
  { name: "Private Yard", category: "Outdoor" },
  { name: "Deck", category: "Outdoor" },
  { name: "Air Conditioning", category: "Climate" },
  { name: "Central Heating", category: "Climate" },
  { name: "Ceiling Fans", category: "Climate" },
  { name: "Fireplace", category: "Climate" },
  { name: "Elevator", category: "Building" },
  { name: "Gym / Fitness Center", category: "Building" },
  { name: "Swimming Pool", category: "Building" },
  { name: "Rooftop Access", category: "Building" },
  { name: "Concierge", category: "Building" },
  { name: "Package Lockers", category: "Building" },
  { name: "Parking Included", category: "Parking" },
  { name: "Garage Parking", category: "Parking" },
  { name: "Street Parking", category: "Parking" },
  { name: "EV Charging", category: "Parking" },
  { name: "Storage Unit", category: "Storage" },
  { name: "Bike Storage", category: "Storage" },
  { name: "High-Speed Internet", category: "Connectivity" },
  { name: "Cable Ready", category: "Connectivity" },
  { name: "Wheelchair Accessible", category: "Accessibility" },
  { name: "Elevator Access", category: "Accessibility" },
  { name: "Pet Friendly", category: "Pets" },
  { name: "Dog Friendly", category: "Pets" },
  { name: "Cat Friendly", category: "Pets" },
];

async function main() {
  for (const amenity of amenities) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: { category: amenity.category },
      create: amenity,
    });
  }
  console.log(`✅ Seeded ${amenities.length} amenities`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());