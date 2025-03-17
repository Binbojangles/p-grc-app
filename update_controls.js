const fs = require('fs');

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync('cmmc_level2_controls.json', 'utf8'));

// Define domains that should have [CUI Data] suffix
const cuiDomains = ['AC.L2', 'IA.L2', 'MP.L2', 'PE.L2', 'SC.L2', 'SI.L2'];

// Count of updates made
let updateCount = 0;

// Update titles
jsonData.controls.forEach(control => {
  if (cuiDomains.includes(control.domain_id) && !control.title.includes('[CUI Data]')) {
    control.title = `${control.title} [CUI Data]`;
    updateCount++;
  }
});

// Write the updated JSON back to the file
fs.writeFileSync('cmmc_level2_controls.json', JSON.stringify(jsonData, null, 2));

console.log(`Updated ${updateCount} control titles in cmmc_level2_controls.json`); 