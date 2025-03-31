import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Terms of Service
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full mt-2"></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-indigo max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using our blogging platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
              If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. User Accounts</h2>
            <p className="mb-3">When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of these Terms, which may result in immediate termination of your account.</p>
            <p className="mb-4">
              You are responsible for safeguarding the password that you use to access the platform and for any activities or actions under your password. 
              We encourage you to use a strong, unique password for your account.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. User Content</h2>
            <p className="mb-3">Our platform allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post, including its legality, reliability, and appropriateness.</p>
            <p className="mb-4">
              By posting content, you grant us the right to use, modify, display, distribute, and create derivative works from your content in connection with our services.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Prohibited Content and Conduct</h2>
            <p className="mb-3">You agree not to use our platform for any unlawful purpose or in any way that violates these Terms. Prohibited content includes but is not limited to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Content that is illegal, harmful, threatening, abusive, harassing, defamatory, or invasive of privacy</li>
              <li className="mb-2">Content that infringes on intellectual property rights</li>
              <li className="mb-2">Spam, phishing attempts, or harmful code</li>
              <li className="mb-2">Content that impersonates any person or entity</li>
              <li className="mb-2">Content that violates any applicable law or regulation</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Intellectual Property</h2>
            <p className="mb-4">
              The platform and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. 
              Upon termination, your right to use the platform will immediately cease.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall we, our directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. Your continued use of the platform after any such changes constitutes your acceptance of the new Terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">10. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at <a href="mailto:support@blogapp.com" className="text-indigo-600 hover:text-indigo-800">support@blogapp.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 