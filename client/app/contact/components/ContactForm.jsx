'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

const PAGE_BG = '#404040';
const ACCENT = '#ab9685';

const initialState = {
  fullName: '',
  email: '',
  phone: '',
  budget: '',
  areaSize: '',
  location: '',
  details: '',
  services: { renovate: false, interior: false, construction: false },
  accept: false,
};

const services = {
  renovate: { label: 'รีโนเวท ปรับปรุง/ต่อเติม', value: 'RENOVATION' },
  interior: { label: 'ออกแบบตกแต่งภายใน', value: 'INTERIOR' },
  construction: { label: 'ก่อสร้าง โครงสร้าง', value: 'CONSTRUCTION' },
};

export default function ContactForm() {
  const [formData, setFormData] = useState(initialState);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{9,10}$/;

    if (!formData.fullName.trim()) return 'กรุณากรอกชื่อ-นามสกุล';
    if (!formData.email.trim()) return 'กรุณากรอกอีเมล';
    if (!formData.phone.trim()) return 'กรุณากรอกเบอร์โทร';
    if (!Object.values(formData.services).some(v => v)) return 'กรุณาเลือกบริการที่ต้องการ';
    if (!formData.budget.trim()) return 'กรุณากรอกงบประมาณ';
    if (!formData.areaSize.trim()) return 'กรุณากรอกขนาดพื้นที่';
    if (!emailRegex.test(formData.email)) return 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!phoneRegex.test(formData.phone)) return 'เบอร์โทรควรเป็นตัวเลข 9-10 หลัก';
    if (isNaN(parseFloat(formData.budget)) || parseFloat(formData.budget) <= 0)
      return 'งบประมาณต้องเป็นตัวเลขมากกว่า 0';
    if (isNaN(parseFloat(formData.areaSize))) return 'ขนาดพื้นที่ต้องเป็นตัวเลข';
    if (!formData.accept) return 'กรุณายอมรับนโยบายความเป็นส่วนตัว';
    return '';
  };

  const handleChange = e => {
    const { name, value, checked } = e.target;
    if (name in formData.services) {
      setFormData(prev => ({ ...prev, services: { ...prev.services, [name]: checked } }));
    } else if (name === 'accept') {
      setFormData(prev => ({ ...prev, accept: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    const needs = Object.entries(formData.services)
      .filter(([, v]) => v)
      .map(([k]) => services[k].value);

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      budget: parseFloat(formData.budget),
      areaSize: parseFloat(formData.areaSize),
      location: formData.location,
      needs,
      details: formData.details || '',
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('ส่งข้อมูลไม่สำเร็จ');
      toast.success('ส่งข้อมูลสำเร็จ');
      setFormData(initialState);
    } catch (err) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div
      className="w-full min-h-dvh"
      style={{ backgroundColor: PAGE_BG, paddingTop: 'var(--page-top)' }}
    >
      {/* Top Bar */}
      <div
        className="py-6 md:py-8 text-center font-semibold tracking-[.6rem]"
        style={{ color: ACCENT, fontSize: 'clamp(1.6rem, 4vw, 2rem)' }}
      >
        CONTACT&nbsp;US
      </div>

      {/* White form area */}
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full px-4 md:px-8 py-10 md:py-16"
      >
        <div className="max-w-[1200px] mx-auto">
          {/* 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 md:gap-x-16 gap-y-6">
            {/* Left */}
            <div>
              <Field label="ชื่อ-นามสกุล ติดต่อกลับ" name="fullName" value={formData.fullName} onChange={handleChange} />
              <Field label="อีเมล" name="email" value={formData.email} onChange={handleChange} />
              <Field label="เบอร์โทรติดต่อ" name="phone" value={formData.phone} onChange={handleChange} />

              <p className="mt-6 mb-4 text-xl md:text-2xl font-semibold">แจ้งความต้องการ</p>

              <div className="flex flex-col gap-4">
                {Object.keys(formData.services).map(k => (
                  <label key={k} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name={k}
                      checked={formData.services[k]}
                      onChange={handleChange}
                      className="w-7 h-7 accent-black cursor-pointer shrink-0"
                    />
                    <span className="text-xl md:text-[1.375rem]">{services[k].label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Right */}
            <div>
              <Field label="งบประมาณ" name="budget" value={formData.budget} onChange={handleChange} />
              <Field label="ขนาดพื้นที่ใช้สอย / ขนาดที่ดิน" name="areaSize" value={formData.areaSize} onChange={handleChange} />
              <Field label="สถานที่ก่อสร้าง" name="location" value={formData.location} onChange={handleChange} />
              <Field
                label="รายละเอียดข้อมูลเพิ่มเติม"
                name="details"
                value={formData.details}
                onChange={handleChange}
                multiline
                rows={5}
              />
            </div>
          </div>

          {/* Accept + Submit */}
          <div className="flex flex-col md:flex-row items-center gap-4 mt-10 md:mt-16 flex-wrap justify-between">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                name="accept"
                checked={formData.accept}
                onChange={handleChange}
                className="w-8 h-8 accent-black cursor-pointer shrink-0"
              />
              <span className="text-base md:text-[1.375rem]">
                ยอมรับข้อตกลงในการใช้งานและนโยบายความเป็นส่วนตัว&nbsp;
                <button
                  type="button"
                  onClick={() => setPrivacyOpen(true)}
                  className="underline text-[1rem] md:text-[1.375rem] hover:opacity-70 transition-opacity"
                >
                  นโยบายความเป็นส่วนตัว
                </button>
              </span>
            </label>

            <button
              type="submit"
              className="rounded-full font-bold text-white transition-colors px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl shrink-0"
              style={{ backgroundColor: ACCENT }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#9a8574')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = ACCENT)}
            >
              ส่งข้อมูล
            </button>
          </div>
        </div>
      </form>

      <PrivacyDialog
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        onAccept={() => {
          setFormData(prev => ({ ...prev, accept: true }));
          setPrivacyOpen(false);
        }}
      />
    </div>
  );
}

function Field({ label, name, value, onChange, multiline, rows }) {
  return (
    <div className="my-6">
      <label
        htmlFor={name}
        className="block text-xl md:text-[1.375rem] font-medium mb-1 text-black/70"
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows || 4}
          className="w-full border-b-2 border-[#ccc] focus:border-black outline-none bg-transparent text-xl md:text-[1.375rem] pt-1 pb-1 resize-none transition-colors"
        />
      ) : (
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full border-b-2 border-[#ccc] hover:border-[#999] focus:border-black outline-none bg-transparent text-xl md:text-[1.375rem] pt-1 pb-1 transition-colors"
        />
      )}
    </div>
  );
}

function PrivacyDialog({ open, onClose, onAccept }) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90dvh] flex flex-col">
        <DialogHeader>
          <DialogTitle>นโยบายความเป็นส่วนตัว</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-1 space-y-4 text-base leading-relaxed border-t border-b py-4 my-2">
          <p>
            เราให้ความสำคัญกับข้อมูลส่วนบุคคลของคุณ ข้อมูลที่คุณให้ผ่านฟอร์มการติดต่อจะถูกใช้เพื่อ
            ติดต่อกลับ จัดทำใบเสนอราคา จัดนัดหมาย และนำไปปรับปรุงคุณภาพงานบริการของเรา
            โดยจะไม่เปิดเผยต่อบุคคลที่สาม เว้นแต่จำเป็นต่อการให้บริการหรือเป็นไปตามกฎหมาย
          </p>
          <p>
            ประเภทข้อมูลที่เก็บ ได้แก่ ชื่อ–นามสกุล อีเมล เบอร์โทร ข้อมูลโครงการ (งบประมาณ พื้นที่
            สถานที่ก่อสร้าง) และรายละเอียดเพิ่มเติม
          </p>
          <p>
            คุณสามารถขอเข้าถึง/แก้ไข/ลบข้อมูล หรือเพิกถอนความยินยอมได้
            โดยติดต่อช่องทางที่ระบุไว้ในเว็บไซต์ของเรา
          </p>
          <p>
            การกดยอมรับนโยบายนี้ถือเป็นการอนุญาตให้เราเก็บและใช้ข้อมูลตามวัตถุประสงค์ที่ระบุ
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ปิด</Button>
          <Button
            onClick={onAccept}
            style={{ backgroundColor: '#ab9685' }}
            className="hover:opacity-90"
          >
            ยอมรับและปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
