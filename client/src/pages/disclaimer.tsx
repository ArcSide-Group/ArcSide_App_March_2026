import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">

        <div className="flex items-center space-x-3 p-6 pb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full bg-secondary/50">
              <i className="fas fa-arrow-left text-sm"></i>
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">Liability Disclaimer</h1>
            <p className="text-xs text-muted-foreground">Legal Notice — Read Before Use</p>
          </div>
        </div>

        <div className="px-6 space-y-4 pb-8">

          <div className="warning-banner">
            <i className="fas fa-exclamation-triangle mt-0.5 shrink-0"></i>
            <span>
              All calculations are estimates only. Always verify results with a qualified welding engineer or inspector before applying them in production.
            </span>
          </div>

          <Card className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shield-alt text-primary text-sm"></i>
                </div>
                <h2 className="font-bold text-base">ArcSide™ Liability Notice</h2>
              </div>
              <Badge variant="secondary" className="text-xs">Effective: March 2026</Badge>

              <div className="industrial-divider"></div>

              <section className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">1. Informational Use Only</h3>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  ArcSide and all tools, calculators, AI-generated outputs, and Weld Procedure Specification (WPS) drafts
                  provided within this application are intended solely for <strong className="text-foreground">educational and informational reference purposes</strong>.
                  They do not constitute professional engineering advice, certified welding procedures, or code-compliant documentation.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">2. No Warranty of Accuracy</h3>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  Calculations performed by ArcSide's welding calculators are based on empirical formulas, industry guidelines
                  (including AWS D1.1, ASME Section IX, and Lincoln Electric reference data), and AI-assisted analysis. Results
                  may vary from actual welding conditions due to material variability, equipment calibration, operator technique,
                  environmental factors, and the inherent limitations of simplified mathematical models.
                </p>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  <strong className="text-foreground">ArcSide makes no warranty, express or implied</strong>, regarding the accuracy,
                  completeness, reliability, or fitness for a particular purpose of any calculated value or AI-generated recommendation.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">3. Critical Applications</h3>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  For structural welding, pressure vessel fabrication, pipeline work, aerospace applications, or any
                  safety-critical welding, you <strong className="text-foreground">must</strong>:
                </p>
                <ul className="text-xs text-slate-900 dark:text-slate-100 space-y-1.5 mt-1">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    Obtain a certified Welding Procedure Specification (WPS) from a qualified Certified Welding Inspector (CWI) or Welding Engineer
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    Qualify procedures per the applicable code (AWS D1.1, ASME IX, API 1104, or equivalent)
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    Perform required Procedure Qualification Records (PQR) and Welder Performance Qualifications (WPQ)
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    Conduct appropriate non-destructive examination (NDE) as required by the governing code
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">4. AI-Generated Content</h3>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  ArcSide uses Google Gemini 2.0 Flash to power its AI Defect Analyzer, Weld Assistant, Material Compatibility
                  Checker, WPS Generator, and Terminology tools. AI-generated content can contain errors, hallucinations, or
                  outdated information. Never rely solely on AI analysis for acceptance or rejection of welds in code work.
                  All AI outputs require review by a qualified person.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">5. Limitation of Liability</h3>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  To the maximum extent permitted by applicable law, ArcSide, its developers, and affiliated parties shall not
                  be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from the
                  use or misuse of this application — including but not limited to weld failures, equipment damage, personal
                  injury, property damage, or economic losses.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">6. User Responsibility</h3>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  By using ArcSide, you acknowledge that you are a trained welding professional or are operating under the
                  supervision of one. You accept full responsibility for verifying all parameters, obtaining appropriate
                  engineering sign-off, and ensuring compliance with all applicable codes, standards, and regulations in
                  your jurisdiction.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">7. Applicable Standards Referenced</h3>
                <ul className="text-xs text-slate-900 dark:text-slate-100 space-y-1">
                  <li><span className="text-foreground font-medium">AWS D1.1</span> — Structural Welding Code (Steel)</li>
                  <li><span className="text-foreground font-medium">AWS D1.2</span> — Structural Welding Code (Aluminum)</li>
                  <li><span className="text-foreground font-medium">ASME Section IX</span> — Welding & Brazing Qualifications</li>
                  <li><span className="text-foreground font-medium">API 1104</span> — Welding of Pipelines</li>
                  <li><span className="text-foreground font-medium">AWS A2.4</span> — Welding Symbols</li>
                  <li><span className="text-foreground font-medium">AWS A3.0</span> — Welding Terms and Definitions</li>
                  <li><span className="text-foreground font-medium">OSHA 29 CFR 1910.252</span> — Welding Safety</li>
                </ul>
              </section>

              <div className="industrial-divider"></div>

              <div className="text-xs text-slate-900 dark:text-slate-100 text-center space-y-1">
                <p>Questions? Contact your certified welding engineer.</p>
                <p>ArcSide™ is a field reference tool — not a code authority.</p>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <a href="mailto:info@arcside.co.za" className="text-primary hover:underline flex items-center gap-1" data-testid="link-disclaimer-email">
                    <i className="fas fa-envelope text-[10px]"></i>
                    info@arcside.co.za
                  </a>
                  <a href="tel:+27796819319" className="text-primary hover:underline flex items-center gap-1" data-testid="link-disclaimer-phone">
                    <i className="fas fa-phone text-[10px]"></i>
                    +27 79 681 9319
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/">
            <Button className="w-full" variant="outline">
              <i className="fas fa-home mr-2"></i>
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
