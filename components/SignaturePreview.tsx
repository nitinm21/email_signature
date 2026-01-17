"use client";

import { COMPANY_NAME, SignatureData, formatPhoneWithDialCode } from "@/lib/signatureHtml";

type SignaturePreviewProps = {
  data: SignatureData;
  theme: "light" | "dark";
};

// Empty state icon
const EmptyIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    <path d="m5 12-3 3 3 3"/>
    <path d="m9 18 3-3-3-3"/>
  </svg>
);

export default function SignaturePreview({ data, theme }: SignaturePreviewProps) {
  const hasContent = Boolean(data.name || data.title || data.phone);
  // Use pipe separator between title and company
  const titleLine = [data.title, COMPANY_NAME].filter(Boolean).join(" | ");
  const formattedPhone = formatPhoneWithDialCode(data.dialCode, data.phone);
  const hasContact = Boolean(data.phone);

  if (!hasContent) {
    return (
      <div className="preview-card" data-theme={theme}>
        <div className="preview-empty">
          {EmptyIcon}
          <p>Start typing to see your signature</p>
        </div>
      </div>
    );
  }

  // Build name with optional pronouns in parentheses
  const nameDisplay = data.name && data.pronouns
    ? <>{data.name} <span className="preview-pronouns">({data.pronouns})</span></>
    : data.name;

  return (
    <div className="preview-card" data-theme={theme}>
      {data.name && <div className="preview-name">{nameDisplay}</div>}
      {titleLine && (
        <div className="preview-muted">{titleLine}</div>
      )}
      {hasContact && (
        <div className="preview-line">
          <span>{formattedPhone}</span>
        </div>
      )}
    </div>
  );
}
