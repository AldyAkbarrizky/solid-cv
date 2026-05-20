export const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@solidtechno.com";

export const companyName =
  process.env.NEXT_PUBLIC_COMPANY_NAME || "SolidTechno ID";

export const secondaryPaymentContact = {
  fullName:
    process.env.NEXT_PUBLIC_PRIMARY_CONTACT_NAME || "Aldy Akbarrizky",
  email:
    process.env.NEXT_PUBLIC_PRIMARY_CONTACT_EMAIL ||
    "aldyakbarrizky18@gmail.com",
  phone:
    process.env.NEXT_PUBLIC_PRIMARY_CONTACT_PHONE || "085156230293",
  address:
    process.env.NEXT_PUBLIC_PRIMARY_CONTACT_ADDRESS ||
    "Jl. Kebon Kopi, blok Citopeng No 312 RT 06 RW 22",
  province: process.env.NEXT_PUBLIC_PRIMARY_CONTACT_PROVINCE || "JAWA BARAT",
  city: process.env.NEXT_PUBLIC_PRIMARY_CONTACT_CITY || "KOTA CIMAHI",
  district:
    process.env.NEXT_PUBLIC_PRIMARY_CONTACT_DISTRICT || "CIMAHI SELATAN",
  subDistrict: process.env.NEXT_PUBLIC_PRIMARY_CONTACT_SUB_DISTRICT || "MELONG",
  postalCode:
    process.env.NEXT_PUBLIC_PRIMARY_CONTACT_POSTAL_CODE || "40534",
};

// Backward compatibility (temporary alias)
export const primaryBillingContact = secondaryPaymentContact;
