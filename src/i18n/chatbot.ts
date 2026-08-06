// Lightweight i18n dictionary for chatbot widget.
// Chỉ chứa các string chatbot cần; phần còn lại dùng tiếng Việt cố định.

import { useMemo } from 'react';

export const DICTIONARIES = {
  vi: {
    ready: 'Mia sẵn sàng hỗ trợ',
    close: 'Đóng',
    assistant: 'Mia - Trợ lý AI',
    subtitle: 'Hỗ trợ mua sắm',
    welcome: 'Em là trợ lý mua sắm AI, có thể giúp bạn tìm kiếm sản phẩm, tư vấn thời trang, hoặc trả lời các câu hỏi về đơn hàng.',
    placeholder: 'Nhập tin nhắn...',
    quickFind: 'Tìm sản phẩm',
    quickSale: 'Khuyến mãi',
    quickBest: 'Bán chạy',
    quickFashion: 'Thời trang',
    queryFind: 'Tìm sản phẩm',
    querySale: 'Sản phẩm đang giảm giá',
    queryBest: 'Sản phẩm bán chạy nhất',
    queryFashion: 'Gợi ý thời trang',
    timeout: '⚠️ Phản hồi quá lâu, vui lòng thử lại.',
    networkError: 'Xin lỗi, không thể kết nối. Vui lòng thử lại!',
    stop: 'Dừng',
    regenerate: 'Tạo lại',
    copy: 'Sao chép',
    copied: 'Đã sao chép',
    feedbackThanks: 'Cảm ơn phản hồi của anh/chị!',
    feedbackFail: 'Không thể gửi phản hồi',
    retry: 'Thử lại',
    clearChat: 'Làm mới',
    dialogLabel: 'Mia - AI Chat Assistant',
    closeDialogLabel: 'Đóng Mia - Trợ lý AI',
  },
  en: {
    ready: 'Mia is ready to help',
    close: 'Close',
    assistant: 'Mia - AI Assistant',
    subtitle: 'Shopping support',
    welcome: 'I am your AI shopping assistant. I can help you find products, give fashion advice, or answer order questions.',
    placeholder: 'Type a message...',
    quickFind: 'Find products',
    quickSale: 'On sale',
    quickBest: 'Bestsellers',
    quickFashion: 'Fashion',
    queryFind: 'Find products',
    querySale: 'Products on sale',
    queryBest: 'Bestselling products',
    queryFashion: 'Fashion suggestions',
    timeout: '⚠️ Response took too long, please try again.',
    networkError: 'Sorry, cannot connect. Please try again!',
    stop: 'Stop',
    regenerate: 'Regenerate',
    copy: 'Copy',
    copied: 'Copied',
    feedbackThanks: 'Thanks for your feedback!',
    feedbackFail: 'Could not send feedback',
    retry: 'Retry',
    clearChat: 'Refresh',
    dialogLabel: 'Mia - AI Chat Assistant',
    closeDialogLabel: 'Close Mia - AI Assistant',
  },
};

export const SUPPORTED_LANGUAGES = ['vi', 'en'];

const detectLanguage = () => {
  if (typeof navigator === 'undefined') return 'vi';
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : 'vi';
};

export const useT = (lang: string = detectLanguage()) =>
  useMemo(() => {
    if (lang in DICTIONARIES) {
      return DICTIONARIES[lang as keyof typeof DICTIONARIES];
    }
    return DICTIONARIES.vi;
  }, [lang]);
