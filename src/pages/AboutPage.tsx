import { Package, Users, Award, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Atulya Chemicals</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted partner in chemical supply, serving businesses across industries with
          quality products and exceptional service.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            To provide businesses with reliable access to high-quality chemical products through
            a seamless digital platform, ensuring safety, compliance, and exceptional customer
            service at every step.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Our Vision</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            To be the leading B2B chemical supplier in the region, recognized for our extensive
            product range, technical expertise, and commitment to sustainable business practices.
          </p>
        </div>
      </div>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Us</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
              <Package className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Extensive Catalog
            </h3>
            <p className="text-gray-600">
              Access to over 2,600 chemical products with detailed specifications, CAS numbers,
              and HSN codes for easy identification and ordering.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
              <Users className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Expert Support
            </h3>
            <p className="text-gray-600">
              Our knowledgeable team provides technical assistance, product recommendations,
              and support throughout your purchasing journey.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
              <Award className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Quality Assurance
            </h3>
            <p className="text-gray-600">
              All products meet stringent quality standards with proper documentation,
              safety certifications, and compliance with regulations.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 rounded-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Founded with a vision to modernize chemical procurement, Atulya Chemicals has grown
            to become a trusted supplier serving businesses across multiple industries. Our journey
            began with a simple belief: that businesses deserve a reliable, efficient, and transparent
            way to source the chemicals they need.
          </p>
          <p>
            Today, we offer an extensive catalog of over 2,600 products, ranging from industrial
            chemicals to specialized compounds. Our digital platform makes it easy for businesses
            to search, compare, and order products with confidence, knowing they're backed by our
            commitment to quality and service.
          </p>
          <p>
            We understand that in the world of chemical supply, precision matters. That's why every
            product in our catalog is clearly identified with its CAS number and HSN code, ensuring
            you receive exactly what you need for your operations.
          </p>
        </div>
      </section>

      <section className="text-center bg-blue-600 text-white rounded-lg p-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-6 opacity-90">
          Join hundreds of businesses that trust Atulya Chemicals for their chemical supply needs.
        </p>
        <p className="text-lg">
          Contact us at <a href="mailto:info@atulyachemicals.com" className="underline font-medium">info@atulyachemicals.com</a>
        </p>
      </section>
    </div>
  );
}
