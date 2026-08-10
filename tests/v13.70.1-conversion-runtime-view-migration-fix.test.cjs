const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const m0=fs.readFileSync(path.join(root,'supabase/migrations/20260810161000_core_v4_70_0_conversion_runtime_commercial_event_ingestion.sql'),'utf8');
const m1=fs.readFileSync(path.join(root,'supabase/migrations/20260810171500_core_v4_70_1_conversion_runtime_view_migration_fix.sql'),'utf8');
for (const s of [m0,m1]) {
  if(!/drop view if exists public\.booking_monetization_runtime_v1;/i.test(s)) throw new Error('runtime view must be dropped before shape change');
  if(!/create view public\.booking_monetization_runtime_v1/i.test(s)) throw new Error('runtime view recreation missing');
  if(!/commercial_event_count/.test(s)||!/booking_status_changed_by_commercial/.test(s)) throw new Error('required runtime columns missing');
}
if(/create or replace view public\.booking_monetization_runtime_v1/i.test(m0)) throw new Error('42P16-prone CREATE OR REPLACE still present');
console.log('LUVIA_V13_70_1_CONVERSION_RUNTIME_VIEW_MIGRATION_FIX_OK');
