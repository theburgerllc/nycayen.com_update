"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, ArrowRight, Star, Info } from 'lucide-react';
import { useBookingState } from '../../hooks/useBookingState';
import { services, servicePackages } from '../../data/services';
import { Service } from '../../types';

export default function ServiceSelection() {
  const { state, updateState, nextStep } = useBookingState();
  const [selectedTab, setSelectedTab] = useState<'individual' | 'packages'>('individual');
  const [selectedServices, setSelectedServices] = useState<string[]>(state.selectedServices);
  const [selectedPackage, setSelectedPackage] = useState<string | undefined>(state.selectedPackage);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
    setSelectedPackage(undefined);
  };

  const handlePackageSelect = (packageId: string) => {
    const pkg = servicePackages.find(p => p.id === packageId);
    if (pkg) {
      setSelectedPackage(packageId);
      setSelectedServices(pkg.services);
    }
  };

  const handleContinue = () => {
    const totalPrice = selectedPackage 
      ? servicePackages.find(p => p.id === selectedPackage)?.discountedPrice || 0
      : selectedServices.reduce((total, serviceId) => {
          const service = services.find(s => s.id === serviceId);
          return total + (service?.price || 0);
        }, 0);

    const estimatedDuration = selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.duration || 0);
    }, 0);

    updateState({
      selectedServices,
      selectedPackage,
      totalPrice,
      estimatedDuration,
    });
    nextStep();
  };

  const getServiceById = (id: string): Service | undefined => services.find(s => s.id === id);
  const canContinue = selectedServices.length > 0;

  return (
    <div className="space-y-8">
      {/* Service Category Tabs */}
      <div className="flex justify-center">
        <div className="glass rounded-full p-1 flex">
          <button
            onClick={() => setSelectedTab('individual')}
            className={`px-6 py-2 rounded-full transition-all ${
              selectedTab === 'individual'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Individual Services
          </button>
          <button
            onClick={() => setSelectedTab('packages')}
            className={`px-6 py-2 rounded-full transition-all ${
              selectedTab === 'packages'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Service Packages
          </button>
        </div>
      </div>

      {selectedTab === 'individual' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-playfair text-white mb-2">Choose Your Services</h2>
            <p className="text-gray-300">Select individual services to create your perfect appointment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const isSelected = selectedServices.includes(service.id);
              
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative glass rounded-xl p-6 cursor-pointer transition-all duration-300
                    ${isSelected 
                      ? 'ring-2 ring-amber-500 shadow-xl shadow-amber-500/20' 
                      : 'hover:shadow-xl hover:scale-105'}
                  `}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-playfair text-amber-400">${service.price}</div>
                      <div className="flex items-center text-gray-400 text-sm mt-1">
                        <Clock size={14} className="mr-1" />
                        {service.duration}min
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4">{service.description}</p>

                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-300 text-sm">
                        <Star size={12} className="text-amber-400 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {selectedTab === 'packages' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-playfair text-white mb-2">Service Packages</h2>
            <p className="text-gray-300">Save money with our curated service combinations</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {servicePackages.map((pkg, index) => {
              const isSelected = selectedPackage === pkg.id;
              const savings = pkg.originalPrice - pkg.discountedPrice;
              
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative glass rounded-xl p-6 cursor-pointer transition-all duration-300
                    ${isSelected 
                      ? 'ring-2 ring-amber-500 shadow-xl shadow-amber-500/20' 
                      : 'hover:shadow-xl hover:scale-105'}
                  `}
                  onClick={() => handlePackageSelect(pkg.id)}
                >
                  {savings > 0 && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Save ${savings}
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white pr-4">{pkg.title}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-playfair text-amber-400">${pkg.discountedPrice}</div>
                      {pkg.originalPrice > pkg.discountedPrice && (
                        <div className="text-gray-400 line-through text-sm">${pkg.originalPrice}</div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4">{pkg.description}</p>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium text-sm mb-2">Includes:</h4>
                    {pkg.services.map((serviceId) => {
                      const service = getServiceById(serviceId);
                      return service ? (
                        <div key={serviceId} className="flex items-center justify-between text-gray-300 text-sm">
                          <div className="flex items-center">
                            <Star size={12} className="text-amber-400 mr-2" />
                            {service.title}
                          </div>
                          <div className="flex items-center text-xs">
                            <Clock size={12} className="mr-1" />
                            {service.duration}min
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Service Comparison Tool */}
      {selectedServices.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info size={20} className="text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Your Selection Summary</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-playfair text-amber-400 mb-1">
                {selectedServices.length}
              </div>
              <div className="text-gray-300 text-sm">Services Selected</div>
            </div>
            <div>
              <div className="text-2xl font-playfair text-amber-400 mb-1">
                {Math.round(selectedServices.reduce((total, serviceId) => {
                  const service = services.find(s => s.id === serviceId);
                  return total + (service?.duration || 0);
                }, 0) / 60 * 10) / 10}h
              </div>
              <div className="text-gray-300 text-sm">Estimated Duration</div>
            </div>
            <div>
              <div className="text-2xl font-playfair text-amber-400 mb-1">
                ${selectedPackage 
                  ? servicePackages.find(p => p.id === selectedPackage)?.discountedPrice || 0
                  : selectedServices.reduce((total, serviceId) => {
                      const service = services.find(s => s.id === serviceId);
                      return total + (service?.price || 0);
                    }, 0)}
              </div>
              <div className="text-gray-300 text-sm">Total Price</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300
            ${canContinue
              ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Continue to Date & Time
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}