"use client";
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center w-full px-12 py-6 border-b border-gray-200">
        <Image src="/assets/img/LogoHRIS.png" alt="HRIS Logo" width={60} height={60}/>
        <nav className="flex space-x-8 text-md font-medium">
          <a href="#signin" className="text-gray-600 hover:text-blue-600 transition">Sign In</a>
          <a href="#signup" className="text-gray-600 hover:text-blue-600 transition">Sign Up</a>
        </nav>
      </header>

      {/* Main Section */}
      <main className="flex flex-row items-center justify-between max-w-7xl mx-auto px-12 py-24 gap-12">
        <div className="w-1/2 space-y-6 flex-shrink-0">
          <h1 className="text-5xl font-extrabold leading-tight max-w-xl">
            Simplify HR Management with <span className="text-blue-600">HRIS</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-lg">
            Empower your HR team with a seamless tool to manage workforce data, track attendance, handle overtime, and streamline paperwork. Flexible paid subscription plans to fit your company's needs.
          </p>
          <div className="flex space-x-6">
            <Button className="bg-blue-600 text-white px-6 py-3 rounded-md shadow hover:bg-blue-700 transition-colors duration-300">
              Try HRIS for free
            </Button>
            <Button className="bg-gray-500 text-blue-700 px-6 py-3 rounded-md shadow hover:bg-gray-400 transition-colors duration-300">
              Pay as you go
            </Button>
          </div>
        </div>
        <div className="w-1/2 flex justify-center flex-shrink-0">
          <Image
            src="/assets/img/LogoHris.png"
            alt="HRIS Logo"
            width={500}
            height={500}
            className="object-contain"
            priority
          />
        </div>
      </main>


      {/* Features / Packages Section */}
      <section id="features" className="bg-gray-100 py-20 px-12 max-w-7xl mx-auto rounded-lg shadow-lg"
      >
        <h2 className="text-4xl font-bold mb-14 text-center text-gray-900">Choose the HRIS Packages right for you</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "Free",
              subtitle: "Best for growing business",
              features: [
                "GPS-based attendance validation",
                "Employee data management",
                "Leave & time-off requests",
                "Overtime management (government regulations)",
                "Fixed work schedule management",
                "Automatic tax calculation"
              ]
            },
            {
              title: 'Standard',
              features: [
                'GPS-based attendance validation',
                'Employee data management',
                'Leave & time-off requests',
                'Overtime management (government regulations)',
                'Fixed work schedule management',
                'Automatic tax calculation',
              ],
            },
            {
              title: 'Premium',
              features: [
                'All Standard features',
                'Clock-in & clock-out attendance',
                'Fingerprint integration',
                'Employee document management',
                'Sick leave & time-off settings',
                'Shift management',
                'Comprehensive reports',
                'Overtime management (government & custom regulation)',
              ],
            },
            {
              title: 'Ultra',
              features: [
                'All Premium features',
                'Face Recognition',
                'Automated check-out attendance',
                'Employee turnover dashboard',
                'Custom dashboard for statistics & analysis',
              ],
            },
          ].map((plan, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl shadow-md p-8 flex flex-col transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-xl text-sm"
              >

              <h3 className="text-2xl font-semibold mb-6 text-blue-700">{plan.title}</h3>
              <div className="h-[1px] bg-gray-500 mb-5 w-full"></div>
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-center text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() =>
                  plan.title === "Free"
                    ? router.push("/billing?plan=Free&price=0")
                    : router.push("/seat-plans")
                }
                className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-[#1E3A5F] transition cursor-pointer"
              >
                Select a Package →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-center py-8 text-gray-500 text-sm">
        © {new Date().getFullYear()} HRIS. All rights reserved.
      </footer>
    </div>
  );
}
