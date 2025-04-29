// Test file to explore the countries-list package
import { countries } from 'countries-list';

console.log("All countries:");
for (const [code, data] of Object.entries(countries)) {
  if (data.name.includes("United States") || code === "US") {
    console.log(`Code: ${code}, Name: ${data.name}, Continent: ${data.continent}`);
  }
}

// Check for USA
const usaVariations = ["USA", "United States", "United States of America", "US"];
for (const variation of usaVariations) {
  console.log(`\nLooking for: ${variation}`);
  let found = false;
  for (const [code, data] of Object.entries(countries)) {
    if (data.name.toLowerCase() === variation.toLowerCase()) {
      console.log(`Exact match found: Code: ${code}, Name: ${data.name}, Continent: ${data.continent}`);
      found = true;
      break;
    }
  }
  if (!found) {
    console.log(`No exact match found for ${variation}`);
  }
}

// Print all country codes and names for reference
console.log("\nAll country codes and names:");
for (const [code, data] of Object.entries(countries)) {
  console.log(`${code}: ${data.name}`);
}
