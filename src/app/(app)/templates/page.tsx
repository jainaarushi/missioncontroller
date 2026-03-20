"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/lib/hooks/use-agents";
import { P, F, FS } from "@/lib/palette";

/* ─── Category metadata ─── */
const CATEGORY_META: Record<string, { label: string; color: string; catBg: string }> = {
  career: { label: "Career", color: "#60a5fa", catBg: "rgba(96,165,250,0.13)" },
  finance_personal: { label: "Finance", color: "#4ade80", catBg: "rgba(74,222,128,0.10)" },
  legal_personal: { label: "Legal", color: "#c084fc", catBg: "rgba(192,132,252,0.10)" },
  housing: { label: "Housing", color: "#fb923c", catBg: "rgba(251,146,60,0.10)" },
  health_personal: { label: "Health", color: "#f472b6", catBg: "rgba(244,114,182,0.10)" },
  education: { label: "Education", color: "#22d3ee", catBg: "rgba(34,211,238,0.10)" },
  shopping: { label: "Shopping", color: "#c084fc", catBg: "rgba(192,132,252,0.10)" },
  freelance: { label: "Freelance", color: "#fb923c", catBg: "rgba(251,146,60,0.10)" },
  parenting: { label: "Parenting", color: "#a99cf5", catBg: "rgba(169,156,245,0.10)" },
  travel_events: { label: "Travel", color: "#2dd4bf", catBg: "rgba(45,212,191,0.10)" },
  personal_growth: { label: "Wellness", color: "#f5a623", catBg: "rgba(245,166,35,0.10)" },
  social_media: { label: "Social Media", color: "#0A66C2", catBg: "rgba(10,102,194,0.10)" },
};

/* ─── Template categories with slugs ─── */
const TEMPLATE_CATEGORIES: { id: string; title: string; slugs: string[] }[] = [
  { id: "career", title: "Career & Job Search", slugs: ["job-hunter", "auto-applier", "resume-optimizer", "interview-coach", "salary-negotiator", "linkedin-optimizer", "career-pivoter", "remote-job-finder", "portfolio-builder", "networking-coach"] },
  { id: "finance_personal", title: "Money & Bills", slugs: ["subscription-killer", "bill-negotiator", "tax-deduction-finder", "credit-score-coach", "deal-spotter", "debt-snowball", "budget-builder", "crypto-tax-helper", "retirement-planner", "cashback-maximizer"] },
  { id: "legal_personal", title: "Legal & Rights", slugs: ["dispute-fighter", "benefits-finder", "lease-reviewer", "immigration-helper", "small-claims-advisor", "tenant-rights", "will-planner", "traffic-ticket"] },
  { id: "housing", title: "Housing & Moving", slugs: ["apartment-scout", "moving-coordinator", "utility-optimizer", "roommate-matcher", "home-inspector", "renovation-planner", "neighborhood-scout"] },
  { id: "health_personal", title: "Health & Medical", slugs: ["medical-bill-auditor", "insurance-comparer", "symptom-researcher", "prescription-saver", "meal-prep-planner", "sleep-optimizer", "therapy-finder", "supplement-advisor", "allergy-navigator"] },
  { id: "education", title: "Education", slugs: ["scholarship-hunter", "college-advisor", "study-plan-maker", "essay-coach", "skill-roadmap", "language-tutor"] },
  { id: "shopping", title: "Smart Shopping", slugs: ["return-assistant", "car-buy-negotiator", "warranty-claimer", "tech-buyer", "grocery-optimizer", "gift-finder"] },
  { id: "freelance", title: "Freelance & Side Income", slugs: ["freelance-bid-writer", "side-hustle-matcher", "contract-reviewer", "invoice-generator", "client-proposal", "rate-calculator"] },
  { id: "parenting", title: "Parenting & Family", slugs: ["baby-name-picker", "school-chooser", "chore-organizer", "college-savings", "childcare-finder", "summer-camp-finder"] },
  { id: "travel_events", title: "Travel & Events", slugs: ["flight-deal-hunter", "wedding-planner", "party-planner", "visa-advisor", "road-trip-planner", "packing-assistant"] },
  { id: "personal_growth", title: "Personal Growth", slugs: ["habit-tracker", "journaling-coach", "morning-routine", "social-skills", "dating-profile", "pet-care-advisor"] },
  { id: "social_media", title: "Social Media", slugs: ["social-media"] },
];

/* ─── Pipeline agent preview data per template ─── */
const TEMPLATE_PIPELINES: Record<string, { icon: string; label: string; color: string }[]> = {
  "resume-optimizer": [
    { icon: "🔍", label: "ATS Scanner", color: "#fb923c" },
    { icon: "🏷️", label: "Keyword Analyzer", color: "#c084fc" },
    { icon: "✏️", label: "Bullet Rewriter", color: "#22d3ee" },
    { icon: "⭐", label: "Scorer", color: "#4ade80" },
  ],
  "job-hunter": [
    { icon: "👤", label: "Profile Analyzer", color: "#60a5fa" },
    { icon: "🌐", label: "Web Scraper", color: "#c084fc" },
    { icon: "🎯", label: "Job Matcher", color: "#f5a623" },
    { icon: "📊", label: "Ranker", color: "#4ade80" },
  ],
  "auto-applier": [
    { icon: "📋", label: "Job Parser", color: "#60a5fa" },
    { icon: "📄", label: "Resume Tailor", color: "#f472b6" },
    { icon: "✍️", label: "Cover Letter Writer", color: "#c5f135" },
  ],
  "interview-coach": [
    { icon: "🔍", label: "Company Research", color: "#60a5fa" },
    { icon: "🎯", label: "Question Predictor", color: "#f5a623" },
    { icon: "💬", label: "Answer Coach", color: "#4ade80" },
  ],
  "salary-negotiator": [
    { icon: "📊", label: "Market Researcher", color: "#60a5fa" },
    { icon: "💰", label: "Comp Analyzer", color: "#f5a623" },
    { icon: "🎯", label: "Negotiation Coach", color: "#4ade80" },
  ],
  "linkedin-optimizer": [
    { icon: "🔍", label: "Profile Scanner", color: "#60a5fa" },
    { icon: "🏷️", label: "SEO Optimizer", color: "#c084fc" },
    { icon: "✍️", label: "Content Writer", color: "#22d3ee" },
  ],
  "career-pivoter": [
    { icon: "🧠", label: "Skills Mapper", color: "#7c6fef" },
    { icon: "🌐", label: "Industry Research", color: "#60a5fa" },
    { icon: "📋", label: "Action Planner", color: "#4ade80" },
  ],
  "remote-job-finder": [
    { icon: "🌐", label: "Remote Board Scanner", color: "#22d3ee" },
    { icon: "🎯", label: "Skill Matcher", color: "#f5a623" },
    { icon: "📊", label: "Ranker", color: "#4ade80" },
  ],
  "portfolio-builder": [
    { icon: "📋", label: "Work Analyzer", color: "#60a5fa" },
    { icon: "🎨", label: "Layout Designer", color: "#f472b6" },
    { icon: "✍️", label: "Copy Writer", color: "#c5f135" },
  ],
  "networking-coach": [
    { icon: "🔍", label: "Network Mapper", color: "#60a5fa" },
    { icon: "✍️", label: "Intro Crafter", color: "#c084fc" },
    { icon: "📅", label: "Follow-up Planner", color: "#4ade80" },
  ],
  "budget-builder": [
    { icon: "📊", label: "Income Analyzer", color: "#60a5fa" },
    { icon: "💳", label: "Expense Tracker", color: "#f472b6" },
    { icon: "🎯", label: "Budget Planner", color: "#4ade80" },
    { icon: "📈", label: "Savings Optimizer", color: "#f5a623" },
  ],
  "subscription-killer": [
    { icon: "🔍", label: "Sub Scanner", color: "#60a5fa" },
    { icon: "💸", label: "Cost Analyzer", color: "#ef4444" },
    { icon: "✂️", label: "Cut Recommender", color: "#4ade80" },
  ],
  "bill-negotiator": [
    { icon: "📋", label: "Bill Analyzer", color: "#60a5fa" },
    { icon: "📊", label: "Market Comparer", color: "#f5a623" },
    { icon: "💬", label: "Script Writer", color: "#4ade80" },
  ],
  "tax-deduction-finder": [
    { icon: "📊", label: "Income Classifier", color: "#60a5fa" },
    { icon: "🔍", label: "Deduction Scanner", color: "#c084fc" },
    { icon: "💰", label: "Savings Calculator", color: "#4ade80" },
  ],
  "credit-score-coach": [
    { icon: "📊", label: "Score Analyzer", color: "#60a5fa" },
    { icon: "🔍", label: "Factor Scanner", color: "#f5a623" },
    { icon: "📋", label: "Action Planner", color: "#4ade80" },
  ],
  "deal-spotter": [
    { icon: "🔍", label: "Price Scanner", color: "#60a5fa" },
    { icon: "📊", label: "Deal Comparer", color: "#f5a623" },
    { icon: "🏷️", label: "Coupon Finder", color: "#4ade80" },
  ],
  "debt-snowball": [
    { icon: "📊", label: "Debt Mapper", color: "#ef4444" },
    { icon: "🧮", label: "Strategy Calculator", color: "#60a5fa" },
    { icon: "📅", label: "Payoff Scheduler", color: "#4ade80" },
  ],
  "crypto-tax-helper": [
    { icon: "🔗", label: "Transaction Parser", color: "#f5a623" },
    { icon: "📊", label: "Gains Calculator", color: "#60a5fa" },
    { icon: "📝", label: "Report Writer", color: "#4ade80" },
  ],
  "retirement-planner": [
    { icon: "📊", label: "Asset Analyzer", color: "#60a5fa" },
    { icon: "📈", label: "Growth Projector", color: "#4ade80" },
    { icon: "📋", label: "Plan Builder", color: "#f5a623" },
  ],
  "cashback-maximizer": [
    { icon: "💳", label: "Card Analyzer", color: "#60a5fa" },
    { icon: "🏷️", label: "Category Mapper", color: "#c084fc" },
    { icon: "💰", label: "Reward Optimizer", color: "#4ade80" },
  ],
  "lease-reviewer": [
    { icon: "📋", label: "Clause Parser", color: "#60a5fa" },
    { icon: "🔒", label: "Risk Analyzer", color: "#ef4444" },
    { icon: "⚖️", label: "Legal Checker", color: "#c084fc" },
    { icon: "📝", label: "Report Writer", color: "#4ade80" },
  ],
  "dispute-fighter": [
    { icon: "📋", label: "Case Builder", color: "#60a5fa" },
    { icon: "⚖️", label: "Law Researcher", color: "#c084fc" },
    { icon: "✍️", label: "Letter Drafter", color: "#4ade80" },
  ],
  "benefits-finder": [
    { icon: "🔍", label: "Eligibility Scanner", color: "#60a5fa" },
    { icon: "📊", label: "Benefit Ranker", color: "#f5a623" },
    { icon: "📋", label: "Application Guide", color: "#4ade80" },
  ],
  "immigration-helper": [
    { icon: "🔍", label: "Visa Researcher", color: "#60a5fa" },
    { icon: "📋", label: "Doc Checker", color: "#f5a623" },
    { icon: "📝", label: "Timeline Builder", color: "#4ade80" },
  ],
  "small-claims-advisor": [
    { icon: "📋", label: "Case Evaluator", color: "#60a5fa" },
    { icon: "⚖️", label: "Law Researcher", color: "#c084fc" },
    { icon: "📝", label: "Filing Guide", color: "#4ade80" },
  ],
  "tenant-rights": [
    { icon: "🔍", label: "Rights Researcher", color: "#60a5fa" },
    { icon: "⚖️", label: "State Law Finder", color: "#c084fc" },
    { icon: "📋", label: "Action Guide", color: "#4ade80" },
  ],
  "will-planner": [
    { icon: "📋", label: "Asset Mapper", color: "#60a5fa" },
    { icon: "⚖️", label: "Legal Advisor", color: "#c084fc" },
    { icon: "📝", label: "Document Drafter", color: "#4ade80" },
  ],
  "traffic-ticket": [
    { icon: "🔍", label: "Case Analyzer", color: "#60a5fa" },
    { icon: "⚖️", label: "Defense Researcher", color: "#c084fc" },
    { icon: "📝", label: "Response Drafter", color: "#4ade80" },
  ],
  "apartment-scout": [
    { icon: "🔍", label: "Listing Scanner", color: "#60a5fa" },
    { icon: "📊", label: "Price Analyzer", color: "#f5a623" },
    { icon: "🏠", label: "Match Ranker", color: "#4ade80" },
  ],
  "moving-coordinator": [
    { icon: "📋", label: "Task Planner", color: "#60a5fa" },
    { icon: "🔍", label: "Mover Finder", color: "#f5a623" },
    { icon: "📅", label: "Timeline Builder", color: "#4ade80" },
  ],
  "utility-optimizer": [
    { icon: "📊", label: "Usage Analyzer", color: "#60a5fa" },
    { icon: "🔍", label: "Plan Comparer", color: "#f5a623" },
    { icon: "💰", label: "Savings Finder", color: "#4ade80" },
  ],
  "roommate-matcher": [
    { icon: "📋", label: "Profile Builder", color: "#60a5fa" },
    { icon: "🎯", label: "Compatibility Scorer", color: "#f5a623" },
    { icon: "📝", label: "Agreement Drafter", color: "#4ade80" },
  ],
  "home-inspector": [
    { icon: "🔍", label: "Checklist Builder", color: "#60a5fa" },
    { icon: "🏠", label: "Issue Spotter", color: "#ef4444" },
    { icon: "📝", label: "Report Generator", color: "#4ade80" },
  ],
  "renovation-planner": [
    { icon: "📋", label: "Scope Builder", color: "#60a5fa" },
    { icon: "💰", label: "Budget Estimator", color: "#f5a623" },
    { icon: "📅", label: "Timeline Planner", color: "#4ade80" },
  ],
  "neighborhood-scout": [
    { icon: "🌐", label: "Area Researcher", color: "#60a5fa" },
    { icon: "📊", label: "Safety Scorer", color: "#ef4444" },
    { icon: "🏠", label: "Livability Ranker", color: "#4ade80" },
  ],
  "medical-bill-auditor": [
    { icon: "📊", label: "Bill Scanner", color: "#60a5fa" },
    { icon: "🔍", label: "Code Checker", color: "#ef4444" },
    { icon: "💰", label: "Savings Finder", color: "#4ade80" },
  ],
  "insurance-comparer": [
    { icon: "🔍", label: "Plan Scanner", color: "#60a5fa" },
    { icon: "📊", label: "Coverage Comparer", color: "#f5a623" },
    { icon: "📝", label: "Recommendation Writer", color: "#4ade80" },
  ],
  "symptom-researcher": [
    { icon: "🔍", label: "Symptom Analyzer", color: "#60a5fa" },
    { icon: "🌐", label: "Medical Researcher", color: "#c084fc" },
    { icon: "📋", label: "Report Builder", color: "#4ade80" },
  ],
  "prescription-saver": [
    { icon: "💊", label: "Drug Lookup", color: "#60a5fa" },
    { icon: "🔍", label: "Price Scanner", color: "#f5a623" },
    { icon: "💰", label: "Savings Finder", color: "#4ade80" },
  ],
  "meal-prep-planner": [
    { icon: "📊", label: "Nutrition Analyzer", color: "#4ade80" },
    { icon: "🍽️", label: "Recipe Planner", color: "#f5a623" },
    { icon: "🛒", label: "Grocery Lister", color: "#60a5fa" },
  ],
  "sleep-optimizer": [
    { icon: "🔍", label: "Sleep Analyzer", color: "#60a5fa" },
    { icon: "🌙", label: "Habit Mapper", color: "#7c6fef" },
    { icon: "📋", label: "Routine Builder", color: "#4ade80" },
  ],
  "therapy-finder": [
    { icon: "🔍", label: "Needs Assessor", color: "#60a5fa" },
    { icon: "🌐", label: "Provider Scanner", color: "#c084fc" },
    { icon: "📊", label: "Match Ranker", color: "#4ade80" },
  ],
  "supplement-advisor": [
    { icon: "🔍", label: "Health Analyzer", color: "#60a5fa" },
    { icon: "📊", label: "Research Scanner", color: "#c084fc" },
    { icon: "💊", label: "Stack Builder", color: "#4ade80" },
  ],
  "allergy-navigator": [
    { icon: "🔍", label: "Allergen Mapper", color: "#ef4444" },
    { icon: "📋", label: "Diet Planner", color: "#60a5fa" },
    { icon: "📝", label: "Guide Builder", color: "#4ade80" },
  ],
  "scholarship-hunter": [
    { icon: "🔍", label: "Scholarship Scanner", color: "#60a5fa" },
    { icon: "🎯", label: "Eligibility Matcher", color: "#f5a623" },
    { icon: "📝", label: "Application Drafter", color: "#4ade80" },
  ],
  "college-advisor": [
    { icon: "🔍", label: "School Researcher", color: "#60a5fa" },
    { icon: "📊", label: "Fit Scorer", color: "#f5a623" },
    { icon: "📋", label: "Application Planner", color: "#4ade80" },
  ],
  "study-plan-maker": [
    { icon: "📚", label: "Syllabus Analyzer", color: "#22d3ee" },
    { icon: "🧠", label: "Knowledge Mapper", color: "#7c6fef" },
    { icon: "📅", label: "Schedule Builder", color: "#fb923c" },
    { icon: "✅", label: "Progress Tracker", color: "#4ade80" },
  ],
  "essay-coach": [
    { icon: "📋", label: "Structure Planner", color: "#60a5fa" },
    { icon: "✍️", label: "Draft Advisor", color: "#c084fc" },
    { icon: "✏️", label: "Editor", color: "#4ade80" },
  ],
  "skill-roadmap": [
    { icon: "🎯", label: "Goal Mapper", color: "#60a5fa" },
    { icon: "📊", label: "Resource Finder", color: "#f5a623" },
    { icon: "📅", label: "Roadmap Builder", color: "#4ade80" },
  ],
  "language-tutor": [
    { icon: "📊", label: "Level Assessor", color: "#60a5fa" },
    { icon: "📚", label: "Curriculum Builder", color: "#22d3ee" },
    { icon: "📅", label: "Practice Planner", color: "#4ade80" },
  ],
  "return-assistant": [
    { icon: "📋", label: "Policy Scanner", color: "#60a5fa" },
    { icon: "📝", label: "Letter Drafter", color: "#c084fc" },
    { icon: "📅", label: "Deadline Tracker", color: "#4ade80" },
  ],
  "car-buy-negotiator": [
    { icon: "🔍", label: "Price Researcher", color: "#60a5fa" },
    { icon: "📊", label: "Value Analyzer", color: "#f5a623" },
    { icon: "💬", label: "Negotiation Coach", color: "#4ade80" },
  ],
  "warranty-claimer": [
    { icon: "📋", label: "Coverage Checker", color: "#60a5fa" },
    { icon: "📝", label: "Claim Drafter", color: "#c084fc" },
    { icon: "📅", label: "Follow-up Tracker", color: "#4ade80" },
  ],
  "tech-buyer": [
    { icon: "🔍", label: "Spec Researcher", color: "#60a5fa" },
    { icon: "📊", label: "Model Comparer", color: "#f5a623" },
    { icon: "💰", label: "Deal Finder", color: "#4ade80" },
  ],
  "grocery-optimizer": [
    { icon: "📋", label: "List Builder", color: "#60a5fa" },
    { icon: "🔍", label: "Price Comparer", color: "#f5a623" },
    { icon: "💰", label: "Savings Calculator", color: "#4ade80" },
  ],
  "gift-finder": [
    { icon: "📋", label: "Profile Analyzer", color: "#60a5fa" },
    { icon: "🔍", label: "Gift Scanner", color: "#c084fc" },
    { icon: "🎁", label: "Pick Ranker", color: "#4ade80" },
  ],
  "freelance-bid-writer": [
    { icon: "📋", label: "Project Analyzer", color: "#60a5fa" },
    { icon: "✍️", label: "Bid Writer", color: "#c084fc" },
    { icon: "💰", label: "Price Optimizer", color: "#4ade80" },
  ],
  "side-hustle-matcher": [
    { icon: "📋", label: "Skill Mapper", color: "#60a5fa" },
    { icon: "🔍", label: "Opportunity Scanner", color: "#f5a623" },
    { icon: "📊", label: "Income Estimator", color: "#4ade80" },
  ],
  "contract-reviewer": [
    { icon: "📋", label: "Clause Parser", color: "#60a5fa" },
    { icon: "⚖️", label: "Risk Analyzer", color: "#ef4444" },
    { icon: "📝", label: "Summary Writer", color: "#4ade80" },
  ],
  "invoice-generator": [
    { icon: "📋", label: "Data Collector", color: "#60a5fa" },
    { icon: "📊", label: "Rate Calculator", color: "#f5a623" },
    { icon: "📝", label: "Invoice Builder", color: "#4ade80" },
  ],
  "client-proposal": [
    { icon: "📋", label: "Brief Analyzer", color: "#60a5fa" },
    { icon: "✍️", label: "Proposal Writer", color: "#c084fc" },
    { icon: "💰", label: "Pricing Optimizer", color: "#4ade80" },
  ],
  "rate-calculator": [
    { icon: "📊", label: "Market Researcher", color: "#60a5fa" },
    { icon: "🧮", label: "Cost Analyzer", color: "#f5a623" },
    { icon: "💰", label: "Rate Builder", color: "#4ade80" },
  ],
  "baby-name-picker": [
    { icon: "🔍", label: "Name Researcher", color: "#a99cf5" },
    { icon: "📊", label: "Meaning Analyzer", color: "#f472b6" },
    { icon: "🎯", label: "Match Ranker", color: "#4ade80" },
  ],
  "school-chooser": [
    { icon: "🔍", label: "School Scanner", color: "#60a5fa" },
    { icon: "📊", label: "Rating Comparer", color: "#f5a623" },
    { icon: "🏫", label: "Fit Analyzer", color: "#4ade80" },
  ],
  "chore-organizer": [
    { icon: "📋", label: "Task Mapper", color: "#60a5fa" },
    { icon: "📅", label: "Schedule Builder", color: "#a99cf5" },
    { icon: "✅", label: "Tracker", color: "#4ade80" },
  ],
  "college-savings": [
    { icon: "📊", label: "Cost Projector", color: "#60a5fa" },
    { icon: "📈", label: "529 Analyzer", color: "#f5a623" },
    { icon: "📋", label: "Plan Builder", color: "#4ade80" },
  ],
  "childcare-finder": [
    { icon: "🔍", label: "Provider Scanner", color: "#60a5fa" },
    { icon: "📊", label: "Review Analyzer", color: "#f5a623" },
    { icon: "🎯", label: "Match Ranker", color: "#4ade80" },
  ],
  "summer-camp-finder": [
    { icon: "🔍", label: "Camp Scanner", color: "#60a5fa" },
    { icon: "🎯", label: "Interest Matcher", color: "#a99cf5" },
    { icon: "📊", label: "Comparison Builder", color: "#4ade80" },
  ],
  "flight-deal-hunter": [
    { icon: "🌐", label: "Fare Scanner", color: "#22d3ee" },
    { icon: "📊", label: "Price Tracker", color: "#f5a623" },
    { icon: "✈️", label: "Deal Ranker", color: "#4ade80" },
  ],
  "wedding-planner": [
    { icon: "📋", label: "Budget Builder", color: "#f472b6" },
    { icon: "🔍", label: "Vendor Researcher", color: "#60a5fa" },
    { icon: "📅", label: "Timeline Planner", color: "#4ade80" },
  ],
  "party-planner": [
    { icon: "📋", label: "Theme Builder", color: "#c084fc" },
    { icon: "🔍", label: "Vendor Finder", color: "#60a5fa" },
    { icon: "📅", label: "Checklist Maker", color: "#4ade80" },
  ],
  "visa-advisor": [
    { icon: "🔍", label: "Requirement Researcher", color: "#60a5fa" },
    { icon: "📋", label: "Doc Checker", color: "#f5a623" },
    { icon: "📝", label: "Application Guide", color: "#4ade80" },
  ],
  "road-trip-planner": [
    { icon: "🗺️", label: "Route Planner", color: "#22d3ee" },
    { icon: "🔍", label: "Stop Finder", color: "#f5a623" },
    { icon: "📋", label: "Itinerary Builder", color: "#4ade80" },
  ],
  "packing-assistant": [
    { icon: "🌤️", label: "Weather Checker", color: "#60a5fa" },
    { icon: "📋", label: "List Builder", color: "#22d3ee" },
    { icon: "✅", label: "Packing Organizer", color: "#4ade80" },
  ],
  "habit-tracker": [
    { icon: "📋", label: "Habit Analyzer", color: "#f5a623" },
    { icon: "🧠", label: "System Designer", color: "#7c6fef" },
    { icon: "📅", label: "Tracker Builder", color: "#4ade80" },
  ],
  "journaling-coach": [
    { icon: "🧠", label: "Reflection Guide", color: "#7c6fef" },
    { icon: "✍️", label: "Prompt Generator", color: "#f5a623" },
    { icon: "📊", label: "Progress Tracker", color: "#4ade80" },
  ],
  "morning-routine": [
    { icon: "🌅", label: "Schedule Analyzer", color: "#f5a623" },
    { icon: "🧠", label: "Routine Designer", color: "#7c6fef" },
    { icon: "📋", label: "Plan Builder", color: "#4ade80" },
  ],
  "social-skills": [
    { icon: "🧠", label: "Skill Assessor", color: "#7c6fef" },
    { icon: "💬", label: "Scenario Builder", color: "#60a5fa" },
    { icon: "📋", label: "Practice Planner", color: "#4ade80" },
  ],
  "dating-profile": [
    { icon: "📋", label: "Profile Analyzer", color: "#f472b6" },
    { icon: "✍️", label: "Bio Writer", color: "#c084fc" },
    { icon: "📸", label: "Photo Advisor", color: "#4ade80" },
  ],
  "pet-care-advisor": [
    { icon: "🔍", label: "Breed Researcher", color: "#60a5fa" },
    { icon: "📋", label: "Care Planner", color: "#f5a623" },
    { icon: "🏥", label: "Vet Prep Guide", color: "#4ade80" },
  ],
  "social-media": [
    { icon: "🔍", label: "Trend Researcher", color: "#3b82f6" },
    { icon: "💼", label: "LinkedIn Writer", color: "#0A66C2" },
    { icon: "🐦", label: "Twitter/X Writer", color: "#000000" },
    { icon: "📊", label: "Content Packager", color: "#8b5cf6" },
  ],
};

/* ─── Ratings and runs per template ─── */
const TEMPLATE_RATINGS: Record<string, number> = {
  "job-hunter": 4.9, "auto-applier": 4.7, "resume-optimizer": 4.8, "interview-coach": 4.8,
  "salary-negotiator": 4.7, "linkedin-optimizer": 4.6, "career-pivoter": 4.7, "remote-job-finder": 4.6,
  "portfolio-builder": 4.5, "networking-coach": 4.6,
  "subscription-killer": 4.8, "bill-negotiator": 4.7, "tax-deduction-finder": 4.9, "credit-score-coach": 4.6,
  "deal-spotter": 4.7, "debt-snowball": 4.8, "budget-builder": 4.7, "crypto-tax-helper": 4.5,
  "retirement-planner": 4.6, "cashback-maximizer": 4.5,
  "dispute-fighter": 4.8, "benefits-finder": 4.7, "lease-reviewer": 4.9, "immigration-helper": 4.6,
  "small-claims-advisor": 4.7, "tenant-rights": 4.8, "will-planner": 4.6, "traffic-ticket": 4.7,
  "apartment-scout": 4.7, "moving-coordinator": 4.6, "utility-optimizer": 4.5, "roommate-matcher": 4.4,
  "home-inspector": 4.7, "renovation-planner": 4.6, "neighborhood-scout": 4.7,
  "medical-bill-auditor": 4.9, "insurance-comparer": 4.7, "symptom-researcher": 4.6,
  "prescription-saver": 4.8, "meal-prep-planner": 4.8, "sleep-optimizer": 4.5,
  "therapy-finder": 4.6, "supplement-advisor": 4.5, "allergy-navigator": 4.6,
  "scholarship-hunter": 4.8, "college-advisor": 4.7, "study-plan-maker": 4.6,
  "essay-coach": 4.7, "skill-roadmap": 4.6, "language-tutor": 4.5,
  "return-assistant": 4.6, "car-buy-negotiator": 4.8, "warranty-claimer": 4.5,
  "tech-buyer": 4.7, "grocery-optimizer": 4.5, "gift-finder": 4.6,
  "freelance-bid-writer": 4.7, "side-hustle-matcher": 4.5, "contract-reviewer": 4.8,
  "invoice-generator": 4.4, "client-proposal": 4.7, "rate-calculator": 4.5,
  "baby-name-picker": 4.6, "school-chooser": 4.7, "chore-organizer": 4.4,
  "college-savings": 4.6, "childcare-finder": 4.5, "summer-camp-finder": 4.5,
  "flight-deal-hunter": 4.8, "wedding-planner": 4.7, "party-planner": 4.6,
  "visa-advisor": 4.7, "road-trip-planner": 4.6, "packing-assistant": 4.4,
  "habit-tracker": 4.6, "journaling-coach": 4.5, "morning-routine": 4.5,
  "social-skills": 4.4, "dating-profile": 4.6, "pet-care-advisor": 4.7,
  "social-media": 4.8,
};

const TEMPLATE_RUNS: Record<string, string> = {
  "job-hunter": "5.2k", "auto-applier": "3.8k", "resume-optimizer": "6.1k", "interview-coach": "3.1k",
  "salary-negotiator": "2.4k", "linkedin-optimizer": "2.9k", "career-pivoter": "1.8k", "remote-job-finder": "2.6k",
  "portfolio-builder": "1.5k", "networking-coach": "1.7k",
  "subscription-killer": "4.1k", "bill-negotiator": "3.2k", "tax-deduction-finder": "5.3k", "credit-score-coach": "2.7k",
  "deal-spotter": "3.6k", "debt-snowball": "2.1k", "budget-builder": "3.4k", "crypto-tax-helper": "1.4k",
  "retirement-planner": "1.9k", "cashback-maximizer": "1.6k",
  "dispute-fighter": "2.3k", "benefits-finder": "2.8k", "lease-reviewer": "2.8k", "immigration-helper": "1.7k",
  "small-claims-advisor": "1.3k", "tenant-rights": "2.1k", "will-planner": "1.5k", "traffic-ticket": "1.9k",
  "apartment-scout": "2.4k", "moving-coordinator": "1.8k", "utility-optimizer": "1.3k", "roommate-matcher": "0.9k",
  "home-inspector": "1.6k", "renovation-planner": "1.4k", "neighborhood-scout": "1.7k",
  "medical-bill-auditor": "3.7k", "insurance-comparer": "2.5k", "symptom-researcher": "3.9k",
  "prescription-saver": "2.8k", "meal-prep-planner": "1.9k", "sleep-optimizer": "1.2k",
  "therapy-finder": "1.6k", "supplement-advisor": "1.1k", "allergy-navigator": "1.3k",
  "scholarship-hunter": "2.9k", "college-advisor": "2.3k", "study-plan-maker": "4.5k",
  "essay-coach": "2.1k", "skill-roadmap": "1.8k", "language-tutor": "1.4k",
  "return-assistant": "1.7k", "car-buy-negotiator": "2.2k", "warranty-claimer": "1.1k",
  "tech-buyer": "2.6k", "grocery-optimizer": "1.3k", "gift-finder": "1.8k",
  "freelance-bid-writer": "2.2k", "side-hustle-matcher": "1.5k", "contract-reviewer": "2.4k",
  "invoice-generator": "1.0k", "client-proposal": "1.9k", "rate-calculator": "1.2k",
  "baby-name-picker": "1.6k", "school-chooser": "1.4k", "chore-organizer": "0.8k",
  "college-savings": "1.1k", "childcare-finder": "1.0k", "summer-camp-finder": "0.9k",
  "flight-deal-hunter": "3.1k", "wedding-planner": "2.4k", "party-planner": "1.7k",
  "visa-advisor": "1.9k", "road-trip-planner": "1.5k", "packing-assistant": "1.1k",
  "habit-tracker": "1.8k", "journaling-coach": "1.2k", "morning-routine": "1.4k",
  "social-skills": "0.9k", "dating-profile": "1.6k", "pet-care-advisor": "1.3k",
  "social-media": "2.1k",
};

/* ─── Pill component ─── */
function Pill({ children, color = P.lime, bg = "rgba(197,241,53,0.13)", size = 10 }: {
  children: React.ReactNode; color?: string; bg?: string; size?: number;
}) {
  return (
    <span style={{
      fontSize: size, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
      background: bg, color, letterSpacing: "0.04em", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

/* ─── FTabs — filter tabs matching reference ─── */
function FTabs({ tabs, active, onChange }: {
  tabs: string[]; active: string; onChange: (t: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap" }}>
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} style={{
          padding: "5px 12px", borderRadius: 100, fontSize: 11,
          cursor: "pointer", fontFamily: F, fontWeight: active === t ? 700 : 500,
          border: `1px solid ${active === t ? P.lime : P.border}`,
          background: active === t ? P.lime : P.bg3,
          color: active === t ? "#0b0b0e" : P.textSec,
          transition: "all 0.15s",
        }}>{t}</button>
      ))}
    </div>
  );
}

/* ─── TemplateCard — compact card matching reference exactly ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TemplateCard({ agent, cat, rating, runs, pipeline, onUse }: {
  agent: { id: string; icon: string; name: string; description: string | null; slug?: string };
  cat: { label: string; color: string; catBg: string };
  rating: number;
  runs: string;
  pipeline: { icon: string; label: string; color: string }[];
  onUse: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onUse}
      style={{
        background: P.bg2, border: `1px solid ${hov ? P.border2 : P.border}`,
        borderRadius: 15, overflow: "hidden", cursor: "pointer",
        display: "flex", flexDirection: "column",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 12px 36px rgba(0,0,0,0.5)" : "none",
        transition: "all 0.2s", minWidth: 0,
      }}
    >
      {/* Gradient stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}44)` }} />

      <div style={{ padding: "13px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header: icon + name + category pill + rating */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: cat.catBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
            }}>{agent.icon}</div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, fontFamily: F, marginBottom: 2 }}>{agent.name}</div>
              <Pill color={cat.color} bg={cat.catBg} size={9}>{cat.label}</Pill>
            </div>
          </div>
          <span style={{ fontSize: 11, color: P.amber, fontWeight: 700 }}>★ {rating}</span>
        </div>

        {/* Description */}
        <div style={{ fontSize: 11, color: P.textSec, lineHeight: 1.55, marginBottom: 10 }}>
          {agent.description}
        </div>

        {/* Pipeline agent preview */}
        {pipeline.length > 0 && (
          <div style={{
            padding: "9px 11px", background: P.bg3,
            borderRadius: 8, border: `1px solid ${P.border}`, marginBottom: 10,
          }}>
            <div style={{
              fontSize: 9, textTransform: "uppercase" as const,
              letterSpacing: "0.08em", color: P.textTer, marginBottom: 6,
            }}>
              {pipeline.length} agents
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              {pipeline.map((step, i) => (
                <span key={step.label}>
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 4,
                    background: P.bg4, border: `1px solid ${step.color}33`,
                    color: step.color, fontFamily: F, fontWeight: 600,
                  }}>
                    {step.icon} {step.label}
                  </span>
                  {i < pipeline.length - 1 && (
                    <span style={{ color: P.textTer, fontSize: 9, margin: "0 1px" }}>›</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer: runs + Use Template button */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "auto", paddingTop: 9,
          borderTop: `1px solid ${P.border}`,
        }}>
          <span style={{ fontSize: 10, color: P.textTer }}>{runs} runs</span>
          <button onClick={(e) => { e.stopPropagation(); onUse(); }} style={{
            fontSize: 10.5, fontWeight: 700, padding: "5px 12px", borderRadius: 7,
            background: P.lime, color: "#0b0b0e", border: "none",
            cursor: "pointer", fontFamily: F,
          }}>
            Use Template →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Templates Page ─── */
export default function TemplatesPage() {
  const { agents } = useAgents();
  const router = useRouter();
  const [filter, setFilter] = useState("All");

  // Build unique category labels for tabs
  const categoryTabs = useMemo(() => {
    return ["All", ...TEMPLATE_CATEGORIES.map(c => c.title)];
  }, []);

  // Filter categories by selected tab
  const filteredCategories = useMemo(() => {
    if (filter === "All") return TEMPLATE_CATEGORIES;
    return TEMPLATE_CATEGORIES.filter(c => c.title === filter);
  }, [filter]);

  // Get all template agents in a flat list for the selected filter
  const allFilteredAgents = useMemo(() => {
    const result: { agent: typeof agents[0]; catId: string }[] = [];
    for (const cat of filteredCategories) {
      for (const slug of cat.slugs) {
        const agent = agents.find(a => a.slug === slug);
        if (agent) result.push({ agent, catId: cat.id });
      }
    }
    return result;
  }, [filteredCategories, agents]);

  function handleUseTemplate(slug: string) {
    router.push(`/templates/${slug}`);
  }

  return (
    <div style={{ padding: "20px 26px" }}>
      {/* Header — matches reference: serif italic heading */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{
          fontFamily: FS, fontSize: 22, fontWeight: 400, lineHeight: 1.2, marginBottom: 5,
        }}>
          Pre-built <span style={{ fontStyle: "italic", color: P.lime2 }}>agent pipelines</span> — ready to run.
        </h2>
        <div style={{ fontSize: 11.5, color: P.textSec }}>
          Click &quot;Use Template&quot; to launch an AI agent pipeline for your task.
        </div>
      </div>

      {/* Filter tabs */}
      <FTabs tabs={categoryTabs} active={filter} onChange={setFilter} />

      {/* Template cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 12,
      }}>
        {allFilteredAgents.map(({ agent, catId }) => {
          const slug = agent.slug || "";
          const cat = CATEGORY_META[catId] || { label: catId, color: P.textSec, catBg: `${P.textSec}15` };
          const pipeline = TEMPLATE_PIPELINES[slug] || [];
          const rating = TEMPLATE_RATINGS[slug] || 4.5;
          const runs = TEMPLATE_RUNS[slug] || "1.0k";

          return (
            <TemplateCard
              key={agent.id}
              agent={agent}
              cat={cat}
              rating={rating}
              runs={runs}
              pipeline={pipeline}
              onUse={() => handleUseTemplate(slug)}
            />
          );
        })}
      </div>

    </div>
  );
}
