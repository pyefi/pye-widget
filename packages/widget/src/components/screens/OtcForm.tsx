import { useState } from "react";
import { useWidgetStore } from "../../stores/widget-store";
import { c, font } from "../design-system";
import { Body, CTA, StepHeader, SuccessHeader, Spacer, StepTitle } from "../shared/Layout";
import { TextField, ChoiceGroup, isOther } from "../shared/FormControls";

interface FormFields {
  name: string;
  organization: string;
  contact: string;
  describes: string | null;
  describesOther: string;
  requestType: string | null;
  requestTypeOther: string;
  solAmount: string;
  timeframe: string;
  validator: string;
}

const EMPTY: FormFields = {
  name: "",
  organization: "",
  contact: "",
  describes: null,
  describesOther: "",
  requestType: null,
  requestTypeOther: "",
  solAmount: "",
  timeframe: "",
  validator: "",
};

const DESCRIBES = ["Validator", "Existing User", "Potential User"];

// Request-type labels — exported so entry points can pre-select the right one.
export const OTC_REQUEST_EARLY_REDEEM = "Early principal redemption";
export const OTC_REQUEST_OVERSIZED = "OTC liquidity for staking rewards (too large for orderbook)";
const REQUEST_TYPES = [OTC_REQUEST_EARLY_REDEEM, OTC_REQUEST_OVERSIZED];

const TOTAL_STEPS = 3;

export default function OtcForm() {
  const goBack = useWidgetStore((s) => s.goBack);
  const prefill = useWidgetStore((s) => s.otcPrefill);

  const [step, setStep] = useState(0);
  // Seed steps 2–3 from context (request type / validator / amount); the user
  // still lands on step 1 (contact) — the only thing we don't already know.
  const [fields, setFields] = useState<FormFields>(() => ({
    ...EMPTY,
    requestType: prefill?.requestType ?? null,
    validator: prefill?.validator ?? "",
    solAmount: prefill?.solAmount ?? "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormFields>(key: K, value: FormFields[K]) =>
    setFields((f) => ({ ...f, [key]: value }));

  const step1Valid = fields.contact.trim() !== "";
  const step2Valid =
    fields.requestType !== null &&
    (!isOther(fields.requestType) || fields.requestTypeOther.trim() !== "");

  const handleSubmit = () => {
    if (submitting) return;
    setSubmitting(true);
    // Mocked submission — the real backend wiring lands here later.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <>
        <SuccessHeader label="Request received" onClose={goBack} />
        <Body>
          <Spacer />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(13, 156, 94, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M3 8.5L6.5 12L13 5" stroke={c.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p style={font(18, c.primary, 500)}>Thanks — we'll be in touch</p>
            <p style={font(14, c.secondary)}>
              We've received your request and the Pye team will reach out using the contact
              details you provided.
            </p>
          </div>
          <Spacer />
          <CTA label="Done" onClick={goBack} purple />
        </Body>
      </>
    );
  }

  const onBack = step === 0 ? goBack : () => setStep((s) => s - 1);

  const continueDisabled =
    (step === 0 && !step1Valid) || (step === 1 && !step2Valid);

  const ctaLabel = step === TOTAL_STEPS - 1 ? (submitting ? "Sending…" : "Submit") : "Continue";

  const onContinue = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else handleSubmit();
  };

  return (
    <>
      <StepHeader step={step + 1} total={TOTAL_STEPS} onBack={onBack} />
      <Body>
        {step === 0 && (
          <>
            <StepTitle
              title="Need liquidity outside the orderbook?"
              subtitle="If you're holding Principal Tokens and need to redeem early, or have a position too large for the orderbook to fill, fill this out and we'll be in touch."
            />
            <TextField
              label="Name"
              placeholder="Your name"
              value={fields.name}
              onChange={(v) => set("name", v)}
            />
            <TextField
              label="Name of Organization"
              placeholder="Optional"
              value={fields.organization}
              onChange={(v) => set("organization", v)}
            />
            <TextField
              label="How should we reach you?"
              subtitle="If telegram put @name, otherwise your email address"
              placeholder="@handle or email"
              value={fields.contact}
              onChange={(v) => set("contact", v)}
              required
            />
          </>
        )}

        {step === 1 && (
          <>
            <StepTitle title="About you" />
            <ChoiceGroup
              label="What best describes you?"
              options={DESCRIBES}
              value={fields.describes}
              onChange={(v) => set("describes", v)}
              otherValue={fields.describesOther}
              onOtherChange={(v) => set("describesOther", v)}
            />
            <ChoiceGroup
              label="Request Type"
              options={REQUEST_TYPES}
              value={fields.requestType}
              onChange={(v) => set("requestType", v)}
              required
              otherValue={fields.requestTypeOther}
              onOtherChange={(v) => set("requestTypeOther", v)}
            />
          </>
        )}

        {step === 2 && (
          <>
            <StepTitle title="Deal details" />
            <TextField
              label="How much SOL are you looking to move?"
              placeholder="e.g. 5,000 SOL"
              value={fields.solAmount}
              onChange={(v) => set("solAmount", v)}
            />
            <TextField
              label="How soon do you need this resolved?"
              placeholder="e.g. within 2 weeks"
              value={fields.timeframe}
              onChange={(v) => set("timeframe", v)}
            />
            <TextField
              label="Current Validator"
              subtitle="If LST, please put that in as well"
              placeholder="Validator or LST"
              value={fields.validator}
              onChange={(v) => set("validator", v)}
            />
          </>
        )}

        <Spacer />
        <CTA
          label={ctaLabel}
          onClick={onContinue}
          disabled={continueDisabled || submitting}
          purple
        />
      </Body>
    </>
  );
}
