import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="p-6">
      <div className="bg-emerald-500 p-6 rounded-t-lg">
        <h1 className="text-2xl font-medium text-white">
          Terms and Conditions
        </h1>
        <p className="mt-1 text-sm text-emerald-50">
          Last updated: January 26, 2025
        </p>
      </div>

      <div className="bg-white rounded-b-lg">
        <div className="divide-y">
          <Section
            title="Platform Access & Usage"
            content="Our Learning Management System (LMS) provides a comprehensive educational platform for professional development. By accessing our platform, you agree to maintain the confidentiality of your credentials and use the service responsibly."
          />

          <Section
            title="Content & Resources"
            content={
              <>
                <p className="mb-4">
                  Access to premium learning materials, including:
                </p>
                <ul className="space-y-2">
                  {[
                    "Interactive video courses and tutorials",
                    "Downloadable resources and materials",
                    "Progress tracking and certifications",
                  ].map((item, i) => (
                    <ListItem key={i} text={item} />
                  ))}
                </ul>
              </>
            }
          />

          <Section
            title="Privacy & Data Protection"
            content="We prioritize the security of your personal information and ensure compliance with data protection regulations. Your data is encrypted and stored securely, with strict access controls in place."
          />

          <Section
            title="User Responsibilities"
            content={
              <ul className="space-y-2">
                {[
                  "Maintain account security and confidentiality",
                  "Respect intellectual property rights",
                  "Follow community guidelines",
                ].map((item, i) => (
                  <ListItem key={i} text={item} />
                ))}
              </ul>
            }
          />

          <Section
            title="Contact & Support"
            content={
              <>
                <p className="mb-2">
                  For assistance or inquiries, please contact:
                </p>
                <p className="text-emerald-600">support@example.com</p>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, content }) => (
  <div className="p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-6 bg-emerald-500 rounded"></div>
      <h2 className="text-lg font-medium text-gray-900">{title}</h2>
    </div>
    <div className="text-gray-600 pl-4">{content}</div>
  </div>
);

const ListItem = ({ text }) => (
  <li className="flex items-start gap-3">
    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
    <span>{text}</span>
  </li>
);

export default TermsAndConditions;
