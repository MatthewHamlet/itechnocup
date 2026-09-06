export type ActivityRow = {
  id: string;
  label: string;
  short_label: string;
  appliance: string;
  icon_key: string;
  va: number;
  watts: number;
  duration_min: number;
  start_min: number;
  earliest_min: number;
  latest_min: number;
  flexibility: "fixed" | "flexible";
};

export type HouseholdRow = {
  installed_va: number;
  base_load_va: number;
  reserve_fraction: number;
};

export type ProfileRow = {
  display_name: string;
  onboarded_at: string | null;
};

export const ACTIVITY_COLUMNS =
  "id,label,short_label,appliance,icon_key,va,watts,duration_min,start_min,earliest_min,latest_min,flexibility";
