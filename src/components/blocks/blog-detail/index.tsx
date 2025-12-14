"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";

import Crumb from "./crumb";
import Markdown from "@/components/markdown";
import { Post } from "@/types/post";
import moment from "moment";
import { Card } from "@/components/ui/card";

export default function BlogDetail({ post }: { post: Post }) {
  return (
    <section className="py-16">
      <div className="container flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <div className="flex justify-center">
            <Crumb post={post} />
          </div>
          <h1 className="mb-7 mt-9 max-w-3xl mx-auto text-center text-2xl font-bold md:mb-10 md:text-4xl">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm md:text-base bg-background">
            {post.author_avatar_url && (
              <Avatar className="h-8 w-8 border">
                <AvatarImage
                  src={post.author_avatar_url}
                  alt={post.author_name}
                />
              </Avatar>
            )}
            <div>
              {post.author_name && (
                <span className="font-medium">{post.author_name}</span>
              )}

              <span className="ml-2 text-muted-foreground">
                on {post.created_at && moment(post.created_at).fromNow()}
              </span>
            </div>
          </div>
          <div className="relative py-8 flex justify-center">
            {post.content && (
              <Card className="w-full max-w-4xl px-4">
                <Markdown content={post.content} />
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
