function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHref(value: string) {
  const href = value.trim();
  return /^(https?:\/\/|mailto:|\/|#)/i.test(href) ? href : null;
}

function renderInline(source: string) {
  const code: string[] = [];
  let rendered = escapeHtml(source).replace(/`([^`]+)`/g, (_, value: string) => {
    const token = `@@INLINE_CODE_${code.length}@@`;
    code.push(`<code>${value}</code>`);
    return token;
  });

  rendered = rendered
    .replace(/\[([^\]]+)]\(([^\s)]+)\)/g, (_, label: string, rawHref: string) => {
      const href = safeHref(rawHref);
      if (!href) return label;
      const rel = /^https?:\/\//i.test(href) ? ' rel="noopener noreferrer"' : "";
      return `<a href="${escapeHtml(href)}"${rel}>${label}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  return rendered.replace(/@@INLINE_CODE_(\d+)@@/g, (_, index: string) => code[Number(index)]);
}

function isTableDelimiter(line: string) {
  const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function tableCells(line: string) {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

export function renderMarkdown(source: string) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```([\w-]*)\s*$/);
    if (fence) {
      const language = fence[1];
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      const className = language ? ` class="language-${escapeHtml(language)}"` : "";
      html.push(`<pre><code${className}>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }
    if (/^#\s+/.test(line)) {
      index += 1;
      continue;
    }

    if (
      line.startsWith("|") &&
      index + 1 < lines.length &&
      lines[index + 1].startsWith("|") &&
      isTableDelimiter(lines[index + 1])
    ) {
      const headers = tableCells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].startsWith("|") && lines[index].endsWith("|")) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      html.push(
        `<div class="table-wrap"><table><thead><tr>${headers.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
      );
      continue;
    }

    const listMatch = line.match(/^(?:- |\d+\. )/);
    if (listMatch) {
      const ordered = /^\d+\. /.test(line);
      const pattern = ordered ? /^\d+\. (.+)$/ : /^- (.+)$/;
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].match(pattern);
        if (!match) break;
        items.push(`<li>${renderInline(match[1])}</li>`);
        index += 1;
      }
      const tag = ordered ? "ol" : "ul";
      html.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    if (line.startsWith("> ")) {
      html.push(`<blockquote><p>${renderInline(line.slice(2))}</p></blockquote>`);
      index += 1;
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      paragraph.push(lines[index]);
      index += 1;
    }
    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return html.join("");
}
