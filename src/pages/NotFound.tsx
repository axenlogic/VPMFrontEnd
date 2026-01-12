import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search, FileText, AlertCircle, Sparkles } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 overflow-hidden" style={{ backgroundColor: 'var(--brand-color)' }}>
      <div className="max-w-2xl w-full mx-auto">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-6">
              {/* Animated 404 Number */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-[#294a4a]/10 rounded-full animate-ping opacity-20"></div>
                </div>
                <div className="relative">
                  <h1 className="text-8xl md:text-9xl font-bold text-[#294a4a] animate-scale-in">
                    4
                    <span className="inline-block animate-bounce" style={{ animationDelay: '0.1s' }}>
                      0
                    </span>
                    <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>
                      4
                    </span>
                  </h1>
                </div>
              </div>

              {/* Error Icon */}
              <div className="flex justify-center animate-fade-in-up animation-delay-200">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse opacity-50"></div>
                  <div className="relative p-4 bg-red-50 rounded-full border-4 border-red-200">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-3 animate-fade-in-up animation-delay-400">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                  Oops! Page Not Found
                </h2>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                  The page you're looking for doesn't exist or has been moved. Let's get you back on track!
                </p>
                {location.pathname && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <Search className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-mono text-gray-600">
                      {location.pathname}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up animation-delay-600">
                <Button
                  onClick={() => navigate("/")}
                  className="bg-[#294a4a] hover:bg-[#375b59] text-white h-12 px-8 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go to Home
                </Button>
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="border-2 border-[#294a4a] text-[#294a4a] hover:bg-[#294a4a] hover:text-white h-12 px-8 text-base font-medium transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </Button>
              </div>

              {/* Quick Links */}
              <div className="pt-8 animate-fade-in-up animation-delay-800">
                <p className="text-sm text-gray-500 mb-4">Or try one of these pages:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/intake")}
                    className="text-[#294a4a] hover:bg-[#294a4a]/10 hover:text-[#294a4a] transition-all duration-200"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Intake Form
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/intake/status")}
                    className="text-[#294a4a] hover:bg-[#294a4a]/10 hover:text-[#294a4a] transition-all duration-200"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Check Status
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/dashboard")}
                    className="text-[#294a4a] hover:bg-[#294a4a]/10 hover:text-[#294a4a] transition-all duration-200"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="flex items-center justify-center gap-2 pt-6 animate-fade-in-up animation-delay-1000">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-sm text-gray-500">We're here to help</span>
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
