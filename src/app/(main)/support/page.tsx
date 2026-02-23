import InfoPage from "@/components/common/InfoPage";

const sections = [
  {
    title: "Cách liên hệ",
    items: [
      "Hotline: 1900-6868 (08:00 - 22:00)",
      "Email: support@store.local",
      "Mục Trợ giúp trong tài khoản cá nhân",
    ],
  },
  {
    title: "Thông tin cần chuẩn bị",
    items: [
      "Mã đơn hàng hoặc email tài khoản",
      "Ảnh/chứng từ liên quan nếu có",
      "Mô tả ngắn gọn vấn đề cần hỗ trợ",
    ],
  },
];

export default function SupportPage() {
  return (
    <InfoPage
      title="Trung tâm hỗ trợ"
      description="Kênh hỗ trợ khách hàng cho các vấn đề về đơn hàng, thanh toán, hoàn tiền và tài khoản."
      updatedAt="23/02/2026"
      sections={sections}
    />
  );
}
