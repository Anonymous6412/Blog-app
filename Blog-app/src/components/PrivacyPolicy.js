import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Privacy Policy
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full mt-2"></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-indigo max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to our blog platform. We respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
            <p className="mb-3">We may collect several types of information from and about users of our website, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Personal identifiers such as name, email address, and mobile number</li>
              <li className="mb-2">Account credentials</li>
              <li className="mb-2">User-generated content such as blog posts and comments</li>
              <li className="mb-2">Usage data and analytics information</li>
              <li className="mb-2">Device and browser information</li>
              <li className="mb-2">IP address and location data</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
            <p className="mb-3">We may use the information we collect about you for various purposes, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">To provide and maintain our service</li>
              <li className="mb-2">To notify you about changes to our service</li>
              <li className="mb-2">To allow you to participate in interactive features of our service</li>
              <li className="mb-2">To provide customer support</li>
              <li className="mb-2">To gather analysis or valuable information to improve our service</li>
              <li className="mb-2">To monitor the usage of our service</li>
              <li className="mb-2">To detect, prevent and address technical issues</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
            <p className="mb-4">
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal 
              information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Data Retention</h2>
            <p className="mb-4">
              We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. 
              We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, 
              and enforce our policies.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. User Rights</h2>
            <p className="mb-3">Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">The right to access personal information we hold about you</li>
              <li className="mb-2">The right to request correction of your personal information</li>
              <li className="mb-2">The right to request deletion of your personal information</li>
              <li className="mb-2">The right to withdraw consent</li>
              <li className="mb-2">The right to data portability</li>
              <li className="mb-2">The right to object to processing of your personal information</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Third-Party Services</h2>
            <p className="mb-4">
              Our service may contain links to other websites that are not operated by us. If you click on a third-party link, 
              you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
              and updating the "Last updated" date at the top of this page.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@blogapp.com" className="text-indigo-600 hover:text-indigo-800">support@blogapp.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 