"use client";

import { useEffect } from "react";

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal fade-up">
        <h2>How to import</h2>
        <div>
          <strong>Gmail</strong>
          <ol>
            <li>Open Gmail settings and go to the Signature section.</li>
            <li>Create a new signature and paste from your clipboard.</li>
            <li>Save changes at the bottom of the settings page.</li>
          </ol>
        </div>
        <div>
          <strong>macOS Mail</strong>
          <ol>
            <li>Go to Settings and open the Signatures tab.</li>
            <li>Create a new signature and paste the copied HTML.</li>
            <li>Close settings and send a test email.</li>
          </ol>
        </div>
        <div>
          <strong>iOS Mail</strong>
          <ol>
            <li>Open Settings and navigate to Mail &gt; Signature.</li>
            <li>Paste the signature into the field and save.</li>
            <li>Email yourself to verify the formatting.</li>
          </ol>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} autoFocus>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
