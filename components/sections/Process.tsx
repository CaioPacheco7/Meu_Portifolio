"use client";

import dynamic from "next/dynamic";
import { ProcessList } from "@/components/sections/ProcessList";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// The 3D scene (WebGL, a tall scroll-driven stage) is only worth its weight on a large screen,
// so phones and small tablets never download or run it. While it loads, the plain list stays.
const ProcessScene = dynamic(
  () => import("@/components/sections/ProcessScene").then((m) => m.ProcessScene),
  { ssr: false, loading: () => <ProcessList /> },
);

/** "Meu Processo": the 3D scene from laptop width up, a short timeline below that. */
export function Process() {
  const large = useMediaQuery("(min-width: 1024px)");
  return large ? <ProcessScene /> : <ProcessList />;
}
