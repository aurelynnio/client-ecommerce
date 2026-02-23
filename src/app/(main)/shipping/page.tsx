import InfoPage from "@/components/common/InfoPage";

const sections = [
  {
    title: "Thời gian giao hàng",
    items: [
      "Thời gian phụ thuộc khu vực nhận hàng",
      "Đơn có thể giao nhiều kiện nếu từ nhiều shop",
      "Ngày lễ/tết có thể ảnh hưởng tiến độ",
    ],
  },
  {
    title: "Lưu ý khi nhận hàng",
    items: [
      "Kiểm tra tình trạng gói hàng khi nhận",
      "Liên hệ ngay hỗ trợ nếu có bất thường",
      "Giữ lại hóa đơn/chứng từ để đối soát",
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <InfoPage
      title="Chính sách vận chuyển"
      description="Thông tin giao hàng, thời gian dự kiến và cách xử lý tình huống giao nhận."
      updatedAt="23/02/2026"
      sections={sections}
    />
  );
}
