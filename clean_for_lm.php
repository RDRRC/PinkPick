<?php

// ==========================================
// 0. 防呆機制：檢查使用者有沒有輸入參數
// ==========================================
if (!isset($argv[1])) {
    die("❌ 錯誤：請在指令後面加上要處理的檔案路徑！\n💡 用法範例：php clean_for_lm.php app/Http/Controllers/ProductController.php\n");
}

// 1. 接收終端機傳來的目標檔案路徑
$targetFile = $argv[1];
$outputDir = 'LM';

// 檢查來源檔案是否存在
if (!file_exists($targetFile)) {
    die("❌ 找不到檔案：{$targetFile}，請確認路徑是否正確。\n");
}

// 檢查 LM 資料夾是否存在，如果沒有就自動建立！
if (!is_dir($outputDir)) {
    mkdir($outputDir, 0777, true);
}

$fileName = basename($targetFile);
$outputFile = $outputDir . '/' . $fileName . '.txt';

$content = file_get_contents($targetFile);

// ==========================================
// 🧹 開始清洗 (PHP & JSX 通用規則)
// ==========================================
$content = str_replace('<?php', '', $content);
$content = preg_replace('#\{\s*/\*.*?\*/\s*\}#s', '', $content);
$content = preg_replace('#/\*.*?\*/#s', '', $content);
$content = preg_replace('#(?<!:)//.*#', '', $content);
// 5. 移除「假空行」(把整行只有空白或 Tab 的行直接刪除)
$content = preg_replace('/^[ \t]*[\r\n]+/m', '', $content);
// 6. 將剩餘連續的多個換行，壓縮成單一換行
$content = preg_replace("/[\r\n]+/", "\n", $content);
// 👇 智慧判斷：抓取副檔名
$extension = pathinfo($targetFile, PATHINFO_EXTENSION);
// 👇 只有當檔案是 jsx (或未來的 tsx, html) 時，才替換 < 和 >
if ($extension === 'jsx') {
    $content = str_replace(['<', '>'], ['&lt;', '&gt;'], $content);
}

// ==========================================
// 加上純文字標頭並輸出
// ==========================================
$finalOutput = "檔案路徑：{$targetFile}\n\n" . trim($content);
file_put_contents($outputFile, $finalOutput);

echo "✅ 清洗完成！檔案已存入：{$outputFile}\n";
