
import { motion } from "framer-motion";
import companyHero from "../assets/company-hero.jpg"; 

const steps = [
  { text: "Take 15g of Devanagari Health Mix ", pos: "top-0 left-1/2 -translate-x-1/2", color: "#FF6B6B" },
  { text: "Add 250ml of milk/water to the mix", pos: "top-[15%] right-[15%] translate-x-1/2 -translate-y-1/2", color: "#4ECDC4" },
  { text: "Cook 4–5 mins & keep stirring", pos: "top-1/2 right-0 -translate-y-1/2", color: "#45B7D1" },
  { text: "On preference Add jaggery/salt ", pos: "bottom-[15%] right-[15%] translate-x-1/2 translate-y-1/2", color: "#F9CA24" },
  { text: "Serve hot & enjoy", pos: "bottom-0 left-1/2 -translate-x-1/2", color: "#F0932B" },
  { text: "Share the joy!", pos: "bottom-[15%] left-[15%] -translate-x-1/2 translate-y-1/2", color: "#6C5CE7" },
  { text: "Healthy start daily", pos: "top-1/2 left-0 -translate-y-1/2", color: "#A29BFE" },
];

export default function About() {
  return (
    <div className="bg-[#FDFBF8] text-gray-800">
      {/* Hero Section */}
      <section
        className="relative h-[70vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${companyHero})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.h1
          className="relative z-10 text-white text-5xl font-bold text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Know About Us More
        </motion.h1>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 text-center">
          {[
            {
              title: "Our Vision",
              text: "We believe that true wellness begins with what we eat. Our malt powder is crafted to nourish the body and soul...",
            },
            {
              title: "Our Mission",
              text: "Our mission is to empower well-being through nutrient-rich, food-first nourishment that honors the body's wisdom...",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-white shadow-lg p-8 rounded-2xl"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
            >
              <h2 className="text-3xl font-semibold mb-4 text-[#4A5C3D]">{item.title}</h2>
              <p className="text-lg leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How to Prepare Drink Section (Static) */}
      <section className="py-32 bg-gradient-to-br from-[#E6D9C5] via-[#F4F0E8] to-[#E6D9C5] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4A5C3D] mb-6">
            How to Prepare Your Perfect Cup
          </h2>
          <p className="text-lg text-[#4A5C3D]/80 mb-16 max-w-3xl mx-auto">
            Follow our simple, circular guide for the optimal taste and nutritional experience.
          </p>

          <div className="relative w-full max-w-[600px] aspect-square mx-auto">
            <div className="absolute inset-8 rounded-full border-2 border-dashed border-[#4A5C3D]/20"></div>

            {/* Center cup icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4A5C3D] to-[#6B7C5A] flex items-center justify-center shadow-xl text-white">
                ☕
              </div>
            </div>

            {/* Steps (Static) */}
            {steps.map((step, i) => (
              <div
                key={i}
                className={`absolute ${step.pos} flex flex-col items-center text-center`}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg text-white"
                  style={{ backgroundColor: step.color }}
                >
                  Step {i + 1}
                </div>
                <div className="mt-4 p-3 bg-white shadow-md rounded-xl max-w-[140px]">
                  <p className="text-sm font-semibold text-[#4A5C3D]">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        className="bg-gray-100 py-10 text-center text-sm text-gray-600"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <p>Manufactured by: Sree Shivani Foods</p>
        <p>FSSAI No: 11225313000263  | ISO Certified</p>
        <p>#5187/A-22, Banashankari Badavane Davangere-577004, Karnataka</p>
        <p className="mt-4">© 2025 Devanagari Health Mix. All rights reserved.</p>
      </motion.footer>
    </div>
  );
}
