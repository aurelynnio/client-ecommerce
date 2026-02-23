import InfoPage from "@/components/common/InfoPage";

const sections = [
  {
    title: "Cookie được sử dụng để",
    items: [
      "Duy trì trạng thái đăng nhập",
      "Ghi nhớ tùy chọn giao diện và tìm kiếm gần đây",
      "Đo lường hiệu năng và chất lượng dịch vụ",
    ],
  },
  {
    title: "Quản lý cookie",
    items: [
      "Bạn có thể xóa hoặc chặn cookie trong trình duyệt",
      "Một số chức năng có thể hoạt động hạn chế khi tắt cookie",
      "Chính sách có thể cập nhật theo thay đổi hệ thống",
    ],
  },
];

export default function CookiesPage() {
  return (
    <InfoPage
      title="Chính sách Cookie"
      description="Thông tin về việc sử dụng cookie để cải thiện trải nghiệm người dùng."
      updatedAt="23/02/2026"
      sections={sections}
    />
  );
}
