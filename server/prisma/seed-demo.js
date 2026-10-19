// ข้อมูลตัวอย่างจำนวนมากสำหรับดูหน้าตาเว็บตอน dev — ใช้รูปใน client/public (ไม่อัปโหลดขึ้น Cloudinary)
//   npm run seed:demo           เพิ่มข้อมูลตัวอย่าง (ลบชุดเก่าก่อนเสมอ)
//   npm run seed:demo -- --reset ลบข้อมูลตัวอย่างอย่างเดียว
// ข้อมูลตัวอย่างแยกจากข้อมูลจริงด้วย coverUrl ที่เป็น path ในเว็บ ("/...") — ข้อมูลจริงเป็น URL ของ Cloudinary เสมอ
require('dotenv').config({ quiet: true });
const { PrismaClient } = require('@prisma/client');

const dbHost = new URL(process.env.DATABASE_URL).hostname;
if (!['localhost', '127.0.0.1'].includes(dbHost)) {
  console.error(`❌ seed-demo ใช้ได้กับ DB ในเครื่องเท่านั้น (DATABASE_URL ชี้ไปที่ ${dbHost})`);
  process.exit(1);
}

const prisma = new PrismaClient();

const IMAGES = [
  '/home/swiper/01.webp',
  '/home/swiper/02.webp',
  '/home/swiper/03.webp',
  '/home/swiper/04.webp',
  '/home/swiper/05.webp',
  '/home/swiper/06.webp',
  '/design/architectural-cover.webp',
  '/design/interior-cover.webp',
  '/home/projects/rebuild.webp',
  '/home/projects/renovate.webp',
  '/home/projects/redesign.webp',
  '/about-us/banner.webp',
  '/privacy-policy/banner.webp',
];

const DEMO = { coverUrl: { startsWith: '/' } };

// เลือกรูปแบบวนให้แต่ละรายการได้รูปไม่ซ้ำกันมาก
const pick = (i, n) => Array.from({ length: n }, (_, k) => IMAGES[(i * 5 + k * 3) % IMAGES.length]);
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

const PLACES = ['ซ.ลาซาล', 'อ.ชะอำ', 'ม.ปัญญาอินทรา', 'ซ.พรีเมียร์', 'เขาใหญ่', 'บางนา-ตราด กม.10', 'ราชพฤกษ์', 'สุขุมวิท 49', 'พหลโยธิน 24', 'รามอินทรา', 'นนทบุรี', 'หัวหิน'];
const STYLES = ['โมเดิร์นลักซัวรี่', 'คลาสสิกฝรั่งเศส', 'มินิมอลญี่ปุ่น', 'ทรอปิคอลโมเดิร์น', 'นีโอคลาสสิก', 'คอนเทมโพรารี'];

async function reset() {
  const [di, pi, fi, ni] = await Promise.all([
    prisma.design.findMany({ where: DEMO, select: { id: true } }),
    prisma.project.findMany({ where: DEMO, select: { id: true } }),
    prisma.furniture.findMany({ where: DEMO, select: { id: true } }),
    prisma.news.findMany({ where: DEMO, select: { id: true } }),
  ]);
  const ids = (rows) => ({ in: rows.map((r) => r.id) });
  await prisma.$transaction([
    prisma.designImage.deleteMany({ where: { designId: ids(di) } }),
    prisma.design.deleteMany({ where: { id: ids(di) } }),
    prisma.projectImage.deleteMany({ where: { projectId: ids(pi) } }),
    prisma.project.deleteMany({ where: { id: ids(pi) } }),
    prisma.furnitureImage.deleteMany({ where: { furnitureId: ids(fi) } }),
    prisma.furniture.deleteMany({ where: { id: ids(fi) } }),
    prisma.newsImage.deleteMany({ where: { newsId: ids(ni) } }),
    prisma.news.deleteMany({ where: { id: ids(ni) } }),
  ]);
  console.log(`🧹 ลบข้อมูลตัวอย่าง: design ${di.length}, project ${pi.length}, furniture ${fi.length}, news ${ni.length}`);
}

async function seedDesigns() {
  let i = 0;
  for (const type of ['ARCHITECTURAL', 'INTERIOR']) {
    for (let k = 0; k < 14; k++, i++) {
      const [cover, ...images] = pick(i, 2 + (i % 9));
      const name = type === 'ARCHITECTURAL'
        ? `บ้านพักอาศัย 2 ชั้น ${PLACES[i % PLACES.length]}`
        : (k % 4 === 0 ? `คอนโดมิเนียม ${PLACES[i % PLACES.length]} ห้องชุดขนาด 2 ห้องนอน สไตล์${STYLES[i % STYLES.length]}` : `Private Residence ${PLACES[i % PLACES.length]}`);
      await prisma.design.create({
        data: { name, type, coverUrl: cover, createdAt: daysAgo(i * 3), images: { create: images.map((imageUrl) => ({ imageUrl })) } },
      });
    }
  }
  return i;
}

async function seedProjects() {
  let i = 0;
  for (const type of ['REBUILD', 'RENOVATE', 'REDESIGN']) {
    for (let k = 0; k < 13; k++, i++) {
      const [cover, ...images] = pick(i + 7, 3 + (i % 10));
      const details = [
        `งานตกแต่งภายในบ้านพักอาศัย ${2 + (i % 2)} ชั้น สไตล์${STYLES[i % STYLES.length]}`,
        k % 3 === 0 ? 'เน้นวัสดุธรรมชาติ ไม้จริง และหินอ่อน ผสมงานสแตนเลสสีทอง\nห้องนอนตกแต่งตามความชอบของสมาชิกในบ้าน' : '',
        `Status: ${k % 2 ? 'Completed 2025' : 'In progress'}`,
      ].filter(Boolean).join('\n');
      await prisma.project.create({
        data: {
          name: `Private Residence ${PLACES[(i + 3) % PLACES.length]}`,
          type,
          details,
          areaSize: k % 5 === 4 ? null : 180 + ((i * 47) % 520),
          coverUrl: cover,
          createdAt: daysAgo(i * 2),
          images: { create: images.map((imageUrl) => ({ imageUrl })) },
        },
      });
    }
  }
  return i;
}

async function seedFurniture() {
  const kinds = [
    ['คอนโซล', 'LOOSE', [120, 45, 82]],
    ['ตู้ลิ้นชัก', 'LOOSE', [76, 44, 118]],
    ['โต๊ะหัวเตียง', 'LOOSE', [62, 49, 62]],
    ['ตู้เสื้อผ้าบิวท์อิน', 'BUILT_IN', [240, 60, 260]],
    ['ชั้นวางทีวีบิวท์อิน', 'BUILT_IN', [300, 45, 220]],
    ['ภาพเขียนสีน้ำมัน', 'CUSTOM', [120, 0, 90]],
    ['โต๊ะทานอาหารสั่งทำ', 'CUSTOM', [220, 100, 75]],
    ['เคาน์เตอร์บาร์', 'BUILT_IN', [180, 60, 105]],
  ];
  let i = 0;
  for (let round = 0; round < 3; round++) {
    for (const [kind, type, [w, d, h]] of kinds) {
      const [cover, ...images] = pick(i + 3, 1 + (i % 6));
      await prisma.furniture.create({
        data: {
          name: `${kind}${round ? ` รุ่น ${['CDM', 'ADM', 'CNT', 'HFP'][i % 4]}${30 + i}` : ` สี${['ขาวมุก', 'ไม้วอลนัท', 'ดำด้าน'][i % 3]}`}`,
          type,
          details: i % 4 === 3 ? null : `${kind}ผิว${['ขาวมุก', 'ไม้โอ๊คเข้ม', 'หนังแท้'][i % 3]} ท็อปสีดำผิวเงาไฮกลอส มือจับลิ้นชักเซาะร่องปิดแผ่นทอง${i % 2 ? ' ขาสีดำแต่งครอบปลายขาสแตนเลสสีทอง' : ''}`,
          price: i % 3 === 2 ? null : 8900 + ((i * 3700) % 86000),
          width: w + round * 10,
          depth: d,
          height: h,
          coverUrl: cover,
          createdAt: daysAgo(i),
          images: { create: images.map((imageUrl) => ({ imageUrl })) },
        },
      });
      i++;
    }
  }
  return i;
}

async function seedNews() {
  const events = ['MEGA BANGNA', 'Central Park Bangkok', 'IMPACT เมืองทองธานี', 'Baan Lae Suan Fair', 'Architect Expo', 'Siam Paragon'];
  for (let i = 0; i < 14; i++) {
    const [cover, ...images] = pick(i + 1, 1 + (i % 8));
    const isEvent = i % 3 !== 2;
    await prisma.news.create({
      data: {
        heading1: isEvent ? `EVENT : ${events[i % events.length]}` : 'ขอขอบพระคุณลูกค้าทุกท่านจากใจ : บทความ',
        heading2: i % 5 === 4
          ? `TAURUS WE RENEW กับงานแสดงสินค้าและบริการด้านการรีโนเวทบ้านครั้งที่ ${i + 1} ที่ ${events[i % events.length]} พร้อมโปรโมชั่นพิเศษ`
          : `TAURUS WE RENEW @ ${events[i % events.length]} ครั้งที่ ${i + 1}`,
        body: `ขอขอบพระคุณสำหรับทุกการพูดคุย ทุกคำถาม และทุกความสนใจที่มีต่อผลงานของเรา\nการตอบรับที่ดีจากทุกท่านถือเป็นกำลังใจสำคัญ และเป็นแรงผลักดันให้เรามุ่งมั่นสร้างสรรค์ผลงานที่ตอบโจทย์ทั้งฟังก์ชัน ความสวยงาม และไลฟ์สไตล์ของผู้อยู่อาศัย${i % 2 ? '\n\nTAURUS : WE RENEW\nบริการปรับโฉมบ้านพักอาศัยอย่างมีรสนิยม ด้วยประสบการณ์มากกว่า 30 ปี\nติดต่อ ฝ่ายขาย (Sales) : 088-810-1088' : ''}`,
        coverUrl: cover,
        isFeatured: i === 0,
        createdAt: daysAgo(i * 9),
        images: { create: images.map((imageUrl) => ({ imageUrl })) },
      },
    });
  }
  return 14;
}

async function main() {
  await reset();
  if (process.argv.includes('--reset')) return;

  const counts = {
    design: await seedDesigns(),
    project: await seedProjects(),
    furniture: await seedFurniture(),
    news: await seedNews(),
  };
  console.log('✅ เพิ่มข้อมูลตัวอย่าง:', counts);
}

main()
  .catch((err) => {
    console.error('❌ seed-demo error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
