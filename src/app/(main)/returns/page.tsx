import InfoPage from "@/components/common/InfoPage";

const sections = [
  {
    title: "Điều kiện đổi trả",
    items: [
      "Sản phẩm còn nguyên trạng theo điều kiện áp dụng",
      "Yêu cầu trong thời hạn cho phép của từng đơn",
      "Có bằng chứng mua hàng hợp lệ",
    ],
  },
  {
    title: "Quy trình",
    items: [
      "Tạo yêu cầu trong Hồ sơ > Đơn hàng",
      "Chờ xác nhận từ shop/hệ thống",
      "Gửi hàng hoàn và theo dõi trạng thái xử lý",
    ],
  },
];

export default function ReturnsPage() {
  return (
    <InfoPage
      title="Chính sách đổi trả"
      description="Điều kiện và quy trình đổi/trả hàng sau khi nhận đơn."
      updatedAt="23/02/2026"
      sections={sections}
    />
  );
}
