import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PRO_FIRST_CHARGE_ZAR,
  PRO_RECURRING_ZAR,
  TRIAL_DURATION_HOURS,
  formatZar,
} from '@shared/pricing';
import { DISCLAIMER_LAST_UPDATED, formatDisclaimerDate } from '@shared/disclaimer';

export default function Disclaimer() {
  const lastUpdated = formatDisclaimerDate(DISCLAIMER_LAST_UPDATED);

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
            <h1 className="text-lg font-bold">Legal &amp; Privacy Notice</h1>
            <p className="text-xs text-muted-foreground" data-testid="text-disclaimer-last-updated">
              Last updated: {lastUpdated}
            </p>
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
              <Badge variant="secondary" className="text-xs">Effective: {lastUpdated}</Badge>

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
                  (including AWS D1.1, ASME Section IX, ISO 15614-1, and Lincoln Electric reference data), and AI-assisted analysis. Results
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
                    Qualify procedures per the applicable code (AWS D1.1, ASME IX, ISO 15614-1, API 1104, or equivalent)
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
                  ArcSide uses Google Gemini 2.5 Flash to power its AI Defect Analyzer, Weld Assistant, Material Compatibility
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

              <div className="industrial-divider"></div>

              {/* POPIA */}
              <section className="space-y-2" data-testid="section-popia">
                <h3 className="font-semibold text-sm text-foreground">7. POPIA — South African Data Protection</h3>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  ArcSide is based in South Africa and processes personal information in accordance with the
                  <strong className="text-foreground"> Protection of Personal Information Act, No. 4 of 2013 (POPIA)</strong>.
                </p>
                <ul className="text-xs text-slate-900 dark:text-slate-100 space-y-1.5 mt-1">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    <span><strong className="text-foreground">Information collected:</strong> account details (name, email, optional phone &amp; company), authentication identifiers, subscription &amp; billing references, your project content (WPS drafts, weld log entries, calculator inputs), AI prompts and responses, and basic usage telemetry.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    <span><strong className="text-foreground">Purpose:</strong> to provide and improve the service, secure your account, process payments via PayFast, send transactional emails, and respond to support enquiries.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    <span><strong className="text-foreground">Legal basis:</strong> performance of the contract you accept on signup, your consent (e.g. enterprise enquiries, marketing emails) and our legitimate interests in service security and improvement.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    <span><strong className="text-foreground">Sub-processors:</strong> Neon (PostgreSQL hosting), Google (OAuth login &amp; Gemini AI), Resend (email delivery), PayFast (payments), Replit (hosting). Each receives only the data needed for their function.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    <span><strong className="text-foreground">Your rights:</strong> access, correction, deletion, objection, withdrawal of consent, and complaint to the Information Regulator. Contact <a href="mailto:info@arcside.co.za" className="text-primary hover:underline">info@arcside.co.za</a> to exercise any of these.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    <span><strong className="text-foreground">Retention:</strong> account data is kept while your account is active and for up to 24 months after closure for tax and audit purposes, after which it is deleted or anonymised.</span>
                  </li>
                </ul>
              </section>

              <div className="industrial-divider"></div>

              {/* GDPR */}
              <section className="space-y-2" data-testid="section-gdpr">
                <h3 className="font-semibold text-sm text-foreground">8. GDPR — Users in the European Economic Area</h3>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  If you access ArcSide from the EEA or UK, the
                  <strong className="text-foreground"> EU General Data Protection Regulation (Regulation 2016/679)</strong> and
                  UK GDPR apply in addition to POPIA. You have the right to:
                </p>
                <ul className="text-xs text-slate-900 dark:text-slate-100 space-y-1.5 mt-1">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    Access, rectify, erase or port the personal data we hold about you
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    Restrict or object to processing, including profiling
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    Withdraw consent at any time without affecting prior lawful processing
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    Lodge a complaint with your local supervisory authority
                  </li>
                </ul>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  Data may be transferred to South Africa and the United States (where Google &amp; Replit operate).
                  These transfers rely on Standard Contractual Clauses and our sub-processors' equivalent safeguards.
                  The data controller is ArcSide, contactable at
                  <a href="mailto:info@arcside.co.za" className="text-primary hover:underline"> info@arcside.co.za</a>.
                </p>
              </section>

              <div className="industrial-divider"></div>

              {/* Auto-renewal */}
              <section className="space-y-2" data-testid="section-auto-renewal">
                <h3 className="font-semibold text-sm text-foreground">9. Subscription, Trial &amp; Auto-Renewal</h3>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  ArcSide Pro is a paid subscription billed in South African Rand (ZAR) through PayFast. By starting a trial
                  or subscribing, you authorise the following recurring charges:
                </p>
                <ul className="text-xs text-slate-900 dark:text-slate-100 space-y-1.5 mt-1">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    <span><strong className="text-foreground">Free trial:</strong> {TRIAL_DURATION_HOURS} hours from activation, no charge.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    <span><strong className="text-foreground">First month:</strong> {formatZar(PRO_FIRST_CHARGE_ZAR)} charged automatically when the trial ends, unless you cancel before then.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    <span><strong className="text-foreground">Recurring:</strong> {formatZar(PRO_RECURRING_ZAR)} per month, charged on the same day each cycle, until you cancel.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    <span><strong className="text-foreground">Cancellation:</strong> available at any time from the in-app Subscription page. You keep Pro access until the end of the period you've already paid for. No partial refunds are issued for unused days.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    <span><strong className="text-foreground">Price changes:</strong> we will notify you by email at least 14 days before any change to the recurring price. Continued use after the change date constitutes acceptance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-accent mt-0.5 shrink-0 text-[10px]"></i>
                    <span><strong className="text-foreground">Failed payments:</strong> if a charge fails, we may retry within 7 days and pause your Pro access until payment succeeds.</span>
                  </li>
                </ul>
              </section>

              <div className="industrial-divider"></div>

              <section className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">10. Applicable Standards Referenced</h3>
                <ul className="text-xs text-slate-900 dark:text-slate-100 space-y-1">
                  <li><span className="text-foreground font-medium">AWS D1.1</span> — Structural Welding Code (Steel)</li>
                  <li><span className="text-foreground font-medium">AWS D1.2</span> — Structural Welding Code (Aluminum)</li>
                  <li><span className="text-foreground font-medium">ASME Section IX</span> — Welding &amp; Brazing Qualifications</li>
                  <li><span className="text-foreground font-medium">ISO 15614-1</span> — Specification &amp; qualification of welding procedures</li>
                  <li><span className="text-foreground font-medium">ISO 13916</span> — Heat input measurement</li>
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
