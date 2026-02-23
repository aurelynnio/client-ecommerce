import InfoPage from "@/components/common/InfoPage";

const sections = [
  {
    title: "Dữ liệu thu thập",
    items: [
      "Thông tin tài khoản: tên, email, số điện thoại",
      "Thông tin đơn hàng và lịch sử giao dịch",
      "Thông tin thiết bị/cookie phục vụ trải nghiệm",
    ],
  },
  {
    title: "Mục đích sử dụng",
    items: [
      "Xử lý đơn hàng và hỗ trợ khách hàng",
      "Cải thiện chất lượng dịch vụ",
      "Bảo mật tài khoản và phòng chống gian lận",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Chính sách bảo mật"
      description="Chính sách xử lý dữ liệu cá nhân và quyền riêng tư của người dùng."
      updatedAt="23/02/2026"
      sections={sections}
    />
  );
}
