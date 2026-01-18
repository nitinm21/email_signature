"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import ImportModal from "@/components/ImportModal";
import SignaturePreview from "@/components/SignaturePreview";
import CountryCodeSelector from "@/components/CountryCodeSelector";
import { buildSignatureHtml, SignatureData } from "@/lib/signatureHtml";
import { useCountryDetection } from "@/hooks/useCountryDetection";
import { Country, getCountryByCode, getDefaultCountry } from "@/lib/countries";

const STORAGE_KEY = "email-signature-data";
const MAX_AVATAR_BYTES = 20 * 1024 * 1024;

// Icons as inline SVGs for crisp rendering
const Icons = {
  x: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
  copy: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  ),
  check: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  help: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <path d="M12 17h.01"/>
    </svg>
  ),
  alertCircle: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" x2="12" y1="8" y2="12"/>
      <line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>
  ),
  trash: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/>
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/>
      <path d="M14 11v6"/>
    </svg>
  )
};

export default function Home() {
  const defaultCountry = getDefaultCountry();
  const [data, setData] = useState<SignatureData>({
    name: "",
    pronouns: "",
    title: "",
    phone: "",
    countryCode: defaultCountry.code,
    dialCode: defaultCountry.dialCode,
    avatarUrl: ""
  });
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [countryInitialized, setCountryInitialized] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [storageWarning, setStorageWarning] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-detect country from IP
  const { country: detectedCountry, isLoading: isCountryLoading } = useCountryDetection();

  const signaturePayload = useMemo(() => buildSignatureHtml(data), [data]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<SignatureData>;
        if (
          typeof parsed?.name === "string"
          && typeof parsed?.title === "string"
          && typeof parsed?.phone === "string"
        ) {
          // Look up country if stored, otherwise use default
          const storedCountry = parsed.countryCode ? getCountryByCode(parsed.countryCode) : null;
          const countryToUse = storedCountry || defaultCountry;

          setData({
            name: parsed.name,
            pronouns: typeof parsed.pronouns === "string" ? parsed.pronouns : "",
            title: parsed.title,
            phone: parsed.phone,
            countryCode: countryToUse.code,
            dialCode: countryToUse.dialCode,
            avatarUrl: typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : ""
          });

          // If we loaded a stored country, mark as initialized
          if (storedCountry) {
            setCountryInitialized(true);
          }
        }
      } catch {
        // Ignore malformed stored data.
      }
    }

    setHasLoaded(true);
  }, []);

  // Apply detected country only if no stored country was found
  useEffect(() => {
    if (hasLoaded && !countryInitialized && !isCountryLoading && detectedCountry) {
      setData((prev) => ({
        ...prev,
        countryCode: detectedCountry.code,
        dialCode: detectedCountry.dialCode
      }));
      setCountryInitialized(true);
    }
  }, [hasLoaded, countryInitialized, isCountryLoading, detectedCountry]);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStorageWarning("");
    } catch {
      setStorageWarning("Storage is full. Your avatar will not persist after refresh.");
    }
  }, [data, hasLoaded]);

  const setField = (field: keyof SignatureData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const clearField = (field: keyof SignatureData) => {
    setData((prev) => ({ ...prev, [field]: "" }));
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/avatar", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message = payload?.error || "We could not upload that file.";
      throw new Error(message);
    }

    const payload = await response.json();
    if (!payload?.url) {
      throw new Error("We could not upload that file.");
    }

    return payload.url as string;
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarError("");

    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image must be 20 MB or less.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setIsAvatarUploading(true);
    try {
      const url = await uploadAvatar(file);
      setData((prev) => ({ ...prev, avatarUrl: url }));
      setAvatarError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not upload that file.";
      setAvatarError(message);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const removeAvatar = () => {
    setData((prev) => ({ ...prev, avatarUrl: "" }));
    setAvatarError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCountrySelect = (country: Country) => {
    setData((prev) => ({
      ...prev,
      countryCode: country.code,
      dialCode: country.dialCode
    }));
  };

  // Get current selected country for the selector
  const selectedCountry = getCountryByCode(data.countryCode) || defaultCountry;

  const copySignature = async () => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([signaturePayload.html], { type: "text/html" });
        const textBlob = new Blob([signaturePayload.plainText], { type: "text/plain" });
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
          <p>Fill in your details and copy the signature to your email client.</p>
        </header>

        <section className="content-grid">
          {/* Form Card */}
          <div className="card form-card fade-up delay-1">
            <div className="field">
              <label className="field-label" htmlFor="name">Name</label>
              <div className="input-wrap">
                <input
                  id="name"
                  className="input"
                  value={data.name}
                  placeholder="Alex Morgan"
                  onChange={(e) => setField("name", e.target.value)}
                />
                {data.name && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => clearField("name")}
                    aria-label="Clear name"
                  >
                    {Icons.x}
                  </button>
                )}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="pronouns">Pronouns</label>
              <div className="input-wrap">
                <input
                  id="pronouns"
                  className="input"
                  value={data.pronouns}
                  onChange={(e) => setField("pronouns", e.target.value)}
                />
                {data.pronouns && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => clearField("pronouns")}
                    aria-label="Clear pronouns"
                  >
                    {Icons.x}
                  </button>
                )}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="title">Title</label>
              <div className="input-wrap">
                <input
                  id="title"
                  className="input"
                  value={data.title}
                  placeholder="Product Designer"
                  onChange={(e) => setField("title", e.target.value)}
                />
                {data.title && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => clearField("title")}
                    aria-label="Clear title"
                  >
                    {Icons.x}
                  </button>
                )}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="phone">Phone</label>
              <div className="input-wrap phone-input-wrap">
                <CountryCodeSelector
                  selectedCountry={selectedCountry}
                  onSelect={handleCountrySelect}
                  isLoading={isCountryLoading && !countryInitialized}
                />
                <input
                  id="phone"
                  className="input phone-input"
                  value={data.phone}
                  placeholder="(555) 123-4567"
                  onChange={(e) => setField("phone", e.target.value)}
                />
                {data.phone && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => clearField("phone")}
                    aria-label="Clear phone"
                  >
                    {Icons.x}
                  </button>
                )}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="avatar">Avatar</label>
              <div className="avatar-row">
                <input
                  id="avatar"
                  ref={fileInputRef}
                  className="input file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isAvatarUploading}
                />
                {data.avatarUrl && (
                  <button
                    type="button"
                    className="btn btn-ghost avatar-remove"
                    onClick={removeAvatar}
                    aria-label="Remove avatar"
                    disabled={isAvatarUploading}
                  >
                    {Icons.trash}
                    Remove
                  </button>
                )}
              </div>
              <div className="field-hint">PNG, JPG, or WebP up to 20 MB.</div>
              {isAvatarUploading && (
                <div className="field-message" role="status" aria-live="polite">
                  Uploading avatar...
                </div>
              )}
              {avatarError && (
                <div className="field-message field-error" role="status" aria-live="polite">
                  {Icons.alertCircle}
                  {avatarError}
                </div>
              )}
              {storageWarning && data.avatarUrl && (
                <div className="field-message field-warning" role="status" aria-live="polite">
                  {Icons.alertCircle}
                  {storageWarning}
                </div>
              )}
            </div>

          </div>

          {/* Preview Card */}
          <div className="card fade-up delay-2">
            <div className="preview-section">
              <div className="preview-header">
                <div className="preview-title">Live preview</div>
                <div className="toggle" role="tablist" aria-label="Preview theme">
                  <button
                    type="button"
                    className={previewTheme === "light" ? "active" : ""}
                    onClick={() => setPreviewTheme("light")}
                    role="tab"
                    aria-selected={previewTheme === "light"}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    className={previewTheme === "dark" ? "active" : ""}
                    onClick={() => setPreviewTheme("dark")}
                    role="tab"
                    aria-selected={previewTheme === "dark"}
                  >
                    Dark
                  </button>
                </div>
              </div>
              <SignaturePreview data={data} theme={previewTheme} />
              <div className="actions">
                <button
                  type="button"
                  className={`btn btn-primary ${copyStatus === "copied" ? "success" : ""}`}
                  onClick={copySignature}
                >
                  {copyStatus === "copied" ? Icons.check : Icons.copy}
                  {copyStatus === "copied" ? "Copied!" : "Copy Signature"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(true)}
                >
                  {Icons.help}
                  How to import
                </button>
              </div>
              {copyStatus === "error" && (
                <span className="copy-status error" role="status" aria-live="polite">
                  {Icons.alertCircle}
                  Copy failed. Please try again.
                </span>
              )}
            </div>
          </div>
        </section>
      </div>

      <ImportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
