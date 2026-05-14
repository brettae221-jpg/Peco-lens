import React, { useState } from 'react';
import { calculateDensitySetting } from '../services/geminiService';
import { CogIcon } from './icons/CogIcon';
import { CalculatorIcon } from './CalculatorIcon';

const POULTRY_PRODUCTS = [
    "McCrispy Fillet",
    "McNugget Strips",
    "BWW Boneless Wings",
    "BWW Strips",
    "BWW Fillets",
];

const DensityCalculator: React.FC = () => {
    const [productType, setProductType] = useState(POULTRY_PRODUCTS[0]);
    const [targetWeight, setTargetWeight] = useState('95');
    const [averageThickness, setAverageThickness] = useState('14');
    const [beltSpeed, setBeltSpeed] = useState('15');
    
    const [result, setResult] = useState<{ densitySetting: number; explanation: string; } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        setIsLoading(true);

        const weight = parseFloat(targetWeight);
        const thickness = parseFloat(averageThickness);
        const speed = parseFloat(beltSpeed);

        if (isNaN(weight) || isNaN(thickness) || isNaN(speed)) {
            setError("Please ensure all fields are valid numbers.");
            setIsLoading(false);
            return;
        }

        try {
            const calculatedResult = await calculateDensitySetting(productType, weight, thickness, speed);
            setResult(calculatedResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred while calculating.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full bg-white/60 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-red outline-none transition-all placeholder:text-slate-400 text-slate-800";
    const labelClass = "block text-sm font-semibold text-slate-700 mb-2";

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-extrabold mb-2 text-app-text tracking-tight">HMI Density <span className="text-brand-red">Calculator</span></h2>
            <p className="mb-8 text-slate-500 font-medium">
                Enter parameters to calculate the precise density setting for the Megajet HMI.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-5 p-6 glass rounded-3xl border border-white/50 shadow-xl h-fit">
                    <div>
                        <label htmlFor="product-type" className={labelClass}>Product Type</label>
                        <select id="product-type" value={productType} onChange={(e) => setProductType(e.target.value)} className={inputClass}>
                            {POULTRY_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="target-weight" className={labelClass}>Target Weight (g)</label>
                          <input type="number" id="target-weight" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className={inputClass} required step="0.1" />
                      </div>
                      <div>
                          <label htmlFor="avg-thickness" className={labelClass}>Avg Thickness (mm)</label>
                          <input type="number" id="avg-thickness" value={averageThickness} onChange={(e) => setAverageThickness(e.target.value)} className={inputClass} required step="0.1" />
                      </div>
                    </div>
                    <div>
                        <label htmlFor="belt-speed" className={labelClass}>Belt Speed (m/min)</label>
                        <input type="number" id="belt-speed" value={beltSpeed} onChange={(e) => setBeltSpeed(e.target.value)} className={inputClass} required step="0.1" />
                    </div>
                    <div className="text-right pt-4">
                        <button type="submit" disabled={isLoading} className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-brand-red/20 active:scale-95 disabled:opacity-50">
                            {isLoading ? <CogIcon className="h-6 w-6 animate-spin mr-2" /> : <CalculatorIcon className="h-6 w-6 mr-2" />}
                            {isLoading ? 'Calculating...' : 'Calculate Density'}
                        </button>
                    </div>
                </form>

                {/* Result Section */}
                <div className="flex items-center justify-center min-h-[300px]">
                    {isLoading && (
                        <div className="text-center p-12 glass rounded-3xl border border-white/50 shadow-xl w-full">
                            <CogIcon className="h-16 w-16 mx-auto animate-spin text-brand-red" />
                            <p className="mt-6 text-xl font-bold text-slate-700">AI is calculating...</p>
                            <p className="text-slate-400 text-sm mt-2">Optimizing for target weight accuracy</p>
                        </div>
                    )}

                    {error && (
                        <div className="w-full p-6 bg-red-50 border border-red-100 rounded-3xl text-brand-red shadow-xl">
                            <h3 className="font-bold text-lg mb-2">Calculation Error</h3>
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {result && !isLoading && (
                        <div className="w-full text-center glass p-8 rounded-3xl border border-white/50 shadow-2xl animate-fade-in">
                            <p className="text-lg font-bold text-slate-500 uppercase tracking-widest">Recommended Setting</p>
                            <p className="text-8xl font-black text-brand-red my-4 drop-shadow-sm">{result.densitySetting.toFixed(3)}</p>
                            <div className="mt-8 text-left text-sm bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-white/80 shadow-inner">
                                <p className="font-bold text-slate-800 mb-2 flex items-center">
                                  <div className="w-2 h-2 bg-brand-red rounded-full mr-2"></div>
                                  AI Analysis
                                </p>
                                <p className="text-slate-600 leading-relaxed font-medium">{result.explanation}</p>
                            </div>
                        </div>
                    )}
                    
                    {!result && !isLoading && !error && (
                      <div className="text-center p-12 glass rounded-3xl border border-white/50 shadow-xl w-full opacity-50">
                        <CalculatorIcon className="h-20 w-20 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-400 font-bold">Ready to calculate</p>
                      </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DensityCalculator;
