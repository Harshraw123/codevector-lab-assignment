// seed.js
// Generates 200,000 realistic-looking products and inserts them in bulk.
//
// IMPORTANT: We never insert one row at a time. Inserting 200,000 rows in
// a loop means 200,000 separate round-trips to the database — extremely
// slow. Instead we build big arrays of rows and insert them in batches
// (1,000 at a time), so each batch is a single multi-row INSERT statement.

import { db } from "../src/db.js";
import { products } from "../src/schema.js";

const CATEGORIES = ["electronics", "books", "fashion", "sports", "home", "beauty", "toys", "grocery"];

// Small word lists so generated names look semi-realistic without
// needing an extra dependency like faker.
const ADJECTIVES = ["Premium", "Compact", "Wireless", "Classic", "Eco", "Pro", "Lightweight", "Deluxe", "Smart", "Vintage"];
const NOUNS = {
  electronics: ["Headphones", "Charger", "Speaker", "Monitor", "Keyboard", "Webcam"],
  books: ["Novel", "Cookbook", "Biography", "Journal", "Guidebook", "Comic"],
  fashion: ["Jacket", "Sneakers", "Scarf", "Watch", "Backpack", "Hat"],
  sports: ["Yoga Mat", "Dumbbell", "Football", "Bicycle Pump", "Water Bottle", "Resistance Band"],
  home: ["Lamp", "Cushion", "Blender", "Rug", "Mug Set", "Candle"],
  beauty: ["Moisturizer", "Lipstick", "Shampoo", "Serum", "Perfume", "Face Mask"],
  toys: ["Puzzle", "Action Figure", "Board Game", "Building Blocks", "Plush Toy", "RC Car"],
  grocery: ["Coffee Beans", "Pasta", "Olive Oil", "Cereal", "Snack Box", "Tea Bags"],
};

const TOTAL_PRODUCTS = 200_000;
const BATCH_SIZE = 1_000;

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice() {
  // Random price between 5.00 and 500.00, two decimal places.
  const cents = Math.floor(Math.random() * 49500) + 500;
  return (cents / 100).toFixed(2);
}

function randomPastDate() {
  // Spread created_at over the last 2 years so pagination has realistic
  // ordering to work with, instead of every row having (almost) the
  // same timestamp.
  const now = Date.now();
  const twoYearsMs = 2 * 365 * 24 * 60 * 60 * 1000;
  return new Date(now - Math.random() * twoYearsMs);
}

function generateBatch(size) {
  const rows = [];
  for (let i = 0; i < size; i++) {
    const category = randomFrom(CATEGORIES);
    const noun = randomFrom(NOUNS[category]);
    const adjective = randomFrom(ADJECTIVES);
    const createdAt = randomPastDate();

    rows.push({
      name: `${adjective} ${noun}`,
      category,
      price: randomPrice(),
      createdAt,
      // updatedAt starts the same as createdAt; it only changes later
      // when a product is actually edited.
      updatedAt: createdAt,
    });
  }
  return rows;
}

async function seed() {
  console.log(`Seeding ${TOTAL_PRODUCTS} products in batches of ${BATCH_SIZE}...`);
  const start = Date.now();

  for (let inserted = 0; inserted < TOTAL_PRODUCTS; inserted += BATCH_SIZE) {
    const batch = generateBatch(BATCH_SIZE);
    await db.insert(products).values(batch); // one INSERT statement per batch
    console.log(`Inserted ${inserted + BATCH_SIZE} / ${TOTAL_PRODUCTS}`);
  }

  const seconds = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Done in ${seconds}s`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
