import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { X, Info, ChevronDown } from 'lucide-react';

interface DrawerFormData {
  category: string;
  severity: string;
  toolTested: string;
  issueTitle: string;
  description: string;
  deviceInfo: string;
  phoneNumber: string;
}

const EMPTY_FORM: DrawerFormData = {
  category: '',
  severity: '',
  toolTested: '',
  issueTitle: '',
  description: '',
  deviceInfo: '',
  phoneNumber: '',
};

export default function FeedbackDrawer() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showPhases, setShowPhases] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<DrawerFormData>(EMPTY_FORM);

  const { data: user } = useQuery<any>({ queryKey: ['/api/auth/user'] });

  const userName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`.trim()
    : '';
  const userEmail = user?.email ?? '';

  const fieldClass =
    'w-full bg-[#0a0a0a] text-[#e0e0e0] border border-[#2a2a2a] rounded px-3 py-2.5 text-sm transition-colors focus:border-[#5DBBFF] focus:outline-none placeholder:text-[#555] appearance-none';

  const labelClass = 'block text-[10px] text-[#b0b0b0] uppercase tracking-widest font-bold mb-1';

  const handleSubmit = async () => {
    if (!form.category || !form.severity || !form.issueTitle || !form.description || !form.deviceInfo) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please fill in Category, Severity, Issue Title, Description, and Device Info.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/beta-feedback-detailed', {
        ...form,
        userName,
        userEmail,
      });
      toast({
        title: 'Feedback Submitted',
        description: 'Your report has been sent to the ArcSide team. Thank you!',
      });
      setForm(EMPTY_FORM);
      setIsOpen(false);
    } catch {
      toast({
        title: 'Submission Failed',
        description: 'Please try again or email info@arcside.co.za.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (field: keyof DrawerFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <>
      {/* Fixed vertical tab — right edge, vertically centred */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 pointer-events-auto">
        <button
          onClick={() => setIsOpen(true)}
          data-testid="button-feedback-tab"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            backgroundColor: '#5DBBFF',
            color: '#0a0a0a',
            border: 'none',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '14px 8px',
            borderTopRightRadius: '6px',
            borderBottomRightRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 0 18px rgba(93,187,255,0.4)',
          }}
          aria-label="Open Beta Feedback drawer"
        >
          ⚡ Feedback
        </button>
      </div>

      {/* Dark overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: '#1a1a1a', borderLeft: '1px solid #2a2a2a' }}
        role="dialog"
        aria-modal="true"
        aria-label="Beta Feedback"
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid #2a2a2a' }}
        >
          <span
            style={{
              color: '#5DBBFF',
              fontFamily: "'Montserrat', 'Inter', sans-serif",
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            ⚡ Beta Feedback
          </span>
          <button
            onClick={() => setIsOpen(false)}
            data-testid="button-close-drawer"
            style={{ color: '#b0b0b0', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            aria-label="Close feedback drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">

          {/* Beta phases info bubble */}
          <div
            style={{
              background: 'rgba(93,187,255,0.06)',
              border: '1px solid rgba(93,187,255,0.25)',
              borderRadius: '6px',
              padding: '10px 12px',
            }}
          >
            <button
              className="flex items-center gap-2 w-full text-left"
              style={{ color: '#5DBBFF', fontSize: '12px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => setShowPhases((p) => !p)}
              data-testid="button-toggle-phases"
            >
              <Info size={13} />
              <span>Beta Testing Phases</span>
              <ChevronDown
                size={13}
                style={{
                  marginLeft: 'auto',
                  transition: 'transform 0.2s',
                  transform: showPhases ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            {showPhases && (
              <div className="mt-3 space-y-2" style={{ fontSize: '12px', color: '#b0b0b0' }}>
                <p>
                  <span style={{ color: '#5DBBFF', fontWeight: 700 }}>Phase 1: </span>
                  Explore all 13 Tools (Welding, Fabrication, Project, and AI).
                </p>
                <p>
                  <span style={{ color: '#5DBBFF', fontWeight: 700 }}>Phase 2: </span>
                  Real-World Testing — poor lighting, network interruptions, offline sync.
                </p>
                <p>
                  <span style={{ color: '#5DBBFF', fontWeight: 700 }}>Phase 3: </span>
                  Issue Reporting — crashes, calculation inaccuracies, UI clarity.
                </p>
              </div>
            )}
          </div>

          {/* Auto-captured user info */}
          <div
            style={{
              background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              padding: '10px 12px',
            }}
          >
            <p className={labelClass}>Submitting As</p>
            <p style={{ fontSize: '13px', color: '#e0e0e0', fontWeight: 600, marginBottom: 2 }}>
              {userName || '—'}
            </p>
            <p style={{ fontSize: '12px', color: '#b0b0b0' }}>{userEmail || '—'}</p>
          </div>

          {/* Category */}
          <div>
            <label className={labelClass} htmlFor="fb-category">Category *</label>
            <select
              id="fb-category"
              value={form.category}
              onChange={update('category')}
              className={fieldClass}
              data-testid="select-feedback-category"
            >
              <option value="">— Select Category —</option>
              <option value="Bug Report">🐛 Bug Report</option>
              <option value="Feature Request">💡 Feature Request</option>
              <option value="UX Feedback">🎨 UX Feedback</option>
              <option value="Accuracy Issue">🎯 Accuracy Issue</option>
              <option value="Performance">⚡ Performance</option>
              <option value="Other">📝 Other</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className={labelClass} htmlFor="fb-severity">Severity *</label>
            <select
              id="fb-severity"
              value={form.severity}
              onChange={update('severity')}
              className={fieldClass}
              data-testid="select-feedback-severity"
            >
              <option value="">— Select Severity —</option>
              <option value="Critical">🔴 Critical (Blocks work)</option>
              <option value="High">🟠 High (Major issue)</option>
              <option value="Medium">🟡 Medium (Minor issue)</option>
              <option value="Low">🟢 Low (Nice to have)</option>
            </select>
          </div>

          {/* Tool Tested */}
          <div>
            <label className={labelClass} htmlFor="fb-tool">Tool Tested</label>
            <select
              id="fb-tool"
              value={form.toolTested}
              onChange={update('toolTested')}
              className={fieldClass}
              data-testid="select-feedback-tool"
            >
              <option value="">— Select Tool (Optional) —</option>
              <optgroup label="⚙️ Welding">
                <option value="Voltage & Amperage Calculator">Voltage &amp; Amperage Calculator</option>
                <option value="Wire Feed Speed Calculator">Wire Feed Speed Calculator</option>
                <option value="Heat Input Calculator">Heat Input Calculator</option>
                <option value="Gas Flow Rate Calculator">Gas Flow Rate Calculator</option>
              </optgroup>
              <optgroup label="🔧 Fabrication">
                <option value="Metal Weight Calculator">Metal Weight Calculator</option>
                <option value="Bend Allowance Calculator">Bend Allowance Calculator</option>
              </optgroup>
              <optgroup label="📋 Project">
                <option value="Project Planning">Project Planning</option>
                <option value="Project Cost Calculator">Project Cost Calculator</option>
                <option value="Weld Time Estimator">Weld Time Estimator</option>
              </optgroup>
              <optgroup label="🤖 AI">
                <option value="AI Material Checker">AI Material Checker</option>
                <option value="AI Terminology Guide">AI Terminology Guide</option>
                <option value="AI Weld Assistant">AI Weld Assistant</option>
                <option value="AI Process Optimizer Pro">AI Process Optimizer Pro</option>
              </optgroup>
              <option value="General / Other">General / Other</option>
            </select>
          </div>

          {/* Issue Title */}
          <div>
            <label className={labelClass} htmlFor="fb-title">Issue Title *</label>
            <input
              id="fb-title"
              type="text"
              value={form.issueTitle}
              onChange={update('issueTitle')}
              placeholder="Brief summary of the issue"
              className={fieldClass}
              data-testid="input-feedback-title"
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass} htmlFor="fb-desc">Detailed Description *</label>
            <textarea
              id="fb-desc"
              value={form.description}
              onChange={update('description')}
              placeholder="Steps to reproduce, expected vs actual result..."
              rows={4}
              className={`${fieldClass} resize-none`}
              data-testid="textarea-feedback-description"
            />
          </div>

          {/* Device Info */}
          <div>
            <label className={labelClass} htmlFor="fb-device">Device Info *</label>
            <input
              id="fb-device"
              type="text"
              value={form.deviceInfo}
              onChange={update('deviceInfo')}
              placeholder="e.g., iPhone 14 Pro, iOS 17.2"
              className={fieldClass}
              data-testid="input-feedback-device"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className={labelClass} htmlFor="fb-phone">Phone Number (Optional)</label>
            <input
              id="fb-phone"
              type="tel"
              value={form.phoneNumber}
              onChange={update('phoneNumber')}
              placeholder="+27 (0) 79 681 9319"
              className={fieldClass}
              data-testid="input-feedback-phone"
            />
          </div>

          {/* Spacer so the submit button sticky footer doesn't overlap last field */}
          <div style={{ height: 8 }} />
        </div>

        {/* Submit — always visible, pinned to bottom */}
        <div className="shrink-0 px-4 py-3" style={{ borderTop: '1px solid #2a2a2a' }}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            data-testid="button-submit-drawer-feedback"
            style={{
              width: '100%',
              backgroundColor: isSubmitting ? '#3a3a3a' : '#5DBBFF',
              color: '#0a0a0a',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '14px',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: isSubmitting ? 'none' : '0 0 16px rgba(93,187,255,0.3)',
            }}
          >
            {isSubmitting ? 'SUBMITTING…' : 'SUBMIT FEEDBACK'}
          </button>
          <p
            style={{ fontSize: '11px', color: '#555', textAlign: 'center', marginTop: 8 }}
          >
            Sent to info@arcside.co.za via secure channel
          </p>
        </div>
      </div>
    </>
  );
}
