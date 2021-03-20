const STARTSUB_REGEX = /^\s*!startsub\s+(.*)\s*$/;
const ENDSUB_REGEX = /^\s*!endsub\s*$/;

export function extractSubIncludedText(content: string, tag: string): string {
  const contentLines = content.split('\n');
  const subTextLines = [];
  let subDepth = 0;
  for (const line of contentLines) {
    if (subDepth === 0) {
      const match = STARTSUB_REGEX.exec(line);
      if (match !== null && match[1] === tag) subDepth++;
      continue;
    }
    const startMatch = STARTSUB_REGEX.exec(line);
    const endMatch = ENDSUB_REGEX.exec(line);
    if (startMatch !== null) {
      subDepth++;
      subTextLines.push(line);
    } else if (endMatch !== null) {
      subDepth--;
      if (subDepth > 0) subTextLines.push(line);
    } else {
      subTextLines.push(line);
    }
  }

  return subTextLines.join('\n');
}
