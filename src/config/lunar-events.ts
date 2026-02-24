export interface LunarEvent {
  day: number;
  month: number;
  name: string;
  isHoliday?: boolean;
}

export const LUNAR_EVENTS: LunarEvent[] = [
  { day: 1, month: 1, name: "Tết Nguyên Đán", isHoliday: true },
  { day: 10, month: 3, name: "Giỗ Tổ Hùng Vương", isHoliday: true },
  { day: 5, month: 3, name: "Kỵ bố" },
  { day: 7, month: 4, name: "Kỵ bác Hùng" },
  { day: 9, month: 7, name: "Chạp mộ" },
  { day: 10, month: 7, name: "Chạp mộ" },
  { day: 11, month: 7, name: "Chạp mộ" },
  { day: 23, month: 7, name: "Kỵ cố nội ông" },
  { day: 27, month: 7, name: "Kỵ ông nội" },
  { day: 27, month: 8, name: "Kỵ cố ngoại bà" },
  { day: 6, month: 9, name: "Kỵ bà nội" },
  { day: 26, month: 9, name: "Kỵ bác Dũng" },
  { day: 6, month: 11, name: "Kỵ o Nguyệt" },
  { day: 30, month: 11, name: "Kỵ mụ cô bà Út" },
  { day: 28, month: 12, name: "Kỵ cố nội bà" },
];
