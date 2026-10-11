"use client";

import React, { useState } from "react";
import styles from "./avatar.module.css";

export interface AvatarProps {
  name: string;
  src?: string;
  status?: "online" | "offline" | "available" | "busy" | "away";
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export function Avatar({
  name,
  src,
  status,
  size = "md",
  className = "",
  style,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials = (name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      className={[styles.avatar, styles[size], className].filter(Boolean).join(" ")}
      style={style}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          className={styles.image}
          onError={() => setImageError(true)}
          decoding="async"
          draggable={false}
        />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
      {status && (
        <span
          className={styles.dot}
          data-status={status}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

export default Avatar;
