import { IFAQ } from "@/types";
import { siteDetails } from "./siteDetails";

export const faqs: IFAQ[] = [
    {
        question: `${siteDetails.siteName} có an toàn không?`,
        answer: 'Hoàn toàn. Chúng tôi sử dụng mã hóa dữ liệu của bạn và không bao giờ lưu thông tin đăng nhập của bạn. Ngoài ra, việc xác thực sinh trắc học thêm một lớp bảo vệ bổ sung.',
    },
    {
        question: `Tôi có thể sử dụng ${siteDetails.siteName} trên nhiều thiết bị không?`,
        answer: `Hoàn toàn! Tài khoản ${siteDetails.siteName} của bạn được đồng bộ mượt mà trên tất cả các thiết bị của bạn - smartphone, tablet và máy tính.`,
    },
    {
        question: `${siteDetails.siteName} là gì?`,
        answer: `${siteDetails.siteName} là một ứng dụng giúp quản lý học tập cá nhân hóa, tích hợp tính năng chat AI, xếp hạng người dùng và phương pháp Pomodoro để tối ưu hóa thời gian học tập của bạn.`,
    },
    {
        question: 'Nếu tôi cần giúp đỡ khi sử dụng ứng dụng thì sao?',
        answer: 'Đội ngũ hỗ trợ tận tâm của chúng tôi có sẵn 24/7 qua chat hoặc email. Thêm vào đó, chúng tôi cung cấp nhiều hướng dẫn trong ứng dụng và một cơ sở kiến thức toàn diện để giúp bạn tận dụng tối đa StudyBoost.'
    }
];