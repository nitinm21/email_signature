export type SignatureData = {
  name: string;
  title: string;
  phone: string;
  twitter: string;
  logoDataUrl: string | null;
};

export const COMPANY_NAME = "GoodPower";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const normalizeTwitter = (handle: string) =>
  handle.trim().replace(/^@/, "");

export const getDisplayTwitter = (handle: string) => {
  const normalized = normalizeTwitter(handle);
  return normalized ? `@${normalized}` : "";
};

const getPlainText = (data: SignatureData) => {
  const lines = [];
  if (data.name) lines.push(data.name);
  const titleLine = [data.title, COMPANY_NAME].filter(Boolean).join(", ");
  if (titleLine) lines.push(titleLine);
  const contact = [data.phone, getDisplayTwitter(data.twitter)]
    .filter(Boolean)
    .join(" \u2022 ");
  if (contact) lines.push(contact);
  return lines.join("\n");
};

export const buildSignatureHtml = (data: SignatureData) => {
  const rawName = data.name.trim();
  const rawTitle = data.title.trim();
  const rawPhone = data.phone.trim();
  const twitterHandle = normalizeTwitter(data.twitter);
  const displayTwitter = twitterHandle ? `@${twitterHandle}` : "";
  const titleLine = [rawTitle, COMPANY_NAME].filter(Boolean).join(", ");

  const name = escapeHtml(rawName);
  const titleLineEscaped = escapeHtml(titleLine);
  const phone = escapeHtml(rawPhone);
  const displayTwitterEscaped = escapeHtml(displayTwitter);

  const contactItems = [];
  if (phone) {
    const phoneHref = rawPhone.replace(/[^\d+]/g, "");
    contactItems.push(
      `<a href="tel:${phoneHref}" style="color:#2b2621;text-decoration:none;">${phone}</a>`
    );
  }
  if (displayTwitterEscaped && twitterHandle) {
    contactItems.push(
      `<a href="https://x.com/${escapeHtml(
        encodeURIComponent(twitterHandle)
      )}" style="color:#2b2621;text-decoration:none;">${displayTwitterEscaped}</a>`
    );
  }

  const contactLine = contactItems.length
    ? `<tr><td style="padding-top:8px;font-size:13px;color:#2b2621;">${contactItems.join(
        '<span style="color:#b9b0a7;padding:0 8px;">&bull;</span>'
      )}</td></tr>`
    : "";

  const logo = data.logoDataUrl
    ? `<tr><td style="padding-bottom:10px;"><img src="${data.logoDataUrl}" alt="Company logo" width="44" height="44" style="display:block;border-radius:12px;border:1px solid #e7ddcf;object-fit:cover;" /></td></tr>`
    : "";

  const html = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Helvetica, Arial, sans-serif;color:#2b2621;">
  ${logo}
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
