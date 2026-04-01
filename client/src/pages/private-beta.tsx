import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import logoPath from "@assets/image_1773535782481(2)_1774714538260.jpg";

export default function PrivateBeta() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-sm w-full mx-auto">
        <div className="text-center mb-8">
          <img
            src={logoPath}
            alt="ArcSide Mobile App"
            className="h-24 w-auto mx-auto mb-4 object-contain rounded-xl logo-glow"
            data-testid="img-private-beta-logo"
          />
        </div>

        <Card className="border-primary/30 bg-card shadow-[0_4px_24px_rgba(0,35,102,0.18)]">
          <CardHeader className="text-center pb-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-lock text-primary text-xl"></i>
            </div>
            <CardTitle className="text-xl font-bold">Closed Beta Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              ArcSide is currently in <span className="text-primary font-semibold">invite-only beta</span>. 
              Access is restricted to approved testers.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your account is not yet on the approved list. To request access, reach out to the ArcSide team directly.
            </p>

            <div className="pt-2 space-y-2">
              <a href="mailto:info@arcside.co.za?subject=Beta Access Request" className="block">
                <Button className="w-full" data-testid="button-request-access-email">
                  <i className="fas fa-envelope mr-2"></i>
                  Request Access
                </Button>
              </a>
              <a href="tel:+27796819319" className="block">
                <Button variant="outline" className="w-full" data-testid="button-request-access-phone">
                  <i className="fas fa-phone mr-2"></i>
                  +27 79 681 9319
                </Button>
              </a>
            </div>

            <div className="pt-2 border-t border-border">
              <a href="/api/logout" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="link-sign-out-beta">
                Sign out and try a different account
              </a>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          ArcSide™️ — Built by Tradesmen, For Tradesmen
        </p>
      </div>
    </div>
  );
}
