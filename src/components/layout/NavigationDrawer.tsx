import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileText, ClipboardList, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NavigationDrawer = ({ open, onOpenChange }: NavigationDrawerProps) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Intake Form",
      href: "/intake",
      icon: FileText,
      description: "Submit a new intake form",
    },
    {
      title: "Check Status",
      href: "/intake/status",
      icon: ClipboardList,
      description: "Check the status of your intake",
    },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-96 p-0 [&>button]:hidden"
        style={{ backgroundColor: 'var(--brand-color)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-2xl font-bold text-foreground">
                  Navigation
                </SheetTitle>
                <SheetDescription className="text-muted-foreground mt-1">
                  Quick access to main actions
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="hover:bg-[#375b59] hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Menu Items */}
          <div className="flex-1 px-6 py-6 space-y-3 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-start gap-4 p-5 rounded-xl",
                    "bg-white/90 hover:bg-white transition-all duration-200",
                    "border border-white/40 shadow-md hover:shadow-lg",
                    "text-left group cursor-pointer",
                    "transform hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="p-3 rounded-xl bg-[#294a4a]/10 group-hover:bg-[#294a4a]/20 transition-colors">
                      <Icon className="h-6 w-6 text-[#294a4a]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1.5 text-base">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/20">
            <p className="text-xs text-muted-foreground text-center">
              Virtual Peace of Mind Dashboard
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavigationDrawer;

