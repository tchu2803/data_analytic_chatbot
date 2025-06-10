<?php

namespace App\Http\Controllers\chat;

use Illuminate\Http\Request;
use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function send(Request $request)
    {
        $message = $request->input('message');
        $time = now()->toDateTimeString(); // lấy thời gian hiện tại

        // Gửi event kèm message và thời gian
        event(new MessageSent([
            'content' => $message,
            'time' => $time,
        ]));

        return response()->json([
            'status' => 'Message sent',
            'message' => $message,
            'time' => $time,
        ]);
    }

    public function getMessages($id)
    {
        $conversation = Conversation::find($id);
        if (!$conversation) {
            return response()->json(['error' => 'Conversation not found'], 404);
        }
        return response()->json($conversation->messages);
    }

    public function sendMessage(Request $request)
    {
        $message = $request->input('message');
        $conversation_id = $request->input('conversation_id');
        $time = now()->toDateTimeString();

        $conversation = Conversation::find($conversation_id);
        if (!$conversation) {
            return response()->json([
                'reply' => 'Cuộc trò chuyện không tồn tại.',
                'status' => 'error',
                'time' => $time,
            ], 404);
        }

        // 1. Lưu câu hỏi (question) mới, content để null tạm thời
        $messageRecord = Message::create([
            'conversation_id' => $conversation_id,
            'user_id' => Auth::id(),
            'question' => $message,
            'content' => null,
        ]);

        // 🔴 Broadcast tin nhắn của người dùng (chỉ có câu hỏi)
        broadcast(new MessageSent([
            'type' => 'user',
            'conversation_id' => $conversation_id,
            'user' => Auth::user()->name,
            'question' => $message,
            'content' => null,
            'time' => $time,
        ]))->toOthers();

        try {
            $response = Http::timeout(300)->post('http://localhost:5000/ask', [
                'question' => $message
            ]);

            if ($response->successful()) {
                $data = $response->json();

                if (!isset($data['answer']) || empty($data['answer'])) {
                    return response()->json([
                        'reply' => 'Python đã nhận tin nhắn nhưng không trả về câu trả lời.',
                        'status' => 'error',
                        'time' => $time,
                    ], 500);
                }

                // 2. Cập nhật lại bản ghi với câu trả lời (content)
                $messageRecord->content = $data['answer'];
                $messageRecord->save();

                // 🟢 Broadcast câu trả lời của chatbot
                broadcast(new MessageSent([
                    'type' => 'assistant',
                    'conversation_id' => $conversation_id,
                    'user' => 'Assistant',
                    'question' => $message,     // giữ câu hỏi để hiển thị nếu cần
                    'content' => $data['answer'],
                    'time' => now()->toDateTimeString(),
                ]))->toOthers();

                return response()->json([
                    'reply' => $data['answer'],
                    'status' => 'success',
                    'time' => now()->toDateTimeString(),
                ]);
            }

            return response()->json([
                'reply' => 'Python trả về lỗi HTTP: ' . $response->status(),
                'status' => 'error',
                'time' => $time,
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'reply' => 'Không thể kết nối tới Python server.',
                'status' => 'error',
                'error' => $e->getMessage(),
                'time' => $time,
            ], 500);
        }
    }
    public function uploadFile(Request $request)
    {
        if ($request->hasFile('file')) {
            $file = $request->file('file');

            // Kiểm tra đúng định dạng
            if ($file->getClientOriginalExtension() !== 'pdf') {
                return response()->json(['error' => 'Chỉ hỗ trợ file PDF'], 400);
            }

            // Đường dẫn tới thư mục mcp-server/files
            $targetPath = base_path('../../chatbot/mcp-server/data');
            if (!file_exists($targetPath)) {
                mkdir($targetPath, 0777, true);
            }

            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move($targetPath, $filename);

            return response()->json(['status' => 'File uploaded thành công']);
        }

        return response()->json(['error' => 'Không tìm thấy file'], 400);
    }
}
