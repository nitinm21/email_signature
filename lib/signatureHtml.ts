export type SignatureData = {
  name: string;
  pronouns: string;
  title: string;
  phone: string;
  countryCode: string; // ISO country code (e.g., "US")
  dialCode: string;    // International dial code (e.g., "+1")
  avatarUrl?: string;
};

// Format phone number with hyphens (e.g., "6095775523" -> "609-577-5523")
export const formatPhoneWithHyphens = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Format based on length
  if (digits.length === 10) {
    // US format: 609-577-5523
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    // US with country code: 609-577-5523 (strip the 1)
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  } else if (digits.length > 6) {
    // Generic format for other lengths: split into groups
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Return as-is if too short to format
  return phone;
};

export const formatPhoneWithDialCode = (dialCode: string, phone: string): string => {
  const trimmedPhone = phone.trim();
  const trimmedDialCode = dialCode.trim();
  if (!trimmedPhone) return "";
  // If phone already starts with +, use it as-is
  if (trimmedPhone.startsWith("+")) return trimmedPhone;
  // Format phone with hyphens first
  const formattedPhone = formatPhoneWithHyphens(trimmedPhone);
  if (!trimmedDialCode) return formattedPhone;
  return `${trimmedDialCode} ${formattedPhone}`;
};

export const COMPANY_NAME = "GoodPower";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getPlainText = (data: SignatureData) => {
  const lines = [];
  // Name with optional pronouns in parentheses
  if (data.name) {
    const nameLine = data.pronouns ? `${data.name} (${data.pronouns})` : data.name;
    lines.push(nameLine);
  }
  // Title | GoodPower (using pipe separator)
  const titleLine = [data.title, COMPANY_NAME].filter(Boolean).join(" | ");
  if (titleLine) lines.push(titleLine);
  const formattedPhone = formatPhoneWithDialCode(data.dialCode, data.phone);
  const contact = [formattedPhone].filter(Boolean).join(" \u2022 ");
  if (contact) lines.push(contact);
  return lines.join("\n");
};

export const buildSignatureHtml = (data: SignatureData) => {
  const rawName = data.name.trim();
  const rawPronouns = data.pronouns?.trim() || "";
  const rawTitle = data.title.trim();
  const rawPhone = data.phone.trim();
  const avatarUrl = data.avatarUrl?.trim() || "";
  // Use pipe separator between title and company
  const titleLine = [rawTitle, COMPANY_NAME].filter(Boolean).join(" | ");

  const name = escapeHtml(rawName);
  const pronouns = escapeHtml(rawPronouns);
  const titleLineEscaped = escapeHtml(titleLine);
  const formattedPhone = formatPhoneWithDialCode(data.dialCode, rawPhone);
  const phone = escapeHtml(formattedPhone);

  const contactItems = [];
  if (phone) {
    contactItems.push(
      `<span style="color:#2b2621;">${phone}</span>`
    );
  }

  const contactLine = contactItems.length
    ? `<tr><td style="padding-top:8px;font-size:13px;color:#2b2621;">${contactItems.join(
        '<span style="color:#b9b0a7;padding:0 8px;">&bull;</span>'
      )}</td></tr>`
    : "";

  // Build name line with optional pronouns
  const nameWithPronouns = pronouns
    ? `${name} <span style="font-weight:400;">(${pronouns})</span>`
    : name;

  const infoTable = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Helvetica, Arial, sans-serif;color:#2b2621;">
  ${name ? `<tr><td style="font-size:16px;font-weight:700;">${nameWithPronouns}</td></tr>` : ""}
  ${
    titleLine
      ? `<tr><td style="font-size:13px;color:#6d655c;padding-top:2px;">${titleLineEscaped}</td></tr>`
      : ""
  }
  ${contactLine}
</table>
`.trim();

  const html = avatarUrl
    ? `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Helvetica, Arial, sans-serif;color:#2b2621;">
  <tr>
    <td style="padding-right:16px;vertical-align:top;">
      <img src="${avatarUrl}" width="72" height="72" alt=""
           style="display:block;border-radius:50%;object-fit:cover;" />
    </td>
    <td style="vertical-align:top;">
      ${infoTable}
    </td>
  </tr>
</table>
`.trim()
    : infoTable;

  return { html, plainText: getPlainText(data) };
};
