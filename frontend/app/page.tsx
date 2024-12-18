import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat"/>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight">
              Welcome to{" "}
              <span className="text-green-600 inline-block transform hover:scale-105 transition-transform duration-300">
                LeftOverLove
              </span>
            </h1>
            
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
              Join our growing community in the fight against food waste. 
              We connect surplus food with those who need it, creating a more sustainable 
              and caring world. Every meal shared is a step towards reducing waste and 
              strengthening our community.
            </p>
            
            <div className="mt-10 max-w-lg mx-auto sm:flex sm:justify-center sm:space-x-6 space-y-4 sm:space-y-0">
              <a
                href="/add-food"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent 
                text-lg font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 
                transform hover:-translate-y-1 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Share Food
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
              
              <a
                href="/matches"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 
                text-lg font-semibold rounded-xl text-green-600 bg-white hover:bg-green-50 
                border-2 border-green-600 transform hover:-translate-y-1 transition-all duration-200 
                shadow-lg hover:shadow-xl"
              >
                Find Food
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-6 bg-green-50 rounded-2xl">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                <h3 className="text-xl font-semibold mb-2">Share Surplus Food</h3>
                <p className="text-gray-600">List your excess food items, set pickup details, and help reduce food waste</p>
              </div>
              <div className="p-6 bg-green-50 rounded-2xl">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                <h3 className="text-xl font-semibold mb-2">Connect Locally</h3>
                <p className="text-gray-600">Find available food donations in your area and connect with donors</p>
              </div>
              <div className="p-6 bg-green-50 rounded-2xl">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                <h3 className="text-xl font-semibold mb-2">Make a Difference</h3>
                <p className="text-gray-600">Pick up the food and help create a more sustainable community</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose LeftOverLove?</h2>
            <p className="text-xl text-gray-600">Making food sharing simple, safe, and sustainable</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Community-Driven</h3>
              <p className="text-gray-600">Connect with like-minded people in your area who care about reducing food waste</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-gray-600">Verified users and secure communication to ensure safe food sharing</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">Get instant notifications about food availability in your area</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Our Impact</h2>
            <p className="mt-4 text-xl text-gray-600">Together, we're making a difference</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">15,000+</div>
              <div className="text-gray-600">Meals Shared</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">5,000+</div>
              <div className="text-gray-600">KG Food Saved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Communities Reached</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Ready to Make a Difference?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Let&apos;s work together to reduce food waste and help those in need
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/add-food"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl 
              text-green-600 bg-white hover:bg-green-50 transform hover:-translate-y-1 transition-all duration-200 
              shadow-lg hover:shadow-xl"
            >
              Share Food Now
            </a>
            <a
              href="/matches"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl 
              text-white bg-transparent border-2 border-white hover:bg-white/10 transform hover:-translate-y-1 
              transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Find Food Near You
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
