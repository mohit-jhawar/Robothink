// Age-group matching for the ClassFinder. Class rows store ages as free-text
// strings ("7–10", "5-7", "9–14", or a single "7"), so we parse the numbers out
// and test whether the row's range overlaps a selected bucket.

export const AGE_GROUPS = [
  { id: '4-6', label: 'Ages 4–6', min: 4, max: 6 },
  { id: '6-10', label: 'Ages 6–10', min: 6, max: 10 },
  { id: '9-14', label: 'Ages 9–14', min: 9, max: 14 },
];

/** Parse "7–10" / "5-7" / "8" (any dash) into { min, max }, or null. */
export function parseAgeRange(ages) {
  if (!ages) return null;
  const nums = String(ages).match(/\d+/g);
  if (!nums || !nums.length) return null;
  const a = parseInt(nums[0], 10);
  const b = nums.length > 1 ? parseInt(nums[1], 10) : a;
  return { min: Math.min(a, b), max: Math.max(a, b) };
}

/** True if the row's age range overlaps the selected group. */
export function matchesAgeGroup(ages, group) {
  const range = parseAgeRange(ages);
  if (!range || !group) return false;
  return range.min <= group.max && group.min <= range.max;
}
