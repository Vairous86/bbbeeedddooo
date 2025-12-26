import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Platform } from "@/lib/localStorage";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

interface PlatformCardProps {
  platform: Platform;
}

export const PlatformCard = ({ platform }: PlatformCardProps) => {
  const navigate = useNavigate();

  // Make the whole card interactive (click + keyboard) and keep button behavior intact.
  const open = () => navigate(`/platform/${platform.id}`);
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={handleKey}
      className="gradient-card newyear-card shadow-card transition-all duration-300 border-border/40 animate-fade-in overflow-hidden group cursor-pointer"
      aria-label={`Open platform ${platform.name}`}
    >
      <div className="aspect-video w-full overflow-hidden relative">
        <img 
          src={platform.image} 
          alt={platform.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
        />
        {/* New Year badge */}
        <div className="absolute top-3 right-3">
          <span className="newyear-offer-badge">🎆 New Year</span>
        </div>
        <div 
          className="absolute bottom-4 left-4 text-white font-heading font-bold text-2xl glow-text"
        >
          {platform.name}
        </div>
      </div>
      <CardHeader className="pb-3">
        <CardDescription className="text-muted-foreground line-clamp-2">
          {platform.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={(e) => { e.stopPropagation(); open(); }}
          className="w-full newyear-btn text-black font-medium gap-2"
        >
          <Eye className="w-4 h-4" />
          View Services
        </Button>
      </CardContent>
    </Card>
  );
};
