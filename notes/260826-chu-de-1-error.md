# 260826 — Chủ đề 1: Error handling

Trạng thái: **chưa trả lời câu nào.** Note này là nguyên liệu, không phải kết luận.
Phần `>>>` là chỗ tôi tự điền. Đừng đọc lướt rồi tưởng là đã hiểu.

## Trạng thái repo lúc dừng

- `main` sync với origin. 193 dòng TS (`main.ts` 132, `tools.ts` 61).
- `node_modules/` trống → đã `npm ci`. `tsc --noEmit` sạch, `tsx` chạy.
- **Chưa có `.env`** → chưa gọi được API thật.
- Roadmap: tuần 2 đang dở — `write_file` xong, **`grep` chưa có**. Approve gate (tuần 3) đã landed sớm.

## Bug đang nợ (AI review, chưa sửa)

1. `main.ts:85` — gate dính chặt schema `write_file`. `args.content.slice(0,20)` giả định mọi tool cần approve đều có `content`. `bash` vào (args là `command`) → TypeError, inner catch bắt, tool không chạy, model nhận error vô nghĩa. Registry đã tách capability/policy, nhưng phần *hiển thị* của gate thì chưa.
2. `finish_reason === "length"` không có nhánh. `process.md` đã ghi rõ nó nguy hiểm, code hiện rơi vào `else` → `break`, mất im lặng cả lượt.
3. Vòng lặp vô hạn tiềm ẩn: `finish_reason === "tool_calls"` mà `tool_calls` rỗng/undefined → push assistant message, không `continue` không `break` → chạy hết thân `while` → gọi model lại với `messages` y nguyên.
4. `main.ts:65` in `null` mỗi vòng tool. Cosmetic, nhưng làm mờ đúng cái cần thấy khi debug loop.
5. `write_file` chưa có path guard — path tuyệt đối nào cũng ghi được. Việc tuần 3.
6. `main.ts:37` `throw err` ném string thay vì `Error`. `error + ""` ở dòng 109 chạy đúng do tình cờ.
7. `sandbox.md` (file agent tự ghi khi test) đã bị commit. Cân nhắc gitignore.

## Bốn công cụ tư duy

### 1. Predict-then-run — quan trọng nhất

Không chắc JS làm gì: **viết dự đoán ra giấy TRƯỚC, rồi mới chạy.**

Chạy trước rồi đọc kết quả → học ~0, não ghi "à ra thế" rồi quên trong 20 phút.
Đoán trước và **đoán sai** → cái sai khắc vào đầu. Khoảng cách dự đoán ↔ thực tế
chính là chỗ học.

Quy trình: 1 câu hỏi → 1 dòng dự đoán → `node -e '...'` → so sánh → nếu sai,
viết 1 dòng *"tôi đã tưởng X vì Y"*.

10 giây trong REPL thắng 10 phút suy luận.

### 2. Trace bằng tay — thành cái interpreter

Câu hỏi "sau bước này state còn gì" → **đừng suy luận trừu tượng.** Chọn kịch bản
cụ thể, viết mảng ra, từng phần tử, bằng tay:

```
[0] system
[1] user "..."
[2] assistant tool_calls=[id_abc]
[3] ???
```

Suy luận trừu tượng cho *cảm giác* hiểu. Enumerate cho **bug**. Khác nhau hoàn toàn.

### 3. Tìm invariant, đừng tìm "đúng/sai"

"Code này đúng không?" là câu vô phương trả lời. Đổi thành:

> **Tính chất gì phải LUÔN đúng với mảng `messages`, ở mọi thời điểm?**

Viết ra 2–3 tính chất. Rồi với **từng nhánh** (`stop`, `tool_calls`, `else`, `catch`):
nhánh này có giữ được nó không?

Tôi đã tự viết một invariant trong `process.md` — dòng về `tool_call_id` ghép cặp.
Chưa dùng nó như cái thước. Giờ dùng làm thước.

### 4. Cost asymmetry — cho câu hỏi thiết kế

Câu 2 và 3 **không có đáp án đúng duy nhất** → hỏi "cái nào đúng" là sai câu hỏi. Hỏi:

> Chọn A mà sai → **cái gì vỡ, vỡ to cỡ nào, tôi có phát hiện được không?**
> Chọn B mà sai → cùng ba câu đó.

Thường một bên **sai âm thầm**, một bên **sai ầm ĩ**. Sai ầm ĩ gần như luôn thắng.
Nguyên tắc này tôi đã tự viết trong `process.md`: *"truncation phải nhìn thấy được,
cắt âm thầm = model tự tin trả lời sai."* Cùng nguyên tắc, áp chỗ khác.

## Ba câu hỏi — CHƯA TRẢ LỜI

### Câu 1 — state sau `break` (công cụ 2 + 3)

Câu **cơ học**, có đáp án đúng, tự tìm được. Làm câu này TRƯỚC.

1. Liệt kê **mọi thời điểm** `callModel` có thể ném. Không phải "khi API lỗi" — mà:
   lần gọi đầu? lần thứ hai sau khi tool đã chạy? Mấy vị trí? Đánh số.
2. Với **từng** vị trí: trace tay mảng `messages` tại đúng lúc `break` chạy.
3. Thêm một dòng nữa: cái `user` message của lượt sau.
4. Đọc mảng đó: **nếu tôi là model nhận được mảng này, tôi thấy gì?**
5. Đối chiếu invariant ở công cụ 3.

Mẹo: bước 4 dễ hơn nhiều nếu đọc mảng **to lên thành lời**, như đọc hội thoại.
Chỗ nào nghe kỳ → chỗ đó là bug. Tai bắt được thứ mắt đọc JSON bỏ qua.

>>> ĐÁP ÁN CÂU 1:
>>>

### Câu 2 — rollback history hay không (công cụ 4)

Khó nhất. Là **đánh đổi**, không phải bug.

- Trước hết làm rõ rollback *nghĩa là gì* — không hiển nhiên. "Về mốc trước lượt user"
  là cắt bao nhiêu phần tử? Chỉ cái `user`? Cả `tool` message của vòng đang dở?
  Chọn định nghĩa trước, rồi mới cân được.
- Dựng **hai kịch bản người dùng thật**:
  - **Lỗi tạm** — mạng chớp, retry là xong. User gõ lại. Có rollback thấy gì? Không có?
  - **Lỗi vĩnh viễn** — 400 vì history hỏng. User gõ tiếp. Có rollback? Không?
- Hai kịch bản có thể cho **hai câu trả lời trái nhau**. Nếu đúng thế → câu hỏi thật
  không phải "rollback hay không" mà là câu khác. **Nhìn ra được điều đó là toàn bộ
  mục đích của câu 2.**
- Hướng nữa: **ai quyết định retry** — harness tự động, hay con người ở terminal?
  Trả lời được thì câu rollback nhẹ đi rất nhiều.

**Đọc dsh:** đừng mở source ra đọc ngay. Viết dự đoán xuống trước — "tôi đoán nó làm X"
— *rồi* mở. Đọc trước khi có giả thuyết thì chỉ đang copy, không đọng gì. Đúng cái sai
đã giết kbase.

Khi mở `~/Documents/deepseek-harness`: đừng đọc từ đầu. Tìm chỗ nó `fetch`, lần theo
**một câu hỏi duy nhất**: mảng messages bị đụng ở đâu khi request fail? Ai sở hữu nó?

>>> DỰ ĐOÁN dsh làm gì (viết TRƯỚC khi mở source):
>>>
>>> ĐÁP ÁN CÂU 2:
>>>

### Câu 3 — `execute` throw hay return (công cụ 4, nhìn vào *kiểu*)

Cách vào: **đọc chữ ký kiểu như một lời hứa.**

`execute: (args: any) => Promise<string>` đang hứa gì với người gọi? Hứa đó có **đúng**
không nếu nó ném ENOENT? Nếu chữ ký nói dối — ai trả giá, và trả lúc nào?

Phóng xa hơn `main.ts`:

- Tuần tới có `bash`. Tool đó "lỗi" nghĩa là gì — exit code 1 là lỗi, hay kết quả bình thường?
- Sau này có ai gọi `execute` ngoài cái loop này? (test? chạy song song? retry?)
- Nếu `execute` không bao giờ throw, người **viết tool mới** phải nhớ gì? Nếu được throw, phải nhớ gì?

Câu cuối là chìa khoá: **một quy tắc mà người viết tool phải nhớ là một quy tắc sẽ bị quên.**
Cái nào cần ít trí nhớ hơn?

>>> ĐÁP ÁN CÂU 3:
>>>

## Phần JS đã học được (chưa xác nhận bằng tay)

`throw` nhận **bất kỳ giá trị nào**. `throw "boom"` hợp lệ, không ai chặn. Mất ba thứ:

- **`.stack`** — không biết lỗi phát ra từ dòng nào. Với loop 2 tầng gọi API, đây là thứ cần nhất lúc 11h đêm.
- **`err instanceof Error`** → `false`. Mọi code phân loại lỗi viết sau đều vô dụng với nó.
- **`err.message`** → `undefined`.

`error + ""` ở dòng 109 chạy đúng **do tình cờ** (`err` đang là string). Ba trường hợp:

| ném cái gì | `error + ""` ra gì |
|---|---|
| string | chính nó ✓ |
| `Error` | `"Error: msg"` — mất stack, còn đọc được |
| object thường | `"[object Object]"` — mất sạch |

Tool `execute` gọi `readFile` → Node ném `Error` có `.code = "ENOENT"`.
**Cái `.code` đó đi đâu sau `error + ""`?** Và model đọc `"ENOENT"` vs đọc
`"file không tồn tại: ./foo.ts"` — cái nào giúp nó sửa được ở lượt sau?

### Phần harness

Dòng 37 `throw` cái `response.text()` → **bỏ mất `response.status`.** Trong khi:

- **401** → key sai, retry 1000 lần cũng thế. Phải dừng và nói cho người dùng.
- **429** → chờ rồi retry, có `Retry-After` trong header.
- **400** → thường là **history của tôi hỏng** (thiếu `tool` message ghép với một `tool_call_id`). Retry vô nghĩa vì mảng `messages` đã hỏng vĩnh viễn.

→ **Từ một string body, code tầng trên làm sao biết nên retry hay dừng?**

Nối vào cái tôi đã ghi trong `process.md`: *"lỗi tool phải trả về cho model, không throw."*
Câu đó chỉ đúng với **một loại lỗi**. Có hai loại, code đang xử lý đúng hướng nhưng chưa gọi tên:

- **Lỗi tool** (file not found, args sai): model gây ra, model sửa được → phải thành `role: "tool"` message. Inner catch làm đúng.
- **Lỗi transport** (401, network chết): model không gây ra, không sửa được → **không được** vào history. Outer catch break ra — đúng hướng.

**Ranh giới đó là lý do có hai `try` lồng nhau. Không phải ngẫu nhiên.**

## Sáu probe JS — dự đoán TRƯỚC, rồi chạy

```
node -e 'try { throw "x" } catch (e) { console.log(typeof e, e.stack) }'
node -e 'console.log({} + "", [1,2] + "", null + "")'
node -e 'try { require("fs").readFileSync("nope") } catch (e) { console.log(Object.keys(e), e.code, e instanceof Error) }'
```

>>> Dự đoán 1:        | Thực tế:
>>> Dự đoán 2:        | Thực tế:
>>> Dự đoán 3:        | Thực tế:

Ba cái nữa **tự nghĩ ra đề**, từ ba câu hỏi này:

4. `catch (e)` có cách nào biết thứ nó bắt là do `throw` của mình hay do hàm sâu bên dưới?
5. Một `Error` có `.message` và `.stack` — còn gì nữa? `Object.keys` trên nó ra gì, và **tại sao** kết quả lại đáng ngạc nhiên? *(câu này sẽ làm tôi ngạc nhiên — dấu hiệu tốt)*
6. `JSON.stringify` một `Error` ra cái gì? *(sẽ cắn tôi khi log)*

>>> Probe 4 tự viết:
>>> Probe 5 tự viết:
>>> Probe 6 tự viết:

## Việc sáng mai, theo thứ tự

1. Ba probe JS — **dự đoán trước**, điền vào bảng trên.
2. Tự viết probe 4–6.
3. Câu 1 (cơ học) — trace bằng tay, viết ra giấy. Làm xong câu này thì câu 2 dễ hơn nhiều.
4. Viết dự đoán về dsh → mới mở source → câu 2.
5. Câu 3.
6. Sửa bug theo thứ tự nào là quyết định của tôi sau khi trả lời xong 3 câu, không phải trước.

Chủ đề kế tiếp sau đây: control flow của loop (bug #2, #3) → truncation → gate coupling (#1) → path guard (#5).
