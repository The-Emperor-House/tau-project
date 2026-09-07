// รัน prisma migrate deploy พร้อม retry ทนกว่าเดิม — MySQL บน Railway อาจ sleep
// อยู่ตอน deploy เริ่ม ต้องรอให้ตื่นก่อน (อาจใช้เวลาเป็นนาที) ไม่ใช่แค่ไม่กี่วินาที
const { execSync } = require('child_process');

const MAX_ATTEMPTS = 15;
const DELAY_SECONDS = 10;

function sleep(seconds) {
  execSync(process.platform === 'win32' ? `timeout /t ${seconds}` : `sleep ${seconds}`, { stdio: 'ignore' });
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    execSync('prisma migrate deploy', { stdio: 'inherit' });
    process.exit(0);
  } catch (err) {
    if (attempt === MAX_ATTEMPTS) {
      console.error(`❌ migrate deploy failed after ${MAX_ATTEMPTS} attempts`);
      throw err;
    }
    console.log(`DB not ready (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${DELAY_SECONDS}s...`);
    sleep(DELAY_SECONDS);
  }
}
