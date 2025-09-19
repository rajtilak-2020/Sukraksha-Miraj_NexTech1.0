import React from 'react';
import { ArrowRight, Cloud, Shield, BarChart3, Brain } from 'lucide-react';

interface HeroProps {
  onGetStartedClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStartedClick }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Empowering Digital
            <span className="text-blue-600 block">Transformation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Leading the future of technology with innovative solutions in cloud computing, 
            cybersecurity, and artificial intelligence. Transform your business with NexTech.
          </p>
          <button
            onClick={onGetStartedClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            Get Started Today
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive technology solutions designed to accelerate your business growth
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <Cloud className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cloud Solutions</h3>
              <p className="text-gray-600">Scalable cloud infrastructure and migration services for modern enterprises</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cybersecurity</h3>
              <p className="text-gray-600">Advanced security solutions to protect your digital assets and data</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Analytics</h3>
              <p className="text-gray-600">Transform raw data into actionable insights with our analytics platform</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <Brain className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI & Machine Learning</h3>
              <p className="text-gray-600">Cutting-edge AI solutions to automate and optimize your operations</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About NexTech Solutions
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2020, NexTech Solutions has been at the forefront of digital innovation. 
                We specialize in helping businesses navigate the complexities of digital transformation 
                through cutting-edge technology solutions.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our team of expert engineers and consultants work closely with clients to deliver 
                customized solutions that drive growth, efficiency, and competitive advantage.
              </p>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Clients Served</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3 text-gray-600">
                <p><strong>Address:</strong> 123 Innovation Drive, Tech City, TC 12345</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Email:</strong> info@nextech-solutions.com</p>
                <p><strong>Business Hours:</strong> Mon-Fri 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};