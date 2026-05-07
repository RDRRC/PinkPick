<?php

// ==========================================
// 0. 防呆機制：檢查使用者有沒有輸入參數
// ==========================================
if (!isset($argv[1])) {
    die("❌ 錯誤：請在指令後面加上要處理的檔案路徑！\n💡 用法範例：php scripts/clean_for_lm.php app/Http/Controllers/ProductController.php\n");
}

// 1. 接收終端機傳來的目標檔案路徑
$rawInput = $argv[1];

// 👇 升級防呆：將 Windows 的反斜線(\) 全部替換為 Linux 的正斜線(/)
$targetFile = str_replace('\\', '/', $rawInput);

// 👇 加入這段：資安防護鎖
if (basename($targetFile) === '.env') {
    die("🛑 致命錯誤：為了你的專案安全，嚴禁將真實的 .env 檔案餵給 AI！請改用 .env.example\n");
}

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
// 👇 [修復] 修改這行：只刪除 /* 開頭的普通註解，嚴格保留 /** 開頭的 PHPDoc (對 AI 判讀極為重要)
$content = preg_replace('#/\*(?!\*).*?\*/#s', '', $content);
$content = preg_replace('#(?<!:)//.*#', '', $content);
// 5. 移除「假空行」(把整行只有空白或 Tab 的行直接刪除)
$content = preg_replace('/^[ \t]*[\r\n]+/m', '', $content);
// 6. 將剩餘連續的多個換行，壓縮成單一換行
$content = preg_replace("/[\r\n]+/", "\n", $content);
// 👇 智慧判斷：抓取副檔名
$extension = pathinfo($targetFile, PATHINFO_EXTENSION);
// 👇 只有當檔案是 jsx (或未來的 tsx, html) 時，才替換 < 和 >
if (in_array($extension, ['jsx', 'js', 'tsx'])) {
    $content = str_replace(
        ['<', '>', '`'],
        ['&lt;', '&gt;', '&#96;'],
        $content
    );
}

// ==========================================
// 加上純文字標頭並輸出
// ==========================================
$finalOutput = "檔案路徑：{$targetFile}\n\n" . trim($content);
file_put_contents($outputFile, $finalOutput);

echo "✅ 清洗完成！檔案已存入：{$outputFile}\n";
