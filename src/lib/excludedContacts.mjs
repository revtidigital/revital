// Team/internal phone numbers excluded from winner selection and leaderboards.
export const EXCLUDED_CONTACTS = new Set([
  "+971543217853",
  "+971554319546",
  "+971596361660",
  "+971597381505",
  "+971585049206",
  "+971527842801",
  "+971585414468",
  "+971522553676",
  "+971599611654",
  "+971503461761",
]);

export const isExcludedContact = (contact) => EXCLUDED_CONTACTS.has(contact);
