import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="bg-[#FDFBF8] pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#4A5C3D] mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            We'd love to hear from you. Reach out with any questions or feedback.
          </p>
        </div>

        {/* Contact Details & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column - Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#4A5C3D] mb-8">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-[#4A5C3D] rounded-full flex items-center justify-center">
                    <MapPin className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4A5C3D]">Address</h3>
                    <p className="text-gray-700">#5187/A-22, Banashankari Badavane Davangere-577004, Karnataka</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-[#A88B67] rounded-full flex items-center justify-center">
                    <Mail className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4A5C3D]">Email</h3>
                    <p className="text-gray-700">sreeshivanifoods@gamil.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-[#4A5C3D] rounded-full flex items-center justify-center">
                    <Phone className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4A5C3D]">Phone</h3>
                    <p className="text-gray-700">1234567890</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-[#E6D9C5] p-6 rounded-xl">
              <h3 className="text-xl font-bold text-[#4A5C3D] mb-4">Business Hours</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#4A5C3D] mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-[#4A5C3D] focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#4A5C3D] mb-2">
                Your Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-[#4A5C3D] focus:border-transparent transition-all"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-[#4A5C3D] mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-[#4A5C3D] focus:border-transparent transition-all"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-[#4A5C3D] mb-2">
                Your Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-[#4A5C3D] focus:border-transparent transition-all resize-none"
                placeholder="Tell us how we can help you..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-[#4A5C3D] text-white py-4 rounded-lg font-semibold 
              hover:bg-[#3a4a2f] transition-colors duration-200 flex items-center justify-center 
              space-x-2 shadow-lg hover:shadow-xl"
            >
              <Send size={20} />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>

      {/* Additional Info Section */}
      <section className="py-20 bg-[#E6D9C5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#4A5C3D] mb-8">
            We're Here to Help
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Whether you have questions about our ingredients, need help with your order, or want to learn 
            more about incorporating Devanagari Health Mix into your wellness routine, our team is ready to assist.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-[#4A5C3D] mb-2">Product Questions</h3>
              <p className="text-gray-600">Learn about ingredients and preparation</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-[#4A5C3D] mb-2">Order Support</h3>
              <p className="text-gray-600">Help with orders and shipping</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-[#4A5C3D] mb-2">Wellness Guidance</h3>
              <p className="text-gray-600">Tips for your health journey</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
