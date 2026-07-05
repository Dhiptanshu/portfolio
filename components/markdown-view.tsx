import Link from "next/link";

export function MarkdownView({ value }: { value: string | null | undefined }) {
  if (!value) return null;
  const lines = value.split(/\r?\n/);

  return (
    <div className="space-y-3 text-sm leading-7 text-muted-foreground">
      {lines.map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-1" />;
        if (line.startsWith("### ")) return <h4 key={index} className="pt-2 text-base font-semibold text-foreground">{line.replace("### ", "")}</h4>;
        if (line.startsWith("## ")) return <h3 key={index} className="pt-3 font-serif text-2xl text-foreground">{line.replace("## ", "")}</h3>;
        if (line.startsWith("# ")) return <h2 key={index} className="pt-4 font-serif text-3xl text-foreground">{line.replace("# ", "")}</h2>;
        if (line.startsWith("- ")) return <p key={index} className="pl-4 before:mr-2 before:text-primary before:content-['-']">{renderInline(line.replace("- ", ""))}</p>;
        return <p key={index}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(line: string) {
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(line))) {
    parts.push(line.slice(lastIndex, match.index));
    parts.push(
      <Link key={`${match[1]}-${match.index}`} href={match[2]} target="_blank" className="text-primary underline-offset-4 hover:underline">
        {match[1]}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }

  parts.push(line.slice(lastIndex));
  return parts;
}
