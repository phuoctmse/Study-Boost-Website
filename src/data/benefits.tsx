import { FiBarChart2, FiBriefcase, FiDollarSign, FiLock, FiPieChart, FiShield, FiTarget, FiTrendingUp, FiUser, FiClock, FiMessageSquare, FiAward, FiCalendar, FiBookOpen, FiActivity, FiUsers } from "react-icons/fi";

import { IBenefit } from "@/types"

export const benefits: IBenefit[] = [
    {
        title: "Học tập thông minh với AI",
        description: "Tối ưu hóa việc học của bạn với trợ lý AI thông minh, giúp bạn hiểu sâu hơn và học hiệu quả hơn.",
        bullets: [
            {
                title: "Trợ lý AI cá nhân",
                description: "Chat với AI để được giải đáp thắc mắc và hướng dẫn học tập 24/7.",
                icon: <FiMessageSquare size={26} />
            },
            {
                title: "Phân tích học tập",
                description: "Nhận phản hồi chi tiết và đề xuất cải thiện từ AI.",
                icon: <FiMessageSquare size={26} />
            },
            {
                title: "Nội dung tương tác",
                description: "Học thông qua các bài tập và quiz được cá nhân hóa.",
                icon: <FiBookOpen size={26} />
            }
        ],
        imageSrc: "/images/customize-schedule.png"
    },
    {
        title: "Quản lý thời gian hiệu quả",
        description: "Tối ưu hóa thời gian học tập với phương pháp Pomodoro và các công cụ theo dõi tiến độ.",
        bullets: [
            {
                title: "Pomodoro Timer",
                description: "Tập trung học tập với chu kỳ làm việc và nghỉ ngơi khoa học.",
                icon: <FiClock size={26} />
            },
            {
                title: "Lịch học thông minh",
                description: "Lập kế hoạch và nhắc nhở tự động cho các mục tiêu học tập.",
                icon: <FiCalendar size={26} />
            },
            {
                title: "Theo dõi tiến độ",
                description: "Xem thống kê chi tiết về thời gian học và hiệu suất.",
                icon: <FiActivity size={26} />
            }
        ],
        imageSrc: "/images/pomodoro.png"
    },
    {
        title: "Cộng đồng học tập sôi động",
        description: "Tham gia vào cộng đồng học tập năng động, thi đua và chia sẻ kiến thức.",
        bullets: [
            {
                title: "Xếp hạng người dùng",
                description: "Thi đua với người học khác thông qua bảng xếp hạng.",
                icon: <FiAward size={26} />
            },
            {
                title: "Học nhóm",
                description: "Tạo và tham gia các nhóm học tập cùng sở thích.",
                icon: <FiUsers size={26} />
            },
            {
                title: "Thành tích & Huy hiệu",
                description: "Nhận thưởng và huy hiệu khi đạt được các mục tiêu học tập.",
                icon: <FiTarget size={26} />
            }
        ],
        imageSrc: "/images/Leaderboard.png"
    },
]