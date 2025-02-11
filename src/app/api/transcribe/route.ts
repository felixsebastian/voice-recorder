import { SpeechClient } from "@google-cloud/speech";
import { NextRequest, NextResponse } from "next/server";

const credentials = JSON.parse(process.env.GOOGLE_SPEECH_TO_TEXT_KEY_JSON!);
const client = new SpeechClient({ credentials });

export const POST = async (req: NextRequest) => {
    try {
        const { audioContent } = await req.json();

        if (!audioContent) {
            return NextResponse.json({ error: "No audio provided" }, { status: 400 });
        }

        const [response] = await client.recognize({
            config: { languageCode: "en-AU" },
            audio: { content: audioContent },
        });

        const transcript = response.results!
            .map(result => result.alternatives?.[0]?.transcript || "")
            .join(" ");

        return NextResponse.json({ transcript }, { status: 200 });
    } catch (error) {
        console.error("Error transcribing:", error);
        return NextResponse.json({ error: "Failed to process audio" }, { status: 500 });
    }
}
