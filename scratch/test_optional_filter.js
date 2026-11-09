const { MARVEL_CHECKLIST } = require('../js/movies-data.js');

// Mock state
const state = {
  watched: new Set([1, 2, 3]),
  optional: new Set([4, 5, 20]), // item 4, 5, 20 are optional
  activeCategory: 'all',
  activeStatus: 'all',
  activeType: 'all',
  searchQuery: '',
  sortBy: 'custom'
};

function getFilteredItems() {
  let items = [...MARVEL_CHECKLIST];

  // Category Filter
  if (state.activeCategory !== 'all') {
    items = items.filter((item) => {
      if (state.activeCategory === 'mcu-infinity') return item.universe === 'mcu-infinity';
      if (state.activeCategory === 'mcu-multiverse') return item.universe === 'mcu-multiverse';
      if (state.activeCategory === 'defenders') return item.universe === 'defenders';
      if (state.activeCategory === 'spider-verse') return item.universe === 'spider-verse';
      if (state.activeCategory === 'x-men') return item.universe === 'x-men';
      if (state.activeCategory === 'fantastic-four') return item.universe === 'fantastic-four';
      if (state.activeCategory === 'legacy') return item.universe === 'legacy';
      if (state.activeCategory === 'animation') return item.mediaType === 'animation';
      return true;
    });
  }

  // Status Filter
  if (state.activeStatus === 'watched') {
    items = items.filter((item) => state.watched.has(item.id) && !state.optional.has(item.id));
  } else if (state.activeStatus === 'unwatched') {
    items = items.filter((item) => !state.watched.has(item.id) && !state.optional.has(item.id));
  } else if (state.activeStatus === 'optional') {
    items = items.filter((item) => state.optional.has(item.id));
  }

  return items;
}

// Test 1: All section shows optional items
state.activeStatus = 'all';
let allItems = getFilteredItems();
const containsOptInAll = allItems.some(i => state.optional.has(i.id));
if (!containsOptInAll) {
  console.error('FAIL: All section should show optional items!');
  process.exit(1);
}
console.log('✓ Test 1: All section correctly includes optional titles (' + allItems.length + ' total)');

// Test 2: Unwatched section does NOT show optional items
state.activeStatus = 'unwatched';
let unwatchedItems = getFilteredItems();
const containsOptInUnwatched = unwatchedItems.some(i => state.optional.has(i.id));
if (containsOptInUnwatched) {
  console.error('FAIL: Unwatched section should NOT show optional items!');
  process.exit(1);
}
console.log('✓ Test 2: Unwatched section correctly excludes all optional titles (' + unwatchedItems.length + ' total)');

// Test 3: Watched section does NOT show optional items
state.activeStatus = 'watched';
let watchedItems = getFilteredItems();
const containsOptInWatched = watchedItems.some(i => state.optional.has(i.id));
if (containsOptInWatched) {
  console.error('FAIL: Watched section should NOT show optional items!');
  process.exit(1);
}
console.log('✓ Test 3: Watched section correctly excludes optional titles (' + watchedItems.length + ' total)');

// Test 4: Optional section shows ONLY optional items
state.activeStatus = 'optional';
let optItems = getFilteredItems();
const allAreOpt = optItems.every(i => state.optional.has(i.id));
if (!allAreOpt || optItems.length !== state.optional.size) {
  console.error('FAIL: Optional section should show only optional items!');
  process.exit(1);
}
console.log('✓ Test 4: Optional section correctly shows only optional titles (' + optItems.length + ' total)');

// Test 5: Category sections with All status show optional items
state.activeStatus = 'all';
state.activeCategory = 'mcu-infinity';
let infinityItems = getFilteredItems();
const containsOptInInfinity = infinityItems.some(i => state.optional.has(i.id));
if (!containsOptInInfinity) {
  console.error('FAIL: Category section with All status should include optional items!');
  process.exit(1);
}
console.log('✓ Test 5: MCU Infinity category section with All status correctly shows optional titles');

console.log('\nALL TESTS PASSED SUCCESSFULLY!');
