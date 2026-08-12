import { useRef, useState } from "react";
import { uploadImage, validateImageFile } from "@/services/imageUploadService";
import toast from "react-hot-toast";

/** Single image picker for avatar or cover */
export default function ProfileImageField({ label, value, onChange, variant = "avatar" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    const v = validateImageFile(file);
    if (!v.valid) {
      toast.error(v.error);
      return;
    }
    setUploading(true);
    try {
      const { url } = await uploadImage(file, () => {});
      onChange(url);
      toast.success(`${label} updated`);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isCover = variant === "cover";

  return (
    <div>
      <label
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--text-secondary)",
          display: "block",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div
        style={{
          position: "relative",
          borderRadius: isCover ? "var(--radius-lg)" : "50%",
          overflow: "hidden",
          width: isCover ? "100%" : 88,
          height: isCover ? 120 : 88,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          cursor: uploading ? "wait" : "pointer",
        }}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {value ? (
          <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--text-muted)",
              fontSize: 12,
            }}
          >
            Upload
          </div>
        )}
        {uploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 12,
            }}
          >
            Uploading…
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
