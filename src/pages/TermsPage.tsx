export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            Welcome to Atulya Chemicals. These terms and conditions govern your use of our B2B e-commerce
            platform and the purchase of chemical products. By accessing or using our website, you agree to
            be bound by these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Business Customers</h2>
          <p className="text-gray-600 leading-relaxed">
            Our services are exclusively for business-to-business transactions. Customers must provide
            valid business registration details, GST number, and other required documentation during
            the ordering process.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Product Information</h2>
          <p className="text-gray-600 leading-relaxed">
            All products are identified by Product Name, CAS Number, and HSN Code. We strive to ensure
            accuracy in product descriptions, specifications, and pricing. However, we reserve the right
            to correct any errors or inaccuracies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Ordering and Payment</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Orders are subject to acceptance and availability. Payment terms will be specified during
            the checkout process. All prices are in Indian Rupees (INR) and exclude applicable taxes
            unless stated otherwise.
          </p>
          <p className="text-gray-600 leading-relaxed">
            A valid GST number is mandatory for all orders. Billing and shipping addresses must be
            provided at checkout.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Shipping and Delivery</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong>Orders under 20 kg:</strong> Can be shipped via Courier or Transport, as per
            customer preference.
          </p>
          <p className="text-gray-600 leading-relaxed">
            <strong>Orders 20 kg and above:</strong> Will be shipped via Transport only due to weight
            and safety regulations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Returns and Refunds</h2>
          <p className="text-gray-600 leading-relaxed">
            Due to the nature of chemical products, returns are only accepted for damaged or incorrect
            items. Claims must be made within 48 hours of delivery with photographic evidence.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Safety and Compliance</h2>
          <p className="text-gray-600 leading-relaxed">
            Customers are responsible for ensuring proper handling, storage, and disposal of chemical
            products in accordance with local regulations and safety guidelines. Material Safety Data
            Sheets (MSDS) are available upon request.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            Atulya Chemicals shall not be liable for any indirect, incidental, or consequential damages
            arising from the use of our products or services. Our liability is limited to the purchase
            price of the product in question.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">
            These terms and conditions are governed by the laws of India. Any disputes shall be subject
            to the exclusive jurisdiction of the courts in [Your City].
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
          <p className="text-gray-600 leading-relaxed">
            For questions regarding these terms and conditions, please contact us at info@atulyachemicals.com
          </p>
        </section>
      </div>
    </div>
  );
}
