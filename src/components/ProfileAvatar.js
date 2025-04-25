"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import Image from "next/image";

const ProfileAvatar = ({
  src,
  alt = "User profile",
  size = "md",
  className = "",
  fallbackClassName = "",
}) => {
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setImgError(false);
    setLoading(true);
  }, [src]);

  const sizeMappings = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
    "2xl": 64,
  };

  const dimension = sizeMappings[size] || sizeMappings.md;

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
    "2xl": "w-16 h-16",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (!src || imgError) {
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center bg-gray-700 text-gray-400 ${fallbackClassName}`}
      >
        <User size={dimension * 0.6} />
      </div>
    );
  }

  return (
    <div
      className={`relative ${sizeClass} rounded-full overflow-hidden ${className}`}
    >
      {loading && (
        <div
          className={`absolute inset-0 rounded-full bg-gray-800 animate-pulse ${fallbackClassName}`}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={dimension}
        height={dimension}
        className={`rounded-full object-cover w-full h-full ${
          loading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-200`}
        onError={() => setImgError(true)}
        onLoad={() => setLoading(false)}
        unoptimized={src.startsWith("http") || src.startsWith("https")}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default ProfileAvatar;
