# toy-harness (toyh)

Tự tay build lại một CLI coding agent kiểu Claude Code, ~800 dòng TypeScript,
để hiểu harness hoạt động thế nào từ xương. Repo học — thước đo thành công là
**cái đọng lại trong đầu**, không phải feature list.

```
$ toyh "tìm và sửa typo trong README"

[loop 1] think → tool: grep("README")
[loop 2] tool: read_file("README.md")
[loop 3] tool: edit_file(...)  ⛔ approve? y
[loop 4] done: đã sửa 2 typo
```

## Tại sao repo này tồn tại

kbase và ytb-summary chết vì AI gen toàn bộ code — không đọng lại gì, mất
ownership nhận thức, drop. Repo này làm ngược lại: **tôi gõ 100%**, AI chỉ làm
tutor (luật trong `CLAUDE.md`). Chậm 5-10 lần là tính năng, không phải bug.

Full context: `notes/brainstorms/260820-tai-sao-khong-gioi-mot-cai-gi.md`

## Tại sao TypeScript

- Chính các harness đang học (dsh, Claude Code, Gemini CLI, pi) là TypeScript —
  bí thì đọc source trực tiếp, cùng ngôn ngữ.
- Harness là orchestration IO-bound, không cần perf Rust/Go.
- Ngôn ngữ mạnh nhất của tôi (RN 7+ năm) → chỉ còn MỘT bức tường phải leo
  (harness concepts), không phải hai.

## Roadmap 6-8 tuần (~4h/ngày)

| Tuần | Milestone | Xong khi |
|------|-----------|----------|
| 0 | Init tay: package.json, tsconfig (hiểu từng field), .env OpenRouter key | `npx tsx src/main.ts` in ra "hello" |
| 1 | Loop trần: fetch OpenRouter, vòng chat, tool `read_file` | Hỏi "file X nói gì" → agent tự đọc và trả lời |
| 2 | Đủ tool set: `write`, `grep`; tool-calling loop chắc tay (schema, lỗi, retry) | Agent sửa được typo end-to-end |
| 3 | `bash` tool + approve gate. **Tuần tường chán — biết trước, cứ đi tiếp** | Lệnh nguy hiểm phải hỏi y/n, từ chối thì loop tiếp tục tử tế |
| 4 | Context management: đếm token, cắt history, system prompt | Hội thoại dài không vỡ context |
| 5 | So với source dsh/pi: đọc phần tương ứng, ghi note "họ khác mình chỗ nào, tại sao" | 1 note so sánh trong `notes/` |
| 6 | Polish CLI (readline, màu, config) + chuẩn bị demo | Chạy demo mượt trên repo notes thật |
| 7-8 | Buffer trượt tiến độ + **sharing nội bộ SmartOSC** (forcing function) | Đã đứng nói trước team |

## Luật vận hành

- Tool set v1 khóa cứng: `read`, `write`, `bash`, `grep` — không thêm trước khi v1 chạy.
- Chỉ đọc tài liệu mà tuần hiện tại cần (just-in-time). Link hay ho khác → quăng
  `notes/inbox.md`.
- Mỗi tuần 1 dòng vào `notes/log/`: làm được gì, hiểu thêm gì.
- Phase 2 (SAU v1, không sớm hơn): RN tools — đọc log Metro, chạy test — biến nó
  thành agent phục vụ nghề mobile.
