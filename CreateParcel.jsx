import React, { useState, useEffect } from 'react';
import { Package, User, MapPin, Settings, DollarSign, Loader2, Phone, CreditCard, FileText, Weight, Ruler } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Quetta', 'Multan', 'Hyderabad', 'Sialkot', 'Gujranwala', 'Bahawalpur', 'Other'];

const initialForm = {
  shipperName: '', shipperPhone: '', shipperCNIC: '', shipperAddress: '', originCity: '',
  receiverName: '', receiverPhone: '', receiverAddress: '', receiverCity: '', receiverPostalCode: '', receiverCNIC: '',
  parcelDescription: '', parcelCategory: 'document',
  parcelWeight: '', parcelLength: '', parcelWidth: '', parcelHeight: '',
  deliveryType: 'standard', codOption: false, declaredValue: '', insuranceOptions: false, discountAmount: ''
};

const Field = ({ label, name, value, onChange, type = 'text', placeholder, required, children, ...props }) => (
  <div className="form-group">
    <label className="input-label">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children || (
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        autoComplete="off"
        spellCheck={false}
        className="input-field"
        {...props}
      />
    )}
  </div>
);

const CitySelect = ({ name, label, value, onChange, required }) => (
  <div className="form-group">
    <label className="input-label">{label} {required && <span className="text-red-400">*</span>}</label>
    <select name={name} value={value} onChange={onChange} className="input-field" required={required}>
      <option value="">Select City</option>
      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  </div>
);

const CreateParcel = ({ onSuccess }) => {
  const [formData, setFormData] = useState(initialForm);
  const [calc, setCalc] = useState({ volumetric: 0, charged: 0, base: 0, fuel: 0, express: 0, insurance: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  // Auto-calculate charges whenever relevant fields change
  useEffect(() => {
    const w = parseFloat(formData.parcelWeight) || 0;
    const l = parseFloat(formData.parcelLength) || 0;
    const wi = parseFloat(formData.parcelWidth) || 0;
    const h = parseFloat(formData.parcelHeight) || 0;

    const volumetric = l && wi && h ? parseFloat(((l * wi * h) / 5000).toFixed(2)) : 0;
    const charged = Math.max(w, volumetric);
    const base = charged > 0 ? 500 + charged * 250 : 0;
    const fuel = parseFloat((base * 0.1).toFixed(0));
    const express = formData.deliveryType === 'express' ? 1000 : 0;
    const insurance = formData.insuranceOptions && formData.declaredValue
      ? parseFloat((parseFloat(formData.declaredValue) * 0.02).toFixed(0)) : 0;
    const discount = parseFloat(formData.discountAmount) || 0;
    const total = Math.max(0, base + fuel + express + insurance - discount);

    setCalc({ volumetric, charged, base, fuel, express, insurance, discount, total });
  }, [formData.parcelWeight, formData.parcelLength, formData.parcelWidth, formData.parcelHeight,
      formData.deliveryType, formData.insuranceOptions, formData.declaredValue, formData.discountAmount]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.parcelWeight || parseFloat(formData.parcelWeight) <= 0) {
      return toast.error('Please enter a valid parcel weight.');
    }
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo?.token) {
        setLoading(false);
        return toast.error('Please login again before booking a shipment.');
      }
      const cfg = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('http://localhost:5000/api/parcels/create', {
        ...formData,
        volumetricWeight: calc.volumetric,
        chargedWeight: calc.charged,
        deliveryCharges: calc.base + calc.fuel,
        fuelCharges: calc.fuel,
        totalAmount: calc.total,
      }, cfg);
      toast.success('🎉 Shipment booked successfully!');
      setFormData(initialForm);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Book New Shipment</h2>
          <p className="text-xs text-slate-500">Fill in the details to create a consignment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Section 1: Shipper ── */}
        <div className="form-section">
          <div className="form-section-title">
            <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <span>01 — Shipper Information</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" name="shipperName" value={formData.shipperName} onChange={handle} placeholder="Your full name" required />
            <Field label="Phone Number" name="shipperPhone" value={formData.shipperPhone} onChange={handle} type="tel" placeholder="03XX-XXXXXXX" required inputMode="tel" pattern="[0-9-]*" maxLength={11} />
            <Field label="CNIC" name="shipperCNIC" value={formData.shipperCNIC} onChange={handle} type="tel" placeholder="XXXXX-XXXXXXX-X" inputMode="numeric" pattern="[0-9-]*" maxLength={15} />
            <CitySelect name="originCity" label="Origin City" value={formData.originCity} onChange={handle} required />
            <div className="sm:col-span-2">
              <Field label="Address" name="shipperAddress" value={formData.shipperAddress} onChange={handle} placeholder="Full pickup address" required />
            </div>
          </div>
        </div>

        {/* ── Section 2: Receiver ── */}
        <div className="form-section">
          <div className="form-section-title">
            <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span>02 — Receiver Information</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" name="receiverName" value={formData.receiverName} onChange={handle} placeholder="Recipient full name" required />
            <Field label="Phone Number" name="receiverPhone" value={formData.receiverPhone} onChange={handle} type="tel" placeholder="03XX-XXXXXXX" required inputMode="tel" pattern="[0-9-]*" maxLength={11} />
            <div className="sm:col-span-2">
              <Field label="Delivery Address" name="receiverAddress" value={formData.receiverAddress} onChange={handle} placeholder="Full delivery address" required />
            </div>
            <CitySelect name="receiverCity" label="Destination City" value={formData.receiverCity} onChange={handle} required />
            <Field label="Postal Code" name="receiverPostalCode" value={formData.receiverPostalCode} onChange={handle} type="tel" placeholder="e.g. 54000" required inputMode="numeric" pattern="[0-9]*" maxLength={5} />
            <Field label="Receiver CNIC" name="receiverCNIC" value={formData.receiverCNIC} onChange={handle} type="tel" placeholder="XXXXX-XXXXXXX-X" inputMode="numeric" pattern="[0-9-]*" maxLength={15} />
          </div>
        </div>

        {/* ── Section 3: Parcel Specs ── */}
        <div className="form-section">
          <div className="form-section-title">
            <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
              <Weight className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span>03 — Parcel Specifications</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Actual Weight (kg)" name="parcelWeight" value={formData.parcelWeight} onChange={handle} type="number" placeholder="e.g. 2.5" required />
            <Field label="Length (cm)" name="parcelLength" value={formData.parcelLength} onChange={handle} type="number" placeholder="0" />
            <Field label="Width (cm)" name="parcelWidth" value={formData.parcelWidth} onChange={handle} type="number" placeholder="0" />
            <Field label="Height (cm)" name="parcelHeight" value={formData.parcelHeight} onChange={handle} type="number" placeholder="0" />
          </div>
          {(calc.volumetric > 0 || calc.charged > 0) && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {[
                { label: 'Volumetric Wt.', val: `${calc.volumetric} kg`, color: 'bg-violet-50 text-violet-700 border-violet-100' },
                { label: 'Charged Weight', val: `${calc.charged} kg`, color: 'bg-amber-50 text-amber-700 border-amber-100' },
                { label: 'Calculated On', val: calc.charged === calc.volumetric ? 'Volumetric' : 'Actual', color: 'bg-slate-50 text-slate-600 border-slate-200' },
              ].map(item => (
                <div key={item.label} className={`rounded-xl p-3 border text-center ${item.color}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">{item.label}</p>
                  <p className="text-sm font-black mt-0.5">{item.val}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Section 4: Options ── */}
        <div className="form-section">
          <div className="form-section-title">
            <div className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <span>04 — Shipment Options</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="input-label">Category</label>
              <select name="parcelCategory" value={formData.parcelCategory} onChange={handle} className="input-field">
                {['document','electronics','clothing','fragile','other'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Service Type <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {['standard','express'].map(type => (
                  <label key={type} className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all ${
                    formData.deliveryType === type
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>
                    <input type="radio" name="deliveryType" value={type} checked={formData.deliveryType === type} onChange={handle} className="hidden" />
                    {type === 'express' ? '⚡' : '🚚'} {type.charAt(0).toUpperCase() + type.slice(1)}
                    {type === 'express' && <span className="text-xs text-amber-600">+Rs.1000</span>}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="input-label">Description</label>
              <textarea name="parcelDescription" value={formData.parcelDescription} onChange={handle}
                className="input-field resize-none" rows={2} placeholder="Brief description of parcel contents" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                  formData.codOption ? 'bg-primary-600 border-primary-600' : 'border-slate-300'
                }`}>
                  {formData.codOption && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <input type="checkbox" name="codOption" checked={formData.codOption} onChange={handle} className="hidden" />
                <span className="text-sm font-medium text-slate-700">COD (Cash on Delivery)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                  formData.insuranceOptions ? 'bg-primary-600 border-primary-600' : 'border-slate-300'
                }`}>
                  {formData.insuranceOptions && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <input type="checkbox" name="insuranceOptions" checked={formData.insuranceOptions} onChange={handle} className="hidden" />
                <span className="text-sm font-medium text-slate-700">Add Insurance (2%)</span>
              </label>
            </div>
            {formData.insuranceOptions && (
              <Field label="Declared Value (Rs.)" name="declaredValue" value={formData.declaredValue} onChange={handle} type="number" placeholder="e.g. 50000" />
            )}
            <Field label="Discount (Rs.)" name="discountAmount" value={formData.discountAmount} onChange={handle} type="number" placeholder="0" />
          </div>
        </div>

        {/* ── Section 5: Price Breakdown ── */}
        {calc.total > 0 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-400 uppercase tracking-wide">05 — Pricing Breakdown</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Base Charge', val: calc.base },
                { label: 'Fuel Surcharge (10%)', val: calc.fuel },
                calc.express ? { label: 'Express Premium', val: calc.express } : null,
                calc.insurance ? { label: 'Insurance Fee (2%)', val: calc.insurance } : null,
                calc.discount ? { label: 'Discount', val: -calc.discount } : null,
              ].filter(Boolean).map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={item.val < 0 ? 'text-emerald-400 font-semibold' : 'text-white font-semibold'}>
                    {item.val < 0 ? '- ' : ''}Rs. {Math.abs(item.val).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/20 mt-4 pt-4 flex justify-between items-center">
              <span className="text-slate-300 font-semibold">Total Amount</span>
              <span className="text-2xl font-black text-amber-400">Rs. {calc.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || !formData.parcelWeight} className="btn-primary w-full py-3 text-base">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Booking...</> : <><Package className="w-5 h-5" /> Book Shipment</>}
        </button>
      </form>
    </div>
  );
};

export default CreateParcel;
