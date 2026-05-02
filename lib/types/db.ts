export type AppRole = "admin" | "student";
export type ScholarshipStatus = "active" | "draft";

export interface Provider {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
}

export interface Region {
  id: string;
  region_name: string;
}

export interface Scholarship {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string | null;
  application_link: string | null;
  status: ScholarshipStatus;
}
