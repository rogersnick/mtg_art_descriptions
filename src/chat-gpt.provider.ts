import OpenAI from "openai";

class ChatGPTProvider {
    private openai: OpenAI
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    // eg: getImageDescription("https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg")
    // returns: 
    // 
    public async getImageDescription(imageUrl: string): Promise<string> {
        const response: OpenAI.Chat.Completions.ChatCompletion = await this.openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            max_tokens: 384,
            messages: [
              {
                role: "user",
                content: [
                   
                  { type: "text", text: "Generate a detailed description of the scene in this image." },
                  {
                    type: "image_url",
                    image_url: {
                      "url": imageUrl,
                    },
                  },
                ],
              },
            ],
          });

          if (!response.choices[0]?.message.content) {
            throw new Error('No Description Available!')
          }

          return response.choices[0].message.content;
    }
}

export { ChatGPTProvider }