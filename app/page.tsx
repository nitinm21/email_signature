"use client";

import { useMemo, useRef, useState } from "react";
import ImportModal from "@/components/ImportModal";
import SignaturePreview from "@/components/SignaturePreview";
import { buildSignatureHtml, SignatureData } from "@/lib/signatureHtml";

const MAX_LOGO_SIZE_MB = 2;

export default function Home() {
  const [data, setData] = useState<SignatureData>({
    name: "",
    title: "",
    phone: "",
    twitter: "",
    logoDataUrl: null
  });
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const signaturePayload = useMemo(() => buildSignatureHtml(data), [data]);

  const setField = (field: keyof SignatureData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const clearField = (field: keyof SignatureData) => {
    setData((prev) => ({ ...prev, [field]: "" }));
  };

  const handleUploadClick = () => {
    setLogoError(null);
    fileInputRef.current?.click();
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoError("Please upload an image file.");
      return;
    }

    const fileSizeMb = file.size / 1024 / 1024;
    if (fileSizeMb > MAX_LOGO_SIZE_MB) {
      setLogoError("Logo must be 2MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setData((prev) => ({ ...prev, logoDataUrl: String(reader.result) }));
      setLogoError(null);
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setData((prev) => ({ ...prev, logoDataUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copySignature = async () => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([signaturePayload.html], {
          type: "text/html"
        });
        const textBlob = new Blob([signaturePayload.plainText], {
          type: "text/plain"
        });
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": htmlBlob,
            "text/plain": textBlob
          })
        ]);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(signaturePayload.html);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = signaturePayload.html;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 2400);
    } catch {
      setCopyStatus("error");
      window.setTimeout(() => setCopyStatus("idle"), 2400);
    }
  };

  return (
    <main>
      <div className="page">
        <header className="hero fade-up">
          <h1>Create your email signature</h1>
          <p>Fill in your details and copy it into your email client.</p>
        </header>

        <section className="content-grid">
          <div className="card form-card fade-up delay-1">
            <label className="field">
              Name
              <div className="input-wrap">
                <input
                  className="input"
                  value={data.name}
                  placeholder="Alex Morgan"
                  onChange={(event) => setField("name", event.target.value)}
                />
                {data.name && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => clearField("name")}
                    aria-label="Clear name"
                  >
                    X
                  </button>
                )}
              </div>
            </label>

            <label className="field">
              Title
              <div className="input-wrap">
                <input
                  className="input"
                  value={data.title}
                  placeholder="Designer"
                  onChange={(event) => setField("title", event.target.value)}
                />
                {data.title && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => clearField("title")}
                    aria-label="Clear title"
                  >
                    X
                  </button>
                )}
              </div>
            </label>

            <label className="field">
              Phone
              <div className="input-wrap">
                <input
                  className="input"
                  value={data.phone}
                  placeholder="+49 151 22982"
                  onChange={(event) => setField("phone", event.target.value)}
                />
                {data.phone && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => clearField("phone")}
                    aria-label="Clear phone"
                  >
                    X
                  </button>
                )}
              </div>
            </label>

            <label className="field">
              Twitter / X
              <div className="input-wrap">
                <input
                  className="input"
                  value={data.twitter}
                  placeholder="@handle"
                  onChange={(event) => setField("twitter", event.target.value)}
                />
                {data.twitter && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => clearField("twitter")}
                    aria-label="Clear twitter handle"
                  >
                    X
                  </button>
                )}
              </div>
            </label>

            <div className="field">
              Company logo
              <div className="upload-row">
                <button type="button" className="upload-btn" onClick={handleUploadClick}>
                  Upload logo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  hidden
                />
                <div className="upload-meta">
                  {data.logoDataUrl ? (
                    <>
                      <img
                        src={data.logoDataUrl}
                        alt="Uploaded logo preview"
                        className="logo-thumb"
                      />
                      <button type="button" className="btn btn-ghost" onClick={clearLogo}>
                        Remove
                      </button>
                    </>
                  ) : (
                    <span>PNG or JPG, up to 2MB.</span>
                  )}
                </div>
                {logoError && <span className="copy-status">{logoError}</span>}
              </div>
            </div>

            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={copySignature}>
                Copy Signature
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(true)}
              >
                How to import?
              </button>
              <span className="copy-status" role="status" aria-live="polite">
                {copyStatus === "copied" && "Copied as HTML."}
                {copyStatus === "error" && "Copy failed. Please try again."}
              </span>
            </div>
          </div>

          <div className="card fade-up delay-2">
            <div className="preview-header">
              <div className="preview-title">Live preview</div>
              <div className="toggle" role="tablist" aria-label="Preview theme">
                <button
                  type="button"
                  className={previewTheme === "light" ? "active" : ""}
                  onClick={() => setPreviewTheme("light")}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={previewTheme === "dark" ? "active" : ""}
                  onClick={() => setPreviewTheme("dark")}
                >
                  Dark
                </button>
              </div>
            </div>
            <SignaturePreview data={data} theme={previewTheme} />
          </div>
        </section>
      </div>
      <ImportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
