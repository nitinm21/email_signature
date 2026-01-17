export type SignatureData = {
  name: string;
  title: string;
  phone: string;
  countryCode: string; // ISO country code (e.g., "US")
  dialCode: string;    // International dial code (e.g., "+1")
};

export const formatPhoneWithDialCode = (dialCode: string, phone: string): string => {
  if (!phone) return "";
  // If phone already starts with +, use it as-is
  if (phone.startsWith("+")) return phone;
  // Otherwise prepend the dial code
  return `${dialCode} ${phone}`;
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
  if (data.name) lines.push(data.name);
  const titleLine = [data.title, COMPANY_NAME].filter(Boolean).join(", ");
  if (titleLine) lines.push(titleLine);
  const formattedPhone = formatPhoneWithDialCode(data.dialCode, data.phone);
  const contact = [formattedPhone].filter(Boolean).join(" \u2022 ");
  if (contact) lines.push(contact);
  return lines.join("\n");
};

export const buildSignatureHtml = (data: SignatureData) => {
  const rawName = data.name.trim();
  const rawTitle = data.title.trim();
  const rawPhone = data.phone.trim();
  const titleLine = [rawTitle, COMPANY_NAME].filter(Boolean).join(", ");

  const name = escapeHtml(rawName);
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

  const html = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Helvetica, Arial, sans-serif;color:#2b2621;">
  ${name ? `<tr><td style="font-size:16px;font-weight:700;">${name}</td></tr>` : ""}
  ${
    titleLine
      ? `<tr><td style="font-size:13px;color:#6d655c;padding-top:2px;">${titleLineEscaped}</td></tr>`
      : ""
  }
  ${contactLine}
</table>
`.trim();

  return { html, plainText: getPlainText(data) };
};
