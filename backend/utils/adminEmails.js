// Admin access = ADMIN_EMAIL (also receives order/booking notifications)
// plus any addresses in ADMIN_EXTRA_EMAILS (comma separated, access only).
const clean = (v) => (v || "").trim().toLowerCase();

export const isAdminEmail = (email) => {
  const e = clean(email);
  if (!e) return false;
  const allowed = [
    process.env.ADMIN_EMAIL,
    ...(process.env.ADMIN_EXTRA_EMAILS || "").split(","),
  ].map(clean);
  return allowed.includes(e);
};
