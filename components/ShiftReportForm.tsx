
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Printer, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  History
} from 'lucide-react';
import { 
  ShiftReport, 
  HourlyReading, 
  DowntimeEvent, 
  BeltSpeedCheck 
} from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ShiftReportFormProps {
  initialData?: Partial<ShiftReport>;
  onSave: (report: ShiftReport) => void;
}

const HOURS = [
  '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', 
  '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'
];

const PRODUCTS = [
  'McCrispy Fillet',
  'McNugget Strips',
  'BWW Boneless Wings',
  'BWW Strips',
  'BWW Fillets'
];

export const ShiftReportForm: React.FC<ShiftReportFormProps> = ({ initialData, onSave }) => {
  const [report, setReport] = useState<ShiftReport>(() => ({
    id: `REPORT-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    shift: 'Night',
    operator: '',
    hourlyReadings: HOURS.map(h => ({
      hour: h,
      product: '',
      avgWeight: '',
      avgThickness: '',
      density: '',
      corrections: '',
      delfix: ''
    })),
    downtimeEvents: [],
    beltSpeedChecks: [],
    ...initialData
  }));

  const [activeTab, setActiveTab] = useState<'hourly' | 'downtime' | 'belts'>('hourly');

  const updateHourly = (index: number, field: keyof HourlyReading, value: string) => {
    const nextReadings = [...report.hourlyReadings];
    nextReadings[index] = { ...nextReadings[index], [field]: value };
    setReport({ ...report, hourlyReadings: nextReadings });
  };

  const addDowntime = () => {
    setReport({
      ...report,
      downtimeEvents: [
        ...report.downtimeEvents,
        { id: `DT-${Date.now()}`, startTime: '', endTime: '', unit: 'Megajet 1', reason: '' }
      ]
    });
  };

  const removeDowntime = (id: string) => {
    setReport({
      ...report,
      downtimeEvents: report.downtimeEvents.filter(e => e.id !== id)
    });
  };

  const updateDowntime = (id: string, field: keyof DowntimeEvent, value: string) => {
    setReport({
      ...report,
      downtimeEvents: report.downtimeEvents.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const addBeltCheck = () => {
    setReport({
      ...report,
      beltSpeedChecks: [
        ...report.beltSpeedChecks,
        { id: `BC-${Date.now()}`, time: '', product: '', speed: '', type: 'Routine' }
      ]
    });
  };

  const removeBeltCheck = (id: string) => {
    setReport({
      ...report,
      beltSpeedChecks: report.beltSpeedChecks.filter(c => c.id !== id)
    });
  };

  const updateBeltCheck = (id: string, field: keyof BeltSpeedCheck, value: string) => {
    setReport({
      ...report,
      beltSpeedChecks: report.beltSpeedChecks.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header - Print Hidden */}
      <div className="p-6 bg-slate-900/50 border-b border-white/5 flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-brand-red rounded-2xl flex items-center justify-center shadow-lg shadow-brand-red/20">
            <FileText className="text-white h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Operator Shift Report</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Compliance & Performance Log</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePrint}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <Printer className="h-5 w-5" />
          </button>
          <button 
            onClick={() => onSave(report)}
            className="flex items-center space-x-2 px-6 py-3 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all transform active:scale-95 shadow-xl shadow-brand-red/20"
          >
            <Save className="h-4 w-4" />
            <span>Save Report</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8 bg-white print:bg-white print:p-0 print:m-0 rounded-[2rem] p-8 text-slate-900 shadow-2xl relative overflow-hidden">
          {/* Watermark for Digital Preview */}
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none print:hidden">
            <FileText className="h-64 w-64" />
          </div>

          {/* Report Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-slate-900 pb-6 gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">PECO<span className="text-brand-red">FOODS</span></h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pocahontas Processing Facility</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
                <input 
                  type="date" 
                  value={report.date}
                  onChange={(e) => setReport({ ...report, date: e.target.value })}
                  className="block w-full font-bold border-b border-slate-200 focus:border-brand-red outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shift</label>
                <select 
                  value={report.shift}
                  onChange={(e) => setReport({ ...report, shift: e.target.value as 'Day' | 'Night' })}
                  className="block w-full font-bold border-b border-slate-200 focus:border-brand-red outline-none transition-colors appearance-none"
                >
                  <option>Day</option>
                  <option>Night</option>
                </select>
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operator</label>
                <input 
                  type="text" 
                  placeholder="Employee Name"
                  value={report.operator}
                  onChange={(e) => setReport({ ...report, operator: e.target.value })}
                  className="block w-full font-bold border-b border-slate-200 focus:border-brand-red outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Navigation - Print Hidden */}
          <div className="flex space-x-2 border-b border-slate-100 print:hidden">
            {[
              { id: 'hourly', label: 'Hourly Readings', icon: Clock },
              { id: 'downtime', label: 'Downtime Log', icon: AlertCircle },
              { id: 'belts', label: 'Belt Speed Checks', icon: History }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-bold text-[10px] uppercase tracking-widest transition-all relative ${
                  activeTab === tab.id ? 'text-brand-red' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-brand-red rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Hourly Readings Section */}
          <div className={`space-y-4 ${activeTab !== 'hourly' ? 'print:block hidden' : 'block'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center space-x-2">
                <Clock className="h-5 w-5 text-brand-red" />
                <span>Hourly Production Readings</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase hidden md:block">Critical Spec Monitoring</p>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Hour</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Product</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Avg Weight (g)</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Thickness (mm)</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Density</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Corrections</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Delfix</th>
                  </tr>
                </thead>
                <tbody>
                  {report.hourlyReadings.map((reading, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-black text-slate-900 border-b border-slate-50">{reading.hour}</td>
                      <td className="p-2 border-b border-slate-50">
                        <select 
                          value={reading.product}
                          onChange={(e) => updateHourly(idx, 'product', e.target.value)}
                          className="w-full h-10 px-2 font-bold text-sm bg-transparent outline-none focus:ring-2 ring-brand-red/20 rounded"
                        >
                          <option value="">Select...</option>
                          {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      <td className="p-2 border-b border-slate-50">
                        <input 
                          type="text" 
                          value={reading.avgWeight}
                          onChange={(e) => updateHourly(idx, 'avgWeight', e.target.value)}
                          className="w-full h-10 px-2 font-bold text-sm bg-transparent border-b border-transparent focus:border-brand-red outline-none"
                        />
                      </td>
                      <td className="p-2 border-b border-slate-50">
                        <input 
                          type="text" 
                          value={reading.avgThickness}
                          onChange={(e) => updateHourly(idx, 'avgThickness', e.target.value)}
                          className="w-full h-10 px-2 font-bold text-sm bg-transparent border-b border-transparent focus:border-brand-red outline-none"
                        />
                      </td>
                      <td className="p-2 border-b border-slate-50">
                        <input 
                          type="text" 
                          value={reading.density}
                          onChange={(e) => updateHourly(idx, 'density', e.target.value)}
                          className="w-full h-10 px-2 font-bold text-sm bg-transparent border-b border-transparent focus:border-brand-red outline-none"
                        />
                      </td>
                      <td className="p-2 border-b border-slate-50">
                        <input 
                          type="text" 
                          value={reading.corrections}
                          onChange={(e) => updateHourly(idx, 'corrections', e.target.value)}
                          className="w-full h-10 px-2 font-bold text-sm bg-transparent border-b border-transparent focus:border-brand-red outline-none"
                        />
                      </td>
                      <td className="p-2 border-b border-slate-50">
                        <input 
                          type="text" 
                          value={reading.delfix}
                          onChange={(e) => updateHourly(idx, 'delfix', e.target.value)}
                          className="w-full h-10 px-2 font-bold text-sm bg-transparent border-b border-transparent focus:border-brand-red outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Downtime Section */}
          <div className={`space-y-4 ${activeTab !== 'downtime' ? 'print:block hidden' : 'block'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-brand-red" />
                <span>Megajet Downtime Events</span>
              </h3>
              <button 
                onClick={addDowntime}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors print:hidden"
              >
                <Plus className="h-4 w-4" />
                <span>Log Downtime</span>
              </button>
            </div>

            <div className="space-y-3">
              {report.downtimeEvents.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                  <CheckCircle2 className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No downtime recorded this shift</p>
                </div>
              )}
              {report.downtimeEvents.map(event => (
                <div key={event.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-end">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Unit</label>
                    <select 
                      value={event.unit}
                      onChange={(e) => updateDowntime(event.id, 'unit', e.target.value)}
                      className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 font-bold text-sm outline-none focus:border-brand-red"
                    >
                      <option>Megajet 1</option>
                      <option>Megajet 2</option>
                      <option>Megajet 3</option>
                      <option>Megajet 4</option>
                      <option>Megajet 5</option>
                      <option>Megajet 6</option>
                      <option>Grasselli 1-6</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Start Time</label>
                    <input 
                      type="time" 
                      value={event.startTime}
                      onChange={(e) => updateDowntime(event.id, 'startTime', e.target.value)}
                      className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 font-bold text-sm outline-none focus:border-brand-red"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">End Time</label>
                    <input 
                      type="time" 
                      value={event.endTime}
                      onChange={(e) => updateDowntime(event.id, 'endTime', e.target.value)}
                      className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 font-bold text-sm outline-none focus:border-brand-red"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Reason / Incident</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Hose Burst"
                      value={event.reason}
                      onChange={(e) => updateDowntime(event.id, 'reason', e.target.value)}
                      className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 font-bold text-sm outline-none focus:border-brand-red"
                    />
                  </div>
                  <div className="flex justify-end print:hidden">
                    <button 
                      onClick={() => removeDowntime(event.id)}
                      className="p-3 text-slate-400 hover:text-brand-red transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Belt Speed Checks Section */}
          <div className={`space-y-4 ${activeTab !== 'belts' ? 'print:block hidden' : 'block'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center space-x-2">
                <History className="h-5 w-5 text-brand-red" />
                <span>Belt Speed Audits</span>
              </h3>
              <button 
                onClick={addBeltCheck}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors print:hidden"
              >
                <Plus className="h-4 w-4" />
                <span>Log Speed Check</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.beltSpeedChecks.map(check => (
                <div key={check.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      check.type === 'Changeover' ? 'bg-amber-100 text-amber-600' : 'bg-brand-red/10 text-brand-red'
                    }`}>
                      {check.type} Check
                    </div>
                    <button 
                      onClick={() => removeBeltCheck(check.id)}
                      className="text-slate-300 hover:text-brand-red transition-colors print:hidden"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Time</label>
                      <input 
                        type="time" 
                        value={check.time}
                        onChange={(e) => updateBeltCheck(check.id, 'time', e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 font-bold text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Type</label>
                      <select 
                        value={check.type}
                        onChange={(e) => updateBeltCheck(check.id, 'type', e.target.value as any)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 font-bold text-sm outline-none"
                      >
                        <option>Routine</option>
                        <option>Changeover</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Product</label>
                      <select 
                        value={check.product}
                        onChange={(e) => updateBeltCheck(check.id, 'product', e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 font-bold text-sm outline-none"
                      >
                        <option value="">Select...</option>
                        {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Speed (ft/min)</label>
                      <input 
                        type="text" 
                        value={check.speed}
                        onChange={(e) => updateBeltCheck(check.id, 'speed', e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 font-bold text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {report.beltSpeedChecks.length === 0 && (
                <div className="col-span-2 p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">At least 3 speed checks required per shift</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="pt-12 grid grid-cols-2 gap-12">
            <div className="border-t-2 border-slate-900 pt-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Operator Signature</p>
              <div className="h-10"></div>
            </div>
            <div className="border-t-2 border-slate-900 pt-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Supervisor Verification</p>
              <div className="h-10"></div>
            </div>
          </div>
          
          <div className="text-center text-[8px] font-bold text-slate-300 uppercase tracking-[0.5em] pt-8">
            Internal Document / Peco Foods Inc / Confidential
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftReportForm;
