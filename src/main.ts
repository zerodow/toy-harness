import { createInterface } from "node:readline/promises";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callModel(inputMessages: Message[]): Promise<Message> {
  const body = JSON.stringify({
    model: "deepseek-v4-flash",
    messages: inputMessages,
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

    return data.choices[0].message;
  } else {
    const err = await response.text();
    throw err;
  }
}

async function main() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const messages: Message[] = [
    { role: "system", content: "You are a helpful assistant" },
  ];

  while(true){
    const input = await rl.question("> ")
    if(input === "exit"){
      break
    }
    messages.push({
      role:"user",
      content: input
    })

    try {
      const reply = await callModel(messages)

      messages.push(reply)
      console.log('reply',reply.content)
    } catch (error) {
      console.log(error)
      break
    }

  }

  rl.close()
}

main();
