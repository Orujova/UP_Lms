"use client";
import React, { useState } from "react";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <header className="bg-emerald-600">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-medium text-white">Privacy Policy</h1>
          <p className="mt-2 text-emerald-50">Last updated: January 26, 2025</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-xl divide-y divide-gray-100">
          {sections.map((section, index) => (
            <Section
              key={index}
              {...section}
              isActive={activeSection === index}
              onClick={() =>
                setActiveSection(activeSection === index ? null : index)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, content, icon, isActive, onClick }) => (
  <div className="transition-all duration-200 hover:bg-emerald-50">
    <button
      onClick={onClick}
      className="w-full p-8 text-left focus:outline-none"
    >
      <h2 className="flex items-center text-xl font-semibold text-gray-900">
        <span className="text-2xl mr-4">{icon}</span>
        {title}
        <svg
          className={`ml-auto w-6 h-6 transform transition-transform ${
            isActive ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </h2>
    </button>

    <div
      className={`px-8 pb-8 transition-all duration-200 ${
        isActive ? "block" : "hidden"
      }`}
    >
      <div className="text-gray-600 leading-relaxed ml-12 space-y-6">
        {content}
      </div>
    </div>
  </div>
);

const ListItem = ({ text }) => (
  <li className="flex items-start group">
    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-emerald-200 transition-colors">
      <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
    </div>
    <span className="ml-4">{text}</span>
  </li>
);

const ContactItem = ({ icon, text }) => (
  <div className="flex items-center text-emerald-800 hover:text-emerald-600 transition-colors">
    <span className="mr-4 text-xl">{icon}</span>
    <span className="text-lg">{text}</span>
  </div>
);

const sections = [
  {
    title: "Data Collection",
    icon: "📊",
    content: (
      <div className="space-y-6">
        <p className="text-lg">
          We collect the following types of information:
        </p>
        <ul className="space-y-4">
          {[
            "Personal Information (name, email, contact details)",
            "Profile Information (educational background, preferences)",
            "Usage Data (course progress, assessment results)",
            "Technical Data (IP address, browser type, device info)",
          ].map((item, i) => (
            <ListItem key={i} text={item} />
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: "How We Use Your Data",
    icon: "🔄",
    content: (
      <div className="space-y-6">
        <p className="text-lg">Your data helps us:</p>
        <ul className="space-y-4">
          {[
            "Personalize your learning experience",
            "Track and certify your course completion",
            "Improve our platform and services",
            "Send relevant notifications and updates",
            "Ensure platform security and prevent fraud",
          ].map((item, i) => (
            <ListItem key={i} text={item} />
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: "Data Protection",
    icon: "🔒",
    content: (
      <div className="space-y-6">
        <p className="text-lg">We implement strong security measures:</p>
        <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
          <ul className="space-y-4">
            {[
              "End-to-end encryption for sensitive data",
              "Regular security audits and updates",
              "Strict access controls and authentication",
              "Secure data backup and recovery systems",
            ].map((item, i) => (
              <ListItem key={i} text={item} />
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Your Rights",
    icon: "⚖️",
    content: (
      <div className="space-y-6">
        <p className="text-lg">You have the right to:</p>
        <ul className="space-y-4">
          {[
            "Access your personal data",
            "Request data correction or deletion",
            "Opt-out of marketing communications",
            "Export your data in a portable format",
            "Lodge a complaint with supervisory authorities",
          ].map((item, i) => (
            <ListItem key={i} text={item} />
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: "Contact Information",
    icon: "📬",
    content: (
      <div className="space-y-6">
        <p className="text-lg">For privacy-related concerns:</p>
        <div className="bg-emerald-50 rounded-lg p-6 space-y-4 border border-emerald-100">
          <ContactItem icon="👤" text="Data Protection Officer" />
          <ContactItem icon="📧" text="privacy@example.com" />
          <ContactItem icon="📞" text="+1 (123) 456-7890" />
          <ContactItem
            icon="🏢"
            text="123 Privacy Street, Security City, 12345"
          />
        </div>
      </div>
    ),
  },
];

export default PrivacyPolicy;
