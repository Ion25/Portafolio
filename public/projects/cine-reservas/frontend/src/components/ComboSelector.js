/**
 * Componente para seleccionar combos de comida.
 * Muestra combos regulares y premium según el tipo de usuario.
 */

import React from 'react';
import { Popcorn, Coffee, Crown, Star } from 'lucide-react';
import clsx from 'clsx';

const ComboSelector = ({ 
  availableCombos, 
  selectedCombo, 
  onComboSelect, 
  isPremium = false,
  className = ""
}) => {
  
  const regularCombos = availableCombos.regular_combos || [];
  const premiumCombos = availableCombos.premium_combos || [];
  const allCombos = [...regularCombos, ...(isPremium ? premiumCombos : [])];

  if (allCombos.length === 0) {
    return (
      <div className={clsx("p-4 bg-gray-800/50 rounded-lg text-center", className)}>
        <Popcorn className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">No hay combos disponibles</p>
      </div>
    );
  }

  const getComboIcon = (comboName) => {
    const name = comboName.toLowerCase();
    
    if (name.includes('vip') || name.includes('premium') || name.includes('ejecutivo')) {
      return <Crown className="w-5 h-5 text-primary-400" />;
    } else if (name.includes('bebida') || name.includes('drink')) {
      return <Coffee className="w-5 h-5 text-blue-400" />;
    } else {
      return <Popcorn className="w-5 h-5 text-yellow-400" />;
    }
  };

  const isComboSelected = (comboName) => selectedCombo === comboName;

  return (
    <div className={clsx("space-y-4", className)}>
      {/* Título */}
      <div className="flex items-center space-x-2">
        <Popcorn className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Selecciona tu Combo</h3>
        {isPremium && (
          <div className="flex items-center space-x-1 bg-primary-500/20 px-2 py-1 rounded-full">
            <Crown className="w-4 h-4 text-primary-400" />
            <span className="text-xs text-primary-400 font-medium">PREMIUM</span>
          </div>
        )}
      </div>

      {/* Botón para no seleccionar combo */}
      <button
        onClick={() => onComboSelect('')}
        className={clsx(
          "w-full p-3 rounded-lg border-2 transition-all duration-200 text-left",
          {
            "border-purple-500 bg-purple-500/20": selectedCombo === '',
            "border-gray-600 bg-gray-800/50 hover:border-gray-500": selectedCombo !== ''
          }
        )}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">✕</span>
          </div>
          <div>
            <p className="font-medium text-white">Sin Combo</p>
            <p className="text-sm text-gray-400">Solo los asientos</p>
          </div>
        </div>
      </button>

      {/* Combos regulares */}
      {regularCombos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
            <Star className="w-4 h-4 text-gray-400" />
            <span>Combos Regulares</span>
          </h4>
          
          <div className="space-y-2">
            {regularCombos.map((combo) => (
              <button
                key={combo.name}
                onClick={() => onComboSelect(combo.name)}
                className={clsx(
                  "w-full p-3 rounded-lg border-2 transition-all duration-200 text-left hover:scale-[1.02] active:scale-[0.98]",
                  {
                    "border-purple-500 bg-purple-500/20": isComboSelected(combo.name),
                    "border-gray-600 bg-gray-800/50 hover:border-gray-500": !isComboSelected(combo.name)
                  }
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    {getComboIcon(combo.name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{combo.name}</p>
                    <p className="text-sm text-gray-400 mb-1">{combo.description}</p>
                    <p className="text-emerald-400 font-semibold">${combo.price}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Combos premium (solo para usuarios premium) */}
      {isPremium && premiumCombos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-primary-400 mb-2 flex items-center space-x-2">
            <Crown className="w-4 h-4 text-primary-400" />
            <span>Combos Premium Exclusivos</span>
          </h4>
          
          <div className="space-y-2">
            {premiumCombos.map((combo) => (
              <button
                key={combo.name}
                onClick={() => onComboSelect(combo.name)}
                className={clsx(
                  "w-full p-3 rounded-lg border-2 transition-all duration-200 text-left hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden",
                  {
                    "border-primary-500 bg-primary-500/20": isComboSelected(combo.name),
                    "border-primary-600/50 bg-gradient-to-r from-primary-900/20 to-primary-800/20 hover:border-primary-500/70": !isComboSelected(combo.name)
                  }
                )}
              >
                {/* Efecto de brillo premium */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/10 to-transparent animate-pulse-slow" />
                
                <div className="relative flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    {getComboIcon(combo.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-white">{combo.name}</p>
                      <Crown className="w-4 h-4 text-primary-400" />
                    </div>
                    <p className="text-sm text-gray-300 mb-1">{combo.description}</p>
                    <p className="text-primary-400 font-semibold">${combo.price}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje para usuarios no premium */}
      {!isPremium && premiumCombos.length > 0 && (
        <div className="p-3 bg-primary-900/20 border border-primary-600/30 rounded-lg">
          <div className="flex items-center space-x-2 text-primary-400 text-sm">
            <Crown className="w-4 h-4" />
            <span>¡Actualízate a Premium para acceder a {premiumCombos.length} combos exclusivos!</span>
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {availableCombos.recommendations && availableCombos.recommendations.length > 0 && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
          <h5 className="text-sm font-medium text-blue-400 mb-2">💡 Recomendaciones:</h5>
          <ul className="text-xs text-gray-300 space-y-1">
            {availableCombos.recommendations.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComboSelector;