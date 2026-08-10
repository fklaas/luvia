const fs=require('fs');
const assert=require('assert');
const mig=fs.readFileSync('supabase/migrations/20260810104500_core_v4_68_10_multilingual_reply_decision_classification_review_state_fix.sql','utf8');
const inbound=fs.readFileSync('supabase/functions/booking-email-inbound/index.ts','utf8');
const client=fs.readFileSync('core/booking/booking-email-v2.js','utf8');

assert(mig.includes("'0.5.0-email-multilingual'"));
assert(mig.includes("'language_groups',29"));
assert(mig.includes('decline_before_confirmation'));
assert(mig.includes("v_intent:='declined'"));
assert(mig.indexOf("v_intent:='declined'") < mig.indexOf("v_intent:='confirmed'"));
assert(mig.includes("v_review:=true;v_evidence:='[\"booking_language_without_safe_decision\"]'::jsonb"));
assert(mig.includes('v_effective_auto:=v_classifier_auto and v_trusted_sender'));
assert(mig.includes("'UNTRUSTED_EMAIL_SENDER'"));
assert(mig.includes("verification_status='verified'"));
assert(mig.includes('c.auto_usable=true'));

// Core positive phrase from the live smoke test.
assert(mig.includes('wir.{0,20}bestätigen'));
// Representative multilingual decisions.
for (const token of [
  'we.{0,20}confirm','nous.{0,20}confirmons','confirmamos','confermiamo','wij.{0,20}bevestigen',
  'bekræfter','bekräftar','bekrefter','vahvistamme','potwierdzamy','potvrzujeme','megerősítjük',
  'confirmăm','potvrđujemo','potrjujemo','потвърждаваме','επιβεβαιώνουμε','onaylıyoruz',
  'подтверждаем','підтверджуємо','نؤكد','אנו מאשרים','我们确认','ご予約','예약'
]) assert(mig.includes(token), `missing multilingual token ${token}`);

for (const lang of ["'de'","'en'","'fr'","'es'","'it'","'pt'","'nl'","'da'","'sv'","'no'","'fi'","'pl'","'cs'","'sk'","'hu'","'ro'","'hr-bs-sr'","'sl'","'bg'","'el'","'tr'","'ru'","'uk'","'ar'","'he'","'zh'","'ja'","'ko'"]) assert(mig.includes(lang));

assert(inbound.includes("version:'2.0.2',build:'13.68.10',core:'4.68.10'"));
assert(client.includes("const VERSION='1.0.5'"));
console.log('LUVIA_V13_68_10_MULTILINGUAL_REPLY_CLASSIFICATION_REVIEW_STATE_OK');
