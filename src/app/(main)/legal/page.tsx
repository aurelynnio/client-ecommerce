import InfoPage from "@/components/common/InfoPage";

const sections = [
  {
    title: "Tuân thủ",
    items: [
      "Tuân thủ quy định thương mại điện tử hiện hành",
      "Tuân thủ quy định về bảo vệ dữ liệu cá nhân",
      "Tuân thủ quy định về thanh toán điện tử",
    ],
  },
  {
    title: "Liên hệ pháp lý",
    items: [
      "Email: legal@store.local",
      "Vui lòng ghi rõ nội dung và tài liệu liên quan",
      "Yêu cầu sẽ được phản hồi theo SLA nội bộ",
    ],
  },
];

export default function LegalPage() {
  return (
    <InfoPage
      title="Pháp lý"
      description="Các thông tin pháp lý và quy định tuân thủ của nền tảng."
      updatedAt="23/02/2026"
      sections={sections}
    />
  );
}
