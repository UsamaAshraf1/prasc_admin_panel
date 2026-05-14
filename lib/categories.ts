import {
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Landmark,
  Rocket,
  TrendingUp
} from "lucide-react";

export type Category = {
  id: string;
  label: string;
  table: string;
  description: string;
  icon: typeof BriefcaseBusiness;
};

export const categories: Category[] = [
  {
    id: "industry",
    label: "Industry",
    table: "questionnaire_answers_industry",
    description: "Industry partner questionnaire responses",
    icon: Building2
  },
  {
    id: "academia",
    label: "Academia",
    table: "questionnaire_answers_academia",
    description: "Academic institution questionnaire responses",
    icon: GraduationCap
  },
  {
    id: "government",
    label: "Government",
    table: "questionnaire_answers_government",
    description: "Government organization questionnaire responses",
    icon: Landmark
  },
  {
    id: "startups",
    label: "Start-ups",
    table: "questionnaire_answers_startups",
    description: "Startup founder questionnaire responses",
    icon: Rocket
  },
  {
    id: "investors",
    label: "Investors",
    table: "questionnaire_answers_investors",
    description: "Investor questionnaire responses",
    icon: TrendingUp
  }
];
