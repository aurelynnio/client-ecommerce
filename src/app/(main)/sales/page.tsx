import InfoPage from "@/components/common/InfoPage";

const sections = [
  {
    title: "Chính sách bán hàng",
    items: [
      "Giá và tình trạng sản phẩm hiển thị tại thời điểm đặt hàng",
      "Đơn hàng có thể bị hủy nếu vi phạm điều kiện thanh toán",
      "Phí vận chuyển được tính theo địa chỉ và phương thức giao",
    ],
  },
  {
    title: "Hoàn tiền",
    items: [
      "Hoàn tiền theo phương thức thanh toán ban đầu khi đủ điều kiện",
      "Thời gian xử lý tùy ngân hàng/cổng thanh toán",
      "Liên hệ hỗ trợ nếu quá thời gian cam kết",
    ],
  },
];

export default function SalesPage() {
  return (
    <InfoPage
      title="Bán hàng và hoàn tiền"
      description="Thông tin về chính sách bán hàng, đổi trả và hoàn tiền."
      updatedAt="23/02/2026"
      sections={sections}
    />
  );
}
