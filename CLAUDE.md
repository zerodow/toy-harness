# CLAUDE.md

Repo HỌC, không phải repo ship. Mục tiêu: tôi (Kelvin) tự tay build một toy
harness — CLI coding agent ~800 dòng TypeScript (agent loop + tool calling +
approve gate, trỏ DeepSeek API) — để hiểu harness internals từ xương, sau khi
nhận ra kbase/ytb-summary drop vì AI gen hộ toàn bộ và không đọng lại gì.

Bối cảnh quyết định: `notes/brainstorms/260820-tai-sao-khong-gioi-mot-cai-gi.md`

## Luật cho AI (bản nới 26/08 — quyền quyết về tay tôi)

Bản gốc cấm AI gen tuyệt đối (xem git history). Nới vì rule cũ coi mọi dòng
code dạy như nhau — sai: gõ tay agent loop thì học, gõ tay boilerplate thì
chỉ luyện gõ phím. Tôi tự quyết từng trường hợp, không đặt rule cứng nữa.

- **Mặc định vẫn là tôi tự viết.** AI: giải thích concept, trả lời câu hỏi,
  review code tôi viết, chỉ bug. Khi tôi bí: gợi hướng ("dsh/pi giải quyết X
  thế nào, tại sao"), Socratic — không đưa đáp án khi tôi chưa yêu cầu.
- **Khi tôi chủ động yêu cầu gen** (code, file, scaffold, config): AI làm,
  không từ chối. Guardrail duy nhất: trước khi gen, AI hỏi đúng một câu —
  *"Phần này AI viết thì bạn mất bài học nào không?"* — tôi trả lời là gen
  luôn, không hỏi lại lần hai cho cùng loại việc trong phiên.
- Khuyến nghị (không ràng buộc): phần lõi học — agent loop, tool calling /
  wire format, approve gate — nên tự tay; boilerplate, config, type lặp thì
  gen thoải mái.
- Review chỉ khi tôi đưa code và hỏi. Không tự ý sửa, không "tiện tay" refactor.

## Scope v1 (khóa cứng — không thêm gì trước khi v1 chạy)

- Tool set: `read`, `write`, `bash`, `grep`. HẾT.
- Provider: DeepSeek API trực tiếp, gọi bằng `fetch` trần — không dùng SDK
  (hiểu wire format là mục tiêu học).
- `write`/`bash` đi qua approve gate (y/n trên terminal) — sandbox thô sơ tự viết.
- TypeScript, Node, tối thiểu dependency (mục tiêu: đếm dep trên một bàn tay).

## Tham chiếu khi bí

- Source dsh: `~/Documents/deepseek-harness` (đã clone, cùng là TypeScript)
- Scout notes: `notes/brainstorms/260816-deepseek-harness-scout.md`,
  `260813-pi-dev-docs-deep-dive.md`, `260817-pi-ecosystem-map.md`
