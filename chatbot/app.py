import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load biến môi trường từ file .env
load_dotenv()

app = Flask(__name__)
CORS(app)

FPT_API_KEY = os.getenv("FPT_API_KEY")
FPT_CHAT_URL = os.getenv("FPT_CHAT_URL")

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()

    if not data or 'question' not in data:
        return jsonify({'error': 'Thiếu câu hỏi'}), 400

    question = data['question']
    print("📥 Nhận câu hỏi:", question)

    try:
        response = requests.post(
            FPT_CHAT_URL,
            headers={
                'Authorization': f'Bearer {FPT_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                "model": "Qwen2.5-Coder-32B-Instruct",
                "messages": [
                    {"role": "user", "content": question}
                ],
                "temperature": 0.7,
                "max_tokens": 300
            },
            timeout=15
        )

        if response.status_code != 200:
            print("❌ Lỗi từ FPT API:", response.status_code, response.text)
            return jsonify({
                'reply': 'Gọi FPT API thất bại',
                'status': 'error',
                'status_code': response.status_code,
                'detail': response.text
            }), 500

        result = response.json()
        answer = result['choices'][0]['message']['content'].strip()
        print("📤 Trả lời:", answer)
        return jsonify({'answer': answer})

    except Exception as e:
        print("❌ Lỗi gọi API:", str(e))
        return jsonify({
            'reply': 'Lỗi không xác định',
            'status': 'error',
            'error_detail': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
