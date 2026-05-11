import type { BlogPost } from "@/lib/blog-posts";

type BlogCardThumbnailProps = {
  post: Pick<BlogPost, "gradient" | "thumbnailUrl">;
};

export function BlogCardThumbnail({ post }: BlogCardThumbnailProps) {
  if (post.thumbnailUrl) {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${JSON.stringify(post.thumbnailUrl)})` }}
        aria-hidden
      />
    );
  }

  return (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient}`} aria-hidden />
      <div
        className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"
        aria-hidden
      />
    </>
  );
}
