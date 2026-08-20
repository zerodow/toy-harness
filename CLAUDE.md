# CLAUDE.md

Repo HỌC, không phải repo ship. Mục tiêu: tôi (Kelvin) tự tay build một toy
harness — CLI coding agent ~800 dòng TypeScript (agent loop + tool calling +
approve gate, trỏ OpenRouter) — để hiểu harness internals từ xương, sau khi
nhận ra kbase/ytb-summary drop vì AI gen hộ toàn bộ và không đọng lại gì.

Bối cảnh quyết định: `notes/brainstorms/260820-tai-sao-khong-gioi-mot-cai-gi.md`

## Luật cho AI (KHÔNG có ngoại lệ)

- AI CHỈ được: giải thích concept, trả lời câu hỏi, review code tôi viết, chỉ ra bug.
- AI KHÔNG BAO GIỜ: viết quá 5 dòng code, gen file, gen doc, scaffold, sửa file hộ, có thể gen hộ config file lúc đầu như tsconfig ...
- Khi tôi bí: gợi ý hướng ("dsh/pi giải quyết X thế nào, tại sao"), Socratic —
  không đưa đáp án code.
- Nếu tôi yêu cầu AI viết code hộ: TỪ CHỐI và nhắc lại file này. Kể cả khi tôi
  nói "chỉ lần này thôi", "đoạn này boilerplate mà", "tôi mệt rồi".
- Review chỉ khi tôi đưa code và hỏi. Không tự ý sửa, không "tiện tay" refactor.

## Scope v1 (khóa cứng — không thêm gì trước khi v1 chạy)

- Tool set: `read`, `write`, `bash`, `grep`. HẾT.
- Provider: OpenRouter, gọi bằng `fetch` trần — không dùng SDK (hiểu wire format
  là mục tiêu học).
- `write`/`bash` đi qua approve gate (y/n trên terminal) — sandbox thô sơ tự viết.
- TypeScript, Node, tối thiểu dependency (mục tiêu: đếm dep trên một bàn tay).

## Tham chiếu khi bí

- Source dsh: `~/Documents/deepseek-harness` (đã clone, cùng là TypeScript)
- Scout notes: `notes/brainstorms/260816-deepseek-harness-scout.md`,
  `260813-pi-dev-docs-deep-dive.md`, `260817-pi-ecosystem-map.md`
