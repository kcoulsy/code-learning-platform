import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyContentButtonProps {
  content: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "ghost" | "outline" | "secondary";
  label?: string;
}

export function CopyContentButton({
  content,
  className,
  size = "sm",
  variant = "outline",
  label = "Copy content",
}: CopyContentButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(className)}
      title={label}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="ml-2">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span className="ml-2">{label}</span>
        </>
      )}
    </Button>
  );
}
