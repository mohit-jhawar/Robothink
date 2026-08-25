// Progressive US phone formatter: formats digits as the user types into
// (XXX) XXX-XXXX. Ignores non-digits and caps at 10 digits.
export function formatPhone(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 10);
  const len = digits.length;
  if (len === 0) return '';
  if (len < 4) return `(${digits}`;
  if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
