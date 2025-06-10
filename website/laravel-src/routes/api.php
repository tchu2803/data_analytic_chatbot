<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\chat\MessageController;
use App\Http\Controllers\Password\PasswordController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Chat\ConversationController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/forgot-password', [PasswordController::class, 'forgotPassword']);
Route::post('/reset-password/{token}/{id}', [PasswordController::class, 'resetPassword'])->name('password.reset')->middleware('api');
Route::get('/reset-password/{token}', function ($token) {
    return response()->json([
        'token' => $token,
    ]);
});
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/config/pusher', function () {
    return response()->json([
        'key' => config('broadcasting.connections.pusher.key'),
        'cluster' => config('broadcasting.connections.pusher.options.cluster'),
    ]);
});

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/conversations/{id}', [ConversationController::class, 'show']);
    Route::put('/conversations/{id}', [ConversationController::class, 'update']);
    Route::delete('/conversations/{id}', [ConversationController::class, 'destroy']);

    Route::post('/upload-file', [MessageController::class, 'uploadFile']);
    Route::post('/conversation/{id}/send-message', [MessageController::class, 'sendMessage']);
    Route::get('/conversation/{id}/messages', [MessageController::class, 'getMessages']);
});
