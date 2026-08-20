// app/page.tsx (enhanced UI with Hero Canvas, Personal Summary, Weight Ring, Perceptual Delay)
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShopSections from "./components/ShopSections";

/** ---------- Dictionaries (พื้นฐานเดิม) ---------- */
const dayColors: Record<number, string> = {
  0: "#D72638", // Sun
  1: "#F5D547", // Mon
  2: "#FF7EB9", // Tue
  3: "#2FBF71", // Wed
  4: "#FFA62B", // Thu
  5: "#1F75FE", // Fri
  6: "#7E57C2", // Sat
};

const dayMapThai = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];

const westernZodiacToElement: Record<string, "fire"|"earth"|"air"|"water"> = {
  aries:"fire", taurus:"earth", gemini:"air", cancer:"water",
  leo:"fire", virgo:"earth", libra:"air", scorpio:"water",
  sagittarius:"fire", capricorn:"earth", aquarius:"air", pisces:"water",
};
const zodiacThai: Record<string,string> = {
  aries:"เมษ", taurus:"พฤษภ", gemini:"เมถุน", cancer:"กรกฎ",
  leo:"สิงห์", virgo:"กันย์", libra:"ตุล", scorpio:"พิจิก",
  sagittarius:"ธนู", capricorn:"มกร", aquarius:"กุมภ์", pisces:"มีน",
};
const elementThai: Record<"fire"|"earth"|"air"|"water",string> = {
  fire:"ไฟ", earth:"ดิน", air:"ลม", water:"น้ำ"
};
const elementAccents: Record<string,string> = {
  fire:"#FF8F70", earth:"#C7A17A", air:"#8ED1C8", water:"#4BB2FF",
};

const chineseElementAccents: Record<"Wood"|"Fire"|"Earth"|"Metal"|"Water", string> = {
  Wood:"#6BCB77", Fire:"#FF8F70", Earth:"#C7A17A", Metal:"#A8B3C2", Water:"#4BB2FF",
};
const chineseZodiacIcons: Record<string,string> = {
  Rat:"🐀", Ox:"🐂", Tiger:"🐅", Rabbit:"🐇", Dragon:"🐉", Snake:"🐍",
  Horse:"🐎", Goat:"🐐", Monkey:"🐒", Rooster:"🐓", Dog:"🐕", Pig:"🐖"
};
const chineseZodiacThai: Record<string,string> = {
  Rat:"ชวด", Ox:"ฉลู", Tiger:"ขาล", Rabbit:"เถาะ", Dragon:"มะโรง", Snake:"มะเส็ง",
  Horse:"มะเมีย", Goat:"มะแม", Monkey:"วอก", Rooster:"ระกา", Dog:"จอ", Pig:"กุน"
};
const chineseElementThai: Record<"Wood"|"Fire"|"Earth"|"Metal"|"Water",string> = {
  Wood:"ไม้", Fire:"ไฟ", Earth:"ดิน", Metal:"ทอง", Water:"น้ำ"
};

const monthAccents: Record<number,string> = {
  1:"#9B5DE5", 2:"#4BB2FF", 3:"#91C9B7", 4:"#E5E5E5", 5:"#6BCB77", 6:"#E8DCCB",
  7:"#1F75FE", 8:"#FF8F70", 9:"#2E86DE", 10:"#D72638", 11:"#C7A17A", 12:"#B79EE8",
};

const topicStyles: Record<string, { icon:string; overlay:string; desc:string; th:string }> = {
  career:{ icon:"★", overlay:"#203A82", desc:"ลายเส้นเฉียง/ทรงเรขาคณิต เสริมโฟกัสและความเด็ดขาด", th:"การงาน" },
  money: { icon:"฿", overlay:"#1C7C54", desc:"จุดวิบวับทอง เสริมโชคลาภ ความมั่นคง", th:"การเงิน" },
  love:  { icon:"♥", overlay:"#D7427D", desc:"ไล่เฉดโรแมนติก โทนโรสพิงก์", th:"ความรัก" }
};

/** ---------- สีกาลกิณี (สีที่ควรหลีกเลี่ยงตามวันเกิด) ---------- */
const kalaAvoidByWeekday: Record<number, string[]> = {
  0: ["น้ำเงิน", "กรมท่า"],              // อาทิตย์
  1: ["แดง", "ส้ม"],                     // จันทร์
  2: ["ขาว", "ครีม"],                    // อังคาร
  3: ["ชมพู", "แดง"],                    // พุธกลางวัน
  4: ["ม่วง", "ดำ"],                     // พฤหัสบดี
  5: ["เทา", "ดำทึม"],                   // ศุกร์
  6: ["เขียว"],                          // เสาร์ (พบต่างสำนัก เลือกเขียวเป็นหลัก)
};
const nearBySuggestions: Record<string,string> = {
  "แดง":"โรสพิงก์","แดงสด":"โรสพิงก์","ดำ":"กรมท่า","เทา":"เทาอมฟ้า",
  "น้ำเงิน":"ฟ้าอมเทา","ฟ้าอ่อน":"ฟ้าพาสตेल","ขาว":"ไอวอรี","ครีม":"นู้ดพีช",
  "ชมพู":"กุหลาบนม","แดงเข้ม":"บอร์กันดีหม่น","ม่วงแดง":"พลัมอ่อน",
  "ม่วงเข้ม":"ลาเวนเดอร์หม่น","ส้ม":"คอรัล","เหลืองอ่อน":"ครีมเวนิลา"
};
/** ---------- สีมงคลตามวันเกิด (หลายเฉด) ---------- */
const auspiciousByWeekday: Record<number, { name: string; hex: string }[]> = {
  0: [ // อาทิตย์
    { name: "ส้ม", hex: "#FFA62B" },
    { name: "แดง", hex: "#D72638" },
    { name: "ชมพู", hex: "#FF7EB9" },
    { name: "เขียวแก่", hex: "#2E7D32" },
  ],
  1: [ // จันทร์
    { name: "เขียว", hex: "#2FBF71" },
    { name: "ครีม", hex: "#F5E6C8" },
    { name: "น้ำตาล", hex: "#8B5E3C" },
  ],
  2: [ // อังคาร
    { name: "ดำ", hex: "#222222" },
    { name: "เหลือง", hex: "#F5D547" },
    { name: "ชมพู", hex: "#FF7EB9" },
    { name: "ม่วง", hex: "#7E57C2" },
    { name: "แดง", hex: "#D72638" },
  ],
  3: [ // พุธ (กลางวัน)
    { name: "เขียว", hex: "#2FBF71" },
    { name: "เหลือง", hex: "#FFA62B" },
  ],
  4: [ // พฤหัสบดี
    { name: "ส้ม", hex: "#FFA62B" },
    { name: "เหลือง", hex: "#F5D547" },
  ],
  5: [ // ศุกร์
    { name: "ฟ้า", hex: "#4BB2FF" },
    { name: "น้ำเงิน", hex: "#1F75FE" },
    { name: "ขาว", hex: "#F6F9FF" },
    { name: "ชมพู", hex: "#FF7EB9" },
  ],
  6: [ // เสาร์
    { name: "แดง", hex: "#D72638" },
    { name: "เหลือง", hex: "#F5D547" },
    { name: "ฟ้า", hex: "#4BB2FF" },
    { name: "น้ำเงิน", hex: "#1F75FE" },
    { name: "ชมพู", hex: "#FF7EB9" },
    { name: "น้ำตาล", hex: "#8B5E3C" },
  ],
};

/** ---------- Utils ---------- */
function hexToRgb(h:string){ const m=h.replace("#",""); return [parseInt(m.slice(0,2),16),parseInt(m.slice(2,4),16),parseInt(m.slice(4,6),16)] as [number,number,number]; }
function rgbToHex([r,g,b]:[number,number,number]){ return "#"+[r,g,b].map(x=>Math.round(x).toString(16).padStart(2,"0")).join(""); }
function mix(a:string,b:string,ratio=0.5){ const A=hexToRgb(a), B=hexToRgb(b); return rgbToHex([0,1,2].map(i=>A[i]*(1-ratio)+B[i]*ratio) as [number,number,number]); }
function mixWeighted(pairs:{hex:string; weight:number}[]){ let r=0,g=0,b=0,w=0; for(const p of pairs){ if(p.weight<=0) continue; const [rr,gg,bb]=hexToRgb(p.hex); r+=rr*p.weight; g+=gg*p.weight; b+=bb*p.weight; w+=p.weight; } if(w===0) return "#CCCCCC"; return rgbToHex([r/w,g/w,b/w] as [number,number,number]); }
function dayOfWeekFromDateStr(str:string){ if(!str) return 1; const d=new Date(`${str}T12:00:00`); return d.getDay(); }
function monthFromDateStr(str:string){ if(!str) return 1; const d=new Date(`${str}T12:00:00`); return d.getMonth()+1; }
function getWesternZodiac(dateStr:string){
  if(!dateStr) return { sign:"capricorn", label:"มกร" };
  const d=new Date(`${dateStr}T12:00:00`); const m=d.getMonth()+1, day=d.getDate();
  const ranges = [
    {sign:"capricorn", label:"มกร", from:[12,22], to:[1,19]},
    {sign:"aquarius",  label:"กุมภ์", from:[1,20],  to:[2,18]},
    {sign:"pisces",    label:"มีน",  from:[2,19],  to:[3,20]},
    {sign:"aries",     label:"เมษ",  from:[3,21],  to:[4,19]},
    {sign:"taurus",    label:"พฤษภ", from:[4,20],  to:[5,20]},
    {sign:"gemini",    label:"เมถุน", from:[5,21],  to:[6,20]},
    {sign:"cancer",    label:"กรกฎ", from:[6,21],  to:[7,22]},
    {sign:"leo",       label:"สิงห์", from:[7,23],  to:[8,22]},
    {sign:"virgo",     label:"กันย์", from:[8,23],  to:[9,22]},
    {sign:"libra",     label:"ตุล",   from:[9,23],  to:[10,22]},
    {sign:"scorpio",   label:"พิจิก", from:[10,23], to:[11,21]},
    {sign:"sagittarius",label:"ธนู",  from:[11,22], to:[12,21]},
  ];
  for(const r of ranges){
    const [fm,fd]=r.from, [tm,td]=r.to;
    if(fm<=tm){
      if((m>fm || (m===fm && day>=fd)) && (m<tm || (m===tm && day<=td))) return r;
    }else{
      if((m>fm || (m===fm && day>=fd)) || (m<tm || (m===tm && day<=td))) return r;
    }
  }
  return ranges[0];
}
function getChineseZodiacAndElement(dateStr:string){
  if(!dateStr) return { animal:"Rat", element:"Wood", display:"ชวด (ไม้)" };
  const d=new Date(`${dateStr}T12:00:00`);
  let year=d.getFullYear(), m=d.getMonth()+1, day=d.getDate();
  if(m===1 || (m===2 && day<4)) year -= 1; // approx pre-CNY shift
  const animals = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
  const idx = ((year - 2008) % 12 + 12) % 12; // 2008=Rat
  const animal = animals[idx];
  const stemsToElement = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"] as const;
  const eIdx = ((year - 1984) % 10 + 10) % 10;
  const element = stemsToElement[eIdx];
  const display = `${chineseZodiacThai[animal]} (${chineseElementThai[element]})`;
  return { animal, element, display };
}

/** ---------- Glitter (sparkle) helpers ---------- */
type GlitterLevel = 'none'|'light'|'medium'|'bold';
type GlitterStyle = 'gradient'|'french'|'galaxy'|'symbol'|'constellation'|'dust'|'zodiac';
const zodiacGlyph: Record<string,string> = {
  aries:"♈", taurus:"♉", gemini:"♊", cancer:"♋",
  leo:"♌", virgo:"♍", libra:"♎", scorpio:"♏",
  sagittarius:"♐", capricorn:"♑", aquarius:"♒", pisces:"♓",
};
const zodiacMeaningTH: Record<string,string> = {
  aries:"ความกล้า ริเริ่ม นำทีม",
  taurus:"ความมั่นคง อดทน มีวินัย",
  gemini:"การสื่อสาร คล่องแคล่ว สองจังหวะ",
  cancer:"การดูแล เอาใจใส่ บ้าน/ครอบครัว",
  leo:"ตัวตน ความภาคภูมิใจ ความโดดเด่น",
  virgo:"ละเอียด เนี้ยบ เป็นระบบ",
  libra:"สมดุล ความร่วมมือ สุนทรียะ",
  scorpio:"ลึกซึ้ง มุ่งมั่น เสน่ห์ลึกลับ",
  sagittarius:"การเดินทาง การเติบโต วิสัยทัศน์",
  capricorn:"เป้าหมาย ระเบียบ ระยะยาว",
  aquarius:"ไอเดียใหม่ เสรีภาพ เครือข่าย",
  pisces:"สุนทรีย์ ความฝัน เมตตา",
};

function buildGlitterOverlay(level: GlitterLevel, style: GlitterStyle, elementHint?: ZEl|CEl, breathing?: boolean){
  if(level==='none') return { base: undefined as React.CSSProperties|undefined, shimmer: undefined as React.CSSProperties|undefined };
  const alpha = level==='light' ? 0.22 : level==='medium' ? 0.34 : 0.46;
  let background = '';
  if(style==='gradient'){
    background =
      `radial-gradient(10px 10px at 20% 75%, rgba(255,255,255,${alpha}), transparent 60%),
       radial-gradient(8px 8px at 65% 65%, rgba(255,215,180,${alpha}), transparent 60%),
       radial-gradient(6px 6px at 40% 85%, rgba(255,255,255,${alpha}), transparent 50%)`;
  } else if(style==='french'){
    background = `linear-gradient(to top, rgba(255,255,255,${alpha}) 0 18%, transparent 18%)`;
  } else if(style==='galaxy'){
    background =
      `radial-gradient(6px 6px at 20% 30%, rgba(255,255,255,${alpha}), transparent 60%),
       radial-gradient(4px 4px at 60% 20%, rgba(255,215,180,${alpha}), transparent 60%),
       radial-gradient(3px 3px at 80% 60%, rgba(255,255,255,${alpha}), transparent 60%),
       radial-gradient(5px 5px at 35% 70%, rgba(255,215,180,${alpha}), transparent 60%)`;
  } else if(style==='dust'){
    // Elemental Dust: choose particle color by element hint (western or chinese)
    const el = (elementHint as string)||'fire';
    let rgb = '255,215,150';   // fire: warm gold
    if(el==='water' || el==='Water') rgb = '180,220,255';
    if(el==='air')                rgb = '255,255,255';
    if(el==='earth' || el==='Earth') rgb = '214,167,93';
    // random-like sprinkled dots (deterministic layout)
    background = `
      radial-gradient(3px 3px at 18% 24%, rgba(${rgb},${alpha}), transparent 60%),
      radial-gradient(2px 2px at 42% 18%, rgba(${rgb},${alpha*.9}), transparent 60%),
      radial-gradient(4px 4px at 68% 36%, rgba(${rgb},${alpha}), transparent 62%),
      radial-gradient(2px 2px at 28% 66%, rgba(${rgb},${alpha*.85}), transparent 60%),
      radial-gradient(3px 3px at 75% 72%, rgba(${rgb},${alpha}), transparent 62%)`;
  } else {
    background = '';
  }
  const base: React.CSSProperties|undefined = background
    ? { backgroundImage: background, mixBlendMode: 'screen', pointerEvents: 'none' }
    : undefined;
  // Breathing shimmer: conditional softer opacity if breathing true (animation handled in renderNails)
  const shimmer: React.CSSProperties = {
    backgroundImage: 'linear-gradient(120deg, transparent 45%, rgba(255,255,255,.28) 50%, transparent 55%)',
    backgroundSize: '200% 100%',
    mixBlendMode: 'screen',
    filter: 'saturate(1.1)',
    pointerEvents: 'none'
  };
  return { base, shimmer };
}

/** ---------- Color Tone & Reasons helpers (TH) ---------- */
type ZEl = "fire"|"earth"|"air"|"water";
type Topic = "career"|"money"|"love";
type CEl = "Wood"|"Fire"|"Earth"|"Metal"|"Water";

function getToneName(zEl: ZEl, topic: Topic): string {
  const map: Record<ZEl, Record<Topic,string>> = {
    fire: {
      career: "แดง-ส้มประกายทอง (มั่นใจ-นำทีม)",
      money:  "แดงเบอร์รี–ทองกุหลาบ (เชิงรุก-ชัดเจน)",
      love:   "ส้มคอรัล–โรสโกลด์ (อบอุ่น-น่าดึงดูด)"
    },
    air: {
      career: "ฟ้าอมเขียว–เงินนวล (โปร่ง-คิดไว)",
      money:  "ลาเวนเดอร์–เงิน (รอบคอบ-น่าเชื่อถือ)",
      love:   "ม่วงลาเวนเดอร์–ชมพูนม (อ่อนโยน-เข้าถึงง่าย)"
    },
    water: {
      career: "ฟ้า–เทามุก (นิ่ง-โฟกัสดี)",
      money:  "น้ำเงินกรมท่า–เงิน (น่าเชื่อใจ-มืออาชีพ)",
      love:   "ฟ้าน้ำทะเล–มุก (สบายใจ-ละมุน)"
    },
    earth: {
      career: "นู้ด–น้ำตาลทอง (สุขุม-ไว้ใจได้)",
      money:  "เขียวหยก–ทองอุ่น (เรียกทรัพย์-มั่นคง)",
      love:   "นู้ดพีช–ทองชมพู (อบอุ่น-สุภาพ)"
    }
  };
  return map[zEl][topic];
}
const topicToneHex: Record<ZEl, Record<Topic, { base: string; accent: string }>> = {
  fire: {
    career: { base: "#FF8F70", accent: "#D6A75D" }, // คอรัล–ทอง
    money:  { base: "#B85C5A", accent: "#C7A17A" }, // เบอร์รี–ทองอุ่น
    love:   { base: "#FF7EB9", accent: "#D4A190" }, // คอรัลชมพู–โรสโกลด์
  },
  air: {
    career: { base: "#8ED1C8", accent: "#C0C7CF" }, // ฟ้าอมเขียว–เงินนวล
    money:  { base: "#B79EE8", accent: "#C0C7CF" }, // ลาเวนเดอร์–เงิน
    love:   { base: "#C8A2C8", accent: "#FFB3C7" }, // ม่วงพาสเทล–ชมพูอ่อน
  },
  water: {
    career: { base: "#6FAED9", accent: "#C0C7CF" }, // ฟ้า–เทามุก
    money:  { base: "#2E86DE", accent: "#A8B3C2" }, // กรมท่า–เงิน
    love:   { base: "#7EC8E3", accent: "#E6EAF2" }, // น้ำทะเล–มุกใส
  },
  earth: {
    career: { base: "#C7A17A", accent: "#E5C29F" }, // นู้ด–น้ำตาลทอง
    money:  { base: "#6BCB77", accent: "#D6A75D" }, // เขียวหยก–ทองอุ่น
    love:   { base: "#F2C6B4", accent: "#E6A6B2" }, // นู้ดพีช–โรสโกลด์
  },
};

// Explicit map for tone names (base/accent labels, no split needed)
const topicToneNameMap: Record<ZEl, Record<Topic, { baseName: string; accentName: string }>> = {
  fire: {
    career: { baseName: "แดง-ส้ม", accentName: "ประกายทอง" },
    money:  { baseName: "แดงเบอร์รี", accentName: "ทองกุหลาบ" },
    love:   { baseName: "ส้มคอรัล", accentName: "โรสโกลด์" },
  },
  air: {
    career: { baseName: "ฟ้าอมเขียว", accentName: "เงินนวล" },
    money:  { baseName: "ลาเวนเดอร์", accentName: "เงิน" },
    love:   { baseName: "ม่วงลาเวนเดอร์", accentName: "ชมพูนม" },
  },
  water: {
    career: { baseName: "ฟ้า", accentName: "เทามุก" },
    money:  { baseName: "น้ำเงินกรมท่า", accentName: "เงิน" },
    love:   { baseName: "ฟ้าน้ำทะเล", accentName: "มุก" },
  },
  earth: {
    career: { baseName: "นู้ด", accentName: "น้ำตาลทอง" },
    money:  { baseName: "เขียวหยก", accentName: "ทองอุ่น" },
    love:   { baseName: "นู้ดพีช", accentName: "ทองชมพู" },
  },
};

function buildColorReasonTH(opts: {
  weekdayTH: string;
  zEl: ZEl;
  cEl: CEl;
  topic: Topic;
  toneName: string;
  baseHex: string;   // สีฐานจริงของโทน
  accentHex: string; // สีเสริม
  avoidList?: string[];
}): string {
  const topicLine: Record<Topic,string> = {
    career: "ช่วยจัดโฟกัส การสื่อสาร และภาพลักษณ์มืออาชีพให้ชัดขึ้น",
    money:  "เพิ่มความน่าเชื่อถือ ดูมั่นคง และดึงดูดโอกาส/ดีลใหม่",
    love:   "เสริมความอบอุ่น น่าดึงดูด และบรรยากาศที่เข้าหาได้ง่าย"
  };

  // ความเชื่อไทย/คติจีน/จิตวิทยาสี — เนื้อหาแบบย่อเพื่อใช้ใน UI
  const beliefThaiByTopic: Record<Topic,string> = {
    career: "สีโทนอุ่น (แดง–ส้ม–ทอง) เชื่อว่าเสริมบารมีและความกล้าในการตัดสินใจ",
    money:  "สีเขียว–ทองนิยมใช้เป็นสีเรียกทรัพย์และความอุดมสมบูรณ์",
    love:   "โทนชมพู–คอรัลสื่อเมตตา เสน่ห์ และความสัมพันธ์ที่นุ่มนวล",
  };
  const beliefChineseByTopic: Record<Topic,string> = {
    career: `ธาตุจีน <b>${chineseElementThai[opts.cEl]}</b> เหมาะกับการเสริมแรงพลังให้ภาพลักษณ์ดูมีอำนาจ (แต้มประกายให้พอดี)`,
    money:  `ตามคติจีน สีหยก/ทองสื่อโชคลาภและการเก็บออม (หากธาตุเป็น <b>${chineseElementThai[opts.cEl]}</b> ให้ใช้ประกายตามธาตุนั้น)`,
    love:   `โทนโรสโกลด์/ชมพูอ่อนใช้ในพิธีมงคล สื่อความรักและความกลมกลืน (สัมพันธ์กับ <b>${chineseElementThai[opts.cEl]}</b>)`,
  };
  const colorPsychByTopic: Record<Topic,string> = {
    career: "แดง–คอรัลให้ความรู้สึกพลัง ความมั่นใจ และการนำทีม",
    money:  "เขียวทำให้รู้สึกมั่นคง เป็นธรรมชาติ และเกี่ยวโยงการเติบโต",
    love:   "ชมพู–คอรัลกระตุ้นความอบอุ่น น่ารัก และความเป็นมิตร",
  };

  const zElTH: Record<ZEl,string> = { fire:"ไฟ", earth:"ดิน", air:"ลม", water:"น้ำ" };
  const lines: string[] = [];

  // บรรทัดหลัก: ชื่อโทน + เหตุผลรวมจากวันเกิด/ราศี/หัวข้อ
  lines.push(`โทนที่แนะนำ: <b>${opts.toneName}</b>`);
  lines.push(`เพราะพลังของคนเกิดวัน${opts.weekdayTH} ผสานราศีธาตุ${zElTH[opts.zEl]} ทำให้เฉดนี้สื่อสารบุคลิกเด่นได้ดี — ${topicLine[opts.topic]}.`);

  // เพิ่มชั้นความเชื่อ
  lines.push(`ตามความเชื่อไทย: ${beliefThaiByTopic[opts.topic]}.`);
  lines.push(`ตามคติจีน: ${beliefChineseByTopic[opts.topic]}.`);
  lines.push(`จิตวิทยาสี: ${colorPsychByTopic[opts.topic]}.`);

  // เคล็ดลับตามธาตุจีน (ย้ายจากบรรทัดเดียวให้คงไว้เป็นไกด์)
  const cElHint: Record<CEl,string> = {
    Metal: "แนะนำแต้มประกายเงิน/โครเมียมเล็กน้อยให้ดูคมแต่ไม่แข็ง",
    Water: "เติมผิวมุกหรือชั้นใสบาง ๆ ให้ดูเย็นสบายตา",
    Wood:  "ผสมเขียวหยกเส้นบาง ๆ จะดูมีชีวิตชีวา",
    Fire:  "เพิ่มกลิตเตอร์ทองละเอียดเล็กน้อยให้พลังบวก",
    Earth: "ลดความอิ่มสีลงครึ่งสเต็ป ให้โทนดูสุภาพและแพง",
  };
  lines.push(`${cElHint[opts.cEl]}.`);

  // สีที่ควรหลีกเลี่ยง (กาลกิณี)
  if (opts.avoidList && opts.avoidList.length) {
    const av = opts.avoidList.slice(0,2).join(" / ");
    lines.push(`วันนี้ควรเลี่ยงเฉด <b>${av}</b> เล็กน้อย แล้วเบี่ยงเป็นโทนใกล้เคียงจะดูลงตัวกว่า.`);
  }

  return lines.join(" ");
}

function buildAccentReasonTH(opts: { topic: Topic; accentHex: string; accentName: string }): string {
  const topicVerb: Record<Topic,string> = {
    career: "เน้นความมั่นใจและจุดโฟกัสในการสื่อสาร/พรีเซนต์",
    money:  "ดึงสายตาให้ดูมั่นคง มีวินัย และน่าเชื่อถือ",
    love:   "เพิ่มออร่าความอบอุ่นและเสน่ห์ที่เข้าถึงง่าย"
  };
  const placeTip: Record<Topic,string> = {
    career: "แนะนำแต้มที่นิ้วชี้ หรือเฟรนช์ไลน์บาง ๆ เพื่อชี้นำสายตา",
    money:  "แต้มที่นิ้วนาง/ก้อย พร้อมฟอยล์ทองหรือกลิตเตอร์ละเอียด",
    love:   "ใช้เป็นลายหัวใจ/ดอทเล็ก ๆ บริเวณปลายนิ้วกลางหรือนิ้วนาง"
  };
  return `สีเสริมที่แนะนำ: <b>${opts.accentName}</b> — ใช้เพื่อ${topicVerb[opts.topic]} โดยคุมโทนให้กลมกลืน เพื่อไม่ให้หนักเกินไป — ${placeTip[opts.topic]}.`;
}

// ----------- Beauty Editorial Copy (TH) -----------
function buildVariationEditorialTH(opts:{
  layers: Record<LayerKey, boolean>;
  weights: Record<LayerKey, number>;
  toneName: string;
  zEl: ZEl;
  topic: Topic;
}){
  const factorTH: Record<LayerKey,string> = {
    day:"วันเกิด",
    zodiac:"ราศี",
    chinese:"นักษัตรจีน",
    month:"เดือนเกิด",
  };
  // คำนวณอันดับ 2 ปัจจัยแรกตามสัดส่วนที่เปิดใช้งาน
  const enabledKeys = (Object.keys(opts.layers) as LayerKey[]).filter(k=> opts.layers[k]);
  const total = enabledKeys.reduce((s,k)=> s + opts.weights[k], 0) || 1;
  const ranked = enabledKeys
    .map(k=> ({ k, pct: Math.round(opts.weights[k]/total*100) }))
    .sort((a,b)=> b.pct - a.pct);
  const main = ranked[0] || { k:'day' as LayerKey, pct:100 };
  const sub  = ranked[1] || { k:'zodiac' as LayerKey, pct:0 };

  // สร้างคำบุคลิกให้สั้นสไตล์นิตยสาร
  const personaByCombo: Partial<Record<`${ZEl}-${Topic}`, string>> = {
    'fire-career': 'ความกล้าและภาวะผู้นำ',
    'fire-money':  'พลังเชิงรุกและความชัดเจน',
    'fire-love':   'ออร่าอุ่นและเสน่ห์ที่ดึงดูด',
    'water-career':'สมาธินิ่งและความน่าเชื่อถือ',
    'water-money': 'ความมั่นคงและความสบายตา',
    'water-love':  'ความละมุนและความอบอุ่น',
    'air-career':  'ความโปร่งคิดไวและความคล่องตัว',
    'air-money':   'ความรอบคอบและความทันสมัย',
    'air-love':    'ความอ่อนโยนและเข้าถึงง่าย',
    'earth-career':'ความสุภาพและมืออาชีพ',
    'earth-money': 'ความมั่นคงและไว้วางใจได้',
    'earth-love':  'ความอบอุ่นสุภาพแบบแพง',
  };
  const persona = personaByCombo[`${opts.zEl}-${opts.topic}`] || 'บุคลิกที่สมดุล';

  const line1 = `พลังสีวันนี้เอนไปทาง <b>${factorTH[main.k]} (${main.pct}%)</b> เสริมด้วย <b>${factorTH[sub.k]} (${sub.pct}%)</b> จนได้โทน <b>${opts.toneName}</b> ที่ถ่ายทอด <b>${persona}</b>`;
  const line2 = `แนะนำ: ซอฟต์ลงด้วย <b>ขาว 15–25%</b>, เติม <b>French line/dot</b> ด้วยสีเสริม และปิดท้ายด้วย <b>ท็อปโค้ตใส</b> เพื่อความแพงพอดี`;
  return `${line1}. ${line2}.`;
}

function buildVariationAdviceTH(opts:{
  layers: Record<LayerKey, boolean>;
  weights: Record<LayerKey, number>;
  zEl: ZEl;
  cEl: CEl;
  month: number;
  baseHex: string;
  accentHex: string;
}){
  // (kept for compatibility; not used in editorial mode)
  const enabled = (Object.keys(opts.layers) as LayerKey[]).filter(k=>opts.layers[k]);
  const total = enabled.reduce((s,k)=> s + opts.weights[k], 0) || 1;
  const rows = enabled.map(k=> ({ k, pct: Math.round(opts.weights[k]/total*100) }));

  const factorTH: Record<LayerKey,string> = {
    day:"พลังสีประจำวันเกิด",
    zodiac:"ราศีประจำตัว",
    chinese:"ปีนักษัตรจีน",
    month:"พลังประจำเดือนเกิด",
  };

  const elShift: Record<ZEl,string> = {
    fire:"อุ่นขึ้น (ออกส้ม/ทอง) มั่นใจและริเริ่ม",
    water:"เย็นขึ้น (ฟ้า/เงิน) สงบ โฟกัสดี",
    air:"โปร่งขึ้น (ขาว/เงิน) เบาสบาย คิดไว",
    earth:"นวลลง (นู้ด/เบจ/ทองนวล) สุภาพไว้ใจได้",
  };
  const cElShift: Record<CEl,string> = {
    Metal:"เพิ่มประกายเงิน คมชัดทันสมัย",
    Water:"โทนเงินฟ้าใส ดูลื่นไหล",
    Wood:"แทรกเขียวหยกบาง ๆ เพิ่มชีวิตชีวา",
    Fire:"แต้มทองอุ่น เสริมพลังบวก",
    Earth:"ลดความอิ่มสีครึ่งสเต็ป ให้ลุคแพงสุภาพ",
  };

  const list = rows.map(r=> `${factorTH[r.k]} ${r.pct}%`).join(" · ");
  const lines: string[] = [];
  lines.push(`การผสมสีวันนี้อิง: ${list}.`);
  lines.push(`ผลรวมเชิงบุคลิก: ธาตุราศีทำให้โทน ${elShift[opts.zEl]}.`);
  if (opts.layers.chinese) lines.push(`แรงเสริมจากธาตุจีน: ${cElShift[opts.cEl]}.`);
  if (opts.layers.month) lines.push(`เดือนเกิดเพิ่มสีรองตามฤดูกาล (เดือน ${opts.month}).`);
  lines.push(`Variations ที่ลองได้: 1) ใช้สีฐานผสมขาว 15–25% สำหรับวันทำงาน 2) ใช้สีเสริมเป็นเฟรนช์ไลน์/ดอทเล็ก ๆ เพื่อดึงสายตา 3) เคลือบชั้นใสเพิ่มเงา หากต้องการลุคสุภาพหรู.`);
  return lines.join(" ");
}

function buildGlitterAdviceTH(opts:{ style: GlitterStyle; zEl: ZEl; zodiacSign: string; dow: number; cEl: CEl; }){
  const zTH = zodiacThai[opts.zodiacSign] || "";
  const dayTH = dayMapThai[opts.dow];
  const elTH: Record<ZEl,string> = { fire:"ไฟ", water:"น้ำ", air:"ลม", earth:"ดิน" };
  const cElTip: Record<CEl,string> = {
    Metal: "ประกายเงิน/โครเมียมให้ความคมชัด ทันสมัย",
    Water: "ประกายเงินฟ้าใส ให้ความสงบ ลื่นไหล",
    Wood:  "ประกายเขียวหยกบาง ๆ เพิ่มชีวิตชีวา",
    Fire:  "ทองอุ่นละเอียด เติมพลังบวก",
    Earth: "ทองนวล เม็ดใหญ่ปนน้อย ให้ลุคสุภาพแพง"
  };
  const luckyCount = [6,2,3,4,5,6,1][opts.dow]; // ตัวอย่างเลขมงคลต่อวัน: อา6 จ2 อ3 พ4 พฤ5 ศ6 ส1

  if(opts.style==='constellation'){
    return `สไตล์ <b>กลุ่มดาว</b> — แนะนำวางที่นิ้วชี้หรือนิ้วกลาง เรียงจุด ✦ เป็นแพทเทิร์นของราศี <b>${zTH}</b> จำนวน ~<b>${luckyCount}</b> จุด เพื่อเก็บนัย “เลขมงคลของคนเกิดวัน${dayTH}”.`;
  }
  if(opts.style==='zodiac'){
    const z = (opts.zodiacSign||'').toLowerCase();
    const glyph = zodiacGlyph[z] || '♈';
    const meaning = zodiacMeaningTH[z] || '';
    return `สไตล์ <b>สัญลักษณ์ราศี</b> — ใช้เครื่องหมาย <b>${glyph}</b> ของราศี <b>${zodiacThai[opts.zodiacSign]||''}</b> เป็นจุดโฟกัสที่นิ้วชี้/นิ้วกลาง เพื่อสื่อ ${meaning} แบบสุภาพ (ขนาดเล็ก สีใกล้เคียงโทนหลักแล้วซ้อนประกายนุ่ม ๆ).`;
  }
  if(opts.style==='dust'){
    const el = elTH[opts.zEl];
    return `สไตล์ <b>ละอองธาตุ</b> — เลือกเม็ดประกายตามธาตุ <b>${el}</b> และธาตุจีน (<b>${chineseElementThai[opts.cEl]}</b>) เช่น ไฟ=ทองอุ่น, น้ำ=เงินฟ้าใส, ลม=เงินขาวบาง, ดิน=ทองนวลเม็ดใหญ่ปนน้อย เพื่อให้ mood & tone สอดคล้องกับพลังธาตุของคุณ.`;
  }
  if(opts.style==='gradient'){
    return `สไตล์ <b>ไล่ประกาย</b> — หนาโคน จางปลาย เพิ่มมิติให้สีพื้นโดยไม่แย่งซีนสีเสริม เหมาะกับทุกโอกาส.`;
  }
  if(opts.style==='french'){
    return `สไตล์ <b>ปลายประกาย (French tip)</b> — เนี้ยบ ดูแพง ใช้กับนิ้วชี้/นิ้วนาง เพื่อชี้นำสายตาในงานพรีเซนต์/ออกเดต.`;
  }
  if(opts.style==='galaxy'){
    return `สไตล์ <b>ดวงดาว (Galaxy)</b> — ประกายกระจายบนพื้นเข้ม ให้ฟีลลึกลับโรแมนติก เหมาะกับโหมดความรักหรือการเงินที่ต้องการ spotlight.`;
  }
  // symbol
  return `สไตล์ <b>สัญลักษณ์</b> — ใช้ ✦/♥/★ เล็ก ๆ เป็นจุดพลังงานบนเล็บนิ้วเป้าหมาย ให้ความหมายตรงกับหัวข้อ.`;
}

/** ---------- Accent Name Resolver (TH) ---------- */
const ACCENT_CATALOG: { hex: string; name: string }[] = [
  // Western zodiac element accents
  { hex: elementAccents.fire,  name: "คอรัลทองชมพู" },
  { hex: elementAccents.earth, name: "น้ำตาลทองอุ่น" },
  { hex: elementAccents.air,   name: "ฟ้าอมเขียวพาสเทล" },
  { hex: elementAccents.water, name: "ฟ้าใสทะเล" },
  // Chinese element accents
  { hex: chineseElementAccents.Wood,  name: "เขียวหยกนุ่ม" },
  { hex: chineseElementAccents.Fire,  name: "ชมพูคอรัลโทนอุ่น" },
  { hex: chineseElementAccents.Earth, name: "น้ำตาลทองซอฟต์" },
  { hex: chineseElementAccents.Metal, name: "เงินนวล" },
  { hex: chineseElementAccents.Water, name: "ฟ้าน้ำทะเล" },
  // Day colors (generic readable names)
  { hex: dayColors[0], name: "แดงพลัง" },
  { hex: dayColors[1], name: "เหลืองมุก" },
  { hex: dayColors[2], name: "ชมพูสดใส" },
  { hex: dayColors[3], name: "เขียวสดชื่น" },
  { hex: dayColors[4], name: "ส้มอำไพ" },
  { hex: dayColors[5], name: "น้ำเงินสด" },
  { hex: dayColors[6], name: "ม่วงลาเวนเดอร์เข้ม" },
  // Month accents (soft names)
  { hex: monthAccents[1],  name: "ม่วงพลัมพาสเทล" },
  { hex: monthAccents[2],  name: "ฟ้าใส" },
  { hex: monthAccents[3],  name: "เขียวเซจ" },
  { hex: monthAccents[4],  name: "เทาเงินอ่อน" },
  { hex: monthAccents[5],  name: "เขียวอ่อนสดชื่น" },
  { hex: monthAccents[6],  name: "เบจมุก" },
  { hex: monthAccents[7],  name: "น้ำเงินสุภาพ" },
  { hex: monthAccents[8],  name: "คอรัลอบอุ่น" },
  { hex: monthAccents[9],  name: "น้ำเงินท้องฟ้า" },
  { hex: monthAccents[10], name: "แดงสดพลัง" },
  { hex: monthAccents[11], name: "น้ำตาลทอง" },
  { hex: monthAccents[12], name: "ม่วงไลแลค" },
];

function colorDistance(a:string, b:string){
  const [ar,ag,ab] = hexToRgb(a); const [br,bg,bb] = hexToRgb(b);
  const dr = ar-br, dg = ag-bg, db = ab-bb;
  return Math.sqrt(dr*dr + dg*dg + db*db);
}

function getAccentNameTH(accentHex: string): string {
  let best = ACCENT_CATALOG[0];
  let bestD = Infinity;
  for(const c of ACCENT_CATALOG){
    const d = colorDistance(accentHex, c.hex);
    if(d < bestD){ bestD = d; best = c; }
  }
  return best.name;
}

/** ---------- Small UI ---------- */
function Chip({ label, active, onClick }:{ label:string; active:boolean; onClick:()=>void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={["px-3.5 py-2 rounded-full text-sm border transition",
        active ? "bg-gradient-to-b from-[#ffe6f0] to-[#ffd6ea] border-[#ffc2e0] shadow-[0_4px_12px_rgba(255,143,177,.35)]"
               : "bg-[#faf7ff] border-[#ecdff3] hover:shadow-sm"].join(" ")}>
      {label}
    </button>
  );
}
function TogglePill({ label, on, onToggle }:{label:string; on:boolean; onToggle:()=>void}){
  return (
    <button type="button" aria-pressed={on} onClick={onToggle}
      className={["px-3.5 py-1.5 rounded-full text-sm border transition",
        on ? "bg-white border-[#cde4d9] shadow-sm text-[#1C7C54]"
           : "bg-white border-[#e6e1ea] text-[#6b6570]"].join(" ")}>
      {on ? "✓ " : ""}{label}
    </button>
  );
}

function CopyHexBtn({ hex }:{ hex:string }){
  const [copied, setCopied] = useState(false);
  async function onCopy(){
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(()=>setCopied(false), 1200);
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <button type="button" onClick={onCopy}
      className="px-2 py-1 text-xs rounded-lg border border-[#e6e1ea] bg-white hover:bg-[#faf7ff] transition" aria-label={`คัดลอกค่า ${hex}`}>
      {copied ? "คัดลอกแล้ว" : `คัดลอก ${hex}`}
    </button>
  );
}

/** ---------- Hero Canvas (inline gradients/noise/caustics) ---------- */
function HeroCanvas({ children }:{children:React.ReactNode}){
  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Aura layers */}
      <div className="absolute -inset-x-6 -top-10 -bottom-8 pointer-events-none" style={{
        background: `radial-gradient(60% 60% at 70% 20%, rgba(255,255,255,.55), rgba(255,255,255,0) 60%),
                     radial-gradient(45% 45% at 20% 60%, rgba(255,143,177,.25), rgba(183,158,232,.08) 70%, rgba(0,0,0,0) 80%),
                     radial-gradient(65% 65% at 80% 80%, rgba(69,196,160,.15), transparent 70%)`,
        filter: "saturate(1.04)",
      }} />
      {/* Caustics spin */}
      <motion.div className="absolute -inset-10 mix-blend-soft-light pointer-events-none"
        style={{
          background: "conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,.18), rgba(255,255,255,0) 35%, rgba(255,255,255,.22) 55%, rgba(255,255,255,0) 85%, rgba(255,255,255,.18))"
        }}
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 60 }}
      />
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/20 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** ---------- Weight Ring Chart (SVG arcs) ---------- */
type LayerKey = "day"|"zodiac"|"chinese"|"month";
const layerMeta: Record<LayerKey, {label:string; color:string}> = {
  day:     { label: "พลังสีประจำวันเกิด",  color: "#FF8FB1" },
  zodiac:  { label: "ราศีประจำตัว",       color: "#B79EE8" },
  chinese: { label: "ปีนักษัตรจีน",       color: "#45C4A0" },
  month:   { label: "พลังประจำเดือนเกิด", color: "#D6A75D" },
};
function polarToCartesian(cx:number, cy:number, r:number, angle:number){ const a=(angle-90)*Math.PI/180; return { x: cx + r*Math.cos(a), y: cy + r*Math.sin(a) }; }
function arcPath(cx:number, cy:number, r:number, start:number, end:number){ const s=polarToCartesian(cx,cy,r,end); const e=polarToCartesian(cx,cy,r,start); const large=end-start<=180?0:1; return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`; }
function WeightRingChart({ weights, enabled }:{ weights: Record<LayerKey, number>; enabled: Record<LayerKey, boolean>; }){
  const total = (Object.keys(weights) as LayerKey[]).reduce((s,k)=> s + (enabled[k]?weights[k]:0), 0) || 1;
  let start=0; const size=120, cx=60, cy=60, r=46, stroke=14;
  return (
    <svg width={size} height={size} className="block">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,.06)" strokeWidth={stroke} />
      {(Object.keys(weights) as LayerKey[]).map(k=>{
        if(!enabled[k] || weights[k]<=0) return null;
        const angle = (weights[k]/total)*360; const end=start+angle; const d=arcPath(cx,cy,r,start,end); start=end;
        return <path key={k} d={d} fill="none" stroke={layerMeta[k].color} strokeWidth={stroke} style={{ filter:'drop-shadow(0 2px 6px rgba(0,0,0,.12))' }} />
      })}
      <circle cx={cx} cy={cy} r={r-14} fill="white" />
      <text x={cx} y={cy+4} textAnchor="middle" fontSize="12" fill="#6b6570">Layer</text>
    </svg>
  );
}

/** ---------- Crystal Orb (conic-gradient + motion) ---------- */
function CrystalOrb({ weights, enabled }:{ weights: Record<LayerKey, number>; enabled: Record<LayerKey, boolean>; }){
  // compute enabled total
  const keys = Object.keys(weights) as LayerKey[];
  const total = keys.reduce((s,k)=> s + (enabled[k]?weights[k]:0), 0) || 1;
  // build conic segments string in degrees
  let acc = 0;
  const segs: string[] = [];
  keys.forEach(k=>{
    if(!enabled[k] || weights[k]<=0) return;
    const pct = (weights[k]/total)*100; // percent of circle
    const from = acc; const to = acc + pct; acc = to;
    segs.push(`${layerMeta[k].color} ${from}% ${to}%`);
  });
  const gradient = `conic-gradient(${segs.join(', ')})`;

  // tooltip content
  const sumEnabled = keys.reduce((s,k)=> s + (enabled[k]?weights[k]:0), 0) || 1;
const rows = keys.map(k=>{
  const raw = (enabled[k]?weights[k]:0);
  const pct = Math.round(raw / sumEnabled * 100);
  return { k, pct };
}).filter(r=>r.pct>0);

  return (
    <div className="relative group">
      <motion.div
        className="relative w-[120px] h-[120px] rounded-full shadow-[inset_0_8px_18px_rgba(255,255,255,.8),0_10px_24px_rgba(0,0,0,.10)]"
        style={{ background: gradient }}
        animate={{ rotate: 360 }} transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
      >
        {/* glass & glow */}
        <div className="absolute inset-0 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(60% 60% at 30% 25%, rgba(255,255,255,.55), rgba(255,255,255,0) 60%), radial-gradient(70% 70% at 70% 75%, rgba(255,255,255,.25), rgba(255,255,255,0) 70%)' }} />
        <div className="absolute inset-[14%] rounded-full bg-white/85 backdrop-blur-[1px] flex items-center justify-center text-[12px] text-[#6b6570]">พลังรวม</div>
      </motion.div>

      {/* hover tooltip */}
      <div className="absolute left-[130px] top-1/2 -translate-y-1/2 hidden group-hover:block bg-white border border-[#ece6f3] shadow-md rounded-xl px-3 py-2 text-xs text-[#4a4150] min-w-[180px] z-10">
        {rows.map(r=> (
          <div key={r.k} className="flex items-center gap-2 mb-1 last:mb-0">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: layerMeta[r.k].color }} />
            <span>{layerMeta[r.k].label}</span>
            <span className="ml-auto text-[#6b6570]">{r.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** ---------- Signature Triad (3 คำบุคลิก) ---------- */
// --- Expanded word pools ---
const weekdayWordPool: Record<number, string[]> = {
  0: ["ภาวะผู้นำ","เชื่อมั่น","เปล่งประกาย","เปิดเผย","กล้าตัดสินใจ"], // อาทิตย์
  1: ["อ่อนโยน","ละเอียด","อดทน","เมตตา","ประนีประนอม"],             // จันทร์
  2: ["พลังงานสูง","แข็งแรง","เชิงรุก","กล้าเสี่ยง","มุ่งมั่น"],           // อังคาร
  3: ["คล่องตัว","สื่อสารเก่ง","ยืดหยุ่น","คิดไว","วางแผนเก่ง"],            // พุธกลางวัน
  4: ["ครู","สุขุม","มีหลักการ","เมตตาธรรม","มองระยะยาว"],               // พฤหัสบดี
  5: ["เสน่ห์","สุนทรียะ","社交เก่ง","ละมุน","สมดุล"],                     // ศุกร์
  6: ["หนักแน่น","ตั้งใจ","ลึกซึ้ง","มีวินัย","จริงจัง"],                   // เสาร์
};

const monthWordPool: Record<number, string[]> = {
  1:["ตั้งต้น","เคลียร์เป้าหมาย","ระเบียบ"],
  2:["อบอุ่น","ร่วมมือ","ความรัก"],
  3:["เริ่มใหม่","สดชื่น","ความหวัง"],
  4:["เติบโต","วางรากฐาน","ชัดเจน"],
  5:["พลังสร้างสรรค์","มั่นคง","สมดุล"],
  6:["ละเอียด","ดูแล","อ่อนโยน"],
  7:["ผูกพัน","ปกป้อง","อ่อนไหว"],
  8:["โดดเด่น","พลัง","ภาวะผู้นำ"],
  9:["เป็นระบบ","เนี้ยบ","วิจารณ์สร้างสรรค์"],
  10:["ร่วมมือ","ยุติธรรม","ภาพลักษณ์"],
  11:["ลึกซึ้ง","เปลี่ยนแปลง","โฟกัส"],
  12:["วิสัยทัศน์","ทะเยอทะยาน","ระยะยาว"],
};

const chineseAnimalWordPool: Record<string, string[]> = {
  Rat:["ไหวพริบ","ฉลาด","ว่องไว"],
  Ox:["มั่นคง","อดทน","ขยัน"],
  Tiger:["กล้าหาญ","ริเริ่ม","พลัง"],
  Rabbit:["สุภาพ","เมตตา","นุ่มนวล"],
  Dragon:["ทะเยอทะยาน","ผู้นำ","บารมี"],
  Snake:["ลุ่มลึก","ช่างสังเกต","มีเสน่ห์"],
  Horse:["กระฉับกระเฉง","อิสระ","มุ่งหน้า"],
  Goat:["อ่อนโยน","ศิลป์","เห็นอกเห็นใจ"],
  Monkey:["แก้ปัญหาไว","ขี้เล่น","ฉลาด"],
  Rooster:["ตรงไปตรงมา","ขยัน","เป๊ะ"],
  Dog:["ซื่อสัตย์","ปกป้อง","ไว้ใจได้"],
  Pig:["ใจกว้าง","สบาย ๆ","อบอุ่น"],
};

const topicWordPool: Record<Topic, string[]> = {
  career:["มืออาชีพ","โดดเด่น","ชัดเจน","โฟกัส","สื่อสารเก่ง"],
  money:["มีวินัย","มั่นคง","เรียกทรัพย์","คุ้มค่า","น่าเชื่อถือ"],
  love:["อบอุ่น","อ่อนโยน","มีเสน่ห์","เป็นมิตร","โรแมนติก"],
};

// small helpers
function pickDeterministic<T>(arr: T[], seed: number): T {
  if(!arr || arr.length===0) return ("" as unknown) as T;
  const i = Math.abs(seed) % arr.length;
  return arr[i];
}
function strSeed(s: string){ let h=0; for(let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h|=0; } return h; }

const elementAdjectivesTH: Record<ZEl,string[]> = {
  fire:["มั่นใจ","ริเริ่ม","พลัง","กล้าหาญ","นำทีม","สดใส"],
  water:["สงบ","โฟกัส","นุ่ม","ลื่นไหล","อ่อนไหว","เยือกเย็น"],
  air:["โปร่ง","คิดไว","ยืดหยุ่น","สื่อสารเก่ง","ไอเดีย","เบาสบาย"],
  earth:["สุภาพ","มั่นคง","ไว้ใจได้","มีวินัย","เรียบง่าย","เสถียร"],
};
const chineseElAdjTH: Record<CEl,string> = {
  Metal:"คมชัด",
  Water:"ลื่นไหล",
  Wood:"เติบโต",
  Fire:"เปล่งพลัง",
  Earth:"เสถียร",
};
const topicAdjTH: Record<Topic,string[]> = {
  career:["โดดเด่น","ชัดเจน","มืออาชีพ"],
  money:["ดึงดูด","มีวินัย","มั่นคง"],
  love:["อบอุ่น","อ่อนโยน","มีเสน่ห์"],
};

function SignatureTriad({ items }:{ items: {text:string; hint:string; bg:string; border?:string}[] }){
  return (
    <div>
      <div className="text-sm font-semibold text-[#3b2f40] mb-2">เอกลักษณ์ 3 คำ ที่เป็นคุณ</div>
      <div className="flex flex-wrap gap-6 md:gap-3">
        {items.map((it,idx)=> (
          <div key={idx} className="group relative">
            <div className="px-3.5 py-2 rounded-xl border text-sm font-semibold shadow-sm"
                 style={{ background: it.bg, borderColor: it.border||"rgba(0,0,0,.08)" }}
                 title={it.hint}>{it.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** ---------- Page ---------- */
export default function Page(){
  // Inputs
  const [dob, setDob] = useState<string>("");
  const [topic, setTopic] = useState<"career"|"money"|"love">("career");
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ day:true, zodiac:true, chinese:false, month:false });

  // Glitter controls
  const [glitterLevel, setGlitterLevel] = useState<GlitterLevel>('light');
  const [glitterStyle, setGlitterStyle] = useState<GlitterStyle>('gradient');
  const [animateSparkle, setAnimateSparkle] = useState<boolean>(true);
  const [symbolFinger, setSymbolFinger] = useState<number>(3); // 0..4

  // Cat Eye controls (magnetic gel effect)
  const [catEyeEnabled, setCatEyeEnabled] = useState<boolean>(false);
  const [catEyeIntensity, setCatEyeIntensity] = useState<number>(70); // 0-100
  const [catEyeAngle, setCatEyeAngle] = useState<number>(25); // -90..90

  // Cat Eye pattern preset UI state
  const [catEyePattern, setCatEyePattern] = useState<'straight'|'diagonal'|'cross'|'halo'|'galaxy'|'layered'>('straight');
  // Star overlay toggle for Galaxy
  const [showStars, setShowStars] = useState<boolean>(false);

  // Cat Eye physical params (no UI yet)
  const ridgeCenterRef = useRef<number>(0.5); // 0..1 across nail width
  const ridgeSigma = 12; // px-ish softness (fixed for now)
  // Pointer handlers for preview (Cat Eye ridge center steer, no UI)
  function handlePreviewPointerMove(e: React.PointerEvent<HTMLDivElement>){
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    // keep inside the nail visual area a bit
    ridgeCenterRef.current = Math.min(0.92, Math.max(0.08, x));
  }
  function handlePreviewPointerLeave(){
    ridgeCenterRef.current = 0.5;
  }

  // Perceptual Delay state
  const [status, setStatus] = useState<"idle"|"computing"|"ready">("idle");
  const debounceRef = useRef<NodeJS.Timeout|null>(null);
  const computeRef  = useRef<NodeJS.Timeout|null>(null);

  // Derived
  const dow   = useMemo(()=> dayOfWeekFromDateStr(dob), [dob]);
  const month = useMemo(()=> monthFromDateStr(dob), [dob]);
  const zodiac= useMemo(()=> getWesternZodiac(dob), [dob]);
  const cz    = useMemo(()=> getChineseZodiacAndElement(dob), [dob]);
  // Western element derived early so hooks below can use it
  const zEl = useMemo(() => westernZodiacToElement[zodiac.sign] as ZEl, [zodiac.sign]);

  // Weights
  const weights = { day:0.6, zodiac:0.2, chinese:0.15, month:0.05 } as const;

  // Perceptual Delay when inputs change
  useEffect(()=>{
    if(debounceRef.current) clearTimeout(debounceRef.current);
    setStatus("computing"); // 0ms
    debounceRef.current = setTimeout(()=>{
      if(computeRef.current) clearTimeout(computeRef.current);
      computeRef.current = setTimeout(()=> setStatus("ready"), 200 + Math.round(Math.random()*100)); // 220–300ms
    }, 80); // 60–120ms
    return ()=>{ if(debounceRef.current) clearTimeout(debounceRef.current); if(computeRef.current) clearTimeout(computeRef.current); };
  }, [dob, layers.day, layers.zodiac, layers.chinese, layers.month, topic]);

  // Palette blending
  const palette = useMemo(()=>{
    const items: {hex:string; weight:number}[] = [];
    const dayHex = (auspiciousByWeekday[dow] && auspiciousByWeekday[dow][0]?.hex) || dayColors[dow];
    if(layers.day)    items.push({ hex: dayHex, weight: weights.day });
    if(layers.zodiac) items.push({ hex: elementAccents[ westernZodiacToElement[zodiac.sign] ], weight: weights.zodiac });
    if(layers.chinese)items.push({ hex: chineseElementAccents[ cz.element ], weight: weights.chinese });
    if(layers.month)  items.push({ hex: monthAccents[month], weight: weights.month });
    if(items.length===0) items.push({ hex: dayHex, weight: 1 });
    const total = items.reduce((s,i)=>s+i.weight,0) || 1;
        const blended = mixWeighted(items.map(i=>({hex:i.hex, weight:i.weight/total})));

    // Bias base ด้วยโทนตามหัวข้อ เพื่อให้ผลต่างกันจริง
    const bias = topicToneHex[zEl][topic];
    const baseBiased = mix(blended, bias.base, 0.55);

    // เลือก accent: ใช้ของ topic ก่อน ถ้าไม่มีจึง fallback ตามเลเยอร์
    let accent = bias.accent;
    if(!accent){
      if(layers.chinese) accent = chineseElementAccents[cz.element];
      else if(layers.zodiac) accent = elementAccents[ westernZodiacToElement[zodiac.sign] ];
      else if(layers.month)  accent = monthAccents[month];
      else accent = dayHex;
    }
    return { base: baseBiased, accent, overlay: topicStyles[topic].overlay };
  }, [layers, dow, month, zodiac, cz, topic, zEl]);

  // Signature Triad (3 คำบุคลิก)
  const triadItems = useMemo(()=>{
    const seed = strSeed(dob || `${dow}-${month}`);

    // 1) Core from western element
    const corePool = elementAdjectivesTH[zEl] || ["สมดุล"]; 
    const word1 = pickDeterministic(corePool, seed);
    const hint1 = `ธาตุราศี (${elementThai[zEl]})`;

    // 2) Daily archetype: choose from weekday or month depending on which layer has higher effective weight
    const wDay = layers.day ? (weights.day) : 0; 
    const wMonth = layers.month ? (weights.month) : 0;
    let word2 = "สมดุล"; let hint2 = "";
    if(wDay >= wMonth){
      const pool = weekdayWordPool[dow] || ["สมดุล"];
      word2 = pickDeterministic(pool, seed+7);
      hint2 = `วันเกิด: ${dayMapThai[dow]}`;
    } else {
      const pool = monthWordPool[month] || ["สมดุล"];
      word2 = pickDeterministic(pool, seed+11);
      hint2 = `เดือนเกิด: ${month}`;
    }

    // 3) Focus enhancer: prefer Chinese zodiac if enabled, else topic
    let word3 = "ละมุน"; let hint3 = "";
    if(layers.chinese){
      const pool = chineseAnimalWordPool[cz.animal] || ["สมดุล"];
      word3 = pickDeterministic(pool, seed+19);
      hint3 = `นักษัตรจีน: ${chineseZodiacThai[cz.animal]}`;
    } else {
      const pool = topicWordPool[topic] || ["สมดุล"];
      word3 = pickDeterministic(pool, seed+23);
      hint3 = `โฟกัสวันนี้: ${topicStyles[topic].th}`;
    }

    // chip backgrounds using current palette
    const bg1 = `linear-gradient(180deg, ${mix(palette.base, "#ffffff", .15)}, ${mix(palette.base, "#ffffff", .35)})`;
    const bg2 = `linear-gradient(180deg, ${mix(palette.accent, "#ffffff", .1)}, ${mix(palette.accent, "#ffffff", .3)})`;
    const bg3 = `linear-gradient(180deg, ${mix(palette.overlay, "#ffffff", .15)}, ${mix(palette.overlay, "#ffffff", .4)})`;

    return [
      { text: word1, hint: hint1, bg: bg1 },
      { text: word2, hint: hint2, bg: bg2 },
      { text: word3, hint: hint3, bg: bg3 },
    ];
  }, [dob, dow, month, zEl, cz.animal, topic, palette.base, palette.accent, palette.overlay, layers.day, layers.month, layers.chinese]);

  // --- โปรไฟล์ (หัวตัวใหญ่) + สีที่แนะนำ ---
// Paired accent (fixed by topic) vs Aura (from layers)
const pairedAccentHex = useMemo(()=> topicToneHex[zEl][topic].accent, [zEl, topic]);
// สีมงคลประจำวัน (ใช้กับแท็ก "โทนมงคล")
const dayLuckyHex = useMemo(()=> (auspiciousByWeekday[dow]?.[0]?.hex) || dayColors[dow], [dow]);
// สีเสริมออร่า: เลือกจากเลเยอร์ (จีน -> ราศี -> เดือน -> วัน) โดยไม่ซ้ำ paired accent
const auraHex = useMemo(()=>{
  const cands = [
    layers.chinese ? chineseElementAccents[cz.element] : undefined,
    layers.zodiac  ? elementAccents[zEl]               : undefined,
    layers.month   ? monthAccents[month]               : undefined,
    dayLuckyHex
  ].filter(Boolean) as string[];
  const found = cands.find(h => h.toLowerCase() !== pairedAccentHex.toLowerCase());
  return found || mix(pairedAccentHex, "#ffffff", 0.18);
}, [layers.chinese, layers.zodiac, layers.month, cz.element, zEl, month, dayLuckyHex, pairedAccentHex]);
const auraNameTH = useMemo(()=> getAccentNameTH(auraHex), [auraHex]);
  const accentNameTH = useMemo(()=> topicToneNameMap[zEl][topic].accentName, [zEl, topic]);

  const identityHTML = useMemo(()=>{
    if(!dob) return "กรุณาเลือกวันเกิดเพื่อเริ่มต้น ✨";
    return `วัน<b>${dayMapThai[dow]}</b> · ราศี<b>${zodiacThai[zodiac.sign]}</b> · ธาตุ<b>${elementThai[zEl]}</b> · ปีนักษัตร<b>${chineseZodiacThai[cz.animal]}</b>`;
  }, [dob, dow, zodiac, cz, zEl]);

  const toneName = useMemo(()=> getToneName(zEl, topic), [zEl, topic]);

  const colorReasonHTML = useMemo(()=>{
    if(!dob) return "";
    const avoid = layers.day ? (kalaAvoidByWeekday[dow]||[]) : [];
    return buildColorReasonTH({
      weekdayTH: dayMapThai[dow],
      zEl,
      cEl: cz.element,
      topic,
      toneName,
      baseHex: palette.base,
      accentHex: palette.accent,
      avoidList: avoid,
    });
  }, [dob, dow, zEl, cz.element, topic, toneName, palette.base, palette.accent, layers.day]);

  const accentReasonHTML = useMemo(()=>{
  if(!dob) return "";
  return buildAccentReasonTH({ topic, accentHex: auraHex, accentName: auraNameTH });
}, [dob, topic, auraHex, auraNameTH]);

  const variationHTML = useMemo(()=>{
    if(!dob) return "";
    return buildVariationEditorialTH({
      layers,
      weights: weights as Record<LayerKey, number>,
      toneName,
      zEl,
      topic,
    });
  }, [dob, layers, zEl, topic, toneName]);

  const glitterAdviceHTML = useMemo(()=>{
    if(!dob) return "";
    return buildGlitterAdviceTH({ style: glitterStyle, zEl, zodiacSign: zodiac.sign, dow, cEl: cz.element });
  }, [dob, glitterStyle, zEl, zodiac.sign, dow, cz.element]);

  const kalaAdviceHTML = useMemo(()=>{
    if(!dob || !layers.day) return "";
    const avoid = kalaAvoidByWeekday[dow] || [];
    if(avoid.length===0) return "";
    const tips = avoid.map(n=>{
      const alt = nearBySuggestions[n] ? ` → ลองเฉด <b>${nearBySuggestions[n]}</b>` : "";
      return `<span class="inline-block px-2 py-1 rounded-lg border mr-1 mb-1">${n}${alt}</span>`;
    }).join(" ");
    return `เฉดที่คนเกิดวัน<b>${dayMapThai[dow]}</b> ควรหลีกเลี่ยง: ${tips}`;
  }, [dob, dow, layers.day]);

  function toggleLayer(k:LayerKey){
    setLayers(prev=>{
      const n={...prev,[k]:!prev[k]};
      if(!n.day && !n.zodiac && !n.chinese && !n.month) n.day=true;
      return n;
    });
  }

  // Nails style from palette (topic-aware accent finger)
const nailsStyles = useMemo(()=>{
  // การงาน=นิ้วชี้(1), การเงิน=นิ้วนาง(3), ความรัก=นิ้วกลาง(2)
  const accentFingerByTopic: Record<Topic, number> = { career: 1, money: 3, love: 2 };
  const af = accentFingerByTopic[topic];

  const baseSoft   = mix(palette.base, "#ffffff", .30);
  const baseDeeper = mix(palette.base, palette.overlay, .18);
  const accentSoft = mix(palette.accent, "#ffffff", .18);
  const accentDeep = mix(palette.accent, palette.overlay, .22);
  const overlay    = palette.overlay;

  const makeStyle = (i:number): React.CSSProperties => {
    const isAccent = i===af;
    if(isAccent){
      return {
        background: `linear-gradient(140deg, ${accentSoft} 0 58%, ${baseDeeper} 58% 100%), linear-gradient(180deg, ${mix("#000000", overlay, .05)} 0, transparent 60%)`,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.25)",
      };
    }
    const bg = i%2===0
      ? `linear-gradient(180deg, ${baseSoft}, ${baseDeeper})`
      : `linear-gradient(180deg, ${mix(baseSoft, "#ffffff", .10)}, ${mix(accentSoft, overlay, .18)})`;
    return { background: bg };
  };

  return [0,1,2,3,4].map(i => makeStyle(i)) as React.CSSProperties[];
}, [palette, topic]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* LEFT: Inputs + Layer Lab */}
      <section className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.08)] p-5">
        <div className="mb-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#2f2431] tracking-tight">
            GadeGlao — สีเล็บเสริมดวง
          </h1>
          <div className="h-1 w-24 mt-2 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-amber-400"></div>
        </div>
        <p className="text-sm text-[#6b6570] mt-1">เลือกวันเกิด เรื่องที่อยากเสริม และเลเยอร์องค์ประกอบสีจาก ราศี สีประจำวันเกิด ปีนักษัตร จากนั้นระบบจะคำนวณสีที่เหมาะกับดวงคุณที่สุด 💫</p>

        <label htmlFor="dob" className="block text-sm mt-4 mb-1">วัน-เดือน-ปีเกิด</label>
        <input id="dob" type="date"
          className="w-full rounded-xl border border-[#eae6ef] px-3.5 py-2.5 text-base outline-none focus:border-[#d7cfee] focus:ring-4 focus:ring-[#efe9fb]"
          value={dob} onChange={(e)=>setDob(e.target.value)} />

        <label className="block text-sm mt-4 mb-1">วันนี้อยากให้เล็บเสริมดวงด้านใด?</label>
        <div className="flex flex-wrap gap-2">
          {(["career","money","love"] as const).map(k=> (
            <Chip key={k} label={topicStyles[k].th} active={topic===k} onClick={()=>setTopic(k)} />
          ))}
        </div>

        <label className="block text-sm mt-4 mb-1">องค์ประกอบสี</label>
        <div className="flex flex-wrap gap-2">
          {(["day","zodiac","chinese","month"] as LayerKey[]).map(k=> (
            <TogglePill key={k} label={layerMeta[k].label} on={layers[k]} onToggle={()=>toggleLayer(k)} />
          ))}
        </div>

        {/* Weight Ring */}
        <div className="mt-4 grid grid-cols-[auto_1fr] gap-4 items-center">
          <CrystalOrb weights={weights as any} enabled={layers as any} />
          <div className="space-y-2">
            <SignatureTriad items={triadItems} />
          </div>
        </div>

        {/* Glitter Controls */}
        <div className="mt-4">
        {/* Cat Eye Option (works on all tones) */}
        <div className="mt-4">
          <label className="block text-sm mb-1">เอฟเฟกต์ Cat Eye (สีลูกแก้ว)</label>
          <div className="flex flex-wrap items-center gap-3">
            <TogglePill label={catEyeEnabled ? "เปิดใช้งาน" : "ปิดอยู่"}
                        on={catEyeEnabled}
                        onToggle={()=>setCatEyeEnabled(!catEyeEnabled)} />
            {catEyeEnabled && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6b6570] w-20">ความวิ้ง</span>
                  <input type="range" min={0} max={100} value={catEyeIntensity}
                         onChange={e=>setCatEyeIntensity(parseInt(e.target.value,10))}
                         className="w-48" />
                  <span className="text-xs text-[#6b6570] w-10 text-right">{catEyeIntensity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6b6570] w-20">องศา</span>
                  <input type="range" min={-90} max={90} value={catEyeAngle}
                         onChange={e=>setCatEyeAngle(parseInt(e.target.value,10))}
                         className="w-48" />
                  <span className="text-xs text-[#6b6570] w-10 text-right">{catEyeAngle}°</span>
                </div>
                {/* Pattern presets */}
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {([
                    {key:'straight', label:'Straight', icon:'➖'},
                    {key:'diagonal', label:'Diagonal', icon:'／'},
                    {key:'cross',    label:'Cross',    icon:'✚'},
                    {key:'halo',     label:'Halo',     icon:'⭕'},
                    {key:'galaxy',   label:'Galaxy',   icon:'🌌'},
                    {key:'layered',  label:'Layered',  icon:'🌀'},
                  ] as {key:'straight'|'diagonal'|'cross'|'halo'|'galaxy'|'layered'; label:string; icon:string;}[]).map(p => (
                    <button key={p.key} type="button"
                      onClick={()=>setCatEyePattern(p.key)}
                      aria-pressed={catEyePattern===p.key}
                      className={[
                        'px-3 py-1.5 rounded-full text-sm border transition flex items-center gap-1',
                        catEyePattern===p.key
                          ? 'bg-white border-[#ffd6ea] shadow-sm text-[#D7427D]'
                          : 'bg-white border-[#e6e1ea] text-[#6b6570] hover:shadow-sm'
                      ].join(' ')}
                      title={p.label}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
                {/* Star overlay toggle — only show for Galaxy */}
                {catEyePattern==='galaxy' && (
                  <button
                    type="button"
                    onClick={()=>setShowStars(!showStars)}
                    className={showStars
                      ? "px-3 py-1.5 rounded-full bg-white border-[#ffd6ea] text-[#D7427D]"
                      : "px-3 py-1.5 rounded-full bg-white border text-[#6b6570]"
                    }
                  >
                    ⭐ ลายดาว
                  </button>
                )}
              </>
            )}
          </div>
          <p className="text-xs text-[#827a86] mt-1">แถบแสงเฉียงจะกวาดผ่านเล็บเหมือนเจลแม่เหล็ก Cat Eye — ใช้ได้กับทุกโทน</p>
          {catEyeEnabled && (
            <div className="text-[11px] text-[#6b6570] mt-1">Pattern: <b>{catEyePattern}</b> — แตะปุ่มด้านบนเพื่อเปลี่ยนลวดลาย</div>
          )}
        </div>
          <label className="block text-sm mb-1">กลิตเตอร์ (ความวิ้ง)</label>
          <div className="flex flex-wrap gap-2">
            {(['none','light','medium','bold'] as GlitterLevel[]).map(l => (
              <button key={l} type="button"
                onClick={()=>setGlitterLevel(l)}
                className={[
                  "px-3.5 py-1.5 rounded-full text-sm border transition",
                  glitterLevel===l ? "bg-white border-[#ffd6ea] shadow-sm text-[#D7427D]"
                                   : "bg-white border-[#e6e1ea] text-[#6b6570] hover:shadow-sm"
                ].join(' ')}>
                {glitterLevel===l ? "✓ " : ""}{l==='none'?"ปิด":l==='light'?"น้อย":l==='medium'?"กลาง":"จัดเต็ม"}
              </button>
            ))}
          </div>

          <label className="block text-sm mt-3 mb-1">สไตล์กลิตเตอร์</label>
          <div className="flex flex-wrap gap-2">
            {(['gradient','french','galaxy','symbol','constellation','zodiac','dust'] as GlitterStyle[]).map(s => (
              <button key={s} type="button"
                onClick={()=>setGlitterStyle(s)}
                className={[
                  "px-3.5 py-1.5 rounded-full text-sm border transition",
                  glitterStyle===s ? "bg-white border-[#cde4d9] shadow-sm text-[#1C7C54]"
                                   : "bg-white border-[#e6e1ea] text-[#6b6570] hover:shadow-sm"
                ].join(' ')}>
                {glitterStyle===s ? "✓ " : ""}{
                  s==='gradient'?"ไล่ประกาย"
                  : s==='french'?"ปลายประกาย (French tip)"
                  : s==='galaxy'?"ดวงดาว (Galaxy)"
                  : s==='symbol'?"สัญลักษณ์"
                  : s==='constellation'?"กลุ่มดาว (Constellation)"
                  : s==='zodiac'?"สัญลักษณ์ราศี"
                  : "ละอองธาตุ"}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={animateSparkle} onChange={e=>setAnimateSparkle(e.target.checked)} />
              <span>แอนิเมชันเงาวิบวับ</span>
            </label>

            {(glitterStyle==='symbol' || glitterStyle==='constellation' || glitterStyle==='zodiac') && (
              <label className="text-sm flex items-center gap-2">
                นิ้วสำหรับสัญลักษณ์:
                <select
                  className="rounded-lg border border-[#e6e1ea] px-2 py-1"
                  value={symbolFinger}
                  onChange={e=>setSymbolFinger(parseInt(e.target.value,10))}>
                  <option value={0}>หัวแม่มือ</option>
                  <option value={1}>นิ้วชี้</option>
                  <option value={2}>นิ้วกลาง</option>
                  <option value={3}>นิ้วนาง</option>
                  <option value={4}>นิ้วก้อย</option>
                </select>
              </label>
            )}
          </div>
        </div>

        <div className="mt-3 text-xs text-[#827a86] space-y-1">
          <div>*เพื่อแรงบันดาลใจเท่านั้น ไม่ใช่การทำนายชะตา</div>
          {dob && (
            <div>
              ค่าของคุณตอนนี้: วัน <b>{dayMapThai[dow]}</b> • ราศี <b>{zodiacThai[zodiac.sign]}</b> • นักษัตร <b>{cz.display}</b> {chineseZodiacIcons[cz.animal]} • เดือน <b>{month}</b>
            </div>
          )}
        </div>
      </section>

      {/* RIGHT: Hero Canvas + Nails + Cards */}
      <HeroCanvas>
        <section className="bg-white/70 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.08)] p-5">
          <h2 className="text-lg font-bold">พรีวิวของคุณ</h2>
          <div className="mt-3 flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-end justify-center gap-3 min-h-[140px]">
              <AnimatePresence initial={false} mode="wait">
                {status!=="ready" ? (
                  <motion.div key="skeleton" className="flex flex-wrap items-end justify-center gap-3"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: .18, ease: [0.4,0,0.2,1] }}>
                    {[0,1,2,3,4].map(i=> (
                      <div key={i} className="w-[78px] h-[118px] rounded-[36px] border border-[#eee3f3] bg-gradient-to-b from-[#f7f0fb] to-[#f0f8ff]" />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="real" className="flex flex-wrap items-end justify-center gap-3"
                    initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: .28, ease: [0.22,0.61,0.36,1] }}
                    onPointerMove={handlePreviewPointerMove}
                    onPointerLeave={handlePreviewPointerLeave}
                  >
                    {renderNails(nailsStyles, topic, {
                      glitterLevel, glitterStyle, animateSparkle, symbolFinger, zodiacSign: zodiac.sign, zEl, cEl: cz.element,
                      catEye: { enabled: catEyeEnabled, intensity: catEyeIntensity, angle: catEyeAngle, color: mix(palette.accent, "#ffffff", .15), animate: animateSparkle, pattern: catEyePattern },
                      phys: { ridgeCenter: ridgeCenterRef.current, ridgeSigma }
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 text-sm font-semibold rounded-lg border"
  style={{ background: mix(palette.base, "#ffffff", .85), borderColor: mix(palette.base, "#ffffff", .2) }}>
  สีหลัก
</span>
<span className="px-2.5 py-1 text-sm font-semibold rounded-lg border"
  style={{ background: mix(auraHex, "#ffffff", .85), borderColor: mix(auraHex, "#ffffff", .2) }}>
  สีเสริมออร่า
</span>
<span className="px-2.5 py-1 text-sm font-semibold rounded-lg border"
  style={{ background: mix(dayLuckyHex, "#ffffff", .85), borderColor: mix(dayLuckyHex, "#ffffff", .2) }}>
  โทนมงคล
</span>
            </div>

            {/* Personal Summary (pearl-like) */}
            <div style={{ background: "linear-gradient(90deg, rgba(255,255,255,.9), rgba(214,167,93,.45), rgba(183,158,232,.6), rgba(69,196,160,.5), rgba(255,255,255,.9))", padding: 1, borderRadius: 16 }}>
              <div style={{ background: "rgba(255,255,255,.82)", backdropFilter: "blur(8px)", borderRadius: 16 }} className="p-3">
                <div>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="text-3xl md:text-4xl leading-tight font-extrabold text-[#2f2431] tracking-tight"
                           dangerouslySetInnerHTML={{ __html: identityHTML }} />
                      <div className="h-1.5 w-24 mt-2 rounded-full" style={{ background: `linear-gradient(90deg, ${palette.accent}, ${mix(palette.accent, '#ffffff', .4)})` }} />
                    </div>
                    <div className="text-3xl md:text-4xl">{chineseZodiacIcons[cz.animal]}</div>
                  </div>
                  {dob && (
                    <>
                      {/* --- Dual color boxes for base and accent with split labels --- */}
                      <motion.div className="mt-3 flex flex-row gap-6 items-start justify-center flex-wrap"
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25, ease: [0.22,0.61,0.36,1] }}>
                        {(() => {
                          const names = topicToneNameMap[zEl][topic];
                          const leftLabel = names.baseName;        // tone base name
                          const rightLabel = names.accentName;     // tone paired accent name
                          const pearlBorder = "inset 0 1px 0 rgba(255,255,255,.6), inset 0 -1px 0 rgba(0,0,0,.04)";
                          const tone = topicToneHex[zEl][topic];   // fixed tone pair
                          return (
                            <>
                              {/* Tone pair (2 boxes) */}
                              <div className="flex flex-col items-center gap-1">
                                <div className="text-[11px] text-[#6b6570]">โทนสีที่แนะนำ</div>
                                <div className="flex gap-2">
                                  <div className="w-14 h-14 rounded-xl border shadow-sm" title={leftLabel}
                                       style={{ background: tone.base, borderColor: "rgba(0,0,0,.08)", boxShadow: pearlBorder }} />
                                  <div className="w-14 h-14 rounded-xl border shadow-sm" title={rightLabel}
                                       style={{ background: tone.accent, borderColor: "rgba(0,0,0,.08)", boxShadow: pearlBorder }} />
                                </div>
                                <div className="flex gap-2 text-[11px] text-[#6b6570] mt-0.5">
                                  <span>{leftLabel}</span>
                                  <span>{rightLabel}</span>
                                </div>
                              </div>

                              {/* Accent aura (single box) */}
                              <div className="flex flex-col items-center gap-1">
  <div className="text-[11px] text-[#6b6570]">สีเสริมออร่า</div>
  <div className="w-14 h-14 rounded-xl border shadow-sm" title={auraNameTH}
       style={{ background: auraHex, borderColor: "rgba(0,0,0,.08)", boxShadow: pearlBorder }} />
  <div className="text-[11px] text-[#6b6570] mt-0.5">{auraNameTH}</div>
</div>
                            </>
                          );
                        })()}
                      </motion.div>
                      <div className="mt-4 grid gap-3">
                        {/* Reasoning card */}
                        {dob && colorReasonHTML && (
                          <section className="rounded-2xl border border-[#ece6f3] bg-white/95 p-3 md:p-4 shadow-[0_6px_18px_rgba(0,0,0,.06)]">
                            <h3 className="text-sm md:text-base font-semibold text-[#352a3c] mb-1">เหตุผลโทนสี</h3>
                            <div className="text-sm md:text-base leading-relaxed text-[#4a4150]" dangerouslySetInnerHTML={{ __html: colorReasonHTML }} />
                          </section>
                        )}

                        {/* Accent card */}
                        {dob && accentReasonHTML && (
                          <section className="rounded-2xl border border-[#e6efe9] bg-white/95 p-3 md:p-4">
                            <h3 className="text-sm md:text-base font-semibold text-[#21463b] mb-1">สีเสริม & การวาง</h3>
                            <div className="text-sm md:text-base leading-relaxed text-[#3c4744]" dangerouslySetInnerHTML={{ __html: accentReasonHTML }} />
                          </section>
                        )}

                        {/* Variation editorial card */}
                        {dob && variationHTML && (
                          <section className="rounded-2xl border border-[#e9e2f0] bg-white/95 p-3 md:p-4">
                            <h3 className="text-sm md:text-base font-semibold text-[#352a3c] mb-1">ไอเดียการทา (Beauty Editorial)</h3>
                            <div className="text-xs md:text-sm leading-relaxed text-[#5a5160]" dangerouslySetInnerHTML={{ __html: variationHTML }} />
                          </section>
                        )}

                        {/* Glitter style card */}
                        {dob && glitterAdviceHTML && (
                          <section className="rounded-2xl border border-[#f2ead7] bg-[#fffdfa] p-3 md:p-4">
                            <h3 className="text-sm md:text-base font-semibold text-[#5a3f1e] mb-1">กลิตเตอร์ & สัญลักษณ์</h3>
                            <div className="text-xs md:text-sm leading-relaxed text-[#5a5160]" dangerouslySetInnerHTML={{ __html: glitterAdviceHTML }} />
                          </section>
                        )}
                      </div>
                      {/* Chips row: สีมงคลตามวันเกิด */}
                      {dob && auspiciousByWeekday[dow] && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className="text-xs text-[#6b6570] mr-1">สีมงคลตามวันเกิดของคุณ:</span>
                          {auspiciousByWeekday[dow].map((c,i)=> (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs"
                                  style={{ borderColor: "rgba(0,0,0,.08)", background: "#fff" }}>
                              <span className="inline-block w-3.5 h-3.5 rounded" style={{ background: c.hex }} />
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* คำแนะนำเลี่ยงกาลกิณี (นุ่ม ๆ) */}
            {kalaAdviceHTML && (
              <div className="w-full text-sm leading-relaxed bg-[#fffdfa] border border-[#f4e3c2] rounded-xl p-3 flex flex-wrap gap-1"
                   dangerouslySetInnerHTML={{__html: kalaAdviceHTML }} />
            )}
          </div>
        </section>
      </HeroCanvas>

      {/* ── ส่วนร้าน: เมนูราคา · มาตรฐาน · จองคิว (รวมจาก shop.html) ── */}
      <ShopSections />
    </div>
  );
}

/* ---------- helper: render nails (with glitter) ---------- */
function renderNails(
  styles: React.CSSProperties[],
  topic: "career"|"money"|"love",
  glitterOpts?: { glitterLevel: GlitterLevel; glitterStyle: GlitterStyle; animateSparkle: boolean; symbolFinger: number; zodiacSign?: string; zEl?: ZEl; cEl?: CEl; catEye?: { enabled: boolean; intensity: number; angle: number; color: string; animate: boolean; pattern?: 'straight'|'diagonal'|'cross'|'galaxy'|'halo'|'layered' }, phys?: { ridgeCenter: number; ridgeSigma: number } }
){
  const labels = ["หัวแม่มือ","ชี้","กลาง","นาง","ก้อย"]; const icon = topicStyles[topic].icon;
  const { glitterLevel='none', glitterStyle='gradient', animateSparkle=true, symbolFinger=3 } = glitterOpts || {};
  const elementHint = (glitterOpts?.zEl as ZEl) || (glitterOpts?.cEl as CEl);
  const glitter = buildGlitterOverlay(glitterLevel, glitterStyle, elementHint, glitterOpts?.animateSparkle);
  // Avoid visual overload: pause glitter shimmer when Cat Eye animation is enabled
  const shimmerActive = glitterLevel !== 'none' && animateSparkle && !(glitterOpts?.catEye?.enabled);
  // Shared shimmer timing (use for both glitter and cat eye)
  const SHIMMER_RANGE = ["-120%","120%"] as const;
  const SHIMMER_TRANSITION = { duration: 2.8, ease: [0.22,0.61,0.36,1] as any, repeat: Infinity, repeatType: 'mirror' as const };
  // --- Cat Eye pattern helper ---
  const catEyePattern = (glitterOpts?.catEye?.pattern || 'straight') as 'straight'|'diagonal'|'cross'|'galaxy'|'halo'|'layered';

  // Clearcoat Fresnel helpers (sync with pointer center and cat-eye angle if present)
  const ridgeCenterCL = glitterOpts?.phys?.ridgeCenter ?? 0.5; // 0..1
  const centerPctCL = Math.round(ridgeCenterCL * 100);
  const sweepRangeCL = 10; // +/-10% gentle follow to pointer
  const posA_CL = `${Math.max(0, centerPctCL - sweepRangeCL)}%`;
  const posB_CL = `${Math.min(100, centerPctCL + sweepRangeCL)}%`;
  const angleCL = glitterOpts?.catEye?.angle ?? 0;

  function constellationPoints(sign?: string){
    const s = (sign||'').toLowerCase();
    // Each item: [top%, left%]
    const base: [number,number][]= [ [22,28],[30,40],[40,52],[58,46],[68,60] ];
    if(s.includes('leo')) return [ [18,30],[26,42],[38,54],[52,48],[66,62] ];
    if(s.includes('virgo')) return [ [20,34],[28,46],[36,58],[50,50],[64,64] ];
    if(s.includes('aries')) return [ [24,26],[32,38],[42,50],[60,44],[70,58] ];
    if(s.includes('taurus'))return [ [26,32],[34,44],[46,56],[58,48],[70,60] ];
    if(s.includes('gemini'))return [ [22,36],[30,48],[38,60],[52,52],[66,66] ];
    if(s.includes('cancer'))return [ [24,34],[34,46],[44,58],[58,50],[70,62] ];
    if(s.includes('libra')) return [ [22,32],[30,44],[42,56],[56,48],[68,60] ];
    if(s.includes('scorpio'))return [ [20,28],[30,40],[40,52],[56,46],[68,60] ];
    if(s.includes('sagittarius'))return [ [18,34],[28,46],[40,58],[54,50],[68,64] ];
    if(s.includes('capricorn')) return [ [20,30],[30,42],[42,54],[56,48],[70,62] ];
    if(s.includes('aquarius'))  return [ [22,34],[32,46],[44,58],[56,50],[68,64] ];
    if(s.includes('pisces'))    return [ [24,36],[34,48],[46,60],[58,52],[70,66] ];
    return base;
  }

  // Star overlay access: use showStars and catEyePattern from parent scope if available
  const showStars = (typeof window !== "undefined" && (window as any).showStars !== undefined)
    ? (window as any).showStars : (glitterOpts as any)?.showStars;
  const catEyePatternParent = (glitterOpts as any)?.catEye?.pattern ?? catEyePattern;

  return styles.map((st,i)=> (
    <div key={i} className="flex flex-col items-center gap-1.5">
      <div className="relative w-[78px] h-[118px] rounded-[36px] border border-[#e8e1ef] overflow-hidden transition will-change-transform hover:brightness-[1.02] hover:-translate-y-0.5" style={st}>
        {/* Star Overlay (Galaxy only) */}
        {catEyePatternParent==='galaxy' && showStars && (
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          >
            {/* small random stars */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 30%, rgba(255,255,255,0.6) 1px, transparent 2px),
                  radial-gradient(circle at 70% 40%, rgba(255,255,255,0.45) 1.5px, transparent 3px),
                  radial-gradient(circle at 40% 75%, rgba(255,255,255,0.5) 1.2px, transparent 2.5px)
                `,
                backgroundRepeat: 'no-repeat'
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
            />
            {/* one cross star */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 60% 55%, rgba(255,255,255,0.8) 2px, transparent 4px),
                  linear-gradient(transparent 48%, rgba(255,255,255,0.5) 50%, transparent 52%),
                  linear-gradient(90deg, transparent 48%, rgba(255,255,255,0.5) 50%, transparent 52%)
                `,
                backgroundRepeat: 'no-repeat'
              }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            />
          </motion.div>
        )}
        {/* Topic icon */}
        <div className="absolute inset-x-0 bottom-2 text-center text-[20px] drop-shadow-[0_2px_6px_rgba(0,0,0,.2)]/80 opacity-85 pointer-events-none">{icon}</div>

        {/* Glitter base */}
        {glitter.base && (
          <div className="absolute inset-0" style={glitter.base} />
        )}
        {/* Glitter shimmer animation (auto-paused if Cat Eye animates) */}
        {shimmerActive && (
          <motion.div
            className="absolute inset-0"
            style={glitter.shimmer}
            animate={{ backgroundPositionX: SHIMMER_RANGE as any, opacity: [0.7, 1, 0.7] }}
            transition={SHIMMER_TRANSITION}
          />
        )}

        {/* Gel Body Depth — use base color strongly, not muted */}
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{
            mixBlendMode: 'overlay' as const,
            backgroundImage: `radial-gradient(80% 70% at 50% 60%, ${glitterOpts?.catEye?.color || palette.accent}, ${glitterOpts?.catEye?.color || palette.accent})`,
            backgroundRepeat: 'no-repeat',
            opacity: 0.85,
            filter: 'saturate(4) contrast(1.2) brightness(0.55)'
          }}
        />

        {/* GALAXY base gradient (multichrome) — Phase A */}
        {catEyePattern==='galaxy' && (
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(120deg, #5a2a7a 0%, #1b5db3 50%, #1aa79a 100%)',
              backgroundRepeat: 'no-repeat',
              mixBlendMode: 'overlay' as const,
              opacity: 0.85,
              filter: 'saturate(1.2) contrast(1.05)'
            }}
          />
        )}

        {/* Metallic Flakes — bright (Screen) */}
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{
            mixBlendMode: 'screen' as const,
            backgroundImage: `
      /* dense fine grains (0.5px) */
      repeating-radial-gradient(circle at 22% 32%, rgba(255,255,255,.16) 0 0.5px, rgba(255,255,255,0) 1.0px 6px),
      /* sparse medium grains (0.9px) */
      repeating-radial-gradient(circle at 68% 58%, rgba(255,230,200,.10) 0 0.9px, rgba(255,230,200,0) 1.8px 14px),
      /* micro‑speck ultra fine (0.35–0.4px) */
      repeating-radial-gradient(circle at 40% 70%, rgba(255,255,255,.06) 0 0.38px, rgba(255,255,255,0) 0.76px 5px),
      /* single sparkle */
      radial-gradient(2px 2px at 40% 70%, rgba(255,255,255,.12), transparent 60%)
    `,
            backgroundRepeat: 'no-repeat',
            transform: `rotate(${(glitterOpts?.catEye?.angle ?? 0)}deg)`,
            opacity: 0.14,
            filter: 'saturate(1.08) contrast(1.02) blur(0.15px)'
          }}
          animate={glitterOpts?.animateSparkle ? { backgroundPositionX: ['0%','16%'], opacity: [0.12, 0.18, 0.12] } : undefined}
          transition={{ duration: 5.4, ease: [0.25,0.1,0.25,1], repeat: Infinity, repeatType: 'mirror' }}
        />

        {/* Metallic Flakes — dark (Multiply) */}
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{
            mixBlendMode: 'multiply' as const,
            backgroundImage: `
      /* dense fine grains (0.5px) */
      repeating-radial-gradient(circle at 30% 40%, rgba(0,0,0,.08) 0 0.5px, rgba(0,0,0,0) 1.0px 6px),
      /* sparse medium grains (0.9px) */
      repeating-radial-gradient(circle at 60% 55%, rgba(0,0,0,.055) 0 0.9px, rgba(0,0,0,0) 1.8px 14px),
      /* micro‑speck ultra fine (0.35–0.4px) */
      repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,.05) 0 0.36px, rgba(0,0,0,0) 0.72px 5px)
    `,
            backgroundRepeat: 'no-repeat',
            transform: `rotate(${(glitterOpts?.catEye?.angle ?? 0)}deg)`,
            opacity: 0.085,
            filter: 'blur(0.3px)'
          }}
          animate={glitterOpts?.animateSparkle ? { backgroundPositionX: ['0%','-16%'], opacity: [0.07, 0.11, 0.07] } : undefined}
          transition={{ duration: 6.0, ease: [0.25,0.1,0.25,1], repeat: Infinity, repeatType: 'mirror' }}
        />

        {/* Micro-scratches & Dust — subtle texture to avoid plastic look */}
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{
            mixBlendMode: 'soft-light' as const,
            backgroundImage: `
              repeating-linear-gradient(92deg, rgba(255,255,255,.05) 0 0.6px, transparent 0.6px 4px),
              repeating-linear-gradient(10deg, rgba(0,0,0,.04) 0 0.4px, transparent 0.4px 3px)
            `,
            backgroundRepeat: 'repeat',
            opacity: 0.07,
            filter: 'blur(0.25px)'
          }}
          animate={glitterOpts?.animateSparkle ? { backgroundPositionX: ['0px','6px'], opacity: [0.05, 0.09, 0.05] } : undefined}
          transition={{ duration: 8.0, ease: [0.25,0.1,0.25,1], repeat: Infinity, repeatType: 'mirror' }}
        />

        {/* Specular Highlight Shape — elliptical for convex nail */}
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{
            mixBlendMode: 'screen' as const,
            backgroundImage: `radial-gradient(60% 35% at 50% 25%, rgba(255,255,255,0.22), rgba(255,255,255,0) 70%)`,
            filter: 'blur(6px)',
            opacity: 0.45
          }}
          animate={glitterOpts?.catEye?.animate ? { opacity: [0.35, 0.55, 0.35] } : undefined}
          transition={{ duration: 5.5, ease: [0.25,0.1,0.25,1], repeat: Infinity, repeatType: 'mirror' }}
        />

        {/* Ambient Occlusion rim — shadow around nail edges for depth */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            mixBlendMode: 'multiply' as const,
            backgroundImage: `radial-gradient(90% 90% at 50% 60%, rgba(0,0,0,0.22), rgba(0,0,0,0.0) 80%)`,
            filter: 'blur(8px)',
            opacity: 0.25
          }}
        />

        {/* Clearcoat / Top reflection (global, Dynamic Fresnel) */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            mixBlendMode: 'screen' as const,
            // Two scales of rim reflection + a directional glint that rotates with angle
            backgroundImage: `
              radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,0.22), rgba(255,255,255,0) 60%),
              radial-gradient(90% 70% at 50% 110%, rgba(255,255,255,0.16), rgba(255,255,255,0) 55%),
              linear-gradient(100deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%)
            `,
            backgroundRepeat: 'no-repeat',
            // Fresnel-like rim mask: center is weaker, rim is stronger
            WebkitMaskImage: `radial-gradient(85% 85% at 50% 50%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.85) 85%)`,
            maskImage: `radial-gradient(85% 85% at 50% 50%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.85) 85%)`,
            transform: `rotate(${angleCL}deg)`
          }}
          animate={animateSparkle ? {
            // breathe + gently follow pointer center along X
            backgroundPositionX: [posA_CL, posB_CL],
            opacity: [glitterOpts?.catEye?.enabled ? 0.12 : 0.18, 1, glitterOpts?.catEye?.enabled ? 0.12 : 0.18]
          } : undefined}
          transition={{ duration: 6.0, ease: [0.25,0.1,0.25,1], repeat: Infinity, repeatType: 'mirror', repeatDelay: 0.25 }}
        />

        {/* Ambient Occlusion (edges & cuticle) */}
        <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: 'multiply' as const }}>
          <div className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(60% 40% at 50% -10%, rgba(0,0,0,.16), transparent 70%),
                               radial-gradient(40% 60% at -10% 50%, rgba(0,0,0,.12), transparent 70%),
                               radial-gradient(40% 60% at 110% 50%, rgba(0,0,0,.12), transparent 70%)`,
              backgroundRepeat: 'no-repeat',
              opacity: 0.22
            }}
          />
        </div>
        {/* Cat Eye overlay — GALAXY orbit bands (Phase B) */}
        {glitterOpts?.catEye?.enabled && catEyePattern==='galaxy' && (
          (() => {
            const [r, g, b] = hexToRgb(glitterOpts.catEye!.color);
            const intensity = Math.max(0, Math.min(100, glitterOpts.catEye!.intensity ?? 70));
            const alpha = Math.max(0.10, Math.min(0.85, intensity / 100));
            const coreBlur = 1.8 + (intensity * 0.012);
            const centerX = Math.round((glitterOpts?.phys?.ridgeCenter ?? 0.5) * 100);
            const centerY = 52; // keep slightly above center for natural nail curvature
            const ringInnerPct = 44;  // inner edge of ring
            const ringOuterPct = 58;  // outer edge of ring (thickness ≈ 14%)
            const shadowInflate = 4;  // widen shadow trough a bit

            return (
              <motion.div className="absolute inset-0 pointer-events-none"
                style={{ mixBlendMode: 'screen' as const }}
                animate={{ rotate: 360 }}
                transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
              >
                {/* main luminous ring + soft core ridge */}
                <div className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      radial-gradient(60% 60% at ${centerX}% ${centerY}%, rgba(${r},${g},${b},${(alpha * 0.30).toFixed(3)}) ${ringInnerPct}%, transparent ${ringOuterPct}%),
                      radial-gradient(58% 58% at ${centerX}% ${centerY}%, rgba(255,255,255,${(alpha * 0.50).toFixed(3)}) ${ringInnerPct+1}%, transparent ${ringOuterPct-1}%)
                    `,
                    backgroundRepeat: 'no-repeat',
                    filter: `blur(${Math.max(2, coreBlur * 1.4)}px)`
                  }}
                />
                {/* subtle inverted shadow trough to add depth */}
                <div className="absolute inset-0"
                  style={{
                    mixBlendMode: 'multiply' as const,
                    backgroundImage: `radial-gradient(64% 64% at ${centerX}% ${centerY}%, rgba(0,0,0,${(alpha * 0.18).toFixed(3)}) ${ringInnerPct+shadowInflate}%, transparent ${ringOuterPct+shadowInflate}%)`,
                    backgroundRepeat: 'no-repeat',
                    filter: `blur(${Math.max(4, coreBlur * 1.8)}px)`,
                    opacity: 0.95
                  }}
                />
              </motion.div>
            );
          })()
        )}
        {/* Cat Eye overlay (enhanced multi-layer parallax, eased, and shimmer-synced) */}
        {glitterOpts?.catEye?.enabled && catEyePattern!=='galaxy' && (
          <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: 'screen' as const }}>
            {(() => {
              const [r, g, b] = hexToRgb(glitterOpts.catEye!.color);
              const intensity = Math.max(0, Math.min(100, glitterOpts.catEye!.intensity ?? 70));
              const alpha = Math.max(0.10, Math.min(0.85, intensity / 100));
              const spread = 6 + (intensity * 0.08); // px blur
              const coreBlur = 1.8 + (intensity * 0.012);
              const angle = glitterOpts.catEye!.angle ?? 0;
              const angleWobble = 3.5; // องศาแกว่งเล็กน้อยให้ดูเป็นธรรมชาติ
              // Physical param helpers
              const ridgeCenter = (glitterOpts?.phys?.ridgeCenter ?? 0.5);
              const ridgeSigmaPx = (glitterOpts?.phys?.ridgeSigma ?? 12);
              const centerPct = Math.round(ridgeCenter * 100);
              const sweepRange = 8; // tightened: +/- 8% around center for crisper highlight
              const posA = `${Math.max(0, centerPct - sweepRange)}%`;
              const posB = `${Math.min(100, centerPct + sweepRange)}%`;
              // --- Pattern-aware bands ---
              const baseAngle = (catEyePattern === 'diagonal') ? 45 : 90; // straight=90deg (vertical band), diagonal=45deg
              const bandDeg = baseAngle; // we still rotate wrapper by `angle`

              // helpers for radial modes
              const radialCenter = { x: ridgeCenter * 100, y: 50 };
              const ringInner = 40; // %
              const ringOuter = 60; // %

              // Construct gradient strings by pattern
              let colorBand = '';
              let coreBand  = '';
              let innerBand = '';
              let rimShade  = '';

              if(catEyePattern === 'halo'){
                colorBand = `radial-gradient(70% 70% at ${radialCenter.x}% ${radialCenter.y}%, rgba(${r},${g},${b},${alpha * 0.30}) ${ringInner}%, transparent ${ringOuter}%)`;
                coreBand  = `radial-gradient(65% 65% at ${radialCenter.x}% ${radialCenter.y}%, rgba(255,255,255,${alpha * 0.35}) ${ringInner-2}%, transparent ${ringOuter-2}%)`;
                innerBand = `radial-gradient(60% 60% at ${radialCenter.x}% ${radialCenter.y}%, rgba(255,255,255,${alpha * 0.22}) ${ringInner-4}%, transparent ${ringOuter-6}%)`;
                rimShade  = `radial-gradient(75% 75% at ${radialCenter.x}% ${radialCenter.y}%, rgba(0,0,0,${alpha * 0.10}) ${ringInner-1}%, transparent ${ringOuter-1}%)`;
              } else {
                colorBand = `linear-gradient(${bandDeg}deg, transparent 44%, rgba(${r},${g},${b},${alpha}) 50%, transparent 56%)`;
                coreBand  = `linear-gradient(${bandDeg}deg, transparent 42%, rgba(255,255,255,${alpha * 0.60}) 50%, transparent 58%)`;
                innerBand = `linear-gradient(${bandDeg}deg, transparent 40%, rgba(255,255,255,${alpha * 0.40}) 50%, transparent 60%)`;
                rimShade  = `linear-gradient(${bandDeg}deg, rgba(0,0,0,${alpha * 0.10}) 45%, transparent 50%, rgba(0,0,0,${alpha * 0.10}) 55%)`;
              }

              const taperMask = {
                WebkitMaskImage: `radial-gradient(150% 80% at 50% 50%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 75%)`,
                maskImage: `radial-gradient(150% 80% at 50% 50%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 75%)`
              } as React.CSSProperties;
              return (
                <>
                  {/* rotate wrapper: ทำให้แถบเอียงตาม angle และแกว่งเล็กน้อยด้วย timing เดียวกับ shimmer */}
                  <motion.div
                    className="absolute inset-0"
                    animate={glitterOpts.catEye!.animate ? { rotate: [angle - angleWobble, angle + angleWobble] } : undefined}
                    transition={{ duration: 4.8, ease: [0.25, 0.1, 0.25, 1], repeat: Infinity, repeatType: 'mirror', repeatDelay: 0.2 }}
                  >
                    {/* outer color glow / halo */}
                    <div className="absolute -inset-10"
                      style={{ backgroundImage: colorBand, backgroundRepeat: 'no-repeat', filter: `blur(${spread}px)`, ...taperMask }} />

                    {/* subsurface scatter */}
                    <motion.div className="absolute -inset-10"
                      style={{
                        backgroundImage: (catEyePattern==='halo')
                          ? `radial-gradient(55% 55% at ${radialCenter.x}% ${radialCenter.y}%, rgba(255,255,255,${alpha * 0.2}), transparent 70%)`
                          : `radial-gradient(50% 50% at 55% 50%, rgba(255,255,255,${alpha * 0.15}), transparent 70%)`,
                        backgroundRepeat: 'no-repeat',
                        filter: 'blur(10px)',
                        mixBlendMode: 'screen' as const,
                        ...taperMask
                      }}
                      animate={glitterOpts.catEye!.animate ? { opacity: [0.25, 0.45, 0.25] } : undefined}
                      transition={{ duration: 5.2, ease: [0.25, 0.1, 0.25, 1], repeat: Infinity, repeatType: 'mirror', repeatDelay: 0.25 }}
                    />

                    {/* inner soft band — parallax */}
                    <motion.div className="absolute -inset-10"
                      style={{ backgroundImage: innerBand, backgroundRepeat: 'no-repeat', filter: `blur(${Math.max(2, coreBlur * 1.4)}px)`, ...taperMask, backgroundSize: '200% 100%', backgroundPositionX: `${centerPct}%` }}
                      animate={glitterOpts.catEye!.animate ? { backgroundPositionX: [posA, posB] } : undefined}
                      transition={{ duration: 5.0, ease: [0.25, 0.1, 0.25, 1], repeat: Infinity, repeatType: 'mirror', repeatDelay: 0.15 }}
                    />

                    {/* bright core sweep */}
                    <motion.div className="absolute -inset-10"
                      style={{ backgroundImage: coreBand, backgroundRepeat: 'no-repeat', filter: `blur(${coreBlur}px)`, ...taperMask, backgroundSize: '200% 100%', backgroundPositionX: `${centerPct}%` }}
                      animate={glitterOpts.catEye!.animate ? { backgroundPositionX: [posA, posB] } : undefined}
                      transition={{ duration: 4.2, ease: [0.25, 0.1, 0.25, 1], repeat: Infinity, repeatType: 'mirror', repeatDelay: 0.1 }}
                    />

                    {/* inverted shadow troughs */}
                    <div className="absolute -inset-10 pointer-events-none" style={{ mixBlendMode: 'multiply' as const }}>
                      <div className="absolute inset-0"
                        style={{
                          backgroundImage: rimShade,
                          backgroundRepeat: 'no-repeat',
                          filter: 'blur(5px)',
                          WebkitMaskImage: taperMask.WebkitMaskImage, maskImage: taperMask.maskImage,
                          backgroundSize: '200% 100%', backgroundPositionX: `${centerPct}%`
                        }}
                      />
                    </div>

                    {/* reflective top glint */}
                    <motion.div className="absolute -inset-10"
                      style={{
                        background: `linear-gradient(105deg, rgba(255,255,255,.08) 0%, transparent 60%)`,
                        filter: 'blur(2px)',
                        mixBlendMode: 'soft-light' as const
                      }}
                      animate={glitterOpts.catEye!.animate ? { x: ["-120%", "120%"] as any } : undefined}
                      transition={{ duration: 6.0, ease: [0.25, 0.1, 0.25, 1], repeat: Infinity, repeatType: 'mirror', repeatDelay: 0.3 }}
                    />

                    {/* rim shading */}
                    <div className="absolute -inset-10" style={{ backgroundImage: rimShade, backgroundRepeat: 'no-repeat', filter: 'blur(6px)', mixBlendMode: 'multiply' as const }} />

                    {/* CROSS pattern: add secondary orthogonal band */}
                    {catEyePattern==='cross' && (
                      <motion.div className="absolute -inset-10"
                        style={{ backgroundImage: `linear-gradient(0deg, transparent 44%, rgba(255,255,255,${alpha * 0.55}) 50%, transparent 56%)`, backgroundRepeat: 'no-repeat', filter: `blur(${coreBlur * 0.9}px)`, ...taperMask, backgroundSize: '100% 200%', backgroundPositionY: `${centerPct}%`, mixBlendMode: 'screen' as const }}
                        animate={glitterOpts.catEye!.animate ? { backgroundPositionY: [posA, posB] } : undefined}
                        transition={{ duration: 4.6, ease: [0.25, 0.1, 0.25, 1], repeat: Infinity, repeatType: 'mirror', repeatDelay: 0.12 }}
                      />
                    )}
                  </motion.div>

                  {/* OPTIONAL: HALO animation pulse */}
                  {catEyePattern==='halo' && (
                    <motion.div className="absolute inset-0"
                      animate={glitterOpts.catEye!.animate ? { opacity: [0.85, 1, 0.85] } : undefined}
                      transition={{ duration: 4.8, ease: [0.25,0.1,0.25,1], repeat: Infinity, repeatType: 'mirror' }}
                    />
                  )}

                  {/* micro spark glints — ใช้ easing เดียวกัน เบาซอฟต์ */}
                  <div className="absolute inset-0" style={{ mixBlendMode: 'screen' as const }}>
                    {[0, 1, 2].map((k) => (
                      <motion.div
                        key={k}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{
                          top: `${30 + k * 18}%`,
                          left: `${k === 1 ? 45 : k === 2 ? 62 : 28}%`,
                          background: `radial-gradient(circle, rgba(255,255,255,${0.8 - k * 0.2}) 0 45%, rgba(255,255,255,0) 60%)`
                        }}
                        animate={glitterOpts.catEye!.animate ? { x: ["-20%", "20%"], opacity: [0.4, 0.8, 0.4] } : undefined}
                        transition={{ duration: 4.6 + k * 0.3, ease: [0.25, 0.1, 0.25, 1], repeat: Infinity, repeatType: 'mirror', repeatDelay: 0.2 + k * 0.05 }}
                      />
                    ))}
                  </div>

                  {/* ultra subtle grain (static) */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,${alpha * .018}) 0 2px, rgba(255,255,255,0) 2px 4px)`,
                    opacity: 0.45,
                    mixBlendMode: 'screen' as const
                  }} />
                </>
              );
            })()}
          </div>
        )}
        {/* Constellation sparkle on selected finger (use symbolFinger as target) */}
        {glitterStyle==='constellation' && i=== (glitterOpts?.symbolFinger ?? 1) && (
          <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: 'screen' as const }}>
            {constellationPoints(glitterOpts?.zodiacSign).map((p,idx)=> (
              <motion.div key={idx}
                className="absolute text-[14px]"
                style={{ top: `${p[0]}%`, left: `${p[1]}%`, opacity: .9 }}
                animate={glitterOpts?.animateSparkle ? { opacity: [0.6,1,0.6] } : undefined}
                transition={glitterOpts?.animateSparkle ? { duration: 2.4, ease: 'easeInOut', repeat: Infinity } : undefined}
              >✦</motion.div>
            ))}
          </div>
        )}

        {/* Zodiac symbol on selected finger */}
        {glitterStyle==='zodiac' && i=== (glitterOpts?.symbolFinger ?? 1) && (
          <motion.div className="absolute inset-0 pointer-events-none flex items-center justify-center"
            initial={{ scale: .9, opacity: .85 }} animate={{ scale: 1, opacity: .95 }} transition={{ duration: .4, ease: [0.22,0.61,0.36,1] }}
            style={{ mixBlendMode: 'screen' as const }}>
            <div className="text-[28px] md:text-[30px] drop-shadow-[0_2px_6px_rgba(0,0,0,.25)]/80">
              {zodiacGlyph[(glitterOpts?.zodiacSign||'').toLowerCase()] || '♈'}
            </div>
          </motion.div>
        )}

        {/* Elemental Dust overlay (uses elementHint color) */}
        {glitterStyle==='dust' && (
          <div className="absolute inset-0 pointer-events-none" style={buildGlitterOverlay(glitterLevel, 'dust', elementHint).base || undefined} />
        )}

        {/* Symbol sparkles on selected finger */}
        {glitterStyle==='symbol' && i===symbolFinger && (
          <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: "screen" as const }}>
            <div className="absolute text-[16px] top-[20%] left-[22%] opacity-90">✦</div>
            <div className="absolute text-[12px] top-[55%] left-[65%] opacity-85">✧</div>
            <div className="absolute text-[14px] top-[70%] left-[35%] opacity-85">{topic==='love'?"♥":"★"}</div>
          </div>
        )}
      </div>
      <div className="text-xs text-[#6b6570]">{labels[i]}</div>
    </div>
  ));
}