import { ArrowRight } from "lucide-react";
import { Blog as BlogType } from "@/types/blocks/blog";

export default function Blog({ blog }: { blog: BlogType }) {
  if (blog.disabled) {
    return null;
  }

  return (
    <section className="w-full py-16">
      <div className="container flex flex-col items-center gap-8 lg:px-16">
        <div className="text-center w-full">
          <p className="mb-6 text-xs font-medium uppercase tracking-wider">
            {blog.label}
          </p>
          <div className="w-full text-center">
            <h2 className="mb-3 text-pretty text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6 lg:text-5xl">
              {blog.title}
            </h2>
          </div>
          <div className="w-full text-center">
            <p className="mb-8 text-muted-foreground md:text-base lg:text-lg">
              {blog.description}
            </p>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {blog.items?.map((item, idx) => (
              <a
                key={idx}
                href={item.url || `/${item.locale}/posts/${item.slug}`}
                target={item.target || "_self"}
                className="group block"
                style={{ textAlign: 'center' }}
              >
                <div className="h-full overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg">
                  {item.cover_url && (
                    <div className="relative aspect-[3/2] w-full overflow-hidden">
                      <img
                        src={item.cover_url}
                        alt={item.title || ""}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 md:p-5">
                    <div className="w-full text-center">
                      <h3 className="mb-2 text-base font-semibold md:mb-3 md:text-lg">
                        {item.title}
                      </h3>
                    </div>
                    <div className="w-full text-center">
                      <p className="mb-2 text-sm text-muted-foreground md:mb-3 md:text-base">
                        {item.description}
                      </p>
                    </div>
                    {blog.read_more_text && (
                      <div className="w-full flex items-center justify-center gap-2 text-sm text-primary group-hover:underline">
                        <span>{blog.read_more_text}</span>
                        <ArrowRight className="size-4" />
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
