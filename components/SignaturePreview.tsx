"use client";

import { COMPANY_NAME, getDisplayTwitter, SignatureData } from "@/lib/signatureHtml";

type SignaturePreviewProps = {
  data: SignatureData;
  theme: "light" | "dark";
};

export default function SignaturePreview({ data, theme }: SignaturePreviewProps) {
  const displayTwitter = getDisplayTwitter(data.twitter);
  const hasContact = Boolean(data.phone || displayTwitter);
  const showBullet = Boolean(data.phone && displayTwitter);

  return (
    <div className="preview-card" data-theme={theme}>
      {data.logoDataUrl && (
        <img className="preview-logo" src={data.logoDataUrl} alt="Company logo" />
      )}
      {data.name && <div className="preview-name">{data.name}</div>}
      {(data.title || COMPANY_NAME) && (
        <div className="preview-muted">
          {[data.title, COMPANY_NAME].filter(Boolean).join(", ")}
        </div>
      )}
      {hasContact && (
        <div className="preview-line">
          {data.phone && <span>{data.phone}</span>}
          {showBullet && <span className="bullet" aria-hidden="true" />}
          {displayTwitter && (
            <a
              className="preview-link"
              href={`https://x.com/${displayTwitter.replace(/^@/, "")}`}
            >
              {displayTwitter}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
