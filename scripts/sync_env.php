<?php

$envFile = dirname(__DIR__) . '/.env';
$exampleFile = dirname(__DIR__) . '/.env.example';

// 1. 檢查 .env 是否存在 使用方法php scripts/sync_env.php
if (!file_exists($envFile)) {
    die("❌ 找不到 .env 檔案！請確認你是在專案根目錄執行此腳本。\n");
}

// 2. 讀取 .env 的所有內容，並逐行拆解
$lines = file($envFile, FILE_IGNORE_NEW_LINES);
$outputLines = [];

foreach ($lines as $line) {
    $trimmedLine = trim($line);

    // 1. 如果是純空行，原封不動保留
    if ($trimmedLine === '') {
        $outputLines[] = $line;
        continue;
    }

    // 2. 只要這一行有等號 (=)，不管是正常變數還是被 # 註解的變數，都把值清空
    if (strpos($trimmedLine, '=') !== false) {
        $parts = explode('=', $trimmedLine, 2);
        $key = $parts[0]; // 如果開頭有 #，這裡會把 # 一起保留下來

        // 組合回 Key= 的格式
        $outputLines[] = $key . '=';
    }
    // 3. 如果沒有等號，且是 # 開頭的純文字註解 (例如 "# 這是資料庫設定")，原封不動保留
    elseif (strpos($trimmedLine, '#') === 0) {
        $outputLines[] = $line;
    }
    // 4. 其他無法辨識的行數，原封不動保留
    else {
        $outputLines[] = $line;
    }
}

// 3. 將處理好的內容寫入 .env.example
file_put_contents($exampleFile, implode("\n", $outputLines) . "\n");

echo "✅ 完美同步！已成功將 .env 的變數結構複製到 .env.example，並安全清空所有機密數值。\n";
