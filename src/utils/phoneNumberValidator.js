const VALID_SYRIAN_PHONE_PREFIXES = ["093", "094", "095", "096", "098", "099"];

function normalizePhoneNumber(phone) {
  if (!phone) return "";

  let normalizedPhone = phone.replace(/[\s-]/g, "");

  if (normalizedPhone.startsWith("+963")) {
    normalizedPhone = `0${normalizedPhone.slice(4)}`;
  } else if (normalizedPhone.startsWith("963")) {
    normalizedPhone = `0${normalizedPhone.slice(3)}`;
  }

  return normalizedPhone;
}

export function countPhoneDigits(phone) {
  return (phone || "").replace(/\D/g, "").length;
}

export function getSyrianPhoneNumberValidationError(phone) {
  const trimmedPhone = (phone || "").trim();

  if (!trimmedPhone) {
    return "رقم الهاتف مطلوب";
  }

  if (!/^\+?\d[\d\s-]*$/.test(trimmedPhone)) {
    return "رقم الهاتف يجب أن يحتوي على أرقام فقط، ويمكن أن يبدأ بـ +963";
  }

  const normalizedPhone = normalizePhoneNumber(trimmedPhone);

  if (!normalizedPhone.startsWith("09")) {
    return "رقم الهاتف يجب أن يبدأ بـ 09 أو +963";
  }

  if (normalizedPhone.length < 10) {
    return "رقم الهاتف يجب أن يتكون من 10 أرقام";
  }

  if (normalizedPhone.length > 10) {
    return "رقم الهاتف يجب أن يتكون من 10 أرقام فقط";
  }

  const prefix = normalizedPhone.substring(0, 3);

  if (!VALID_SYRIAN_PHONE_PREFIXES.includes(prefix)) {
    return "مقدمة رقم الهاتف غير صالحة";
  }

  return null;
}

export function validateSyrianPhoneNumber(phone) {
  return getSyrianPhoneNumberValidationError(phone) === null;
}
