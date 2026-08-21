import { createInterface } from "node:readline/promises";
import { toolRegistry } from "./tools.js";
interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
}

async function callModel(inputMessages: Message[]): Promise<{
  finish_reason: string;
  message: Message;
}> {
  const body = JSON.stringify({
    model: "deepseek-v4-flash",
    messages: inputMessages,
    tools: Object.values(toolRegistry).map((t) => t.schema),
    stream: false,
    reasoning_effort: "none",
  });

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    method: "POST",
    body,
  });

  if (response.status === 200) {
    const data = await response.json();

    return data.choices[0];
  } else {
    const err = await response.text();
    throw err;
  }
}

async function main() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const messages: Message[] = [
    { role: "system", content: "You are a helpful assistant" },
  ];

  while (true) {
    const input = await rl.question("> ");
    if (input === "exit") {
      break;
    }
    messages.push({
      role: "user",
      content: input,
    });

    while (true) {
      try {
        const choices = await callModel(messages);
        // console.log(JSON.stringify(choices));
        console.log(choices.message.content);

        if (choices.finish_reason === "tool_calls") {
          messages.push(choices.message);
          if (
            choices.message.tool_calls &&
            choices.message.tool_calls?.length > 0
          ) {
            for (const itemTools of choices.message.tool_calls) {
              try {
                const args = JSON.parse(itemTools.function.arguments);

                if (!toolRegistry[itemTools.function.name]) {
                  throw new Error(`Unknown tool: ${itemTools.function.name}`);
                }

                const toolUse = toolRegistry[itemTools.function.name];

                if (toolUse.needsApproval) {
                  console.log(
                    `Cho phép sử dụng tool ${itemTools.function.name} để thao tác với file ${args.path}\n Nội dung chỉnh sửa : ${args.content.slice(0, 20)}?`,
                  );
                  const userApprove = await rl.question("Cho phép ? (y/n)");
                  if (userApprove !== "y") {
                    messages.push({
                      role: "tool",
                      tool_call_id: itemTools?.id,
                      content: "User denied this action",
                    });
                    continue;
                  }
                }

                const contentFile = await toolUse.execute(args);

                messages.push({
                  role: "tool",
                  tool_call_id: itemTools?.id,
                  content: contentFile,
                });
              } catch (error) {
                messages.push({
                  role: "tool",
                  tool_call_id: itemTools?.id,
                  content: error + "",
                });
              }
            }
            continue;
          }
        } else if (choices.finish_reason === "stop") {
          messages.push(choices.message);
          break;
        } else {
          console.log("else", choices);
          break;
        }
      } catch (error) {
        console.log(error);
        break;
      }
    }
  }

  rl.close();
}

main();
