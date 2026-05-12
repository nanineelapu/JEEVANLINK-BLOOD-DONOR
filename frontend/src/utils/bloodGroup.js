export const BLOOD_GROUPS = [
  { value: 'O_NEGATIVE', label: 'O-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
];

export const bgLabel = (v) =>
  BLOOD_GROUPS.find((b) => b.value === v)?.label || v;
