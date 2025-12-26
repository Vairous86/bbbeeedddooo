import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Service } from "@/lib/localStorage";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

interface ServiceTypeCardProps {
  service: Service;
}

export const ServiceTypeCard = ({ service }: ServiceTypeCardProps) => {
  const navigate = useNavigate();
  const { currency, symbol } = useCurrency();
  const price = service.prices?.[currency] ?? 0;

  // Make the entire card clickable and accessible via keyboard (Enter / Space)
  const open = () => navigate(`/service/${service.id}`);
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
      className="gradient-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105 border-border/50 animate-fade-in cursor-pointer"
      aria-label={`Order ${service.title}`}
    >
      <CardHeader className="pb-3">
        <div className="aspect-video w-full mb-3 rounded-lg overflow-hidden">
          <img 
            src={service.image} 
            alt={service.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardTitle className="text-xl font-heading font-semibold text-foreground">
          {service.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-muted-foreground line-clamp-2 mb-4">
          {service.description}
        </CardDescription>
        <div className="flex items-center justify-between mb-4">
          <div>
            {(service.submissionType !== "text" && service.requiresPayment !== false) && (
              <>
                <span className="text-2xl font-heading font-bold text-primary">
                  {symbol}{price}
                </span>
                <span className="text-sm text-muted-foreground ml-1">/ 1000</span>
              </>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {service.deliveryTime}
          </span>
        </div>
        <Button 
          onClick={(e) => { e.stopPropagation(); open(); }}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Order Now
        </Button>
      </CardContent>
    </Card>
  );
};
