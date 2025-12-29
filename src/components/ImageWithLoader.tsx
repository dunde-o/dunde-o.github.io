import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

const ImageWithLoader = ({
  src,
  alt,
  className = "",
  containerClassName = "",
}: ImageWithLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <span className={`relative inline-block ${containerClassName}`}>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </span>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
    </span>
  );
};

export default ImageWithLoader;
