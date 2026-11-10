import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RandomEventImageProps {
  className?: string;
}

const RandomEventImage: React.FC<RandomEventImageProps> = ({ className }) => {
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * 4) + 1;
    setImageSrc(`/event-image-${randomIndex}.webp`);
  }, []);

  if (!imageSrc) {
    return <div aria-hidden="true" className={cn("bg-secondary", className)} />;
  }

  // Placeholder artwork is decorative, so it carries no alt text.
  return <img src={imageSrc} alt="" className={cn("object-cover", className)} />;
};

export default RandomEventImage;
