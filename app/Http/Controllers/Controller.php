<?php

// app/Http/Controllers/Controller.php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse; // [Assumed: 引用 Laravel 標準 JsonResponse]

abstract class Controller
{
    /**
     * 統一成功回應格式
     * 
     * @param mixed $payload 回傳的資料內容
     * @param string $message 提示訊息
     * @return JsonResponse
     */
    public function sendResponse(mixed $payload, string $message = '操作成功'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'payload' => $payload,
            'message' => $message,
        ], 200);
    }

    /**
     * 統一錯誤回應格式
     * 
     * @param mixed $errorMessages 給人類看的清楚說明
     * @param int $code HTTP 狀態碼
     * @param string $errorCode 給 React 程式判斷用的代碼
     * @return JsonResponse
     */
    public function sendError(mixed $errorMessages, int $code = 404, string $errorCode = 'UNKNOWN_ERROR'): JsonResponse
    {
        return response()->json([
            'success'   => false,
            'message'   => $errorMessages,
            'errorCode' => $errorCode,
        ], $code);
    }
}
