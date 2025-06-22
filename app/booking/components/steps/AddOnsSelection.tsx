"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Plus, Minus, Star, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { useBookingState } from '../../hooks/useBookingState';
import { addOns } from '../../data/services';
import { AddOn } from '../../types';


export default function AddOnsSelection() {
  const { state, updateState, nextStep, prevStep } = useBookingState();
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(state.selectedAddOns || []);
  const [addOnQuantities, setAddOnQuantities] = useState<{ [key: string]: number }>({});
  const [currentCategory, setCurrentCategory] = useState<'all' | 'care' | 'styling' | 'treatment'>('all');

  useEffect(() => {
    const quantities: { [key: string]: number } = {};
    selectedAddOns.forEach(addOnId => {
      quantities[addOnId] = addOnQuantities[addOnId] || 1;
    });
    setAddOnQuantities(quantities);
  }, [selectedAddOns, addOnQuantities]);

  const categories = [
    { key: 'all', label: 'All Add-ons', icon: Sparkles },
    { key: 'care', label: 'Hair Care', icon: Star },
    { key: 'styling', label: 'Styling', icon: TrendingUp },
    { key: 'treatment', label: 'Treatments', icon: Sparkles },
  ] as const;

  const filteredAddOns = currentCategory === 'all' 
    ? addOns 
    : addOns.filter(addOn => addOn.category === currentCategory);

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => {
      if (prev.includes(addOnId)) {
        const newQuantities = { ...addOnQuantities };
        delete newQuantities[addOnId];
        setAddOnQuantities(newQuantities);
        return prev.filter(id => id !== addOnId);
      } else {
        setAddOnQuantities(prev => ({ ...prev, [addOnId]: 1 }));
        return [...prev, addOnId];
      }
    });
  };

  const updateQuantity = (addOnId: string, change: number) => {
    setAddOnQuantities(prev => {
      const currentQuantity = prev[addOnId] || 1;
      const newQuantity = Math.max(1, currentQuantity + change);
      return { ...prev, [addOnId]: newQuantity };
    });
  };

  const calculateAddOnPrice = (addOn: AddOn, quantity: number = 1) => {
    return addOn.price * quantity;
  };

  const getTotalAddOnPrice = () => {
    return selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find(a => a.id === addOnId);
      const quantity = addOnQuantities[addOnId] || 1;
      return total + (addOn ? calculateAddOnPrice(addOn, quantity) : 0);
    }, 0);
  };

  const getTotalAddOnDuration = () => {
    return selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find(a => a.id === addOnId);
      const quantity = addOnQuantities[addOnId] || 1;
      return total + (addOn ? addOn.duration * quantity : 0);
    }, 0);
  };

  const getRecommendedAddOns = () => {
    const serviceIds = state.selectedServices;
    const recommendations: string[] = [];

    if (serviceIds.includes('color-artistry') || serviceIds.includes('balayage')) {
      recommendations.push('hair-gloss', 'deep-conditioning');
    }
    if (serviceIds.includes('precision-cut')) {
      recommendations.push('styling-lesson', 'scalp-massage');
    }
    if (serviceIds.includes('bridal-styling')) {
      recommendations.push('eyebrow-shaping', 'hair-extensions');
    }

    return addOns.filter(addOn => recommendations.includes(addOn.id));
  };

  const handleContinue = () => {
    const newTotalPrice = state.totalPrice + getTotalAddOnPrice();
    const newEstimatedDuration = state.estimatedDuration + getTotalAddOnDuration();

    updateState({
      selectedAddOns,
      totalPrice: newTotalPrice,
      estimatedDuration: newEstimatedDuration,
    });
    nextStep();
  };

  const handleSkip = () => {
    updateState({
      selectedAddOns: [],
      totalPrice: state.totalPrice,
      estimatedDuration: state.estimatedDuration,
    });
    nextStep();
  };

  const recommendedAddOns = getRecommendedAddOns();

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-playfair text-white mb-2">Enhance Your Experience</h2>
        <p className="text-gray-300">Add optional services to make your appointment even more special</p>
      </div>

      {/* Recommendations */}
      {recommendedAddOns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 border border-amber-500/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-amber-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Recommended for You</h3>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Based on your selected services, we recommend these add-ons:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedAddOns.map((addOn) => {
              const isSelected = selectedAddOns.includes(addOn.id);
              
              return (
                <div
                  key={addOn.id}
                  className={`
                    p-4 rounded-lg border transition-all duration-200 cursor-pointer
                    ${isSelected 
                      ? 'border-amber-500 bg-amber-500/10' 
                      : 'border-gray-600 hover:border-amber-400/50 hover:bg-amber-500/5'
                    }
                  `}
                  onClick={() => handleAddOnToggle(addOn.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{addOn.title}</h4>
                      <p className="text-gray-300 text-sm mt-1">{addOn.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-amber-400 font-semibold">${addOn.price}</div>
                      <div className="text-gray-400 text-xs flex items-center">
                        <Clock size={12} className="mr-1" />
                        {addOn.duration}min
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Category Tabs */}
      <div className="flex justify-center">
        <div className="glass rounded-full p-1 flex flex-wrap gap-1">
          {categories.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCurrentCategory(key)}
              className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                currentCategory === key
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAddOns.map((addOn, index) => {
          const isSelected = selectedAddOns.includes(addOn.id);
          const quantity = addOnQuantities[addOn.id] || 1;
          const totalPrice = calculateAddOnPrice(addOn, quantity);
          
          return (
            <motion.div
              key={addOn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                glass rounded-xl p-6 transition-all duration-300 cursor-pointer
                ${isSelected 
                  ? 'ring-2 ring-amber-500 shadow-xl shadow-amber-500/20' 
                  : 'hover:shadow-xl hover:scale-105'}
              `}
            >
              <div onClick={() => handleAddOnToggle(addOn.id)}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white pr-2">{addOn.title}</h3>
                  <div className="text-right">
                    <div className="text-xl font-playfair text-amber-400">
                      ${isSelected ? totalPrice : addOn.price}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock size={12} className="mr-1" />
                      {addOn.duration}min
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4">{addOn.description}</p>

                <div className="flex items-center justify-between">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${addOn.category === 'care' ? 'bg-green-500/20 text-green-400' :
                      addOn.category === 'styling' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'}
                  `}>
                    {addOn.category}
                  </span>
                  
                  {isSelected && (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={14} />
                      <span className="text-sm">Added</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(addOn.id, -1);
                        }}
                        disabled={quantity <= 1}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                      >
                        <Minus size={14} className="text-white" />
                      </button>
                      <span className="w-8 text-center text-white font-medium">{quantity}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(addOn.id, 1);
                        }}
                        className="w-8 h-8 bg-amber-500 hover:bg-amber-400 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Plus size={14} className="text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedAddOns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Add-ons Summary</h3>
          <div className="space-y-3">
            {selectedAddOns.map(addOnId => {
              const addOn = addOns.find(a => a.id === addOnId);
              const quantity = addOnQuantities[addOnId] || 1;
              
              return addOn ? (
                <div key={addOnId} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">
                      {addOn.title}
                      {quantity > 1 && (
                        <span className="text-amber-400 ml-1">×{quantity}</span>
                      )}
                    </span>
                  </div>
                  <span className="text-white font-medium">
                    ${calculateAddOnPrice(addOn, quantity)}
                  </span>
                </div>
              ) : null;
            })}
            
            <div className="border-t border-gray-600 pt-3 mt-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-300">Add-ons Total:</span>
                <span className="text-amber-400 font-semibold">${getTotalAddOnPrice()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400 mt-1">
                <span>Additional Time:</span>
                <span>+{getTotalAddOnDuration()} minutes</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Your Info
        </button>

        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            className="px-6 py-3 text-gray-300 hover:text-white border border-gray-600 rounded-full transition-colors"
          >
            Skip Add-ons
          </button>
          
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Continue to Payment
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}