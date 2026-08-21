Wire format

- LLM API chỉ là HTTP POST, không có "kết nối"
- OpenAI format là de-facto standard; Anthropic format lan ra vì Claude Code
- host không phân biệt format, path mới phân biệt
- fetch vs axios: 4 việc axios làm hộ (stringify, Content-Type, .json(), và không throw khi 4xx)

Stateless & context

- messages là mảng → model không nhớ gì, harness giữ history
- prompt_tokens phình theo bình phương, gửi lại toàn bộ mỗi lượt
- prompt cache theo prefix → luôn append, đừng sửa giữa mảng
- truncation phải nhìn thấy được, cắt âm thầm = model tự tin trả lời sai

finish_reason

- 4 giá trị và ý nghĩa; vì sao không thay được bằng cách kiểm tool_calls
- length = output bị cắt giữa chừng → JSON.parse nổ ở chỗ cách đó 3 tầng

Tool calling

- model không chạy tool, nó chỉ xin phép
- arguments là string → JSON.parse
- role: "tool" + tool_call_id ghép cặp; mỗi tool_call phải có đúng 1 tool message
- parallel tool calls → số vòng loop ≠ số tool
- lỗi tool phải trả về cho model, không throw — nếu không history hỏng vĩnh viễn

Agent loop

- 2 tầng: ngoài chờ user, trong lặp tới stop
- continue/break gắn với vòng gần nhất — bug "phải bấm Enter mới ra"
- câu của bạn: "cuối cùng nó chỉ là một vòng lặp, response trước làm input cho message sau"
- model là hàm thuần của mảng messages → mọi thứ còn lại của harness là quản lý cái mảng đó

Kiến trúc

- registry = tách capability (tool làm gì) khỏi policy (có được phép không)
- gate phải hiện đủ thông tin, không thì là trang trí
- dsh read 746 dòng vs 4 dòng của bạn: chênh lệch là sẹo, không phải kiến trúc
- grep = Cmd+Shift+F của agent; output grep là input của read

JS/TS bẫy

- forEach + async = luôn sai → for...of
- type cái ra quan trọng như type cái vào
- tsx không typecheck → cần tsc --noEmit
- Record<string, T> nói dối về index

---
