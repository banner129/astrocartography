import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { Star } from "lucide-react";

export default function HappyUsers() {
  // 只使用存在的头像图片（1.png 到 6.png，显示前 5 个）
  const avatarImages = [1, 2, 3, 4, 5].map(num => `/imgs/users/${num}.png`);
  
  return (
    <div className="mx-auto mt-8 flex w-fit flex-col items-center gap-2 sm:flex-row">
      <span className="mx-4 inline-flex items-center -space-x-2">
        {avatarImages.map((src, index) => (
          <Avatar className="size-12 border" key={index}>
            <AvatarImage
              src={src}
              alt={`Happy user ${index + 1}`}
            />
          </Avatar>
        ))}
      </span>
      <div className="flex flex-col items-center gap-1 md:items-start">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className="size-5 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
        <p className="text-left font-medium text-muted-foreground">
          from 99+ happy users
        </p>
      </div>
    </div>
  );
}
