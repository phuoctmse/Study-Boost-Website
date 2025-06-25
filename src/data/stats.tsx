import { BsBarChartFill, BsFillStarFill, BsFillClockFill } from "react-icons/bs";
import { PiGlobeFill, PiUsersFill, PiBrainFill } from "react-icons/pi";

import { IStats } from "@/types";

export const stats: IStats[] = [
    {
        title: "1k+",
        icon: <PiUsersFill size={34} className="text-blue-500" />,
        description: "Học viên đang sử dụng StudyBoost để cải thiện việc học tập mỗi ngày."
    },
    {
        title: "4.9",
        icon: <BsFillStarFill size={34} className="text-yellow-500" />,
        description: "Đánh giá trung bình từ người dùng trên các kho ứng dụng."
    },
    {
        title: "1k+",
        icon: <BsFillClockFill size={34} className="text-green-600" />,
        description: "Phiên Pomodoro đã hoàn thành, giúp người học tập trung và hiệu quả hơn."
    }
];