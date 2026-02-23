import InfoPage from "@/components/common/InfoPage";

const sections = [
  {
    title: "Nguyên tắc chung",
    items: [
      "Người dùng chịu trách nhiệm với thông tin tài khoản của mình",
      "Không sử dụng nền tảng cho mục đích gian lận hoặc vi phạm pháp luật",
      "Tôn trọng quy định về thanh toán, giao nhận và hoàn tiền",
    ],
  },
  {
    title: "Giới hạn trách nhiệm",
    items: [
      "Nền tảng có thể tạm ngừng dịch vụ để bảo trì",
      "Một số tính năng có thể thay đổi theo từng giai đoạn",
      "Tranh chấp sẽ được xử lý theo quy trình hỗ trợ khách hàng",
    ],
  },
];

export default function TermsPage() {
  return (
    <InfoPage
      title="Điều khoản sử dụng"
      description="Điều khoản áp dụng khi truy cập và sử dụng nền tảng mua sắm."
      updatedAt="23/02/2026"
      sections={sections}
    />
  );
}
