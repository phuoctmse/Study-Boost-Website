import { IMenuItem, ISocials } from "@/types";

export const footerDetails: {
  subheading: string;
  quickLinks: IMenuItem[];
  email: string;
  telephone: string;
  socials: ISocials;
} = {
  subheading: "Trao sức mạnh cho học tập với trợ lý AI và lịch học thông minh.",
  quickLinks: [
    {
      text: "Tính năng",
      url: "#features",
    },
    {
      text: "Bảng giá",
      url: "#pricing",
    },
    {
      text: "Đánh giá",
      url: "#testimonials",
    },
  ],
  email: "studyboost@gmail.com",
  telephone: "+1 (123) 456-7890",
  socials: {
    // github: 'https://github.com',
    // x: 'https://twitter.com/x',
    twitter: "https://twitter.com/Twitter",
    facebook: "https://www.facebook.com/studyboost",
    // youtube: 'https://youtube.com',
    linkedin: "https://www.linkedin.com",
    // threads: 'https://www.threads.net',
    instagram: "https://www.instagram.com",
  },
};
