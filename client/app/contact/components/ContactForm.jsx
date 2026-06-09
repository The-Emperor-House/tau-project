'use client';

import {
  Box,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  FormGroup,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

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

const PAGE_BG = '#404040';
const ACCENT = '#ab9685';

export default function ContactForm() {
  const [formData, setFormData] = useState(initialState);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
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
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
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
      setSnackbar({ open: true, message: 'ส่งข้อมูลสำเร็จ', severity: 'success' });
      setFormData(initialState);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'เกิดข้อผิดพลาด', severity: 'error' });
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: PAGE_BG,
        minHeight: '100dvh',
        pt: { xs: '170px', md: '270px' },
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          color: ACCENT,
          py: { xs: 2.5, md: 3 },
          textAlign: 'center',
          letterSpacing: '.6rem',
          fontSize: { xs: '1.6rem', md: '2rem' },
          fontWeight: 600,
        }}
      >
        CONTACT&nbsp;US
      </Box>

      {/* White full-bleed form area */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          bgcolor: '#fff',
          width: '100vw',
          mx: 'calc(50% - 50vw)', // full-bleed
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* 2 columns */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              columnGap: { xs: 4, md: 10 },
              rowGap: 4,
            }}
          >
            {/* Left */}
            <Box>
              <Field label="ชื่อ-นามสกุล ติดต่อกลับ" name="fullName" value={formData.fullName} onChange={handleChange} />
              <Field label="อีเมล" name="email" value={formData.email} onChange={handleChange} />
              <Field label="เบอร์โทรติดต่อ" name="phone" value={formData.phone} onChange={handleChange} />

              <Typography sx={{ mt: 3, mb: 1.5, fontSize: { xs: 20, md: 24 }, fontWeight: 600 }}>
                แจ้งความต้องการ
              </Typography>

              <FormGroup sx={{ gap: 1.5 }}>
                {Object.keys(formData.services).map(k => (
                  <FormControlLabel
                    key={k}
                    control={
                      <Checkbox
                        name={k}
                        checked={formData.services[k]}
                        onChange={handleChange}
                        sx={{
                          color: '#000',
                          '&.Mui-checked': { color: '#000' },
                          '& .MuiSvgIcon-root': { fontSize: 30 },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: { xs: 20, md: 22 } }}>{services[k].label}</Typography>
                    }
                    sx={{ m: 0 }}
                  />
                ))}
              </FormGroup>
            </Box>

            {/* Right */}
            <Box>
              <Field label="งบประมาณ" name="budget" value={formData.budget} onChange={handleChange} />
              <Field
                label="ขนาดพื้นที่ใช้สอย / ขนาดที่ดิน"
                name="areaSize"
                value={formData.areaSize}
                onChange={handleChange}
              />
              <Field label="สถานที่ก่อสร้าง" name="location" value={formData.location} onChange={handleChange} />
              <Field
                label="รายละเอียดข้อมูลเพิ่มเติม"
                name="details"
                value={formData.details}
                onChange={handleChange}
                multiline
                minRows={5}
              />
            </Box>
          </Box>

          {/* Accept + Submit */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mt: { xs: 4, md: 6 },
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  name="accept"
                  checked={formData.accept}
                  onChange={handleChange}
                  sx={{ color: '#000', '&.Mui-checked': { color: '#000' }, '& .MuiSvgIcon-root': { fontSize: 34 } }}
                />
              }
              label={
                <Typography sx={{ fontSize: { xs: 14, md: 22 } }}>
                  ยอมรับข้อตกลงในการใช้งานและนโยบายความเป็นส่วนตัว&nbsp;
                  {/* ปุ่มเปิด popup */}
                  <Button
                    type="button"
                    onClick={() => setPrivacyOpen(true)}
                    sx={{
                      p: 0,
                      minWidth: 0,
                      color: 'inherit',
                      textDecoration: 'underline',
                      fontSize: { xs: 16, md: 22 },
                      '&:hover': { backgroundColor: 'transparent' },
                    }}
                  >
                    นโยบายความเป็นส่วนตัว
                  </Button>
                </Typography>
              }
              sx={{ m: 0, flex: 1 }}
            />

            <Button
              type="submit"
              disableElevation
              sx={{
                bgcolor: ACCENT,
                color: '#fff',
                px: { xs: 4, md: 6 },
                py: { xs: 1.2, md: 1.4 },
                borderRadius: 9999,
                fontWeight: 700,
                fontSize: { xs: 18, md: 20 },
                letterSpacing: '.02em',
                '&:hover': { bgcolor: '#9a8574' },
              }}
            >
              ส่งข้อมูล
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Privacy Policy Dialog */}
      <PrivacyDialog
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        onAccept={() => {
          setFormData(prev => ({ ...prev, accept: true }));
          setPrivacyOpen(false);
        }}
      />
    </Box>
  );
}

/* ------- ช่องกรอกแบบเส้นใต้หนา (สไตล์ภาพตัวอย่าง) ------- */
function Field(props) {
  const { label, ...rest } = props;
  return (
    <TextField
      variant="standard"
      fullWidth
      label={label}
      InputLabelProps={{ shrink: true, sx: { fontSize: { xs: 20, md: 22 } } }}
      sx={{
        my: { xs: 2.2, md: 2.6 },
        '& .MuiInputBase-root': { fontSize: { xs: 20, md: 22 } },
        '& .MuiInput-underline:before': { borderBottomWidth: 2, borderColor: '#ccc' },
        '& .MuiInput-underline:hover:before': { borderBottomWidth: 2, borderColor: '#999' },
        '& .MuiInput-underline:after': { borderBottomWidth: 2, borderColor: '#000' },
      }}
      {...rest}
    />
  );
}

/* ------- Dialog นโยบายความเป็นส่วนตัว ------- */
function PrivacyDialog({ open, onClose, onAccept }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 6 }}>
        นโยบายความเป็นส่วนตัว
        <IconButton
          onClick={onClose}
          aria-label="close"
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        {/* --- เนื้อหาตัวอย่าง ปรับแก้ได้ตามจริง --- */}
        <Typography paragraph>
          เราให้ความสำคัญกับข้อมูลส่วนบุคคลของคุณ ข้อมูลที่คุณให้ผ่านฟอร์มการติดต่อจะถูกใช้เพื่อ
          ติดต่อกลับ จัดทำใบเสนอราคา จัดนัดหมาย และนำไปปรับปรุงคุณภาพงานบริการของเรา
          โดยจะไม่เปิดเผยต่อบุคคลที่สาม เว้นแต่จำเป็นต่อการให้บริการหรือเป็นไปตามกฎหมาย
        </Typography>
        <Typography paragraph>
          ประเภทข้อมูลที่เก็บ ได้แก่ ชื่อ–นามสกุล อีเมล เบอร์โทร ข้อมูลโครงการ (งบประมาณ พื้นที่
          สถานที่ก่อสร้าง) และรายละเอียดเพิ่มเติม
        </Typography>
        <Typography paragraph>
          คุณสามารถขอเข้าถึง/แก้ไข/ลบข้อมูล หรือเพิกถอนความยินยอมได้
          โดยติดต่อช่องทางที่ระบุไว้ในเว็บไซต์ของเรา
        </Typography>
        <Typography paragraph>
          การกดยอมรับนโยบายนี้ถือเป็นการอนุญาตให้เราเก็บและใช้ข้อมูลตามวัตถุประสงค์ที่ระบุ
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>ปิด</Button>
        <Button
          variant="contained"
          onClick={onAccept}
          sx={{ bgcolor: '#ab9685', '&:hover': { bgcolor: '#9a8574' } }}
        >
          ยอมรับและปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
}
