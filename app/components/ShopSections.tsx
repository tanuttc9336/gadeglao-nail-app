// app/components/ShopSections.tsx — ส่วนร้าน: เมนูราคา · เลือกตามความรู้สึก · มาตรฐาน · วิธีมา · CTA
// ยุบมาจาก shop.html เดิม ให้เว็บลูกค้าเหลือตัวเดียว
"use client";

import { useState } from "react";

const LINE_URL = "https://line.me/R/oaMessage/@gadeglao/?สวัสดีค่ะ%20สนใจจองคิวค่ะ%20🌸"; // TODO: ใส่ LINE ID จริง

const MOODS: Record<string, { icon: string; title: string; sub: string; items: [string, string, string, string][] }> = {
  rest: { icon: "🍵", title: "อยากพักจริงๆ", sub: "เหนื่อยมาทั้งอาทิตย์ ขอชั่วโมงของตัวเอง",
    items: [
      ["🖐", "[L'occitane] สปามือ+เท้า", "นวด ขัด บำรุง — ชั่วโมงที่เป็นของคุณจริงๆ", "1,250"],
      ["🦶", "[Victoria] สปาเท้า", "ยืนมาทั้งวัน เท้าไม่ได้เลิกงานพร้อมเรา", "550"],
      ["💆‍♀️", "[L'occitane] แฮร์สปา", "ผ่อนคลายตั้งแต่หนังศีรษะ", "1,000"],
    ] },
  event: { icon: "💍", title: "มีงานสำคัญ", sub: "งานบุญ งานแต่ง รับปริญญา ต้องสวยพอดีวัน",
    items: [
      ["💅", "ตัดหนัง+ทาสีเจล (มือ)", "สีติดทน — แนะนำทำ 2-3 วันก่อนงาน", "350"],
      ["👑", "ตัดหนัง+ทาสีเจล (มือ+เท้า)", "ครบทั้งมือเท้าในรอบเดียว", "650"],
      ["✨", "ต่อพีวีซี (10 นิ้ว)", "ทรงสวยยาวพอดี ถ่ายรูปมุมไหนก็สวย", "350"],
    ] },
  pretty: { icon: "💅", title: "อยากเล็บสวย", sub: "เปลี่ยนสี เปลี่ยนลุค ให้มือดูดีทุกวัน",
    items: [
      ["💅", "ตัดหนัง+ทาสีเจล (มือ)", "เมนูขายดีที่สุดของร้าน", "350"],
      ["🫧", "[ลูกแก้ว] มือ", "เงาวิ้งเหมือนกระจก กำลังฮิต", "150"],
      ["🎀", "[เพ้นท์] เฟร้นปลาย", "เรียบหรู ไปได้ทุกงาน", "100"],
    ] },
  care: { icon: "🌾", title: "มือเท้าทำงานหนัก", sub: "ยืนทั้งวัน มือหยาบ ส้นแตก อยากฟื้นฟู",
    items: [
      ["🌾", "ตัดหนังทำความสะอาด (มือ)", "จัดระเบียบมือใหม่ สะอาดสบาย", "150"],
      ["🦶", "[Thai] สปาเท้า", "สูตรสมุนไพรไทย ฟื้นเท้าที่ทำงานหนัก", "550"],
      ["💎", "เสริมบำรุงหน้าเล็บ", "เล็บบางเปราะ กลับมาแข็งแรง ยาวได้ไม่หัก", "400"],
    ] },
};

const MENU: Record<string, [string, number, boolean][]> = {
  "ทำเล็บ": [["ตัดหนัง+ทาสีเจล (มือ)", 350, true], ["ตัดหนัง+ทาสีเจล (เท้า)", 450, false],
    ["ตัดหนัง+ทาสีเจล (มือ+เท้า)", 650, false], ["[ลูกแก้ว] มือ", 150, true],
    ["[ขัดผงมุก/กระจก] มือ", 100, false], ["ต่อพีวีซี (10 นิ้ว)", 350, true],
    ["[เพ้นท์] เฟร้นปลาย", 100, false], ["เสริมบำรุงหน้าเล็บ", 400, false],
    ["ถอดสี (มือ)", 100, false], ["ตัดหนังทำความสะอาด (มือ)", 150, false]],
  "สปา": [["[Victoria] สปาเท้า", 550, true], ["[L'occitane] สปาเท้า", 750, false],
    ["[Thai] สปาเท้า", 550, false], ["[Victoria] สปามือ+เท้า", 850, false],
    ["[L'occitane] สปามือ+เท้า", 1250, true], ["[Jomalone] สปาเท้า", 950, false]],
  "ผม": [["สระไดร์ผมสั้น", 100, false], ["สระไดร์ปกติ", 200, false], ["สระไดร์ผมยาว", 250, true],
    ["ตัดสระซอยเซต", 350, false], ["[L'occitane] แฮร์สปา", 1000, true],
    ["ปิดผมขาวโคนสีน้ำตาล (ฟรีบำรุง)", 500, false], ["ย้อมสีผมสั้น", 800, false]],
  "ขนตา": [["ลิฟติ้งขนตา", 850, true], ["ต่อขนตา (แบบ B)", 850, false],
    ["ลิฟติ้งขนตา + ทินท์", 1250, false], ["ลิฟติ้งขนคิ้ว", 1250, false]],
  "หน้า": [["กดสิว+ผลักวิตามิน+อบแสง+มาร์ค", 650, true], ["กดสิวดูดสิวผลักวิตามิน", 350, false],
    ["[Estee Lauder] นวดหน้า", 1250, false]],
};

const STANDARDS: [string, string, string][] = [
  ["✂️", "แกะซองอุปกรณ์ต่อหน้าคุณทุกครั้ง", "กฎหมายไม่ได้บังคับให้ร้านทำเล็บมีเครื่องอบฆ่าเชื้อ — แต่ร้านเรามี"],
  ["🏷", "ตะไบส่วนตัว เขียนชื่อของคุณ", "ของใครของมัน ไม่ปนกัน"],
  ["🛡", "รับประกันแก้ฟรี 7 วัน", "สีบิ่น หลุด ไม่พอใจ — กลับมาแก้ให้ฟรี ไม่มีเงื่อนไขซ่อน"],
  ["🤫", "เรื่องเล่าของคุณจบที่ร้าน", "ที่นี่ไม่มีวัฒนธรรมเมาท์ลูกค้า — นั่งพัก ระบาย ปล่อยใจได้เต็มที่"],
];

const card = "bg-white/70 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.08)] p-5";

export default function ShopSections() {
  const [mood, setMood] = useState<keyof typeof MOODS>("rest");
  const [cat, setCat] = useState<keyof typeof MENU>("ทำเล็บ");

  return (
    <div id="shop" className="mt-8 space-y-5 pb-28">
      {/* เลือกตามความรู้สึก */}
      <section className={card}>
        <h2 className="text-lg font-bold">🧭 วันนี้อยากให้เราดูแลแบบไหนคะ</h2>
        <p className="text-sm opacity-70 mt-1">ไม่ต้องรู้ชื่อบริการ — เลือกจากความรู้สึกได้เลย</p>
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          {(Object.keys(MOODS) as (keyof typeof MOODS)[]).map(k => (
            <button key={k} onClick={() => setMood(k)}
              className={`text-left rounded-xl border p-3 transition ${mood === k ? "border-[#FF8FB1] bg-gradient-to-br from-[#fff0f6] to-white" : "border-[#eee] bg-white"}`}>
              <div className="text-2xl">{MOODS[k].icon}</div>
              <div className="font-bold text-sm mt-1">{MOODS[k].title}</div>
              <div className="text-[11px] opacity-60 leading-snug mt-0.5">{MOODS[k].sub}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 divide-y divide-dashed divide-[#eee]">
          {MOODS[mood].items.map(([ic, nm, why, pr]) => (
            <div key={nm} className="flex items-center gap-3 py-3">
              <div className="text-xl">{ic}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{nm}</div>
                <div className="text-[11.5px] opacity-60">{why}</div>
              </div>
              <b className="text-[#c2497a] tabular-nums">฿{pr}</b>
            </div>
          ))}
        </div>
      </section>

      {/* เมนูราคา */}
      <section className={card}>
        <h2 className="text-lg font-bold">📖 เมนูและราคา — ชัดทุกรายการ</h2>
        <p className="text-sm opacity-70 mt-1">เราบอกราคาตรงไปตรงมา ไม่มี &ldquo;ทักแชทถามราคา&rdquo; ค่ะ</p>
        <div className="flex gap-2 overflow-x-auto mt-4 pb-1 [scrollbar-width:none]">
          {(Object.keys(MENU) as (keyof typeof MENU)[]).map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${cat === c ? "bg-[#FF8FB1] border-[#FF8FB1] text-white" : "border-[#eee] bg-white opacity-70"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="mt-2 divide-y divide-dashed divide-[#eee]">
          {MENU[cat].map(([nm, pr, hot]) => (
            <div key={nm} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0 font-semibold text-sm">
                {nm}
                {hot && <span className="ml-2 align-middle text-[10px] font-bold text-[#8a6f12] bg-[#faf3dd] rounded-full px-2 py-0.5">ขายดี</span>}
              </div>
              <b className="text-[#c2497a] tabular-nums">฿{pr.toLocaleString()}</b>
            </div>
          ))}
        </div>
      </section>

      {/* มาตรฐาน */}
      <section className={card}>
        <h2 className="text-lg font-bold">🧼 มาตรฐานที่เราไม่ลดให้ใคร</h2>
        <div className="mt-2 divide-y divide-dashed divide-[#eee]">
          {STANDARDS.map(([ic, t, s]) => (
            <div key={t} className="flex items-start gap-3 py-3">
              <div className="text-xl">{ic}</div>
              <div>
                <div className="font-bold text-sm">{t}</div>
                <div className="text-[12px] opacity-60 leading-relaxed">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* วิธีมา */}
      <section className={`${card} bg-gradient-to-br from-[#f4f7f2] to-white`}>
        <h2 className="text-lg font-bold">🚗 วิธีมาร้าน (อ่านก่อน ขำก่อน)</h2>
        <p className="mt-2 font-semibold leading-relaxed">
          ลูกค้าเก่าบอกต่อกันว่า &ldquo;ต้องขับเลยหนึ่งครั้ง ถึงจะมาถูก&rdquo; 😅<br />
          ไม่เป็นไรค่ะ ขับเลยแล้ววนกลับมา เราอยู่ตรงนี้เสมอ
        </p>
        <p className="text-sm opacity-70 mt-2">อ.บึงสามพัน จ.เพชรบูรณ์ · ร้านหน้าตาเรียบๆ แต่ข้างในใจดีมากค่ะ</p>
        <a href="https://www.google.com/maps/search/เกศเกล้า+บึงสามพัน" target="_blank" rel="noopener noreferrer"
          className="block text-center mt-3 rounded-full border-2 border-[#FFC2D4] bg-white py-3 font-bold text-[#c2497a]">
          📍 เปิดแผนที่นำทาง
        </a>
      </section>

      {/* footer */}
      <footer className="text-center text-xs opacity-60 leading-loose pt-2">
        <div className="font-bold text-[#c2497a]">เกศเกล้า บึงสามพัน · Gadeglao</div>
        เล็บ · สปามือเท้า · ผม · ขนตา<br />
        &ldquo;มือคู่นี้สร้างทุกอย่างมา — ให้เราดูแลมันบ้างนะคะ&rdquo;<br />
        <a href="../" className="opacity-60 underline">สำหรับทีมงานร้าน · เข้าระบบ</a>
      </footer>

      {/* CTA ติดล่าง */}
      <div className="fixed left-0 right-0 bottom-0 px-5 pb-4 pt-8 bg-gradient-to-t from-[#FFF7FB] via-[#FFF7FB]/90 to-transparent z-50">
        <a href={LINE_URL}
          className="block max-w-md mx-auto text-center rounded-full py-4 font-bold text-white text-base bg-gradient-to-r from-[#FF8FB1] to-[#B79EE8] shadow-[0_8px_26px_rgba(255,143,177,.5)]">
          💬 ทักไลน์ จองคิว / ถามได้ทุกเรื่อง
        </a>
      </div>
    </div>
  );
}
