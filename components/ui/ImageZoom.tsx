"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageZoomProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  preload?: boolean;
  quality?: number;
  sizes?: string;
}

export function ImageZoom({
  src,
  alt,
  width,
  height,
  className,
  preload,
  quality = 90,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: ImageZoomProps) {
  return (
    <div className={cn("overflow-hidden bg-bg-surface", className)}>
      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="h-full w-full"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          preload={preload}
          quality={quality}
          sizes={sizes}
          className="h-full w-full object-cover"
        />
      </motion.div>
    </div>
  );
}
