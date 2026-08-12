import { useRef, useState, useCallback } from "react";
import { uploadImage, validateImageFile, revokePreviewUrl } from "@/services/imageUploadService";

export default function ImageUpload({ onUploaded, onClear, disabled }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const clearPreview = useCallback(() => {
    if (preview?.local && preview.url?.startsWith("blob:")) revokePreviewUrl(preview.url);
    setPreview(null);
    setProgress(0);
    setError(null);
    onClear?.();
  }, [preview, onClear]);

  const processFile = async (file) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    setError(null);
    const localUrl = URL.createObjectURL(file);
    setPreview({ url: localUrl, local: true });
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadImage(file, setProgress);
      if (localUrl.startsWith("blob:")) revokePreviewUrl(localUrl);
      setPreview({ url: result.url, local: !!result.localOnly });
      onUploaded?.({
        imageUrl: result.url,
        thumbnail: result.thumbnail,
        localOnly: result.localOnly,
      });
    } catch (err) {
      setError(err.message || "Upload failed");
      if (localUrl.startsWith("blob:")) revokePreviewUrl(localUrl);
      setPreview(null);
      onClear?.();
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div style={{ marginTop: "var(--space-3)" }}>
      {!preview ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload an image"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-5)",
            textAlign: "center",
            cursor: disabled ? "not-allowed" : "pointer",
            background: dragOver ? "var(--accent-muted)" : "var(--bg-surface)",
            transition: "all var(--transition-fast)",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <svg
            width={32}
            height={32}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth={1.5}
            style={{ margin: "0 auto 8px", display: "block" }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
            Drag & drop an image, or click to browse
          </p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            JPEG, PNG, GIF, WebP · max 10MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
            style={{ display: "none" }}
            disabled={disabled || uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <img
            src={preview.url}
            alt="Upload preview"
            style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }}
          />
          {uploading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: "80%",
                  height: 4,
                  background: "var(--border)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "var(--accent)",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
              <span style={{ fontSize: 12, color: "#fff" }}>Uploading {progress}%</span>
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={clearPreview}
              aria-label="Remove image"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.6)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      )}
      {error && <p style={{ fontSize: 12, color: "var(--red)", marginTop: 8 }}>{error}</p>}
    </div>
  );
}
