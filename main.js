// ユーザーが Chrome 拡張のボタンをクリックすると、
// 開かれているタブから leetcode.com と github.com のタブを探してきて (線形探索で、ヒットする物がある場合は右側にあるタブで上書きする)
// leetcode のタブから 問題名と問題ページへのリンクを取得し、
// github のタブから PR ページヘのリンクを取得し、
// leetcode 練習会のレビュー依頼のフォーマットである、「問題名、問題リンク、PR へのリンク」形式のに整形し、
// テキストをクリップボードに保存する
document.addEventListener('DOMContentLoaded', () => {
  const extractUrlsButton = document.getElementById('extractUrlsButton');
  if (extractUrlsButton) {
    extractUrlsButton.addEventListener('click', () => {
      chrome.tabs.query({}, (tabs) => {
        let problemTitle = '';
        let leetcodeUrl = '';
        let prUrl = '';

        tabs.forEach((tab) => {
          if (tab.url.includes('leetcode.com')) {
            const leetcodeDetails = extractLeetCodeProblemDetails(tab.url);
            if (leetcodeDetails) {
              problemTitle = toTitleCase(leetcodeDetails.problemTitle)
              leetcodeUrl = leetcodeDetails.problemUrl;
            }
          } else if (tab.url.includes('github.com') && tab.url.includes('/pull/')) {
            //タブの URL をそのまま用いる (PR のフロントページ、 `prUrl+ '/files/'` いずれでも指定できるようするため正規化しない。)
            prUrl = tab.url;
          }
        });
        if (problemTitle && leetcodeUrl && prUrl) {
          const formattedText = `1. 問題名: ${problemTitle} を解きました。レビューよろしくお願いします。\n2. 問題リンク: ${leetcodeUrl}\n3. PRリンク: ${prUrl}\n4. レビュー依頼: \@ \@ \@`;
          const output = document.getElementById('output');
          if (output) {
            output.textContent = formattedText;
          }

          navigator.clipboard.writeText(formattedText).then(() => {
            alert('レビュー依頼情報のテンプレートをクリップボードに保存しました。\n\n' + formattedText);
          }).catch(err => {
            console.error('クリップボードへのコピーに失敗しました。: ', err);
          });
        } else {
          alert('ウインドウ中の最も右側にある leetcode の問題ページのタブと PR のタブから URL を取得します。\nいずれかもしくは両方が欠けているかもしれません。\n');
        }
      });
    });
  }
});

// 問題URLから問題名と問題ページへのリンクを取得する関数
function extractLeetCodeProblemDetails(url) {
  // 正規表現パターンの作成
  const regex = /https:\/\/leetcode\.com\/problems\/([^\/]+)\/?/;
  // 正規表現でURLをマッチさせる
  const match = url.match(regex);
  if (match) {
    // URLとタイトルを抽出
    const problemUrl = `https://leetcode.com/problems/${match[1]}/`;
    const problemTitle = match[1];
    return {
      problemUrl: problemUrl,
      problemTitle: problemTitle
    };
  } else { // URLが正しい形式ではない場合
    return null;
  }
}

// 問題名を Title Case に変換する関数 ()
function toTitleCase(title) {
  return title
    .split('-')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
