<?php

namespace App\Http\Controllers\chat;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    // Lấy danh sách các conversation của user đang đăng nhập
    public function index()
    {

        $conversations = Conversation::where('user_id', Auth::id())->get();
        return response()->json($conversations);
    }

    public function show($id)
    {
        $conversation = Conversation::with('messages')->find($id);

        if (!$conversation) {
            return response()->json(['message' => 'Conversation not found'], 404);
        }

        return response()->json($conversation);
    }
    // Tạo mới một conversation
    public function store(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $conversation = Conversation::create([
            'title' => $request->title,
            'user_id' => Auth::id(),
        ]);

        return response()->json($conversation, 201);
    }

    // Cập nhật tên conversation
    public function update(Request $request, $id)
    {
        $conversation = Conversation::findOrFail($id);

        if ($conversation->user_id !== Auth::id()) {
            return response()->json(['message' => 'Bạn không có quyền'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $conversation->title = $request->title;
        $conversation->save();

        return response()->json(['message' => 'Đã cập nhật', 'conversation' => $conversation]);
    }

    public function destroy(Request $request, $id)
    {
        $conversation = Conversation::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $conversation->delete();

        return response()->json(['message' => 'Conversation deleted']);
    }
}
