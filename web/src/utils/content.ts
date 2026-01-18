import { marked } from 'marked';

// 配置 marked 选项
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true, // 启用 GitHub Flavored Markdown
});

export const parsePostTag = (content: string) => {
  const tags: string[] = [];
  const users: string[] = [];
  
  // 先渲染 markdown
  let htmlContent = marked.parse(content) as string;
  
  // 清理空白但保留 br 换行：
  htmlContent = htmlContent
    // 移除空段落
    .replace(/<p>\s*<\/p>/gi, '')
    // 移除段落开头和结尾的空白（但不影响 br 标签）
    .replace(/<p>\s+/gi, '<p>')
    .replace(/\s+<\/p>/gi, '</p>')
    // 合并连续的空段落
    .replace(/<\/p>\s*<p>/gi, '</p><p>')
    // 移除连续的多个 br 标签（保留单个和双 br）
    .replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
  
  var tagExp = /(#|＃)([^#@\s])+?\s+?/g; // 这⾥中⽂#和英⽂#都会识别
  var atExp = /@([a-zA-Z0-9])+?\s+?/g; // 这⾥中⽂#和英⽂#都会识别
  htmlContent = htmlContent
    .replace(tagExp, (item) => {
      tags.push(item.substr(1).trim());
      return (
        '<a class="hash-link" data-detail="tag:' +
        encodeURIComponent(item.substr(1).trim()) +
        '">' +
        item.trim() +
        '</a> '
      );
    })
    .replace(atExp, (item) => {
      users.push(item.substr(1).trim());
      return (
        '<a class="hash-link" data-detail="user:' +
        encodeURIComponent(item.substr(1).trim()) +
        '">' +
        item.trim() +
        '</a> '
      );
    });
  return { content: htmlContent, tags, users };
};

export const preparePost = (
  content: string,
  foldHint: string,
  unfoldHint: string,
  maxSize: number,
  isFold: boolean = true,
  renderMarkdown: boolean = false,
) => {
  const isEllipsis = content.length > maxSize;
  if (isFold && isEllipsis) {
    content = content.substring(0, maxSize);
    let latestChar = content.charAt(maxSize - 1);
    if (latestChar == '#' || latestChar == '#' || latestChar == '@') {
      content = content.substring(0, maxSize - 1);
    }
  }
  
  // 根据参数决定是否渲染 markdown
  let htmlContent: string;
  if (renderMarkdown) {
    htmlContent = marked.parse(content) as string;
  } else {
    // 列表视图：清理多余空行，只保留单个换行
    htmlContent = content
      .replace(/\n\s*\n\s*\n+/g, '\n\n')  // 将3个或以上连续换行替换为2个
      .replace(/\n/g, ' ');  // 将换行替换为空格，让文本连续显示
  }
  
  const tagExp = /(#|＃)([^#@\s])+?\s+?/g; // 这⾥中⽂#和英⽂#都会识别
  const atExp = /@([a-zA-Z0-9])+?\s+?/g; // 这⾥中⽂#和英⽂#都会识别
  htmlContent = htmlContent
    .replace(tagExp, (item) => {
      return (
        '<a class="hash-link" data-detail="tag:' +
        encodeURIComponent(item.substring(1).trim()) +
        '">' +
        item.trim() +
        '</a> '
      );
    })
    .replace(atExp, (item) => {
      return (
        '<a class="hash-link" data-detail="user:' +
        encodeURIComponent(item.substring(1).trim()) +
        '">' +
        item.trim() +
        '</a> '
      );
    });
  if (isEllipsis) {
    htmlContent =
      htmlContent.trimEnd() +
      (isFold ? '...&nbsp;' : '&nbsp;') +
      '<a class="hash-link" data-detail="post">' +
      (isFold ? foldHint : unfoldHint) +
      '</a> ';
  }
  return htmlContent;
};
